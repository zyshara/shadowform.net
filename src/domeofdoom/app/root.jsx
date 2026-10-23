// src/domeofdoom/app/root.jsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import appsConfig from "../../../config/apps.json";
import "../index.css";
import archivoFont from "@shared/assets/fonts/Archivo-VariableFont_wdth,wght.woff2?url";
import { pageMeta } from "./pageMeta";

export { servicesContext } from "./context";

const { umamiId, faviconHref } = appsConfig.domeofdoom;

export const meta = pageMeta(null);

export function links() {
  return [{ rel: "preload", as: "font", type: "font/woff2", href: archivoFont,
    crossOrigin: "anonymous", fetchPriority: "high" }];
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

export function ErrorBoundary({ error }) {
  const status = error?.status ?? 500;
  return <main style={{ padding: "4rem", color: "var(--dod-lilac)", background: "var(--dod-black)", minHeight: "100vh" }}>
    <h1>{status === 404 ? "Page not found" : "Unable to load this page"}</h1>
    <p>{status === 404 ? "This page does not exist." : "Please try again shortly."}</p>
    <a href="/">Back to Dome of Doom</a>
  </main>;
}
