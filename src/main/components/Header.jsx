// src/main/components/Header.jsx

const ALIGN = {
  center: "items-center text-center",
  left:   "items-start text-left",
  right:  "items-end text-right",
};

const SIZE = {
  small: {
    eyebrow:     "text-[7px] tracking-[0.2em]",
    title:       "text-[20px] tracking-[1px]",
    description: "text-[12px] leading-[1.75]",
  },
  medium: {
    eyebrow:     "text-[7px] tracking-[0.2em]",
    title:       "text-[28px] tracking-[2px]",
    description: "text-[14px] leading-[1.85]",
  },
  large: {
    eyebrow:     "text-[7px] tracking-[0.2em]",
    title:       "text-[34px] tracking-[2px]",
    description: "text-[15px] leading-[1.9]",
  },
};

const Header = ({
  eyebrow,
  title,
  description,
  align = "left",
  size  = "medium",
  children,        // ← add this
}) => {
  const alignClass = ALIGN[align] ?? ALIGN.left;
  const sizeClass  = SIZE[size]   ?? SIZE.medium;

  return (
    <div
      className={`flex flex-col gap-2 ${alignClass}`}
      style={{ borderColor: "var(--border-soft)" }}
    >
      {eyebrow && (
        <p className={`uppercase ${sizeClass.eyebrow}`} style={{ color: "var(--pink-text)" }}>
          {`// ${eyebrow}`}
        </p>
      )}

      {title && (
        <h1 className={`font-alagard font-normal leading-tight lowercase ${sizeClass.title}`} style={{ color: "var(--text-heading)" }}>
          {title}
        </h1>
      )}

      {description && (
        <p className={`font-fell ${sizeClass.description}`} style={{ color: "var(--text-body)" }}>
          {description}
        </p>
      )}

      {children}
    </div>
  );
};

export default Header;
