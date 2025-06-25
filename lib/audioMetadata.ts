import { parseBuffer } from "music-metadata-browser";

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  format?: string;
  year?: number;
  genre?: string[];
  coverArt?: {
    data: Uint8Array;
    format: string;
  };
}

/**
 * Extracts metadata from an audio file
 * @param file - Audio file (File object or blob URL)
 * @returns A promise that resolves to the metadata
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  try {
    const buffer = await file.arrayBuffer();
    const metadata = await parseBuffer(new Uint8Array(buffer), file.type);

    // Extract cover art if available
    let coverArt;

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];

      coverArt = {
        data: picture.data,
        format: picture.format,
      };
    }

    return {
      title: metadata.common.title,
      artist: metadata.common.artist || metadata.common.artists?.[0],
      album: metadata.common.album,
      duration: metadata.format.duration
        ? Math.round(metadata.format.duration)
        : undefined,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels,
      format: metadata.format.container,
      year: metadata.common.year,
      genre: metadata.common.genre,
      coverArt,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);

    // Fallback: extract basic info from file
    return {
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      format: file.type,
    };
  }
}

/**
 * Extracts metadata from a remote audio URL
 * @param url - The URL of the audio file
 * @returns A promise that resolves to the metadata
 */
export async function extractMetadataFromURL(
  url: string
): Promise<AudioMetadata> {
  console.log("Metadata extraction from URL disabled - jsmediatags removed");

  return {
    title: undefined,
    artist: undefined,
    album: undefined,
    year: undefined,
    genre: undefined,
    comment: undefined,
    trackNumber: undefined,
    coverArt: undefined,
  };
}

/**
 * Clean up a blob URL to prevent memory leaks
 * @param url - The blob URL to revoke
 */
export function revokeCoverArtURL(url: string) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export async function createCoverArtBlob(coverArt: {
  data: Uint8Array;
  format: string;
}): Promise<Blob> {
  return new Blob([coverArt.data], { type: coverArt.format });
}

export function generateFileName(file: File, prefix: string = ""): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop() || "";
  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");

  return `${prefix}${baseName}_${timestamp}_${randomSuffix}.${extension}`;
}
