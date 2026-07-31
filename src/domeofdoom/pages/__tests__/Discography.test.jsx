import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Discography from "../Discography";

const VIEW_KEY = "domeofdoom:discography:view";

// uids deliberately alphanumeric (no dashes) — real Strapi documentIds are
// dash-free, and releaseSlug()/extractUidFromSlug() split on the *last*
// dash, so a uid containing one would break the round-trip.
const FIXTURES = [
  {
    uid: "uidprecipice",
    release_name: "Precipice",
    artists: ["Noer The Boy"],
    type: "Album",
    year: 2026,
    release_date: "2026-01-10",
    cover_art_src: "/precipice.jpg",
    spotify_url: null,
    bandcamp_url: "https://example.com/precipice",
  },
  {
    uid: "uidwaiting",
    release_name: "Waiting",
    artists: ["Gunnar Nash"],
    type: "Single",
    year: 2026,
    release_date: "2026-01-05",
    cover_art_src: "/waiting.jpg",
    spotify_url: "https://open.spotify.com/waiting",
    bandcamp_url: "https://example.com/waiting",
  },
  {
    uid: "uidchopping",
    release_name: "Chopping Block",
    artists: ["Guillotine2k"],
    type: "Single",
    year: 2026,
    release_date: "2026-01-01",
    cover_art_src: "/chopping.jpg",
    spotify_url: null,
    bandcamp_url: "https://example.com/chopping",
  },
];

function seedDiscographyData() {
  let el = document.getElementById("discography-data");
  if (!el) {
    el = document.createElement("script");
    el.id = "discography-data";
    document.body.appendChild(el);
  }
  el.textContent = JSON.stringify(FIXTURES);
}

function setInnerWidth(width) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

// Controllable matchMedia mock — lets tests simulate a resize crossing the
// md breakpoint by flipping `.matches` and firing the registered listener,
// the same way a real browser's matchMedia "change" event would.
function mockMatchMedia(initialMatches) {
  let matches = initialMatches;
  const listeners = new Set();
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_evt, cb) => listeners.add(cb),
    removeEventListener: (_evt, cb) => listeners.delete(cb),
  }));
  return {
    setMatches(next) {
      matches = next;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
}

function renderDiscography(initialPath, { innerWidth = 1280 } = {}) {
  seedDiscographyData();
  setInnerWidth(innerWidth);
  const mq = mockMatchMedia(innerWidth < 768);
  const utils = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Discography />
    </MemoryRouter>
  );
  return { ...utils, mq };
}

function resizeTo(mq, width) {
  act(() => {
    setInnerWidth(width);
    mq.setMatches(width < 768);
  });
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("Discography — view + permalink scenarios", () => {
  it("scenario 1: 3D view selection stays inline, goes solo on mobile resize, restores highlight on desktop resize", () => {
    const { mq } = renderDiscography("/discography", { innerWidth: 1280 });

    // Desktop, default 3D/list view, no ?release= yet.
    expect(screen.getByText("Discography")).toBeInTheDocument();
    expect(screen.queryByText("← All Releases")).not.toBeInTheDocument();

    // Click sidebar row for "Waiting" — should stay in 3D view, not navigate away.
    fireEvent.click(screen.getByText("Waiting"));
    expect(screen.getByText("Discography")).toBeInTheDocument();
    expect(screen.queryByText("← All Releases")).not.toBeInTheDocument();

    // Resize to mobile — solo release page should appear with no further click.
    resizeTo(mq, 375);
    expect(screen.getByText("← All Releases")).toBeInTheDocument();
    expect(screen.queryByText("Discography")).not.toBeInTheDocument();

    // Resize back to desktop — 3D view returns, "Waiting" still selected.
    resizeTo(mq, 1280);
    expect(screen.getByText("Discography")).toBeInTheDocument();
    expect(screen.queryByText("← All Releases")).not.toBeInTheDocument();

    // Forced mobile grid must never persist as an explicit view preference.
    expect(localStorage.getItem(VIEW_KEY)).toBeNull();
  });

  it("scenario 2: explicit grid toggle persists, and solo page survives resizing in both directions", () => {
    const { mq } = renderDiscography("/discography", { innerWidth: 1280 });

    fireEvent.click(screen.getByTitle("Switch to grid view"));
    expect(localStorage.getItem(VIEW_KEY)).toBe("grid");

    fireEvent.click(screen.getByText("Chopping Block"));
    expect(screen.getByText("← All Releases")).toBeInTheDocument();

    resizeTo(mq, 375);
    expect(screen.getByText("← All Releases")).toBeInTheDocument();

    resizeTo(mq, 1280);
    expect(screen.getByText("← All Releases")).toBeInTheDocument();
  });

  it("scenario 3: mobile-forced grid tap, then resizing to desktop shows the 3D view highlighted (stored view untouched)", () => {
    const { mq } = renderDiscography("/discography", { innerWidth: 375 });

    // No toggle button at all on mobile.
    expect(screen.queryByTitle(/grid view|preview view/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Chopping Block"));
    expect(screen.getByText("← All Releases")).toBeInTheDocument();

    resizeTo(mq, 1280);
    expect(screen.queryByText("← All Releases")).not.toBeInTheDocument();
    expect(screen.getByText("Discography")).toBeInTheDocument();

    // Tapping a release on mobile must not silently set an explicit view preference.
    expect(localStorage.getItem(VIEW_KEY)).toBeNull();
  });

  it("never persists a view preference from resize alone, with no click at all", () => {
    const { mq } = renderDiscography("/discography", { innerWidth: 1280 });
    resizeTo(mq, 375);
    resizeTo(mq, 1280);
    expect(localStorage.getItem(VIEW_KEY)).toBeNull();
  });

  it("direct permalink load with desktop + list preference shows 3D view highlighted, not solo", () => {
    renderDiscography("/discography?release=waiting-uidwaiting", { innerWidth: 1280 });
    expect(screen.getByText("Discography")).toBeInTheDocument();
    expect(screen.queryByText("← All Releases")).not.toBeInTheDocument();
  });

  it("direct permalink load with grid preference shows the solo page", () => {
    localStorage.setItem(VIEW_KEY, "grid");
    renderDiscography("/discography?release=waiting-uidwaiting", { innerWidth: 1280 });
    expect(screen.getByText("← All Releases")).toBeInTheDocument();
  });

  it("direct permalink load on mobile shows the solo page regardless of stored preference", () => {
    localStorage.setItem(VIEW_KEY, "list");
    renderDiscography("/discography?release=waiting-uidwaiting", { innerWidth: 375 });
    expect(screen.getByText("← All Releases")).toBeInTheDocument();
  });
});
