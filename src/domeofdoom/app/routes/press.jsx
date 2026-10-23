import { servicesContext } from "../context";
import Page from "../../pages/Press";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Press");
export async function loader({ context }) {
  return { items: await context.get(servicesContext).getPressItems() };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
