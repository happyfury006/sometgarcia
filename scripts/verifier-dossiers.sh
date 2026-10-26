#!/usr/bin/env bash
# Garde-fou du déploiement : le miroir lftp supprime les fichiers distants absents de dist/<site>/.
# Refuse un dossier à la racine de l'hébergement, ou un dossier qui en contient un autre
# (déployer le premier effacerait le second). Lit RACINE, JULEN et MAITANE dans l'environnement.
set -u

normaliser() { local d="${1#./}"; d="${d#/}"; d="${d%/}"; [ -z "$d" ] && [ -n "$1" ] && d="."; echo "$d"; }

SITES="racine julen maitane"
racine=$(normaliser "${RACINE:-}")
julen=$(normaliser "${JULEN:-}")
maitane=$(normaliser "${MAITANE:-}")

actifs=0
for site in $SITES; do
  d="${!site}"
  if [ -z "$d" ]; then echo "$site : pas de dossier, ignoré"; continue; fi
  if [ "$d" = "." ] || [ "$d" = ".." ]; then
    echo "::error::$site : le dossier '$d' est la racine de l'hébergement, refusé."; exit 1
  fi
  for autre in $SITES; do
    a="${!autre}"
    if [ "$autre" = "$site" ] || [ -z "$a" ]; then continue; fi
    case "$a/" in
      "$d/"*) echo "::error::$autre ($a) est dans le dossier de $site ($d) : le déploiement l'effacerait."; exit 1 ;;
    esac
  done
  actifs=$((actifs + 1))
  echo "$site → $d"
done

if [ "$actifs" -eq 0 ]; then echo "::error::Aucun secret OVH_DOSSIER_* renseigné : rien à déployer."; exit 1; fi
