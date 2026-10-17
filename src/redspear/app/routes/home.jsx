import { useEffect, useRef, useState } from "react";
import fontStylesheet from "./home-fonts.css?url";
import "./home.css";

const RED_WORDMARK = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1784674743/Red_Spear_Wordmark_Red_488735c440.png";
const BLACK_WORDMARK = "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1784677508/Red_Spear_Wordmark_Black_006851c7de.png";

export function links() {
  return [
    { rel: "preconnect", href: "https://res.cloudinary.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous",
      href: "https://fonts.gstatic.com/s/vt323/v18/pxiKyp0ihIEF2isfFJXUdVNF.woff2", fetchPriority: "high" },
    { rel: "stylesheet", href: fontStylesheet },
  ];
}

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
  const [wordmarkReady, setWordmarkReady] = useState(false);
  const [wordmarkFailed, setWordmarkFailed] = useState(false);
  const enterTimer = useRef(null);
  const wordmark = useRef(null);

  useEffect(() => () => clearTimeout(enterTimer.current), []);

  const handleWordmarkLoad = async (event) => {
    try {
      await event.currentTarget.decode();
    } catch {
      // A text wordmark keeps the hub usable if decoding fails.
      setWordmarkFailed(true);
    }
    setWordmarkReady(true);
  };

  useEffect(() => {
    // Cached images can finish before hydration attaches the load handler.
    if (wordmark.current?.complete) {
      if (wordmark.current.naturalWidth) handleWordmarkLoad({ currentTarget: wordmark.current });
      else { setWordmarkFailed(true); setWordmarkReady(true); }
    }
  }, []);

  const handleEnter = () => {
    if (!wordmarkReady || fadingOut) return;
    setFadingOut(true);
    enterTimer.current = setTimeout(() => {
      setEntered(true);
      logInterceptTransmission();
    }, 500);
  };

  return (
    <div className={`rs-page${fadingOut || entered ? " rs-active" : ""}`}>
      {/* Hub — always mounted; the splash overlays on top of it until entered */}
      <div id="rs-hub" inert={!entered} className="relative flex min-h-dvh w-full items-center justify-center">
        <div className="rs-vhs-wrap w-full max-w-[1200px] px-5">
          {/* React 19 emits image preloads into the SSR head for both wordmarks. */}
          {wordmarkFailed ? <h1 className="rs-wordmark-fallback">Red Spear</h1> : (
            <img ref={wordmark} src={RED_WORDMARK} alt="Red Spear" width={1920} height={1080}
              onLoad={handleWordmarkLoad}
              onError={() => { setWordmarkFailed(true); setWordmarkReady(true); }} />
          )}
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
              src={BLACK_WORDMARK}
              width={1920} height={1080} fetchPriority="high"
              alt="Red Spear"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center px-5">
            <button id="rs-enter-button" onClick={handleEnter} disabled={!wordmarkReady || fadingOut}>
              {wordmarkReady ? "Enter" : "Loading…"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
