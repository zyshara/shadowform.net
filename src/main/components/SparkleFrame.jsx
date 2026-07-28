import React from "react";

/**
 * SparkleFrame
 * Wraps any card/content with 5 twinkling corner sparkles (1:1 stars,
 * no rotation — scale + opacity only).
 *
 * Usage:
 *   <SparkleFrame>
 *     <YourCard />
 *   </SparkleFrame>
 *
 * Note: this component renders its own <style> tag with the keyframes
 * so it works as a drop-in file with no extra CSS setup. If you use
 * SparkleFrame many times on one page, consider moving the
 * `@keyframes sparkle-frame-twinkle` rule into your global stylesheet
 * instead, so it's not duplicated once per instance.
 */

const SPARKLES = [
  { top: "-6px", left: "-6px", size: 16, delay: "0s" },
  { top: "-8px", left: "calc(100% - 24px)", size: 8, delay: "-0.7s" },
  { top: "calc(100% - 6px)", left: "calc(100% - 6px)", size: 12, delay: "-1.4s" },
  { top: "30%", left: "calc(100% - 8px)", size: 8, delay: "-2.1s" },
  { top: "calc(80% - 12px)", left: "-8px", size: 12, delay: "-1.9s" },
];

export default function SparkleFrame({
  children,
  color = "#d9bfe8",
  glowColor = "#9a5cd0",
  className = "",
  style = {},
}) {
  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {children}

      {SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: color,
            clipPath:
              "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
            filter: `drop-shadow(0 0 4px ${glowColor})`,
            pointerEvents: "none",
            animation: "sparkle-frame-twinkle 2.6s ease-in-out infinite",
            animationDelay: s.delay,
          }}
        />
      ))}

      <style>{`
        @keyframes sparkle-frame-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
