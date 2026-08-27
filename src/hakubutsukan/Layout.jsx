import { useLayoutEffect, useState, useEffect } from "react";
import { useLocation, Outlet, NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import CompassStar from "@/components/CompassStar.jsx";
import PoweredByLogo from "@shared/components/PoweredByLogo.jsx";

const NAV_LINKS = [
  { to: "/exhibits",       label: "Exhibits" },
  { to: "/museums",        label: "Museums" },
  { to: "/classification", label: "Classification" },
  { to: "/about",          label: "About" },
];

const EASE = [0.25, 0.1, 0.25, 1];

const MenuIcon = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="2" y1="5" x2="18" y2="5" /><line x1="2" y1="10" x2="18" y2="10" /><line x1="2" y1="15" x2="18" y2="15" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
  </svg>
);

const Sidebar = ({ onNavClick }) => (
  <div className="flex flex-col h-full py-8 px-6 gap-8">
    <div className="flex flex-col gap-3">
      <Link
        to="/"
        onClick={onNavClick}
        className="font-display font-bold text-2xl leading-tight text-hk-sidebar-text hover:text-hk-sidebar-gold transition-colors tracking-tight"
      >
        Hakubutsukan (博物館)<br/>Los Angeles
      </Link>
      <p className="text-xs text-hk-sidebar-muted leading-relaxed">
        A curated list of museums, exhibitions, and galleries within the greater LA area, kept up to date regularly
      </p>
    </div>

    <div className="flex justify-center opacity-60">
      <CompassStar size={44} color="var(--hk-sidebar-gold)" />
    </div>

    <div className="h-px bg-hk-sidebar-rule" />

    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV_LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavClick}
          className={({ isActive }) =>
            `text-xs uppercase tracking-[0.18em] py-2.5 pl-3 border-l-2 transition-colors ${
              isActive
                ? "border-hk-sidebar-gold text-hk-sidebar-gold"
                : "border-transparent text-hk-sidebar-muted hover:text-hk-sidebar-text hover:border-hk-sidebar-rule"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>

    <div className="flex-1" />

    <div className="flex flex-col gap-1.5 border-t border-hk-sidebar-rule pt-6">
      <p className="text-[10px] text-hk-sidebar-muted leading-relaxed">
        💕 Curated with love by{" "}
        <span className="text-hk-sidebar-gold">@zyshara</span>
      </p>
      <PoweredByLogo />
    </div>
  </div>
);

const SIDEBAR_BORDER = { borderRight: "1px solid var(--hk-sidebar-rule)" };
const MOBILE_BORDER  = { borderBottom: "1px solid var(--hk-sidebar-rule)" };

const Layout = () => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isHome = location.pathname === "/";

  useLayoutEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-hk-bg flex">
      <div
        className="fixed inset-0 bg-no-repeat bg-cover z-[99] mix-blend-darken opacity-70 pointer-events-none"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787599153/bookish_texture_8235beae38.png')" }}
      />

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col fixed left-0 top-0 w-52 shrink-0 bg-hk-sidebar overflow-y-auto z-30"
        style={SIDEBAR_BORDER}
        initial={{ x: "-100%", height: isHome ? "75dvh" : "100dvh" }}
        animate={{
          x: 0,
          height: isHome ? "75dvh" : "100dvh",
        }}
        transition={{
          x:      { duration: 0.5, ease: EASE },
          height: { duration: 0.45, ease: EASE },
        }}
      >
        <Sidebar />
      </motion.aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-hk-sidebar"
        style={MOBILE_BORDER}
      >
        <Link to="/" className="font-display font-bold text-sm text-hk-sidebar-text tracking-tight leading-none">
          Hakubutsukan (博物館) Los Angeles
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          className="text-hk-sidebar-muted hover:text-hk-sidebar-text transition-colors"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-hk-sidebar z-40 transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={SIDEBAR_BORDER}
        aria-hidden={!drawerOpen}
      >
        <Sidebar onNavClick={() => setDrawerOpen(false)} />
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-52 min-h-dvh flex flex-col pt-12 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
