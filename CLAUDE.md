# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Master Theme Shopify Hybride V1** — Thème Shopify reproductible, basculant entre mode Landing Page (mono-produit) et Catalogue (multi-produits). Optimisé pour la performance publicitaire TikTok/Meta. PageSpeed cible > 90 mobile.

## Tech Stack (Option B — Décision Architecturale)

| Couche | Technologie |
|--------|-------------|
| Rendu serveur | Shopify Liquid 2.x (Sections Everywhere + JSON templates) |
| Thème base | Dawn (dégraissé — fichiers inutiles à supprimer) |
| JavaScript réactif | Alpine.js 3.x (~15 Ko gzip) |
| CSS | Tailwind CSS 3.x (PurgeCSS → 8-15 Ko final) |
| Build tool | Vite 5.x + vite-plugin-shopify |
| CLI | Shopify CLI 3.x |
| Hébergement | Shopify CDN (inclus — 0 €/mois) |

## Commands

```bash
# Installation
npm install

# Dev — Vite (dans un terminal)
npm run dev
# Dev — Shopify CLI (dans un autre terminal)
shopify theme dev --store <your-store>.myshopify.com --proxy http://localhost:5173

# Build production
npm run build

# Déployer le thème
shopify theme push --store <your-store>.myshopify.com

# Lint/format (JS)
npx eslint frontend/
```

## Structure du projet

```
frontend/
  entrypoints/
    main.js          ← Alpine.js init + stores (cart, ui) + composants
    main.css         ← Tailwind directives (@tailwind base/components/utilities)
assets/              ← Compiled output (Vite build → Shopify CDN)
config/
  settings_schema.json   ← Settings marchand (couleurs, typo, mode boutique)
  settings_data.json     ← Valeurs par défaut
snippets/
  css-variables.liquid   ← Bridge settings_schema → CSS custom properties
  vite-tag.liquid        ← Auto-généré par vite-plugin-shopify
  swatches.liquid        ← Sélecteur de variantes couleur
  product-price.liquid   ← Affichage prix / promotion
sections/
  announcement-bar.liquid
  header.liquid
  hero-landing.liquid    ← Hero Section — mode Landing Page
  cart-drawer.liquid     ← Panier latéral Alpine
  sticky-atc.liquid      ← Sticky Add to Cart (mobile)
  product-main.liquid    ← Page produit complète
  footer.liquid
layout/
  theme.liquid           ← Layout principal
templates/               ← JSON Online Store 2.0
locales/
  fr.default.json
  en.default.json
```

## Architecture clé

### Mode Boutique
Contrôlé via `settings_schema.json` → `settings.shop_mode`:
- `"landing"` → mono-produit (Hero Landing Page + Product Main)
- `"catalogue"` → multi-produits (Collection Grid)

### Alpine.js Stores (`frontend/entrypoints/main.js`)
- `Alpine.store('cart')` → état du panier AJAX (open, items, total, add/update/remove)
- `Alpine.store('ui')` → état UI global (mobileMenuOpen, etc.)

### Alpine.js Components
- `variantPicker(productJson)` → sélection de variantes, mise à jour prix/image/stock
- `accordion()` → accordéon réutilisable (FAQ, description produit)
- `stickyAtc()` → Sticky ATC avec IntersectionObserver sur `#main-atc-btn`

### Design Tokens — Flux complet
1. Marchand modifie couleurs/typo dans le **Theme Editor** Shopify
2. `config/settings_schema.json` expose les settings
3. `snippets/css-variables.liquid` injecte les CSS custom properties dans `<head>`
4. `tailwind.config.js` mappe ces variables aux utilitaires Tailwind
5. Rebranding complet en < 10 min, sans toucher au code

### Conventions
- **Sticky ATC** : observe `id="main-atc-btn"` via IntersectionObserver
- **Variant changes** : dispatché via `CustomEvent('variant:change', { detail: { variant } })`
- **Images LCP** : `fetchpriority="high"` + `loading="eager"` sur l'image hero/produit
- **Images below fold** : `loading="lazy"` + `aspect-ratio` CSS anti-CLS

## Critères de Validation MVP

| Critère | Cible |
|---------|-------|
| PageSpeed Mobile | > 90 |
| PageSpeed Desktop | > 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| CSS bundle | < 15 Ko |
| JS bundle | < 25 Ko |
| Drawer Cart | AJAX sans reload |
| Sticky ATC | Visible au scroll mobile |
| Swatches | Prix/image/stock sync |
| Rebranding | < 10 min via Theme Editor |

---

## Aperçu de l'objectif du projet

Créer un thème Shopify "reproductible" et "ultra-performant" capable de basculer entre :
- **Mode Landing Page** (mono-produit) — optimisé pour les campagnes TikTok/Meta Ads avec un tunnel d'achat direct
- **Mode Catalogue** (multi-produits) — pour une gamme de niche avec une grille de collection

L'objectif final est de livrer un Master Theme relivrable sous différentes marques sans intervention de code post-livraison, grâce au système de design tokens piloté par le Theme Editor Shopify.

---

## Aperçu de l'architecture globale

```
Theme Editor (marchand)
  ↓ settings_schema.json
snippets/css-variables.liquid  → CSS custom properties (:root)
  ↓
tailwind.config.js             → utilitaires Tailwind mappés
  ↓
*.liquid (sections/snippets)   → rendu Shopify SSR

frontend/entrypoints/main.js   → Alpine.js (stores + composants)
  ↓ Vite build
assets/main.js + assets/main.css → Shopify CDN
```

Deux modes coexistent dans un seul thème, basculés via `settings.shop_mode` :
- `"landing"` → `hero-landing.liquid` + `product-main.liquid`
- `"catalogue"` → `collection-hero.liquid` + `collection-grid.liquid`

---

## Style visuel

- Interface **claire et minimaliste** — pas de mode sombre pour le MVP
- Esthétique "Marque Premium" pour se démarquer du dropshipping classique
- Toutes les valeurs de design (couleurs, typo, espacements, border-radius) passent par les CSS custom properties — jamais de valeurs en dur dans les fichiers `.liquid`

---

## Contraintes et Politiques

- **NE JAMAIS exposer les clés API au client** — toute clé sensible (Shopify, Meta, TikTok CAPI, etc.) doit rester côté serveur ou dans les variables d'environnement (`.env`, non commité)
- Ne pas contourner les hooks git (`--no-verify`) sauf demande explicite
- Ne pas committer `settings.local.json`, `.env`, `node_modules/`, `snippets/vite-tag.liquid` (mode dev)

---

## Dépendances

- **Préférer les composants existants** plutôt que d'ajouter de nouvelles bibliothèques UI
- Stack figée : Alpine.js 3.x + Tailwind CSS 3.x + Vite 5.x — ne pas introduire React, Vue, ou d'autres frameworks JS sans validation explicite
- Toute nouvelle dépendance doit justifier son apport vs l'impact sur le bundle (cible JS < 25 Ko gzip)

---

## Tests interface graphique

À la fin de chaque développement impliquant l'interface graphique, utiliser le skill `playwright-skill` pour valider :
- L'interface est **responsive** (mobile + desktop)
- L'interface est **fonctionnelle** (interactions Alpine, cart, variantes)
- L'interface **répond au besoin développé**

---

## Documentation

- **PRD** (Product Requirements Document) : [`PRD.md`](./PRD.md)
- **Architecture** (décisions techniques détaillées) : [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Context7

Utiliser **automatiquement** les outils MCP Context7 (`resolve-library-id` puis `get-library-docs`) dans les cas suivants, sans attendre de demande explicite :
- Génération de code impliquant une bibliothèque (Alpine.js, Tailwind, Vite, Shopify Liquid, etc.)
- Étapes de configuration ou d'installation d'un outil
- Consultation de documentation d'une bibliothèque ou d'une API

---

## Langue des spécifications

- Toutes les spécifications sont rédigées **en français** (descriptions, scénarios, sections Purpose dans les OpenSpec)
- Seuls les **titres de Requirements** restent en anglais avec les mots-clés `SHALL` / `MUST` pour la validation OpenSpec
