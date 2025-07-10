"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";

import DatabaseMetadataAudioPlayer from "@/features/audio-player/components/DatabaseMetadataAudioPlayer";
import { getTracks, Track } from "@/shared/lib/data/service";

export default function AudioPlayerSection() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load tracks from database
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const tracksData = await getTracks();

        setTracks(tracksData);
      } catch (error) {
        console.error("Error loading tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
    // Trigger glitch on track change
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 200);
  };

  const handleMetadataToggle = (expanded: boolean) => {
    setIsMetadataExpanded(expanded);
  };

  // Subtle random glitches
  useEffect(() => {
    const glitchInterval = setInterval(
      () => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      },
      8000 + Math.random() * 12000
    ); // Random interval 8-20 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  // Subtle container distortion
  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const distortInterval = setInterval(
      () => {
        if (Math.random() < 0.1) {
          // 10% chance every interval
          const skew = (Math.random() - 0.5) * 2; // Very subtle ,skew
          const translate = (Math.random() - 0.5) * 3; // Very subtle translate

          element.style.transform = `translateX(${translate}px) skewX(${skew}deg)`;

          setTimeout(() => {
            element.style.transform = "translateX(0) skewX(0)";
          }, 100);
        }
      },
      3000 + Math.random() * 5000
    ); // Every 3-8 seconds

    return () => clearInterval(distortInterval);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-6 md:p-0">
      {/* Subtle static background */}
      <SubtleStatic />

      {/* CRT scanlines - more subtle on mobile */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 md:opacity-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Main container with dark glitch styling */}
      <div
        ref={containerRef}
        className={`relative p-4 md:mx-auto md:p-6 bg-[#0A0A0A]/70 md:bg-[#0A0A0A]/95 border-0 md:border border-[#1A1A1A]/60 md:border-[#1A1A1A] w-full md:w-auto md:max-w-md my-0 md:my-6 transition-all duration-300 backdrop-blur-sm md:backdrop-blur-md`}
        style={{
          boxShadow:
            "0 0 30px rgba(0, 0, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.03)",
          imageRendering: "pixelated",
        }}
      >
        {/* Compression artifacts overlay - more subtle on mobile */}
        <div
          className="absolute inset-0 bg-[#1A1A1A] mix-blend-multiply opacity-15 md:opacity-30 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              45deg, 
              transparent, 
              transparent 8px, 
              rgba(26, 26, 26, 0.2) 8px, 
              rgba(26, 26, 26, 0.2) 16px
            )`,
          }}
        />

        <div className="flex flex-col items-center justify-center gap-4 md:gap-5 relative z-10">
          {/* Header with glitch effects */}
          <motion.div
            animate={{
              opacity: 1,
              scale: 1,
              filter: glitchActive
                ? "hue-rotate(5deg) contrast(1.5)"
                : "hue-rotate(0deg) contrast(1)",
            }}
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "linear" }}
          >
            <Card className="px-3 md:px-4 bg-[#1A1A1A]/90 border border-[#2A2A2A] text-white w-full overflow-hidden relative backdrop-blur-sm">
              {/* Subtle scanning line */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full"
                style={{
                  animation: "scanning-line 8s linear infinite",
                }}
              />

              <CardBody className="flex justify-center py-2 md:py-3 relative z-10">
                <h1
                  className={`text-lg md:text-xl font-mono font-bold text-center tracking-wider uppercase ${
                    glitchActive ? "text-shadow-glitch" : ""
                  }`}
                >
                  KijayKolder
                </h1>
                <div className="text-xs font-mono text-[#F0F0F0] opacity-60 mt-1">
                  &gt; AUDIO_SYSTEM_v2.1
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Terminal status line */}
          <motion.div
            animate={{
              opacity: [0.6, 0.8, 0.6],
              x: glitchActive ? [-1, 1, -1, 0] : 0,
            }}
            className="w-full text-xs font-mono text-[#F0F0F0] opacity-60 px-2"
            initial={{ opacity: 0 }}
            transition={{
              opacity: { duration: 4, repeat: Infinity, ease: "linear" },
              x: { duration: 0.2, ease: "linear" },
            }}
          >
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-1">
              <span>
                STATUS: {currentTrackIndex < tracks.length ? "READY" : "ERROR"}
              </span>
              <span className="text-[#8B0000]">
                TRACK_{currentTrackIndex + 1}
              </span>
            </div>
          </motion.div>

          {/* Enhanced Audio Player with dark styling */}
          <motion.div
            animate={{
              opacity: 1,
              scale: 1,
              filter: glitchActive
                ? "brightness(1.2) contrast(1.3)"
                : "brightness(1) contrast(1)",
            }}
            className="w-full mt-2 md:mt-3 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.3,
              delay: 0.4,
              ease: "linear",
            }}
          >
            {/* Glitch overlay for player */}
            {glitchActive && (
              <div
                className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-20 pointer-events-none z-10"
                style={{
                  clipPath: "polygon(0 30%, 100% 25%, 100% 75%, 0 80%)",
                }}
              />
            )}

            {loading ? (
              <div className="text-center py-8 text-[#F0F0F0] font-mono">
                Loading tracks...
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-8 text-[#8B0000] font-mono">
                No tracks available
              </div>
            ) : (
              <DatabaseMetadataAudioPlayer
                glitchActive={glitchActive}
                tracks={tracks}
                onMetadataToggle={handleMetadataToggle}
                onTrackChange={handleTrackChange}
              />
            )}
          </motion.div>

          {/* System info footer */}
          <motion.div
            animate={{ opacity: 0.4 }}
            className="w-full text-xs font-mono text-[#2A2A2A] mt-2 px-2"
            initial={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.5, ease: "linear" }}
          >
            <div className="flex justify-between text-xs">
              <span>SYS_VER: 2.1.337</span>
              <span>MEM: {Math.floor(Math.random() * 40 + 60)}%</span>
            </div>
          </motion.div>
        </div>

        {/* Corruption blocks - very subtle */}
        {Math.random() < 0.3 && (
          <div
            className="absolute bg-black opacity-60 pointer-events-none"
            style={{
              right: "5%",
              bottom: "10%",
              width: "15px",
              height: "8px",
              clipPath: "polygon(0 0, 80% 0, 100% 100%, 0 100%)",
            }}
          />
        )}
      </div>

      {/* Global styles for dark glitch effects */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes scanning-line {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .text-shadow-glitch {
            text-shadow:
              1px 0 0 #8B0000,
              -1px 0 0 #F0F0F0,
              0 0 10px rgba(240, 240, 240, 0.5);
          }
        `,
        }}
      />
    </div>
  );
}

// Subtle Static Component for background
function SubtleStatic() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.mixBlendMode = "overlay";
    canvas.style.opacity = "0.1";
    canvas.style.zIndex = "1";

    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    let animationId: number;
    let frameCount = 0;

    const drawStatic = () => {
      frameCount++;

      // Very subtle static - only update every 8th frame
      if (frameCount % 8 === 0) {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        // Very sparse static
        for (let i = 0; i < data.length; i += 16) {
          // Skip more pixels
          if (Math.random() < 0.008) {
            // Even lower probability
            const noise = Math.random() * 100;
            const value = noise < 30 ? 0 : noise > 70 ? 255 : noise;

            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 40; // Lower alpha
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      animationId = requestAnimationFrame(drawStatic);
    };

    drawStatic();

    return () => {
      cancelAnimationFrame(animationId);
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, []);

  return null;
}
