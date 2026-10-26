// Utilitaires partagés par les générateurs de sites/.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

// Empreinte courte d'un contenu, ajoutée à l'adresse des CSS et JS (style.css?v=3f2a9c1e) :
// elle change dès que le fichier change, donc les navigateurs ne gardent pas une
// ancienne version en cache (le serveur leur demande de garder ces fichiers 7 jours)
export const empreinte = (contenu) => createHash("sha256").update(contenu).digest("hex").slice(0, 8);
export const empreinteFichier = (fichier) => empreinte(readFileSync(fichier));

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lireJson = (f) => JSON.parse(readFileSync(f, "utf8"));

// Écrit un fichier de dist/<site>/ en créant les dossiers au besoin
export const ecrivain = (dist) => (rel, contenu) => {
  const f = join(dist, rel);
  mkdirSync(join(f, ".."), { recursive: true });
  writeFileSync(f, contenu);
};

export const sitemap = (url, chemins) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chemins.map((c) => `  <url><loc>${url}${c}</loc></url>`).join("\n")}\n</urlset>\n`;

// Largeur et hauteur d'une image PNG, WebP ou JPEG, pour réserver sa place avant le chargement
export function dimensions(fichier) {
  const b = readFileSync(fichier);
  if (b.toString("ascii", 1, 4) === "PNG") return { l: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    // JPEG : on parcourt les segments jusqu'à l'en-tête de trame (SOF0 à SOF15, sauf DHT, JPG et DAC)
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 0xff) { i++; continue; }
      const marqueur = b[i + 1];
      if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
        return { l: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const format = b.toString("ascii", 12, 16);
    if (format === "VP8 ") return { l: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (format === "VP8L") {
      const n = b.readUInt32LE(21);
      return { l: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
    }
    if (format === "VP8X") return { l: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`Format d'image non reconnu (PNG, WebP ou JPEG attendu) : ${fichier}`);
}

// Encode chaque caractère en entité HTML : l'adresse reste cliquable mais échappe aux robots les plus simples
export const masquer = (s) => [...s].map((c) => `&#${c.codePointAt(0)};`).join("");
