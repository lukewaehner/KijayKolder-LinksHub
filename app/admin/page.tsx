"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Track, BackgroundVideo } from "@/types";
import { trackApi } from "@/lib/api/tracks";
import { videoApi } from "@/lib/api/videos";
import { fileApi } from "@/lib/api/files";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { extractMetadata, analyzeMetadata } from "@/lib/metadataExtractor";

// Admin password - in production, this should be in environment variables
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

interface UploadProgress {
  [key: string]: number;
}

interface EditFormData {
  title: string;
  artist: string;
  album: string;
  year?: string;
  genre?: string;
  track_number?: string;
  disc_number?: string;
  is_single: boolean;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [videos, setVideos] = useState<BackgroundVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [dragActive, setDragActive] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    artist: "",
    album: "",
    year: "",
    genre: "",
    track_number: "",
    disc_number: "",
    is_single: false,
  });
  const [metadataInfo, setMetadataInfo] = useState<{
    track: Track;
    metadata: any;
    analysis: any;
  } | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  // Check for saved authentication on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("admin_authenticated");

    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to realtime updates
    const subscription = supabase
      .channel("admin-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracks",
        },
        (payload) => {
          console.log("Track change detected:", payload);
          loadData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "background_videos",
        },
        (payload) => {
          console.log("Video change detected:", payload);
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      setPasswordError("");
      setPassword("");
    } else {
      setPasswordError("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [trackData, videoData] = await Promise.all([
        trackApi.getAllForAdmin(),
        videoApi.getAll(),
      ]);

      setTracks(trackData);
      setVideos(videoData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    if (audioFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});

    try {
      for (const file of audioFiles) {
        await uploadAudioFile(file);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const uploadAudioFile = async (file: File) => {
    const fileId = `${Date.now()}_${file.name}`;

    // Update progress
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    try {
      // Upload file to Supabase storage
      const fileUrl = await fileApi.uploadAudio(file, fileId);

      setUploadProgress((prev) => ({ ...prev, [fileId]: 50 }));

      // Create track record
      const newTrack = await trackApi.create({
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "",
        duration: 0,
        file_url: fileUrl,
        file_size: file.size,
        cover_image_url: "",
        waveform_data: null,
        metadata: {
          filename: file.name,
          size: file.size,
          type: file.type,
        },
        is_active: true,
        is_single: true, // Default to single since no album provided
        sort_order: tracks.length,
      });

      setUploadProgress((prev) => ({ ...prev, [fileId]: 75 }));

      // Extract metadata using client-side library
      try {
        await extractMetadataFromFile(newTrack.id, file);
        console.log("Metadata extraction completed for:", file.name);
      } catch (error) {
        console.error("Metadata extraction failed for:", file.name, error);
      }

      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

      // Reload tracks
      loadData();
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      setUploadProgress((prev) => ({ ...prev, [fileId]: -1 })); // Error state
    }
  };

  const extractMetadataFromFile = async (trackId: string, file: File) => {
    try {
      console.log("Starting metadata extraction for:", file.name);
      const metadata = await extractMetadata(file);

      console.log("Extracted metadata:", metadata);

      const albumName = metadata.album || "";
      const isSingle = !albumName || albumName.trim() === "";
      const duration = Math.round(metadata.duration || 0);

      console.log(
        "Extracted duration:",
        metadata.duration,
        "-> rounded:",
        duration
      );

      const updates: Partial<Track> = {
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata.artist || "Unknown Artist",
        album: albumName,
        duration: duration,
        year: metadata.year,
        genre: metadata.genre,
        track_number: metadata.track_number,
        disc_number: metadata.disc_number,
        is_single: isSingle,
        metadata: metadata,
      };

      console.log("Updates to apply:", updates);

      // Handle cover art if present
      if (metadata.coverArt) {
        try {
          const coverFileName = `covers/${trackId}_${Date.now()}.jpg`;
          // Convert Uint8Array to Blob for File constructor
          const coverBlob = new Blob([metadata.coverArt.data], {
            type: "image/jpeg",
          });
          const coverFile = new File([coverBlob], coverFileName, {
            type: "image/jpeg",
          });

          const coverUrl = await fileApi.uploadImage(coverFile, coverFileName);

          updates.cover_image_url = coverUrl;
          console.log("Cover art uploaded successfully:", coverUrl);
        } catch (coverError) {
          console.error("Cover art upload failed:", coverError);
        }
      }

      await trackApi.update(trackId, updates);
    } catch (error) {
      console.error("Metadata extraction failed:", error);
    }
  };

  const handleAudioUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    await handleFiles(Array.from(files));

    // Reset file input
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;

        const fileUrl = await fileApi.uploadVideo(file, fileName);

        const newVideo = await videoApi.create({
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          file_url: fileUrl,
          file_size: file.size,
          thumbnail_url: "",
          duration: 0,
          is_active: false,
          sort_order: videos.length,
        });

        setVideos((prev) => [...prev, newVideo]);
      }
    } catch (error) {
      console.error("Video upload failed:", error);
    } finally {
      setUploading(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;

    try {
      await trackApi.delete(trackId);
      setTracks((prev) => prev.filter((track) => track.id !== trackId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await videoApi.delete(videoId);
      setVideos((prev) => prev.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleToggleTrackActive = async (trackId: string) => {
    try {
      await trackApi.toggleActive(trackId);
      setTracks((prev) =>
        prev.map((track) =>
          track.id === trackId
            ? { ...track, is_active: !track.is_active }
            : track
        )
      );
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const handleSetVideoActive = async (videoId: string) => {
    try {
      await videoApi.setActive(videoId);
      setVideos((prev) =>
        prev.map((video) => ({
          ...video,
          is_active: video.id === videoId,
        }))
      );
    } catch (error) {
      console.error("Set active failed:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTracks.size === 0) return;

    if (
      !confirm(`Are you sure you want to delete ${selectedTracks.size} tracks?`)
    )
      return;

    try {
      for (const trackId of Array.from(selectedTracks)) {
        await trackApi.delete(trackId);
      }
      setSelectedTracks(new Set());
      loadData();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedTracks.size === tracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(tracks.map((track) => track.id)));
    }
  };

  const handleTrackSelect = (trackId: string) => {
    const newSelected = new Set(selectedTracks);

    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0.0 MB";
    const mb = bytes / (1024 * 1024);

    return `${mb.toFixed(1)} MB`;
  };

  const handleEditTrack = (track: Track) => {
    setEditingTrack(track);
    setEditFormData({
      title: track.title,
      artist: track.artist,
      album: track.album || "",
      year: track.year?.toString() || "",
      genre: track.genre || "",
      track_number: track.track_number?.toString() || "",
      disc_number: track.disc_number?.toString() || "",
      is_single: track.is_single || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTrack) return;

    try {
      const updates = {
        title: editFormData.title,
        artist: editFormData.artist,
        album: editFormData.album,
        year: editFormData.year ? parseInt(editFormData.year) : undefined,
        genre: editFormData.genre || undefined,
        track_number: editFormData.track_number
          ? parseInt(editFormData.track_number)
          : undefined,
        disc_number: editFormData.disc_number
          ? parseInt(editFormData.disc_number)
          : undefined,
        is_single: editFormData.is_single,
      };

      await trackApi.update(editingTrack.id, updates);
      setEditingTrack(null);
      loadData();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTrack(null);
    setEditFormData({
      title: "",
      artist: "",
      album: "",
      year: "",
      genre: "",
      track_number: "",
      disc_number: "",
      is_single: false,
    });
  };

  const handleShowMetadataInfo = async (track: Track) => {
    try {
      // For demonstration, we'll analyze the track's existing metadata
      // In a real scenario, you might re-extract from the file
      const analysis = analyzeMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        year: track.year,
        genre: track.genre,
        track_number: track.track_number,
        disc_number: track.disc_number,
        duration: track.duration,
      });

      setMetadataInfo({
        track,
        metadata: track.metadata,
        analysis,
      });
    } catch (error) {
      console.error("Failed to analyze metadata:", error);
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold text-center">Admin Login</h1>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    className={passwordError ? "border-red-500" : ""}
                    id="password"
                    placeholder="Enter admin password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                <Button className="w-full" type="submit">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Upload Content</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Audio Upload */}
              <div>
                <Label className="text-sm font-medium" htmlFor="audio-upload">
                  Upload Audio Files
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Input
                    ref={audioInputRef}
                    multiple
                    accept="audio/*"
                    className="hidden"
                    disabled={uploading}
                    id="audio-upload"
                    type="file"
                    onChange={handleAudioUpload}
                  />
                  <Label
                    className="cursor-pointer block"
                    htmlFor="audio-upload"
                  >
                    <div className="space-y-2">
                      <div className="text-2xl">🎵</div>
                      <div className="text-sm">
                        Click to upload or drag and drop audio files
                      </div>
                      <div className="text-xs text-gray-500">
                        Supports MP3, MP4, FLAC, WAV, M4A and more
                      </div>
                    </div>
                  </Label>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <Label className="text-sm font-medium" htmlFor="video-upload">
                  Upload Background Videos
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    ref={videoInputRef}
                    multiple
                    accept="video/*"
                    className="hidden"
                    disabled={uploading}
                    id="video-upload"
                    type="file"
                    onChange={handleVideoUpload}
                  />
                  <Label
                    className="cursor-pointer block"
                    htmlFor="video-upload"
                  >
                    <div className="space-y-2">
                      <div className="text-2xl">🎥</div>
                      <div className="text-sm">
                        Click to upload background videos
                      </div>
                      <div className="text-xs text-gray-500">
                        MP4, WebM, MOV formats
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Upload Progress</h3>
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">
                        {fileId.split("_").slice(1).join("_")}
                      </span>
                      <span>{progress === -1 ? "Error" : `${progress}%`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress === -1 ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.max(0, progress)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Track Management */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Tracks</h2>
            <div className="flex items-center gap-2">
              {selectedTracks.size > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedTracks.size})
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                {selectedTracks.size === tracks.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading tracks...</div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tracks uploaded yet
              </div>
            ) : (
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        checked={selectedTracks.has(track.id)}
                        className="rounded"
                        type="checkbox"
                        onChange={() => handleTrackSelect(track.id)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{track.title}</h3>
                        <p className="text-sm text-gray-600">
                          {track.artist} • {track.album || "No Album"} •{" "}
                          {formatDuration(track.duration)} •{" "}
                          {formatFileSize(track.file_size)}
                        </p>
                        {(track.year || track.genre) && (
                          <p className="text-xs text-gray-500">
                            {track.year && `${track.year}`}
                            {track.year && track.genre && " • "}
                            {track.genre && track.genre}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowMetadataInfo(track)}
                      >
                        Info
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTrack(track)}
                      >
                        Edit
                      </Button>
                      <div className="flex items-center gap-2">
                        <Label
                          className="text-sm"
                          htmlFor={`track-${track.id}`}
                        >
                          Active
                        </Label>
                        <Switch
                          checked={track.is_active}
                          id={`track-${track.id}`}
                          onCheckedChange={() =>
                            handleToggleTrackActive(track.id)
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTrack(track.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Management */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Background Videos</h2>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No background videos uploaded yet
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(video.file_size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={video.is_active ? "default" : "outline"}
                        onClick={() => handleSetVideoActive(video.id)}
                      >
                        {video.is_active ? "Active" : "Set Active"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {editingTrack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Track</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-artist">Artist</Label>
                  <Input
                    id="edit-artist"
                    value={editFormData.artist}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        artist: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-album">Album</Label>
                  <Input
                    id="edit-album"
                    value={editFormData.album}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        album: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-year">Year</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-genre">Genre</Label>
                    <Input
                      id="edit-genre"
                      value={editFormData.genre}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          genre: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-track-number">Track #</Label>
                    <Input
                      id="edit-track-number"
                      type="number"
                      value={editFormData.track_number}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          track_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-disc-number">Disc #</Label>
                    <Input
                      id="edit-disc-number"
                      type="number"
                      value={editFormData.disc_number}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          disc_number: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Metadata Info Modal */}
        {metadataInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Metadata Information: {metadataInfo.track.title}
              </h3>

              <div className="space-y-6">
                {/* Metadata Analysis */}
                <div>
                  <h4 className="font-semibold mb-2">Metadata Completeness</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${metadataInfo.analysis.completeness}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {metadataInfo.analysis.completeness}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Present:</strong>
                        <ul className="text-green-600">
                          ,{" "}
                          {metadataInfo.analysis.present.map(
                            (field: string) => (
                              <li key={field}>• {field}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <strong>Missing:</strong>
                        <ul className="text-red-600">
                          ,{" "}
                          {metadataInfo.analysis.missing.map(
                            (field: string) => (
                              <li key={field}>• {field}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Metadata */}
                <div>
                  <h4 className="font-semibold mb-2">Current Metadata</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="font-medium">Title:</dt>
                      <dd>{metadataInfo.track.title}</dd>
                      <dt className="font-medium">Artist:</dt>
                      <dd>{metadataInfo.track.artist}</dd>
                      <dt className="font-medium">Album:</dt>
                      <dd>{metadataInfo.track.album || "—"}</dd>
                      <dt className="font-medium">Year:</dt>
                      <dd>{metadataInfo.track.year || "—"}</dd>
                      <dt className="font-medium">Genre:</dt>
                      <dd>{metadataInfo.track.genre || "—"}</dd>
                      <dt className="font-medium">Track #:</dt>
                      <dd>{metadataInfo.track.track_number || "—"}</dd>
                      <dt className="font-medium">Disc #:</dt>
                      <dd>{metadataInfo.track.disc_number || "—"}</dd>
                      <dt className="font-medium">Duration:</dt>
                      <dd>{formatDuration(metadataInfo.track.duration)}</dd>
                    </dl>
                  </div>
                </div>

                {/* Raw Metadata */}
                {metadataInfo.metadata && (
                  <div>
                    <h4 className="font-semibold mb-2">Raw Metadata</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(metadataInfo.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setMetadataInfo(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setMetadataInfo(null);
                    handleEditTrack(metadataInfo.track);
                  }}
                >
                  Edit Track
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
