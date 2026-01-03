import {
  Enter,
  About,
  Resume,
  Development,
  Creative,
  Shop,
  Contact,
  NotFound,
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
    id: "resume",
    url: "/resume",
    text: "Resume",
    component: UnderConstruction,
  },
  {
    id: "development",
    url: "/development",
    text: "Development",
    component: UnderConstruction,
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
];

export default navlinks;
