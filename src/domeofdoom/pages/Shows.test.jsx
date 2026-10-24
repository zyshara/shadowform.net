import reviewedShows from "../../../server/apps/domeofdoom/scripts/data/reviewed-shows.json";
import React from "react";
import { MemoryRouter } from "react-router";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Shows from "./Shows";

vi.mock("@/components/GridDome", () => ({ default: () => null }));
afterEach(cleanup);
const now = Date.parse("2026-10-23T12:00:00Z");
it("renders the archive, upcoming empty state and Japan tour card", () => {
  render(<MemoryRouter><Shows shows={reviewedShows} now={now} /></MemoryRouter>);
  expect(screen.getByText("No upcoming shows announced.")).toBeInTheDocument();
  expect(screen.getByText(/of 9 shows & festivals/)).toHaveTextContent("9 of 9 shows & festivals");
  expect(screen.queryByText(/Festival dates ·|Performance ·/)).not.toBeInTheDocument();
  expect(screen.getByRole("complementary", { name: "Japan tour" })).toHaveTextContent("JAPAN TOUR");
  expect(screen.queryByText("From the archive")).not.toBeInTheDocument();
});
it("filters by artist and clears filters without losing the inventory", () => {
  render(<MemoryRouter><Shows shows={reviewedShows} now={now} /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: /^Artist / }));
  fireEvent.click(screen.getByRole("button", { name: /^Dabow / }));
  expect(screen.getByText(/of 9 shows & festivals/)).toHaveTextContent("2 of 9 shows & festivals");
  expect(within(screen.getByRole("region", { name: "Show archive" })).getByText("Dabow at FAM Fest")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Region / }));
  fireEvent.click(screen.getByRole("button", { name: /^Asia / }));
  expect(screen.getByText("No archived shows match these filters.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByText(/of 9 shows & festivals/)).toHaveTextContent("9 of 9 shows & festivals");
});
it("places ongoing festivals and future events in the upcoming timeline", () => {
  const fixture = [
    { id: "one", title: "Current festival", date: "2026-10-22", endDate: "2026-10-24", dateKind: "festival", type: "Festival", artists: ["Historical Artist"], city: "Los Angeles", country: "US" },
    { id: "two", title: "Next show", date: "2026-11-01", type: "Show", artists: ["Historical Artist"], city: "Tokyo", country: "JP" },
  ];
  render(<MemoryRouter><Shows shows={fixture} now={now} /></MemoryRouter>);
  const upcoming = screen.getByRole("region", { name: "Upcoming shows" });
  expect(within(upcoming).getByText("Current festival")).toBeInTheDocument();
  expect(within(upcoming).getByText("Next show")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Artist / }));
  expect(screen.getByRole("button", { name: /^Historical Artist / })).toBeInTheDocument();
});

it("uses optional published page links and retains external links for other shows", () => {
  const fixture = [
    { id: 'page', title: 'CMS page show', date: '2026-09-17', type: 'Show', artists: ['Wylie Cable'], city: 'Tokyo', country: 'JP', pageSlug: 'cms-page', flyerUrl: 'https://example.com/flyer.webp' },
    { id: 'external', title: 'External show', date: '2026-09-18', type: 'Show', artists: ['Wylie Cable'], city: 'Tokyo', country: 'JP', url: 'https://example.com/event' },
  ];
  render(<MemoryRouter><Shows shows={fixture} now={now} /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /CMS page show/ })).toHaveAttribute('href', '/shows/cms-page');
  expect(screen.getByRole('link', { name: /External show/ })).toHaveAttribute('href', 'https://example.com/event');
});
