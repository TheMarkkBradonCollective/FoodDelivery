import { Readable } from "node:stream";
import { google } from "googleapis";
import { handle, HttpError, json, preflight, requireUser } from "@/lib/http";
import { readTable, update } from "@/lib/sheets";

export const OPTIONS = preflight;
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel caps function request bodies at ~4.5 MB; bigger videos need a resumable-upload URL (phase 2b)
const ALLOWED = /^(image\/(jpeg|png|webp|gif|heic)|video\/(mp4|quicktime|webm))$/;

/** Fields a file link can be saved to: table -> column. Add image columns here as they appear. */
const TARGETS: Record<string, string> = { profiles: "avatar_url" };

/**
 * POST /api/upload (multipart/form-data)
 *   file: the photo or video
 *   table, id (optional): save the link into TARGETS[table] on that row (e.g. profiles + own id)
 * Stores the file in DRIVE_FOLDER_ID as the Portr Google account (OAuth refresh token, drive.file scope)
 * and makes it link-viewable. Sheets access stays on the service account.
 */
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const folder = process.env.DRIVE_FOLDER_ID;
  if (!folder) throw new HttpError(503, "Uploads are not configured");
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "file is required");
  if (!ALLOWED.test(file.type)) throw new HttpError(415, "Only images and videos are allowed");
  if (file.size > MAX_BYTES) throw new HttpError(413, "File too large");

  const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REFRESH_TOKEN) {
    throw new HttpError(503, "Uploads are not configured");
  }
  const auth = new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN, scope: "https://www.googleapis.com/auth/drive.file" });
  const drive = google.drive({ version: "v3", auth });
  const created = await drive.files.create({
    supportsAllDrives: true,
    requestBody: { name: `${user.sub}-${Date.now()}-${file.name}`.slice(0, 200), parents: [folder] },
    media: { mimeType: file.type, body: Readable.from(Buffer.from(await file.arrayBuffer())) },
    fields: "id, webViewLink",
  });
  const fileId = created.data.id!;
  await drive.permissions.create({
    fileId,
    supportsAllDrives: true,
    requestBody: { role: "reader", type: "anyone" },
  });
  const url = file.type.startsWith("image/")
    ? `https://lh3.googleusercontent.com/d/${fileId}`
    : created.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`;

  const table = String(form.get("table") ?? "");
  const id = String(form.get("id") ?? "");
  if (table && id) {
    const column = TARGETS[table];
    if (!column) throw new HttpError(400, "No image field on that table");
    if (table === "profiles" && id !== user.sub && user.role !== "staff") throw new HttpError(403, "Not your profile");
    if (table !== "profiles") {
      const rows = await readTable(table);
      if (!rows.some((r) => String(r.id) === id)) throw new HttpError(404, "Row not found");
    }
    await update(table, { id }, { [column]: url });
  }
  return json(req, { fileId, url }, 201);
});
