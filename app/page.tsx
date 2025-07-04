"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import SwipeableLayout from "@/components/SwipeableLayout";
import AudioPlayerSection from "@/components/AudioPlayerSection";
import LinksSection from "@/components/LinksSection";
import EntranceAnimation from "@/components/EntranceAnimation";

export default function Home() {
  const [showEntrance, setShowEntrance] = useState(true);

  const handleEntranceComplete = () => {
    setShowEntrance(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showEntrance && (
          <EntranceAnimation
            key="entrance"
            onComplete={handleEntranceComplete}
          />
        )}
      </AnimatePresence>

      {!showEntrance && (
        <SwipeableLayout
          sections={[
            <AudioPlayerSection key="audio" />,
            <LinksSection key="links" />,
          ]}
        />
      )}
    </>
  );
}
