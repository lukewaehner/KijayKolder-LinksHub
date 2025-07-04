"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";
import {
  MdPlayCircleFilled,
  MdPauseCircleFilled,
  MdReplay10,
  MdForward30,
  MdAlbum,
} from "react-icons/md";

import { Track } from "@/shared/lib/data/service";

interface SongPreviewProps {
  track: Track;
  displayTitleAndYear?: boolean;
  isVisible?: boolean;
  isLargeScreen?: boolean;
  onPlayerUpdate?: (
    audioElement: HTMLAudioElement | null,
    isPlaying: boolean
  ) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

// Using memo to prevent unnecessary re-renders
const SongPreview: React.FC<SongPreviewProps> = memo(
  ({
    track,
    displayTitleAndYear = true,
    isVisible = true,
    isLargeScreen = false,
    onPlayerUpdate,
  }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Track previous visibility state
    const wasVisibleRef = useRef(isVisible);

    // Optimization: Use reduced animation complexity for large screens
    const animationConfig = isLargeScreen
      ? {
          animate: { opacity: 1 },
          initial: { opacity: 0.8 },
          transition: { duration: 0.2 },
        }
      : {
          animate: { opacity: 1 },
          initial: { opacity: 0 },
          transition: { duration: 0.3 },
        };

    useEffect(() => {
      if (audioRef.current) {
        const audio = audioRef.current;

        const handlePlay = () => {
          setIsPlaying(true);
          // Notify parent component about the player state
          if (onPlayerUpdate) {
            onPlayerUpdate(audio, true);
          }
        };

        const handlePause = () => {
          setIsPlaying(false);
          // Notify parent component about the player state
          if (onPlayerUpdate) {
            onPlayerUpdate(audio, false);
          }
        };

        const handleTimeUpdate = () => {
          // Performance optimization: update less frequently on large screens
          if (isLargeScreen && audio.currentTime % 0.5 !== 0) return;
          setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
          setDuration(audio.duration);
          setIsLoaded(true);
        };

        const handleEnded = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          // Notify parent component when playback ends
          if (onPlayerUpdate) {
            onPlayerUpdate(audio, false);
          }
        };

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
          audio.removeEventListener("play", handlePlay);
          audio.removeEventListener("pause", handlePause);
          audio.removeEventListener("timeupdate", handleTimeUpdate);
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audio.removeEventListener("ended", handleEnded);
        };
      }
    }, [onPlayerUpdate, isLargeScreen]);

    // Load audio when component mounts
    useEffect(() => {
      // Performance optimization: lazy load audio
      if (audioRef.current && isVisible) {
        audioRef.current.load();
      }
    }, [track, isVisible]);

    // Handle visibility changes
    useEffect(() => {
      // If component becomes invisible and audio is playing, pause it
      if (
        !isVisible &&
        wasVisibleRef.current &&
        audioRef.current &&
        isPlaying
      ) {
        audioRef.current.pause();
      }

      // Update previous visibility ref
      wasVisibleRef.current = isVisible;
    }, [isVisible, isPlaying]);

    const togglePlay = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current
            .play()
            .catch((error) => console.error("Audio playback failed:", error));
        }
      }
    };

    const seek = (seconds: number) => {
      if (audioRef.current && isLoaded) {
        const newTime = Math.min(
          Math.max(0, audioRef.current.currentTime + seconds),
          duration
        );

        audioRef.current.currentTime = newTime;
      }
    };

    const handleScrub = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (audioRef.current) {
        const newTime = parseFloat(event.target.value);

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    // Decide which artwork to display
    const artworkSrc = track.artwork || "/images/default-cover.jpg";

    // Determine title and artist to display
    const displayTitle = track.title;
    const displayYear = track.year;
    const displayArtist = "";
    const displayAlbum = "";

    return (
      <div className="w-full">
        <motion.div {...animationConfig}>
          <Card className="bg-white/80 backdrop-blur-md overflow-hidden">
            <CardBody className="p-0">
              {/* Album Artwork */}
              <div className="relative w-full aspect-square">
                <img
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                  loading={isLargeScreen ? "lazy" : "eager"}
                  src={artworkSrc}
                />
                {/* Play/Pause overlay button */}
                <button
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/40 transition-colors"
                  type="button"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <MdPauseCircleFilled className="text-white text-6xl" />
                  ) : (
                    <MdPlayCircleFilled className="text-white text-6xl" />
                  )}
                </button>
              </div>

              {/* Song Info & Controls */}
              <div className="p-3">
                {displayTitleAndYear && (
                  <>
                    <h3 className="text-xl font-bold text-black mb-1">
                      {displayTitle}
                    </h3>
                    {displayArtist && (
                      <p className="text-gray-600 text-sm mb-1">
                        {displayArtist}
                      </p>
                    )}
                    {displayAlbum && (
                      <p className="text-gray-600 text-sm mb-1">
                        <MdAlbum className="inline mr-1" />
                        {displayAlbum}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-2">{displayYear}</p>
                  </>
                )}

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    className="w-full h-1.5 bg-gray-200 rounded-full accent-black"
                    disabled={!isLoaded}
                    max={duration || 100}
                    min="0"
                    step={isLargeScreen ? "0.5" : "0.01"} // Larger step for better performance
                    type="range"
                    value={currentTime}
                    onChange={handleScrub}
                  />
                  <span className="text-xs text-gray-600 w-8">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Additional Controls */}
                <div className="flex justify-center gap-6 mt-2">
                  <button
                    aria-label="Rewind 10 seconds"
                    className="text-xl text-gray-800 hover:text-black"
                    onClick={() => seek(-10)}
                  >
                    <MdReplay10 />
                  </button>
                  <button
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="text-2xl text-gray-800 hover:text-black"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <MdPauseCircleFilled />
                    ) : (
                      <MdPlayCircleFilled />
                    )}
                  </button>
                  <button
                    aria-label="Forward 30 seconds"
                    className="text-xl text-gray-800 hover:text-black"
                    onClick={() => seek(30)}
                  >
                    <MdForward30 />
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Performance optimization: only preload metadata when visible */}
        <audio ref={audioRef} preload={isVisible ? "metadata" : "none"}>
          <source src={track.path} />
          <track kind="captions" label="English" src="" />
        </audio>
      </div>
    );
  }
);

// Add display name for debugging
SongPreview.displayName = "SongPreview";

export default SongPreview;
