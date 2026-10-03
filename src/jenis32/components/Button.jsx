import React from "react";
import { Link } from "react-router-dom";

const VARIANTS = {
  primary: "bg-j32-accent text-j32-accent-text hover:brightness-110",
  ghost: "bg-transparent text-j32-text border border-j32-border hover:border-j32-accent hover:text-j32-heading",
};

const Button = ({ to, variant = "primary", className = "", children, ...props }) => {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${VARIANTS[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
