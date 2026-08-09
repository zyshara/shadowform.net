// src/domeofdoom/components/SubpageHeader.jsx
//
// Shared subpage header: a small optional `subheading` line, the big
// `heading` with its flower mark, `filters` beside the heading, and an
// optional `viewToggle` (grid/list icon) pinned to the top-right corner of
// the whole header block. All four slots besides `heading` are optional —
// simple pages (About, Contact) pass only a heading and get just that, with
// the border/spacing still applied for a consistent look across subpages.

import { FLOWER_FILIGREE } from "@/tokens";

const SubpageHeader = ({ heading, subheading, filters, viewToggle }) => (
  <div
    className="relative"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 20, marginBottom: 32 }}
  >
    {viewToggle && <div className="absolute top-0 right-0">{viewToggle}</div>}

    {subheading && <div className="mb-2">{subheading}</div>}

    <div className="flex flex-wrap items-end justify-between gap-4">
      <div
        className="m-0 font-archivo text-[clamp(26px,_7vw,_48px)] font-semibold uppercase leading-none tracking-tight flex-row gap-2 flex items-center"
        style={{ fontFamily: "Archivo, sans-serif", fontStretch: "expanded", fontVariationSettings: "'wdth' 125", fontWeight: "600" }}
      >
        <img className="w-[40px] h-[40px]" src={FLOWER_FILIGREE} />
        {heading}
      </div>

      {filters && <div className="flex flex-row flex-wrap gap-4">{filters}</div>}
    </div>
  </div>
);

export default SubpageHeader;
