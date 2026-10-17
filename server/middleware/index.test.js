// @vitest-environment node
import { expect, it, vi } from "vitest";
import { stripTrailingSlash } from "./index.js";

it.each([
  "/",
  "/@react-router/critical.css?pathname=/",
  "/@react-router/critical.css?pathname=/epk/",
  "/epk?returnTo=/",
])("preserves paths and query values in %s", (originalUrl) => {
  const redirect = vi.fn();
  const next = vi.fn();
  stripTrailingSlash({ originalUrl }, { redirect }, next);
  expect(redirect).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledOnce();
});

it.each([
  ["/epk/", "/epk"],
  ["/epk/?returnTo=/", "/epk?returnTo=/"],
])("normalizes %s without changing its query", (originalUrl, target) => {
  const redirect = vi.fn();
  const next = vi.fn();
  stripTrailingSlash({ originalUrl }, { redirect }, next);
  expect(redirect).toHaveBeenCalledWith(301, target);
  expect(next).not.toHaveBeenCalled();
});
