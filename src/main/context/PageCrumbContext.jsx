// src/main/context/PageCrumbContext.jsx
//
// Lets a page override its own (deepest) breadcrumb segment once it has
// data PageChrome can't know about — e.g. an archive project's CMS eyebrow.
// PageChrome renders as a sibling of <Outlet/> in Layout.jsx, so they share
// this context rather than passing props directly.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const PageCrumbContext = createContext(null);

export const PageCrumbProvider = ({ children }) => {
  const [crumb, setCrumb] = useState(null); // { pathname, label } | null
  const value = useMemo(() => ({ crumb, setCrumb }), [crumb]);

  return (
    <PageCrumbContext.Provider value={value}>
      {children}
    </PageCrumbContext.Provider>
  );
};

export const usePageCrumbContext = () => useContext(PageCrumbContext);

// Call from a page component with its dynamic label once loaded
// (pass null/undefined while loading — the route's static crumb shows instead).
export const usePageCrumb = (label) => {
  const { setCrumb } = usePageCrumbContext() ?? {};
  const { pathname } = useLocation();

  useEffect(() => {
    if (!setCrumb || !label) return;
    // bail out (return the same reference) when nothing actually changed,
    // so React skips the re-render instead of looping through this effect
    setCrumb((prev) =>
      prev?.pathname === pathname && prev?.label === label ? prev : { pathname, label }
    );
  }, [setCrumb, pathname, label]);
};
