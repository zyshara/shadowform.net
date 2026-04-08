// src/main/pages/Management.jsx

import Ornament from "@/components/Ornament";
import Tag from "@/components/Tag";
import Header from "@/components/Header";
import LoadingScreen, { FadeIn, usePageLoad } from "@/components/LoadingScreen";

// ── Artist Card ──────────────────────────────────────────────────────────────
const ArtistCard = ({ artist }) => (
  <div
    className="flex items-start gap-4 p-4 border rounded-[2px]"
    style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
  >
    {/* image / placeholder */}
    <div
      className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[2px] border"
      style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)" }}
    >
      {artist.icon ? (
        <img src={artist.icon} alt={artist.name} className="w-full h-full object-cover rounded-[2px]" />
      ) : (
        <span className="font-alagard text-[18px]" style={{ color: "var(--ornament-glyph)" }}>✿</span>
      )}
    </div>

    {/* info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3
          className="font-alagard text-[16px] tracking-[1px] leading-tight lowercase"
          style={{ color: "var(--text-heading)" }}
        >
          {artist.name}
        </h3>
        <span className="font-alagard text-[18px]" style={{ color: "var(--ornament-glyph)" }}>✿</span>
      </div>

      <p className="font-alkhemikal text-[9px] tracking-[0.14em] uppercase mb-2" style={{ color: "var(--text-nav-inactive)" }}>
        {`${artist.primary_genre} · ${artist.location}`}
      </p>

      <p className="font-fell italic text-[12px] leading-[1.75] mb-3" style={{ color: "var(--text-body)" }}>
        {artist.blurb}
      </p>

      {artist.genres?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {artist.genres.map((genre) => <Tag key={genre} variant="lit">{genre}</Tag>)}
        </div>
      )}

      {artist.links?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {artist.links.map((link) => (
            <Tag key={link.label} variant="link" href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Management Page ──────────────────────────────────────────────────────────
const Management = () => {
  const { data, error, loading, fading } = usePageLoad(
    () => fetch("/api/artists").then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
    { minLoadMs: 500 },
  );

  if (loading) return <LoadingScreen fading={fading} />;

  if (error) return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex items-center justify-center">
        <p className="font-fell italic text-[13px]" style={{ color: "var(--text-nav-inactive)" }}>
          something went wrong — {error}
        </p>
      </div>
    </div>
  );

  const artists = data?.artists ?? [];

  return (
    <FadeIn className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex flex-col px-10 py-8 max-w-[600px] w-full mx-auto justify-center">
        <Header
          eyebrow="Artist Management"
          title="The Roster"
          description="shadowform is a small collective supporting electronic artists across multiple genres. we strive to empower artists & their projects so they can reach their creative goals."
        />

        <div className="flex items-center gap-3 mb-4 mt-6">
          <span className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--ornament-glyph)" }}>
            ✦ &nbsp; artists
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, var(--ornament-line), transparent)" }} />
        </div>

        <div className="flex flex-col gap-3">
          {artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
        </div>

        <Ornament className="mt-8 self-center" />
      </div>
    </FadeIn>
  );
};

export default Management;
