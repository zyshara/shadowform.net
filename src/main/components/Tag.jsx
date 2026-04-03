// src/main/components/Tag.jsx
// Small label pills — "lit" has pink accent, "dim" is subtle grey

const Tag = ({ children, variant = "dim" }) => {
  const base = "font-alkhemikal text-[9px] tracking-[0.18em] uppercase px-[10px] py-[5px] rounded-[2px] border";

  const variants = {
    lit: "text-[#f4a7c3] border-[#4a1f38] bg-[#1a0d14]",
    dim: "text-[#555] border-[#222] bg-transparent",
  };

  return (
    <span className={`${base} ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Tag;
