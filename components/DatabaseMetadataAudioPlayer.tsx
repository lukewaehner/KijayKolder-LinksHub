"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MdPlayCircle,
  MdPauseCircle,
  MdSkipNext,
  MdSkipPrevious,
  MdReplay10,
  MdForward10,
  MdMusicNote,
  MdInfo,
} from "react-icons/md";
import { Card, CardBody } from "@nextui-org/card";
import { Tooltip } from "@nextui-org/tooltip";
import { motion } from "framer-motion";

import { Track } from "@/lib/dataService";

interface DatabaseMetadataAudioPlayerProps {
  tracks: Track[];
  loop?: boolean;
  onTrackChange?: (index: number) => void;
  glitchActive?: boolean;
  onMetadataToggle?: (expanded: boolean) => void;
}

const DatabaseMetadataAudioPlayer: React.FC<
  DatabaseMetadataAudioPlayerProps
> = ({
  tracks,
  loop = true,
  onTrackChange,
  glitchActive = false,
  onMetadataToggle,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMetadataDetails, setShowMetadataDetails] = useState(false);
  const [playerGlitch, setPlayerGlitch] = useState(false);
  const [buttonGlitch, setButtonGlitch] = useState<string | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Player-specific glitch effects
  useEffect(() => {
    const playerGlitchInterval = setInterval(
      () => {
        setPlayerGlitch(true);
        setTimeout(() => setPlayerGlitch(false), 300);
      },
      15000 + Math.random() * 25000
    ); // Random interval 15-40 seconds

    return () => clearInterval(playerGlitchInterval);
  }, []);

  // Get track name from database metadata or fallback to filename
  const getTrackName = (track: Track): string => {
    return (
      track.title ||
      track.path
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") ||
      "Unknown Track"
    );
  };

  // Button glitch effect
  const triggerButtonGlitch = (buttonId: string) => {
    setButtonGlitch(buttonId);
    setTimeout(() => setButtonGlitch(null), 150);
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.path;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = () =>
        setCurrentTime(audioRef.current!.currentTime);
      const handleLoadedMetadata = () => {
        // Use database duration if available, otherwise use file duration
        const fileDuration = audioRef.current!.duration;

        setDuration(currentTrack.duration || fileDuration);
      };

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

  const togglePlay = () => {
    triggerButtonGlitch("play");
    setIsPlaying(!isPlaying);
  };

  const skipToNextTrack = () => {
    triggerButtonGlitch("next");
    const nextIndex = (currentTrackIndex + 1) % tracks.length;

    setCurrentTrackIndex(nextIndex);
    if (onTrackChange) onTrackChange(nextIndex);
  };

  const skipToPreviousTrack = () => {
    triggerButtonGlitch("prev");
    const prevIndex =
      currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;

    setCurrentTrackIndex(prevIndex);
    if (onTrackChange) onTrackChange(prevIndex);
  };

  const seek = (seconds: number) => {
    triggerButtonGlitch(seconds > 0 ? "forward" : "rewind");
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

  const toggleMetadataDetails = () => {
    triggerButtonGlitch("info");
    const newState = !showMetadataDetails;

    setShowMetadataDetails(newState);
    if (onMetadataToggle) {
      onMetadataToggle(newState);
    }
  };

  const isGlitching = glitchActive || playerGlitch;

  if (!currentTrack) {
    return (
      <div className="text-center py-8 text-[#8B0000] font-mono">
        No track available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:gap-3 w-full relative">
      <audio ref={audioRef}>
        <track kind="captions" />
      </audio>

      {/* Player-wide glitch overlay */}
      {isGlitching && (
        <div
          className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-15 pointer-events-none z-20"
          style={{
            clipPath: "polygon(0 20%, 100% 15%, 100% 85%, 0 90%)",
          }}
        />
      )}

      {/* Cover Art with dark styling */}
      <div className="w-full flex justify-center mb-0.5 md:mb-1">
        <div
          className="w-full aspect-square max-w-[200px] md:max-w-[250px] rounded-none overflow-hidden relative border border-[#2A2A2A] bg-[#0A0A0A]"
          style={{
            filter: isGlitching
              ? "contrast(1.4) brightness(1.2) hue-rotate(10deg)"
              : "contrast(1.1) brightness(0.9)",
            imageRendering: "pixelated",
          }}
        >
          {currentTrack.artwork ? (
            <Image
              fill
              alt={getTrackName(currentTrack)}
              className="object-cover"
              src={currentTrack.artwork}
              style={{
                filter: "grayscale(60%) contrast(1.2) brightness(0.8)",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] relative">
              {/* Static noise background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `repeating-linear-gradient(
                    0deg, 
                    transparent, 
                    transparent 1px, 
                    rgba(255, 255, 255, 0.1) 1px, 
                    rgba(255, 255, 255, 0.1) 2px
                  )`,
                }}
              />
              <MdMusicNote className="text-[#F0F0F0] opacity-60" size={64} />
            </div>
          )}

          {/* Compression artifacts on cover */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
            style={{
              background: `repeating-linear-gradient(
                ${Math.random() * 360}deg, 
                transparent, 
                transparent 4px, 
                rgba(0, 0, 0, 0.3) 4px, 
                rgba(0, 0, 0, 0.3) 8px
              )`,
            }}
          />
        </div>
      </div>

      {/* Track Info with terminal styling */}
      <div className="text-center mb-0.5 md:mb-1 font-mono">
        <div className="flex justify-center items-center gap-2">
          <h3
            className={`font-bold text-[#F0F0F0] truncate text-sm md:text-base uppercase tracking-wider ${
              isGlitching ? "glitch-text" : ""
            }`}
          >
            {getTrackName(currentTrack)}
          </h3>
          <Tooltip content="SYS_INFO">
            <button
              className={`p-1 border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-none text-[#F0F0F0] hover:text-[#8B0000] ${
                buttonGlitch === "info" ? "glitch-button" : ""
              }`}
              onClick={toggleMetadataDetails}
            >
              <MdInfo size={12} />
            </button>
          </Tooltip>
        </div>
        <p className="text-xs text-[#888888] mt-1 font-mono">
          {currentTrack.artist
            ? `ARTIST: ${currentTrack.artist.toUpperCase()}`
            : "ARTIST: UNKNOWN"}
        </p>
        <p className="text-xs text-[#555555] font-mono">
          {currentTrack.album
            ? `ALBUM: ${currentTrack.album.toUpperCase()}`
            : `TRACK ${currentTrackIndex + 1}/${tracks.length}`}
        </p>
      </div>

      {/* Metadata Details with dark terminal styling */}
      {showMetadataDetails && (
        <motion.div
          animate={{ opacity: 1, height: "auto" }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] p-2 md:p-3 mb-1 md:mb-2 text-xs font-mono relative"
          exit={{ opacity: 0, height: 0 }}
          initial={{ opacity: 0, height: 0 }}
        >
          {/* Terminal header */}
          <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-1 mb-2">
            <span className="text-[#F0F0F0]">&gt; METADATA_DUMP</span>
            <span className="text-[#555555]">v2.1</span>
          </div>

          <ul className="text-xs space-y-1 text-[#CCCCCC]">
            <li>
              <span className="text-[#F0F0F0]">TITLE:</span>{" "}
              {currentTrack.title || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">ARTIST:</span>{" "}
              {currentTrack.artist || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">ALBUM:</span>{" "}
              {currentTrack.album || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">YEAR:</span>{" "}
              {currentTrack.year || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">DURATION:</span>{" "}
              {currentTrack.duration
                ? formatTime(currentTrack.duration)
                : "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">TYPE:</span>{" "}
              {currentTrack.is_single ? "SINGLE" : "ALBUM_TRACK"}
            </li>
          </ul>
        </motion.div>
      )}

      {/* Dark Cyberpunk Player Controls */}
      <Card className="bg-[#0A0A0A]/95 border border-[#2A2A2A] backdrop-blur-sm">
        <CardBody className="p-3 relative">
          {/* Control corruption overlay */}
          {isGlitching && (
            <div
              className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-10 pointer-events-none"
              style={{
                clipPath: "polygon(0 40%, 100% 35%, 100% 65%, 0 70%)",
              }}
            />
          )}

          <div className="flex items-center justify-center gap-1 md:gap-2 relative z-10">
            {/* Rewind Button */}
            <motion.button
              aria-label="Rewind 10 seconds"
              className={`bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-[#CCCCCC] hover:text-[#F0F0F0] font-mono text-xs px-2 py-1.5 md:px-3 md:py-2 focus:outline-none transition-none uppercase tracking-wider ${
                buttonGlitch === "rewind" ? "glitch-button" : ""
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => seek(-10)}
            >
              <MdReplay10 size={14} />
            </motion.button>

            {/* Previous Button */}
            <motion.button
              aria-label="Previous Track"
              className={`bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-[#CCCCCC] hover:text-[#F0F0F0] font-mono text-xs px-2 py-1.5 md:px-3 md:py-2 focus:outline-none transition-none uppercase tracking-wider ${
                buttonGlitch === "prev" ? "glitch-button" : ""
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={skipToPreviousTrack}
            >
              <MdSkipPrevious size={14} />
            </motion.button>

            {/* Play/Pause Button */}
            <motion.button
              aria-label={isPlaying ? "Pause Music" : "Play Music"}
              className={`bg-[#2A2A2A] hover:bg-[#3A3A3A] border-2 border-[#8B0000] text-[#F0F0F0] hover:text-[#8B0000] font-mono text-xs px-3 py-2 md:px-4 md:py-3 focus:outline-none transition-none uppercase tracking-wider relative ${
                buttonGlitch === "play" ? "glitch-button" : ""
              } ${isPlaying ? "bg-[#8B0000] text-[#F0F0F0] border-[#F0F0F0]" : ""}`}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <MdPauseCircle size={20} />
              ) : (
                <MdPlayCircle size={20} />
              )}
            </motion.button>

            {/* Next Button */}
            <motion.button
              aria-label="Next Track"
              className={`bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-[#CCCCCC] hover:text-[#F0F0F0] font-mono text-xs px-2 py-1.5 md:px-3 md:py-2 focus:outline-none transition-none uppercase tracking-wider ${
                buttonGlitch === "next" ? "glitch-button" : ""
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={skipToNextTrack}
            >
              <MdSkipNext size={14} />
            </motion.button>

            {/* Forward Button */}
            <motion.button
              aria-label="Forward 10 seconds"
              className={`bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333333] text-[#CCCCCC] hover:text-[#F0F0F0] font-mono text-xs px-2 py-1.5 md:px-3 md:py-2 focus:outline-none transition-none uppercase tracking-wider ${
                buttonGlitch === "forward" ? "glitch-button" : ""
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => seek(10)}
            >
              <MdForward10 size={14} />
            </motion.button>
          </div>

          {/* Progress Bar with cyberpunk styling */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[#F0F0F0] opacity-60 mb-1 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative">
              <input
                className="w-full h-1 bg-[#1A1A1A] appearance-none cursor-pointer cyberpunk-slider"
                max={duration || 0}
                min="0"
                type="range"
                value={currentTime}
                onChange={handleScrub}
              />
              {/* Progress indicator line */}
              <div
                className="absolute top-0 h-1 bg-[#8B0000] pointer-events-none"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Custom cyberpunk slider and glitch styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .cyberpunk-slider::-webkit-slider-thumb {
              appearance: none;
              width: 12px;
              height: 12px;
              background: #F0F0F0;
              cursor: pointer;
              border: 1px solid #8B0000;
            }
            .cyberpunk-slider::-moz-range-thumb {
              width: 12px;
              height: 12px;
              background: #F0F0F0;
              cursor: pointer;
              border: 1px solid #8B0000;
            }
            .glitch-text {
              text-shadow: 1px 0 0 #8B0000, -1px 0 0 #F0F0F0, 0 0 10px rgba(240, 240, 240, 0.5);
            }
            .glitch-button {
              background: #8B0000 !important;
              color: #F0F0F0 !important;
              text-shadow: 1px 0 0 #F0F0F0, -1px 0 0 #8B0000;
            }
          `,
        }}
      />
    </div>
  );
};

export default DatabaseMetadataAudioPlayer;
