// Site de Maitane (maitane.sometgarcia.fr) : lit content/, écrit dans le dossier reçu.
// Le site est en anglais, comme l'ancien WordPress. Appelé par le build.mjs de la racine du dépôt.
import { readdirSync, writeFileSync, cpSync } from "node:fs";
import { join } from "node:path";
import { esc, lireJson, ecrivain, sitemap, dimensions, masquer } from "../../commun/outils.mjs";
import { lireApparence, urlPolices, famillesChoisies, estClaire } from "../../commun/theme.mjs";

const ROOT = new URL(".", import.meta.url).pathname;
const site = lireJson(join(ROOT, "content/site.json"));
// polices et couleurs choisies dans l'admin (section « Apparence »)
const apparence = lireApparence(join(ROOT, "content/apparence.json"));

// Collections triées de la plus récente à la plus ancienne
const collections = readdirSync(join(ROOT, "content/collections"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => lireJson(join(ROOT, "content/collections", f)))
  .sort((a, b) => b.annee - a.annee);

for (const c of collections) {
  if (!c.slug || !c.titre || !c.couverture) throw new Error(`Collection invalide (slug, titre ou couverture manquant) : ${c.titre}`);
  c.blocs ??= [];
}

// ---------- images ----------
// <img> avec ses dimensions réelles, lues dans public/
function image(src, alt, { classe = "", charge = "lazy", tailles = "" } = {}) {
  const { l, h } = dimensions(join(ROOT, "public", src));
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${l}" height="${h}"${classe ? ` class="${classe}"` : ""} loading="${charge}" decoding="async"${tailles ? ` sizes="${tailles}"` : ""}>`;
}

const ICONES = {
  instagram: "M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z",
  mail: "M19,5H5c-1.1,0-2,.9-2,2v10c0,1.1.9,2,2,2h14c1.1,0,2-.9,2-2V7c0-1.1-.9-2-2-2zm.5,12c0,.3-.2.5-.5.5H5c-.3,0-.5-.2-.5-.5V9.8l7.5,5.6,7.5-5.6V17zm0-9.1L12,13.6,4.5,7.9V7c0-.3.2-.5.5-.5h14c.3,0,.5.2.5.5v.9z",
  linkedin: "M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z",
};
const icone = (nom) => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="${ICONES[nom]}"/></svg>`;

// ---------- blocs d'une collection ----------
// Chaque bloc a un type et ses propres champs. Les textes sont découpés en paragraphes sur les lignes vides.
const paragraphes = (texte = "") => texte.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
const legende = (t) => (t ? `<figcaption>${esc(t)}</figcaption>` : "");

const BLOCS = {
  texte: (b) => `<div class="bloc bloc-texte">${b.titre ? `<h2>${esc(b.titre)}</h2>` : ""}${paragraphes(b.texte).map((p) => `<p>${esc(p)}</p>`).join("")}</div>`,
  image: (b, c) => `<figure class="bloc bloc-image bloc-image-${b.format === "moyen" ? "moyen" : "large"}">${image(b.src, b.legende || c.titre, { tailles: "(min-width: 1200px) 1200px, 100vw" })}${legende(b.legende)}</figure>`,
  duo: (b, c) => `<figure class="bloc bloc-duo"><div>${(b.images || []).slice(0, 2).map((src) => image(src, b.legende || c.titre, { tailles: "(min-width: 900px) 50vw, 100vw" })).join("")}</div>${legende(b.legende)}</figure>`,
  galerie: (b, c) => `<div class="bloc galerie">${(b.images || []).map((src, i) => `<figure>${image(src, `${c.titre}, photo ${i + 1}`, { tailles: "(min-width: 900px) 50vw, 100vw" })}</figure>`).join("")}</div>`,
  citation: (b) => `<blockquote class="bloc bloc-citation"><p>${esc(b.texte)}</p>${b.auteur ? `<cite>${esc(b.auteur)}</cite>` : ""}</blockquote>`,
};

function bloc(b, c) {
  const rendu = BLOCS[b.type];
  if (!rendu) throw new Error(`Bloc inconnu « ${b.type} » dans la collection ${c.titre} (types possibles : ${Object.keys(BLOCS).join(", ")})`);
  return rendu(b, c);
}

// ---------- gabarit commun ----------
function page({ titre, description, chemin, contenu, corpsClasse = "" }) {
  const full = titre ? `${titre} — ${site.nom}` : `${site.nom} — ${site.metier}`;
  const c = site.contact;
  const reseau = (href, nom, label) =>
    href ? `<li><a class="reseau" href="${href}"${href.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'} aria-label="${label}">${icone(nom)}</a></li>` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description || site.description)}">
<link rel="canonical" href="${site.url}${chemin}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${site.url}${chemin}">
<meta property="og:image" content="${site.url}${esc(collections[0]?.couverture || site.apropos.photo)}">
<meta name="theme-color" content="${esc(apparence.couleurs.fond)}">
<link rel="icon" href="${esc(site.logo)}" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(urlPolices(famillesChoisies(apparence.polices)))}" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<link rel="stylesheet" href="/assets/theme.css">
</head>
<body class="${corpsClasse}">
<a class="sauter" href="#contenu">Skip to content</a>
<header class="entete">
  <a class="marque" href="/">
    <img class="marque-logo" src="${esc(site.logo)}" alt="" width="48" height="48">
    <span class="marque-nom">${esc(site.nom)}</span>
  </a>
  <nav aria-label="Main">
    <a href="/#collections">Collections</a>
    <a href="/#about">About</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main id="contenu">
${contenu}
</main>
<footer class="pied" id="contact">
  <h2>Contact</h2>
  <div class="pied-colonnes">
    <div class="pied-identite">
      <img src="${esc(site.logo)}" alt="${esc(site.nom)}" width="96" height="96" loading="lazy">
      ${c.telephone ? `<a class="pied-tel" href="tel:${esc(c.telephone.replace(/\s/g, ""))}">${esc(c.telephone)}</a>` : ""}
    </div>
    <div>
      <p class="pied-label">Contact me</p>
      <ul class="reseaux">
        ${reseau(c.instagram && esc(c.instagram), "instagram", "Instagram")}
        ${reseau(c.email && `mailto:${masquer(c.email)}`, "mail", "Email")}
        ${reseau(c.linkedin && esc(c.linkedin), "linkedin", "LinkedIn")}
      </ul>
    </div>
  </div>
  <div class="pied-bas">
    <span>© ${new Date().getFullYear()} ${esc(site.nom)}</span>
    <a href="https://sometgarcia.fr">sometgarcia.fr</a>
  </div>
</footer>
<script src="/assets/main.js" defer></script>
</body>
</html>`;
}

// ---------- pages ----------
function accueil() {
  const liste = collections.map((c, i) => {
    const visuel = image(c.couverture, `${c.titre}, ${c.annee}`, { charge: i === 0 ? "eager" : "lazy", tailles: "(min-width: 900px) 70vw, 100vw" });
    const legende = `<figcaption><span class="collection-titre">${esc(c.titre)}</span><span class="collection-annee">${esc(c.annee)}</span></figcaption>`;
    return `<li><figure class="collection apparait"><a href="/collections/${esc(c.slug)}/">${visuel}${legende}</a></figure></li>`;
  }).join("");

  const contenu = `
<section class="accroche">
  <h1>${site.accroche.map(esc).join("<br>")}</h1>
</section>

<section class="collections" id="collections" aria-label="Collections">
  <ol>${liste}</ol>
</section>

<section class="apropos apparait" id="about" aria-labelledby="t-about">
  ${image(site.apropos.photo, `Portrait of ${site.nom}`, { tailles: "(min-width: 900px) 35vw, 100vw" })}
  <div>
    <h2 id="t-about">About</h2>
    ${paragraphes(site.apropos.texte).map((t) => `<p>${esc(t)}</p>`).join("")}
  </div>
</section>`;
  return page({ chemin: "/", contenu, corpsClasse: "page-accueil" });
}

function ficheCollection(c, i) {
  const suivante = collections[(i + 1) % collections.length];
  const premierTexte = c.blocs.find((b) => b.type === "texte");
  const contenu = `
<article class="fiche">
  <header class="fiche-entete">
    <a class="retour" href="/#collections">← All collections</a>
    <p class="fiche-annee">${esc(c.annee)}</p>
    <h1>${esc(c.titre)}</h1>
  </header>
  <figure class="fiche-couverture">${image(c.couverture, `${c.titre}, ${c.annee}`, { charge: "eager", tailles: "(min-width: 1200px) 1200px, 100vw" })}</figure>
  ${c.blocs.map((b) => bloc(b, c)).join("\n  ")}
  ${suivante !== c ? `<nav class="suite" aria-label="Next collection"><span>Next collection</span><a href="/collections/${esc(suivante.slug)}/">${esc(suivante.titre)} →</a></nav>` : ""}
</article>`;
  const description = premierTexte ? paragraphes(premierTexte.texte)[0] : `${c.titre}, a collection by ${site.nom} (${c.annee}).`;
  return page({ titre: c.titre, description, chemin: `/collections/${c.slug}/`, contenu });
}

function introuvable() {
  const contenu = `
<section class="accroche perdu">
  <h1>Page not found</h1>
  <p>This page does not exist, or no longer does.</p>
  <a class="retour" href="/">← Back to the homepage</a>
</section>`;
  return page({ titre: "Page not found", chemin: "/404.html", contenu });
}

// ---------- thème ----------
// Variables CSS de assets/style.css remplacées par les choix de l'admin
const ESPACEMENTS = { serre: "0.02em", normal: "0.1em", large: "clamp(0.15rem, 1.1vw, 1rem)" };

function themeCss() {
  const { polices: p, couleurs: c, accroche: a } = apparence;
  return `/* Généré à partir de content/apparence.json : modifiable dans l'admin, section « Apparence » */
:root {
  --fond: ${c.fond};
  --fond-clair: ${c.fond_secondaire};
  --trait: ${c.fond_secondaire};
  --texte: ${c.titres};
  --texte-doux: ${c.texte};
  --texte-leger: ${c.texte_discret};
  --accent: ${c.accent};
  --titre: "${p.titres}", Georgia, serif;
  --corps: "${p.texte}", system-ui, sans-serif;
  --signature: "${p.signature}", cursive;
  color-scheme: ${estClaire(c.fond) ? "light" : "dark"};
}
html { font-size: ${Number(apparence.taille_texte) || 100}%; }
.accroche h1 {
  font-size: calc(clamp(2.1rem, 5vw, 4.5rem) * ${(Number(a.taille) || 100) / 100});
  text-transform: ${a.majuscules ? "uppercase" : "none"};
  letter-spacing: ${ESPACEMENTS[a.espacement] || ESPACEMENTS.large};
}
`;
}

// ---------- écriture ----------
export default function construire(DIST) {
  const ecrire = ecrivain(DIST);

  ecrire("index.html", accueil());
  collections.forEach((c, i) => ecrire(`collections/${c.slug}/index.html`, ficheCollection(c, i)));
  ecrire("404.html", introuvable());
  cpSync(join(ROOT, "assets"), join(DIST, "assets"), { recursive: true });
  writeFileSync(join(DIST, "assets/theme.css"), themeCss());
  cpSync(join(ROOT, "public"), DIST, { recursive: true });

  const chemins = ["/", ...collections.map((c) => `/collections/${c.slug}/`)];
  writeFileSync(join(DIST, "sitemap.xml"), sitemap(site.url, chemins));

  const avertissements = collections.filter((c) => c.blocs.length === 0)
    .map((c) => `« ${c.titre} » n'a encore aucun bloc : sa page ne montre que la couverture`);
  return { pages: chemins.length + 1, avertissements };
}
