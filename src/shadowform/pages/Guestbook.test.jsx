import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import Guestbook from "./Guestbook";

vi.mock("atrament", () => ({ default: class {
  addEventListener() {}
  destroy() {}
} }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("keeps Sign available after attaching a drawing and submits the attachment", async () => {
  const drawing = "data:image/png;base64,iVBORw0KGgo=";
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(drawing);
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ entry: {
    id: 1, name: "Visitor", message: "", date: "2026.10.16", tags: [], drawing: "https://example.com/drawing.png",
  } }) }));
  vi.stubGlobal("fetch", fetch);
  const { container } = render(<MemoryRouter><Guestbook initialData={{ entries: [], tags: [] }} /></MemoryRouter>);
  fireEvent.change(container.querySelector('input'), { target: { value: "Visitor" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /open drawing pad/i })));
  fireEvent.click(screen.getByRole("button", { name: /attach/i }));
  expect(screen.getByAltText("your drawing")).toBeInTheDocument();
  const sign = screen.getByRole("button", { name: /^sign$/i });
  expect(sign).toBeEnabled();
  fireEvent.click(sign);
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ name: "Visitor", drawing });
});
