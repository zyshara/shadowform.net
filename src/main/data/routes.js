// src/main/data/routes.js
//
// Single source of truth for every route under Layout: path, nav label,
// breadcrumb text (PageChrome), component, and any redirects/props it needs.
// App.jsx generates <Route> elements from this list, and PageChrome/Navbar/
// MobileMenu/UnderConstruction all resolve labels from it too, via matchPath.

import {
  About,
  ArtistManagement,
  Engineering,
  EngineeringArchive,
  EngineeringWebArchiveProject,
  Guestbook,
  UnderConstruction,
} from "@/pages";

const routes = [
  {
    id: "about",
    path: "/about",
    text: "About",
    crumb: "about",
    hideFromNav: true,
    component: About,
  },
  {
    id: "arthur-morgan",
    path: "/about/arthur-morgan",
    crumb: "arthur morgan",
    hideFromNav: true,
    component: UnderConstruction,
  },
  {
    id: "kilrogg-deadeye",
    path: "/about/kilrogg-deadeye",
    crumb: "kilrogg deadeye",
    hideFromNav: true,
    component: UnderConstruction,
  },
  {
    id: "guardian-lulu",
    path: "/about/guardian-lulu",
    crumb: "guardian lulu",
    hideFromNav: true,
    component: UnderConstruction,
  },
  {
    id: "management",
    path: "/management",
    text: "Artist Mgmt.",
    crumb: "artist management",
    component: ArtistManagement,
    redirects: [
      "/artist-mgmt",
      "/artistmgmt",
      "/artist-management",
      "/artistmanagement",
    ],
  },
  {
    id: "engineering",
    path: "/engineering",
    text: "Engineering",
    crumb: "engineering",
    component: Engineering,
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
    component: EngineeringArchive,
  },
  {
    id: "engineering-archive-project",
    path: "/engineering/archive/:slug",
    crumb: "the archive",
    hideFromNav: true,
    component: EngineeringWebArchiveProject,
  },
  {
    id: "laboratory",
    path: "/laboratory",
    text: "Laboratory",
    crumb: "laboratory",
    component: UnderConstruction,
    redirects: ["/creative"],
  },
  {
    id: "shop",
    path: "/shop",
    text: "Shop",
    crumb: "shop",
    component: UnderConstruction,
  },
  {
    id: "contact",
    path: "/contact",
    text: "Contact",
    crumb: "contact",
    component: UnderConstruction,
  },
  {
    id: "guestbook",
    path: "/guestbook",
    text: "Guestbook",
    crumb: "guestbook",
    hideFromNav: true,
    component: Guestbook,
  },
];

export default routes;
