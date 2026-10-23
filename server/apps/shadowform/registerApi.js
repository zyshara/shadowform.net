import { registerGuestbookRoutes } from "./routes/guestbook.js";

export function registerShadowformApi(app) {
  registerGuestbookRoutes(app);
}
