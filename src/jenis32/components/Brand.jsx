import React from "react";
import { Link } from "react-router-dom";
import favicon from "@/assets/favicon.png";

const Brand = ({ className = "" }) => (
  <Link to="/" className={`flex items-center gap-3 ${className}`}>
    <img src={favicon} alt="" className="w-14 h-14 rounded-lg" />
    <span className="font-bold text-2xl text-j32-heading tracking-tight">Zy's 32nd Birthday</span>
  </Link>
);

export default Brand;
