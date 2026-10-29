import { index, route } from "@react-router/dev/routes";

export default [index("routes/home.jsx"), route("gallery", "routes/gallery.jsx"), route("*", "routes/not-found.jsx")];
