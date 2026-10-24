import { createCachedClientLoader } from "../clientCache";
import { servicesContext } from "../context";
import Page from "../../pages/Catalog";
import { pageMeta } from "../pageMeta";
import { catalogSummary } from "../../utils/catalogPayloads";
export const meta = pageMeta("Catalog");
// Filters and sorting use the catalog already loaded in the browser.
export function shouldRevalidate({ currentUrl, nextUrl, formMethod, defaultShouldRevalidate }) {
  if (!formMethod && currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search) return false;
  return defaultShouldRevalidate;
}
export async function loader({ context }) {
  const items = await context.get(servicesContext).getCatalog();
  return { allItems: items.map(catalogSummary) };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }

export const clientLoader = createCachedClientLoader();
