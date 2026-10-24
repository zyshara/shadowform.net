import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Press from "./Press";
import { MemoryRouter } from "react-router";

afterEach(cleanup);

it("keeps article text and its link visible before thumbnail loading and after failure", () => {
  render(<MemoryRouter><Press items={[{ id: "article", title: "Test coverage", date: "2026-01-01", url: "https://example.com/article",
    ogImage: "https://example.com/slow-image.jpg", imageMode: "og", excerpt: "Article summary", outlet: { name: "Test outlet" } }]} /></MemoryRouter>);
  const text = screen.getByText("Test coverage");
  const link = text.closest("a");
  expect(link).toHaveAttribute("href", "https://example.com/article");
  for (let element = text; element && element !== document.body; element = element.parentElement) {
    expect(element).not.toHaveClass("opacity-0");
  }
  expect(screen.getByText("Article summary")).toBeVisible();
  fireEvent.error(screen.getByAltText("Test coverage"));
  expect(text).toBeVisible();
  expect(screen.getByText("Read Article")).toBeVisible();
});
