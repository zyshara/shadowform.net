import { useLayoutEffect } from "react";
import { useLocation, Outlet, NavLink, Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/about", label: "About" },
];

const Layout = () => {
  const location = useLocation();

  useLayoutEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10">
        <Link to="/" className="font-bold text-lg tracking-tight">
          jenis32
        </Link>
        <nav className="flex gap-4" aria-label="Primary">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm uppercase tracking-wide transition-colors ${
                  isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
