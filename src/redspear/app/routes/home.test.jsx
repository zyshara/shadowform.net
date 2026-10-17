import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Home from "./home";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it("keeps the splash until the hub image is decoded, then fades once", async () => {
  vi.useFakeTimers();
  vi.spyOn(console, "log").mockImplementation(() => {});
  const { container } = render(<Home />);
  const hubImage = container.querySelector("#rs-hub img");
  let finishDecode;
  hubImage.decode = vi.fn(() => new Promise((resolve) => { finishDecode = resolve; }));
  expect(screen.getByRole("button")).toBeDisabled();
  fireEvent.load(hubImage);
  expect(screen.getByRole("button")).toBeDisabled();
  await act(async () => finishDecode());
  fireEvent.click(screen.getByRole("button", { name: "Enter" }));
  expect(container.querySelector("#rs-splash-screen")).toHaveClass("rs-fade-out");
  act(() => vi.advanceTimersByTime(500));
  expect(container.querySelector("#rs-splash-screen")).toBeNull();
  expect(container.querySelector("#rs-hub")).not.toHaveAttribute("inert");
});

it("allows entry with a text fallback when the hub image fails", () => {
  const { container } = render(<Home />);
  fireEvent.error(container.querySelector("#rs-hub img"));
  expect(screen.getByRole("button", { name: "Enter" })).toBeEnabled();
  expect(container.querySelector(".rs-wordmark-fallback")).toHaveTextContent("Red Spear");
});
