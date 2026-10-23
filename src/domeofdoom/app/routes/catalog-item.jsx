import { servicesContext } from "../context";
import Page from "../../pages/CatalogItem";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("CatalogItem");
import { findByCatalogParam } from "../../utils/catalogItemSlug";
export async function loader({ context, params }) {
  const [items, artists] = await Promise.all([
    context.get(servicesContext).getCatalog(), context.get(servicesContext).getArtists(),
  ]);
  const item = findByCatalogParam(items, params.catalogParam);
  if (!item) throw new Response("Release not found", { status: 404 });
  return { allItems: [item], roster: artists.filter(a => item.artists.includes(a.name)),
    pageTitle: item.title, image: item.artwork_url };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
