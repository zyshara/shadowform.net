// server/lib/spotify.js

const SPOTIFY_CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken  = null;
let tokenExpires = 0;

export async function getSpotifyToken() {
  if (accessToken && Date.now() < tokenExpires) return accessToken;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.statusText}`);

  const data    = await res.json();
  accessToken   = data.access_token;
  tokenExpires  = Date.now() + (data.expires_in - 60) * 1000; // 60s buffer
  return accessToken;
}

export async function spotifyGet(path) {
  const token = await getSpotifyToken();
  const fullUrl = `https://api.spotify.com/v1${path}`;
  console.log("[spotify] full url:", fullUrl);
  const res = await fetch(fullUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    const retryAfter = res.headers.get("retry-after");
    const allHeaders = Object.fromEntries(res.headers.entries());
    console.error("[spotify] error headers:", allHeaders);
    console.error("[spotify] error body:", body);
    throw new Error(`Spotify API error: ${res.status} ${body}`);
  }
  return res.json();
}

export function parseSpotifyArtistId(url) {
  // https://open.spotify.com/artist/0gC15Kf5barpTK7R1ZkMzc
  const match = url.match(/artist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}
