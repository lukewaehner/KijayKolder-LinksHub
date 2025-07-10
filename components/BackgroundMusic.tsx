"use client";

import { useState, useEffect, useRef } from "react";
// Using simple text alternatives due to React Icons TypeScript compatibility issues

interface BackgroundMusicProps {
  tracks: string[];
  loop?: boolean;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  tracks,
  loop = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = tracks[currentTrackIndex];

  // Extract track name from path
  const getTrackName = (track: string) => {
    // Remove path and extension
    const fileName = track.split("/").pop() || "";

    return fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = () =>
        setCurrentTime(audioRef.current!.currentTime);
      const handleLoadedMetadata = () =>
        setDuration(audioRef.current!.duration);

      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("play", handlePlay);
          audioRef.current.removeEventListener("pause", handlePause);
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );
        }
      };
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Audio playback failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((error) => console.error("Audio playback failed:", error));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const skipToNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  const skipToPreviousTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === 0 ? tracks.length - 1 : prevIndex - 1
    );
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime + seconds
      );
    }
  };

  const handleScrub = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(event.target.value);

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-gray-100/80 p-3 rounded-lg shadow-inner">
      <div className="text-center mb-0.5">
        <p className="font-medium text-gray-800 truncate text-sm md:text-base">
          {getTrackName(currentTrack)}
        </p>
        <p className="text-[10px] md:text-xs text-gray-500">
          Track {currentTrackIndex + 1} of {tracks.length}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-3">
        <button
          aria-label="Rewind 10 seconds"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1.5 md:p-2 focus:outline-none transition-colors"
          onClick={() => seek(-10)}
        >
          <span className="text-xs font-bold">-10s</span>
        </button>

        <button
          aria-label="Previous Track"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1.5 md:p-2 focus:outline-none transition-colors"
          onClick={skipToPreviousTrack}
        >
          <span className="text-xs font-bold">&lt;</span>
        </button>

        <button
          aria-label={isPlaying ? "Pause Music" : "Play Music"}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 md:p-3 focus:outline-none transition-colors"
          onClick={togglePlay}
        >
          <span className="text-lg font-bold">{isPlaying ? "||" : "&gt;"}</span>
        </button>

        <button
          aria-label="Skip to Next Track"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1.5 md:p-2 focus:outline-none transition-colors"
          onClick={skipToNextTrack}
        >
          <span className="text-xs font-bold">&gt;</span>
        </button>

        <button
          aria-label="Forward 10 seconds"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1.5 md:p-2 focus:outline-none transition-colors"
          onClick={() => seek(10)}
        >
          <span className="text-xs font-bold">+10s</span>
        </button>

        <audio ref={audioRef} loop={loop}>
          <track kind="captions" label="No captions available" src="" />
        </audio>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <span className="text-[10px] md:text-xs">
          {formatTime(currentTime)}
        </span>
        <input
          className="w-full h-1.5 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          max={duration || 100}
          min="0"
          step="0.01"
          style={{
            accentColor: "#3b82f6", // Blue-500
          }}
          type="range"
          value={currentTime}
          onChange={handleScrub}
        />
        <span className="text-[10px] md:text-xs">
          {duration ? formatTime(duration) : "0:00"}
        </span>
      </div>
    </div>
  );
};

export default BackgroundMusic;
