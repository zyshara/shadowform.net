import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="min-h-dvh bg-j32-bg flex flex-col items-center justify-center gap-4 text-center px-6">
      <h1 className="font-script font-bold text-4xl text-j32-heading">404</h1>
      <p className="text-j32-text">This page doesn't exist.</p>
      <Link to="/" className="text-sm text-j32-accent hover:underline">
        Back home
      </Link>
    </main>
  );
};

export default NotFound;
