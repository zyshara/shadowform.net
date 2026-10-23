import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { swapTitleEmojis } from "@shared/utils/swapTitleEmojis";
import alagard from "@shared/assets/fonts/Alagard.ttf?url";
import alkhemikal from "@shared/assets/fonts/Alkhemikal.ttf?url";
import "../index.css";
import { pageMeta } from "./pageMeta";
export { servicesContext } from "./context";
export const meta = pageMeta(null);
export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Noto+Color+Emoji&family=Cinzel:wght@700;900&family=Space+Mono:wght@400;700&display=swap" },
    ...[alagard, alkhemikal].map(href => ({ rel: "preload", as: "font", type: "font/ttf", href, crossOrigin: "anonymous" })),
  ];
}
export function Layout({ children }) {
  return <html lang="en"><head>
    <meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="/shared/favicon.png" /><Meta /><Links />
  </head><body>{children}<ScrollRestoration /><Scripts /></body></html>;
}
export default function Root() {
  useEffect(() => {
    const timer = swapTitleEmojis("🖤", "🩷", 500);
    return () => clearInterval(timer);
  }, []);
  return <Outlet />;
}
export function ErrorBoundary({ error }) {
  return <main style={{ padding: "3rem", background: "var(--bg)", color: "var(--text-body)", minHeight: "100vh" }}>
    <h1>{error?.status === 404 ? "page not found" : "unable to load this page"}</h1>
    <p>Please try again shortly.</p><a href="/about">back to shadowform</a>
  </main>;
}
