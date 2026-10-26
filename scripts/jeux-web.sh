#!/usr/bin/env bash
# Compile les deux jeux du projet ZZ1 en WebAssembly et les publie dans
# dist/julen/jeux/quantik/ et dist/julen/jeux/catane/, après node build.mjs.
# Usage : bash scripts/jeux-web.sh [dossier local de projet-zz1]
# Sans dossier, le dépôt est cloné depuis GitHub. emcc (Emscripten) doit être installé.
set -euo pipefail

SOURCE="${1:-}"
if [ -z "$SOURCE" ]; then
  SOURCE="$(mktemp -d)"
  git clone --quiet --depth 1 https://github.com/happyfury006/projet-zz1.git "$SOURCE"
fi

publier() {  # dossier du jeu dans projet-zz1, nom dans l'adresse
  make -C "$SOURCE/$1" web
  local cible="dist/julen/jeux/$2"
  rm -rf "$cible"
  mkdir -p "$cible"
  cp -R "$SOURCE/$1/build-web/." "$cible/"
  # WebAssembly a besoin de 'wasm-unsafe-eval' : autorisé seulement dans ces dossiers
  cp commun/jeux.htaccess "$cible/.htaccess"
  echo "✓ $2 : $(du -sh "$cible" | cut -f1) dans $cible"
}

publier jeu1 quantik
publier jeu2 catane
