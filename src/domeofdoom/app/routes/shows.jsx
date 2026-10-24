import { pageMeta } from "../pageMeta";
import { servicesContext } from "../context";
import { createCachedClientLoader } from "../clientCache";
import Shows from "../../pages/Shows";
export const meta = pageMeta("Shows");
export async function loader({ context }) {
  const result = await context.get(servicesContext).getEventIndex();
  return { shows: result.shows, now: Date.now() };
}
export const clientLoader = createCachedClientLoader();
export default function Route({ loaderData }) { return <Shows {...loaderData} />; }
