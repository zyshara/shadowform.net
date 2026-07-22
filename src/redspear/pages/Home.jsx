import React, { useState } from "react";
import { useFavicon } from "@shared/hooks/useFavicon";
import "./Home.css";

// ── Data ──────────────────────────────────────────────────────────────────────
const LINKS = [
  { label: "Spotify",              url: "https://open.spotify.com/artist/4qeN30ffnbXLAjSAMwGpFv" },
  { label: "Soundcloud",           url: "https://soundcloud.com/redspear" },
  { label: "Instagram",            url: "https://instagram.com/redspearmusic" },
  { label: "Monitored Frequencies",url: "https://open.spotify.com/playlist/6bR12777gXAH2MyHmAcSi4?si=49g8sYt_R2qNng78P6TFzQ", small: true },
];

// ── ARG console easter egg (ported from the original inline script) ──────────
function logInterceptTransmission() {
  console.log("%c ", "font-size:1px");
  console.log("%cTRANSMISSION INTERCEPT — RED_SPEAR_TERMINAL", "color:#ff0000; font-family:monospace; font-size:13px; font-weight:bold;");
  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color:#440000; font-size:11px;");
  console.log("%cSTATUS      : HANDLER CREDENTIALS LOCATED", "color:#ff0000; font-family:monospace; font-size:12px;");
  console.log("%cSECURITY    : COMPROMISED", "color:#ff0000; font-family:monospace; font-size:12px;");
  console.log("%cKEY         : ae#%^Sufua8sa9strinity934", "color:#ff0000; font-family:monospace; font-size:12px;");
  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color:#440000; font-size:11px;");
  console.log("%cHANDLER NAME IS ELSEWHERE. LOOK HARDER.", "color:rgba(255,0,0,0.4); font-family:monospace; font-size:11px;");
  console.log("%c ", "font-size:1px");
}

export default function Home() {
  const [entered, setEntered]     = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useFavicon("https://res.cloudinary.com/dfeyhbxeg/image/upload/v1775258559/redspear_icon_49596002d5.png");

  const handleEnter = () => {
    setFadingOut(true);
    setTimeout(() => {
      setEntered(true);
      logInterceptTransmission();
    }, 500);
  };

  return (
    <div className="rs-page">
      {/* Hub — always mounted; the splash overlays on top of it until entered */}
      <div id="rs-hub" className="relative flex min-h-dvh w-full items-center justify-center">
        <div className="rs-vhs-wrap w-full max-w-[1200px] px-5">
          <img src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1784674743/Red_Spear_Wordmark_Red_488735c440.png" alt="Red Spear" />
          <div className="rs-vhs-scanlines" />
          <div className="rs-vhs-noise" />
        </div>

        <div className="rs-vhs-tracking" />

        <div className="absolute bottom-10 left-0 right-0 flex flex-col md:flex-row flex-wrap items-center justify-center gap-3.5 px-5">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className={link.small ? "rs-hub-link rs-hub-link-sm" : "rs-hub-link"}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Splash overlay — same layout as the hub, black wordmark, fades to reveal it */}
      {!entered && (
        <div id="rs-splash-screen" className={fadingOut ? "rs-fade-out" : ""}>
          <div className="w-full max-w-[1200px] px-5">
            <img
              src="https://res.cloudinary.com/dfeyhbxeg/image/upload/v1784677508/Red_Spear_Wordmark_Black_006851c7de.png"
              alt="Red Spear"
              style={{ width: "100%", display: "block" }}
            />
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center px-5">
            <button id="rs-enter-button" onClick={handleEnter}>Enter</button>
          </div>
        </div>
      )}
    </div>
  );
}
