#!/usr/bin/env bash
# update-prices.sh — sync prices.csv vers GitHub Pages
#
# Usage : ./update-prices.sh
# Lance après avoir modifié prices.csv localement.

set -e

# Couleurs
R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m'

# 1. Sanity checks
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${R}✗ Pas dans un repo Git${N}"
  exit 1
fi

if [ ! -f "prices.csv" ]; then
  echo -e "${R}✗ prices.csv introuvable à la racine du repo${N}"
  exit 1
fi

# 2. Y a-t-il des modifs ?
if git diff --quiet prices.csv && git diff --cached --quiet prices.csv; then
  echo -e "${Y}ℹ Aucun changement sur prices.csv. Rien à pousser.${N}"
  exit 0
fi

# 3. Afficher le diff
echo -e "${B}── Modifications détectées sur prices.csv ──${N}"
git diff --color=always prices.csv | head -60
echo ""

# 4. Confirmation
read -p "Pousser ces modifs sur GitHub ? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${Y}✗ Annulé. Aucune modification poussée.${N}"
  exit 0
fi

# 5. Commit + push
DATE=$(date +"%Y-%m-%d %H:%M")
git add prices.csv
git commit -m "data(prices): update prices.csv ($DATE)"

echo -e "${B}── Push vers origin/main ──${N}"
git push origin main

# 6. Récupérer l'owner pour afficher l'URL
REPO_URL=$(git remote get-url origin)
OWNER=$(echo "$REPO_URL" | sed -E 's|.*[:/]([^/]+)/garybot.*|\1|')

echo ""
echo -e "${G}✓ Push réussi !${N}"
echo ""
echo "Vérifications :"
echo "  • Code sur GitHub : https://github.com/$OWNER/garybot/blob/main/prices.csv"
echo "  • Déployé sur GitHub Pages (~1-2 min) : https://$OWNER.github.io/garybot/prices.csv"
echo "  • App : https://$OWNER.github.io/garybot/ (hard reload : Cmd+Shift+R)"
