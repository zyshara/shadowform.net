import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ topRight, children }) => (
  <main className="min-h-dvh bg-j32-bg flex flex-col">
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      <Link to="/" className="leading-tight">
        <span className="block font-bold text-lg text-j32-heading tracking-tight">jenis32</span>
        <span className="block text-[11px] text-j32-text/70">shadowform.net</span>
      </Link>
      {topRight}
    </header>

    <div className="flex-1 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-j32-border bg-j32-card p-8">
        {children}
      </div>
    </div>
  </main>
);

export default AuthLayout;
