import React from "react";

const TextField = ({ label, id, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs uppercase tracking-wide text-j32-text/70">
      {label}
    </label>
    <input
      id={id}
      className="rounded-lg bg-j32-card border border-j32-border px-4 py-3 text-sm text-j32-heading placeholder:text-j32-text/40 outline-none focus:border-j32-accent transition-colors"
      {...props}
    />
  </div>
);

export default TextField;
