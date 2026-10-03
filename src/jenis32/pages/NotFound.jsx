import React from "react";
import Button from "@/components/Button";
import heroDesktop from "@/assets/hero-error-desktop.jpg";
import heroMobile from "@/assets/hero-error-mobile.jpg";

const NotFound = () => {
  return (
    <main className="relative min-h-dvh overflow-hidden flex flex-col items-center justify-center gap-4 text-center px-6">
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

      <div className="relative flex flex-col items-center gap-4">
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
