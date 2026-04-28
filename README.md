# garybot

## Mise à jour des prix

Les prix du calculateur de devis sont stockés dans `prices.csv` (séparateur `;`, éditable Excel/Sheets).

Workflow pour modifier les prix :

1. Modifier `prices.csv` (Excel, Numbers, ou éditeur de texte)
2. Lancer le script de sync :
   ```bash
   ./update-prices.sh
   ```
3. Le script affiche le diff, demande confirmation, puis commit + push
4. Attendre 1-2 min le déploiement GitHub Pages
5. Hard reload de l'app (`Cmd+Shift+R`) pour voir les nouveaux prix

⚠️ **Ne jamais oublier** : modifier `prices.csv` localement n'a aucun effet sur l'app tant que ce script n'a pas été lancé.
