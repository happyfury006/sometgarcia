# sometgarcia.fr

Les sites du domaine `sometgarcia.fr`, générés en HTML statique. Aucune dépendance : il suffit de Node 20+.

| Site | Adresse | Dossier |
|---|---|---|
| Accueil familial | https://sometgarcia.fr | `sites/racine/` |
| Portfolio de Julen | https://julen.sometgarcia.fr | `sites/julen/` |
| Site de Maitane | https://maitane.sometgarcia.fr | `sites/maitane/` |

```bash
npm run build   # génère dist/racine/, dist/julen/ et dist/maitane/
npm run dev     # génère puis sert chaque site sur son port :
                #   racine  http://localhost:4321
                #   julen   http://localhost:4322
                #   maitane http://localhost:4323
```

Chaque site a la même structure : `build.mjs` (le générateur), `content/` (les textes en JSON), `assets/` (CSS et JS) et `public/` (images, PDF, robots.txt, copiés tels quels). Le dossier `commun/` contient les utilitaires partagés et le `.htaccess` copié dans chaque site (HTTPS, en-têtes de sécurité, page 404).

## Portfolio de Julen

| Fichier | Ce qu'il contient |
|---|---|
| `content/site.json` | Nom, accroche, statut de recherche de stage, présentation, compétences, contacts |
| `content/projets/*.json` | Un fichier par projet |
| `public/cv.pdf` | Le CV (bouton « Télécharger le CV ») |
| `public/images/` | Captures et graphiques des projets, référencés par `"image": "/images/xxx.png"` |

Tout ce qui contient `[À REMPLACER]` est à réécrire : le build le signale.

Champs communs d'un projet : `slug` (l'URL), `type` (`"data"` ou `"web"`), `titre`, `resume`, `date` (`"AAAA-MM"`), `vedette` (affiché sur l'accueil), `stack`, `role`, `liens` (`depot`, `demo`, `notebook`, tous facultatifs), `image`.

- **`data`** : `question`, `donnees`, `methode`, `resultats` (liste de `{ "valeur", "libelle" }`, le premier s'affiche sur la carte), `conclusion`.
- **`web`** : `contexte`, `contributions` (liste), `difficulte`.

## Site de Maitane

Le site est en anglais. Son design reprend celui de l'ancien WordPress (thème Ona Fashion) : fond noir, Cormorant Garamond pour les titres, Nunito Sans pour le texte, accent taupe `#a88b70`.

| Fichier | Ce qu'il contient |
|---|---|
| `content/site.json` | Nom, métier, accroche, texte et photo « About », contacts (téléphone, email, Instagram, LinkedIn) |
| `content/collections/<slug>.json` | Une collection par fichier, triées de la plus récente à la plus ancienne |
| `public/images/` | Logo, portrait et photos des collections (PNG, WebP ou JPEG) |
| `public/admin/` | L'admin (Sveltia CMS) : `config.yml` décrit les champs modifiables |

Chaque collection a sa page `/collections/<slug>/` : titre, année, couverture, puis ses **blocs** dans l'ordre.

```json
{
  "slug": "racines-eternelles",
  "titre": "Racines Éternelles",
  "annee": 2024,
  "couverture": "/images/racines-eternelles.webp",
  "blocs": [
    { "type": "texte", "titre": "The idea", "texte": "Premier paragraphe.\n\nDeuxième paragraphe." },
    { "type": "image", "src": "/images/photo.webp", "legende": "Look 1", "format": "large" },
    { "type": "duo", "images": ["/images/a.webp", "/images/b.webp"], "legende": "Looks 2 et 3" },
    { "type": "galerie", "images": ["/images/c.webp", "/images/d.webp", "/images/e.webp"] },
    { "type": "citation", "texte": "Une phrase marquante.", "auteur": "Maitane" }
  ]
}
```

`format` d'une image : `large` (toute la largeur) ou `moyen` (centrée). Dans les textes, une ligne vide sépare deux paragraphes.

### L'admin : maitane.sometgarcia.fr/admin

Maitane modifie son site sans toucher au code : elle ajoute des collections, empile des blocs, les réordonne par glisser-déposer et envoie ses photos (converties automatiquement en WebP). **Publier** crée un commit sur `main`, ce qui redéploie le site en 1 à 2 minutes. Tout est historisé dans git : une erreur se corrige en revenant au commit précédent.

Pour lui donner accès :

1. Elle crée un compte sur https://github.com.
2. Tu l'ajoutes au dépôt : *Settings* → *Collaborators* → *Add people* (rôle Write).
3. Elle crée un jeton : https://github.com/settings/tokens/new → « Generate new token (classic) », coche **repo**, choisis une expiration, puis copie le jeton.
4. Sur `/admin`, elle clique sur **Se connecter avec un jeton d'accès** et colle le jeton. Il reste mémorisé dans son navigateur.

Le bouton « Se connecter avec GitHub » demande en plus un petit service d'authentification ([Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth), gratuit sur Cloudflare Workers) et l'option `base_url` dans `config.yml`.

Pour tester l'admin sans rien publier : dans Chrome ou Edge, ouvre `http://localhost:4323/admin/` (après `npm run dev`), clique sur **Travailler avec un dépôt local** et choisis ce dossier. Les modifications sont écrites directement dans les fichiers, sans commit.

## Déploiement automatique vers OVH

À chaque `git push` sur `main`, GitHub génère les sites et envoie chacun par SFTP dans son dossier OVH (`.github/workflows/deploy.yml`).

Secrets à créer dans le dépôt GitHub → *Settings* → *Secrets and variables* → *Actions* :

| Secret | Valeur | Où la trouver dans l'espace client OVH |
|---|---|---|
| `OVH_HOTE` | Serveur SFTP, ex. `ftp.clusterXXX.hosting.ovh.net` | Hébergement → *FTP-SSH* |
| `OVH_UTILISATEUR` | Identifiant FTP | Hébergement → *FTP-SSH* |
| `OVH_MOT_DE_PASSE` | Mot de passe FTP | Hébergement → *FTP-SSH* (à redéfinir si perdu) |
| `OVH_DOSSIER_RACINE` | Dossier de `sometgarcia.fr` | Hébergement → *Multisite* → colonne *Dossier racine* |
| `OVH_DOSSIER_JULEN` | Dossier de `julen.sometgarcia.fr` | idem |
| `OVH_DOSSIER_MAITANE` | Dossier de `maitane.sometgarcia.fr` | idem |

Un site dont le secret `OVH_DOSSIER_*` est absent n'est pas déployé : on peut les activer un par un.

> ⚠️ Le déploiement **supprime** sur le serveur tout ce qui n'est pas dans `dist/<site>/`, à l'intérieur du dossier du site. `scripts/verifier-dossiers.sh` refuse la racine de l'hébergement et un dossier qui en contient un autre (par exemple `www` pour l'accueil et `www/julen` pour le portfolio). **Avant d'activer `OVH_DOSSIER_MAITANE`, sauvegarde le WordPress actuel** (fichiers et base de données) : il sera effacé.
