// src/main/pages/EngineeringArchive.jsx
import React from "react";
import Tag from "@/components/Tag";
import Header from "@/components/Header";
import Ornament from "@/components/Ornament";
import LoadingScreen, { FadeIn, usePageLoad } from "@/components/LoadingScreen";
import { useCardInView } from "@/hooks/useCardInView";

// ── Archive entry row ─────────────────────────────────────────────────────────

const ArchiveEntry = ({ project, index }) => {
  const num = String(index + 1).padStart(2, "0");
  const { ref, active } = useCardInView(project.id ?? index);

  const sortedTags = [...(project.tags ?? [])].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const inner = (
    <div
      className="py-5"
      style={{ borderBottom: "1px solid var(--border)", paddingRight: "calc(var(--spacing) * 3)" }}
    >
      {/* row 1: year right-aligned */}
      {project.year && (
        <div className="flex justify-end mb-1">
          <span
            className="font-alkhemikal text-[10px] tracking-[0.15em] uppercase"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            {project.year}
          </span>
        </div>
      )}

      {/* row 2: number + title + topTags */}
      <div className="flex items-start gap-3">
        <span
          className="font-alagard flex-shrink-0 w-7 text-right"
          style={{ fontSize: 13, color: "var(--text-nav-inactive)" }}
        >
          {num}
        </span>
        <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
          <h2
            className="font-alagard tracking-[0.5px] leading-tight"
            style={{ fontSize: 18, color: "var(--text-heading)" }}
          >
            {project.title}
          </h2>
          {project.topTags?.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-end flex-shrink-0">
              {project.topTags.map(t => (
                <Tag key={t.label} theme={t.theme} size="xxs" variant="lit">{t.label}</Tag>
              ))}
            </div>
          )}
        </div>
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
        <div className="dev-bottom-tags flex gap-1 flex-wrap mt-2 pl-10">
          {sortedTags.map(t => (
            <Tag key={t.label} theme={t.theme} variant="dim">{t.label}</Tag>
          ))}
        </div>
      )}
    </div>
  );

  const external = project.link && /^https?:\/\//.test(project.link);

  return project.link ? (
    <a
      ref={ref}
      href={project.link}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`dev-archive-entry block${active ? " dev-archive-entry--active" : ""}`}
      style={{ textDecoration: "none" }}
    >
      {inner}
    </a>
  ) : (
    <div ref={ref} className={`dev-archive-entry${active ? " dev-archive-entry--active" : ""}`}>{inner}</div>
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
    <FadeIn className="flex flex-col">
      <style>{`
        .dev-archive-entry {
          transition: background 150ms linear;
          cursor: pointer;
        }
        .dev-archive-entry:hover,
        .dev-archive-entry--active {
          background: var(--bg-ticker);
        }
        .dev-archive-entry h2 {
          transition: filter 150ms ease-out;
        }
        .dev-archive-entry:hover h2,
        .dev-archive-entry--active h2 {
          filter: drop-shadow(0 0 4px var(--pink-glow)) drop-shadow(0 0 6px var(--pink-glow));
        }
        .dev-archive-entry .dev-bottom-tags span,
        .dev-archive-entry .dev-bottom-tags button {
          transition: color 150ms ease-out, border-color 150ms ease-out, background 150ms ease-out;
        }
        .dev-archive-entry:hover .dev-bottom-tags span,
        .dev-archive-entry:hover .dev-bottom-tags button,
        .dev-archive-entry--active .dev-bottom-tags span,
        .dev-archive-entry--active .dev-bottom-tags button {
          color: var(--tag-lit-text) !important;
          border-color: var(--tag-lit-border) !important;
          background: var(--tag-lit-bg) !important;
        }
      `}</style>

      <div className="flex flex-col w-full mx-auto">
        {/* header */}
        <div className="mb-6">
          {header ? (
              <Header
                eyebrow={header?.eyebrow}
                title={header?.heading}
                description={header?.description}
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

        {/* divider */}
        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 0 }} />

        {/* entries */}
        {entries.map((project, i) => (
          <ArchiveEntry key={project.id} project={project} index={i} />
        ))}

        <Ornament className="mt-6 self-center" />
      </div>
    </FadeIn>
  );
};

export default EngineeringArchive;
