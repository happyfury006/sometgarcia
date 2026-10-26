// Petit serveur local pour prévisualiser dist/ : node serve.mjs → http://localhost:4321
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const DIST = new URL("./dist", import.meta.url).pathname;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".pdf": "application/pdf", ".xml": "application/xml" };

createServer(async (req, res) => {
  let chemin = join(DIST, decodeURIComponent(req.url.split("?")[0]));
  if (!chemin.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(chemin)).isDirectory()) chemin = join(chemin, "index.html");
    res.writeHead(200, { "Content-Type": TYPES[extname(chemin)] || "application/octet-stream" });
    res.end(await readFile(chemin));
  } catch {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    res.end(await readFile(join(DIST, "404.html")));
  }
}).listen(4321, () => console.log("Aperçu : http://localhost:4321"));
