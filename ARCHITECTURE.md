# ARCHITECTURE — Master Theme Shopify Hybride V1

## 1. Vue d'ensemble

Thème Shopify "reproductible" conçu pour être relivré sous différentes marques sans toucher au code. Le marchand rebrande entièrement la boutique via le **Theme Editor natif Shopify** (couleurs, typographie, mode d'affichage). Le développeur n'intervient plus en post-livraison.

Deux modes d'affichage coexistent dans le même thème :

| Mode | Usage | Template principal |
|------|-------|-------------------|
| `landing` | Mono-produit — campagnes TikTok/Meta | `hero-landing` + `product-main` |
| `catalogue` | Multi-produits — gamme de niche | `collection-grid` |

Le basculement s'effectue via `settings.shop_mode` dans le Theme Editor, sans déploiement.

---

## 2. Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Rendu | Shopify Liquid 2.x | Server-side natif, compatible Theme Editor et toutes les apps |
| Thème de base | Dawn 14+ (dégraissé) | Point de départ officiel Shopify, suppression ~70% des fichiers CSS inutiles |
| Réactivité JS | Alpine.js 3.x | 15 Ko gzip, déclaratif via attributs HTML, zéro VDOM |
| Plugin Alpine | `@alpinejs/intersect` | IntersectionObserver déclaratif pour le Sticky ATC |
| CSS | Tailwind CSS 3.x | PurgeCSS sur tous les fichiers `.liquid` → 8–15 Ko final |
| Build | Vite 5.x | HMR, tree-shaking, ES modules |
| Intégration Vite/Shopify | `vite-plugin-shopify` | Proxy vers Shopify CLI, génération `snippets/vite-tag.liquid` |
| CLI | Shopify CLI 3.x | `theme dev` (développement) + `theme push` (déploiement) |
| Hébergement | Shopify CDN | Inclus dans tous les plans, 0 € de coût infra |
| Versioning | Git + GitHub | — |

---

## 3. Pipeline de build

### Développement

Deux processus tournent en parallèle :

```
Terminal 1 : npm run dev
  → Vite démarre sur localhost:5173
  → vite-plugin-shopify génère snippets/vite-tag.liquid (mode dev, pointe vers localhost:5173)
  → HMR actif : toute modification de main.js / main.css / *.liquid recharge le navigateur

Terminal 2 : shopify theme dev --store <store>.myshopify.com --proxy http://localhost:5173
  → Shopify CLI proxie les assets via Vite
  → Le thème est prévisualisable sur l'URL de dev Shopify
```

`layout/theme.liquid` utilise `{% render 'vite-tag', with: 'main.js' %}`. Ce snippet unique gère les deux contextes : en dev il injecte le client HMR de Vite + l'URL localhost ; en prod il injecte les chemins hachés du CDN Shopify.

### Production

```
npm run build
  → Vite compile frontend/entrypoints/main.js + main.css
  → Tailwind purge : seules les classes présentes dans *.liquid sont conservées
  → Output : assets/main.js (~20–25 Ko gzip) + assets/main.css (~8–15 Ko gzip)
  → vite-plugin-shopify génère snippets/vite-tag.liquid (mode prod, chemins hachés)

shopify theme push
  → Déploie l'intégralité du dossier sur le CDN Shopify
```

### Fichiers source → output

```
frontend/entrypoints/main.js   →  assets/main.js    (Alpine + stores + composants)
frontend/entrypoints/main.css  →  assets/main.css   (Tailwind purgé)
```

---

## 4. Design System — Flux des tokens

Le design system repose sur un flux en trois étapes qui permet un rebranding complet sans toucher au code :

```
1. Theme Editor Shopify
   ↓  (settings_schema.json définit les contrôles visuels)

2. snippets/css-variables.liquid  [injecté dans <head>]
   → traduit les settings Liquid en CSS custom properties sur :root
   --color-accent: {{ settings.color_accent }};
   --font-heading: {{ settings.font_heading.family }}, ...;
   --border-radius: {{ settings.border_radius }}px;

3. tailwind.config.js
   → mappe ces custom properties aux utilitaires Tailwind
   colors.accent   = 'var(--color-accent)'
   maxWidth.page   = 'var(--page-width)'
   borderRadius.theme = 'var(--border-radius)'
```

Les fichiers `.liquid` utilisent exclusivement les classes Tailwind mappées (`bg-accent`, `text-text-light`, `max-w-page`, `rounded-theme`, etc.), jamais de valeurs en dur.

### Settings exposés dans le Theme Editor

| Groupe | Settings |
|--------|----------|
| Mode Boutique | `shop_mode` (landing / catalogue) |
| Couleurs | `color_background`, `color_background_secondary`, `color_text`, `color_text_light`, `color_accent`, `color_accent_hover`, `color_border` |
| Typographie | `font_heading` (font_picker), `font_body` (font_picker), `font_size_base` |
| Mise en page | `page_width` (1200/1400/1600px), `border_radius` (0–20px), `spacing_base` (8–24px) |
| Performance | `lazy_load_images` (bool), `enable_animations` (bool) |
| Favicon | `favicon` (image_picker) |

---

## 5. Architecture JavaScript

### Principe général

Tout le JavaScript est **déclaratif via attributs HTML**. Alpine.js lit les directives `x-data`, `x-show`, `x-bind`, `x-on` directement dans les fichiers `.liquid`, sans manipulation DOM manuelle.

Le fichier `frontend/entrypoints/main.js` est le **seul point d'entrée JS**. Il enregistre tous les stores et composants avant `Alpine.start()`.

### Stores globaux (état partagé entre composants)

#### `Alpine.store('cart')` — Panier

Unique source de vérité pour l'état du panier. Consommé par : drawer, header (badge), sticky ATC.

| Propriété / méthode | Type | Rôle |
|---------------------|------|------|
| `open` | bool | Ouvre/ferme le drawer |
| `items` | array | Lignes du panier (format Shopify AJAX) |
| `itemCount` | number | Nombre total d'articles |
| `total` | number | Total en centimes |
| `loading` | bool | Verrouille l'UI pendant les requêtes |
| `isEmpty` | getter | `items.length === 0` |
| `init()` | async | Appelé au chargement via `x-init` sur `<body>` |
| `fetch()` | async | `GET /cart.js` → met à jour le state |
| `add(variantId, qty, props)` | async | `POST /cart/add.js` → fetch → `open = true` |
| `update(key, qty)` | async | `POST /cart/change.js` → fetch |
| `remove(key)` | async | `update(key, 0)` |
| `formattedTotal()` | method | Formate via `Intl.NumberFormat` (devise active) |

#### `Alpine.store('ui')` — État UI global

| Propriété / méthode | Rôle |
|---------------------|------|
| `mobileMenuOpen` | Contrôle le menu hamburger |
| `searchOpen` | Contrôle un éventuel champ de recherche |
| `toggleMobileMenu()` | Toggle + `body.style.overflow` (scroll lock) |
| `closeMobileMenu()` | Ferme + libère le scroll |

### Composants Alpine (scope local)

#### `variantPicker(productJson)` — Page produit

Reçoit le JSON complet du produit via Liquid (`{{ product | json }}`). Gère la sélection de variantes et synchronise prix, disponibilité et image.

| Propriété | Rôle |
|-----------|------|
| `selectedOptions` | `{ "Couleur": "Noir", "Taille": "M" }` |
| `selectedVariant` | Objet variante Shopify correspondant |
| `quantity` | Quantité sélectionnée (1–99) |
| `price` | Prix formaté (Intl) |
| `comparePrice` | Prix barré formaté |
| `savingsPercent` | `Math.round(économies / prix_barré * 100)` |
| `available` | `selectedVariant.available` |

Méthodes clés :
- `selectOption(name, value)` → met à jour `selectedOptions` → `updateVariant()`
- `updateVariant()` → trouve la variante correspondante → dispatch `CustomEvent('variant:change')`
- `isOptionAvailable(name, value)` → vérifie si au moins une variante disponible correspond
- `addToCart()` → délègue à `Alpine.store('cart').add()`

#### `accordion()` — Accordéon réutilisable

Gère l'état `activeItem` (un seul item ouvert à la fois). Utilisé pour la FAQ, la description produit, etc.

#### `stickyAtc()` — Sticky Add to Cart (mobile uniquement)

Défini dans `sections/sticky-atc.liquid` (inline script). Observe via `IntersectionObserver` le bouton principal `#main-atc-btn`. Réagit aux `CustomEvent('variant:change')` pour rester synchronisé avec la sélection de variante.

### Communication entre composants

Les composants communiquent via **événements DOM natifs**, pas par couplage direct :

```
variantPicker.updateVariant()
  → dispatch CustomEvent('variant:change', { detail: { variant } })
    → stickyAtc : met à jour variantId, price, available
    → (futur) tout autre composant qui écoute cette variante
```

---

## 6. Structure des fichiers

```
.
├── frontend/                        ← Sources (non déployées sur Shopify)
│   └── entrypoints/
│       ├── main.js                  ← Alpine init, stores, composants
│       └── main.css                 ← @tailwind base/components/utilities
│
├── assets/                          ← Build output (Shopify CDN)
│   ├── main.js                      ← Compilé par Vite
│   └── main.css                     ← Tailwind purgé
│
├── config/
│   ├── settings_schema.json         ← Interface Theme Editor (couleurs, typo, mode)
│   └── settings_data.json           ← Valeurs par défaut
│
├── layout/
│   └── theme.liquid                 ← Layout global (head, body, sections fixes)
│
├── locales/
│   ├── fr.default.json              ← Traductions françaises (locale par défaut)
│   └── en.json                      ← Traductions anglaises (locale secondaire)
│
├── sections/
│   ├── announcement-bar.liquid      ← Bandeau d'annonce (Alpine dismiss)
│   ├── header.liquid                ← Header sticky, nav desktop/mobile, badge panier
│   ├── hero-landing.liquid          ← Hero fullscreen — mode Landing Page
│   ├── cart-drawer.liquid           ← Panier latéral (consomme Alpine.store('cart'))
│   ├── sticky-atc.liquid            ← Sticky ATC mobile (IntersectionObserver)
│   ├── product-main.liquid          ← Page produit (variantPicker)
│   └── footer.liquid                ← Pied de page (menus, paiements, devises)
│
├── snippets/
│   ├── css-variables.liquid         ← Bridge settings → CSS custom properties
│   ├── swatches.liquid              ← Sélecteur couleur avec disponibilité
│   ├── product-price.liquid         ← Prix / prix barré / badge % (SSR fallback)
│   └── vite-tag.liquid              ← Auto-généré par vite-plugin-shopify
│
├── templates/                       ← JSON Online Store 2.0
│   ├── index.json                   ← Page d'accueil
│   ├── product.json                 ← Page produit
│   ├── collection.json              ← Page collection
│   ├── cart.json                    ← Page panier
│   ├── page.json                    ← Page statique générique
│   ├── page.faq.json                ← Template FAQ
│   └── page.contact.json            ← Template Contact
│
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .shopifyignore                   ← Exclut node_modules, frontend/, configs du push
└── .gitignore
```

---

## 7. API Shopify utilisées

Toutes les interactions cart se font via l'**API AJAX Shopify** (synchrone, sans token, disponible nativement) :

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/cart.js` | GET | Lire l'état du panier |
| `/cart/add.js` | POST | Ajouter un article |
| `/cart/change.js` | POST | Modifier quantité (qty=0 = supprimer) |

Payload `add.js` : `{ id: variantId, quantity: n, properties: {} }`
Payload `change.js` : `{ id: lineItemKey, quantity: n }`

L'état JS du panier (`window.theme`) est injecté dans `layout/theme.liquid` :
```js
window.Shopify.currency.active   // Code devise actif
window.theme.shopMode            // "landing" | "catalogue"
window.theme.moneyFormat         // Format monétaire du shop
window.theme.routes.*            // URLs Shopify (cart, cartAdd, cartChange)
```

---

## 8. Conventions de performance

### Images

| Contexte | Attributs | Raison |
|----------|-----------|--------|
| Image LCP (hero, produit principal) | `fetchpriority="high"` `loading="eager"` | Maximise la priorité réseau |
| Images below-the-fold | `loading="lazy"` | Chargement différé |
| Tous les conteneurs images | `aspect-ratio` CSS (`.aspect-product 3/4`, `.aspect-hero 16/9`) | Anti-CLS (Core Web Vitals) |
| Hero responsive | `<picture>` + `srcset` + `sizes="100vw"` | Sert la bonne résolution selon viewport |

### JavaScript

- `main.js` chargé avec `type="module" defer` → non bloquant pour le rendu
- `[x-cloak]` masque les éléments Alpine avant hydratation → zéro flash de contenu non stylé
- Toutes les requêtes cart sont `async/await` avec `loading` flag pour éviter les doubles soumissions

### Tailwind Safelist

Les classes générées dynamiquement (par Alpine ou Liquid) qui ne sont pas présentes statiquement dans les fichiers sont protégées de la purge :

```js
safelist: [
  'x-cloak',
  { pattern: /^(translate|opacity|scale)-/ },   // Transitions Alpine
  { pattern: /^(max-w)-(xl|2xl|3xl)$/ },        // Largeur contenu hero (valeur setting Liquid)
]
```

---

## 9. Sections à créer (Phase 1.3 et au-delà)

Les sections suivantes sont référencées dans les templates mais pas encore implémentées :

| Section | Template | Phase |
|---------|----------|-------|
| `sections/faq.liquid` | `page.faq.json` | 1.3 |
| `sections/contact-form.liquid` | `page.contact.json` | 1.3 |
| `sections/page-content.liquid` | `page.json` | 1.3 |
| `sections/cart-items.liquid` | `cart.json` | 1.3 |
| `sections/collection-hero.liquid` | `collection.json` | Mode catalogue |
| `sections/collection-grid.liquid` | `collection.json` | Mode catalogue |

---

## 10. Critères de validation MVP

| Critère | Cible | Méthode |
|---------|-------|---------|
| PageSpeed Mobile | > 90 | Google PageSpeed Insights |
| PageSpeed Desktop | > 95 | Google PageSpeed Insights |
| LCP | < 2.5 s | Chrome DevTools |
| CLS | < 0.1 | Chrome DevTools |
| Bundle CSS | < 15 Ko gzip | `npm run build` stats |
| Bundle JS | < 25 Ko gzip | `npm run build` stats |
| Drawer Cart | AJAX sans rechargement page | Test manuel mobile |
| Sticky ATC | Apparaît au scroll hors ATC principal | Test manuel mobile |
| Swatches | Prix / image / stock synchronisés | Test manuel toutes variantes |
| Rebranding complet | < 10 min via Theme Editor | Test couleurs + typo + mode |
| Tunnel d'achat | Commande test passée | Bogus Gateway Shopify |
