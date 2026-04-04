// src/main/Layout.jsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DesktopNavbar, MobileNavbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[200px_1fr] min-h-dvh w-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* ── Sidebar (desktop only) ── */}
      <aside
        className="hidden lg:flex flex-col pt-7 pb-5 items-center border-r"
        style={{
          background: "var(--bg-sidebar)",
          borderColor: "var(--border)",
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
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Layout;
