// lib/dataService.ts

import { trackApi, videoApi, Track as DBTrack } from "@/lib/supabase";
import { BackgroundVideo } from "@/types";
import { createFallbackVideo } from "@/config/fallback-video";

/**
 * Describes an audio track as exposed to the frontend, combining metadata and
 * playback-specific details.
 */
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

/**
 * Represents a user-facing link to a music or contact destination.
 */
export interface Link {
  id: string;
  href: string;
  text: string;
  platform: string;
  order: number;
}

/**
 * Lightweight track listing loaded from static JSON assets.
 */
export interface SimplifiedTracksData {
  tracks: string[]; // Array of filenames
}

/**
 * Data structure used when loading link information from JSON assets.
 */
export interface LinksData {
  musicLinks: Link[];
  contactLinks: Link[];
}

/**
 * Converts a media filename into a human-readable title by removing the
 * extension and applying several formatting heuristics.
 */
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

/**
 * Normalizes a Supabase track row to the Track shape used by the UI.
 */
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

/**
 * Loads audio tracks from Supabase and falls back to demo content when the
 * table is empty or unavailable.
 */
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

/**
 * Provides a curated list of fallback tracks when Supabase has no entries.
 */
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

/**
 * Retrieves the currently active background video, falling back to demo media
 * if none are configured.
 */
export const getBackgroundVideo = async (): Promise<BackgroundVideo | null> => {
  try {
    const activeVideo = await videoApi.getActive();

    if (activeVideo) {
      return activeVideo;
    }

    // If no active video, get all videos and use the first one
    const allVideos = await videoApi.getAll();

    if (allVideos && allVideos.length > 0) {
      return allVideos[0];
    }

    // Database is empty, return fallback video
    console.log("No videos in database, using fallback video");

    return getFallbackVideo();
  } catch (error) {
    console.error("Error loading background video from database:", error);

    // Database error - return null instead of fallback
    return null;
  }
};

/**
 * Fetches every background video, using a fallback asset when the database is
 * empty.
 */
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

/**
 * Generates a fallback background video definition sourced from configuration.
 */
const getFallbackVideo = (): BackgroundVideo => {
  return createFallbackVideo();
};

/**
 * Loads music links from the static JSON manifest sorted by their configured
 * order.
 */
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

/**
 * Loads contact links from the static JSON manifest sorted by their configured
 * order.
 */
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
