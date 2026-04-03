"use client";

import { useState, useEffect } from "react";

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

        const activeVideo = await getBackgroundVideo();

        setVideo(activeVideo);
      } catch (error) {
        console.error("Error loading background video:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load video"
        );
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, []);

  if (loading || !video) {
    return (
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none" />
        {error && (
          <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded text-sm z-50 pointer-events-auto">
            Video Error: {error}
          </div>
        )}
      </div>
    );
  }

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
        onError={() => setError(`Video playback failed: ${video.title}`)}
      >
        <source src={video.file_url} type="video/mp4" />
        <source src={video.file_url} type="video/quicktime" />
        <source src={video.file_url} type="video/mov" />
      </video>
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none" />
      )}
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded text-sm max-w-xs z-50 pointer-events-auto">
          Video Error: {error}
        </div>
      )}
    </div>
  );
}
