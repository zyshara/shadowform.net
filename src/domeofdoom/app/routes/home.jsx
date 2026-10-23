import { servicesContext } from "../context";
import Page from "../../pages/Home";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta(null);
export async function loader({ context }) {
  return { catalogItems: await context.get(servicesContext).getCatalog(), now: Date.now() };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
