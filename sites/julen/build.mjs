// Portfolio de Julen (julen.sometgarcia.fr) : lit content/, écrit dans le dossier reçu.
// Appelé par le build.mjs de la racine du dépôt.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const site = JSON.parse(readFileSync(join(ROOT, "content/site.json"), "utf8"));

// Projets triés du plus récent au plus ancien
const projets = readdirSync(join(ROOT, "content/projets"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(ROOT, "content/projets", f), "utf8")))
  .sort((a, b) => b.date.localeCompare(a.date));

for (const p of projets) {
  if (!p.slug || !["data", "web"].includes(p.type)) {
    throw new Error(`Projet invalide (slug ou type manquant) : ${p.titre}`);
  }
}

// ---------- utilitaires ----------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const dateFr = (ym) => { const [y, m] = ym.split("-"); return `${MOIS[+m - 1]} ${y}`; };
const code = (p, i) => `${p.type === "data" ? "DAT" : "WEB"}-${String(projets.length - i).padStart(2, "0")}`;
const ext = (url, label) =>
  url ? `<a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>` : "";

// ---------- gabarit commun ----------
function page({ titre, description, chemin, contenu, corpsClasse = "" }) {
  const full = titre ? `${titre} — ${site.nom}` : `${site.nom} — ${site.titre}`;
  const nav = (href, label) =>
    `<a href="${href}"${chemin === href ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description || site.accroche)}">
<link rel="canonical" href="${site.url}${chemin}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description || site.accroche)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${site.url}${chemin}">
<meta name="theme-color" content="#05070d">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
</head>
<body class="${corpsClasse}">
<canvas id="etoiles" aria-hidden="true"></canvas>
<a class="sauter" href="#contenu">Aller au contenu</a>
<header class="barre">
  <a class="marque" href="/"><span class="marque-sigle" aria-hidden="true">◈</span> ${esc(site.nom)}</a>
  <nav aria-label="Navigation principale">
    ${nav("/", "Accueil")}
    ${nav("/projets/", "Missions")}
    <a href="/#contact">Contact</a>
  </nav>
</header>
<main id="contenu">
${contenu}
</main>
<footer class="pied">
  <span class="mono">${esc(site.indicatif)} · transmission terminée</span>
  <span>© ${new Date().getFullYear()} ${esc(site.nom)} · <a href="https://sometgarcia.fr">sometgarcia.fr</a></span>
</footer>
<script src="/assets/main.js" defer></script>
</body>
</html>`;
}

// ---------- composants ----------
function carte(p, i) {
  const resultat = p.type === "data" && p.resultats?.[0]
    ? `<p class="carte-chiffre"><strong>${esc(p.resultats[0].valeur)}</strong> ${esc(p.resultats[0].libelle)}</p>` : "";
  return `<article class="carte carte-${p.type}">
  <a class="carte-lien" href="/projets/${esc(p.slug)}/">
    <div class="carte-tete mono">
      <span class="pastille pastille-${p.type}">${p.type === "data" ? "Data" : "Web / Dev"}</span>
      <span>${code(p, i)}</span>
    </div>
    <h3>${esc(p.titre)}${p.exemple ? ' <span class="exemple">exemple</span>' : ""}</h3>
    <p>${esc(p.resume)}</p>
    ${resultat}
    <ul class="etiquettes" aria-label="Technologies">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    <span class="carte-date mono">${dateFr(p.date)}</span>
  </a>
</article>`;
}

function section(titre, corps, etiquette) {
  return `<section class="bloc">
  <h2><span class="mono bloc-etiquette">${etiquette}</span>${esc(titre)}</h2>
  ${corps}
</section>`;
}

// ---------- pages ----------
function accueil() {
  const vedettes = projets.filter((p) => p.vedette);
  const contenu = `
<section class="intro">
  <div class="intro-texte">
    <p class="mono intro-statut"><span class="voyant" aria-hidden="true"></span>${esc(site.statut)}</p>
    <h1>${esc(site.nom)}</h1>
    <p class="intro-titre">${esc(site.titre)}</p>
    <p class="intro-accroche">${esc(site.accroche)}</p>
    <div class="actions">
      <a class="btn" href="/projets/">Voir les missions</a>
      <a class="btn btn-ghost" href="${esc(site.contact.cv)}">Télécharger le CV</a>
    </div>
  </div>
  <div class="hud" aria-hidden="true">
    <div class="hud-anneau"></div><div class="hud-anneau hud-anneau-2"></div><div class="hud-planete"></div>
    <span class="mono hud-coord">45.77° N · 3.08° E</span>
  </div>
</section>

<section class="bloc" aria-labelledby="t-missions">
  <div class="bloc-entete">
    <h2 id="t-missions"><span class="mono bloc-etiquette">01 / Missions</span>Projets choisis</h2>
    <a class="lien-fleche" href="/projets/">Toutes les missions →</a>
  </div>
  <div class="grille">${vedettes.map((p) => carte(p, projets.indexOf(p))).join("")}</div>
</section>

<section class="bloc deux-colonnes" aria-labelledby="t-profil">
  <div>
    <h2 id="t-profil"><span class="mono bloc-etiquette">02 / Profil</span>Qui pilote</h2>
    ${site.presentation.map((t) => `<p>${esc(t)}</p>`).join("")}
    <p class="mono langues">Langues · ${site.langues.map(esc).join(" · ")}</p>
  </div>
  <dl class="competences">
    ${site.competences.map((g) => `<div><dt class="mono">${esc(g.groupe)}</dt><dd>${g.items.map((s) => `<span>${esc(s)}</span>`).join("")}</dd></div>`).join("")}
  </dl>
</section>

<section class="bloc contact" id="contact" aria-labelledby="t-contact">
  <h2 id="t-contact"><span class="mono bloc-etiquette">03 / Canal ouvert</span>Me contacter</h2>
  <p>Pour un stage, une question sur un projet ou simplement échanger.</p>
  <div class="actions">
    <a class="btn" href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>
    ${ext(site.contact.github, "GitHub")}
    ${ext(site.contact.linkedin, "LinkedIn")}
  </div>
</section>`;
  return page({ chemin: "/", contenu, corpsClasse: "page-accueil" });
}

function listeProjets() {
  const contenu = `
<section class="bloc entete-page">
  <p class="mono bloc-etiquette">Journal de bord</p>
  <h1>Toutes les missions</h1>
  <p class="entete-sous">Projets data et développement, du plus récent au plus ancien.</p>
  <div class="filtres" role="group" aria-label="Filtrer par type">
    <button class="filtre" data-filtre="tout" aria-pressed="true">Tout <span class="mono">${projets.length}</span></button>
    <button class="filtre" data-filtre="data" aria-pressed="false">Data <span class="mono">${projets.filter((p) => p.type === "data").length}</span></button>
    <button class="filtre" data-filtre="web" aria-pressed="false">Web / Dev <span class="mono">${projets.filter((p) => p.type === "web").length}</span></button>
  </div>
</section>
<section class="bloc"><div class="grille" id="grille-projets">${projets.map(carte).join("")}</div></section>`;
  return page({ titre: "Missions", description: "Projets data et développement de " + site.nom, chemin: "/projets/", contenu });
}

// Graphiques supplémentaires : liste de { "src", "legende" }, affichés avec leur légende
const graphiques = (p) => (p.graphiques || [])
  .map((g) => `<figure class="visuel visuel-legende"><img src="${esc(g.src)}" alt="${esc(g.legende)}" loading="lazy"><figcaption>${esc(g.legende)}</figcaption></figure>`)
  .join("");

function ficheData(p) {
  const lettre = (n) => "ABCDE"[n];
  const blocs = [
    ["La question", `<p class="question">${esc(p.question)}</p>`],
    ["Les données", `<p>${esc(p.donnees)}</p>`],
    ["La méthode", `<p>${esc(p.methode)}</p>`],
    ...(p.graphiques?.length ? [["En graphiques", graphiques(p)]] : []),
    ["Ce que j'en retiens", `<p>${esc(p.conclusion)}</p>`],
  ];
  return `
  ${p.resultats?.length ? `<div class="chiffres">${p.resultats.map((r) => `<div class="chiffre"><strong>${esc(r.valeur)}</strong><span>${esc(r.libelle)}</span></div>`).join("")}</div>` : ""}
  ${p.image ? `<figure class="visuel"><img src="${esc(p.image)}" alt="Résultat du projet ${esc(p.titre)}" loading="lazy"></figure>` : ""}
  ${blocs.map(([titre, corps], i) => section(titre, corps, lettre(i))).join("\n  ")}`;
}

function ficheWeb(p) {
  return `
  ${p.image ? `<figure class="visuel"><img src="${esc(p.image)}" alt="Capture d'écran de ${esc(p.titre)}" loading="lazy"></figure>` : ""}
  ${section("Le contexte", `<p>${esc(p.contexte)}</p>`, "A")}
  ${section("Ce que j'ai fait", `<ul class="liste">${(p.contributions || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`, "B")}
  ${section("La difficulté", `<p>${esc(p.difficulte)}</p>`, "C")}
  ${p.graphiques?.length ? section("En images", graphiques(p), "D") : ""}`;
}

function fiche(p, i) {
  const suivant = projets[(i + 1) % projets.length];
  const contenu = `
<article class="fiche">
  <header class="bloc entete-page">
    <a class="lien-fleche retour" href="/projets/">← Toutes les missions</a>
    <p class="mono bloc-etiquette"><span class="pastille pastille-${p.type}">${p.type === "data" ? "Data" : "Web / Dev"}</span> ${code(p, i)} · ${dateFr(p.date)}</p>
    <h1>${esc(p.titre)}</h1>
    ${p.exemple ? '<p class="avertissement">Projet d\'exemple — à remplacer par un vrai projet.</p>' : ""}
    <p class="entete-sous">${esc(p.resume)}</p>
    <dl class="meta">
      <div><dt class="mono">Rôle</dt><dd>${esc(p.role)}</dd></div>
      <div><dt class="mono">Stack</dt><dd><ul class="etiquettes">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></dd></div>
    </dl>
    <div class="actions">
      ${ext(p.liens?.demo, "Voir en ligne")}
      ${ext(p.liens?.depot, "Code source")}
      ${ext(p.liens?.notebook, "Notebook")}
    </div>
  </header>
  ${p.type === "data" ? ficheData(p) : ficheWeb(p)}
  <nav class="bloc suite" aria-label="Mission suivante">
    <span class="mono">Mission suivante</span>
    <a href="/projets/${esc(suivant.slug)}/">${esc(suivant.titre)} →</a>
  </nav>
</article>`;
  return page({ titre: p.titre, description: p.resume, chemin: `/projets/${p.slug}/`, contenu });
}

function introuvable() {
  const contenu = `
<section class="bloc entete-page perdu">
  <p class="mono bloc-etiquette">Erreur 404 · signal perdu</p>
  <h1>Cette page s'est perdue dans le vide spatial.</h1>
  <p class="entete-sous">Le lien est peut-être ancien, ou la page n'existe plus.</p>
  <div class="actions"><a class="btn" href="/">Retour à la base</a><a class="btn btn-ghost" href="/projets/">Voir les missions</a></div>
</section>`;
  return page({ titre: "Page introuvable", chemin: "/404.html", contenu });
}

// ---------- écriture ----------
export default function construire(DIST) {
  const ecrire = (rel, html) => {
    const f = join(DIST, rel);
    mkdirSync(join(f, ".."), { recursive: true });
    writeFileSync(f, html);
  };

  ecrire("index.html", accueil());
  ecrire("projets/index.html", listeProjets());
  projets.forEach((p, i) => ecrire(`projets/${p.slug}/index.html`, fiche(p, i)));
  ecrire("404.html", introuvable());
  cpSync(join(ROOT, "assets"), join(DIST, "assets"), { recursive: true });
  cpSync(join(ROOT, "public"), DIST, { recursive: true });

  // sitemap
  const urls = ["/", "/projets/", ...projets.map((p) => `/projets/${p.slug}/`)];
  writeFileSync(join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join("\n")}\n</urlset>\n`);

  const avertissements = [];
  const restants = projets.filter((p) => p.exemple).length;
  if (restants) avertissements.push(`${restants} projet(s) d'exemple encore présent(s) dans content/projets/`);
  for (const o of [site, ...projets].filter((o) => JSON.stringify(o).includes("[À "))) {
    avertissements.push(`texte à remplacer dans : ${o.titre}`);
  }
  return { pages: urls.length + 1, avertissements };
}
