import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import Brand from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import heroDesktop from "@/assets/hero-error-desktop.jpg";
import heroMobile from "@/assets/hero-error-mobile.jpg";

const NotFound = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="relative min-h-dvh overflow-hidden flex flex-col">
      <picture>
        <source media="(min-width: 768px)" srcSet={heroDesktop} />
        <img
          src={heroMobile}
          alt=""
          className="fixed inset-0 h-dvh w-screen object-cover"
          aria-hidden="true"
        />
      </picture>
      <div className="fixed inset-0 bg-gradient-to-b from-j32-bg/30 via-j32-bg/55 to-j32-bg/90" />

      <header className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Brand />

        {isAuthenticated ? (
          <nav className="flex flex-wrap items-center gap-5" aria-label="Primary">
            <Button variant="ghost" onClick={logout} className="text-xs px-4 py-2">Log out</Button>
          </nav>
        ) : (
          <nav className="flex flex-wrap items-center gap-5" aria-label="Primary">
            <Link to="/login" className="text-sm text-j32-text hover:text-j32-heading transition-colors">
              Log in
            </Link>
            <Button to="/register" variant="primary">Register</Button>
          </nav>
        )}
      </header>

      <div className="relative flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="font-script font-bold text-5xl sm:text-6xl text-j32-heading">404</h1>
        <p className="font-heading text-xl sm:text-2xl text-j32-text max-w-md leading-snug">
          You've traveled too far off the road, stranger! Let's get you back to safety.
        </p>
        <Button to="/" variant="primary" className="mt-2">
          Back to safety
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
