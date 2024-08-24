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

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack;

      // Handle play and pause events to update the state
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);

      // Clean up event listeners on component unmount
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("play", handlePlay);
          audioRef.current.removeEventListener("pause", handlePause);
        }
      };
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      // Play or pause the audio based on the isPlaying state
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
      // Automatically play the new track when the currentTrack changes
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

  return (
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
  );
};

export default BackgroundMusic;
