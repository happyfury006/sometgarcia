// Génère les sites du domaine sometgarcia.fr : sites/<site>/ → dist/<site>/.
// Usage : node build.mjs
import { rmSync, mkdirSync, cpSync } from "node:fs";
import { join } from "node:path";

const SITES = ["racine", "julen", "maitane"];

const ROOT = new URL(".", import.meta.url).pathname;
const DIST = join(ROOT, "dist");

rmSync(DIST, { recursive: true, force: true });
for (const nom of SITES) {
  const dist = join(DIST, nom);
  mkdirSync(dist, { recursive: true });
  const { default: construire } = await import(`./sites/${nom}/build.mjs`);
  const { pages, avertissements } = construire(dist);
  // Configuration Apache commune : HTTPS, en-têtes de sécurité, page 404
  cpSync(join(ROOT, "commun/.htaccess"), join(dist, ".htaccess"));
  console.log(`✓ ${nom} : ${pages} pages dans dist/${nom}/`);
  for (const a of avertissements) console.log(`  ⚠ ${a}`);
}
