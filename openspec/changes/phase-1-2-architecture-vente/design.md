## Context

Phase 1.2 est marquée "Complétée" dans le projet mais l'audit du code révèle 4 problèmes bloquants à corriger avant de passer à Phase 1.3 : une dépendance manquante (`@alpinejs/collapse`), une duplication de composant Alpine (`stickyAtc`), un double-rendu du prix produit, et deux sections catalogue qui sont des stubs de 7–14 lignes non fonctionnels.

Stack existante et inchangée : Alpine.js 3.x + Tailwind CSS 3.x + Vite 5.x + Shopify Liquid 2.x. Toutes les corrections s'inscrivent dans les patterns déjà établis.

## Goals / Non-Goals

**Goals:**
- Activer `x-collapse` via `@alpinejs/collapse` (plugin manquant)
- Supprimer le script inline `stickyAtc()` de sticky-atc.liquid, consolider dans `Alpine.data` de main.js
- Corriger l'affichage du prix : SSR visible avant hydratation Alpine, masqué après
- Compléter collection-grid.liquid : grille responsive, cards produits, vide-état, schema settings
- Compléter collection-hero.liquid : hero collection avec image de fond optionnelle et overlay

**Non-Goals:**
- Pagination Alpine pour collection-grid (Phase 3)
- Filtres / tri produits (Phase 3)
- Animations CSS luxe (Phase 3)
- Modification du Drawer Cart ou des Swatches (déjà complets)

## Decisions

### D1 — `@alpinejs/collapse` comme dépendance runtime

**Décision** : Ajouter dans `dependencies` (pas `devDependencies`) et importer dans `main.js` aux côtés de `@alpinejs/intersect`.

**Pourquoi** : `x-collapse` est utilisé dans `product-main.liquid` ligne 220 — l'accordéon de description produit est silencieusement cassé sans ce plugin. Le plugin pèse ≈ 0.8 Ko gzip, sous la limite de 25 Ko JS.

**Alternative écartée** : Remplacer `x-collapse` par des transitions CSS manuelles — plus verbeux, moins maintenable, contrevient au pattern Alpine établi.

---

### D2 — Consolidation de `stickyAtc` dans `Alpine.data` (suppression inline script)

**Décision** : Supprimer le bloc `<script>` inline de `sticky-atc.liquid`, enrichir `Alpine.data('stickyAtc', ...)` dans `main.js` avec les propriétés `price` et `loading`, passer les valeurs SSR initiales via `data-*` attributes sur le wrapper.

**Pourquoi** : Le template utilise `x-data="stickyAtc()"` (avec parenthèses) ce qui appelle la fonction globale `window.stickyAtc` — le `Alpine.data` enregistré dans main.js est donc du code mort. Avoir deux implémentations contradictoires crée un risque de divergence. La convention du projet est de centraliser tous les composants Alpine dans `main.js`.

**Pattern data-* pour bootstrap SSR** :
```html
<div x-data="stickyAtc"
  data-initial-price="{{ current_variant.price | money }}"
  data-variant-id="{{ current_variant.id }}"
  data-available="{{ current_variant.available }}">
```
L'`init()` du composant lit `this.$el.dataset` pour initialiser les valeurs sans appel réseau.

**Alternative écartée** : Garder le script inline et supprimer `Alpine.data` de main.js — moins propre, contrevient à la convention de centralisation.

---

### D3 — Correction double-prix via `x-show="!selectedVariant"`

**Décision** : Wrapper le rendu SSR (`{%- render 'product-price' -%}`) dans `<div x-show="!selectedVariant">`. Le bloc Alpine existant garde `x-show="selectedVariant" x-cloak`.

**Pourquoi** : `selectedVariant` est `null` avant que `variantPicker.init()` s'exécute (avant Alpine), puis immédiatement défini lors de l'init. Ce pattern garantit : (1) le prix SSR est visible pendant le chargement initial, (2) il disparaît dès qu'Alpine prend le relais, (3) le prix Alpine est masqué avant l'init via `x-cloak`. Zéro flash, zéro CLS.

---

### D4 — collection-grid : grille Tailwind conditionnelle par settings schema

**Décision** : Utiliser des classes Tailwind conditionnelles via `{% case section.settings.columns_desktop %}` pour la grille responsive. Les settings `columns_desktop` et `columns_mobile` sont exposés dans le schema.

**Pourquoi** : Permet au marchand de changer le nombre de colonnes depuis le Theme Editor sans toucher au code. Cohérent avec le principe de rebranding via settings.

**Classes grid utilisées** (safelist Tailwind nécessaire) :
- Mobile : `grid-cols-1`, `grid-cols-2`
- Desktop : `md:grid-cols-2`, `md:grid-cols-3`, `md:grid-cols-4`

---

### D5 — collection-hero : réutilisation du pattern hero-landing

**Décision** : Calquer la structure de `hero-landing.liquid` (image `<picture>` + overlay + contenu) en l'adaptant au contexte collection (titre = `collection.title`, pas de boutons CTA, hauteur réduite `min-h-[30vh] md:min-h-[45vh]`).

**Pourquoi** : Cohérence visuelle entre les deux modes boutique. Réutilise un pattern déjà éprouvé.

## Risks / Trade-offs

**[Risque] Flicker prix SSR→Alpine** → `variantPicker.init()` s'exécute synchroniquement au montage Alpine, la transition est imperceptible. `x-cloak` sur le bloc Alpine empêche tout flash.

**[Risque] `data-*` attributes et Liquid escaping** → `{{ current_variant.price | money }}` peut contenir des caractères spéciaux (ex: "15,00 €"). Les `data-*` attributes HTML sont correctement échappés par le navigateur ; pas de problème de parsing.

**[Risque] Safelist Tailwind incomplète pour les colonnes** → Les classes `grid-cols-*` générées dynamiquement par Liquid sont purgées par PurgeCSS. À ajouter dans `tailwind.config.js` safelist.

**[Trade-off] Bootstrap SSR via data-* vs prop Liquid directe** → Le pattern `data-*` ajoute une légère indirection mais évite d'exposer les valeurs Liquid dans le JS inline et conserve la séparation rendu/logique.

## Migration Plan

1. `npm install` après ajout de `@alpinejs/collapse` dans `package.json`
2. `npm run build` pour vérifier le bundle JS < 25 Ko
3. Push vers le store de dev avec `shopify theme dev` et valider :
   - Accordéon description produit fonctionne (x-collapse)
   - Sticky ATC apparaît au scroll sur mobile
   - Prix produit ne s'affiche pas en double
   - Collection grid affiche les produits correctement

**Rollback** : `git restore` sur les 6 fichiers modifiés, `npm install` avec package.json précédent.
