import { registerArtistRoutes } from "../api/artists.js";
import { registerGuestbookRoutes } from "../api/guestbook.js";
import { registerManagementRoutes } from "../api/management.js";

export function registerApiRoutes(app, express) {
  registerGuestbookRoutes(app, express);
  registerArtistRoutes(app);
  registerManagementRoutes(app);
}
