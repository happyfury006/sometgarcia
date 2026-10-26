#!/usr/bin/env bash
# Publie la boutique PHP (github.com/happyfury006/projetwebzz2) en démonstration
# dans dist/julen/demos/boutique-jeux-video/, après node build.mjs.
# Les identifiants de la base MySQL viennent de variables d'environnement (secrets
# GitHub) et sont écrits dans lib/config.php sur le serveur, jamais dans un dépôt.
# Sans DEMO_DB_BASE, la démo n'est pas publiée.
# Usage : DEMO_DB_HOTE=... DEMO_DB_UTILISATEUR=... DEMO_DB_MOT_DE_PASSE=... DEMO_DB_BASE=... \
#         bash scripts/demo-php.sh [dossier local de projetwebzz2]
set -euo pipefail

case "${DEMO_DB_PORT:-3306}" in
  ''|*[!0-9]*) echo "DEMO_DB_PORT doit être un nombre" >&2; exit 1 ;;
esac

if [ -z "${DEMO_DB_BASE:-}" ]; then
  echo "Boutique PHP : pas de base de données configurée, démo non publiée"
  exit 0
fi

SOURCE="${1:-}"
if [ -z "$SOURCE" ]; then
  SOURCE="$(mktemp -d)"
  git clone --quiet --depth 1 https://github.com/happyfury006/projetwebzz2.git "$SOURCE"
fi

CIBLE="dist/julen/demos/boutique-jeux-video"
rm -rf "$CIBLE"
mkdir -p "$CIBLE"
# le code et les images, sans l'historique git, le README ni le dump SQL
tar -C "$SOURCE" --exclude=.git --exclude=.gitignore --exclude=README.md --exclude='lib/*.sql' --exclude='lib/config*.php' -cf - . | tar -C "$CIBLE" -xf -
cp commun/demo-php.htaccess "$CIBLE/.htaccess"

# Chaîne PHP entre apostrophes : on échappe les \ et les '
php_chaine() { printf "'%s'" "$(printf '%s' "$1" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")"; }
cat > "$CIBLE/lib/config.php" <<PHP
<?php
// Écrit par le déploiement à partir des secrets GitHub DEMO_DB_*
define('DB_HOTE', $(php_chaine "${DEMO_DB_HOTE:-localhost}"));
define('DB_UTILISATEUR', $(php_chaine "${DEMO_DB_UTILISATEUR:-}"));
define('DB_MOT_DE_PASSE', $(php_chaine "${DEMO_DB_MOT_DE_PASSE:-}"));
define('DB_BASE', $(php_chaine "$DEMO_DB_BASE"));
define('DB_PORT', ${DEMO_DB_PORT:-3306});
PHP
# Droits lisibles par le serveur web : le dossier temporaire du clone (mktemp -d,
# droits 700) transmettait ses droits au dossier publié, et Apache répondait 403
chmod -R u=rwX,go=rX "$CIBLE"
echo "✓ boutique PHP publiée dans $CIBLE"
