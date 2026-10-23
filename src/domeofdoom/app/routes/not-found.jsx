import { pageMeta } from "../pageMeta";
import { data } from "react-router";
export const meta = pageMeta("NotFound");
export function loader() { return data(null, { status: 404 }); }
export { default } from "../../pages/NotFound";
