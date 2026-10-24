import React, { useState } from "react";
import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import FilterBar from "./FilterBar";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Harness() {
  const [selected, setSelected] = useState(new Set());
  const [sort, setSort] = useState("newest");
  return <FilterBar groups={[{ key: "type", label: "Type", selected,
    options: ["Show", "Festival"].map(value => ({ value, label: value, count: 2 })),
    onToggle: value => setSelected(previous => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    }),
  }]} sortOptions={[{ value: "newest", label: "Newest First" }, { value: "oldest", label: "Oldest First" }]}
    sortValue={sort} onSortChange={setSort} resultCount={4}
    onClearAll={() => setSelected(new Set())} />;
}
it("supports multiple desktop choices and removes individual active chips", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /^Type / }));
  fireEvent.click(screen.getByRole("button", { name: "Show 2" }));
  fireEvent.click(screen.getByRole("button", { name: "Festival 2" }));
  expect(screen.getByRole("button", { name: "Show 2" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Show" }));
  expect(screen.getByRole("button", { name: "Show 2" })).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(screen.getByRole("button", { name: "Clear All" }));
  expect(screen.queryByText("Active Filters:")).not.toBeInTheDocument();
});
it("keeps desktop and mobile sorting synchronized", () => {
  render(<Harness />);
  const sorts = screen.getAllByRole("combobox", { name: "Sort" });
  fireEvent.change(sorts[0], { target: { value: "oldest" } });
  expect(sorts[1]).toHaveValue("oldest");
});
it("shares mobile checkbox selections and restores scrolling after closing", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "Filters" }));
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.click(screen.getByRole("checkbox", { name: /^Show/ }));
  expect(screen.getByRole("button", { name: "Show" })).toBeInTheDocument();
  const panel = screen.getByRole("button", { name: "Close filters" }).parentElement.parentElement;
  fireEvent.click(within(panel).getByRole("button", { name: "Clear All" }));
  expect(screen.getByRole("checkbox", { name: /^Show/ })).not.toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
  expect(document.body.style.overflow).toBe("");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Close filters" })).not.toBeInTheDocument());
});

it("closes when clicking elsewhere in the filter bar or outside the page controls", () => {
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: /^Type / });
  fireEvent.click(trigger);
  const option = screen.getByRole("button", { name: "Show 2" });
  fireEvent.pointerDown(option);
  fireEvent.click(option);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  fireEvent.pointerDown(screen.getAllByRole("combobox", { name: "Sort" })[1]);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("button", { name: "Show 2" })).not.toBeInTheDocument();
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "Show" })).toBeInTheDocument();
});
it("dismisses on Escape and on outside events stopped by other controls", () => {
  render(<Harness />);
  const trigger = screen.getByRole("button", { name: /^Type / });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(trigger);
  const outside = screen.getAllByRole("combobox", { name: "Sort" })[1];
  outside.addEventListener("pointerdown", event => event.stopPropagation());
  fireEvent.pointerDown(outside);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
