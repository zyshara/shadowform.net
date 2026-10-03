import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import Brand from "@/components/Brand";
import heroDesktop from "@/assets/hero-goldshire-desktop.jpg";
import heroMobile from "@/assets/hero-goldshire-mobile.jpg";

const NAV_LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/login", label: "Log in" },
];

const GameControllerIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9h12a3 3 0 0 1 3 3.5l-.7 3.5a2 2 0 0 1-3.4 1l-1.4-1.5a2 2 0 0 0-1.5-.6h-4a2 2 0 0 0-1.5.6L7.1 17a2 2 0 0 1-3.4-1L3 12.5A3 3 0 0 1 6 9Z" />
    <path d="M8 11.5v3M6.5 13h3" />
    <circle cx="16" cy="11.5" r=".9" fill="currentColor" stroke="none" />
    <circle cx="18" cy="13.5" r=".9" fill="currentColor" stroke="none" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
);

const CakeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16v-5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5Z" />
    <path d="M4 16c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0 2 1 3 0" />
    <path d="M9 13V9M15 13V9M12 13V7" />
    <path d="M9 9c-.6 0-1-.5-1-1s1-1.5 1-1.5.8.5.8 1.5S9.6 9 9 9ZM15 9c-.6 0-1-.5-1-1s1-1.5 1-1.5.8.5.8 1.5S15.6 9 15 9ZM12 7c-.6 0-1-.5-1-1s1-1.5 1-1.5.8.5.8 1.5S12.6 7 12 7Z" />
  </svg>
);

const FEATURES = [
  {
    icon: GameControllerIcon,
    title: "Games",
    description: "WoW, Jackbox, Diablo, STS2 + more",
  },
  {
    icon: CameraIcon,
    title: "Cams on",
    description: "Party with friends from anywhere, 6pm Pacific",
  },
  {
    icon: CakeIcon,
    title: "Birthday shot",
    description: "Around midnight (you know the drill)",
  },
];

const Home = () => {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={heroDesktop} />
        <img
          src={heroMobile}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      </picture>
      <div className="absolute inset-0 bg-j32-bg/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-j32-bg/40 via-j32-bg/70 to-j32-bg" />

      <div className="relative flex flex-col min-h-dvh">
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10">
          <Brand />

          <nav className="flex flex-wrap items-center gap-5" aria-label="Primary">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-j32-text hover:text-j32-heading transition-colors"
              >
                {label}
              </Link>
            ))}
            <Button to="/register" variant="primary">Get started</Button>
          </nav>
        </header>

        <div className="flex-1 flex flex-col justify-center px-6 py-16 md:px-10 max-w-3xl">
          <h1 className="font-script font-bold leading-[0.95] text-5xl sm:text-6xl md:text-7xl">
            <span className="text-j32-heading">Jennifer's</span>
            <br />
            <span className="text-j32-accent">32nd Birthday</span>
          </h1>

          <p className="mt-6 max-w-xl text-base sm:text-lg text-j32-text">
            Same chaos. New character. An online birthday party with friends, games, and a
            bunch of silly activities.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-2 text-j32-text">
                <span className="text-j32-accent"><Icon /></span>
                <span className="text-sm font-semibold text-j32-heading">{title}</span>
                <span className="text-xs text-j32-text/80 leading-relaxed">{description}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button to="/register" variant="primary" className="text-base px-8 py-4">
              Join the party →
            </Button>
          </div>

          <p className="font-heading text-xl sm:text-2xl text-j32-text/90 mt-10 leading-snug">
            Answer questions. Draw things. Share photos. Record a message.
            <br />
            Help make Jennifer's 32nd unforgettable. ♡
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
