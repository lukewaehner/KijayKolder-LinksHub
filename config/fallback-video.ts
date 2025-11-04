import { BackgroundVideo } from "../types";

/**
 * Centralized metadata describing the default background video shipped with the
 * application.
 */
export const FALLBACK_VIDEO_CONFIG = {
  file_url: "/videos/louder.mov",
  title: "Louder Background",
  description: "Default background video",
  file_size: 25000000,
  thumbnail_url: "/images/video-placeholder.png",
  duration: 60,
} as const;

/**
 * Builds a complete {@link BackgroundVideo} object using the fallback
 * configuration. This is primarily used when Supabase has no user-provided
 * entries.
 */
export const createFallbackVideo = (): BackgroundVideo => {
  return {
    id: "demo-video",
    title: FALLBACK_VIDEO_CONFIG.title,
    description: FALLBACK_VIDEO_CONFIG.description,
    file_url: FALLBACK_VIDEO_CONFIG.file_url,
    file_size: FALLBACK_VIDEO_CONFIG.file_size,
    thumbnail_url: FALLBACK_VIDEO_CONFIG.thumbnail_url,
    duration: FALLBACK_VIDEO_CONFIG.duration,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
