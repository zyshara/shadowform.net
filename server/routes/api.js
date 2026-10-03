import { registerArtistRoutes } from "../api/artists.js";
import { registerGuestbookRoutes } from "../api/guestbook.js";
import { registerManagementRoutes } from "../api/management.js";
import { registerEpkRoutes } from "../api/epk.js";
import { registerEngineeringRoutes } from "../api/engineering.js";
import { registerDomeOfDoomRoutes } from "../domeofdoom/index.js";
import { registerAuthRoutes } from "../auth/index.js";
import { registerJenis32AccountRoutes } from "../jenis32/account.js";
import { registerJenis32BootstrapRoutes } from "../jenis32/bootstrap.js";
import { registerJenis32SubmissionRoutes } from "../jenis32/submissions.js";
import { registerJenis32MediaRoutes } from "../jenis32/media.js";
import { registerJenis32DrawingRoutes } from "../jenis32/drawing.js";
import { registerJenis32AudioRoutes } from "../jenis32/audio.js";

export function registerApiRoutes(app, express) {
  registerGuestbookRoutes(app, express);
  registerArtistRoutes(app);
  registerManagementRoutes(app);
  registerEpkRoutes(app);
  registerEngineeringRoutes(app);
  registerDomeOfDoomRoutes(app);
  registerAuthRoutes(app);
  registerJenis32AccountRoutes(app);
  registerJenis32BootstrapRoutes(app);
  registerJenis32SubmissionRoutes(app);
  registerJenis32MediaRoutes(app);
  registerJenis32DrawingRoutes(app);
  registerJenis32AudioRoutes(app);
}
