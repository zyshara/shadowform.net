import { index, layout, route } from "@react-router/dev/routes";
import navRoutes from "../data/routes.js";

const pages = {
  about: "about", engineering: "engineering", "engineering-archive": "archive",
  "engineering-archive-project": "project", guestbook: "guestbook",
};
const children = navRoutes.map(({ id, path }) =>
  route(path.slice(1), `routes/${pages[id] ?? "construction"}.jsx`, { id: `page-${id}` })
);
const redirects = navRoutes.flatMap(({ redirects = [] }) => redirects.map(path =>
  route(path.slice(1), "routes/redirect.jsx", { id: `redirect-${path.slice(1)}` })
));
export default [
  index("routes/enter.jsx"),
  route("engineering/archive/:slug/raw", "routes/raw.jsx"),
  route("reset-password", "routes/reset-password.jsx"),
  layout("routes/layout.jsx", [...children, ...redirects, route("*", "routes/not-found.jsx")]),
];
