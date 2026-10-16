// server/apps/domeofdoom/registerApi.js
//
// Registers domeofdoom's API routes (contact form, press/outlets). The SPA
// static-serving route lives separately in registerSpa.js.

import { registerContactRoutes } from "./contact.js";
import { registerPressRoutes } from "./press.js";

export function registerDomeOfDoomApi(app) {
  registerContactRoutes(app);
  registerPressRoutes(app);
}
