// src/main/components/PageChrome.jsx

import { useLocation } from "react-router-dom";
import navlinks from "@/data/navlinks";

const crumbFor = (pathname) => {
  const match = navlinks.find((n) => pathname === n.url || pathname.startsWith(n.url + "/"));
  if (match) return match.crumb ?? match.text.toLowerCase();
  if (pathname.startsWith("/engineering/archive")) return "archive";
  return pathname.replace(/^\//, "").split("/")[0] || "home";
};

const PageChrome = ({ children }) => {
  const { pathname } = useLocation();
  const crumb = crumbFor(pathname);

  return (
    <div className="flex flex-col w-full justify-center">
      <p
        className="text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "white" }}
      >
        {`// ${crumb}`}
      </p>
    </div>
  );
};

export default PageChrome;
