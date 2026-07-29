// src/main/components/Header.jsx

const ALIGN = {
  center: "items-center text-center",
  left:   "items-start text-left",
  right:  "items-end text-right",
};

// Tailwind's compiler only generates CSS for class names it can find as
// literal strings in source — it can't see `${breakpoint}:${class}` built
// at runtime. So every breakpoint variant has to be spelled out literally
// here rather than assembled from ALIGN + a prefix.
const RESPONSIVE_ALIGN = {
  sm: {
    center: "sm:items-center sm:text-center",
    left:   "sm:items-start sm:text-left",
    right:  "sm:items-end sm:text-right",
  },
  md: {
    center: "md:items-center md:text-center",
    left:   "md:items-start md:text-left",
    right:  "md:items-end md:text-right",
  },
  lg: {
    center: "lg:items-center lg:text-center",
    left:   "lg:items-start lg:text-left",
    right:  "lg:items-end lg:text-right",
  },
};

// `align` accepts either a single keyword (applies at every size, today's
// behavior) or a responsive map like { base: "center", sm: "left" } for
// callers that want a different alignment per breakpoint — e.g. centered
// on mobile, left-aligned once there's room at sm+.
function resolveAlign(align) {
  if (typeof align === "string") return ALIGN[align] ?? ALIGN.left;

  return Object.entries(align)
    .map(([breakpoint, value]) => (
      breakpoint === "base" ? (ALIGN[value] ?? ALIGN.left) : RESPONSIVE_ALIGN[breakpoint]?.[value]
    ))
    .filter(Boolean)
    .join(" ");
}

const SIZE = {
  small: {
    title:       "text-[20px] tracking-[1px]",
    description: "text-[12px] leading-[1.75]",
  },
  medium: {
    title:       "text-[28px] tracking-[2px]",
    description: "text-[14px] leading-[1.85]",
  },
  large: {
    title:       "text-[34px] tracking-[2px]",
    description: "text-[15px] leading-[1.9]",
  },
};

// same reasoning as RESPONSIVE_ALIGN — Tailwind needs these spelled out as
// literal strings, it can't see a `${breakpoint}:${class}` built at runtime.
const RESPONSIVE_SIZE = {
  sm: {
    small:  { title: "sm:text-[20px] sm:tracking-[1px]", description: "sm:text-[12px] sm:leading-[1.75]" },
    medium: { title: "sm:text-[28px] sm:tracking-[2px]", description: "sm:text-[14px] sm:leading-[1.85]" },
    large:  { title: "sm:text-[34px] sm:tracking-[2px]", description: "sm:text-[15px] sm:leading-[1.9]" },
  },
  md: {
    small:  { title: "md:text-[20px] md:tracking-[1px]", description: "md:text-[12px] md:leading-[1.75]" },
    medium: { title: "md:text-[28px] md:tracking-[2px]", description: "md:text-[14px] md:leading-[1.85]" },
    large:  { title: "md:text-[34px] md:tracking-[2px]", description: "md:text-[15px] md:leading-[1.9]" },
  },
  lg: {
    small:  { title: "lg:text-[20px] lg:tracking-[1px]", description: "lg:text-[12px] lg:leading-[1.75]" },
    medium: { title: "lg:text-[28px] lg:tracking-[2px]", description: "lg:text-[14px] lg:leading-[1.85]" },
    large:  { title: "lg:text-[34px] lg:tracking-[2px]", description: "lg:text-[15px] lg:leading-[1.9]" },
  },
};

// `size` accepts either a single keyword (applies at every size, today's
// behavior) or a responsive map like { base: "small", md: "large" }.
function resolveSize(size) {
  if (typeof size === "string") return SIZE[size] ?? SIZE.medium;

  const title = [];
  const description = [];

  Object.entries(size).forEach(([breakpoint, value]) => {
    const s = breakpoint === "base" ? (SIZE[value] ?? SIZE.medium) : RESPONSIVE_SIZE[breakpoint]?.[value];
    if (!s) return;
    title.push(s.title);
    description.push(s.description);
  });

  return { title: title.join(" "), description: description.join(" ") };
}

const Header = ({
  title,
  description,
  align = "left",
  size  = "medium",
  children,
}) => {
  const alignClass = resolveAlign(align);
  const sizeClass  = resolveSize(size);

  return (
    <div className={`flex flex-col gap-4 ${alignClass}`}>
      {title && (
        <h1 className={`font-alagard font-normal leading-tight lowercase ${sizeClass.title}`} style={{ color: "var(--text-heading)" }}>
          {title}
        </h1>
      )}

      {description && (
        typeof description === "string" ? (
          <div className={`font-fell ${sizeClass.description}`} style={{ color: "var(--text-body)" }} dangerouslySetInnerHTML={{ __html: description }}/>
        ) : (
          <div className={`font-fell flex flex-col gap-4 ${sizeClass.description}`} style={{ color: "var(--text-body)" }}>
            {description}
          </div>
        )
      )}
    </div>
  );
};

export default Header;
