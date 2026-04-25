// src/main/pages/EngineeringProject.jsx
import React from "react";
import { useParams } from "react-router-dom";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Ornament from "@/components/Ornament";
import PreservedSite from "@/components/PreservedSite";
import LoadingScreen, { FadeIn } from "@/components/LoadingScreen";

// ── Mock data (replace with API fetch once ready) ─────────────────────────────

const MOCK_PROJECTS = {
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

      {/* role */}
      {project.role && (
        <div className="mb-4">
          <p
            className="font-alkhemikal text-[10px] tracking-[0.2em] uppercase mb-1"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            Role
          </p>
          <p
            className="font-fell italic text-[13px] leading-[1.6]"
            style={{ color: "var(--text-body)" }}
          >
            {project.role}
          </p>
        </div>
      )}

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
        <Button variant="secondary" href="/engineering/archive">
          ← Back to Archive
        </Button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const EngineeringProject = () => {
  const { slug } = useParams();
  const project = MOCK_PROJECTS[slug];

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
              <PreservedSite
                src={project.previewSrc}
                style={{ borderRadius: 2, border: "1px solid var(--border-soft)" }}
              />
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

export default EngineeringProject;
