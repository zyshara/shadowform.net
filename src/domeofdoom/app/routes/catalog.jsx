import { createCachedClientLoader } from "../clientCache";
import { servicesContext } from "../context";
import Page from "../../pages/Catalog";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Catalog");
// Filters and sorting use the catalog already loaded in the browser.
export function shouldRevalidate({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) {
  if (!formMethod && currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search) return false;
  return defaultShouldRevalidate;
}
export async function loader({ context }) {
  return { allItems: await context.get(servicesContext).getCatalog() };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }

export const clientLoader = createCachedClientLoader();
