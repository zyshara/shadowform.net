import React from "react";
import Brand from "@/components/Brand";

const AuthLayout = ({ topRight, children }) => (
  <main className="min-h-dvh bg-j32-bg flex flex-col">
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      <Brand />
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
