// server/lib/instagram.js
//
// Instagram API with Instagram Login (graph.instagram.com), not the old
// Basic Display API. Long-lived tokens last 60 days and must be refreshed
// before they expire — once expired there's no way back except redoing the
// full OAuth login flow (see server/scripts/getInstagramToken.js).

import { logger } from "./logger.js";

const INSTAGRAM_APP_ID     = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

export function getAuthUrl(redirectUri) {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic",
    response_type: "code",
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

export async function exchangeCodeForShortLivedToken(code, redirectUri) {
  const body = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID,
    client_secret: INSTAGRAM_APP_SECRET,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body,
  });

  if (!res.ok) throw new Error(`Instagram code exchange failed: ${res.status} ${await res.text()}`);
  return res.json(); // { access_token, user_id, permissions }
}

export async function exchangeForLongLivedToken(shortLivedToken) {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: INSTAGRAM_APP_SECRET,
    access_token: shortLivedToken,
  });

  const res = await fetch(`https://graph.instagram.com/access_token?${params}`);
  if (!res.ok) throw new Error(`Instagram long-lived exchange failed: ${res.status} ${await res.text()}`);
  return res.json(); // { access_token, token_type, expires_in }
}

export async function refreshLongLivedToken(token) {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: token,
  });

  const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params}`);
  if (!res.ok) throw new Error(`Instagram token refresh failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  logger.info(`[instagram] token refreshed, expires in ${data.expires_in}s`);
  return data; // { access_token, token_type, expires_in }
}
