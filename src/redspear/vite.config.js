// src/redspear/vite.config.js
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  cacheDir: path.resolve(projectRoot, "node_modules/.vite/redspear"),
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      // Vite always inlines `@import` itself (via its own postcss-import,
      // ahead of any postcss plugins we configure) using its regular module
      // resolver — which, in the production SSR (Rolldown) build
      // environment specifically, fails to resolve a bare npm specifier
      // like "tailwindcss" for a CSS @import (works fine in dev and in the
      // client build). Aliasing it to its real file sidesteps that
      // resolution entirely.
      tailwindcss: path.resolve(projectRoot, "node_modules/tailwindcss/index.css"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ base: projectRoot }), autoprefixer()],
    },
  },
});
