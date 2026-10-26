// Page d'accueil de sometgarcia.fr : une entrée par sous-domaine, chacune dans le style du site vers lequel elle mène.
// Appelé par le build.mjs de la racine du dépôt.
import { writeFileSync, cpSync } from "node:fs";
import { join } from "node:path";
import { esc, lireJson, ecrivain, sitemap, empreinte, empreinteFichier } from "../../commun/outils.mjs";
import { lireApparence, urlPolices, famillesChoisies } from "../../commun/theme.mjs";

const ROOT = new URL(".", import.meta.url).pathname;
const site = lireJson(join(ROOT, "content/site.json"));
// le panneau de Maitane suit les polices et l'accent choisis dans son admin
const apparenceMaitane = lireApparence(join(ROOT, "../maitane/content/apparence.json"));
const polices = urlPolices([
  ["Chakra Petch", "wght@600"],
  ["IBM Plex Mono", "wght@400"],
  ["Cormorant Garamond", "wght@400"],
  ...famillesChoisies(apparenceMaitane.polices),
]);

function page({ titre, chemin, contenu }) {
  const full = titre ? `${titre} — ${site.nom}` : site.nom;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(site.description)}">
<link rel="canonical" href="${site.url}${chemin}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${site.url}${chemin}">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(polices)}" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css?v=${empreinteFichier(join(ROOT, "assets/style.css"))}">
<link rel="stylesheet" href="/assets/theme.css?v=${empreinte(themeCss())}">
</head>
<body>
${contenu}
</body>
</html>`;
}

// Chaque panneau reprend l'identité du site cible : le portfolio spatial de Julen, l'éditorial noir et blanc de Maitane
function panneau(m) {
  const domaine = new URL(m.url).host;
  const fond = m.image ? `<img class="panneau-fond" src="${esc(m.image)}" alt="" loading="eager">` : "";
  const nom = m.id === "julen"
    ? `<span class="sigle" aria-hidden="true">◈</span>${esc(m.prenom)}`
    : esc(m.prenom);
  return `<a class="panneau panneau-${esc(m.id)}" href="${esc(m.url)}">
    ${fond}
    <span class="panneau-contenu">
      <span class="panneau-role">${esc(m.role)}</span>
      <span class="panneau-nom">${nom}</span>
      <span class="panneau-detail">${esc(m.detail)}</span>
      <span class="panneau-lien">${esc(domaine)} <span aria-hidden="true">→</span></span>
    </span>
  </a>`;
}

function accueil() {
  return page({
    chemin: "/",
    contenu: `<header class="titre">
  <h1>${esc(site.nom)}</h1>
</header>
<main class="panneaux">
  ${site.membres.map(panneau).join("\n  ")}
</main>`,
  });
}

function introuvable() {
  return page({
    titre: "Page introuvable",
    chemin: "/404.html",
    contenu: `<main class="perdu">
  <h1>Page introuvable</h1>
  <p>Cette page n'existe pas ou plus.</p>
  <a href="/">← Retour à l'accueil</a>
</main>`,
  });
}

// Polices et accent de Maitane, pour son panneau
function themeCss() {
  const { polices: p, couleurs: c } = apparenceMaitane;
  return `/* Généré à partir de sites/maitane/content/apparence.json */\n:root {\n  --maitane-accent: ${c.accent};\n  --maitane-titre: "${p.titres}", Georgia, serif;\n  --maitane-texte: "${p.texte}", sans-serif;\n  --maitane-signature: "${p.signature}", cursive;\n}\n`;
}

export default function construire(DIST) {
  const ecrire = ecrivain(DIST);
  ecrire("index.html", accueil());
  ecrire("404.html", introuvable());
  cpSync(join(ROOT, "assets"), join(DIST, "assets"), { recursive: true });
  writeFileSync(join(DIST, "assets/theme.css"), themeCss());
  cpSync(join(ROOT, "public"), DIST, { recursive: true });
  writeFileSync(join(DIST, "sitemap.xml"), sitemap(site.url, ["/"]));
  return { pages: 2, avertissements: [] };
}
