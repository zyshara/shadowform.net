import { servicesContext } from "../context";
import Page from "../../pages/Roster";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Roster");
export async function loader({ context }) {
  return { artists: await context.get(servicesContext).getArtists() };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
