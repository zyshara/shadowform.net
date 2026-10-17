import { registerSsrApp } from "#lib/registerSsrApp.js";

export function registerLowPolySpa(app) {
  registerSsrApp(app, "low-poly", 24679);
}
