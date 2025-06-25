"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FaEnvelope, FaPhone, FaLocationArrow } from "react-icons/fa";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sectionGlitch, setSectionGlitch] = useState(false);

  // Section-specific glitch effects
  useEffect(() => {
    const glitchInterval = setInterval(
      () => {
        setSectionGlitch(true);
        setTimeout(() => setSectionGlitch(false), 200);
      },
      15000 + Math.random() * 20000
    ); // Random interval 15-35 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    // Here we would normally handle the form submission via API
    console.log("Form submitted", { name, email, message });

    // Show success state
    setSubmitted(true);

    // Reset form
    setName("");
    setEmail("");
    setMessage("");

    // Reset success message after delay
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dark overlay to make background video visible but darkened */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)",
        }}
      />

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

      <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto relative z-10 p-4">
        {/* Section-wide glitch overlay */}
        {sectionGlitch && (
          <div
            className="absolute inset-0 bg-[#8B0000] mix-blend-screen opacity-10 pointer-events-none z-10"
            style={{
              clipPath: "polygon(0 20%, 100% 25%, 100% 85%, 0 80%)",
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
          className="mb-6 w-full relative z-20"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "linear" }}
        >
          <div className="border border-[#2A2A2A] bg-[#0A0A0A]/90 px-4 py-2 backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-1 mb-2">
              <span className="text-xs font-mono text-[#F0F0F0]">
                &gt; CONTACT_INTERFACE
              </span>
              <span className="text-xs font-mono text-[#555555]">v1.8</span>
            </div>
            <h2
              className={`text-lg md:text-xl font-mono font-bold uppercase tracking-wider text-center text-[#F0F0F0] ${
                sectionGlitch ? "glitch-text" : ""
              }`}
            >
              GET_IN_TOUCH
            </h2>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 w-full mb-6 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "linear" }}
        >
          {/* Email */}
          <Card className="bg-[#1A1A1A]/95 border border-[#2A2A2A] hover:border-[#8B0000] transition-none backdrop-blur-sm relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
              style={{
                background: `repeating-linear-gradient(
                  45deg, 
                  transparent, 
                  transparent 4px, 
                  rgba(0, 0, 0, 0.1) 4px, 
                  rgba(0, 0, 0, 0.1) 8px
                )`,
              }}
            />
            <CardBody className="py-3 px-4 relative z-10">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-lg text-[#F0F0F0] group-hover:text-[#8B0000] transition-colors" />
                <div className="flex-1">
                  <div className="text-xs font-mono text-[#555555] mb-1">
                    PROTOCOL: SMTP
                  </div>
                  <a
                    className="text-sm md:text-base font-mono text-[#F0F0F0] hover:text-[#8B0000] transition-colors break-all"
                    href="mailto:kijaykolder@example.com"
                  >
                    kijaykolder@example.com
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Phone */}
          <Card className="bg-[#1A1A1A]/95 border border-[#2A2A2A] hover:border-[#8B0000] transition-none backdrop-blur-sm relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
              style={{
                background: `repeating-linear-gradient(
                  135deg, 
                  transparent, 
                  transparent 4px, 
                  rgba(0, 0, 0, 0.1) 4px, 
                  rgba(0, 0, 0, 0.1) 8px
                )`,
              }}
            />
            <CardBody className="py-3 px-4 relative z-10">
              <div className="flex items-center gap-3">
                <FaPhone className="text-lg text-[#F0F0F0] group-hover:text-[#8B0000] transition-colors" />
                <div className="flex-1">
                  <div className="text-xs font-mono text-[#555555] mb-1">
                    PROTOCOL: VOICE
                  </div>
                  <a
                    className="text-sm md:text-base font-mono text-[#F0F0F0] hover:text-[#8B0000] transition-colors"
                    href="tel:+1234567890"
                  >
                    (123) 456-7890
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Location */}
          <Card className="bg-[#1A1A1A]/95 border border-[#2A2A2A] hover:border-[#8B0000] transition-none backdrop-blur-sm relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
              style={{
                background: `repeating-linear-gradient(
                  225deg, 
                  transparent, 
                  transparent 4px, 
                  rgba(0, 0, 0, 0.1) 4px, 
                  rgba(0, 0, 0, 0.1) 8px
                )`,
              }}
            />
            <CardBody className="py-3 px-4 relative z-10">
              <div className="flex items-center gap-3">
                <FaLocationArrow className="text-lg text-[#F0F0F0] group-hover:text-[#8B0000] transition-colors" />
                <div className="flex-1">
                  <div className="text-xs font-mono text-[#555555] mb-1">
                    LOCATION: GPS
                  </div>
                  <span className="text-sm md:text-base font-mono text-[#F0F0F0]">
                    Los Angeles, CA
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Business Inquiry Terminal Block */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-6 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.4, ease: "linear" }}
        >
          <div className="border border-[#8B0000] bg-[#0A0A0A]/95 px-4 py-3 backdrop-blur-sm">
            <div className="flex justify-between items-center border-b border-[#8B0000] pb-2 mb-2">
              <span className="text-xs font-mono text-[#F0F0F0]">
                &gt; BUSINESS_INQUIRY
              </span>
              <span className="text-xs font-mono text-[#8B0000]">CRITICAL</span>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-xs font-mono text-[#F0F0F0] mb-1"
                  htmlFor="name"
                >
                  NAME_INPUT:
                </label>
                <Input
                  required
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-none"
                  classNames={{
                    input: "font-mono text-[#F0F0F0] bg-transparent",
                    inputWrapper:
                      "bg-[#1A1A1A] border-[#2A2A2A] rounded-none h-9",
                  }}
                  id="name"
                  placeholder="Enter identification..."
                  size="sm"
                  value={name}
                  variant="bordered"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-mono text-[#F0F0F0] mb-1"
                  htmlFor="email"
                >
                  EMAIL_ADDRESS:
                </label>
                <Input
                  required
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-none"
                  classNames={{
                    input: "font-mono text-[#F0F0F0] bg-transparent",
                    inputWrapper:
                      "bg-[#1A1A1A] border-[#2A2A2A] rounded-none h-9",
                  }}
                  id="email"
                  placeholder="contact@domain.ext"
                  size="sm"
                  type="email"
                  value={email}
                  variant="bordered"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-mono text-[#F0F0F0] mb-1"
                  htmlFor="message"
                >
                  MESSAGE_CONTENT:
                </label>
                <textarea
                  required
                  className="w-full font-mono text-[#F0F0F0] bg-[#1A1A1A] border border-[#2A2A2A] p-2 min-h-[80px] md:min-h-[100px] rounded-none resize-none focus:border-[#8B0000] focus:outline-none"
                  id="message"
                  placeholder="Enter your transmission..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-[#8B0000] hover:bg-[#A50000] text-[#F0F0F0] font-mono font-bold uppercase tracking-wider rounded-none border border-[#8B0000] transition-colors"
                size="sm"
                type="submit"
              >
                TRANSMIT_MESSAGE
              </Button>

              {submitted && (
                <div className="border border-[#008000] bg-[#0A0A0A]/95 px-3 py-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[#F0F0F0]">
                      &gt; TRANSMISSION_STATUS
                    </span>
                    <span className="text-xs font-mono text-[#008000]">
                      SUCCESS
                    </span>
                  </div>
                  <p className="text-sm font-mono text-[#F0F0F0] mt-1">
                    Message transmitted successfully.
                  </p>
                </div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Global styles for glitch effects */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .glitch-text {
              animation: glitch-text 0.3s ease-in-out;
            }
            
            @keyframes glitch-text {
              0% { transform: translateX(0); }
              20% { transform: translateX(-1px) skew(-0.5deg); }
              40% { transform: translateX(1px) skew(0.5deg); }
              60% { transform: translateX(-0.5px) skew(-0.25deg); }
              80% { transform: translateX(0.5px) skew(0.25deg); }
              100% { transform: translateX(0); }
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
