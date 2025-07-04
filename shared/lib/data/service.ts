// lib/dataService.ts

import {
  trackApi,
  videoApi,
  Track as DBTrack,
} from "@/shared/lib/supabase/client";
import { BackgroundVideo } from "@/shared/types";
import { createFallbackVideo } from "@/config/fallback-video";

// Define types for our data (keeping for compatibility)
export interface Track {
  id: string;
  title: string;
  path: string;
  artwork: string;
  year: string;
  order: number;
  artist?: string;
  album?: string;
  duration?: number;
  is_single?: boolean;
}

export interface Link {
  id: string;
  href: string;
  text: string;
  platform: string;
  order: number;
}

export interface SimplifiedTracksData {
  tracks: string[]; // Array of filenames
}

export interface LinksData {
  musicLinks: Link[];
  contactLinks: Link[];
}

// Helper function to format filename as title
const formatTitle = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  // Replace underscores with spaces
  let formatted = nameWithoutExt.replace(/_/g, " ");

  // Add spaces before capitals (e.g., WAYTooLong -> WAY Too Long)
  formatted = formatted.replace(/([A-Z])([A-Z])([a-z])/g, "$1 $2$3");

  // Replace & with "and" if needed
  formatted = formatted.replace(/&/g, " & ");

  // Remove duplicate spaces
  formatted = formatted.replace(/\s+/g, " ").trim();

  return formatted;
};

// Convert database track to frontend track format
const convertDBTrackToTrack = (dbTrack: DBTrack): Track => {
  return {
    id: dbTrack.id,
    title: dbTrack.title,
    path: dbTrack.file_url,
    artwork: dbTrack.cover_image_url || "",
    year: dbTrack.year?.toString() || new Date().getFullYear().toString(),
    order: dbTrack.sort_order,
    artist: dbTrack.artist,
    album: dbTrack.album || "",
    duration: dbTrack.duration,
    is_single: dbTrack.is_single,
  };
};

// Fetch tracks data from database
export const getTracks = async (): Promise<Track[]> => {
  try {
    const dbTracks = await trackApi.getAll();

    // If database has tracks, use them
    if (dbTracks && dbTracks.length > 0) {
      // Convert database tracks to frontend format
      const tracks = dbTracks.map(convertDBTrackToTrack);

      // Return tracks sorted by sort_order
      return tracks.sort((a, b) => a.order - b.order);
    }

    // Database is empty, return fallback tracks
    console.log("Database is empty, using fallback tracks");

    return getFallbackTracks();
  } catch (error) {
    console.error("Error loading tracks from database:", error);

    // Database error - return empty array instead of fallbacks
    return [];
  }
};

// Fallback tracks for when database is empty
const getFallbackTracks = (): Track[] => {
  return [
    {
      id: "demo-track",
      title: "WAY TOO LONG",
      path: "/audio/WAYTOOLONG.m4a",
      artwork: "/images/demo-cover.jpg",
      year: "2024",
      order: 1,
      artist: "KijayKolder",
      album: "",
      duration: 180,
      is_single: true,
    },
  ];
};

// Get active background video from database
export const getBackgroundVideo = async (): Promise<BackgroundVideo | null> => {
  try {
    console.log("🔍 Fetching active background video from database...");
    const activeVideo = await videoApi.getActive();

    console.log("🎯 Active video result:", activeVideo);

    if (activeVideo) {
      console.log(
        "✅ Found active video:",
        activeVideo.title,
        "ID:",
        activeVideo.id,
      );

      return activeVideo;
    }

    // If no active video, get all videos and use the first one
    console.log("⚠️ No active video found, fetching all videos...");
    const allVideos = await videoApi.getAll();

    console.log("📋 All videos:", allVideos?.length || 0, "found");

    if (allVideos && allVideos.length > 0) {
      console.log("🎬 Using first video as fallback:", allVideos[0].title);

      return allVideos[0];
    }

    // Database is empty, return fallback video
    console.log("📦 No videos in database, using fallback video");

    return getFallbackVideo();
  } catch (error) {
    console.error("❌ Error loading background video from database:", error);

    // Database error - return null instead of fallback
    return null;
  }
};

// Get all background videos
export const getBackgroundVideos = async (): Promise<BackgroundVideo[]> => {
  try {
    const videos = await videoApi.getAll();

    // If database has videos, return them
    if (videos && videos.length > 0) {
      return videos;
    }

    // Database is empty, return fallback video
    console.log("No videos in database, using fallback video");

    return [getFallbackVideo()];
  } catch (error) {
    console.error("Error loading background videos from database:", error);

    // Database error - return empty array instead of fallback
    return [];
  }
};

// Fallback video for when database is empty
const getFallbackVideo = (): BackgroundVideo => {
  return createFallbackVideo();
};

// Fetch music links
export const getMusicLinks = async (): Promise<Link[]> => {
  try {
    const response = await fetch("/data/links.json");

    if (!response.ok) {
      throw new Error("Failed to fetch links data");
    }
    const data: LinksData = await response.json();

    return data.musicLinks.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error loading music links:", error);

    return [];
  }
};

// Fetch contact links
export const getContactLinks = async (): Promise<Link[]> => {
  try {
    const response = await fetch("/data/links.json");

    if (!response.ok) {
      throw new Error("Failed to fetch links data");
    }
    const data: LinksData = await response.json();

    return data.contactLinks.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error loading contact links:", error);

    return [];
  }
};
