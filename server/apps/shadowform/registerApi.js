// server/apps/shadowform/registerApi.js
//
// Registers shadowform's API routes (guestbook, engineering). The SPA
// static-serving route lives separately in registerSpa.js.

import { registerGuestbookRoutes } from "./guestbook.js";
import { registerEngineeringRoutes } from "./engineering.js";

export function registerShadowformApi(app, express) {
  registerGuestbookRoutes(app, express);
  registerEngineeringRoutes(app);
}
