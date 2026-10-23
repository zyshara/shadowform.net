import Page from "../../pages/EngineeringWebArchiveProject";
import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Archive Project");
export async function loader({ context, params }) {
  const project = await context.get(servicesContext).getArchiveProject(params.slug);
  if (!project) throw new Response("Project not found", { status: 404 });
  return { apiData: { data: project }, pageTitle: project.eyebrow || project.title || "Archive Project" };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
