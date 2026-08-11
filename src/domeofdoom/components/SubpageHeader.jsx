// src/domeofdoom/components/SubpageHeader.jsx
//
// Shared subpage header, redesigned around a heading/subheading/description
// text stack next to an optional asset (image, video, or any node).
// `alignment` controls which side the text sits on: "left" (default) puts
// text on the left and the asset on the right; "right" mirrors it. All
// three text slots are optional, so simple pages (About, Contact) that pass
// only a heading still get consistent spacing/border with no gaps. Mobile
// always stacks text above asset regardless of `alignment`, which only
// affects the side-by-side arrangement at the md breakpoint and up.
//
// filters/viewToggle from the previous version are gone - Discography,
// Catalog, and Shows (past shows) all passed one or both and will need
// their sort/filter controls relocated elsewhere now that this header
// doesn't have a slot for them.

import { colors } from "@/tokens";

const SubpageHeader = ({ heading, subheading, description, asset, alignment = "left" }) => {
  const textFirst = alignment === "left";

  return (
    <div
      className="flex flex-col md:flex-row items-center gap-8"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 32, marginBottom: 32 }}
    >
      <div className={`flex-1 min-w-0 flex flex-col gap-2 ${textFirst ? "md:order-1" : "md:order-2"}`}>
        {heading && (
          <div
            className="uppercase leading-[0.95] text-[clamp(32px,_7vw,_64px)]"
            style={{ fontFamily: "'PP Neue Montreal', sans-serif", fontWeight: 700, color: colors.neon_mint }}
          >
            {heading}
          </div>
        )}
        {subheading && (
          <div
            className="uppercase text-[13px] tracking-[0.08em]"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 600, color: colors.neon_mint }}
          >
            {subheading}
          </div>
        )}
        {description && (
          <div
            className="text-[14px] leading-relaxed max-w-[420px] mt-1"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: colors.lilac }}
          >
            {description}
          </div>
        )}
      </div>

      {asset && (
        <div className={`w-full md:w-[320px] flex-shrink-0 ${textFirst ? "md:order-2" : "md:order-1"}`}>
          {asset}
        </div>
      )}
    </div>
  );
};

export default SubpageHeader;
