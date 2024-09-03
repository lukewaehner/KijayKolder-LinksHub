"use client";

import { useState, useEffect, useRef } from "react";
import {
  MdPlayCircle,
  MdPauseCircle,
  MdSkipNext,
  MdSkipPrevious,
} from "react-icons/md";

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

  const rewindToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleScrub = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = Number(event.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={rewindToStart}
          className="bg-white hover:bg-gray-300 text-black rounded-full p-2 focus:outline-none"
          aria-label="Rewind"
        >
          <MdSkipPrevious size={24} />
        </button>

        <button
          onClick={togglePlay}
          className="bg-white hover:bg-gray-300 text-black rounded-full p-2 focus:outline-none"
          aria-label={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? <MdPauseCircle size={24} /> : <MdPlayCircle size={24} />}
        </button>

        <button
          onClick={skipToNextTrack}
          className="bg-white hover:bg-gray-300 text-black rounded-full p-2 focus:outline-none"
          aria-label="Skip to Next Track"
        >
          <MdSkipNext size={24} />
        </button>

        <audio ref={audioRef} loop={loop}>
          <track kind="captions" src="" label="No captions available" />
        </audio>
      </div>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleScrub}
        step="0.01"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{
          accentColor: "#007bff", // For supporting browsers
        }}
      />
    </div>
  );
};

export default BackgroundMusic;
