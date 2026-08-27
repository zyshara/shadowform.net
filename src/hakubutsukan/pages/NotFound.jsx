import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-6">
    <p className="text-4xl text-hk-rule select-none font-archivo" style={{ fontStretch: "125%" }}>404</p>
    <p className="text-sm text-hk-muted">Page not found.</p>
    <Link to="/" className="text-xs text-hk-gold hover:underline underline-offset-2">
      Return to index
    </Link>
  </div>
);

export default NotFound;
