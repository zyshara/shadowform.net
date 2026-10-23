import { registerSsrApp } from "#lib/registerSsrApp.js";

export function registerLowPolySsr(app) {
  registerSsrApp(app, "low-poly");
}
