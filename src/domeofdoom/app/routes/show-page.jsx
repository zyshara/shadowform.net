import { servicesContext } from "../context";
import { createCachedClientLoader } from "../clientCache";
import { pageMeta } from "../pageMeta";
import ShowPage from "../../pages/ShowPage";
export const meta = pageMeta("Show");
export async function loader(args) {
  const result = await args.context.get(servicesContext).getEventPage(args.params.showSlug);
  if (!result.content) throw new Response("Show not found", { status: 404 });
  return { ...result.content, pageTitle: result.content.page.title, now: Date.now() };
}
export const clientLoader = createCachedClientLoader();
export default function Route({ loaderData }) { return <ShowPage {...loaderData} />; }
