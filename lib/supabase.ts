import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
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

// API functions for tracks
export const trackApi = {
  // Get all active tracks
  async getAll(): Promise<Track[]> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  // Get all tracks (for admin use)
  async getAllForAdmin(): Promise<Track[]> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  // Get track by ID
  async getById(id: string): Promise<Track | null> {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  // Create new track
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

  // Update track
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

  // Delete track
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tracks").delete().eq("id", id);

    if (error) throw error;
  },

  // Toggle active status
  async toggleActive(id: string): Promise<Track> {
    const track = await this.getById(id);

    if (!track) throw new Error("Track not found");

    return this.update(id, { is_active: !track.is_active });
  },
};

// API functions for background videos
export const videoApi = {
  // Get all videos (for admin)
  async getAll(): Promise<BackgroundVideo[]> {
    const { data, error } = await supabase
      .from("background_videos")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  // Get all active videos
  async getAllActive(): Promise<BackgroundVideo[]> {
    const { data, error } = await supabase
      .from("background_videos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  // Get currently active video
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

  // Create new video
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

  // Update video
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

  // Delete video
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("background_videos")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Set as active (deactivate others)
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

// File upload functions
export const fileApi = {
  // Upload audio file
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

  // Upload video file
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

  // Upload image file
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

  // Delete file
  async deleteFile(bucket: string, fileName: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) throw error;
  },
};
