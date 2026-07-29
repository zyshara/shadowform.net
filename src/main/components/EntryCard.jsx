// src/main/components/EntryCard.jsx

import { useState } from "react";
import Tag from "@/components/Tag";
import Modal from "@/components/Modal";

// ── Drawing Lightbox (desktop only) ──────────────────────────────────────────
const DrawingLightbox = ({ src, onClose }) => (
  <Modal onClose={onClose} maxWidth={600}>
    <div style={{ display:"flex", justifyContent:"flex-end", padding:"6px 10px", background:"var(--bg-ticker)", borderBottom:"1px solid var(--border-soft)" }}>
      <button onClick={onClose} style={{ color:"var(--text-nav-inactive)", background:"none", border:"none", cursor:"pointer", fontFamily:"monospace", fontSize:14 }}>✕</button>
    </div>
    <img
      src={src}
      alt="drawing"
      style={{ width:"100%", display:"block", borderRadius:0, background:"var(--bg-sidebar)", border:"none" }}
    />
  </Modal>
);

// ── Entry Card ────────────────────────────────────────────────────────────────
const EntryCard = ({ entry, className = "" }) => {
  const [lightbox,    setLightbox]    = useState(false);
  const [thumbHover,  setThumbHover]  = useState(false);

  return (
    <>
      <style>{`
        @keyframes entry-website-rainbow {
          0%    { color: #ff4d4d; } /* red */
          12.5% { color: #ff9933; } /* orange */
          25%   { color: #ffe066; } /* yellow */
          37.5% { color: #4ade80; } /* green */
          50%   { color: #22d3ee; } /* cyan */
          62.5% { color: #4d94ff; } /* blue */
          75%   { color: #a855f7; } /* purple */
          87.5% { color: #f43f9e; } /* magenta */
          100%  { color: #ff4d4d; } /* back to red */
        }
        .entry-website-rainbow {
          animation: entry-website-rainbow 8s linear infinite;
        }
      `}</style>

      {lightbox && entry.drawing && (
        <DrawingLightbox src={entry.drawing} onClose={() => setLightbox(false)} />
      )}

      <div
        className={`flex items-start gap-4 p-4 border rounded-[2px] ${className}`}
        style={{ background:"var(--bg-ticker)", borderColor:"var(--border-soft)" }}
      >
        {/* desktop thumbnail — clickable to open lightbox */}
        <div
          className="hidden sm:flex w-40 h-30 flex-shrink-0 items-center justify-center rounded-[2px] border overflow-hidden"
          style={{
            background:  "var(--bg-sidebar)",
            borderColor: entry.drawing && thumbHover ? "var(--tag-lit-border)" : "var(--border)",
            cursor:      entry.drawing ? "pointer" : "default",
            transition:  "border-color 150ms ease-out",
          }}
          onClick={() => entry.drawing && setLightbox(true)}
          onMouseEnter={() => entry.drawing && setThumbHover(true)}
          onMouseLeave={() => setThumbHover(false)}
        >
          {entry.drawing
            ? <img
                src={entry.drawing}
                alt="doodle"
                className="w-full h-full object-contain"
                style={{ filter: thumbHover ? "brightness(1.15)" : "none", transition: "filter 150ms ease-out" }}
              />
            : <span className="font-alagard text-[18px]" style={{ color:"var(--ornament-glyph)" }}>✿</span>
          }
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* name + date */}
          <div className="flex flex-col">
          <div className="flex items-start justify-between flex-col sm:flex-row flex-col-reverse sm:flex-col gap-1">
            <h3 className="font-alagard text-[18px] tracking-[1px] leading-tight lowercase" style={{ color:"var(--text-heading)" }}>
              {entry.name}
            </h3>
            <span className="font-alkhemikal text-[12px] tracking-[0.15em] uppercase self-end" style={{ color:"var(--text-nav-inactive)" }}>
              {entry.date}
            </span>
          </div>

          {/* website */}
          {entry.website && (
            <a href={entry.website} target="_blank" rel="noreferrer"
              className="font-alagard text-wrap break-words underline text-[11px] tracking-[0.15em] uppercase entry-website-rainbow md:hover:[animation:pink-rotate-text_100ms_linear_infinite]">{entry.website}</a>
          )}
          </div>

          {/* tags */}
          {entry.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {entry.tags.map((t) => (
                <Tag key={t.label} theme={t.theme} variant="lit">{t.label}</Tag>
              ))}
            </div>
          )}

          {/* message */}
          {entry.message && (
            <p className="font-fell text-[14px] leading-[1.75]" style={{ color:"var(--text-body)" }}>
              {entry.message}
            </p>
          )}

          {/* mobile drawing strip */}
          {entry.drawing && (
            <div
              className="sm:hidden w-full h-28 rounded-[2px] border overflow-hidden"
              style={{ background:"var(--bg-sidebar)", borderColor:"var(--border)" }}
            >
              <img src={entry.drawing} alt="doodle" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EntryCard;
