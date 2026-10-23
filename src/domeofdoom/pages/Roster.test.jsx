import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Roster from "./Roster";

vi.mock("@/components/WarpedGrid", () => ({ default: () => null }));
vi.mock("@/components/GridDome", () => ({ default: () => null }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("keeps loaded artists visible as the scroll sentinel loads successive batches", () => {
  let intersect;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) { intersect = callback; }
    observe() {}
    disconnect() {}
  });
  const artists = Array.from({ length: 60 }, (_, i) => ({
    name: `Artist ${String(i).padStart(2, "0")}`,
    photo_src: `/artist-${i}.jpg`,
  }));
  const { rerender } = render(<Roster artists={artists} />);
  expect(screen.getAllByRole("img")).toHaveLength(24);

  act(() => intersect([{ isIntersecting: true }]));
  expect(screen.getAllByRole("img")).toHaveLength(48);
  rerender(<Roster artists={artists} />);
  expect(screen.getAllByRole("img")).toHaveLength(48);

  act(() => intersect([{ isIntersecting: true }]));
  expect(screen.getAllByRole("img")).toHaveLength(60);
  act(() => intersect([{ isIntersecting: true }]));
  expect(screen.getAllByRole("img")).toHaveLength(60);

  rerender(<Roster artists={artists.slice(0, 30)} />);
  expect(screen.getAllByRole("img")).toHaveLength(24);
});
