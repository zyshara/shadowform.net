// src/shared/hooks/useScrollToTop.js
//
// Resets scroll to the top on route change. Uses useLayoutEffect (not
// useEffect) so it runs before paint — otherwise the first frame can
// briefly show whatever scroll position the browser restored.

import { useLayoutEffect } from "react";

export function useScrollToTop(key) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);
}
