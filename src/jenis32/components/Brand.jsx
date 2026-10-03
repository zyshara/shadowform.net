import React from "react";
import { Link } from "react-router-dom";
import favicon from "@/assets/favicon.png";

const Brand = ({ className = "" }) => (
  <Link to="/" className={`flex items-center ${className}`}>
    <img src={favicon} alt="Zy's 32nd Birthday" className="w-20 h-20 rounded-lg" />
  </Link>
);

export default Brand;
