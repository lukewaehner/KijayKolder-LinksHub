"use client";

import { useState, useEffect } from "react";

import { supabase } from "@/shared/lib/supabase/client";
import { getBackgroundVideo } from "@/shared/lib/data/service";
import { BackgroundVideo as BackgroundVideoType } from "@/shared/types";

export default function BackgroundVideo() {
  const [video, setVideo] = useState<BackgroundVideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🎥 Loading background video...");

        const activeVideo = await getBackgroundVideo();

        console.log("🎥 Background video loaded:", activeVideo);

        setVideo(activeVideo);
      } catch (error) {
        console.error("❌ Error loading background video:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load video"
        );
      } finally {
        setLoading(false);
      }
    };

    console.log("🚀 BackgroundVideo component mounted, starting load...");
    loadVideo();

    // Subscribe to real-time changes to background_videos table
    let subscription;

    try {
      subscription = supabase
        .channel("background-video-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "background_videos",
          },
          (payload) => {
            console.log("🔄 Background video change detected:", payload);
            console.log(
              "🔄 Event type:",
              payload.eventType,
              "Record:",
              payload.new || payload.old
            );
            // Add small delay to ensure database consistency
            setTimeout(() => {
              console.log("🔄 Reloading video after change...");
              loadVideo();
            }, 100);
          }
        )
        .subscribe((status) => {
          console.log("📡 Subscription status:", status);
          if (status === "CHANNEL_ERROR") {
            console.warn(
              "⚠️ Real-time subscription failed - video updates will require page refresh"
            );
          } else if (status === "SUBSCRIBED") {
            console.log(
              "✅ Real-time subscription active - video changes will update automatically"
            );
          }
        });
    } catch (error) {
      console.warn("⚠️ Could not establish real-time subscription:", error);
      subscription = null;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show fallback while loading or if no video
  if (loading || !video) {
    if (loading) {
      console.log("🔄 Loading video from database...");
    } else {
      console.log("🎬 No video found, showing fallback");
    }

    return (
      <div className="absolute inset-0 -z-10">
        {/* Solid color background while loading instead of broken video */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none" />
        {error && (
          <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded text-sm z-50 pointer-events-auto">
            Video Error: {error}
          </div>
        )}
        {loading && !error && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded text-sm text-xs opacity-75 z-50 pointer-events-auto">
            Loading video...
          </div>
        )}
      </div>
    );
  }

  console.log(
    "🎯 Rendering active video:",
    video.title,
    "URL:",
    video.file_url
  );

  return (
    <div className="absolute inset-0 -z-10">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full blur-sm brightness-50 md:brightness-25 pointer-events-none"
        poster={video.thumbnail_url || "/images/video-placeholder.png"}
        preload="auto"
        onCanPlay={() => console.log("✅ Video can play:", video.file_url)}
        onCanPlayThrough={() =>
          console.log("✅ Video fully loaded:", video.file_url)
        }
        onError={(e) => {
          console.error("🚫 Video playback error:", e);
          console.error("🚫 Video element:", e.currentTarget);
          setError(`Video playback failed: ${video.title}`);
        }}
        onLoadStart={() =>
          console.log("📥 Video loading started:", video.file_url)
        }
        onLoadedData={() =>
          console.log("📊 Video data loaded:", video.file_url)
        }
        onLoadedMetadata={() =>
          console.log("📋 Video metadata loaded:", video.file_url)
        }
        onPlaying={() =>
          console.log("▶️ Video started playing:", video.file_url)
        }
        onWaiting={() =>
          console.log("⏳ Video waiting/buffering:", video.file_url)
        }
      >
        <source src={video.file_url} type="video/mp4" />
        <source src={video.file_url} type="video/quicktime" />
        <source src={video.file_url} type="video/mov" />
      </video>
      {/* Fallback gradient if video fails to load */}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none" />
      )}
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded text-sm max-w-xs z-50 pointer-events-auto">
          Video Error: {error}
        </div>
      )}
      <div className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded text-xs opacity-75 z-50 pointer-events-none">
        Playing: {video.title}
      </div>
    </div>
  );
}
