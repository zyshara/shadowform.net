import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

import { DesktopNavbar, MobileNavbar, Footer, MobileMenu } from "@/components";

import cherry_blossom from "@shared/assets/images/cherry_blossom.png";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] min-h-dvh w-full items-center justify-center bg-black">
      <div className="hidden w-full h-full lg:block">
        <NavLink
          to="/"
          className="flex flex-col asbolute right-0 items-end m-[11px]"
        >
          <img src={cherry_blossom} className="w-[40px] white-hard-border" />
          <div className="whitespace-pre-line [writing-mode:vertical-rl] text-white font-alagard text-[30px] tracking-[5px] mt-[14px] mr-[-3px] mb-[15px]">
            shadowform.net
          </div>
          <DesktopNavbar onMenuOpen={() => setMenuOpen(true)} />
        </NavLink>
      </div>

      <div className="flex w-full lg:w-[600px] min-h-dvh h-dvh bg-white flex-col">
        <div className="flex lg:hidden w-full bg-black h-[13px]"/>
        <MobileNavbar onMenuOpen={() => setMenuOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <Outlet />
        </main>
        <Footer />
        <div className="flex lg:hidden w-full bg-black h-[13px]"/>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>

      <div className="hidden lg:block" />
    </div>
  );
};

export default Layout;
