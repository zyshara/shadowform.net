import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="opacity-60">This page doesn't exist.</p>
      <Link to="/" className="text-sm uppercase tracking-wide underline">
        Back home
      </Link>
    </main>
  );
};

export default NotFound;
