#!/usr/bin/env node
/**
 * Local helper: mint a Drive refresh token for the Portr Google account.
 * Prints the token to your terminal only. Paste it into the Vercel env var
 * GOOGLE_OAUTH_REFRESH_TOKEN and never commit it.
 *
 *   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... npm run drive:token -w apps/api [-- --create-folder]
 *
 * The OAuth client must be a "Desktop app" client (loopback redirect allowed).
 */
import http from "node:http";
import { google } from "googleapis";

const { GOOGLE_OAUTH_CLIENT_ID: id, GOOGLE_OAUTH_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.");
  process.exit(1);
}
const port = 53682;
const redirect = `http://127.0.0.1:${port}/callback`;
const oauth = new google.auth.OAuth2(id, secret, redirect);
const url = oauth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive.file"],
  login_hint: "themarkkbrandoncollective@gmail.com",
});
console.log(`Open this URL and sign in as themarkkbrandoncollective@gmail.com:\n\n${url}\n`);

const code = await new Promise((resolve) => {
  const server = http.createServer((req, res) => {
    const c = new URL(req.url, redirect).searchParams.get("code");
    res.end(c ? "Done. You can close this tab." : "Missing code.");
    if (c) {
      server.close();
      resolve(c);
    }
  });
  server.listen(port, "127.0.0.1");
});
const { tokens } = await oauth.getToken(code);
if (!tokens.refresh_token) {
  console.error("No refresh token returned. Remove the app's access at myaccount.google.com/permissions and retry.");
  process.exit(1);
}
console.log("\nGOOGLE_OAUTH_REFRESH_TOKEN (store in Vercel env only):\n" + tokens.refresh_token);

if (process.argv.includes("--create-folder")) {
  oauth.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth });
  const f = await drive.files.create({
    requestBody: { name: "Portr uploads", mimeType: "application/vnd.google-apps.folder" },
    fields: "id",
  });
  console.log(`\nDRIVE_FOLDER_ID:\n${f.data.id}`);
}
