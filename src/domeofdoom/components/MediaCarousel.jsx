import { useEffect, useId, useRef, useState } from "react";
import HomeSectionHeader from "@/components/HomeSectionHeader";
import ArrowButton from "@/components/ArrowButton";

export default function MediaCarousel({ title, items, kind, renderItem }) {
  const trackRef = useRef(null);
  const trackId = useId();
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const track = trackRef.current;
    const measure = () => setEdges({ start: track.scrollLeft <= 1, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 });
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [items.length]);
  const step = direction => {
    const track = trackRef.current;
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    // Advance by the visible group: one card on mobile, two videos on desktop.
    track.scrollTo({ left: Math.max(0, Math.min(max, track.scrollLeft + direction * (track.clientWidth + 24))), behavior: "instant" });
  };
  return <section aria-label={title} className={`event-media-${kind}`}>
    <HomeSectionHeader title={title} count={items.length} />
    <div ref={trackRef} id={trackId} className="event-media-track" tabIndex={0} role="group" aria-label={`${title} carousel`}>
      {items.map((item, index) => <div key={item.id} className="event-media-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}`}>{renderItem(item)}</div>)}
    </div>
    {items.length > 1 && <div className="mt-5 flex justify-end gap-3">
      <ArrowButton direction="left" color="lilac" className="h-11 w-11" aria-label={`Previous ${title.toLowerCase()}`} aria-controls={trackId} disabled={edges.start} onClick={() => step(-1)} />
      <ArrowButton direction="right" color="lilac" className="h-11 w-11" aria-label={`Next ${title.toLowerCase()}`} aria-controls={trackId} disabled={edges.end} onClick={() => step(1)} />
    </div>}
  </section>;
}
