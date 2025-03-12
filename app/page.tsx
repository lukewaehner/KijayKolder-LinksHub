"use client";

import { motion } from "framer-motion";
import { Avatar } from "@nextui-org/avatar";
import { Card, CardBody } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { FaSoundcloud, FaApple, FaSpotify } from "react-icons/fa";

import BackgroundMusic from "@/components/BackgroundMusic";

const tracks = [
  "/audio/WAYTOOLONG.m4a",
  "/audio/NOPROBLEM.m4a",
  "/audio/DOITYOURSELF.m4a",
  "/audio/LIVE&LEARN.m4a",
];

const links = [
  {
    href: "https://soundcloud.com/kijaykolder",
    text: "Soundcloud",
    icon: FaSoundcloud({ className: "text-2xl", style: { color: "#ff5500" } }),
  },
  {
    href: "https://music.apple.com/us/artist/kijaykolder/1763659673",
    text: "Apple Music",
    icon: FaApple({ className: "text-2xl" }),
  },
  {
    href: "https://open.spotify.com/artist/0pwdYKtGd5acBMWjzC8HKP?si=Y3-KilG_RTS83OcevqPi4w&nd=1&dlsi=4d84308ed87945da",
    text: "Spotify",
    icon: FaSpotify({ className: "text-2xl", style: { color: "#1db954" } }),
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Main Content Container */}
      <div className="relative p-8 py-12 backdrop-blur-[10px] rounded-xl border border-gray-300/[0.15] shadow-md w-full max-w-md z-10">
        {/* Content */}
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Animated Card */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card className="px-4 rounded-lg shadow-lg border-4 border-gray-50/[0.2]">
              <CardBody>
                <h1 className="text-2xl text-zinc-800 font-semibold">
                  KijayKolder
                </h1>
              </CardBody>
            </Card>
          </motion.div>

          {/* Animated Avatar */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Avatar
              isBordered
              className="w-32 h-32 text-large filter drop-shadow-2xl"
              name="KiJay"
              src="/images/KijayLogo.jpg"
              style={{ objectFit: "fill" }}
            />
          </motion.div>

          {/* Animated Background Music Component */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
          >
            <BackgroundMusic tracks={tracks} />
          </motion.div>

          {/* Animated Links Container */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            {/* Flex column layout for links */}
            {links.map((link, index) => (
              <motion.div
                key={index}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.6,
                  delay: 1 + index * 0.2,
                  ease: "easeOut",
                }}
              >
                {/* Flex row layout for icon and text */}
                <Link href={link.href}>
                  <Card className="rounded-full px-3 flex items-center gap-2">
                    <CardBody className="min-w-44">
                      <div className="flex items-center gap-2">
                        {/* Flex row layout for icon and text */}
                        {link.icon}
                        <h2 className="text-xl text-black font-semibold">
                          {link.text}
                        </h2>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
