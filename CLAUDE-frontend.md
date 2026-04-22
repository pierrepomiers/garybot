# NOTOX / GaryBot — Frontend (contexte Claude)

> Document de référence pour Claude (Code & Chat) sur le repo frontend.
> Pour le contexte projet complet, voir `CLAUDE.md` dans le repo `garybot-api`.

---

## Rôle de ce repo

Frontend statique de GaryBot, hébergé sur **GitHub Pages**.
UI mobile-first pour :
- Login Supabase (email + mot de passe)
- Board des commandes en cours (sync via backend Render → Odoo XML-RPC)
- Coches d'étapes par commande (13 étapes max : Shape → Déco → … → Finition → Post-cuisson → Facturation → Emballage → Livraison ; emballage rendu seulement si ligne SHIP présente, sinon 12 étapes)
- Envoi de messages clients pré-rédigés + photos via Odoo (chatter archivé)
- Envoi de mails fournisseurs (Viral, Atua, Ben, FCS, Surf System)
- Génération de PDF de commande
- Archivage + purge des commandes livrées

---

## Structure

```
garybot/
├── index.html              ← monolithe (UI + état + bindings + styles)
├── messages.js             ← templates texte brut des messages clients
├── supplier_templates.js   ← helpers templates mails fournisseurs (placeholders + defaults)
├── garybot_logo.png
└── build.sh                ← cache-busting : injecte timestamp dans messages.js?v=… et supplier_templates.js?v=…
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
- **Pas de routing** : `S.view` = `"orders" | "settings" | "supplier_carts" | "login"`.
- **Modals** : créés dynamiquement via `document.createElement` + `overlay.remove()`.
- **Cache-busting obligatoire** après modif de `messages.js` ou `supplier_templates.js` : `./build.sh` avant commit.

---

## Flow commandes fournisseurs (depuis 2026-04-21)

### Vue "Paniers fournisseurs" (onglet 📦 Paniers)

Accessible depuis le menu hamburger. `S.view === "supplier_carts"`. Affiche une carte par fournisseur actif :
- Compteur d'items en attente (badge)
- Indication de mode d'envoi (`"Envoi groupé — lundi 08:00"` si `mail_mode='hebdo'`, rien sinon) — purement informatif, **aucun auto-envoi**
- Liste des items éditables (libellé + qty, blur = save)
- Bouton "✕" par item pour retirer
- "📨 Envoyer le panier" → modal de preview HTML → POST `/supplier-cart/send`
- "Vider" → delete des items pending pour ce fournisseur

Un badge rouge avec le total d'items pending est affiché sur l'entrée "📦 Paniers" du menu.

### Modal "Préparer commande fournisseur"

Ouvert via le bouton 📦 à côté d'une étape fournisseur **cochée** (comme le bouton ✉️ client). `openSupplierCartModal(order, stepLabel, stepId, progress)`.

Construction des items pré-remplis (`buildInitialSupplierItems`) :
- Parcours `order.lines_detail` (retourné par `/orders`, contient `display_type` depuis 2026-04-21)
- `display_type === 'line_section'` → ignoré
- `display_type === 'line_note'` → concaténé dans le libellé du produit précédent (les produits NOTOX sont souvent génériques, la vraie spec est dans la note qui suit)
- Produit → item avec `label = product.name`, qty = `product_uom_qty`, `checked: true`
- Libellé reste éditable dans le modal

Actions :
- **🧺 Ajouter au panier** : `insert` dans `supplier_cart_items` (`sent_at = NULL`)
- **📨 Envoyer maintenant** : insert + envoi immédiat via `sendSupplierBatch()` (n'envoie que les items de cette action, pas tout le panier cumulé)

### Helpers supplier

- `supplierNameToKey(name)` : convertit le nom d'affichage STEPS (`"Surf System"`) en slug `fournisseurs.key` (`"surf_system"`). `STEPS` garde les noms d'affichage, **pas modifié**.
- `sendSupplierBatch(supplier, items)` : applique les placeholders du template (via `window.SUPPLIER_TEMPLATES.applyPlaceholders`), POST `/supplier-cart/send`, puis update `supplier_cart_items.sent_at/batch_id` + insert `supplier_messages_log`. **Atomicité** : si le backend KO → throw (aucune écriture Supabase). Si le mail est parti mais qu'une écriture Supabase échoue → toast WARNING explicite avec le `batch_id` (pas de throw — l'email ne peut pas être rollback). `loadSupplierCart()` est rejoué dans un `finally` pour refresh l'UI dans tous les cas. Retourne `{ out, batchId, warning }` ; les callers n'affichent le toast vert de succès que si `warning === null`.
- `loadSupplierCart()` : charge tous les items, partitionne en `S.supplierCartItems` (pending) et `S.supplierSentIndex` (Set de `"oid|stepId"` pour marquer le bouton 📦 avec un ✓).

### Tables Supabase touchées

- `fournisseurs` (existante, enrichie : `key`, `cc`, `template_*`, `active`, etc.)
- `supplier_cart_items` (nouvelle)
- `supplier_messages_log` (nouvelle)

---

## Structure STEPS (depuis 2026-04-22, "intégration Odoo douce")

Ordre final des 13 étapes dans `const STEPS` (`index.html:583`) :

1. `appro_blank` – Appro. Blank (fournisseur)
2. `cmd_preshape` – Cmd. Preshape (fournisseur)
3. `cmd_access` – Cmd. Access. (fournisseur)
4. `shape` – shape (client mail)
5. `deco` – déco (client mail)
6. `strat` – stratification (client mail)
7. `pose_plugs` – pose Plugs
8. `poncage` – ponçage (client mail)
9. `finition` – finition (client mail)
10. `post_cuisson` – post-cuisson (pure coche)
11. `facturation` – facturation (pure coche, voir pastille ci-dessous)
12. `emballage` – emballage (client mail, **conditionnel SHIP** — voir règle ci-dessous)
13. `livraison` – livraison (client mail, pastille "À VALIDER 📦", `isLivraison:true`)

### Règle SHIP (ligne `orderHasShipLine` dans `index.html`)

`emballage` n'est rendu **ni dans le board ni dans le dénominateur de `getProgress`** que si `order.lines_detail` contient au moins une ligne dont le libellé produit ou nom est exactement `"SHIP"` (trimmed). Sinon `getProgress` utilise 12 étapes comme dénominateur, pas 13. Même helper utilisé pour **initialiser le default de `delivery_type`** à la première sync d'une commande : SHIP → `"livraison"`, sinon `"retrait"` (le toggle manuel 🚚/📍 reste fonctionnel et prioritaire ensuite).

## Pastilles Odoo "douces" — facturation & livraison

Philosophie : GaryBot ne lit pas Odoo en temps réel mais **incite** le passage par Odoo avant de cocher ces deux étapes, sans bloquer le flow.

### Pastille "À FACTURER 💰" (étape `facturation`)

- Toujours rendue tant que `!meta.archived`. Lien : `${CONFIG.odooWebUrl}/web#id=${oid}&model=sale.order&view_type=form` (nouvel onglet).
- **Case facturation non cliquable manuellement** (handler `.step-check` early-return sur `stepId === "facturation"`). Seul le clic pastille coche.
- Au clic sur la pastille : ouvre Odoo + `toggleStep(oid, "facturation", false)` + `recordOdooPastilleClick(order, "facturation_click")`.
- Deux états CSS (`.mail-btn.to-invoice` / `.mail-btn.to-invoice.done`) : rouge pulsant avant coche, gris neutre avec date `· JJ/MM` après (timestamp lu dans `meta.emails_sent.facturation_click`). Reste cliquable à l'état grisé pour rouvrir Odoo sans re-cocher.

### Pastille "À VALIDER 📦" (étape `livraison`)

- Même pattern + même URL Odoo, clé timestamp `emails_sent.livraison_click`.
- **Universelle** : rendue sur toute commande non archivée dont l'étape livraison n'est pas encore validée — passage obligé par Odoo pour clôturer (WH/OUT marqué done côté Odoo = source de vérité), indépendamment de la présence d'une ligne SHIP. L'étape `emballage`, elle, reste conditionnée à SHIP (voir règle plus haut).
- **Case livraison semi-cliquable** : si la case n'est pas ✅, clic direct déclenche un `confirm("Tu es sûr ? Tu n'as pas validé la livraison côté Odoo.")`. Case déjà ✅ → décoche sans confirm (retour en arrière rapide).

### Stockage timestamps clic pastille

Clés **distinctes** dans le JSON `order_meta.emails_sent` : `facturation_click` et `livraison_click`. Ne PAS confondre avec les clés `facturation` / `livraison` qui traceraient un envoi mail client réel via `recordClientEmailSent` (`facturation` n'a de toute façon pas `clientMail:true`). Helper dédié : `recordOdooPastilleClick(order, key)` — **sémantique "date de validation initiale"** : seul le premier clic fixe la date, les clics suivants ré-ouvrent Odoo mais n'écrasent pas le timestamp.

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
