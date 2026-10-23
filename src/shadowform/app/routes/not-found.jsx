import { data } from "react-router";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Not Found");
export function loader() { return data(null, { status: 404 }); }
export { default } from "../../pages/NotFound";
