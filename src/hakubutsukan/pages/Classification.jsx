import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { readSeedData } from "@/utils/readSeedData";

const TAG_GROUPS = [
  {
    label: "Discipline",
    tags: [
      { value: "visual-art",       label: "Visual Art" },
      { value: "photography",      label: "Photography" },
      { value: "design",           label: "Design" },
      { value: "natural-history",  label: "Natural History" },
      { value: "anthropology",     label: "Anthropology" },
      { value: "science",          label: "Science" },
      { value: "architecture",     label: "Architecture" },
      { value: "textiles",         label: "Textiles" },
      { value: "cultural-history", label: "Cultural History" },
    ],
  },
  {
    label: "Experience",
    tags: [
      { value: "indoors",             label: "Indoors" },
      { value: "outdoors",            label: "Outdoors" },
      { value: "collection-focused",  label: "Collection-Focused" },
      { value: "exhibition-focused",  label: "Exhibition-Focused" },
      { value: "interactive",         label: "Interactive" },
    ],
  },
  {
    label: "Admission",
    tags: [
      { value: "free", label: "Free" },
      { value: "paid", label: "Paid" },
    ],
  },
];

const Classification = () => {
  const allMuseums = useMemo(() => readSeedData("museums-data") ?? [], []);

  const countByTag = useMemo(() => {
    const map = {};
    allMuseums.forEach((m) => m.tags.forEach((t) => { map[t] = (map[t] ?? 0) + 1; }));
    return map;
  }, [allMuseums]);

  return (
    <div className="flex flex-col">
      <div className="border-b border-hk-rule px-6 py-8 flex flex-col gap-1">
        <h1 className="font-display font-semibold italic text-3xl text-hk-text leading-none">Classification</h1>
        <p className="text-xs text-hk-muted">Browse institutions by category</p>
      </div>

      <div className="px-6 py-8 flex flex-col gap-10">
        {TAG_GROUPS.map((group) => (
          <section key={group.label} className="flex flex-col gap-4">
            <h2 className="text-[10px] uppercase tracking-[0.22em] text-hk-muted border-b border-hk-rule pb-3">
              {group.label}
            </h2>
            <div className="flex flex-col divide-y divide-hk-rule">
              {group.tags.map(({ value, label }) => {
                const count = countByTag[value] ?? 0;
                return (
                  <Link
                    key={value}
                    to={`/museums?tag=${value}`}
                    className="group flex items-center justify-between py-3 hover:bg-hk-bg-alt transition-colors -mx-2 px-2"
                  >
                    <span className="text-sm text-hk-text-mid group-hover:text-hk-gold transition-colors font-display italic">
                      {label}
                    </span>
                    <span className="text-xs text-hk-muted group-hover:text-hk-gold-light transition-colors">
                      {count} institution{count !== 1 ? "s" : ""} →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Classification;
