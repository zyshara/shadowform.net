import { rm } from "node:fs/promises";

// Clear only these apps' generated output, including legacy Webpack bundles.
// Other archived apps in dist are outside this build's ownership.
const apps = ["redspear", "low-poly", "domeofdoom", "shadowform"];
await Promise.all(apps.map((app) =>
  rm(new URL(`../dist/${app}/`, import.meta.url), { recursive: true, force: true })
));
console.log(`Cleared build output for ${apps.join(", ")}`);
