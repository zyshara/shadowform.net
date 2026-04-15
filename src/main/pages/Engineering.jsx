// src/main/pages/Engineering.jsx
import React from "react";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import Ornament from "@/components/Ornament";
import Header from "@/components/Header";
import LoadingScreen, { FadeIn, usePageLoad } from "@/components/LoadingScreen";

// ── Shared sub-components ─────────────────────────────────────────────────────

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

const CardLink = ({ href, children, className, style }) => href
  ? <a href={href} target="_blank" rel="noreferrer" className={className} style={{ ...style, textDecoration: "none" }}>{children}</a>
  : <div className={className} style={style}>{children}</div>;

const FeaturedCard = ({ project }) => (
  <CardLink
    href={project.link}
    className="dev-card dev-card-featured flex flex-col h-full p-5 rounded-[2px] border"
    style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
  >
    {/* thumbnail with icon + badge overlaid inside */}
    <div className="mb-4 rounded-[2px] overflow-hidden relative" style={{ aspectRatio: "361 / 385" }}>
      {project.thumbnail && (
        <img
          className={`rounded-[2px] border dev-img--${project.id}`}
          src={project.thumbnail}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderColor: "var(--border-soft)" }}
        />
      )}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3">
        <CardIcon icon={project.icon} badge={project.badge} title={project.title} />
        {project.topTags?.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {project.topTags.map(t => <Tag key={t.label} theme={t.theme} variant="lit">{t.label}</Tag>)}
          </div>
        )}
      </div>
    </div>

    {/* text: eyebrow + title + description */}
    <div>
      {(project.eyebrow || project.year) && (
        <p
          className="font-alkhemikal text-[10px] tracking-[0.18em] uppercase mb-1"
          style={{ color: "var(--text-nav-inactive)" }}
        >
          {project.eyebrow && project.year
            ? `${project.eyebrow} ✦ ${project.year}`
            : project.eyebrow || project.year}
        </p>
      )}
      <h2
        className="font-alagard tracking-[0.5px] leading-tight mb-3"
        style={{ fontSize: 30, color: "var(--text-heading)" }}
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
          {project.tags.map(t => <Tag key={t.label} theme={t.theme} variant="dim">{t.label}</Tag>)}
        </div>
      )}
    </div>
  </CardLink>
);

// ── Standard project card ─────────────────────────────────────────────────────

const ProjectCard = ({ project }) => (
  <CardLink
    href={project.link}
    className="dev-card flex flex-col h-full p-4 rounded-[2px] border"
    style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
  >
    {/* thumbnail with icon + badge overlaid inside */}
    <div className="mb-3 rounded-[2px] overflow-hidden relative" style={{ aspectRatio: "369 / 195" }}>
      {project.thumbnail && (
        <img
          className={`rounded-[2px] border dev-img--${project.id}`}
          src={project.thumbnail}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderColor: "var(--border-soft)" }}
        />
      )}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3">
        <CardIcon icon={project.icon} badge={project.badge} title={project.title} />
        {project.topTags?.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {project.topTags.map(t => <Tag key={t.label} theme={t.theme} variant="lit">{t.label}</Tag>)}
          </div>
        )}
      </div>
    </div>

    <div className="flex-1" />

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
        {project.tags.map(t => <Tag key={t.label} theme={t.theme} variant="dim">{t.label}</Tag>)}
      </div>
    )}
  </CardLink>
);

// ── Wide card (item 3 — full-width, horizontal) ───────────────────────────────

const WideCard = ({ project }) => (
  <CardLink
    href={project.link}
    className="dev-card flex flex-row rounded-[2px] border overflow-hidden"
    style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
  >
    {/* left: thumbnail — 42% on mobile, 55% on desktop */}
    <div
      className="dev-wide-divider relative flex-shrink-0 overflow-hidden border-r"
      style={{ width: "42%", borderColor: "var(--border-soft)", minHeight: 180 }}
    >
      {project.thumbnail && (
        <img
          className={`dev-img--${project.id}`}
          src={project.thumbnail}
          alt={project.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
        />
      )}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3">
        <CardIcon icon={project.icon} badge={project.badge} title={project.title} />
      </div>
    </div>

    {/* right: text content */}
    <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
      <div className="flex justify-end mb-2">
        {project.topTags?.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {project.topTags.map(t => <Tag key={t.label} theme={t.theme} variant="lit">{t.label}</Tag>)}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-auto">
        {(project.eyebrow || project.year) && (
          <p
            className="font-alkhemikal text-[8px] tracking-[0.18em] uppercase"
            style={{ color: "var(--text-nav-inactive)" }}
          >
            {project.eyebrow && project.year
              ? `${project.eyebrow} ✦ ${project.year}`
              : project.eyebrow || project.year}
          </p>
        )}
        <h2
          className="font-alagard tracking-[0.5px] leading-tight"
          style={{ fontSize: 17, color: "var(--text-heading)" }}
        >
          {project.title}
        </h2>
        <p
          className="font-fell italic text-[11px] leading-[1.65]"
          style={{ color: "var(--text-body)" }}
        >
          {project.description}
        </p>
        {project.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {project.tags.map(t => <Tag key={t.label} theme={t.theme} variant="dim">{t.label}</Tag>)}
          </div>
        )}
      </div>
    </div>
  </CardLink>
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
  const { data: apiData, error, loading, fading } = usePageLoad(
    () => fetch("/api/engineering").then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
    { minLoadMs: 300 },
  );

  if (loading) return <LoadingScreen fading={fading} />;

  const header    = apiData?.data?.header;
  const projects  = apiData?.data?.projects ?? [];
  const hero      = projects[0];
  const sideCards = projects.slice(1, 3);
  const wideCard  = projects[3];
  const gridCards = projects.slice(4);

  return (
    <FadeIn className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <style>{`
        .dev-top { display: flex; gap: 10px; }
        .dev-top-left { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .dev-card-featured { flex: 1; }
        .dev-top-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
        .dev-top-right-card { flex: 1; display: flex; flex-direction: column; }
        @media (max-width: 640px) {
          .dev-top { flex-direction: column; }
          .dev-card-featured { min-height: unset; }
        }

        .dev-card {
          transition: border-color 150ms ease-out;
          cursor: pointer;
        }
        .dev-card:hover {
          border-color: var(--tag-lit-border) !important;
        }
        .dev-card:hover h2,
        .dev-card:hover h3 {
          filter: drop-shadow(0 0 4px var(--pink-glow)) drop-shadow(0 0 6px var(--pink-glow));
        }
        .dev-card img {
          transition: filter 150ms ease-out;
        }
        .dev-card:hover img {
          filter: brightness(1.2);
        }
        .dev-wide-divider {
          transition: border-color 150ms ease-out;
        }
        .dev-card:hover .dev-wide-divider {
          border-color: var(--tag-lit-border) !important;
        }
        @media (max-width: 640px) {
          .dev-img--warcraft-iii { object-position: 26% 50%; }
        }
      `}</style>

      <div
        className="flex-1 flex flex-col px-8 py-8 w-full mx-auto"
        style={{ maxWidth: 880 }}
      >
        <div className="flex-1 flex flex-col max-w-[600px] w-full mx-auto justify-center">
          <Header
            eyebrow={header?.eyebrow}
            title={header?.heading}
            description={header?.description}
            align="center"
          />
        </div>

        <div className="flex items-center gap-3 mb-4 mt-6">
          <span className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--ornament-glyph)" }}>
            ✦ &nbsp; projects 
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, var(--ornament-line), transparent)" }} />
        </div>

        {/* row 1: hero left + 2 side cards right */}
        <div className="dev-top">
          <div className="dev-top-left">
            {hero && <FeaturedCard project={hero} />}
          </div>
          <div className="dev-top-right">
            {sideCards.map(p => (
              <div key={p.id} className="dev-top-right-card">
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </div>

        {/* row 2: wide full-width card */}
        {wideCard && (
          <div className="mt-[10px]">
            <WideCard project={wideCard} />
          </div>
        )}

        {/* row 3+: two-column grid for remaining cards */}
        {gridCards.length > 0 && (
          <div className="grid grid-cols-2 gap-[10px] mt-[10px]">
            {gridCards.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* static CTA cards */}
        <div className="grid grid-cols-2 gap-[10px] mt-[10px]">
          <CtaCard
            label="full history<br />&amp; experience"
            cta="view résumé →"
            href="/engineering/resume"
            disabled
          />
          <CtaCard
            label="all projects,<br />concisely"
            cta="view archive →"
            href="/engineering/archive"
            disabled
          />
        </div>

        <Ornament className="mt-8 self-center" />
      </div>
    </FadeIn>
  );
};

export default Engineering;
