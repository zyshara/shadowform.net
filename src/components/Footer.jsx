import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import navlinks from "@/data/navlinks";
import socials from "@/data/socials.json";
import { iconMap } from "@/assets/icons";

const Footer = () => {
  const location = useLocation();

  const curIndex = navlinks.findIndex(
    (navlink) => navlink.url === location.pathname,
  );

  const prev =
    curIndex !== -1
      ? navlinks[(curIndex - 1 + navlinks.length) % navlinks.length]
      : null;

  const next =
    curIndex !== -1 ? navlinks[(curIndex + 1) % navlinks.length] : null;

  const divider = <div className="w-[1px] h-[20px] bg-black" />;

  return (
    <footer className="relative shrink-0 h-[56px]">
      <div className="flex w-full bg-black h-[13px]" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-center px-4 font-alkhemikal text-[20px] lowercase">
        <NavLink className="text-[min(4.1vw,20px)]" to={prev.url}>
          &lt; {prev.text}
        </NavLink>

        <div className="flex items-center justify-center">
          {socials.map((link, idx) => {
            return (
              <>
                <a href={link.url} key={link.id} target="_blank">
                  <img
                    className="h-[min(12vw,40px)] mx-[5px]"
                    src={iconMap[link.id]}
                  />
                </a>
                {idx < socials.length - 1 ? divider : null}
              </>
            );
          })}
        </div>

        <NavLink className="text-right text-[min(4.1vw,20px)]" to={next.url}>
          {next.text} &gt;
        </NavLink>
      </div>
    </footer>
  );
};

export default Footer;
