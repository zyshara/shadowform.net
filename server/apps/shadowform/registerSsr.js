import { registerSsrApp } from "#lib/registerSsrApp.js";
import * as services from "./data.js";

export function registerShadowformSsr(app) {
  registerSsrApp(app, "shadowform", {
    services,
    preserved: true,
  });
}
