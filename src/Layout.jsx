import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { Navbar, Footer, MobileMenu } from "@/components";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-black">
      <div className="flex w-full md:max-w-[800px] min-h-dvh h-dvh bg-white flex-col">
        <Navbar onMenuOpen={() => setMenuOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto px-4">
          <Outlet />
        </main>
        <Footer />
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </div>
  );
};

export default Layout;
