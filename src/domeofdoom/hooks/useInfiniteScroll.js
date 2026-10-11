import { useEffect, useRef, useState } from "react";

// Renders `pageSize` items initially, then loads `pageSize` more each time
// the sentinel div scrolls into view.
// Reset to the first page whenever `items` identity changes (filter/sort).
export function useInfiniteScroll(items, pageSize = 30) {
  const [count, setCount] = useState(pageSize);
  const sentinelRef = useRef(null);

  // Reset when the filtered list changes
  useEffect(() => {
    setCount(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCount((c) => Math.min(c + pageSize, items.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [items, pageSize]);

  return {
    visibleItems: items.slice(0, count),
    sentinelRef,
    hasMore: count < items.length,
    total: items.length,
  };
}
