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
