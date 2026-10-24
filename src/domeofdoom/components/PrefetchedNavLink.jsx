import { useCallback, useEffect, useRef } from "react";
import { NavLink, useFetcher, useLocation } from "react-router";

// Framework link prefetch warms route modules, but routes with clientLoader
// need a loader invocation to seed our in-memory data cache as well.
const DATA_ROUTES = new Set(["/", "/catalog", "/roster", "/press"]);

export default function PrefetchedNavLink({ to, warm = false, ...props }) {
  const fetcher = useFetcher();
  const { pathname } = useLocation();
  const warmed = useRef(false);
  const connection = typeof navigator !== "undefined" ? navigator.connection : null;
  const shouldWarm = warm && !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType);
  const warmData = useCallback(() => {
    if (DATA_ROUTES.has(to) && to !== pathname && fetcher.state === "idle") {
      void fetcher.load(`${to}?_preload=1`);
    }
  }, [to, pathname, fetcher.state, fetcher.load]);
  useEffect(() => {
    if (!shouldWarm) { warmed.current = false; return; }
    if (warmed.current) return;
    warmed.current = true;
    warmData();
  }, [shouldWarm, warmData]);
  return <NavLink {...props} to={to} prefetch={shouldWarm ? "render" : "intent"} onMouseEnter={warmData} onFocus={warmData} />;
}
