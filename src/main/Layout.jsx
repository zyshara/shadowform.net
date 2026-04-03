// src/main/Layout.jsx
// Design 1 BW — sidebar layout, black surround, white content panel
 
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { DesktopNavbar, MobileNavbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
 
const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] min-h-dvh w-full bg-[#0d0d0d]">
 
      {/* ── Sidebar (desktop only) ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col bg-[#0a0a0a] border-r border-[#222] pt-7 pb-5 items-center">
        <DesktopNavbar />
      </aside>
 
      {/* ── Main column ───────────────────────────────────── */}
      <div className="flex flex-col min-h-dvh bg-[#111]">
 
        {/* mobile top bar */}
        <MobileNavbar onMenuOpen={() => setMenuOpen(true)} />
 
        {/* page content */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
 
        <Footer />
      </div>
 
      {/* mobile slide-over menu */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};
 
export default Layout;
