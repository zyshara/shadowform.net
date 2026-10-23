// server/apps/domeofdoom/registerApi.js
//
// Registers domeofdoom's API routes (contact form). The SSR
// frontend is registered separately in registerSsr.js.

import { registerContactRoutes } from "./routes/contact.js";

export function registerDomeOfDoomApi(app) {
  registerContactRoutes(app);
}
