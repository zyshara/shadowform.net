import React, { useMemo, useState } from "react";
import { readSeedData } from "@/utils/readSeedData";
import { colors } from "@/tokens";
import SubpageHeader from "@/components/SubpageHeader";
import Button from "@/components/Button";

const PRIMARY = colors.accent;

const FilterChevron = () => (
  <svg
    viewBox="0 0 10 10"
    width="8"
    height="8"
    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
  >
    <polyline points="2,3 5,7 8,3" fill="none" style={{ stroke: PRIMARY }} strokeWidth="2.5" />
  </svg>
);

function formatShowDate(dateStr) {
  // Parse as local date to avoid timezone offset flipping the day
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
}

function showTimestamp(show) {
  const [y, m, d] = show.date.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

export const ShowRow = ({ show, isPast = false, index = 0 }) => (
  <div
    className="flex-col sm:flex-row justify-between"
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 20,
      borderBottom: "1px solid rgba(255,255,255,.08)",
      padding: "16px",
      background: index % 2 === 1 ? "transparent" : "oklch(from var(--dod-accent2) l c h / 0.03)",
    }}
  >
    <div
      className="self-start sm:self-center"
      style={{
        minWidth: 120,
        flexShrink: 0,
        fontFamily: "Archivo, sans-serif",
        fontStretch: "expanded",
        fontVariationSettings: '"wdth" 125',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: isPast ? "rgba(255,255,255,.3)" : PRIMARY,
      }}
    >
      {formatShowDate(show.date)}
    </div>
    <div
      className="self-start sm:self-center"
      style={{
        flex: 1,
        flexShrink: 1,
        font: "500 14px 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: isPast ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.85)",
        letterSpacing: ".01em",
      }}
    >
      {show.name}
    </div>
    {show.artists && show.artists.length > 0 && (
      <div
        style={{
          display: "flex",
          gap: 12,
          flexShrink: 0,
          alignItems: "flex-start",
        }}
      >
        {show.artists.map((artist, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            {artist.pfp ? (
              <img
                src={artist.pfp}
                alt={artist.name}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.1)",
                }}
              />
            )}
            <span
              style={{
                fontSize: 11,
                textAlign: "center",
                maxWidth: 50,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "rgba(255,255,255,.6)",
              }}
            >
              {artist.name}
            </span>
          </div>
        ))}
      </div>
    )}
    {show.link && (
      <Button style={{ flexShrink: 2 }} type="thin" size="small" variant={isPast ? "secondary" : "primary"} href={show.link}>
        {isPast ? "Info" : "Tickets"}
      </Button>
    )}
  </div>
);

const Shows = () => {
  const showsData = readSeedData("shows-data") ?? [];
  const now = Date.now();
  const [yearFilter, setYearFilter] = useState("all");
  const [artistFilter, setArtistFilter] = useState("all");

  const upcoming = useMemo(
    () =>
      showsData
        .filter((s) => showTimestamp(s) >= now)
        .sort((a, b) => showTimestamp(a) - showTimestamp(b)),
    [showsData]
  );

  const past = useMemo(
    () =>
      showsData
        .filter((s) => showTimestamp(s) < now)
        .sort((a, b) => showTimestamp(b) - showTimestamp(a)),
    [showsData]
  );

  const pastYears = useMemo(
    () => [...new Set(past.map((s) => new Date(showTimestamp(s)).getFullYear()))].sort((a, b) => b - a),
    [past]
  );

  const filteredPast = useMemo(() => {
    if (yearFilter === "all") return past;
    return past.filter((s) => new Date(showTimestamp(s)).getFullYear() === Number(yearFilter));
  }, [past, yearFilter]);

  return (
    <div className="mx-auto max-w-[1400px] px-10 py-10 lg:py-[70px]">
      {/* Upcoming Shows */}
      <div className="mb-[60px]">
        <SubpageHeader heading="Upcoming Shows" />
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", borderBottom: "1px solid rgba(255,255,255,.08)", background: "oklch(from var(--dod-accent2) l c h / 0.03)" }}>
          {upcoming.length === 0 ? (
            <div className="py-10 text-center text-[14px]" style={{ color: "rgba(255,255,255,.35)" }}>
              No upcoming shows announced yet — check back soon.
            </div>
          ) : (
            upcoming.map((show, i) => <ShowRow key={i} show={show} index={i} />)
          )}
        </div>
      </div>

      {/* Past Shows */}
      <div>
        <SubpageHeader
          heading="Past Shows"
          filters={
            <>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="disco-filter-select"
                >
                  <option value="all">all years</option>
                  {pastYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <FilterChevron />
              </span>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)} className="disco-filter-select">
                  <option value="all">all artists</option>
                </select>
                <FilterChevron />
              </span>
            </>
          }
        />
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
          {filteredPast.length === 0 ? (
            <div className="py-10 text-center text-[14px]" style={{ color: "rgba(255,255,255,.35)" }}>
              No past shows found.
            </div>
          ) : (
            filteredPast.map((show, i) => <ShowRow key={i} show={show} isPast index={i} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Shows;
