"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const backgroundImages = [
  "/images/img1.webp",
  "/images/img2.webp",
  "/images/img3.webp",
];

export default function RotatingBackground() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isFadingToBlack, setIsFadingToBlack] = useState(false);
  const [isFadingFromBlack, setIsFadingFromBlack] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Start fading to black
      setIsFadingToBlack(true);

      // After 400ms, start fading from black to next image
      setTimeout(() => {
        setIsFadingToBlack(false);
        setIsFadingFromBlack(true);
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % backgroundImages.length);
      }, 400);

      // After another 400ms, finish the transition
      setTimeout(() => {
        setIsFadingFromBlack(false);
      }, 800);
    }, 7500); // Time each image is displayed

    return () => clearInterval(intervalId);
  }, [nextImageIndex]);

  return (
    <div className="absolute inset-0 z-0">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-400 ${
          isFadingToBlack ? "opacity-100" : "opacity-0"
        } ${isFadingFromBlack ? "opacity-100" : "opacity-0"}`}
      />
      {backgroundImages.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Background ${index + 1}`}
          fill
          className={`object-cover transition-opacity duration-400 brightness-50 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
          quality={100}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
