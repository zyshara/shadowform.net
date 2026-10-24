import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import PrefetchedNavLink from "./PrefetchedNavLink";
import { createCachedClientLoader } from "../app/clientCache";
import Navbar from "./Navbar";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("reuses a hover request when clicked before it finishes", async () => {
  let finish;
  const serverLoader = vi.fn(() => new Promise(resolve => { finish = resolve; }));
  const cached = createCachedClientLoader();
  const router = createMemoryRouter([
    { path: "/", element: <PrefetchedNavLink to="/catalog">Catalog</PrefetchedNavLink> },
    { path: "/catalog", loader: ({ request }) => cached({ request, serverLoader }), element: <p>Catalog page</p> },
  ]);
  render(<RouterProvider router={router} />);
  fireEvent.mouseEnter(screen.getByRole("link", { name: "Catalog" }));
  await waitFor(() => expect(serverLoader).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("link", { name: "Catalog" }));
  await waitFor(() => expect(router.state.navigation.state).toBe("loading"));
  finish({ items: [1] });
  await screen.findByText("Catalog page");
  expect(serverLoader).toHaveBeenCalledTimes(1);
});

function menuRouter() {
  const loaders = Object.fromEntries(["catalog", "roster", "press"].map(path => [path, vi.fn(async () => ({}))]));
  const router = createMemoryRouter([{ element: <Navbar />, children: [
    { path: "/", element: <p>Home</p> },
    ...Object.entries(loaders).map(([path, loader]) => ({ path: `/${path}`, loader, element: <p>{path}</p> })),
  ] }]);
  render(<RouterProvider router={router} />);
  return loaders;
}

it("warms data destinations when the mobile menu opens without navigating", async () => {
  const loaders = menuRouter();
  Object.values(loaders).forEach(loader => expect(loader).not.toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  await waitFor(() => Object.values(loaders).forEach(loader => expect(loader).toHaveBeenCalledTimes(1)));
  expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
});

it("skips automatic menu warming when data saving is enabled", async () => {
  vi.stubGlobal("navigator", { connection: { saveData: true } });
  const loaders = menuRouter();
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  Object.values(loaders).forEach(loader => expect(loader).not.toHaveBeenCalled());
});

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
