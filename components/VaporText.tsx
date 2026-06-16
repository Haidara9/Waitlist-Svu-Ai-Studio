"use client";

import { useState, useEffect } from "react";

interface VaporTextProps {
  texts: string[];
  className?: string;
  interval?: number;
}

export function VaporText({
  texts,
  className = "",
  interval = 4000,
}: VaporTextProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      setAnimationKey((prev) => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  const currentText = texts[currentIndex] ?? "";

  return (
    <>
      <style>{`
        @keyframes vapor-materialize {
          0% {
            opacity: 0;
            filter: blur(12px);
            transform: translateY(6px) scale(0.98);
          }
          20% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0) scale(1);
          }
          80% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            filter: blur(12px);
            transform: translateY(-6px) scale(0.98);
          }
        }
      `}</style>
      <span
        key={animationKey}
        className={className}
        aria-label={currentText}
        style={{
          display: "inline-block",
          font: "inherit",
          animation: `vapor-materialize ${interval}ms ease-in-out forwards`,
          textShadow: "0 0 12px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.15)",
          willChange: "opacity, filter, transform",
        }}
      >
        {currentText}
      </span>
    </>
  );
}
