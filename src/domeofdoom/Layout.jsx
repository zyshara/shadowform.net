// src/domeofdoom/Layout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import { colors } from "@/tokens";

const Layout = () => {
  return (
    <div className="min-h-dvh w-full" style={{ background: colors.bg, color: colors.text }}>
      <MarqueeBanner />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
