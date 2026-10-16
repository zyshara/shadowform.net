import { registerArtistRoutes } from "../api/artists.js";
import { registerGuestbookRoutes } from "../api/guestbook.js";
import { registerManagementRoutes } from "../api/management.js";
import { registerEpkRoutes } from "../api/epk.js";
import { registerEngineeringRoutes } from "../api/engineering.js";
import { registerDomeOfDoomRoutes } from "../domeofdoom/index.js";
import { registerAuthRoutes } from "../auth/index.js";

export function registerApiRoutes(app, express) {
  registerGuestbookRoutes(app, express);
  registerArtistRoutes(app);
  registerManagementRoutes(app);
  registerEpkRoutes(app);
  registerEngineeringRoutes(app);
  registerDomeOfDoomRoutes(app);
  registerAuthRoutes(app);
}
