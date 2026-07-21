// server/scripts/getGoogleToken.js
//
// One-time helper: run `node server/scripts/getGoogleToken.js`, open the
// printed URL, approve access, then paste the `code` query param from the
// redirect URL back into this script's prompt. Prints a refresh_token to
// paste into .env as GOOGLE_REFRESH_TOKEN.

import "dotenv/config";
import { google } from "googleapis";
import readline from "node:readline/promises";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/calendar"],
});

console.log("Open this URL, approve access, then copy the `code` param from the redirect URL:\n");
console.log(url, "\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const code = await rl.question("Paste code here: ");
rl.close();

const { tokens } = await oauth2Client.getToken(code.trim());

console.log("\nAdd this to .env:\n");
console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
