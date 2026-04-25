// src/main/pages/EngineeringWebArchiveProjectRaw.jsx
// Full-screen preserved site viewer — no app chrome, just the site.
// Route: /engineering/archive/:slug/raw

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cherry_blossom from "@shared/assets/images/cherry_blossom.png";
import { MOCK_PROJECTS } from "./EngineeringWebArchiveProject";

const EngineeringWebArchiveProjectRaw = () => {
  const { slug }        = useParams();
  const navigate        = useNavigate();
  const project         = MOCK_PROJECTS[slug];
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'blz-lightbox-open')  setLightboxOpen(true);
      if (e.data?.type === 'blz-lightbox-close') setLightboxOpen(false);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!project?.previewSrc) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--bg)", gap: 16,
      }}>
        <p className="font-fell italic text-[13px]" style={{ color: "var(--text-body)" }}>
          No preview available.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-nav-inactive)", background: "none", border: "none", cursor: "pointer" }}
        >
          ← go back
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      {/* top overlay bar — hidden while a lightbox is open inside the iframe */}
      <div style={{
        position:        "absolute",
        top:             12,
        left:            12,
        right:           12,
        zIndex:          10,
        display:         "flex",
        alignItems:      "flex-start",
        justifyContent:  "space-between",
        opacity:         lightboxOpen ? 0 : 1,
        pointerEvents:   lightboxOpen ? "none" : "auto",
        transition:      "opacity 200ms ease-out",
      }}>
        {/* left: back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => navigate(-1)}
            className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase"
            style={{
              color:          "rgba(255,255,255,0.7)",
              background:     "rgba(6,3,9,0.6)",
              border:         "1px solid rgba(255,255,255,0.12)",
              borderRadius:   2,
              padding:        "5px 10px",
              cursor:         "pointer",
              backdropFilter: "blur(6px)",
              transition:     "color 150ms, background 150ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(6,3,9,0.85)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(6,3,9,0.6)"; }}
          >
            ← back
          </button>
          <span
            className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase"
            style={{
              color:          "rgba(255,255,255,0.4)",
              background:     "rgba(6,3,9,0.6)",
              border:         "1px solid rgba(255,255,255,0.08)",
              borderRadius:   2,
              padding:        "5px 10px",
              backdropFilter: "blur(6px)",
            }}
          >
            {project.title}
          </span>
        </div>

        {/* right: sakura + shadowform.net */}
        <div style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          //background:     "rgba(6,3,9,0.6)",
          //border:         "1px solid rgba(255,255,255,0.08)",
          borderRadius:    2,
          //backdropFilter: "blur(6px)",
          padding:         "0px 10px",
          gap:             4,
          transform:       "scale(1.7)",
          transformOrigin: "top right",
        }}>
          <img
            src={cherry_blossom}
            alt=""
            style={{ width: 28, filter: "drop-shadow(0 0 6px var(--pink-glow))" }}
          />
          <span
            className="[writing-mode:vertical-rl] font-alagard tracking-[3px]"
            style={{ fontSize: 12, color: "var(--text-site-name)", textShadow: "-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, -1.5px 0 0 #000, 1.5px 0 0 #000, 0 -1.5px 0 #000, 0 1.5px 0 #000, 0 0 6px var(--pink-glow), 0 0 12px var(--pink-glow)" }}
          >
            shadowform.net
          </span>
        </div>
      </div>

      {/* full-screen iframe */}
      <iframe
        src={project.previewSrc}
        title={project.title}
        style={{
          width:   "100%",
          height:  "100%",
          border:  "none",
          display: "block",
        }}
      />
    </div>
  );
};

export default EngineeringWebArchiveProjectRaw;
