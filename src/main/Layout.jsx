// src/main/Layout.jsx

import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { DesktopNavbar, MobileNavbar } from "@/components/Navbar";
import MobileMenu from "@/components/MobileMenu";
import PageChrome from "@/components/PageChrome";
import Footer from "@/components/Footer";
import Scrollbar from "@/components/Scrollbar";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef(null);

  return (
    <div className="flex min-h-dvh max-h-dvh w-full" style={{ background: "#0e0c14" }}>
      <div className="grid items-center justify-center grid-cols-[50px_1fr_50px] lg:grid-cols-[1fr_auto_1fr] w-full">
        {/* ── Sidebar (desktop only) — sticky, stays in viewport while page scrolls ── */}
        <aside className="flex flex-col justify-center items-center h-full">
          <DesktopNavbar />
        </aside>

        {/* ── Main column ── */}
        <div className="grid justify-center items-center w-full h-full grid-rows-[40px_auto_40px] content-center">
          <PageChrome className="justify-end"/>
          <div
            ref={contentRef}
            className="px-8 py-8 flex flex-col border w-full lg:w-[716px] h-[calc(100dvh-80px)] lg:max-h-full lg:my-0 lg:h-[424px] overflow-y-auto overflow-x-hidden no-scrollbar"
            style={{ background: "#07060e", borderColor: "#1c1428" }}
          >
            <Outlet />
          </div>
          <Footer />
        </div>

        <Scrollbar targetRef={contentRef} />
      </div>
    </div>
  );
};

export default Layout;
