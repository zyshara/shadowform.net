import { servicesContext } from "../app/context";
import React from "react";
import { MemoryRouter, RouterContextProvider } from "react-router";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import ShowPage from "./ShowPage";
import { showPages, mediaItems } from "./__fixtures__/showPages";
import { loader } from "../app/routes/show-page";
afterEach(cleanup);
it("shows verified event facts and historical ticket CTA without inventing photos", () => {
  render(<MemoryRouter><ShowPage media={mediaItems} page={showPages[0]} now={Date.parse("2026-10-23")} /></MemoryRouter>);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Maybe Forever x Dome of Doom Takeover");
  expect(screen.getByText("July 22–23, 2023")).toBeInTheDocument();
  expect(screen.getByText("Secret location")).toBeInTheDocument();
  expect(screen.getByText("SWAMPZ")).toBeInTheDocument();
  expect(screen.queryByText("Show archive")).not.toBeInTheDocument();
  expect(screen.queryByText("21+")).not.toBeInTheDocument();
  expect(screen.queryByText(/venue address was shared/)).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Event Videos" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Media" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Original ticket listing/ })).toHaveAttribute("href", "https://www.tickettailor.com/events/maybeforever/953469");
  expect(screen.queryByRole("region", { name: "Event Photos" })).not.toBeInTheDocument();
});
it("loads video players only on demand and retains a YouTube fallback", () => {
  const { container } = render(<MemoryRouter><ShowPage media={mediaItems} page={showPages[0]} /></MemoryRouter>);
  expect(container.querySelector("iframe")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Play Wylie Cable/ }));
  expect(container.querySelector("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/JEOty6YJ-IQ?autoplay=1");
  expect(screen.getAllByRole("link", { name: /Watch on YouTube/ })).toHaveLength(2);
});
it("resolves the CMS page and rejects unknown event slugs", async () => {
  const context = new RouterContextProvider();
  context.set(servicesContext, { getEventPage: async slug => ({ enabled: true, content: slug === showPages[0].slug ? { page: showPages[0], media: mediaItems } : null }) });
  expect((await loader({ context, params: { showSlug: showPages[0].slug } })).pageTitle).toBe(showPages[0].title);
  await expect(loader({ context, params: { showSlug: "missing" } })).rejects.toMatchObject({ status: 404 });
});

it("renders ENTER with its flyer and official listing without invented recordings", () => {
  render(<MemoryRouter><ShowPage media={mediaItems} page={showPages[1]} /></MemoryRouter>);
  expect(screen.getByText("September 17, 2026")).toBeInTheDocument();
  expect(screen.getByText("10 PM · JST")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Official event listing/ })).toHaveAttribute("href", "https://entershibuya.com/schedule/dome-of-doom-records-15-year-anniversary-world-tour/");
  expect(screen.queryByRole("heading", { name: "Event Videos" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Event Photos" })).not.toBeInTheDocument();
});
