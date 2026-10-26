# julen.sometgarcia.fr

Site vitrine statique. Aucune dépendance : il suffit de Node 20+.

```bash
npm run build   # génère dist/
npm run dev     # génère puis sert sur http://localhost:4321
```

## Remplir le contenu

| Fichier | Ce qu'il contient |
|---|---|
| `content/site.json` | Nom, accroche, statut de recherche de stage, présentation, compétences, contacts |
| `content/projets/*.json` | Un fichier par projet |
| `public/cv.pdf` | Ton CV (à ajouter, le bouton « Télécharger le CV » pointe dessus) |
| `public/images/` | Captures et graphiques des projets (à créer), référencés par `"image": "/images/xxx.webp"` |

Tout ce qui contient `[À REMPLACER]` est à réécrire. Le build affiche un avertissement tant qu'il reste des projets marqués `"exemple": true` : supprime ces fichiers ou passe la clé à `false` une fois réécrits.

### Les deux modèles de projet

Champs communs : `slug` (l'URL), `type` (`"data"` ou `"web"`), `titre`, `resume`, `date` (`"AAAA-MM"`), `vedette` (affiché sur l'accueil), `stack`, `role`, `liens` (`depot`, `demo`, `notebook`, tous facultatifs), `image`.

- **`data`** : `question`, `donnees`, `methode`, `resultats` (liste de `{ "valeur", "libelle" }`, le premier s'affiche sur la carte), `conclusion`.
- **`web`** : `contexte`, `contributions` (liste), `difficulte`.

Copie un exemple du bon type pour démarrer un nouveau projet.

## Déploiement automatique vers OVH

À chaque `git push` sur `main`, GitHub génère le site et l'envoie par SFTP (`.github/workflows/deploy.yml`).

1. **Trouver le dossier du sous-domaine** : Espace client OVH → Hébergement → onglet *Multisite* → ligne `julen.sometgarcia.fr` → colonne *Dossier racine* (par exemple `julen`).
2. **Trouver les accès** : onglet *FTP-SSH* → serveur (`ftp.clusterXXX.hosting.ovh.net`), identifiant, et mot de passe (à redéfinir si tu ne l'as plus).
3. **Ajouter 4 secrets** dans le dépôt GitHub → *Settings* → *Secrets and variables* → *Actions* :
   - `OVH_HOTE` : le serveur FTP
   - `OVH_UTILISATEUR` : l'identifiant
   - `OVH_MOT_DE_PASSE` : le mot de passe
   - `OVH_DOSSIER` : le dossier racine du sous-domaine (ex. `julen`)

> ⚠️ Le déploiement **supprime** sur le serveur tout ce qui n'est pas dans `dist/`, à l'intérieur de `OVH_DOSSIER`. Si ce dossier était la racine de l'hébergement, il effacerait le WordPress de Maitane. Le workflow refuse les valeurs vides, `/` et `www`, mais vérifie quand même deux fois le dossier dans l'onglet Multisite avant le premier push. Garde aussi une sauvegarde du WordPress.

Le fichier `public/.htaccess` désactive le listing de répertoire, force le HTTPS, ajoute des en-têtes de sécurité et sert la page 404 personnalisée.
