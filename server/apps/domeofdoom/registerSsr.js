import { registerSsrApp } from "#lib/registerSsrApp.js";
import * as domeofdoom from "./data.js";

export function registerDomeOfDoomSsr(app) {
  registerSsrApp(app, "domeofdoom", { services: domeofdoom });
}
