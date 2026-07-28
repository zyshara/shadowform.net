import {
  About,
  Contact,
  Creative,
  Engineering,
  Enter,
  Guestbook,
  ArtistManagement,
  NotFound,
  Resume,
  Shop,
  UnderConstruction,
} from "@/pages";

const navlinks = [
  {
    id: "about",
    url: "/about",
    text: "About",
    crumb: "home",
    hideFromNav: true,
    component: About,
  },
  {
    id: "management",
    url: "/management",
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
    url: "/engineering",
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
    id: "laboratory",
    url: "/laboratory",
    text: "Laboratory",
    crumb: "laboratory",
    component: UnderConstruction,
    redirects: ["/creative"],
  },
  {
    id: "shop",
    url: "/shop",
    text: "Shop",
    crumb: "shop",
    component: UnderConstruction,
  },
  {
    id: "contact",
    url: "/contact",
    text: "Contact",
    crumb: "contact",
    component: UnderConstruction,
  },
  {
    id: "guestbook",
    url: "/guestbook",
    text: "Guestbook",
    crumb: "guestbook",
    hideFromNav: true,
    component: Guestbook,
  },
];

export default navlinks;
