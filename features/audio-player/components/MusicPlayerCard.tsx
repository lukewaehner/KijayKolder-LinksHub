"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";
import {
  MdPlayCircleFilled,
  MdPauseCircleFilled,
  MdReplay10,
  MdForward10,
  MdAlbum,
} from "react-icons/md";

import { Track } from "@/shared/lib/data/service";

interface MusicPlayerCardProps {
  tracks: Track[];
  initialIndex?: number;
  onTrackChange?: (index: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:$,{secs < 10 ? "0" : ""}${secs}`;
};

export default function MusicPlayerCard({
  tracks,
  initialIndex = 0,
  onTrackChange,
}: MusicPlayerCardProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current track
  const currentTrack = tracks[currentTrackIndex];

  // Handle track changes
  const changeTrack = useCallback(
    (direction: "next" | "prev") => {
      let newIndex: number;

      if (direction === "next") {
        newIndex = (currentTrackIndex + 1) % tracks.length;
      } else {
        newIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      }

      setCurrentTrackIndex(newIndex);

      if (onTrackChange) {
        onTrackChange(newIndex);
      }

      // Clear swipe direction after animation completes
      setTimeout(() => {
        setSwipeDirection(null);
      }, 300);
    },
    [currentTrackIndex, tracks.length, onTrackChange]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only if the container is focused or one of its children is focused
      if (
        containerRef.current &&
        containerRef.current.contains(document.activeElement)
      ) {
        if (e.key === "ArrowLeft") {
          changeTrack("prev");
        } else if (e.key === "ArrowRight") {
          changeTrack("next");
        } else if (e.key === " " || e.key === "Enter") {
          togglePlay();
          e.preventDefault(); // Prevent scrolling on spacebar
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeTrack]);

  // Audio event listeners
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoaded(true);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        // Auto-advance to next track
        changeTrack("next");
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
  }, [changeTrack]);

  // Load audio when component mounts or track changes
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      // Add error handling for when audio can't be loaded
      const handleError = (e: ErrorEvent) => {
        console.error("Audio error:", e);
        setIsLoaded(false);
      };

      audio.addEventListener("error", handleError);

      // Set a timeout to handle cases where loading stalls
      const loadTimeout = setTimeout(() => {
        if (!isLoaded) {
          console.warn("Audio loading timeout");
          setIsLoaded(false);
        }
      }, 8000);

      // Load the audio file
      audio.load();

      return () => {
        audio.removeEventListener("error", handleError);
        clearTimeout(loadTimeout);
      };
    }
  }, [currentTrack, isLoaded]);

  // Playback controls
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

  // Animation variants
  const cardVariants = {
    center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
    enterFromLeft: { x: "-100%", opacity: 0, scale: 0.8, zIndex: 0 },
    enterFromRight: { x: "100%", opacity: 0, scale: 0.8, zIndex: 0 },
    exitToLeft: { x: "-100%", opacity: 0, scale: 0.8, zIndex: 0 },
    exitToRight: { x: "100%", opacity: 0, scale: 0.8, zIndex: 0 },
  };

  // Determine animation state for non-swiping states
  const getAnimationState = () => {
    if (swipeDirection === "left") {
      return "exitToLeft";
    } else if (swipeDirection === "right") {
      return "exitToRight";
    }

    return "center";
  };

  // Default cover art as inline SVG data URL - simple music note on a gradient
  const DEFAULT_COVER_ART =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23grad)' /%3E%3Cpath d='M80 40 L80 120 Q80 140 100 140 Q120 140 120 120 Q120 100 100 100 L100 60 L140 70 L140 50 Z' fill='white' /%3E%3C/svg%3E";

  // Determine which data to display
  const displayTitle = currentTrack.title;
  const displayArtist = "";
  const displayAlbum = "";
  const displayYear = currentTrack.year;
  const artworkSrc = currentTrack.artwork || DEFAULT_COVER_ART;

  // Show loading state when track is initially loaded and has no pre-existing artwork
  const isShowingLoadingState = !currentTrack.artwork;

  // Generate initials for fallback display when no cover art is available
  const getInitials = () => {
    if (displayArtist && displayTitle) {
      return `${displayArtist[0]}${displayTitle[0]}`.toUpperCase();
    } else if (displayTitle && displayTitle.length > 1) {
      return displayTitle.substring(0, 2).toUpperCase();
    } else {
      return "♪";
    }
  };

  // Determine background color based on track id for consistent colors per track
  const getBackgroundColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-teal-500",
      "bg-indigo-500",
    ];

    // Use track id to determine a consistent color
    const charSum = currentTrack.id
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return colors[charSum % colors.length];
  };

  return (
    <div
      ref={containerRef}
      aria-label="Music player with track navigation controls"
      className="w-full max-w-md mx-auto relative select-none"
      role="button"
      style={{
        touchAction: "none",
        WebkitTapHighlightColor: "transparent",
        isolation: "isolate",
        zIndex: 10,
      }}
      tabIndex={0}
    >
      <div
        suppressHydrationWarning
        aria-label="Music player with swipe controls"
        className="touchable-area relative isolate"
        role="region"
      >
        <motion.div
          suppressHydrationWarning
          animate={getAnimationState()}
          className="w-full cursor-grab select-none touch-none"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          dragTransition={{
            power: 0.2,
            timeConstant: 400,
            modifyTarget: (target) => (Math.abs(target) < 80 ? 0 : target),
          }}
          initial="center"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          variants={cardVariants}
          onDragEnd={(e, info) => {
            console.log(
              `Drag ended: velocity=${info.velocity.x}, offset=${info.offset.x}`
            );

            // Use EITHER velocity OR offset (larger threshold) for more reliable detection
            const swipeThreshold = 100;
            const velocityThreshold = 300;

            if (Math.abs(info.velocity.x) > velocityThreshold) {
              // Fast swipe - use velocity
              if (info.velocity.x > 0) {
                console.log("Fast swipe RIGHT detected - previous track");
                changeTrack("prev");
              } else {
                console.log("Fast swipe LEFT detected - next track");
                changeTrack("next");
              }
            } else if (Math.abs(info.offset.x) > swipeThreshold) {
              // Slow but significant dragging - use offset
              if (info.offset.x > 0) {
                console.log("Drag RIGHT completed - previous track");
                changeTrack("prev");
              } else {
                console.log("Drag LEFT completed - next track");
                changeTrack("next");
              }
            }
          }}
        >
          <Card className="overflow-hidden bg-white/90 backdrop-blur-md shadow-lg">
            <CardBody className="p-0">
              {/* Album Artwork */}
              <div className="relative w-full aspect-square">
                {isShowingLoadingState ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white" />
                  </div>
                ) : artworkSrc !== DEFAULT_COVER_ART ? (
                  <img
                    suppressHydrationWarning
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                    src={artworkSrc}
                  />
                ) : (
                  // Fallback display when no cover art is available
                  <div
                    suppressHydrationWarning
                    className={`w-full h-full flex items-center justify-center ${getBackgroundColor()} text-white`}
                  >
                    <span className="text-7xl font-bold">{getInitials()}</span>
                  </div>
                )}

                {/* Play/Pause overlay button - using proper button element */}
                <button
                  suppressHydrationWarning
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors w-full h-full border-0"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <MdPauseCircleFilled className="text-white text-6xl" />
                  ) : (
                    <MdPlayCircleFilled className="text-white text-6xl" />
                  )}
                </button>
              </div>

              {/* Track Info & Controls */}
              <div className="p-4">
                <div suppressHydrationWarning className="mb-3">
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
                  {displayYear && (
                    <p className="text-gray-600 text-sm mb-1">{displayYear}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div
                  suppressHydrationWarning
                  className="flex items-center gap-2 mb-3"
                >
                  <span className="text-xs text-gray-600 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    className="w-full h-1.5 bg-gray-200 rounded-full accent-black"
                    disabled={!isLoaded}
                    max={duration || 100}
                    min="0"
                    step="0.01"
                    type="range"
                    value={currentTime}
                    onChange={handleScrub}
                  />
                  <span className="text-xs text-gray-600 w-10">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Playback Controls */}
                <div className="flex justify-center items-center gap-6">
                  <button
                    aria-label="Rewind 10 seconds"
                    className="text-2xl text-gray-800 hover:text-black"
                    onClick={() => seek(-10)}
                  >
                    <MdReplay10 />
                  </button>
                  <button
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="text-4xl text-gray-800 hover:text-black"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <MdPauseCircleFilled />
                    ) : (
                      <MdPlayCircleFilled />
                    )}
                  </button>
                  <button
                    aria-label="Forward 10 seconds"
                    className="text-2xl text-gray-800 hover:text-black"
                    onClick={() => seek(10)}
                  >
                    <MdForward10 />
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Navigation indicators */}
      <div className="flex items-center justify-center mt-4 gap-3">
        {/* Previous track button */}
        <button
          aria-label="Previous track"
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
          onClick={() => changeTrack("prev")}
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              fillRule="evenodd"
            />
          </svg>
        </button>

        {/* Track indicators */}
        <div className="flex gap-2">
          {tracks.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentTrackIndex ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Next track button */}
        <button
          aria-label="Next track"
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
          onClick={() => changeTrack("next")}
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata">
        <source src={currentTrack.path} />
        <track kind="captions" label="English captions" src="" />
      </audio>

      {/* Swipe Instructions - display on mobile only */}
      <div className="text-center text-gray-500 text-sm mt-2 md:hidden">
        Swipe left/right or use buttons to change tracks
      </div>
    </div>
  );
}
