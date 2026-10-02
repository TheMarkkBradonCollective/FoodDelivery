const { app, BrowserWindow } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

const webRoot = app.isPackaged
  ? path.join(process.resourcesPath, "app")
  : path.resolve(__dirname, "../staff/out");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded.replace(/^\/+/, "");
  const candidate = path.normalize(path.join(webRoot, relative));
  if (!candidate.startsWith(webRoot)) return null;

  const tryPaths = [candidate];
  if (decoded.endsWith("/")) tryPaths.unshift(path.join(candidate, "index.html"));
  else tryPaths.push(`${candidate}.html`, path.join(candidate, "index.html"));

  for (const file of tryPaths) {
    if (file.startsWith(webRoot) && fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const file = resolveFile(req.url || "/");
      if (!file) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

async function openWindow() {
  const server = await startServer();
  const { port } = server.address();
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: "Portr Command",
    autoHideMenuBar: true,
    backgroundColor: "#100814",
  });
  window.on("closed", () => server.close());
  await window.loadURL(`http://127.0.0.1:${port}/`);
}

app.whenReady().then(openWindow);
app.on("window-all-closed", () => app.quit());
