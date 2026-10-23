import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const project = (name, app, include) => ({
  resolve: { alias: {
    "@": path.join(root, "src", app),
    "@shared": path.join(root, "src/shared"),
  } },
  test: {
    name, environment: "jsdom", globals: true,
    setupFiles: [path.join(root, "src/test/setup.js")], include,
  },
});

export default defineConfig({ test: { projects: [
  project("main", "domeofdoom", ["server/**/*.test.js", "src/{domeofdoom,redspear,low-poly}/**/*.test.{js,jsx}"]),
  project("shadowform", "shadowform", ["src/shadowform/**/*.test.{js,jsx}"]),
] } });
