## Why

Le projet démarre sans infrastructure de développement ni système de design défini, ce qui rendrait chaque sprint futur fragile et difficile à maintenir. Établir dès maintenant le workflow (Shopify CLI + GitHub + Vite) et le Design System modulaire (CSS custom properties pilotées par le Theme Editor) constitue la fondation indispensable sur laquelle tout le reste du Master Theme est construit.

## What Changes

- **Stack de développement** : initialisation Vite 5.x + `vite-plugin-shopify`, configuration Tailwind CSS 3.x + PurgeCSS, intégration Shopify CLI 3.x avec proxy HMR
- **Base thème** : Dawn 14+ dégraissé — suppression des ~70 % de CSS inutiles, conservation uniquement des helpers Liquid essentiels
- **Design Token System** : pipeline complet `settings_schema.json` → `snippets/css-variables.liquid` → CSS custom properties → `tailwind.config.js` pour rebranding instantané < 10 min
- **Alpine.js foundation** : `frontend/entrypoints/main.js` avec stores `cart` et `ui`, configuration `[x-cloak]` globale
- **Layout principal** : `layout/theme.liquid` avec injection des assets Vite, meta SEO de base, Google Fonts préchargées
- **Settings Theme Editor** : exposition de toutes les variables de customisation (couleurs, typo, mise en page, performance, favicon)

## Capabilities

### New Capabilities

- `dev-workflow` : Infrastructure de build et workflow développement — Vite + Shopify CLI + GitHub, scripts npm, HMR proxy, structure de fichiers
- `design-token-system` : Système de Design Tokens — pipeline settings_schema → css-variables → Tailwind, permettant rebranding complet via Theme Editor sans modification de code

### Modified Capabilities

*(Aucune — premier sprint, pas de specs existantes)*

## Impact

- **Fichiers créés** : `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `frontend/entrypoints/main.js`, `frontend/entrypoints/main.css`, `layout/theme.liquid`, `config/settings_schema.json`, `config/settings_data.json`, `snippets/css-variables.liquid`
- **Core Web Vitals** : la suppression du CSS inutile de Dawn réduit le bundle CSS (cible < 15 Ko gzip), le chargement de `main.js` en `type="module" defer` n'impacte pas le LCP — aucune dégradation CLS attendue
- **Mode boutique** : concerne les deux modes (landing et catalogue), le Design Token System est transversal
- **Dépendances npm ajoutées** : `vite`, `vite-plugin-shopify`, `tailwindcss`, `postcss`, `autoprefixer`, `alpinejs`, `@alpinejs/intersect`
