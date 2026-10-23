import { redirect } from "react-router";
import routes from "../../data/routes";
export function loader({ request }) {
  const url = new URL(request.url);
  const target = routes.find(r => r.redirects?.includes(url.pathname));
  if (!target) throw new Response("Not found", { status: 404 });
  return redirect(target.path + url.search, 301);
}
export default function Redirect() { return null; }
