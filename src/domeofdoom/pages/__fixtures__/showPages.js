// Local prototype fixtures. Relationships mirror the proposed CMS structure;
// media records are reusable and do not have public detail routes.
import flyer from "@/assets/shows/maybe-forever-2023.webp";
import enterFlyer from "@/assets/shows/enter-shibuya-2026.webp";

export const mediaItems = {
  "enter-shibuya-2026-flyer": {
    id: "enter-shibuya-2026-flyer", format: "image", category: "flyer",
    title: "Dome of Doom 15 Year Anniversary World Tour — ENTER Shibuya flyer", image: enterFlyer,
    alt: "90BPM TAKEOVER presents Dome of Doom Records 15 Year Anniversary World Tour. Wylie Cable with Maru and local DJs at ENTER Shibuya, September 17, 2026, opens 22:00.",
    showIds: ["DOD-P007-L01"], includeInMediaIndex: true,
  },
  "maybe-forever-flyer": {
    id: "maybe-forever-flyer", format: "image", category: "flyer",
    title: "Maybe Forever x Dome of Doom Takeover flyer", image: flyer,
    alt: "Maybe Forever x Dome of Doom Takeover. Bleep Bloop, Lord Genmu, BOSTN, Wylie Cable and SWAMPZ. Denver secret location, Saturday July 22, 10PM–late, 21+.",
    showIds: ["DOD-P033-L01"], includeInMediaIndex: true,
  },
  "maybe-forever-recording-1": {
    id: "maybe-forever-recording-1", format: "video", category: "live-set",
    title: "Lord Genmu — Live at Maybe Forever",
    videoUrl: "https://www.youtube.com/watch?v=tlb-dUAOec4", youtubeId: "tlb-dUAOec4",
    showIds: ["DOD-P033-L01"], includeInMediaIndex: true,
  },
  "maybe-forever-recording-2": {
    id: "maybe-forever-recording-2", format: "video", category: "live-set",
    title: "Wylie Cable — Live at Maybe Forever",
    videoUrl: "https://www.youtube.com/watch?v=JEOty6YJ-IQ", youtubeId: "JEOty6YJ-IQ",
    showIds: ["DOD-P033-L01"], includeInMediaIndex: true,
  },
};

export const showPages = [{
  slug: "maybe-forever-dome-of-doom-takeover-2023", showId: "DOD-P033-L01",
  title: "Maybe Forever x Dome of Doom Takeover",
  flyerId: "maybe-forever-flyer",
  description: "A late-night Dome of Doom label takeover with Maybe Forever in Denver, featuring Bleep Bloop, Lord Genmu, BOSTN, Wylie Cable and SWAMPZ.",
  // Event facts come from Ticket Tailor and the supplied flyer, not the design mock.
  start: "2023-07-22T22:00:00-06:00", end: "2023-07-23T04:00:00-06:00",
  timezone: "America/Denver", dateLabel: "July 22–23, 2023", timeLabel: "10 PM–4 AM · MDT",
  venue: "Secret location", location: "Denver, CO, USA", ageRestriction: "21+",
  venueNote: "The venue address was shared with attendees on the day of the show.",
  artists: ["Bleep Bloop", "Lord Genmu", "BOSTN", "Wylie Cable", "SWAMPZ"],
  primaryCta: { label: "Original ticket listing", url: "https://www.tickettailor.com/events/maybeforever/953469" },
  links: [{ label: "Read the recap", url: "https://theelectrichawk.com/maybe-forever-dome-of-doom/" }],
  videoIds: ["maybe-forever-recording-1", "maybe-forever-recording-2"],
  // Add real event photographs here later; never substitute unrelated stock images.
  photoIds: [],
}, {
  slug: "dome-of-doom-enter-shibuya-2026", showId: "DOD-P007-L01",
  title: "90BPM TAKEOVER presents Dome of Doom Records 15 Year Anniversary World Tour",
  flyerId: "enter-shibuya-2026-flyer",
  description: "90BPM TAKEOVER hosts Wylie Cable and the Dome of Doom Records 15 Year Anniversary World Tour at ENTER Shibuya, alongside a lineup of local DJs and beatmakers.",
  start: "2026-09-17T22:00:00+09:00", end: null, timezone: "Asia/Tokyo",
  dateLabel: "September 17, 2026", timeLabel: "10 PM · JST", venue: "ENTER Shibuya", location: "Tokyo, Japan",
  artists: ["Wylie Cable", "Maru", "Mayumikiller", "CITY1", "Mazlika", "DJ MUTA", "FUNNEL", "MarT", "Kopero", "SAMRAIT", "N’PACHI", "Suguru Itou"],
  primaryCta: { label: "Official event listing", url: "https://entershibuya.com/schedule/dome-of-doom-records-15-year-anniversary-world-tour/" },
  links: [], videoIds: [], photoIds: [],
}];

export function findShowPage(slug) { return showPages.find(page => page.slug === slug); }
