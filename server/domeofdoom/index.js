import { registerContactRoutes } from "./contact.js";
import { registerPressRoutes } from "./press.js";

export function registerDomeOfDoomRoutes(app) {
  registerContactRoutes(app);
  registerPressRoutes(app);
}
