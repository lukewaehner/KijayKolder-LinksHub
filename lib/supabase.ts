import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Shared Supabase client used across both server and client modules.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Canonical track representation as stored in Supabase.
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
  track_number?: number;
  disc_number?: number;
  duration?: number;
  file_url: string;
  file_size?: number;
  cover_image_url?: string;
  waveform_data?: any;
  metadata?: any;
  is_active: boolean;
  is_single: boolean; // Flag to mark if this is a single
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Canonical background video representation as stored in Supabase.
 */
export interface BackgroundVideo {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_size?: number;
  thumbnail_url?: string;
  duration?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Data access helpers for the `tracks` table.
 */
export const trackApi = {
  /** Fetches all active tracks ordered by their sort position. */
  async getAll(): Promise<Track[]> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  /** Fetches all tracks regardless of activation state. */
  async getAllForAdmin(): Promise<Track[]> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  /** Loads a single track by its identifier. */
  async getById(id: string): Promise<Track | null> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  /** Inserts a new track row and returns the stored record. */
  async create(
    track: Omit<Track, "id" | "created_at" | "updated_at">,
  ): Promise<Track> {
    const { data, error } = await supabase
      .from("tracks")
      .insert(track)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /** Applies partial updates to an existing track. */
  async update(id: string, updates: Partial<Track>): Promise<Track> {
    const { data, error } = await supabase
      .from("tracks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /** Permanently removes a track from Supabase. */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tracks").delete().eq("id", id);

    if (error) throw error;
  },

  /** Toggles a track's activation flag while leaving other fields untouched. */
  async toggleActive(id: string): Promise<Track> {
    const track = await this.getById(id);

    if (!track) throw new Error("Track not found");

    return this.update(id, { is_active: !track.is_active });
  },
};

/**
 * Data access helpers for the `background_videos` table.
 */
export const videoApi = {
  /** Fetches every background video, including inactive entries. */
  async getAll(): Promise<BackgroundVideo[]> {
    const { data, error } = await supabase
      .from("background_videos")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  /** Returns only active background videos sorted by display order. */
  async getAllActive(): Promise<BackgroundVideo[]> {
    const { data, error } = await supabase
      .from("background_videos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  /** Retrieves the single active background video, if present. */
  async getActive(): Promise<BackgroundVideo | null> {
    const { data, error } = await supabase
      .from("background_videos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned

    return data;
  },

  /** Inserts a new background video definition. */
  async create(
    video: Omit<BackgroundVideo, "id" | "created_at" | "updated_at">,
  ): Promise<BackgroundVideo> {
    const { data, error } = await supabase
      .from("background_videos")
      .insert(video)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /** Applies partial updates to an existing background video. */
  async update(
    id: string,
    updates: Partial<BackgroundVideo>,
  ): Promise<BackgroundVideo> {
    const { data, error } = await supabase
      .from("background_videos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /** Permanently removes a video from Supabase storage. */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("background_videos")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Marks a video as active while ensuring all other entries are deactivated.
   */
  async setActive(id: string): Promise<void> {
    // First deactivate all videos
    await supabase
      .from("background_videos")
      .update({ is_active: false })
      .neq("id", "never-matches"); // Update all rows

    // Then activate the selected one
    await supabase
      .from("background_videos")
      .update({ is_active: true })
      .eq("id", id);
  },
};

/**
 * Storage helper utilities for uploading and removing media assets.
 */
export const fileApi = {
  /** Uploads an audio file and returns the public URL. */
  async uploadAudio(file: File, fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("audio")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("audio").getPublicUrl(fileName);

    return publicUrl;
  },

  /** Uploads a video file and returns the public URL. */
  async uploadVideo(file: File, fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(fileName);

    return publicUrl;
  },

  /** Uploads an image file and returns the public URL. */
  async uploadImage(file: File, fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    return publicUrl;
  },

  /** Deletes a file from the specified storage bucket. */
  async deleteFile(bucket: string, fileName: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) throw error;
  },
};
