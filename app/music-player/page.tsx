"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";

import MusicPlayerCard from "@/components/MusicPlayerCard";
import { Track, trackApi, supabase } from "@/lib/supabase";

export default function MusicPlayerDemo() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTracks();

    const subscription = supabase
      .channel("tracks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracks",
        },
        (payload) => {
          console.log("Track change detected:", payload);
          // Reload tracks when changes occur
          loadTracks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const trackData = await trackApi.getAll();

      setTracks(trackData);
    } catch (error) {
      console.error("Failed to load tracks:", error);
      setError("Failed to load tracks. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const newTracks: Track[] = [];

    Array.from(files).forEach((file, index) => {
      // Create a blob URL for the audio file
      const audioUrl = URL.createObjectURL(file);

      // Extract file name without extension for title
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // Create a new track object
      const newTrack: Track = {
        id: `user-track-${Date.now()}-${index}`,
        title: fileName, // Use filename as initial title (metadata will override if available)
        artist: "Unknown Artist",
        album: "",
        duration: 0,
        file_url: audioUrl,
        file_size: file.size,
        cover_image_url: "",
        waveform_data: null,
        metadata: {
          filename: file.name,
          size: file.size,
          type: file.type,
        },
        is_active: true,
        is_single: true,
        sort_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      newTracks.push(newTrack);
    });

    setUserTracks(newTracks);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine which tracks to display - user uploaded or Supabase tracks
  const displayTracks = userTracks.length > 0 ? userTracks : tracks;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Music Player
        </h1>

        {/* Supabase integration info */}
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold mb-2 text-green-800">
            Supabase Integration
          </h2>
          <p className="text-sm text-green-700 mb-2">
            This player now uses Supabase for data storage with real-time
            updates. Tracks are stored in the cloud with automatic metadata
            extraction.
          </p>
          <p className="text-sm text-green-700">
            Changes made in the admin panel will appear here instantly.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              className="mt-2"
              color="danger"
              size="sm"
              variant="light"
              onClick={loadTracks}
            >
              Retry
            </Button>
          </div>
        )}

        {/* File upload section */}
        <Card className="mb-8">
          <CardBody>
            <h2 className="text-lg font-semibold mb-2">
              Upload Your Own Music
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Upload audio files for temporary playback. For permanent storage,
              use the admin panel.
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                multiple
                accept="audio/*"
                className="hidden"
                id="audio-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <Button
                color="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Audio Files
              </Button>
              {userTracks.length > 0 && (
                <Button variant="light" onClick={() => setUserTracks([])}>
                  Clear Uploaded Files
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Player section */}
        {loading && userTracks.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
          </div>
        ) : displayTracks.length > 0 ? (
          <MusicPlayerCard
            tracks={displayTracks.map((track) => ({
              id: track.id,
              title: track.title,
              path: track.file_url,
              artwork: track.cover_image_url || "",
              year: track.metadata?.year || new Date().getFullYear().toString(),
              order: track.sort_order,
              artist: track.artist,
              album: track.album,
              duration: track.duration,
            }))}
            onTrackChange={(index) => {
              console.log(`Changed to track: ${displayTracks[index].title}`);
            }}
          />
        ) : (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p>
              No tracks available. Please upload audio files or check the admin
              panel.
            </p>
            <Button
              className="mt-4"
              color="primary"
              variant="light"
              onClick={() => window.open("/admin", "_blank")}
            >
              Go to Admin Panel
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-gray-500">
          <p className="mb-2">Features:</p>
          <ul className="text-sm">
            <li>✓ Supabase cloud storage</li>
            <li>✓ Real-time updates</li>
            <li>✓ Automatic metadata extraction</li>
            <li>✓ Album artwork display</li>
            <li>✓ Swipe left/right to change tracks</li>
            <li>✓ Play/pause audio</li>
            <li>✓ Seek forward/backward 10 seconds</li>
            <li>✓ Track progress with scrubber</li>
            <li>✓ Admin panel for content management</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
