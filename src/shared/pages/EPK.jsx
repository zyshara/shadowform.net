import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import data from "./epk-data.json";

// ── Waveform bars (decorative) ────────────────────────────────────────────────
const WAVE_SEEDS = [
  [6,14,10,18,8,20,12,16,9,22,7,15,11,19,8,17,10,13,6,20,14,9,18,11,16,7,22,12,8,19],
  [12,8,20,14,7,18,10,22,6,16,11,19,9,15,13,20,7,17,11,8,21,14,6,18,12,16,9,22,10,15],
  [9,18,12,7,21,15,10,17,8,20,13,6,19,11,16,9,22,14,7,18,12,10,20,8,15,13,21,6,17,11],
];

function Waveform({ index }) {
  const bars = WAVE_SEEDS[index % WAVE_SEEDS.length];
  return (
    <div className="epk-waveform" style={{ alignItems:"center", gap:2, height:24, width:80 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex:1, height:h, background:"var(--border)", borderRadius:2 }} />
      ))}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
    <polygon points="0,0 10,6 0,12" />
  </svg>
);

const EmailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:0.35 }}>
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-8.5-5.5l-2.51 3.01L7 14l-3 4h16l-4.5-6z"/>
  </svg>
);

// ── Shared style tokens ───────────────────────────────────────────────────────
const css = {
  mono: { fontFamily: "'Space Mono', monospace" },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--accent)",
    marginBottom: 12,
  },
  card: {
    background: "var(--surface)",
    border: "0.5px solid var(--border)",
    borderRadius: 12,
    padding: "1.25rem 1.5rem",
  },
};

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ artist }) {
  return (
    <div style={{
      position: "relative",
      minHeight: 340,
      background: "var(--hero-bg)",
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-end",
      padding: "2rem",
      marginBottom: "2rem",
      border: "0.5px solid var(--border)",
    }}>
      {/* grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(var(--hero-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid-line) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* glow */}
      <div style={{
        position: "absolute",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--hero-glow) 0%, transparent 70%)",
        top: -100, right: -80,
        pointerEvents: "none",
      }} />
      <div style={{ position:"relative", zIndex:2 }}>
        <p style={{ ...css.mono, fontSize:11, color: "var(--accent)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>
          // Artist Press Kit
        </p>
        <h1 className="epk-hero-title" style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, color:"#fff", lineHeight:1, margin:"0 0 8px" }}>
          {artist.name}
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", margin:0 }}>
          {`${artist.primary_genre} · ${artist.location}`}
        </p>
      </div>
    </div>
  );
}

// ── Bio + Stats ───────────────────────────────────────────────────────────────
function BioSection({ artist, stats }) {
  return (
    <div className="epk-bio-grid">
      <div style={css.card}>
        <p style={css.label}>// About</p>
        <p style={{ fontSize:14, lineHeight:1.75, color:"var(--text-muted)", margin:"0 0 1rem", whiteSpace: "pre-wrap" }}>
          {artist.biography}
        </p>
      </div>
      <div>
        <p style={css.label}>// Stats</p>
        <div className="epk-stats-grid">
          {artist.stats.map(s => (
            <div key={s.label} style={{
              background:"var(--surface)",
              border:"0.5px solid var(--border)",
              borderRadius:8,
              padding:"0.875rem",
              textAlign:"center",
              display: "flex",
              flexFlow: "column",
              height: "103px",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <span style={{ display:"block", fontFamily:"'Syne', sans-serif", fontSize:22, fontWeight:700, color:"var(--text)", lineHeight:1, marginBottom:4 }}>
                {s.value}
              </span>
              <span style={{ ...css.mono, fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop: "5px", wordSpacing: "100vw", }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Music ─────────────────────────────────────────────────────────────────────
function MusicSection({ tracks }) {
  return (
    <div style={{ marginBottom:"2rem" }}>
      <p style={css.label}>// Featured tracks</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {tracks.map((t, i) => (
          <div key={t.num} style={{
            display:"flex", alignItems:"center", gap:"1rem",
            background:"var(--surface)",
            border:"0.5px solid var(--border)",
            borderRadius:8,
            padding:"0.75rem 1rem",
          }}>
            <span style={{ ...css.mono, fontSize:11, color:"var(--text-muted)", width:18, textAlign:"right", flexShrink:0 }}>
              {t.num}
            </span>
            <button style={{
              width:28, height:28, borderRadius:"50%", background:"var(--accent)",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, cursor:"pointer", border:"none", padding:0,
              paddingLeft:2,
            }}>
              <PlayIcon />
            </button>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:500, color:"var(--text)", margin:"0 0 2px" }}>{t.title}</p>
              <p style={{ ...css.mono, fontSize:10, color:"var(--text-muted)", margin:0 }}>
                {t.label} · {t.year}
              </p>
            </div>
            <Waveform index={i} />
            <span style={{ ...css.mono, fontSize:11, color:"var(--text-muted)" }}>{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Photos ────────────────────────────────────────────────────────────────────
function PhotosSection({ photos }) {
  return (
    <div style={{ marginBottom:"2rem" }}>
      <p style={css.label}>// Press photos</p>
      <div className="epk-photos-grid">
        {photos.map(photo => (
          <div key={photo.label} style={{
            aspectRatio:"1",
            background:"var(--surface)",
            border:"0.5px solid var(--border)",
            borderRadius:8,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:6, color:"var(--text-muted)",
          }}>
            <ImageIcon />
            <span style={{ ...css.mono, fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", opacity:0.6 }}>
              {photo.label}
            </span>
            <button style={{
              ...css.mono,
              fontSize:10, padding:"5px 10px",
              borderRadius:6, border:"0.5px solid var(--border-strong)",
              color:"var(--text-muted)", cursor:"pointer",
              background:"transparent", textTransform:"uppercase",
              letterSpacing:"0.08em", marginTop:4,
            }}>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Press + Contact ───────────────────────────────────────────────────────────
function PressAndContact({ press, artist }) {
  return (
    <div className="epk-press-grid">
      <div style={css.card}>
        <p style={css.label}>// Press</p>
        {press.map((p, i) => (
          <div key={i} style={{
            borderLeft:`2px solid ${"var(--accent)"}`,
            paddingLeft:"1rem",
            marginBottom: i < press.length - 1 ? "1rem" : 0,
          }}>
            <p style={{ fontSize:13, fontStyle:"italic", color:"var(--text-muted)", lineHeight:1.6, margin:"0 0 4px" }}>
              "{p.quote}"
            </p>
            <p style={{ ...css.mono, fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>
              — {p.source}
            </p>
          </div>
        ))}
      </div>

      <div style={css.card}>
        <p style={css.label}>// Booking & contact</p>
        {[
          { icon:<EmailIcon />, label:"Booking",    value: artist.bookings },
          { icon:<PhoneIcon />, label:"Management", value: artist.management },
          { icon:<PinIcon />,   label:"Location",   value: artist.location },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 0",
            borderBottom: i < arr.length - 1 ? "0.5px solid var(--border)" : "none",
          }}>
            <div style={{
              width:28, height:28, borderRadius:6,
              background:"var(--accent-dim)",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0,
            }}>
              {row.icon}
            </div>
            <div>
              <p style={{ ...css.mono, fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 2px" }}>
                {row.label}
              </p>
              <p style={{ fontSize:13, fontWeight:500, color:"var(--text)", margin:0 }}>
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Links row ─────────────────────────────────────────────────────────────────
function LinksRow({ links }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:"2rem" }}>
      {links.map(link => (
        <a
          key={link.label}
          href={link.url}
          className="epk-link"
          style={{
            ...css.mono,
            fontSize:11, padding:"6px 14px",
            borderRadius:100,
            background:"transparent",
            textTransform:"uppercase", letterSpacing:"0.08em",
            textDecoration:"none",
            display:"flex", alignItems:"center", gap:6,
          }}
        >
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", flexShrink:0, display:"inline-block" }} />
          {link.label}
        </a>
      ))}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function EPK({ slug: slugProp }) {

  const params = useParams();
  const slug = slugProp ?? params.slug;
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/artists/${slug}`)
      .then((r) => r.json())
      .then(({ artist }) => setArtist(artist ?? null))
      .catch(() => setArtist(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div/>;
  if (!artist) return <div/>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;500;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: var(--bg);
          font-family: 'Syne', sans-serif;
          color: var(--text);
          min-height: 100vh;
        }
        button { font-family: inherit; }
        .epk-link { color: var(--text-muted); border: 0.5px solid var(--border-strong); transition: border-color 350ms, color 350ms; }
        .epk-link:hover { border-color: var(--accent); color: var(--accent); }
        .epk-hero-title { font-size: 52px; letter-spacing: -1px; }
        .epk-bio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .epk-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .epk-photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .epk-press-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .epk-waveform { display: flex; }
        @media (max-width: 600px) {
          .epk-hero-title { font-size: 36px; letter-spacing: -0.5px; }
          .epk-bio-grid { grid-template-columns: 1fr; }
          .epk-photos-grid { grid-template-columns: repeat(2, 1fr); }
          .epk-press-grid { grid-template-columns: 1fr; }
          .epk-waveform { display: none; }
        }
      `}</style>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <Hero artist={artist} />
        <LinksRow links={data.links} />
        <BioSection artist={artist} />
        <MusicSection tracks={data.tracks} />
        <PhotosSection photos={data.photos} />
        <PressAndContact press={data.press} contact={data.contact} artist={artist} />
      </div>
    </>
  );
}
