import { useEffect } from "react";

export function usePageTitle(pageTitle) {
  useEffect(() => {
    const base = "Dome of Doom";
    document.title = pageTitle ? `${pageTitle} — ${base}` : base;
    return () => { document.title = base; };
  }, [pageTitle]);
}
