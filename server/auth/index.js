// server/auth/index.js
//
// Generic, app-agnostic auth proxy over Strapi's users-permissions plugin.
// Every shadowform.net subdomain shares the same Strapi user pool, so these
// routes aren't jenis32-specific — any current or future app's own
// register/login UI can call them. App-specific follow-up (e.g. creating a
// jenis32-account row) happens separately, client-side, after a successful
// register/login here. See server/jenis32/account.js for jenis32's own
// piece of that.
//
// The browser never talks to Strapi directly: this is the same
// Express-side proxy shape used by server/domeofdoom/contact.js and the
// (unshipped) feat-wedding branch's server/api/wedding.js, just generalized
// for the shared user pool instead of one app's own content types.

import express from "express";
import { requireAuth } from "../middleware/index.js";
import { createRateLimiter } from "../lib/rateLimit.js";
import { logger } from "../lib/logger.js";
import { strapiGet, strapiPost } from "../lib/strapi.js";

const STRAPI_URL = process.env.STRAPI_API_URL || "https://strapi-shadowform-52c53315c615.herokuapp.com";
const jsonBody = express.json();

// Verified live via GET /api/users-permissions/roles — stable unless
// someone restructures roles in Strapi admin.
const AUTHENTICATED_ROLE_ID = 1;

const checkRegisterLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
const checkLoginLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 20 });
const checkForgotLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

// Strapi's ApplicationError responses come back as
// { error: { status, name, message, details } }.
async function strapiErrorMessage(res) {
  try {
    const body = await res.json();
    return body?.error?.message || null;
  } catch {
    return null;
  }
}

export function registerAuthRoutes(app) {
  // POST /api/auth/register — { email, password }
  //
  // Deliberately does NOT call Strapi's own /api/auth/local/register.
  // That endpoint is public and its "allow_register" setting is an
  // instance-wide toggle with no way to scope it to "requests that came
  // through jenis32" — turning it on would let anyone who finds the
  // Strapi URL register directly, bypassing this app (and its rate
  // limiting) entirely. So "allow_register" stays off permanently, and
  // this creates users directly via the privileged API token instead —
  // same technique the (unshipped) feat-wedding branch used.
  app.post("/api/auth/register", jsonBody, async (req, res) => {
    if (!checkRegisterLimit(clientIp(req)).allowed) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }

    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    try {
      const existing = await strapiGet("/api/users", {
        "filters[email][$eqi]": email,
        "pagination[pageSize]": 1,
      }, { noCache: true });

      if (existing.length > 0) {
        return res.status(409).json({ error: "An account with that email already exists — try logging in instead." });
      }

      await strapiPost("/api/users", {
        username: email,
        email,
        password,
        confirmed: true,
        blocked: false,
        role: AUTHENTICATED_ROLE_ID,
      });

      // /api/users creates the user but doesn't return a JWT — log in
      // immediately after to get one. /api/auth/local isn't gated by
      // allow_register, so this works regardless of that setting.
      const loginRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        logger.error("[auth] post-register login failed:", loginData?.error?.message);
        return res.status(502).json({ error: "account created, but could not log you in — try logging in manually" });
      }

      res.status(201).json({ jwt: loginData.jwt, user: { id: loginData.user.id, email: loginData.user.email } });
    } catch (err) {
      logger.error("[auth] register error:", err.message, err.body ?? "");
      res.status(502).json({ error: "could not create account" });
    }
  });

  // POST /api/auth/login — { email, password }
  app.post("/api/auth/login", jsonBody, async (req, res) => {
    if (!checkLoginLimit(clientIp(req)).allowed) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }

    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    try {
      const strapiRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await strapiRes.json();

      if (!strapiRes.ok) {
        return res.status(401).json({ error: "Incorrect email or password." });
      }

      res.json({ jwt: data.jwt, user: { id: data.user.id, email: data.user.email } });
    } catch (err) {
      logger.error("[auth] login error:", err.message);
      res.status(502).json({ error: "could not log in" });
    }
  });

  // POST /api/auth/forgot-password — { email }
  // Always responds { ok: true } regardless of whether the email exists,
  // matching Strapi's own enumeration-safe behavior.
  app.post("/api/auth/forgot-password", jsonBody, async (req, res) => {
    if (!checkForgotLimit(clientIp(req)).allowed) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }

    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    try {
      const strapiRes = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!strapiRes.ok) {
        const message = await strapiErrorMessage(strapiRes);
        logger.warn("[auth] forgot-password failed:", message);
      }
    } catch (err) {
      logger.error("[auth] forgot-password error:", err.message);
    }

    // Always ok:true — never reveal whether the email was found.
    res.json({ ok: true });
  });

  // POST /api/auth/reset-password — { code, password, passwordConfirmation }
  app.post("/api/auth/reset-password", jsonBody, async (req, res) => {
    const { code, password, passwordConfirmation } = req.body ?? {};
    if (!code || !password || !passwordConfirmation) {
      return res.status(400).json({ error: "code, password, and passwordConfirmation are required" });
    }

    try {
      const strapiRes = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password, passwordConfirmation }),
      });
      const data = await strapiRes.json();

      if (!strapiRes.ok) {
        const message = data?.error?.message || "That reset link is invalid or has expired.";
        return res.status(400).json({ error: message });
      }

      res.json({ jwt: data.jwt, user: { id: data.user.id, email: data.user.email } });
    } catch (err) {
      logger.error("[auth] reset-password error:", err.message);
      res.status(502).json({ error: "could not reset password" });
    }
  });

  // GET /api/auth/me — protected
  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: { id: req.user.id, email: req.user.email, username: req.user.username } });
  });
}
