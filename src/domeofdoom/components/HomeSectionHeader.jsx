import { Link } from "react-router";
import { colors } from "@/tokens";
import SectionDots from "@/components/SectionDots";
import ArrowRightIcon from "@/components/ArrowRightIcon";

export default function HomeSectionHeader({ title, linkTo, linkText, count }) {
  return (
    <div className="flex items-center gap-3 mb-8 w-full">
      <SectionDots color={colors.accent2} size={18} className="flex-shrink-0" />
      <h2
        className="m-0 flex-shrink-0 whitespace-nowrap"
        style={{
          fontFamily: "Archivo, sans-serif",
          fontStretch: "expanded",
          fontVariationSettings: '"wdth" 125',
          fontWeight: 700,
          fontSize: "clamp(11px, 1.1vw, 14px)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--dod-accent)",
        }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--dod-white) 60%, transparent), color-mix(in srgb, var(--dod-lilac) 80%, transparent))" }} />
      {count != null && <span className="flex-shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap" style={{ color: colors.accent2 }}>{count}</span>}
      {count == null && linkTo && (
        <Link
          to={linkTo}
          className="navlink-hover-flash flex-shrink-0 flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap"
          style={{ color: colors.accent2 }}
        >
          {linkText}
          <ArrowRightIcon size={12} />
        </Link>
      )}
    </div>
  );
}

