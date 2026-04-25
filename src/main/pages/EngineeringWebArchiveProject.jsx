// src/main/pages/EngineeringWebArchiveProject.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Ornament from "@/components/Ornament";
import PreservedSite from "@/components/PreservedSite";
import MobileSitePreview from "@/components/MobileSitePreview";
import LoadingScreen, { FadeIn } from "@/components/LoadingScreen";

const useIsMobile = () => {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
};

// ── Site thumbnail (mobile — opens modal) ─────────────────────────────────────

const SiteThumbnail = ({ project, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:    "relative",
        aspectRatio: "16/9",
        borderRadius: 2,
        border:      `1px solid ${hovered ? "var(--tag-lit-border)" : "var(--border-soft)"}`,
        background:  "var(--bg-ticker)",
        overflow:    "hidden",
        cursor:      "pointer",
        transition:  "border-color 150ms ease-out",
      }}
    >
      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ornament />
        </div>
      )}

      {/* hover overlay */}
      <div style={{
        position:        "absolute",
        inset:           0,
        background:      hovered ? "rgba(6,3,9,0.72)" : "rgba(6,3,9,0.4)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        transition:      "background 150ms ease-out",
      }}>
        <span
          className="font-alkhemikal text-[10px] tracking-[0.2em] uppercase"
          style={{
            color:      hovered ? "var(--text-heading)" : "var(--text-nav-inactive)",
            transition: "color 150ms ease-out",
          }}
        >
          ↗ view site
        </span>
      </div>
    </div>
  );
};

// ── Mock data (replace with API fetch once ready) ─────────────────────────────

export const MOCK_PROJECTS = {
  "dragonflight": {
    id:          "dragonflight",
    eyebrow:     "software engineering ➺ the archive ➺ dragonflight",
    title:       "World of Warcraft: Dragonflight Site",
    year:        "2022 ➺ 2024",
    link:        "https://worldofwarcraft.blizzard.com/dragonflight",
    previewSrc:  "/preserved/dragonflight/index.html",
    description: "Official promotional website for World of Warcraft: Dragonflight. Built season pages, expansion landing experiences, and feature showcases. Primary engineer on ongoing iteration cycles with PM and design stakeholders.",
    role:        "Front End Engineer · primary engineer",
    topTags:     [{ label: "Blizzard", theme: "blizzard" }],
    tags:        [
      { label: "Express",     theme: null },
      { label: "Lit Element", theme: null },
      { label: "Node.js",     theme: null },
      { label: "Pug",         theme: null },
      { label: "SCSS",        theme: null },
    ],
  },

  "wotlk": {
    id:          "wotlk",
    eyebrow:     "software engineering ➺ the archive ➺ wrath of the lich king",
    title:       "WoW Classic: Wrath of the Lich King",
    year:        "2022",
    link:        "https://wowclassic.blizzard.com/en-us/",
    previewSrc:  "/preserved/wotlk/index.html",
    description: "Promotional landing page for World of Warcraft Classic: Wrath of the Lich King. Built feature sections, media galleries, and edition comparison layouts. Worked directly with PM and design on launch timing and content iteration.",
    role:        "Front End Engineer · primary engineer",
    topTags:     [{ label: "Blizzard", theme: "blizzard" }],
    tags:        [
      { label: "Express",     theme: null },
      { label: "Lit Element", theme: null },
      { label: "Node.js",     theme: null },
      { label: "Pug",         theme: null },
      { label: "SCSS",        theme: null },
    ],
  },
};


// ── Project detail card (left column) ────────────────────────────────────────

const ProjectDetailCard = ({ project }) => {
  const sortedTags = [...(project.tags ?? [])].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <div
      className="flex flex-col p-6 rounded-[2px] border h-full"
      style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
    >
      {/* top tags + year */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1 flex-wrap">
          {project.topTags?.map(t => (
            <Tag key={t.label} theme={t.theme} size="xxs" variant="lit">{t.label}</Tag>
          ))}
        </div>
        {project.year && (
          <span
            className="font-alkhemikal text-[10px] tracking-[0.15em] uppercase flex-shrink-0"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            {project.year}
          </span>
        )}
      </div>

      {/* header */}
      <div className="mb-5">
        <Header
          eyebrow={project.eyebrow}
          title={project.title}
          description={project.description}
        />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 16 }} />


      {/* stack */}
      {sortedTags.length > 0 && (
        <div className="mb-6">
          <p
            className="font-alkhemikal text-[10px] tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            Stack
          </p>
          <div className="flex gap-1 flex-wrap">
            {sortedTags.map(t => (
              <Tag key={t.label} theme={t.theme} size="xs" variant="lit">{t.label}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* spacer */}
      <div className="flex-1" />

      {/* actions */}
      <div className="flex flex-col gap-2">
        {project.previewSrc && (
          <Button size="sm" corners variant="primary" href={`/engineering/archive/${project.id}/raw`}>
            ↗ Visit Full Site
          </Button>
        )}
        <Button size="sm" corners={true} variant="secondary" href="/engineering/archive">
          ← Back to Archive
        </Button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const EngineeringWebArchiveProject = () => {
  const { slug }   = useParams();
  const project    = MOCK_PROJECTS[slug];
  const mobile     = useIsMobile();
  const [siteOpen, setSiteOpen] = useState(false);

  if (!project) {
    return (
      <FadeIn className="flex flex-col w-full min-h-full items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="font-fell italic" style={{ color: "var(--text-body)" }}>
          Project not found.
        </p>
        <Button variant="secondary" href="/engineering/archive" className="mt-4">
          ← Back to Archive
        </Button>
      </FadeIn>
    );
  }

  return (
    <FadeIn className="flex flex-col w-full" style={{ background: "var(--bg)" }}>
      <style>{`
        @media (max-width: 1280px) {
          .eng-project-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
      <div
        className="flex flex-col px-8 py-8 w-full mx-auto"
        style={{ maxWidth: 1400 }}
      >
        {/* CSS grid guarantees definite column widths on first paint — flex-1 does not */}
        <div
          className="eng-project-grid grid gap-[10px]"
          style={{ gridTemplateColumns: "minmax(0, 480px) minmax(0, 1fr)" }}
        >
          {/* left: project detail */}
          <div>
            <ProjectDetailCard project={project} />
          </div>

          {/* right: preserved site preview */}
          <div>
            {project.previewSrc ? (
              mobile ? (
                <>
                  {siteOpen && (
                    <Modal onClose={() => setSiteOpen(false)} maxWidth={420}>
                      {/* title bar */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 12px",
                        background: "var(--bg-ticker)",
                        borderBottom: "1px solid var(--border-soft)",
                        flexShrink: 0,
                      }}>
                        <span
                          className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase"
                          style={{ color: "var(--text-nav-inactive)" }}
                        >
                          // {project.title}
                        </span>
                        <button
                          onClick={() => setSiteOpen(false)}
                          style={{ color: "var(--text-nav-inactive)", background: "none", border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 14 }}
                        >✕</button>
                      </div>
                      <MobileSitePreview src={project.previewSrc} />
                    </Modal>
                  )}
                  <SiteThumbnail project={project} onClick={() => setSiteOpen(true)} />
                </>
              ) : (
                <PreservedSite
                  src={project.previewSrc}
                  style={{ borderRadius: 2, border: "1px solid var(--border-soft)" }}
                />
              )
            ) : (
              <div
                className="flex items-center justify-center w-full rounded-[2px] border"
                style={{ aspectRatio: "16/9", borderColor: "var(--border-soft)", background: "var(--bg-ticker)" }}
              >
                <Ornament />
              </div>
            )}
          </div>
        </div>

        <Ornament className="mt-8 self-center" />
      </div>
    </FadeIn>
  );
};

export default EngineeringWebArchiveProject;
