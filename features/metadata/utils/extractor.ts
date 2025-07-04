import { parseBlob } from "music-metadata";

export interface ExtractedMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  track_number?: number;
  disc_number?: number;
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  format?: string;
  coverArt?: {
    data: Uint8Array;
    format: string;
  };
}

export interface MetadataAnalysis {
  extracted: ExtractedMetadata;
  missing: string[];
  present: string[];
  completeness: number; // percentage
}

const EXPECTED_FIELDS = [
  "title",
  "artist",
  "album",
  "year",
  "genre",
  "track_number",
];

export async function extractMetadata(file: File): Promise<ExtractedMetadata> {
  try {
    const metadata = await parseBlob(file);

    const extracted: ExtractedMetadata = {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      year: metadata.common.year,
      genre: metadata.common.genre?.[0], // Take first genre if multiple
      track_number: metadata.common.track?.no || undefined,
      disc_number: metadata.common.disk?.no || undefined,
      duration: Math.round(metadata.format.duration || 0),
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels,
      format: metadata.format.container,
    };

    // Extract cover art if available
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];

      extracted.coverArt = {
        data: picture.data,
        format: picture.format,
      };
    }

    return extracted;
  } catch (error) {
    console.error("Metadata extraction failed:", error);

    return {};
  }
}

export function analyzeMetadata(
  extracted: ExtractedMetadata,
): MetadataAnalysis {
  const present: string[] = [];
  const missing: string[] = [];

  EXPECTED_FIELDS.forEach((field) => {
    const value = extracted[field as keyof ExtractedMetadata];

    if (value !== undefined && value !== null && value !== "") {
      present.push(field);
    } else {
      missing.push(field);
    }
  });

  const completeness = Math.round(
    (present.length / EXPECTED_FIELDS.length) * 100,
  );

  return {
    extracted,
    missing,
    present,
    completeness,
  };
}

export function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    title: "Title",
    artist: "Artist",
    album: "Album",
    year: "Year",
    genre: "Genre",
    track_number: "Track Number",
    disc_number: "Disc Number",
    duration: "Duration",
    bitrate: "Bitrate",
    sampleRate: "Sample Rate",
    channels: "Channels",
    format: "Format",
  };

  return displayNames[field] || field;
}
