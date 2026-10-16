import routes from "@/data/routes";

export function getNavContext(pathname) {
  if (!Array.isArray(routes) || routes.length === 0) {
    return { current: null, prev: null, next: null };
  }

  const index = routes.findIndex((route) => route.path === pathname);

  if (index === -1) {
    return { current: null, prev: null, next: null };
  }

  const current = routes[index];
  const prev = index > 0 ? routes[index - 1] : null;
  const next = index < routes.length - 1 ? routes[index + 1] : null;

  return { current, prev, next };
}
