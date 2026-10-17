// src/low-poly/app/root.jsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import appsConfig from "../../../config/apps.json";
import "../index.css";
import "@shared/themes/epk/lowpoly.css";

const { metadata, umamiId, faviconHref } = appsConfig["low-poly"];

export function meta() {
  return [
    { title: metadata.title },
    { name: "description", content: metadata.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: metadata.title },
    { property: "og:title", content: metadata.title },
    { property: "og:description", content: metadata.description },
    { property: "og:url", content: metadata.url },
    { property: "og:image", content: metadata.image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: metadata.title },
    { name: "twitter:description", content: metadata.description },
    { name: "twitter:url", content: metadata.url },
    { name: "twitter:image", content: metadata.image },
    { name: "robots", content: metadata.robots ?? "index, follow" },
    { tagName: "link", rel: "canonical", href: metadata.url },
    ...(metadata.jsonLd ? [{ "script:ld+json": metadata.jsonLd }] : []),
  ];
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href={faviconHref} />
        <Meta />
        <Links />
        {process.env.NODE_ENV === "production" && umamiId && (
          <script
            defer
            src="https://shadowform-umami-af10566d4462.herokuapp.com/script.js"
            data-website-id={umamiId}
          />
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
