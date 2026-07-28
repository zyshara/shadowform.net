// src/main/Layout.jsx

import { useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { DesktopNavbar } from "@/components/Navbar";
import MobileMenu from "@/components/MobileMenu";
import PageChrome from "@/components/PageChrome";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import Scrollbar from "@/components/Scrollbar";
import { PageCrumbProvider } from "@/context/PageCrumbContext";

const Layout = () => {
  const contentRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-dvh max-h-dvh w-full" style={{ background: "#0e0c14" }}>
      <div className="grid items-center justify-center grid-cols-[50px_1fr_50px] lg:grid-cols-[1fr_auto_1fr] w-full">
        {/* ── Sidebar (desktop only) — sticky, stays in viewport while page scrolls ── */}
        <aside className="flex flex-col justify-center items-center h-full">
          <DesktopNavbar onOpenMenu={() => setMenuOpen(true)} />
        </aside>

        {/* ── Main column ── */}
        <PageCrumbProvider>
          <div className="grid justify-center items-center w-full h-full grid-cols-[1fr] grid-rows-[40px_auto_40px] content-center">
            <PageChrome className="justify-end"/>
            <div
              ref={contentRef}
              className="px-8 py-8 flex flex-col border w-full lg:w-[716px] h-[calc(100dvh-80px)] lg:max-h-full lg:my-0 lg:h-[424px] overflow-y-auto overflow-x-hidden no-scrollbar"
              style={{ background: "#07060e", borderColor: "#1c1428" }}
            >
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  {outlet}
                </PageTransition>
              </AnimatePresence>
            </div>
            <Footer />
          </div>
        </PageCrumbProvider>

        <Scrollbar targetRef={contentRef} />
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Layout;
