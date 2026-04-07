// src/main/pages/Management.jsx

import { useState, useEffect } from "react";
import Ornament from "@/components/Ornament";
import Tag from "@/components/Tag";
import Spinner from "@/components/Spinner";
import Header from "@/components/Header";

const MIN_LOAD_MS = 500; // minimum time the spinner shows
const FADE_MS     = 400;  // how long the fade-out takes

// ── Artist Card ──────────────────────────────────────────────────────────────
const ArtistCard = ({ artist }) => {
  return (
    <div
      className="flex items-start gap-4 p-4 border rounded-[2px]"
      style={{
        background:   "var(--bg-ticker)",
        borderColor:  "var(--border-soft)",
      }}
    >
      {/* image / placeholder */}
      <div
        className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[2px] border"
        style={{
          background:  "var(--bg-sidebar)",
          borderColor: "var(--border)",
        }}
      >
        {artist.icon ? (
          <img
            src={artist.icon}
            alt={artist.name}
            className="w-full h-full object-cover rounded-[2px]"
          />
        ) : (
          <span
            className="font-alagard text-[18px]"
            style={{ color: "var(--ornament-glyph)" }}
          >
            ✿
          </span>
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
          <span
            className="font-alagard text-[18px]"
            style={{ color: "var(--ornament-glyph)" }}
           >✿</span>
        </div>

        <p
          className="font-alkhemikal text-[9px] tracking-[0.14em] uppercase mb-2"
          style={{ color: "var(--text-nav-inactive)" }}
        >
          {`${artist.primary_genre} · ${artist.location}`}
        </p>

        <p
          className="font-fell italic text-[12px] leading-[1.75] mb-3"
          style={{ color: "var(--text-body)" }}
        >
          {artist.blurb}
        </p>

        {/* genres */}
        {artist.genres?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {artist.genres.map((genre) => (
              <Tag key={genre} variant="lit">{genre}</Tag>
            ))}
          </div>
        )}

        {/* links */}
        {artist.links?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {artist.links.map((link) => (
              <Tag
                key={link.label}
                variant="link"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Management Page ──────────────────────────────────────────────────────────
const Management = () => {
  const [artists, setArtists]   = useState([]);
  const [meta] = useState({
    eyebrow: "Artist Management",
    title:   "The Roster",
    blurb:   "shadowform is a small collective supporting electronic artists across multiple genres. we strive to empower artists & their projects so they can reach their creative goals.",
  });
  const [error,     setError]     = useState(null);
  // loading = data not ready OR minimum time not elapsed
  const [loading,   setLoading]   = useState(true);
  // fading = data ready, minimum time elapsed, now playing fade-out
  const [fading,    setFading]    = useState(false);
 
  useEffect(() => {
    const start = Date.now();
 
    fetch("/api/artists")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(({ artists }) => {
        setArtists(artists);
 
        // wait for whichever is longer: the fetch or the minimum display time
        const elapsed   = Date.now() - start;
        const remaining = Math.max(0, MIN_LOAD_MS - elapsed);
 
        setTimeout(() => {
          // kick off the fade-out
          setFading(true);
          // after fade completes, hide the loader
          setTimeout(() => setLoading(false), FADE_MS);
        }, remaining);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // ── loading / fading overlay ─────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          opacity:    fading ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out`,
        }}
      >
        <Spinner />
      </div>
    </div>
  );

  // ── error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex items-center justify-center">
        <p className="font-fell italic text-[13px]" style={{ color: "var(--text-nav-inactive)" }}>
          something went wrong — {error}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div className="flex-1 flex flex-col px-10 py-8 max-w-[600px] w-full mx-auto justify-center">
        {/* header */}
        <Header
          eyebrow={meta.eyebrow}
          title={meta.title}
          description={meta.blurb}
        />

        {/* roster label */}
        <div className="flex items-center gap-3 mb-4 mt-6">
          <span
            className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase"
            style={{ color: "var(--ornament-glyph)" }}
          >
            ✦ &nbsp; artists
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(to right, var(--ornament-line), transparent)` }}
          />
        </div>

        {/* artist cards */}
        <div className="flex flex-col gap-3">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>

        <Ornament className="mt-8 self-center" />
      </div>
    </div>
  );
};

export default Management;
