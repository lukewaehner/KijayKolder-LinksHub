"use client";

import type { IconType, IconBaseProps } from "react-icons";
import type { CSSProperties } from "react";

import { FaSoundcloud, FaApple, FaSpotify, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { useState, useEffect, useRef } from "react";

// Include any existing links and add more
const links = [
  {
    id: "soundcloud",
    href: "https://soundcloud.com/kijaykolder",
    text: "Soundcloud",
    platform: "soundcloud",
  },
  {
    id: "apple",
    href: "https://music.apple.com/us/artist/kijaykolder/1763659673",
    text: "Apple Music",
    platform: "apple",
  },
  {
    id: "spotify",
    href: "https://open.spotify.com/artist/0pwdYKtGd5acBMWjzC8HKP",
    text: "Spotify",
    platform: "spotify",
  },
  {
    id: "instagram",
    href: "https://instagram.com/kijaykolder",
    text: "Instagram",
    platform: "instagram",
  },
];

// Helper to map platform string to proper icons with dark styling
const getPlatformIcon = (
  platform: string,
  isGlitching: boolean
): JSX.Element => {
  const glitchStyle: CSSProperties = isGlitching
    ? { filter: "hue-rotate(180deg) contrast(2)" }
    : {};

  const iconProps: IconBaseProps = {
    className: "text-xl text-[#F0F0F0]",
    style: glitchStyle,
    size: 20,
  };

  // Initialize with a default so TS knows it's always set
  let IconComponent: IconType = FaSpotify;

  switch (platform.toLowerCase()) {
    case "soundcloud":
      IconComponent = FaSoundcloud;
      break;
    case "apple":
      IconComponent = FaApple;
      break;
    case "spotify":
      IconComponent = FaSpotify;
      break;
    case "instagram":
      IconComponent = FaInstagram;
      break;
    // no need for default now since we initialized above
  }

  return <IconComponent {...iconProps} />;
};

export default function LinksSection() {
  const [sectionGlitch, setSectionGlitch] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Section-specific glitch effects
  useEffect(() => {
    const glitchInterval = setInterval(
      () => {
        setSectionGlitch(true);
        setTimeout(() => setSectionGlitch(false), 200);
      },
      12000 + Math.random() * 18000
    ); // Random interval 12-30 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle static background */}
      <SubtleStatic />

      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
          mixBlendMode: "overlay",
        }}
      />

      <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto px-4 py-6 md:p-0 relative z-10">
        {/* Section-wide glitch overlay */}
        {sectionGlitch && (
          <div
            className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-10 pointer-events-none z-10"
            style={{
              clipPath: "polygon(0 25%, 100% 20%, 100% 80%, 0 85%)",
            }}
          />
        )}

        {/* Terminal-style header */}
        <motion.div
          animate={{
            opacity: 1,
            filter: sectionGlitch
              ? "contrast(1.5) brightness(1.2)"
              : "contrast(1) brightness(1)",
          }}
          className="mb-6 relative z-20"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "linear" }}
        >
          <div className="border border-[#2A2A2A] bg-[#0A0A0A]/90 px-4 py-2 backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-1 mb-2">
              <span className="text-xs font-mono text-[#F0F0F0]">
                &gt; EXTERNAL_LINKS
              </span>
              <span className="text-xs font-mono text-[#555555]">v2.1</span>
            </div>
            <h2
              className={`text-lg md:text-xl font-mono font-bold uppercase tracking-wider text-center text-[#F0F0F0] ${
                sectionGlitch ? "glitch-text" : ""
              }`}
            >
              CONNECT_WITH_ME
            </h2>
          </div>
        </motion.div>

        {/* Links with dark terminal styling */}
        <div className="flex flex-col gap-3 w-full relative z-20">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.3,
                delay: 0.1 + index * 0.1,
                ease: "linear",
              }}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Link className="w-full" href={link.href}>
                <Card
                  className={`w-full bg-[#1A1A1A]/95 border border-[#2A2A2A] hover:border-[#8B0000] transition-none backdrop-blur-sm relative overflow-hidden ${
                    hoveredLink === link.id ? "link-hover" : ""
                  }`}
                >
                  {/* Hover glitch effect */}
                  {hoveredLink === link.id && (
                    <div
                      className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-15 pointer-events-none"
                      style={{
                        clipPath: "polygon(0 30%, 100% 25%, 100% 75%, 0 80%)",
                      }}
                    />
                  )}

                  {/* Compression artifacts */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                    style={{
                      background: `repeating-linear-gradient(
                        ${Math.random() * 360}deg, 
                        transparent, 
                        transparent 6px, 
                        rgba(0, 0, 0, 0.2) 6px, 
                        rgba(0, 0, 0, 0.2) 12px
                      )`,
                    }}
                  />

                  <CardBody className="py-3 px-4 relative z-10">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(link.platform, hoveredLink === link.id)}
                      <div className="flex-1">
                        <h2
                          className={`text-sm md:text-base font-mono font-bold uppercase tracking-wider text-[#F0F0F0] ${
                            hoveredLink === link.id ? "glitch-text" : ""
                          }`}
                        >
                          {link.text.toUpperCase()}
                        </h2>
                        <div className="text-xs font-mono text-[#555555] mt-1">
                          PLATFORM: {link.platform.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-xs font-mono text-[#8B0000]">
                        &gt;
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Global styles for glitch effects */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .glitch-text {
              animation: glitch-text 0.3s ease-in-out;
            }
            
            .link-hover {
              animation: link-hover 0.2s ease-in-out;
            }
            
            @keyframes glitch-text {
              0% { transform: translateX(0); }
              20% { transform: translateX(-1px) skew(-0.5deg); }
              40% { transform: translateX(1px) skew(0.5deg); }
              60% { transform: translateX(-0.5px) skew(-0.25deg); }
              80% { transform: translateX(0.5px) skew(0.25deg); }
              100% { transform: translateX(0); }
            }
            
            @keyframes link-hover {
              0% { filter: contrast(1) brightness(1); }
              50% { filter: contrast(1.3) brightness(1.1); }
              100% { filter: contrast(1) brightness(1); }
            }
          `,
          }}
        />
      </div>
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
