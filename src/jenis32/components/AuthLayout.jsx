import React from "react";
import Brand from "@/components/Brand";

const AuthLayout = ({ topRight, children, heroDesktop, heroMobile }) => (
  <main className="relative min-h-dvh bg-j32-bg flex flex-col overflow-hidden">
    {heroMobile && (
      <>
        <picture>
          <source media="(min-width: 768px)" srcSet={heroDesktop} />
          <img
            src={heroMobile}
            alt=""
            className="fixed inset-0 h-dvh w-screen object-cover"
            aria-hidden="true"
          />
        </picture>
        <div className="fixed inset-0 bg-gradient-to-b from-j32-bg/25 via-j32-bg/55 to-j32-bg/95" />
      </>
    )}

    <header className="relative flex items-center justify-between px-6 py-5 md:px-10">
      <Brand />
      {topRight}
    </header>

    <div className="relative flex-1 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-j32-border bg-j32-card p-8">
        {children}
      </div>
    </div>
  </main>
);

export default AuthLayout;
