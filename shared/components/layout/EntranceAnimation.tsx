"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import "../../../styles/entrance-animations.css";

interface EntranceAnimationProps {
  onComplete: () => void;
}

export default function EntranceAnimation({
  onComplete,
}: EntranceAnimationProps) {
  const [phase, setPhase] = useState(0);
  const [staticIntensity, setStaticIntensity] = useState(0);
  const [displacement, setDisplacement] = useState(0);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);

  useEffect(() => {
    const timeline = [
      // Phase 1: Signal Acquisition (0-800ms) - Pure black with building static
      {
        delay: 0,
        action: () => {
          setPhase(1);
          setStaticIntensity(0.1);
        },
      },
      {
        delay: 200,
        action: () => {
          setStaticIntensity(0.2);
        },
      },
      {
        delay: 400,
        action: () => {
          setStaticIntensity(0.3);
        },
      },

      // Phase 2: Initial Corruption (800-1600ms) - Logo appears with heavy displacement
      {
        delay: 800,
        action: () => {
          setPhase(2);
          setDisplacement(10);
        },
      },
      {
        delay: 1000,
        action: () => {
          setDisplacement(20);
        },
      },
      {
        delay: 1200,
        action: () => {
          setDisplacement(15);
        },
      },

      // Phase 3: System Failure (1600-2400ms) - Maximum distortion and white flash
      {
        delay: 1600,
        action: () => {
          setPhase(3);
          setDisplacement(40);
          setStaticIntensity(0.8);
        },
      },
      {
        delay: 1650,
        action: () => {
          setShowWhiteFlash(true);
        },
      },
      {
        delay: 1700,
        action: () => {
          setShowWhiteFlash(false);
        },
      },
      {
        delay: 1800,
        action: () => {
          setDisplacement(25);
        },
      },

      // Phase 4: False Stability (2400-3200ms) - Apparent calm with micro-glitches
      {
        delay: 2400,
        action: () => {
          setPhase(4);
          setDisplacement(5);
          setStaticIntensity(0.2);
        },
      },
      {
        delay: 2600,
        action: () => {
          setDisplacement(8);
        },
      },
      {
        delay: 2800,
        action: () => {
          setDisplacement(3);
        },
      },
      {
        delay: 3000,
        action: () => {
          setDisplacement(6);
        },
      },

      // Complete
      { delay: 3200, action: () => onComplete() },
    ];

    const timers = timeline.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black overflow-hidden z-50"
      exit={{ opacity: 0 }}
      initial={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
      {/* Pure black background - no gradients */}
      <div className="absolute inset-0 bg-black" />

      {/* Static noise overlay */}
      <CorruptedStatic intensity={staticIntensity} />

      {/* Scanlines - harsh CRT effect - mobile optimized */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 md:opacity-60"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.02) 1px, rgba(255,255,255,0.02) 2px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* White flash for system failure */}
      {showWhiteFlash && (
        <div className="absolute inset-0 bg-white opacity-90 mix-blend-normal" />
      )}

      <AnimatePresence mode="wait">
        {phase >= 2 && (
          <motion.div
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            <DistortedLogo
              displacement={displacement}
              phase={phase}
              staticIntensity={staticIntensity}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal text - mobile first positioning */}
      {phase >= 3 && (
        <motion.div
          animate={{ opacity: [0, 1, 0, 1] }}
          className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto font-mono text-xs"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "linear" }}
        >
          <div className="text-[#00FF00] opacity-80 text-xs md:text-sm">
            SIGNAL_LOST
          </div>
          <div className="text-[#F0F0F0] opacity-60 mt-1 text-xs">
            attempting_recovery...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Corrupted Static Component - More aggressive analog-style noise
function CorruptedStatic({ intensity = 0.5 }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.mixBlendMode = "overlay";
    canvas.style.opacity = "0.8";
    canvas.style.zIndex = "2";

    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    let animationId: number;
    let frameCount = 0;

    const drawStatic = () => {
      frameCount++;

      // Intentional frame drops for authentic feel - less aggressive on mobile
      const frameSkip = window.innerWidth < 768 ? 4 : 3;

      if (frameCount % frameSkip === 0) {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * 255 * intensity;
          const value = noise < 20 ? 0 : noise > 200 ? 255 : noise * 0.3;

          data[i] = value; // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
          data[i + 3] = 255 * intensity * 0.7; // Alpha - reduced for mobile
        }

        ctx.putImageData(imageData, 0, 0);

        // Horizontal video tracking errors - less frequent on mobile
        const trackingErrorChance = window.innerWidth < 768 ? 0.05 : 0.1;

        if (Math.random() < trackingErrorChance * intensity) {
          const errorY = Math.random() * canvas.height;
          const errorHeight = Math.random() * 30 + 10; // Smaller on mobile
          const offset = (Math.random() - 0.5) * 50; // Less displacement on mobile

          ctx.fillStyle = Math.random() < 0.5 ? "#000" : "#FFF";
          ctx.fillRect(offset, errorY, canvas.width, errorHeight);
        }
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
  }, [intensity]);

  return null;
}

// Distorted Logo Component - Mobile first with better visibility
function DistortedLogo({
  displacement = 0,
  phase,
  staticIntensity,
}: {
  displacement: number;
  phase: number;
  staticIntensity: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const glitchInterval = setInterval(
      () => {
        if (phase >= 3) {
          // Reduced displacement for mobile
          const isMobile = window.innerWidth < 768;
          const maxDisplacement = isMobile ? displacement * 0.5 : displacement;

          // Random horizontal displacement for video tracking errors
          const skewX = (Math.random() - 0.5) * maxDisplacement * 0.5;
          const translateX = (Math.random() - 0.5) * maxDisplacement;

          element.style.transform = `translateX(${translateX}px) skewX(${skewX}deg)`;

          // Sudden cuts back to normal - no smooth transitions
          setTimeout(
            () => {
              element.style.transform = "translateX(0) skewX(0)";
            },
            Math.random() * 100 + 50
          );
        }
      },
      200 + Math.random() * 400
    );

    return () => clearInterval(glitchInterval);
  }, [displacement, phase]);

  // Progressive brightness increase through phases
  const getBrightness = () => {
    switch (phase) {
      case 1:
        return "brightness(0)";
      case 2:
        return "brightness(0.6) contrast(1.5) saturate(0)";
      case 3:
        return "brightness(0.8) contrast(1.3) saturate(0)";
      case 4:
        return "brightness(0.9) contrast(1.2) saturate(0)";
      default:
        return "brightness(0)";
    }
  };

  return (
    <motion.div
      ref={containerRef}
      animate={{
        filter: getBrightness(),
      }}
      className="relative w-full max-w-[200px] mx-auto"
      initial={{ filter: "brightness(0) contrast(2)" }}
      transition={{ duration: 0.1, ease: "linear" }}
    >
      {/* Main logo - mobile first sizing with better visibility */}
      <div className="relative w-full aspect-square">
        <Image
          fill
          priority
          alt=""
          className="object-contain filter grayscale contrast-150"
          sizes="(max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
          src="/images/KijayLogo.jpg"
          style={{
            imageRendering: "pixelated",
          }}
        />

        {/* Compression artifacts overlay - lighter on mobile */}
        <div
          className="absolute inset-0 bg-[#1A1A1A] mix-blend-multiply opacity-60 md:opacity-80"
          style={{
            background: `repeating-linear-gradient(
              0deg, 
              transparent, 
              transparent 3px, 
              rgba(26, 26, 26, 0.3) 3px, 
              rgba(26, 26, 26, 0.3) 6px
            )`,
          }}
        />

        {/* Data corruption blocks - smaller on mobile */}
        {phase >= 3 && (
          <>
            <div
              className="absolute bg-black opacity-70 md:opacity-90"
              style={{
                left: "20%",
                top: "10%",
                width: "25%",
                height: "15%",
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
              }}
            />
            <div
              className="absolute bg-[#2A2A2A] opacity-40 md:opacity-60"
              style={{
                right: "15%",
                bottom: "25%",
                width: "20%",
                height: "25%",
              }}
            />
          </>
        )}

        {/* Minimal chromatic aberration - only in system failure, reduced on mobile */}
        {phase >= 3 && (
          <div
            className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-10 md:opacity-20"
            style={{
              transform: `translateX(${displacement * 0.05}px)`,
            }}
          />
        )}
      </div>

      {/* No decorative shadows - harsh digital edge only */}
    </motion.div>
  );
}
