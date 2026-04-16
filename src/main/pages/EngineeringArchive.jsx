// src/main/pages/EngineeringArchive.jsx
import React from "react";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Ornament from "@/components/Ornament";
import LoadingScreen, { FadeIn, usePageLoad } from "@/components/LoadingScreen";

// ── Archive entry row ─────────────────────────────────────────────────────────

const ArchiveEntry = ({ project, index }) => {
  const num = String(index + 1).padStart(2, "0");

  const sortedTags = [...(project.tags ?? [])].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const inner = (
    <div
      className="py-5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* top row: number + title + topTags + year */}
      <div className="flex items-baseline gap-3">
        <span
          className="font-alagard flex-shrink-0 w-7 text-right"
          style={{ fontSize: 13, color: "var(--text-dim)", opacity: 0.4 }}
        >
          {num}
        </span>
        <div className="flex-1 flex items-baseline gap-2 flex-wrap min-w-0">
          <h2
            className="font-alagard tracking-[0.5px] leading-tight"
            style={{ fontSize: 18, color: "var(--text-heading)" }}
          >
            {project.title}
          </h2>
          {project.topTags?.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {project.topTags.map(t => (
                <Tag key={t.label} theme={t.theme} variant="lit">{t.label}</Tag>
              ))}
            </div>
          )}
        </div>
        {project.year && (
          <span
            className="font-alkhemikal text-[9px] tracking-[0.15em] uppercase flex-shrink-0"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            {project.year}
          </span>
        )}
      </div>

      {/* description */}
      {project.description && (
        <p
          className="font-fell italic text-[12px] leading-[1.7] mt-2 pl-10"
          style={{ color: "var(--text-body)" }}
        >
          {project.description}
        </p>
      )}

      {/* bottom tags */}
      {sortedTags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2 pl-10">
          {sortedTags.map(t => (
            <Tag key={t.label} theme={t.theme} variant="dim">{t.label}</Tag>
          ))}
        </div>
      )}
    </div>
  );

  return project.link ? (
    <a
      href={project.link}
      target="_blank"
      rel="noreferrer"
      className="dev-archive-entry block"
      style={{ textDecoration: "none" }}
    >
      {inner}
    </a>
  ) : (
    <div className="dev-archive-entry">{inner}</div>
  );
};

// ── Archive page ──────────────────────────────────────────────────────────────

const EngineeringArchive = () => {
  const { data: apiData, error, loading, fading } = usePageLoad(
    () => fetch("/api/engineering/archive").then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
    { minLoadMs: 300 },
  );

  if (loading) return <LoadingScreen fading={fading} />;

  const header  = apiData?.data?.header;
  const entries = apiData?.data?.entries ?? [];

  return (
    <FadeIn className="flex flex-col min-h-full max-w-[600px]" style={{ background: "var(--bg)" }}>
      <style>{`
        .dev-archive-entry {
          transition: background 150ms ease-out;
        }
        .dev-archive-entry:hover {
          background: var(--bg-ticker);
        }
        .dev-archive-entry:hover h2 {
          filter: drop-shadow(0 0 4px var(--pink-glow)) drop-shadow(0 0 6px var(--pink-glow));
        }
      `}</style>

      <div
        className="flex-1 flex flex-col px-8 py-8 w-full mx-auto"
        style={{ maxWidth: 880 }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {header ? (
              <Header
                eyebrow="software engineering ➺ the archive"
                title="releases & relics"
                description="here you can find all projects i've worked on through work or leisure. some of these projects have been taken down or decomissioned. i've done my best to preserve them here."
              />
            ) : (
              <>
                <p
                  className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase mb-2"
                  style={{ color: "var(--text-nav-inactive)" }}
                >
                  // Development
                </p>
                <h1
                  className="font-alagard tracking-[1px]"
                  style={{ fontSize: 28, color: "var(--text-heading)" }}
                >
                  The Archive
                </h1>
              </>
            )}
          </div>
          <Button variant="secondary" href="/engineering/resume" disabled>
            résumé →
          </Button>
        </div>

        {/* divider */}
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 0 }} />

        {/* entries */}
        {entries.map((project, i) => (
          <ArchiveEntry key={project.id} project={project} index={i} />
        ))}

        <Ornament className="mt-8 self-center" />
      </div>
    </FadeIn>
  );
};

export default EngineeringArchive;
