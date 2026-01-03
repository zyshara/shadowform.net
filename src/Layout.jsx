import React, { useState } from "react";
import { NavLink } from "react-router";
import { Outlet } from "react-router-dom";

import { Navbar, Footer, MobileMenu } from "@/components";

import cherry_blossom from "@/assets/images/cherry_blossom.png";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] min-h-dvh w-full items-center justify-center bg-black">
      <div className="hidden w-full h-full md:block">
        <NavLink
          to="/"
          className="flex flex-col asbolute right-0 items-end m-[11px]"
        >
          <img src={cherry_blossom} className="w-[45px] white-hard-border" />
          <div className="whitespace-pre-line [writing-mode:vertical-rl] text-white font-alagard text-[34px] tracking-[5px] mt-[14px] mr-[-3px]">
            shadowform.net
          </div>
        </NavLink>
      </div>

      <div className="flex w-full lg:w-[800px] md:w-[80vw] min-h-dvh h-dvh bg-white flex-col">
        <Navbar onMenuOpen={() => setMenuOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto px-4">
          <Outlet />
        </main>
        <Footer />
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>

      <div className="hidden md:block" />
    </div>
  );
};

export default Layout;
