import {
  About,
  Contact,
  Creative,
  Development,
  Enter,
  Management,
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
    id: "management",
    url: "/management",
    text: "Management",
    component: Management,
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
