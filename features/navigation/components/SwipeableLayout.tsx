"use client";

import { useState, ReactNode, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

interface SwipeableLayoutProps {
  sections: ReactNode[];
}

export default function SwipeableLayout({ sections }: SwipeableLayoutProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef(null);

  // Handle swipe gestures
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 100; // Minimum swipe distance to trigger a change

    if (
      info.offset.y < -swipeThreshold &&
      currentSection < sections.length - 1
    ) {
      // Swipe up - go to next section
      setDirection(1);
      setCurrentSection((prev) => prev + 1);
    } else if (info.offset.y > swipeThreshold && currentSection > 0) {
      // Swipe down - go to previous section
      setDirection(-1);
      setCurrentSection((prev) => prev - 1);
    }
  };

  // Nav dots component
  const NavDots = () => (
    <div className="fixed bottom-12 right-4 flex flex-col gap-2 z-50">
      {sections.map((_, index) => (
        <button
          key={index}
          aria-label={`Go to section ${index + 1}`}
          className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 shadow-md ${
            index === currentSection
              ? "bg-white drop-shadow-lg scale-125"
              : "bg-white/60 hover:bg-white/90"
          }`}
          onClick={() => {
            setDirection(index > currentSection ? 1 : -1);
            setCurrentSection(index);
          }}
        />
      ))}
    </div>
  );

  // Swipe indicator (shown with different icons based on position)
  const SwipeIndicator = () => (
    <>
      {currentSection < sections.length - 1 && (
        <motion.div
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 text-white bg-black/30 shadow-lg rounded-full p-2 backdrop-blur-md"
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <FaChevronUp className="md:text-xl" size={16} />
        </motion.div>
      )}

      {currentSection > 0 && (
        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 text-white bg-black/30 shadow-lg rounded-full p-2 backdrop-blur-md"
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <FaChevronDown className="md:text-xl" size={16} />
        </motion.div>
      )}
    </>
  );

  const variants = {
    enter: (direction: number) => {
      return {
        y: direction > 0 ? "100vh" : "-100vh",
        opacity: 0,
      };
    },
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        y: direction < 0 ? "100vh" : "-100vh",
        opacity: 0,
      };
    },
  };

  return (
    <div
      ref={constraintsRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.div
          key={currentSection}
          animate="center"
          className="absolute top-0 left-0 w-full h-full p-0 flex items-center justify-center"
          custom={direction}
          drag="y"
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          exit="exit"
          initial="enter"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          variants={variants}
          onDragEnd={handleDragEnd}
        >
          {sections[currentSection]}
        </motion.div>
      </AnimatePresence>

      <NavDots />
      <SwipeIndicator />
    </div>
  );
}
