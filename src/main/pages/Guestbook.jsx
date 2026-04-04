// src/main/pages/Guestbook.jsx

import { useState, useEffect, useRef } from "react";
import Ornament from "@/components/Ornament";
import Spinner from "@/components/Spinner";

const MIN_LOAD_MS = 500;
const FADE_MS     = 400;

// ── Blinking cursor ───────────────────────────────────────────────────────────
const Cursor = () => (
  <span
    className="inline-block w-[7px] h-[11px] align-middle ml-[2px]"
    style={{
      background: "var(--pink-text)",
      animation:  "gbBlink .8s step-end infinite",
    }}
  />
);

// ── Single log entry ──────────────────────────────────────────────────────────
const LogEntry = ({ entry }) => (
  <div
    className="flex gap-2 items-baseline flex-wrap py-[10px] border-b"
    style={{ borderColor: "var(--border-soft)" }}
  >
    <span
      className="font-alkhemikal text-[7px] tracking-[.08em] flex-shrink-0"
      style={{ color: "var(--text-dim)" }}
    >
      [{entry.date}]
    </span>
    <span
      className="font-alkhemikal text-[9px] tracking-[.06em] flex-shrink-0"
      style={{ color: "var(--pink-text)" }}
    >
      {entry.name}
    </span>
    <span style={{ color: "var(--text-dim)", fontSize: 9 }}>—</span>
    <span
      className="font-fell italic text-[12px] leading-[1.65]"
      style={{ color: "var(--text-body)" }}
    >
      {entry.message}
    </span>
  </div>
);

// ── Prompt input row ──────────────────────────────────────────────────────────
const PromptRow = ({ label, value, onChange, placeholder, inputRef }) => (
  <div className="flex items-center gap-2">
    <span
      className="font-alkhemikal text-[8px] tracking-[.06em] flex-shrink-0 w-[38px]"
      style={{ color: "var(--text-nav-inactive)" }}
    >
      {label}<span style={{ color: "var(--pink-text)" }}> &gt;</span>
    </span>
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 font-fell italic text-[12px] bg-transparent border-none outline-none border-b"
      style={{
        color:             "var(--text-body)",
        borderBottomColor: "var(--border-soft)",
        paddingBottom:     "2px",
      }}
    />
  </div>
);

// ── Guestbook page ────────────────────────────────────────────────────────────
const Guestbook = () => {
  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fading,     setFading]     = useState(false);
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const [name,    setName]    = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");

  const nameRef = useRef(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const start = Date.now();

    fetch("/api/guestbook")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(({ data }) => {
        console.log(data)
        setEntries([]);
        const remaining = Math.max(0, MIN_LOAD_MS - (Date.now() - start));
        setTimeout(() => {
          setFading(true);
          setTimeout(() => setLoading(false), FADE_MS);
        }, remaining);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), website: website.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setName(""); setWebsite(""); setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <div
        className="flex-1 flex items-center justify-center"
        style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
      >
        <Spinner />
      </div>
    </div>
  );

  // ── error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
      <Ticker text="guestbook" />
      <div className="flex-1 flex items-center justify-center">
        <p className="font-fell italic text-[13px]" style={{ color: "var(--text-nav-inactive)" }}>
          something went wrong — {error}
        </p>
      </div>
    </div>
  );

  // ── loaded ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes gbBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>

        <div className="flex-1 flex flex-col px-10 py-8 max-w-[600px] w-full mx-auto">

          {/* intro — matches Management header */}
          <div
            className="flex flex-col gap-2 pb-6 mb-6 border-b"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <p
              className="text-[7px] tracking-[0.2em] uppercase"
              style={{ color: "var(--pink-text)" }}
            >
              // guestbook
            </p>

            <h1
              className="font-alagard text-[28px] tracking-[2px] font-normal leading-tight lowercase"
              style={{ color: "var(--text-heading)" }}
            >
              sign the book
            </h1>

            <p
              className="font-fell text-[14px] leading-[1.85]"
              style={{ color: "var(--text-body)" }}
            >
              leave a note, a hello, or whatever's on your mind.
            </p>
          </div>

          {/* form */}
          <div
            className="flex flex-col gap-3 p-4 border rounded-[2px] mb-6"
            style={{ background: "var(--bg-ticker)", borderColor: "var(--border-soft)" }}
          >
            <PromptRow label="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name..." inputRef={nameRef} />
            <PromptRow label="url"  value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="optional" />

            {/* message */}
            <div className="flex items-start gap-2">
              <span
                className="font-alkhemikal text-[8px] tracking-[.06em] flex-shrink-0 w-[38px] mt-[3px]"
                style={{ color: "var(--text-nav-inactive)" }}
              >
                msg<span style={{ color: "var(--pink-text)" }}> &gt;</span>
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="say something..."
                rows={2}
                className="flex-1 font-fell italic text-[12px] bg-transparent border-none outline-none resize-none border-b leading-[1.7]"
                style={{
                  color:             "var(--text-body)",
                  borderBottomColor: "var(--border-soft)",
                  paddingBottom:     "2px",
                }}
              />
              {!submitting && <Cursor />}
            </div>

            {/* submit hint */}
            <div className="flex items-center gap-2 pl-[46px]">
              <span className="font-alkhemikal text-[7px] tracking-[.08em]" style={{ color: "var(--text-dim)" }}>press</span>
              <span
                className="font-alkhemikal text-[7px] tracking-[.08em] px-[6px] py-[1px] border rounded-[2px]"
                style={{ color: "var(--pink-text)", borderColor: "var(--pink-border)", background: "var(--pink-bg)" }}
              >
                enter
              </span>
              <span className="font-alkhemikal text-[7px] tracking-[.08em]" style={{ color: "var(--text-dim)" }}>to sign</span>
              {submitted  && <span className="font-alkhemikal text-[7px] tracking-[.08em] ml-2" style={{ color: "var(--pink-text)" }}>✦ signed</span>}
              {submitting && <span className="font-alkhemikal text-[7px] tracking-[.08em] ml-2" style={{ color: "var(--text-nav-inactive)" }}>writing...</span>}
            </div>
          </div>

          {/* entries label — matches Management roster label */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="font-alkhemikal text-[9px] tracking-[0.2em] uppercase"
              style={{ color: "var(--ornament-glyph)" }}
            >
              ✦ &nbsp; entries
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "linear-gradient(to right, var(--ornament-line), transparent)" }}
            />
            <span
              className="font-alkhemikal text-[7px] tracking-[.1em] uppercase"
              style={{ color: "var(--text-dim)" }}
            >
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* error */}
          {error && (
            <p className="font-fell italic text-[12px] mb-4" style={{ color: "var(--pink-text)" }}>
              error: {error}
            </p>
          )}

          {/* log entries */}
          <div className="flex flex-col">
            {entries.length === 0 && !error && (
              <span className="font-fell italic text-[12px]" style={{ color: "var(--text-nav-inactive)" }}>
                no entries yet — be the first to sign.
              </span>
            )}
            {entries.map((entry, i) => (
              <LogEntry key={entry.id ?? i} entry={entry} />
            ))}
          </div>

          <Ornament className="mt-8 self-center" />
        </div>
      </div>
    </>
  );
};

export default Guestbook;
