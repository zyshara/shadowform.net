// src/main/components/Scrollbar.jsx

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const MIN_THUMB_HEIGHT = 24;

const Scrollbar = ({ targetRef }) => {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const [thumb, setThumb] = useState({ top: 0, height: 0, scrollable: false });
  const { pathname } = useLocation();

  const recalc = useCallback(() => {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    // AnimatePresence briefly mounts the incoming page alongside the
    // outgoing one during a route transition — invisible (opacity: 0) but
    // still present, so it still counts toward el's scrollHeight. Measuring
    // during that overlap produces a transient, wrong value that snaps in
    // instantly (no CSS transition on height/transform), which read as a
    // "shift" right before the real fade-out/fade-in. Skip it; the mutation
    // that drops back to a single child fires the real recalc once settled.
    if (el.children.length > 1) return;

    const trackHeight = track.clientHeight;
    const { scrollHeight, clientHeight, scrollTop } = el;

    if (scrollHeight <= clientHeight) {
      // keep the last top/height as-is so the thumb just fades out in place
      // instead of first snapping to full track length, then fading
      setThumb((prev) => (prev.scrollable ? { ...prev, scrollable: false } : prev));
      return;
    }

    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT);
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollRatio = scrollTop / (scrollHeight - clientHeight);
    setThumb({ top: scrollRatio * maxThumbTop, height: thumbHeight, scrollable: true });
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // coalesce scroll events to one recalc per frame — scroll fires far
    // more often than the display can paint, and setState on every event
    // is what was causing the stutter. Mutation/resize events are rare by
    // comparison, so those recalc directly rather than risking a dropped
    // rAF callback (e.g. in a backgrounded/inactive tab) leaving the thumb
    // stuck stale.
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        recalc();
      });
    };

    recalc();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recalc);

    // el itself keeps a fixed height (it's the overflow-y-auto container),
    // so this only catches size changes to el's own box.
    const resizeObserver = new ResizeObserver(recalc);
    resizeObserver.observe(el);

    // catches content swaps that change scrollHeight without changing el's
    // own box — a loading screen replaced by real content, images inserting,
    // async data (like the guestbook entry) appearing after mount.
    const mutationObserver = new MutationObserver(recalc);
    mutationObserver.observe(el, { childList: true, subtree: true });

    // an <img> being inserted (caught above) isn't the same moment it
    // finishes loading — it grows from 0 to its real intrinsic size only
    // once the resource decodes, which is neither a mutation nor a resize
    // of el itself. 'load' doesn't bubble, so this has to be a capture
    // listener to catch it from any descendant image.
    el.addEventListener("load", recalc, true);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recalc);
      el.removeEventListener("load", recalc, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [targetRef, recalc]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // el itself keeps a fixed height across routes, so neither the scroll
    // listener nor the ResizeObserver above fires when navigating to a page
    // whose content is a different length — recalc explicitly, and start
    // the new page scrolled to the top rather than at the old page's offset.
    el.scrollTop = 0;
    recalc();
  }, [pathname, targetRef, recalc]);

  const onThumbMouseDown = (e) => {
    e.preventDefault();
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    dragRef.current = {
      startY: e.clientY,
      startScrollTop: el.scrollTop,
      trackHeight: track.clientHeight,
      thumbHeight: thumb.height,
      scrollableHeight: el.scrollHeight - el.clientHeight,
    };
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const maxThumbTop = drag.trackHeight - drag.thumbHeight;
      if (maxThumbTop <= 0) return;
      const deltaY = moveEvent.clientY - drag.startY;
      const deltaScroll = (deltaY / maxThumbTop) * drag.scrollableHeight;
      el.scrollTop = Math.min(Math.max(drag.startScrollTop + deltaScroll, 0), drag.scrollableHeight);
    };

    const onMouseUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={trackRef}
      className="block relative w-[10px] max-h-[calc(100dvh-80px)] my-[40px] lg:w-[14px] lg:h-[424px] rounded-[2px] border h-full ml-[10px]"
      style={{ background: "#07060e", borderColor: "#1c1428" }}
    >
      <div
        onMouseDown={onThumbMouseDown}
        className="absolute left-0 top-0 w-full rounded-[2px] cursor-pointer will-change-transform"
        style={{
          transform: `translateY(${thumb.top}px)`,
          height: thumb.height,
          background: "var(--pink-text)",
          opacity: thumb.scrollable ? 1 : 0,
          pointerEvents: thumb.scrollable ? "auto" : "none",
          transition: "opacity 200ms ease-out",
        }}
      />
    </div>
  );
};

export default Scrollbar;
