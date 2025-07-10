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

import {
  AudioMetadata,
  extractMetadataFromURL,
  revokeCoverArtURL,
} from "@/features/metadata/utils/metadata";
import { Track } from "@/shared/lib/data/service";

interface MetadataAudioPlayerProps {
  tracks: Track[];
  loop?: boolean;
  onTrackChange?: (index: number) => void;
  glitchActive?: boolean;
}

const MetadataAudioPlayer: React.FC<MetadataAudioPlayerProps> = ({
  tracks,
  loop = true,
  onTrackChange,
  glitchActive = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [showMetadataDetails, setShowMetadataDetails] = useState(false);
  const [playerGlitch, setPlayerGlitch] = useState(false);
  const [buttonGlitch, setButtonGlitch] = useState<string | null>(null);

  const currentTrack = tracks[currentTrackIndex];
  const currentTrackPath = currentTrack?.path;

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

  // Extract track name from track object or path
  const getTrackName = (track: Track): string => {
    // If metadata is available, use that title first
    if (metadata?.title) {
      return metadata.title;
    }

    // If track has a title, use it
    if (track?.title) {
      return track.title;
    }

    // Otherwise extract from path
    const path = track?.path || "";
    const fileName = path.split("/").pop() || "";

    return fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  // Button glitch effect
  const triggerButtonGlitch = (buttonId: string) => {
    setButtonGlitch(buttonId);
    setTimeout(() => setButtonGlitch(null), 150);
  };

  // Load metadata when track changes
  useEffect(() => {
    const loadMetadata = async () => {
      if (!currentTrack) return;

      try {
        setIsLoadingMetadata(true);
        setMetadataError(null);

        // Clean up previous cover art URL if it exists
        if (metadata?.coverArt?.dataURL) {
          revokeCoverArtURL(metadata.coverArt.dataURL);
        }

        const meta = await extractMetadataFromURL(currentTrackPath!);

        setMetadata(meta);
        console.log("Loaded metadata for track:", meta);
      } catch (error) {
        console.error("Failed to load metadata:", error);
        setMetadataError("Failed to load metadata");
        setMetadata(null);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();

    // Clean up function
    return () => {
      if (metadata?.coverArt?.dataURL) {
        revokeCoverArtURL(metadata.coverArt.dataURL);
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrackPath || "";

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
    setShowMetadataDetails(!showMetadataDetails);
  };

  const isGlitching = glitchActive || playerGlitch;

  return (
    <div className="flex flex-col gap-3 w-full relative">
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
      <div className="w-full flex justify-center mb-1">
        <div
          className="w-full aspect-square max-w-[250px] rounded-none overflow-hidden relative border border-[#2A2A2A] bg-[#0A0A0A]"
          style={{
            filter: isGlitching
              ? "contrast(1.4) brightness(1.2) hue-rotate(10deg)"
              : "contrast(1.1) brightness(0.9)",
            imageRendering: "pixelated",
          }}
        >
          {isLoadingMetadata ? (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
              <div className="text-[#F0F0F0] font-mono text-xs">LOADING...</div>
            </div>
          ) : metadata?.coverArt?.dataURL ? (
            <Image
              alt={getTrackName(currentTrack)}
              className="object-cover"
              height={250}
              src={metadata.coverArt.dataURL}
              style={{
                filter: "grayscale(60%) contrast(1.2) brightness(0.8)",
              }}
              width={250}
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
      <div className="text-center mb-1 font-mono">
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
          {metadata?.artist
            ? `ARTIST: ${metadata.artist.toUpperCase()}`
            : "ARTIST: UNKNOWN"}
        </p>
        <p className="text-xs text-[#555555] font-mono">
          {metadata?.album
            ? `ALBUM: ${metadata.album.toUpperCase()}`
            : `TRACK ${currentTrackIndex + 1}/${tracks.length}`}
        </p>
      </div>

      {/* Metadata Details with dark terminal styling */}
      {showMetadataDetails && (
        <motion.div
          animate={{ opacity: 1, height: "auto" }}
          className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 mb-2 text-xs font-mono relative"
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
              {metadata?.title || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">ARTIST:</span>{" "}
              {metadata?.artist || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">ALBUM:</span>{" "}
              {metadata?.album || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">YEAR:</span>{" "}
              {metadata?.year || "UNKNOWN"}
            </li>
            <li>
              <span className="text-[#F0F0F0]">GENRE:</span>{" "}
              {metadata?.genre || "UNKNOWN"}
            </li>
            {metadata?.trackNumber && (
              <li>
                <span className="text-[#F0F0F0]">TRACK#:</span>{" "}
                {metadata.trackNumber}
              </li>
            )}
            {metadataError && (
              <li className="text-[#8B0000]">ERROR: {metadataError}</li>
            )}
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
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
            >
              {/* Play button glitch effect */}
              {buttonGlitch === "play" && (
                <div className="absolute inset-0 bg-[#F0F0F0] mix-blend-difference opacity-60" />
              )}
              {isPlaying ? (
                <MdPauseCircle size={18} />
              ) : (
                <MdPlayCircle size={18} />
              )}
            </motion.button>

            {/* Next Button */}
            <motion.button
              aria-label="Skip to Next Track"
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

            <audio ref={audioRef} loop={loop}>
              <track kind="captions" label="No captions available" src="" />
            </audio>
          </div>

          {/* Dark Progress Bar */}
          <div className="flex items-center gap-1 md:gap-2 mt-3 relative">
            <span className="text-[10px] md:text-xs font-mono text-[#F0F0F0] min-w-[35px]">
              {formatTime(currentTime)}
            </span>

            {/* Custom styled progress bar */}
            <div className="w-full relative h-2 bg-[#1A1A1A] border border-[#333333]">
              <div
                className="h-full bg-[#F0F0F0] transition-none relative"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  filter: isGlitching ? "hue-rotate(180deg)" : "none",
                }}
              >
                {/* Glitch bars on progress */}
                {isGlitching && (
                  <div
                    className="absolute inset-0 bg-[#8B0000] mix-blend-difference"
                    style={{
                      clipPath: "polygon(20% 0%, 25% 0%, 30% 100%, 25% 100%)",
                    }}
                  />
                )}
              </div>

              {/* Hidden range input for interaction */}
              <input
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                max={duration || 100}
                min="0"
                step="0.01"
                type="range"
                value={currentTime}
                onChange={handleScrub}
              />
            </div>

            <span className="text-[10px] md:text-xs font-mono text-[#F0F0F0] min-w-[35px]">
              {duration ? formatTime(duration) : "0:00"}
            </span>
          </div>

          {/* System status line */}
          <div className="flex justify-between items-center mt-2 text-xs font-mono text-[#555555]">
            <span>AUDIO_SYS: ACTIVE</span>
            <span className="text-[#8B0000]">
              {isPlaying ? "> PLAYING" : "|| PAUSED"}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Global styles for glitch effects */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .glitch-text {
            animation: glitch-text 0.3s ease-in-out;
          }
          
          .glitch-button {
            animation: glitch-button 0.15s ease-in-out;
          }
          
          @keyframes glitch-text {
            0% { transform: translateX(0); }
            20% { transform: translateX(-2px) skew(-1deg); }
            40% { transform: translateX(2px) skew(1deg); }
            60% { transform: translateX(-1px) skew(-0.5deg); }
            80% { transform: translateX(1px) skew(0.5deg); }
            100% { transform: translateX(0); }
          }
          
          @keyframes glitch-button {
            0% { filter: hue-rotate(0deg) contrast(1); }
            25% { filter: hue-rotate(90deg) contrast(2); }
            50% { filter: hue-rotate(180deg) contrast(1.5); }
            75% { filter: hue-rotate(270deg) contrast(2); }
            100% { filter: hue-rotate(360deg) contrast(1); }
          }
        `,
        }}
      />
    </div>
  );
};

export default MetadataAudioPlayer;
