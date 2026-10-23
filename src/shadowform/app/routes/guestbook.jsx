import Page from "../../pages/Guestbook";
import { servicesContext } from "../context";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Guestbook");
export async function loader({ context, params }) {
  return { initialData: await context.get(servicesContext).getGuestbookData() };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }
