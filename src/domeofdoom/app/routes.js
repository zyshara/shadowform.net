import { index, layout, route } from "@react-router/dev/routes";
export default [layout("routes/layout.jsx", [
  index("routes/home.jsx"),
  route("catalog", "routes/catalog.jsx"),
  route("catalog/:catalogParam", "routes/catalog-item.jsx"),
  route("roster", "routes/roster.jsx"),
  route("roster/:artistSlug", "routes/artist.jsx"),
  route("press", "routes/press.jsx"),
  route("about", "routes/about.jsx"),
  route("shows", "routes/shows.jsx"),
  route("shows/:showSlug", "routes/show-page.jsx"),
  route("merch", "routes/merch.jsx"),
  route("licensing", "routes/licensing.jsx"),
  route("contact", "routes/contact.jsx"),
  route("*", "routes/not-found.jsx"),
])];
