import Page from "../../pages/Engineering";
import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Engineering");
export async function loader({ context, params }) {
  return { apiData: { data: await context.get(servicesContext).getEngineering() } };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
