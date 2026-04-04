// src/main/components/Tag.jsx

const Tag = ({ children, variant = "dim" }) => {
  const base = "text-[9px] tracking-[0.18em] uppercase px-[10px] py-[5px] rounded-[2px] border";

  const styles = {
    lit: {
      color:       "var(--tag-lit-text)",
      borderColor: "var(--tag-lit-border)",
      background:  "var(--tag-lit-bg)",
    },
    dim: {
      color:       "var(--tag-dim-text)",
      borderColor: "var(--tag-dim-border)",
      background:  "var(--tag-dim-bg)",
    },
  };

  return (
    <span className={base} style={styles[variant]}>
      {children}
    </span>
  );
};

export default Tag;
