"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import SwipeableLayout from "@/components/SwipeableLayout";
import AudioPlayerSection from "@/components/AudioPlayerSection";
import LinksSection from "@/components/LinksSection";
import EntranceAnimation from "@/components/EntranceAnimation";

/**
 * Renders the main landing page with an optional entrance animation followed by
 * swipeable content sections.
 */
export default function Home() {
  const [showEntrance, setShowEntrance] = useState(true);

  /** Handles the completion of the intro animation by revealing the main UI. */
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
            <LinksSection key="links" />,
            <AudioPlayerSection key="audio" />,
          ]}
        />
      )}
    </>
  );
}
