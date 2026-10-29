import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/familytree",
  plugins: [reactRouter()],
});
