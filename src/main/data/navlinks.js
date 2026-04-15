import {
  About,
  Contact,
  Creative,
  Development,
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
    component: About,
  },
  {
    id: "artist-management",
    url: "/artist-management",
    text: "Artist Mgmt",
    component: ArtistManagement,
  },
  {
    id: "development",
    url: "/development",
    text: "Development",
    component: Development,
  },
  {
    id: "creative",
    url: "/creative",
    text: "Creative",
    component: UnderConstruction,
  },
  {
    id: "shop",
    url: "/shop",
    text: "Shop",
    component: UnderConstruction,
  },
  {
    id: "contact",
    url: "/contact",
    text: "Contact",
    component: UnderConstruction,
  },
  {
    id: "guestbook",
    url: "/guestbook",
    text: "Guestbook",
    component: Guestbook,
  },
];

export default navlinks;
