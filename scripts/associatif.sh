#!/usr/bin/env bash
# Publie le site associatif (dossier associatif/ de github.com/happyfury006/site)
# dans dist/julen/associatif/, après node build.mjs.
# Usage : bash scripts/associatif.sh [dossier local du dépôt site]
set -euo pipefail

SOURCE="${1:-}"
if [ -z "$SOURCE" ]; then
  SOURCE="$(mktemp -d)"
  git clone --quiet --depth 1 https://github.com/happyfury006/site.git "$SOURCE"
fi

CIBLE="dist/julen/associatif"
rm -rf "$CIBLE"
mkdir -p "$CIBLE"
cp -R "$SOURCE/associatif/." "$CIBLE/"
rm -f "$CIBLE/README.md"
cp commun/associatif.htaccess "$CIBLE/.htaccess"
chmod -R u=rwX,go=rX "$CIBLE"  # lisible par le serveur web, quels que soient les droits d'origine
echo "✓ site associatif publié dans $CIBLE"
