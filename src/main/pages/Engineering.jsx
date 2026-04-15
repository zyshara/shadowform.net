// src/main/pages/Engineering.jsx
import React from "react";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import Ornament from "@/components/Ornament";
import Header from "@/components/Header";
import LoadingScreen, { FadeIn, usePageLoad } from "@/components/LoadingScreen";
import data from "@/data/development-data.json";

// ── Shared sub-components ─────────────────────────────────────────────────────

const TypeBadge = ({ type }) => (
  <Tag variant={type === "work" ? "lit" : "dim"}>{type}</Tag>
);

const CardIcon = ({ icon, badge, title }) => {
  const base = {
    width: 36, height: 36, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 4, border: "1px solid var(--border)",
    background: "var(--bg-sidebar)",
  };
  if (badge) return (
    <div style={base}>
      <span className="font-alkhemikal text-[8px] tracking-[0.1em] uppercase" style={{ color: "var(--text-nav-inactive)" }}>
        {badge}
      </span>
    </div>
  );
  if (icon) return (
    <div style={{ ...base, overflow: "hidden", border: "none" }}>
      <img src={icon} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  return (
    <div style={base}>
      <span className="font-alagard text-[14px]" style={{ color: "var(--ornament-glyph)" }}>✿</span>
    </div>
  );
};

// ── Featured card (large, left column) ───────────────────────────────────────

const FeaturedCard = ({ project }) => (
  <div
    className="dev-card-featured flex flex-col h-full p-5 rounded-[2px] border"
    style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
  >
    {/* top: icon + badge */}
    <div className="flex items-start justify-between">
      <CardIcon icon={project.icon} badge={project.badge} title={project.title} />
      <TypeBadge type={project.type} />
    </div>

    {/* middle: thumbnail fills space, text pinned to bottom */}
    <div className="flex-1 min-h-0 mt-4 mb-4 rounded-[2px] overflow-hidden">
      {project.thumbnail && (
        <img
          src={project.thumbnail}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>

    {/* text: eyebrow + title + description */}
    <div>
      {project.eyebrow && (
        <p
          className="font-alkhemikal text-[9px] tracking-[0.18em] uppercase mb-1"
          style={{ color: "var(--text-nav-inactive)" }}
        >
          {project.eyebrow}
        </p>
      )}
      <h2
        className="font-alagard tracking-[0.5px] leading-tight mb-3"
        style={{ fontSize: 38, color: "var(--text-heading)" }}
      >
        {project.title}
      </h2>
      <p
        className="font-fell italic text-[13px] leading-[1.75]"
        style={{ color: "var(--text-body)" }}
      >
        {project.description}
      </p>
    </div>

    {/* bottom: tags + year */}
    <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
      {project.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {project.tags.map(t => <Tag key={t} variant="dim">{t}</Tag>)}
        </div>
      )}
      {project.year && (
        <p
          className="font-alkhemikal text-[9px] tracking-[0.14em] uppercase mt-1"
          style={{ color: "var(--text-nav-inactive)" }}
        >
          {project.year}
        </p>
      )}
    </div>
  </div>
);

// ── Standard project card ─────────────────────────────────────────────────────

const ProjectCard = ({ project }) => (
  <div
    className="flex flex-col h-full p-4 rounded-[2px] border"
    style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
  >
    {/* top: icon + badge */}
    <div className="flex items-start justify-between mb-3">
      <CardIcon icon={project.icon} badge={project.badge} title={project.title} />
      <TypeBadge type={project.type} />
    </div>

    <div className="flex-1 min-h-0 mb-3 rounded-[2px] overflow-hidden">
      {project.thumbnail && (
        <img
          src={project.thumbnail}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>

    <h3
      className="font-alagard text-[20px] tracking-[0.5px] leading-tight mb-2"
      style={{ color: "var(--text-heading)" }}
    >
      {project.title}
    </h3>

    <p
      className="font-fell italic text-[12px] leading-[1.7] mb-3"
      style={{ color: "var(--text-body)" }}
    >
      {project.description}
    </p>

    {project.tags?.length > 0 && (
      <div className="flex gap-1 flex-wrap">
        {project.tags.map(t => <Tag key={t} variant="dim">{t}</Tag>)}
      </div>
    )}
  </div>
);

// ── Static CTA cards ──────────────────────────────────────────────────────────

const CtaCard = ({ label, cta, href, disabled = false }) => (
  <div
    className="flex flex-col items-center justify-center p-5 rounded-[2px] border"
    style={{
      background: "var(--bg-ticker)",
      borderColor: "var(--border-soft)",
      minHeight: 130,
    }}
  >
    <p
      className="font-fell italic text-[15px] leading-[1.7] text-center mb-4"
      style={{ color: "var(--text-body)" }}
      dangerouslySetInnerHTML={{ __html: label }}
    />
    <Button variant="secondary" href={disabled ? undefined : href} disabled={disabled}>
      {cta}
    </Button>
  </div>
);

// ── Engineering page ──────────────────────────────────────────────────────────

const Engineering = () => {
  const { projects = [] } = data;
  const featured   = projects.find(p => p.featured);
  const lowpoly    = projects.find(p => p.id === "lowpoly");
  const sideCards  = projects.filter(p => !p.featured && p.id !== "lowpoly");

  const { data: apiData, error, loading, fading } = usePageLoad(
    () => fetch("/api/engineering").then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
    { minLoadMs: 300 },
  );

  if (loading) return <LoadingScreen fading={fading} />;

  const header = apiData?.data?.header;

  return (
    <FadeIn className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <style>{`
        .dev-top { display: flex; gap: 10px; }
        .dev-top-left { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .dev-card-featured { flex: 1; min-height: 460px; }
        .dev-top-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
        .dev-top-right-card { flex: 1; display: flex; flex-direction: column; }
        @media (max-width: 640px) {
          .dev-top { flex-direction: column; }
          .dev-card-featured { min-height: unset; }
        }
      `}</style>

      <div
        className="flex-1 flex flex-col px-8 py-8 w-full mx-auto"
        style={{ maxWidth: 880 }}
      >
        <div className="mb-6">
          <Header
            eyebrow={header?.eyebrow}
            title={header?.heading}
            align="center"
          >
            {header?.description && (
              <div
                className="flex font-fell flex-col items-center gap-4 max-w-[540px] text-[15px] leading-[1.9]"
                style={{ color: "var(--text-body)" }}
                dangerouslySetInnerHTML={{ __html: header.description }}
              />
            )}
          </Header>
        </div>

        <div className="flex items-center gap-3 mb-4 mt-6">
          <span className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--ornament-glyph)" }}>
            ✦ &nbsp; projects 
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, var(--ornament-line), transparent)" }} />
        </div>

        <div className="dev-top">
          {/* left: featured card */}
          <div className="dev-top-left">
            {featured && <FeaturedCard project={featured} />}
          </div>

          {/* right: shadowform + redspear — flex-1 each, fills height driven by left column */}
          <div className="dev-top-right">
            {sideCards.map(p => (
              <div key={p.id} className="dev-top-right-card">
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </div>

        {/* low poly — full width */}
        {lowpoly && (
          <div className="mt-[10px]">
            <ProjectCard project={lowpoly} />
          </div>
        )}

        {/* static CTA cards */}
        <div className="grid grid-cols-2 gap-[10px] mt-[10px]">
          <CtaCard
            label="full history<br />&amp; experience"
            cta="view résumé →"
            href="/resume"
            disabled
          />
          <CtaCard
            label="all projects,<br />concisely"
            cta="view archive →"
            href="/archive"
            disabled
          />
        </div>

        <Ornament className="mt-8 self-center" />
      </div>
    </FadeIn>
  );
};

export default Engineering;
