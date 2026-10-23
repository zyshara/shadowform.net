// src/domeofdoom/Layout.jsx

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import DODBadge from "@/components/DODBadge";
import { colors } from "@/tokens";
import { useScrollToTop } from "@shared/hooks/useScrollToTop";

const SIDEBAR_TEXT = " DOMEOFDOOM · 15 Year Anniversary · ";
const SIDEBAR_REPEAT = 3;

function SidebarMarquee({ color }) {
  const firstRef = useRef(null);
  const [shift, setShift] = useState(null);

  useLayoutEffect(() => {
    const el = firstRef.current;
    if (!el) return;
    const measure = () => setShift(el.getBoundingClientRect().height);
    measure();
    document.fonts?.ready?.then(measure);
  }, []);

  const textStyle = {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    fontFamily: "'Archivo', sans-serif",
    fontStretch: "125%",
    fontWeight: 400,
    fontSize: 25,
    letterSpacing: "-1px",
    textTransform: "uppercase",
    color,
    whiteSpace: "nowrap",
    display: "block",
  };

  const content = Array.from({ length: SIDEBAR_REPEAT }, (_, i) => (
    <span key={i}>{SIDEBAR_TEXT}</span>
  ));

  return (
    <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
      <div
        style={{
          animationName: "marquee-vertical",
          animationDuration: "18s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          willChange: "transform",
          ...(shift ? { "--marquee-v-shift": `-${shift}px` } : {}),
        }}
      >
        <span ref={firstRef} style={textStyle}>{content}</span>
        <span aria-hidden="true" style={textStyle}>{content}</span>
      </div>
    </div>
  );
}

const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`;
const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(grainSvg)}")`;

// Chrome restores the previous scroll position on reload *before* React
// mounts, which — combined with the slide-up entrance — briefly left the
// hero's top line tucked behind the sticky nav until our own reset ran.
// Disabling it means every load starts genuinely at the top.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const Layout = () => {
  const location = useLocation();
  // Captured as a value (not rendered as <Outlet/>) so the exiting page's
  // motion.div keeps showing its own already-resolved content while it
  // fades out — <Outlet/> subscribes to router context directly, so used
  // inline it would snap to the new route's content immediately, even
  // inside a motion.div that's still mid exit-animation.
  const element = useOutlet();

  useScrollToTop(location.pathname);


  return (
    <div className="min-h-dvh w-full bg-dod-black text-dod-white grid grid-cols-6 grid-rows-[auto_1fr_auto]">
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundImage: grainUrl,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          mixBlendMode: "difference",
          opacity: 0.13,
          pointerEvents: "none",
        }}
      />
      <Navbar />
      {/* Outgoing and incoming pages animate at the same time: the exiting
          page is pulled out of normal flow (position: absolute, via its
          `exit` variant) so it can fade in place as an overlay while the
          incoming page — still in normal flow, so it drives real page
          height/scroll — slides up underneath/over it. The relative
          wrapper gives that absolutely-positioned exit something to
          anchor to.

          px-8 lives on the motion.div itself, not this wrapper - an
          absolutely-positioned child's left/right: 0 (the exit variant)
          aligns to the parent's padding-BOX edge, i.e. it ignores the
          parent's own padding and spans full width. Keeping the padding
          on the animated element itself means both the normal-flow
          entering page and the absolutely-positioned exiting page get
          the same inset regardless of which positioning mode they're in. */}
      {/* Vertical sidebar — lg+ only, fixed to left edge */}
      <div
        className="hidden lg:flex"
        style={{
          position: "fixed", top: 0, left: 0,
          height: "100%", width: "100%", maxWidth: 40,
          background: "var(--dod-lilac)",
          zIndex: 10,
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 10,
          paddingTop: 40,
          borderRight: "2px solid var(--dod-neon-mint)",
          opacity: 0.9,
        }}
      >
        {/* Top quatrefoil — absolute so it doesn't push the marquee down */}
        <svg width="40" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          style={{ background: "var(--dod-neon-mint)", padding: 3, display: "block", position: "absolute", top: 0, flexShrink: 0 }}>
          <g fill="var(--dod-deep-purple)">
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" />
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(90 30 30)" />
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(180 30 30)" />
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(270 30 30)" />
          </g>
        </svg>

        {/* Vertical marquee — fills remaining space */}
        <SidebarMarquee color="var(--dod-neon-mint)" />

        {/* Bottom quatrefoil */}
        <svg width="40" height="40" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          style={{ background: "var(--dod-neon-mint)", padding: 3, flexShrink: 0 }}>
          <g fill="var(--dod-deep-purple)">
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" />
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(90 30 30)" />
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(180 30 30)" />
            <path d="M30 30 L37.99 17.66 A9.5 9.5 0 1 0 22.01 17.66 Z" transform="rotate(270 30 30)" />
          </g>
        </svg>
      </div>

      <div className="relative col-start-1 col-span-6 lg:col-span-4 lg:col-start-2" style={{ overflow: "hidden" }}>
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            className="px-8 lg:px-0"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, position: "absolute", top: 0, left: 0, right: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {element}
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
      <div className="fixed bottom-6 right-6 z-50">
        <DODBadge color="var(--dod-neon-mint)" />
      </div>
    </div>
  );
};

export default Layout;
