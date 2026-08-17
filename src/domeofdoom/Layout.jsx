// src/domeofdoom/Layout.jsx

import { useLayoutEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import { colors } from "@/tokens";

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

  // useLayoutEffect (not useEffect) so this runs before paint — otherwise
  // the first frame can briefly show whatever scroll position the browser
  // restored.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
          anchor to. */}
      <div className="relative col-start-1 col-span-6 lg:col-span-4 lg:col-start-2 px-8 lg:px-0">
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: "100vh" }}
            animate={{ opacity: 1, y: 0, position: "relative", zIndex: 1 }}
            exit={{ opacity: 0, position: "absolute", zIndex: 0, top: 0, left: 0, right: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {element}
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
