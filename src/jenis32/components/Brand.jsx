import React from "react";
import { Link } from "react-router-dom";
import favicon from "@/assets/favicon.png";

const Brand = ({ className = "" }) => (
  <Link to="/" className={`flex items-center gap-2 ${className}`}>
    <img src={favicon} alt="" className="w-8 h-8 rounded-md" />
    <span className="font-bold text-lg text-j32-heading tracking-tight">Jen's 32nd Birthday</span>
  </Link>
);

export default Brand;
