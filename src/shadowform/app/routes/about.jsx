import Page, { PROFILE_IMAGE } from "../../pages/About";
import useRetainedLoaderData from "../../hooks/useRetainedLoaderData";
import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const links = () => [{ rel: "preload", as: "image", href: PROFILE_IMAGE, fetchPriority: "high" }];
export const meta = pageMeta("About");
export async function loader({ context, params }) {
  const { entries } = await context.get(servicesContext).getGuestbookData();
  return { latestEntry: entries[0] ?? null };
}
export default function Route({ loaderData }) { return <Page {...useRetainedLoaderData(loaderData)} />; }
