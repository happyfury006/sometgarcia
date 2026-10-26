// Apparence modifiable depuis l'admin : polices et couleurs, lues dans un apparence.json.
// Le site interdit les styles écrits dans la page (Content-Security-Policy) : le
// thème est donc écrit dans un fichier CSS à part, chargé après la feuille principale.
import { join } from "node:path";
import { lireJson } from "./outils.mjs";

// Polices proposées dans l'admin, avec les graisses demandées à Google Fonts
export const POLICES = lireJson(join(new URL(".", import.meta.url).pathname, "polices.json"));

const COULEUR = /^#[0-9a-f]{6}$/i;

export function lireApparence(fichier) {
  const a = lireJson(fichier);
  for (const groupe of Object.keys(POLICES)) {
    const nom = a.polices?.[groupe];
    if (!(nom in POLICES[groupe])) {
      throw new Error(`Police inconnue pour « ${groupe} » : ${nom} (choix possibles dans commun/polices.json)`);
    }
  }
  for (const [nom, valeur] of Object.entries(a.couleurs || {})) {
    if (!COULEUR.test(valeur)) throw new Error(`Couleur invalide pour « ${nom} » : ${valeur} (format #RRGGBB attendu)`);
  }
  return a;
}

// Adresse Google Fonts pour une liste de [nom, graisses]. Une même police demandée
// deux fois ferait échouer la requête : on garde la demande la plus complète.
export function urlPolices(familles) {
  const parNom = new Map();
  for (const [nom, graisses] of familles) {
    if (!parNom.has(nom) || graisses.length > parNom.get(nom).length) parNom.set(nom, graisses);
  }
  const params = [...parNom].map(([nom, g]) => `family=${nom.replace(/ /g, "+")}${g ? ":" + g : ""}`);
  return `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap`;
}

// Les polices choisies, sous la forme attendue par urlPolices
export const famillesChoisies = (polices) =>
  Object.entries(polices).map(([groupe, nom]) => [nom, POLICES[groupe][nom]]);

// Une couleur de fond claire demande des contrôles de formulaire clairs (color-scheme)
export function estClaire(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
}
