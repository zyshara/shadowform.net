// src/domeofdoom/Layout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import { colors } from "@/tokens";

const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/></filter><rect width="256" height="256" filter="url(#n)"/></svg>`;
const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(grainSvg)}")`;

const Layout = () => {
  return (
    <div className="min-h-dvh w-full" style={{ background: colors.bg, color: colors.text }}>
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
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />
      <div className="sticky top-0 z-50">
        <MarqueeBanner />
        <Navbar />
      </div>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
