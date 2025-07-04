import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

import SongPreview from "@/features/audio-player/components/SongPreview";
import { Track } from "@/shared/lib/data/service";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

interface TracksSectionProps {
  tracks: Track[];
  isActive: boolean;
  stopPropagation?: boolean;
}

const TracksSection: React.FC<TracksSectionProps> = ({
  tracks,
  isActive,
  stopPropagation,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

  // Handle touch events to stop propagation if needed
  const handleTouch = (e: React.TouchEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  // Refs to store active audio player and its playing state
  const activePlayerRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingRef = useRef<boolean>(false);

  // Simplified bounce animation for performance
  const bounceAnimation = isLargeScreen
    ? { opacity: [0.6, 1, 0.6] } // Reduced animation on large screens
    : { y: [0, -10, 0], opacity: [0.6, 1, 0.6] };

  // Detect screen size for optimization
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1200 || window.innerHeight > 900);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Handle track change in the swiper
  const handleSlideChange = (swiper: any) => {
    setCurrentTrackIndex(swiper.realIndex);

    // If we have an active player, pause it when changing tracks
    if (activePlayerRef.current) {
      activePlayerRef.current.pause();
      activePlayerRef.current = null;
      wasPlayingRef.current = false;
    }
  };

  // Register the active audio player
  const registerPlayer = (
    audioElement: HTMLAudioElement | null,
    isPlaying: boolean
  ) => {
    activePlayerRef.current = audioElement;
    wasPlayingRef.current = isPlaying;
  };

  // Effect to pause audio when section becomes inactive
  useEffect(() => {
    if (!isActive && activePlayerRef.current) {
      // Save the playing state so we know it was playing
      wasPlayingRef.current = !activePlayerRef.current.paused;

      // Pause the audio when section becomes inactive
      activePlayerRef.current.pause();
    }
  }, [isActive]);

  // Determine the effect to use based on screen size
  const cardEffect = isLargeScreen
    ? {
        slideShadows: false,
        perSlideRotate: 2, // Reduced rotation for performance
        perSlideOffset: 4, // Reduced offset for performance
      }
    : {
        slideShadows: false,
        perSlideRotate: 4,
        perSlideOffset: 8,
      };

  return (
    <div
      className="flex flex-col items-center h-[90vh] w-full max-w-md mx-auto"
      onTouchEnd={handleTouch}
      onTouchMove={handleTouch}
      onTouchStart={handleTouch}
    >
      {/* Title bar - we no longer need the track title here as it's extracted from metadata */}
      <div className="text-white text-center w-full">
        <h2
          className={`text-3xl font-bold ${isActive ? "text-white" : "text-gray-400"}`}
        >
          Latest Tracks
        </h2>
      </div>

      {/* Main content - track carousel */}
      <div className="flex-grow w-full flex items-center justify-center">
        {tracks.length > 0 ? (
          <Swiper
            cardsEffect={cardEffect}
            className="w-full max-w-sm"
            effect="cards"
            grabCursor={true}
            modules={[EffectCards]}
            observer={true}
            simulateTouch={true}
            touchRatio={isLargeScreen ? 0.8 : 1}
            watchSlidesProgress={isLargeScreen ? false : true}
            onSlideChange={handleSlideChange}
          >
            {tracks.map((track, index) => (
              <SwiperSlide
                key={track.id}
                className="rounded-lg overflow-hidden"
              >
                <SongPreview
                  displayTitleAndYear={true}
                  isLargeScreen={isLargeScreen}
                  isVisible={isActive && currentTrackIndex === index}
                  track={track}
                  onPlayerUpdate={registerPlayer}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-white text-center">No tracks available</div>
        )}
      </div>

      {/* Bottom navigation help and animated arrow */}
      <div className="text-white text-center my-3 w-full">
        <p>Swipe left/right to browse tracks</p>

        <motion.div
          animate={bounceAnimation}
          className="mt-2 flex flex-col items-center"
          transition={{
            duration: isLargeScreen ? 2 : 1.5, // Slower animation on large screens
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <p className="text-gray-300 mb-1">Swipe up to see more</p>
          <FaChevronDown className="text-white text-xl" />
        </motion.div>
      </div>
    </div>
  );
};

export default TracksSection;
