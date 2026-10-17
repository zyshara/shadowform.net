// src/low-poly/vite.config.js
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  cacheDir: path.resolve(projectRoot, "node_modules/.vite/low-poly"),
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      // See src/redspear/vite.config.js for why this is aliased directly —
      // Vite's production SSR (Rolldown) build environment fails to
      // resolve a bare npm specifier for a CSS @import.
      tailwindcss: path.resolve(projectRoot, "node_modules/tailwindcss/index.css"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ base: projectRoot }), autoprefixer()],
    },
  },
});
