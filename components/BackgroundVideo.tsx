"use client";

import { useState, useEffect } from "react";

import { getBackgroundVideo } from "@/lib/dataService";
import { BackgroundVideo as BackgroundVideoType } from "@/types";

export default function BackgroundVideo() {
  const [video, setVideo] = useState<BackgroundVideoType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const activeVideo = await getBackgroundVideo();

        setVideo(activeVideo);
      } catch (error) {
        console.error("Error loading background video:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, []);

  // Show fallback while loading or if no video
  if (loading || !video) {
    return (
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full blur-sm brightness-50 md:brightness-25"
          poster="/images/video-placeholder.png"
          preload="auto"
        >
          <source src="/videos/hibachi.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full blur-sm brightness-50 md:brightness-25"
        poster={video.thumbnail_url || "/images/video-placeholder.png"}
        preload="auto"
      >
        <source src={video.file_url} type="video/mp4" />
      </video>
    </div>
  );
}
