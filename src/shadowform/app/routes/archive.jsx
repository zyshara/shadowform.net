import Page from "../../pages/EngineeringArchive";
import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Engineering Archive");
export async function loader({ context, params }) {
  return { apiData: { data: await context.get(servicesContext).getEngineeringArchive() } };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
