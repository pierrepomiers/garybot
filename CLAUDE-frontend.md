# NOTOX / GaryBot — Frontend (contexte Claude)

> Document de référence pour Claude (Code & Chat) sur le repo frontend.
> Pour le contexte projet complet, voir `CLAUDE.md` dans le repo `garybot-api`.

---

## Rôle de ce repo

Frontend statique de GaryBot, hébergé sur **GitHub Pages**.
UI mobile-first pour :
- Login Supabase (email + mot de passe)
- Board des commandes en cours (sync via backend Render → Odoo XML-RPC)
- Coches d'étapes par commande (11 étapes : Shape → Déco → … → Livraison)
- Envoi de messages clients pré-rédigés + photos via Odoo (chatter archivé)
- Envoi de mails fournisseurs (Viral, Atua, Ben, FCS, Surf System)
- Génération de PDF de commande
- Archivage + purge des commandes livrées

---

## Structure

```
garybot/
├── index.html       ← monolithe 1345 lignes (UI + état + bindings + styles)
├── messages.js      ← templates texte brut des messages clients
├── garybot_logo.png
└── build.sh         ← cache-busting : injecte timestamp dans <script src="messages.js?v=...">
```

**Pas de framework, pas de bundler.** Vanilla JS, Supabase et fonts chargés via CDN.

---

## Config

Dans `index.html` ligne ~387 :

```javascript
const CONFIG = {
  supabaseUrl:  "https://omaszhtehrhpfwxqypxw.supabase.co",
  supabaseKey:  "eyJhbGc...",              // anon public
  backendUrl:   "https://garybot-api.onrender.com",
  apiSecret:    "notox2026",               // doit matcher API_SECRET sur Render
  odooWebUrl:   "https://notoxsurf.odoo.com",
};
```

Toute requête vers le backend passe par `fetch(CONFIG.backendUrl + "/...", { headers: { "x-api-secret": CONFIG.apiSecret }})`.

---

## Conventions

- **State global** : objet `S` mutable, ré-rendu complet via `render()`.
- **Templates** : template strings JavaScript (pas de JSX, pas de templating lib).
- **Supabase client** : chargé via CDN, instancié dans `sb`.
- **Pas de routing** : `S.view` = `"orders" | "settings" | "login"`.
- **Modals** : créés dynamiquement via `document.createElement` + `overlay.remove()`.
- **Cache-busting obligatoire** après modif de `messages.js` : `./build.sh` avant commit.

---

## Flow envoi message client

1. User coche une étape avec `clientMail:true` (défini dans `STEPS`, ligne ~402)
2. `openClientMessageModal(order, stepLabel, stepId, progress)` → modal
3. Sujet + body pré-remplis depuis `MESSAGES[stepId] || MESSAGES.default`
4. User peut ajouter ≤ 4 photos (redim 1280px max via `resizeImageToBase64`)
5. `POST ${backendUrl}/orders/${order.id}/message` avec payload :
   ```json
   {
     "subject": "...",
     "body": "texte brut avec \\n",
     "partner_id": 123,
     "attachments": [{"name": "photo.jpg", "data": "base64..."}]
   }
   ```
6. Backend fait le reste (voir `garybot-api/main.py`).

---

## Points d'attention pour Claude

1. **Un seul fichier à éditer** pour la logique : `index.html`. Monolithe assumé.
2. **Toujours lancer `./build.sh`** après modif de `messages.js` (sinon cache navigateur).
3. **Attention aux imports dans messages.js** : bug historique documenté dans `index.html` ligne ~736 — `const MESSAGES` dans un `<script src>` externe n'est pas attaché au `window` par défaut. Le workaround est en place, ne pas le casser.
4. **Aucune donnée sensible côté front** : la `supabaseKey` est anon public (OK), l'`apiSecret` est connu côté serveur Render. Les données vraiment sensibles passent par Supabase RLS et le backend.
5. **Tester sur mobile** : l'UI est pensée mobile-first, certains comportements (overlay, scroll lock) sont sensibles à iOS Safari.

---

## Roadmap frontend

- [ ] Sync auto après X minutes (actuellement manuel via bouton ⟳)
- [ ] Améliorer l'éditeur de message (preview HTML avant envoi)
- [ ] Mode sombre / clair (actuellement dark forcé)
- [ ] Notifications push (PWA ?)
