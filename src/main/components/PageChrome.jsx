// src/main/components/PageChrome.jsx

import { Link, matchPath, useLocation } from "react-router-dom";
import routes from "@/data/routes";
import { usePageCrumbContext } from "@/context/PageCrumbContext";

const routeFor = (pathname) =>
  routes.find((route) => matchPath({ path: route.path, end: true }, pathname));

// walk each path segment (/about, /about/arthur-morgan, ...) and resolve a
// crumb label + link for every ancestor, so subpages show a full trail.
const crumbTrail = (pathname) => {
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);

  if (segments.length === 0) return [{ path: "/", label: "home" }];

  let acc = "";
  return segments.map((segment) => {
    acc += `/${segment}`;
    const match = routeFor(acc);
    return { path: acc, label: match?.crumb ?? segment };
  });
};

const PageChrome = ({ children }) => {
  const { pathname } = useLocation();
  const { crumb: override } = usePageCrumbContext() ?? {};
  const trail = crumbTrail(pathname);

  // a page can override its own deepest segment once it has data
  // PageChrome can't know about (e.g. an archive project's CMS eyebrow)
  if (override?.pathname === pathname && trail.length > 0) {
    trail[trail.length - 1] = { ...trail[trail.length - 1], label: override.label };
  }

  return (
    <div className="flex flex-col w-full justify-center">
      <p className="text-[9px] uppercase tracking-[0.2em] flex flex-wrap items-center gap-1" style={{ color: "white" }}>
        <span>{"//"}</span>
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <span key={crumb.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true">➺</span>}
              {isLast ? (
                <span>{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="transition-colors hover:underline hover:text-[var(--pink-text)]"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </p>
    </div>
  );
};

export default PageChrome;
