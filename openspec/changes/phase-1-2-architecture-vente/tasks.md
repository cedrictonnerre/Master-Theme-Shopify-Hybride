# Tasks: Phase 1.2 — Corrections & Complétion Architecture Vente

## T1 — alpine-setup : Ajouter @alpinejs/collapse
- [x] Ajouter `"@alpinejs/collapse": "^3.14.8"` dans `dependencies` de `package.json`
- [x] Importer `collapse` depuis `@alpinejs/collapse` dans `frontend/entrypoints/main.js`
- [x] Appeler `Alpine.plugin(collapse)` aux côtés de `Alpine.plugin(intersect)`, avant `Alpine.start()`

## T2 — sticky-atc : Enrichir Alpine.data('stickyAtc') dans main.js
- [x] Ajouter les propriétés `price: ''`, `loading: false`, `variantId: null`, `available: true` au composant
- [x] Dans `init()` : lire `this.$el.dataset.initialPrice`, `this.$el.dataset.variantId`, `this.$el.dataset.available` pour initialiser ces propriétés
- [x] Dans le handler `variant:change` : mettre à jour `price` (formaté `Intl.NumberFormat fr-FR`), `variantId` et `available`
- [x] Dans `addToCart()` : setter `this.loading = true` avant l'appel AJAX, `false` dans le finally

## T3 — sticky-atc : Migrer sticky-atc.liquid vers Alpine.data
- [x] Ajouter `data-initial-price`, `data-variant-id`, `data-available` sur le div wrapper `x-data`
- [x] Changer `x-data="stickyAtc()"` en `x-data="stickyAtc"` (sans parenthèses — Alpine.data)
- [x] Supprimer `x-init="init()"` (Alpine.data appelle `init()` automatiquement)
- [x] Supprimer le bloc `<script>` complet en bas de `sections/sticky-atc.liquid`

## T4 — product-main : Corriger le double-affichage du prix
- [x] Wrapper `{%- render 'product-price', variant: current_variant -%}` dans `<div x-show="!selectedVariant">`
- [x] Vérifier que le bloc Alpine price garde bien `x-show="selectedVariant"` et `x-cloak`

## T5 — collection-grid : Remplacer le stub par la grille complète
- [x] Réécrire `sections/collection-grid.liquid` avec la grille Tailwind responsive
- [x] Implémenter les classes grid conditionnelles selon `section.settings.columns_desktop` / `columns_mobile`
- [x] Implémenter la card produit : lien, image `aspect-product` + `loading="lazy"` + dimensions, titre, prix `{{ product.price | money }}`, badge "Épuisé" si `product.available == false`
- [x] Ajouter l'empty state si `collection.products.size == 0`
- [x] Ajouter le schema settings : `products_per_page` (range 6–24, step 6, default 12), `columns_desktop` (select 2/3/4, default 3), `columns_mobile` (select 1/2, default 2), `show_vendor` (checkbox, default false)

## T6 — collection-hero : Remplacer le stub par le hero complet
- [x] Réécrire `sections/collection-hero.liquid` avec image de fond optionnelle (pattern `<picture>` + srcset)
- [x] Appliquer `fetchpriority="high"` + `loading="eager"` sur l'image si présente
- [x] Implémenter l'overlay conditionnel (couleur + opacité depuis le schema)
- [x] Ajouter H1 `collection.title` + description conditionnelle
- [x] Ajouter le schema settings : `hero_image` (image_picker), `background_color` (color, default #f8f7f4), `show_overlay` (checkbox, default true), `overlay_color` (color, default #000000), `overlay_opacity` (range 0–80, step 5, default 40)

## T7 — tailwind.config.js : Safelist classes grid dynamiques
- [x] Ajouter dans la `safelist` de `tailwind.config.js` les classes `grid-cols-1`, `grid-cols-2`, `md:grid-cols-2`, `md:grid-cols-3`, `md:grid-cols-4` pour éviter la purge PurgeCSS

## T8 — templates/collection.json : Aligner les settings par défaut
- [x] Vérifier que `sections/collection-grid.settings` dans `templates/collection.json` inclut `columns_desktop: 3` et `columns_mobile: 2`
