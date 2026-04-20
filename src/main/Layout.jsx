// src/main/Layout.jsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DesktopNavbar, MobileNavbar } from "@/components/Navbar";
import MobileMenu from "@/components/MobileMenu";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[200px_1fr] min-h-dvh w-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* ── Sidebar (desktop only) — sticky, stays in viewport while page scrolls ── */}
      <aside
        className="hidden lg:flex flex-col pt-7 pb-5 items-center border-r"
        style={{
          background: "var(--bg-sidebar)",
          borderColor: "var(--border)",
          position: "sticky",
          top: 0,
          height: "100dvh",
        }}
      >
        <DesktopNavbar />
      </aside>

      {/* ── Main column ── */}
      <div
        className="flex flex-col min-h-dvh"
        style={{ background: "var(--bg)" }}
      >
        <MobileNavbar onMenuOpen={() => setMenuOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Layout;
