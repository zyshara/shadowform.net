import { Links, Meta, Outlet, Scripts } from "react-router";
import "../index.css";
import "../astral.css";
import "../person-record.css";
import "../navigation.css";

export function meta() {
  return [
    { title: "Family Tree" },
    { property: "og:title", content: "Family Tree" },
    { name: "twitter:title", content: "Family Tree" },
    { name: "description", content: "Explore the connections and stories of the Decker family." },
  ];
}

export function Layout({ children }) {
  return <html lang="en"><head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <Meta /><Links />
  </head><body>{children}<Scripts /></body></html>;
}

export default function Root() { return <Outlet />; }
