## Context

Le projet part de zéro : aucun outil de build, aucune infrastructure de développement, aucun Design System établi. La contrainte principale est l'environnement Shopify (CDN, Liquid, OS 2.0) qui impose un pipeline de build spécifique pour livrer des assets optimisés. Le thème Dawn 14+ est utilisé comme point de départ pour bénéficier des helpers Liquid éprouvés, mais ses CSS (~300 Ko) sont inutiles à 70 % et doivent être purgés.

## Goals / Non-Goals

**Goals:**
- Mettre en place un environnement de développement fonctionnel avec HMR (Vite + Shopify CLI proxy)
- Implémenter le pipeline Design Token complet : settings → CSS vars → Tailwind → `.liquid`
- Configurer Alpine.js 3.x avec stores `cart` et `ui` prêts à l'emploi
- Atteindre < 15 Ko CSS et < 25 Ko JS en sortie de build production

**Non-Goals:**
- Implémentation de sections UI (hero, drawer cart, sticky ATC) — Phase 1.2
- Configuration des analytics (CAPI TikTok/Meta) — Phase 3
- Déploiement en production — Phase 2
- Tests automatisés (Playwright) — validés manuellement en Phase 1.1

## Decisions

### D1 — Vite 5.x + vite-plugin-shopify plutôt que webpack ou Parcel

**Décision** : Vite 5.x avec `vite-plugin-shopify`.

**Pourquoi** : HMR < 50 ms natif grâce à ES modules (pas de rebundle), `vite-plugin-shopify` gère automatiquement le manifeste d'assets et génère `snippets/vite-tag.liquid`. Alternative webpack rejetée : config complexe, pas de plugin Shopify officiel maintenu.

**Proxy** : `shopify theme dev --proxy http://localhost:5173` redirige les assets JS/CSS vers Vite en dev, permettant le HMR sans déployer.

### D2 — Tailwind CSS 3.x avec content scanning plutôt que CSS vanilla ou SCSS

**Décision** : Tailwind 3.x avec PurgeCSS intégré (option `content`).

**Pourquoi** : Le scanning automatique des fichiers `.liquid` et `frontend/**/*.js` garantit un bundle CSS minimal (cible 8–15 Ko). La Safelist protège les classes dynamiques générées par Alpine ou Liquid. Alternative SCSS rejetée : pas de purge automatique, maintenance manuelle plus lourde.

**Mapping Design Tokens** : `tailwind.config.js` mappe les CSS custom properties (`var(--color-accent)`) aux utilitaires (`bg-accent`), assurant que les fichiers `.liquid` n'utilisent jamais de valeurs en dur.

### D3 — Alpine.js 3.x plutôt que React/Vue

**Décision** : Alpine.js 3.x (~15 Ko gzip) + `@alpinejs/intersect`.

**Pourquoi** : Compatible avec le SSR Shopify Liquid sans hydratation SPA. Taille minimale (< 15 Ko). Déclaratif dans le HTML, pas de compilation nécessaire. React/Vue rejetés : overhead bundle (>40 Ko), incompatibilité avec le rendu Liquid serveur.

### D4 — settings_schema.json comme source unique de vérité pour le Design System

**Décision** : Tous les tokens de design sont exposés dans `settings_schema.json` → injectés via `snippets/css-variables.liquid` sur `:root`.

**Pourquoi** : Le marchand modifie le thème via le Theme Editor natif Shopify sans toucher au code. Le rebranding complet (couleurs, typo, spacing, border-radius) est possible en < 10 min. Pas de configuration à maintenir côté code pour chaque client.

## Risks / Trade-offs

- **[Risque] Vite proxy instable** → Le proxy Shopify CLI ↔ Vite peut perdre la connexion. Mitigation : relancer `shopify theme dev` suffit ; le HMR se reconnecte automatiquement.
- **[Risque] Safelist Tailwind incomplète** → Des classes générées dynamiquement (Liquid/Alpine) peuvent être purgées en prod. Mitigation : lister explicitement les patterns dans `safelist` de `tailwind.config.js` et valider avec `npm run build` + inspection du bundle CSS.
- **[Trade-off] `vite-tag.liquid` non commité** → En dev, ce fichier est auto-généré et pointe vers localhost:5173. En prod, il est régénéré par `npm run build`. Conséquence : le thème ne fonctionne pas sans build préalable sur une install fraîche. Mitigation : documenter dans CLAUDE.md et git hooks optionnels.
- **[Risque] Dawn CSS résiduel** → La suppression des CSS de Dawn peut casser des helpers Liquid non identifiés. Mitigation : conserver uniquement les snippets Liquid utiles (price, media), supprimer les CSS par blocs et vérifier chaque section.

## Migration Plan

Phase 1.1 est le premier sprint — pas de migration depuis un état existant. Séquence de déploiement :

1. `npm install` — installer toutes les dépendances
2. `npm run build` — générer `assets/main.js` et `assets/main.css` + `snippets/vite-tag.liquid`
3. `shopify theme push` — pousser le thème sur le store de dev
4. `shopify theme dev --proxy http://localhost:5173` + `npm run dev` — activer le HMR

Rollback : restaurer depuis la branche Git précédente et `shopify theme push`.

## Open Questions

*(Aucune — décisions validées en atelier d'architecture Phase 0)*
