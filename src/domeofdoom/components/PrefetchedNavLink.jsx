import { NavLink, useFetcher, useLocation } from "react-router";

// Framework link prefetch warms route modules, but routes with clientLoader
// need a loader invocation to seed our in-memory data cache as well.
const DATA_ROUTES = new Set(["/", "/catalog", "/roster", "/press"]);

export default function PrefetchedNavLink({ to, ...props }) {
  const fetcher = useFetcher();
  const { pathname } = useLocation();
  const warmData = () => {
    if (DATA_ROUTES.has(to) && to !== pathname && fetcher.state === "idle") {
      void fetcher.load(`${to}?_preload=1`);
    }
  };
  return <NavLink {...props} to={to} prefetch="intent" onMouseEnter={warmData} onFocus={warmData} />;
}
