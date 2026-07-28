// src/main/components/Scrollbar.jsx

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_THUMB_HEIGHT = 24;

const Scrollbar = ({ targetRef }) => {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const [thumb, setThumb] = useState({ top: 0, height: 0 });

  const recalc = useCallback(() => {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const trackHeight = track.clientHeight;
    const { scrollHeight, clientHeight, scrollTop } = el;

    if (scrollHeight <= clientHeight) {
      setThumb({ top: 0, height: trackHeight });
      return;
    }

    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT);
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollRatio = scrollTop / (scrollHeight - clientHeight);
    setThumb({ top: scrollRatio * maxThumbTop, height: thumbHeight });
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    recalc();
    el.addEventListener("scroll", recalc);
    window.addEventListener("resize", recalc);

    const resizeObserver = new ResizeObserver(recalc);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
      resizeObserver.disconnect();
    };
  }, [targetRef, recalc]);

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
        className="absolute left-0 w-full rounded-[2px] cursor-pointer"
        style={{
          top: thumb.top,
          height: thumb.height,
          background: "var(--pink-text)",
        }}
      />
    </div>
  );
};

export default Scrollbar;
