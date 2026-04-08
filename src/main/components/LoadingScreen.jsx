// src/main/components/LoadingScreen.jsx
import { useState, useEffect } from "react";
import Spinner from "@/components/Spinner";

// ── usePageLoad ───────────────────────────────────────────────────────────────
// Handles the fetch + minimum display time + fade-out timing in one place.
//
// Usage:
//   const { data, error, loading, fading } = usePageLoad(
//     () => fetch("/api/foo").then(r => r.json()),
//     { minLoadMs: 500 }
//   );
//
export function usePageLoad(fetchFn, { minLoadMs = 500, fadeDuration = 400 } = {}) {
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    Promise.resolve(fetchFn())
      .then((result) => {
        if (cancelled) return;
        setData(result);

        const remaining = Math.max(0, minLoadMs - (Date.now() - start));
        setTimeout(() => {
          if (cancelled) return;
          setFading(true);
          setTimeout(() => { if (!cancelled) setLoading(false); }, fadeDuration);
        }, remaining);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, loading, fading, fadeDuration };
}

// ── LoadingScreen ─────────────────────────────────────────────────────────────
// Full-page spinner that fades out when `fading` becomes true.
//
// Usage:
//   if (loading) return <LoadingScreen fading={fading} />;
//
const LoadingScreen = ({ fading = false, fadeDuration = 400 }) => (
  <div className="flex flex-col min-h-full" style={{ background: "var(--bg)" }}>
    <div
      className="flex-1 flex items-center justify-center"
      style={{
        opacity:    fading ? 0 : 1,
        transition: `opacity ${fadeDuration}ms ease-out`,
      }}
    >
      <Spinner />
    </div>
  </div>
);

export default LoadingScreen;

// ── FadeIn ────────────────────────────────────────────────────────────────────
// Mounts at opacity 0 then transitions to 1 on the next frame, preventing
// content from popping in after a loading screen.
//
// Usage:
//   return <FadeIn><MyPage /></FadeIn>;
//
export const FadeIn = ({ children, duration = 350, className = "", style = {} }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Double-RAF: the first frame lets the browser paint opacity:0,
    // the second triggers the transition so it's actually visible.
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transition: `opacity ${duration}ms ease-out`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
