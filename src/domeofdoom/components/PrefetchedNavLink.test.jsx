import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import PrefetchedNavLink from "./PrefetchedNavLink";
import { createCachedClientLoader } from "../app/clientCache";

afterEach(cleanup);

it("warms the data cache on hover and reuses it when the link is clicked", async () => {
  const serverLoader = vi.fn(async () => ({ items: [1] }));
  const cached = createCachedClientLoader();
  const router = createMemoryRouter([
    { path: "/", element: <PrefetchedNavLink to="/catalog">Catalog</PrefetchedNavLink> },
    { path: "/catalog", loader: ({ request }) => cached({ request, serverLoader }), element: <p>Catalog page</p> },
  ]);
  render(<RouterProvider router={router} />);
  fireEvent.mouseEnter(screen.getByRole("link", { name: "Catalog" }));
  await waitFor(() => expect(serverLoader).toHaveBeenCalledTimes(1));
  expect(screen.queryByText("Catalog page")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Catalog" }));
  await screen.findByText("Catalog page");
  expect(serverLoader).toHaveBeenCalledTimes(1);
});

it("does not fetch data for external links or pages without data loaders", () => {
  const router = createMemoryRouter([{ path: "/", element: <>
    <PrefetchedNavLink to="https://domeofdoom.bandcamp.com/merch">Merch</PrefetchedNavLink>
    <PrefetchedNavLink to="/contact">Contact</PrefetchedNavLink>
  </> }]);
  render(<RouterProvider router={router} />);
  fireEvent.mouseEnter(screen.getByRole("link", { name: "Merch" }));
  fireEvent.focus(screen.getByRole("link", { name: "Contact" }));
  expect(router.state.fetchers.size).toBe(0);
});
