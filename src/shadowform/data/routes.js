// src/shadowform/data/routes.js
//
// Single source of truth for every route under Layout: path, nav label,
// breadcrumb text (PageChrome), and legacy redirects.
// React Router route config reads paths/redirects from this list; PageChrome/Navbar/
// MobileMenu/UnderConstruction all resolve labels from it too, via matchPath.

const routes = [
  {
    id: "about",
    path: "/about",
    text: "About",
    crumb: "about",
  },
  {
    id: "arthur-morgan",
    path: "/about/arthur-morgan",
    crumb: "arthur morgan",
    hideFromNav: true,
  },
  {
    id: "kilrogg-deadeye",
    path: "/about/kilrogg-deadeye",
    crumb: "kilrogg deadeye",
    hideFromNav: true,
  },
  {
    id: "guardian-lulu",
    path: "/about/guardian-lulu",
    crumb: "guardian lulu",
    hideFromNav: true,
  },
  {
    id: "engineering",
    path: "/engineering",
    text: "Engineering",
    crumb: "engineering",
    redirects: [
      "/software",
      "/software-engineering",
      "/development",
      "/software-eng",
      "/softwareengineering",
      "/softwareeng",
    ],
  },
  {
    id: "engineering-archive",
    path: "/engineering/archive",
    crumb: "archive",
    hideFromNav: true,
  },
  {
    id: "engineering-archive-project",
    path: "/engineering/archive/:slug",
    crumb: "the archive",
    hideFromNav: true,
  },
  {
    id: "laboratory",
    path: "/laboratory",
    text: "Laboratory",
    crumb: "laboratory",
    redirects: ["/creative"],
  },
  {
    id: "shop",
    path: "/shop",
    text: "Shop",
    crumb: "shop",
  },
  {
    id: "contact",
    path: "/contact",
    text: "Contact",
    crumb: "contact",
  },
  {
    id: "guestbook",
    path: "/guestbook",
    text: "Guestbook",
    crumb: "guestbook",
    hideFromNav: true,
  },
];

export default routes;
