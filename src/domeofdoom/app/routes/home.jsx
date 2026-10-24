import { createCachedClientLoader } from "../clientCache";
import { servicesContext } from "../context";
import Page from "../../pages/Home";
import { pageMeta } from "../pageMeta";
import { homeContent } from "../../utils/catalogPayloads";
export const meta = pageMeta(null);
export async function loader({ context }) {
  const items = await context.get(servicesContext).getCatalog();
  return homeContent(items, Date.now());
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }

export const clientLoader = createCachedClientLoader();
