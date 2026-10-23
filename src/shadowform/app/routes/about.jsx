import Page from "../../pages/About";
import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("About");
export async function loader({ context, params }) {
  const { entries } = await context.get(servicesContext).getGuestbookData();
  return { latestEntry: entries[0] ?? null };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
