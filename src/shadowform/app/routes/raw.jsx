import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Web Archive");
export async function loader({ context, params }) {
  const project = await context.get(servicesContext).getArchiveProject(params.slug);
  if (!project) throw new Response("Project not found", { status: 404 });
  return { pageTitle: project.eyebrow || "Web Archive" };
}
export { default } from "../../pages/EngineeringWebArchiveProjectRaw";
