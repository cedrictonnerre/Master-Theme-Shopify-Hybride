## 1. Infrastructure de build (Vite + Tailwind + Alpine)

- [x] 1.1 Créer `package.json` avec les scripts `dev`, `build` et les dépendances npm (vite, vite-plugin-shopify, tailwindcss, postcss, autoprefixer, alpinejs, @alpinejs/intersect)
- [x] 1.2 Créer `vite.config.js` avec `vite-plugin-shopify` (entrypoints, themeRoot, snippetFile)
- [x] 1.3 Créer `tailwind.config.js` avec content scanning (`sections/**/*.liquid`, `snippets/**/*.liquid`, `layout/**/*.liquid`, `frontend/**/*.js`) et mapping des CSS custom properties aux utilitaires Tailwind
- [x] 1.4 Créer `postcss.config.js` avec `tailwindcss` et `autoprefixer`
- [x] 1.5 Créer `frontend/entrypoints/main.css` avec les directives `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- [x] 1.6 Créer `frontend/entrypoints/main.js` avec l'initialisation Alpine.js, `@alpinejs/intersect`, les stores `cart` et `ui`, et les composants `variantPicker`, `accordion`, `stickyAtc`
- [x] 1.7 Créer `.gitignore` excluant `node_modules/`, `.env`, `snippets/vite-tag.liquid`, `assets/main.js`, `assets/main.css` (en dev)

## 2. Design Token System

- [x] 2.1 Créer `config/settings_schema.json` avec les groupes : Mode Boutique (`shop_mode`), Couleurs (7 color_pickers), Typographie (font_heading, font_body, font_size_base), Mise en page (page_width, border_radius, spacing_base), Performance (lazy_load_images, enable_animations), Favicon
- [x] 2.2 Créer `config/settings_data.json` avec les valeurs par défaut (palette neutre premium, Inter/Playfair, 1200px, border-radius 8px)
- [x] 2.3 Créer `snippets/css-variables.liquid` injectant toutes les CSS custom properties sur `:root` depuis `settings` (couleurs, fonts avec `font_face`, border-radius, page-width, spacing)
- [x] 2.4 Mettre à jour `tailwind.config.js` pour mapper les CSS vars aux classes Tailwind : `bg-accent` → `var(--color-accent)`, `text-text-light` → `var(--color-text-light)`, `rounded-theme` → `var(--border-radius)`, `max-w-page` → `var(--page-width)`, etc.

## 3. Layout principal

- [x] 3.1 Créer `layout/theme.liquid` avec : `<head>` (charset, viewport, title, canonical), rendu de `css-variables.liquid`, rendu de `vite-tag.liquid` (assets Alpine + Tailwind), `[x-cloak]` global CSS, `<body>` avec `content_for_layout`
- [x] 3.2 Créer `locales/fr.default.json` avec les clés de traduction de base (general, cart, products)
- [x] 3.3 Créer `locales/en.json` (traductions anglaises correspondantes)

## 4. Templates JSON OS 2.0

- [x] 4.1 Créer `templates/index.json` avec sections de base (announcement-bar, header, footer) et bloc conditionnel hero-landing vs collection-grid selon `shop_mode`
- [x] 4.2 Créer `templates/product.json` référençant `product-main`
- [x] 4.3 Créer `templates/collection.json` référençant `collection-hero` et `collection-grid`
- [x] 4.4 Créer `templates/page.json` référençant `page-content`
- [x] 4.5 Créer `templates/cart.json` référençant `cart-items`
- [x] 4.6 Créer `templates/404.json` avec page d'erreur minimaliste

## 5. Validation du workflow

- [x] 5.1 Exécuter `npm install` et vérifier l'absence d'erreurs
- [x] 5.2 Exécuter `npm run build` et vérifier la génération de `assets/main.js` et `assets/main.css`
- [x] 5.3 Vérifier que le bundle CSS est < 15 Ko gzip (`gzip -c assets/main.css | wc -c`)
- [x] 5.4 Vérifier que le bundle JS est < 25 Ko gzip (`gzip -c assets/main.js | wc -c`)
- [x] 5.5 Vérifier que `snippets/vite-tag.liquid` est dans `.gitignore` et non tracké par git
- [x] 5.6 Valider le pipeline Design Token : modifier `color_accent` dans `settings_data.json` et vérifier que `css-variables.liquid` génère la bonne CSS custom property
