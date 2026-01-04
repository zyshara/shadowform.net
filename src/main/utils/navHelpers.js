import navlinks from "@/data/navlinks";

export function getNavContext(pathname) {
  if (!Array.isArray(navlinks) || navlinks.length === 0) {
    return { current: null, prev: null, next: null };
  }

  const index = navlinks.findIndex((link) => link.url === pathname);

  if (index === -1) {
    return { current: null, prev: null, next: null };
  }

  const current = navlinks[index];
  const prev = index > 0 ? navlinks[index - 1] : null;
  const next = index < navlinks.length - 1 ? navlinks[index + 1] : null;

  return { current, prev, next };
}
