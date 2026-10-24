import React from "react";
import { colors } from "@/tokens";
import Button from "@/components/Button";

const PRIMARY = colors.accent;

function formatShowDate(dateStr) {
  // Parse as local date to avoid timezone offset flipping the day
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).toUpperCase();
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

