"use client";

import { useRef, useEffect, useCallback } from "react";

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function CompareSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Slide function using clip-path for smooth performance
  const slide = useCallback((x: number) => {
    if (!containerRef.current || !foregroundRef.current || !sliderRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const clampedX = Math.max(0, Math.min(x, containerWidth));
    const percentage = (clampedX / containerWidth) * 100;
    
    // Use clip-path for reveal effect
    foregroundRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    sliderRef.current.style.left = `${percentage}%`;
  }, []);

  // Get cursor position relative to container
  const getCursorPos = useCallback((e: MouseEvent | TouchEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    return clientX - rect.left;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const foreground = foregroundRef.current;
    const slider = sliderRef.current;
    
    if (!container || !foreground || !slider) return;

    // Set initial position to 50%
    foreground.style.clipPath = `inset(0 50% 0 0)`;
    slider.style.left = `50%`;

    let clicked = false;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      clicked = true;
      slide(getCursorPos(e));
    };

    const handleMouseUp = () => {
      clicked = false;
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!clicked) return;
      slide(getCursorPos(e));
    };

    // Attach events
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("touchstart", handleMouseDown, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
    };
  }, [slide, getCursorPos]);

  return (
    <div 
      className={`relative w-full select-none ${className}`}
      ref={containerRef}
      style={{ cursor: "ew-resize" }}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="block w-full h-auto max-h-[600px] object-contain mx-auto select-none pointer-events-none"
        draggable={false}
      />
      <span className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-xs font-semibold backdrop-blur-sm z-20">
        {afterLabel}
      </span>

      {/* Before Image (Foreground - Clipped) */}
      <div
        ref={foregroundRef}
        className="absolute inset-0 z-10"
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="block w-full h-auto max-h-[600px] object-contain mx-auto select-none pointer-events-none"
          draggable={false}
        />
        <span className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-xs font-semibold backdrop-blur-sm">
          {beforeLabel}
        </span>
      </div>

      {/* Slider Handle */}
      <div
        ref={sliderRef}
        className="absolute top-0 bottom-0 w-1 bg-white z-30 shadow-[0_0_8px_rgba(0,0,0,0.6)] -translate-x-1/2"
        style={{ left: "50%", cursor: "ew-resize" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

