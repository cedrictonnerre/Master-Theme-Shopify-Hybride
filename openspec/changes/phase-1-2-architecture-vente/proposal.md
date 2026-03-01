## Why

L'audit de la Phase 1.2 révèle 4 problèmes bloquants pour la mise en production : le plugin Alpine `@alpinejs/collapse` est utilisé dans le code mais absent des dépendances, la logique `stickyAtc` est dupliquée entre un script inline et `main.js`, le prix produit s'affiche en double après hydratation Alpine, et les deux sections du mode catalogue (`collection-grid`, `collection-hero`) sont des stubs non fonctionnels.

## What Changes

- **Ajouter `@alpinejs/collapse`** — dépendance manquante pour activer `x-collapse` dans l'accordéon de la page produit
- **Consolider `stickyAtc` dans `main.js`** — supprimer le script inline de `sticky-atc.liquid`, enrichir `Alpine.data('stickyAtc')` avec les propriétés `price` et `loading`, migrer vers `x-data="stickyAtc"` (sans parenthèses)
- **Corriger le double-affichage du prix dans `product-main.liquid`** — le rendu SSR (snippet `product-price`) et le bloc Alpine s'affichent simultanément après hydratation ; wraper le SSR dans `x-show="!selectedVariant"`
- **Compléter `collection-grid.liquid`** — remplacer le stub par une grille complète avec cards produits, lazy-loading anti-CLS, paramètres colonnes desktop/mobile
- **Compléter `collection-hero.liquid`** — remplacer le stub par une section hero avec image de fond optionnelle, overlay et settings Theme Editor

## Capabilities

### New Capabilities
- `collection-grid` : grille produits mode catalogue — cards avec image aspect-ratio, titre, prix, badge épuisé, paramètres colonnes et vide-état
- `collection-hero` : hero section mode catalogue — titre collection, description, image de fond responsive avec overlay configurable

### Modified Capabilities
- `sticky-atc` : consolidation vers `Alpine.data` — suppression du script inline, ajout de `price` et `loading` dans le composant enregistré dans `main.js`
- `product-main` : correction affichage prix SSR/Alpine — wrapper conditionnel pour éviter le doublon après hydratation
- `alpine-setup` : ajout du plugin `@alpinejs/collapse` — activer la directive `x-collapse` pour l'accordéon description produit

## Impact

- **Fichiers modifiés** : `package.json`, `frontend/entrypoints/main.js`, `sections/sticky-atc.liquid`, `sections/product-main.liquid`, `sections/collection-grid.liquid`, `sections/collection-hero.liquid`
- **Core Web Vitals** : correction double-prix améliore la stabilité visuelle (CLS) ; collection-grid avec `aspect-ratio` + `loading="lazy"` évite le CLS ; `fetchpriority="high"` sur collection-hero si image présente (LCP)
- **Bundle JS** : `@alpinejs/collapse` ≈ 0.8 Ko gzip — reste sous la limite de 25 Ko
- **Modes boutique** : `landing` (product-main, sticky-atc) et `catalogue` (collection-grid, collection-hero)
- **Non-goals** : pagination Alpine pour collection-grid (Phase 3), filtres/tri produits (Phase 3), animations luxe (Phase 3)
