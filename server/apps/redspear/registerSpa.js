import { registerSsrApp } from "#lib/registerSsrApp.js";

export function registerRedspearSpa(app) {
  registerSsrApp(app, "redspear", 24678);
}
