## ADDED Requirements

### Requirement: Dev environment initializes with HMR

Le système DOIT permettre de démarrer un environnement de développement avec Hot Module Replacement (HMR) via Vite 5.x en proxy avec Shopify CLI 3.x.

#### Scenario: Vite démarre le serveur de développement

- **WHEN** le développeur exécute `npm run dev`
- **THEN** Vite démarre sur `http://localhost:5173` et surveille les modifications de `frontend/**/*`

#### Scenario: Shopify CLI proxifie les assets vers Vite

- **WHEN** le développeur exécute `shopify theme dev --store <store>.myshopify.com --proxy http://localhost:5173`
- **THEN** les assets JS/CSS sont servis depuis Vite (HMR actif), les fichiers Liquid sont synchronisés depuis le store

#### Scenario: Modification JS reflétée sans rechargement de page

- **WHEN** le développeur modifie `frontend/entrypoints/main.js`
- **THEN** le navigateur met à jour le module en < 200 ms sans rechargement complet de page

### Requirement: Production build génère des assets optimisés sous les seuils cibles

Le système DOIT produire un build de production avec des bundles CSS et JS respectant les seuils de performance définis.

#### Scenario: Build production génère les assets dans assets/

- **WHEN** le développeur exécute `npm run build`
- **THEN** `assets/main.js` et `assets/main.css` sont générés, ainsi que `snippets/vite-tag.liquid`

#### Scenario: Bundle CSS respecte le seuil de 15 Ko gzip

- **WHEN** le build production est terminé
- **THEN** `assets/main.css` DOIT peser < 15 Ko gzip après PurgeCSS

#### Scenario: Bundle JS respecte le seuil de 25 Ko gzip

- **WHEN** le build production est terminé
- **THEN** `assets/main.js` DOIT peser < 25 Ko gzip après tree-shaking

### Requirement: Repository respecte les règles .gitignore de sécurité

Le dépôt Git DOIT exclure du tracking tous les fichiers contenant des secrets ou des artefacts de build temporaires.

#### Scenario: vite-tag.liquid n'est pas commité

- **WHEN** le développeur exécute `git status` après `npm run dev`
- **THEN** `snippets/vite-tag.liquid` n'apparaît pas dans les fichiers à commiter (présent dans `.gitignore`)

#### Scenario: .env n'est pas commité

- **WHEN** le développeur ajoute un fichier `.env` avec des clés API
- **THEN** `git status` ne liste pas `.env` (présent dans `.gitignore`)

#### Scenario: node_modules n'est pas commité

- **WHEN** le développeur exécute `npm install`
- **THEN** `git status` ne liste pas `node_modules/` (présent dans `.gitignore`)

### Requirement: Déploiement vers le store Shopify est possible via CLI

Le système DOIT permettre de pousser le thème compilé vers le store Shopify via Shopify CLI sans intervention manuelle.

#### Scenario: Theme push déploie les assets compilés

- **WHEN** le développeur exécute `shopify theme push --store <store>.myshopify.com` après `npm run build`
- **THEN** tous les fichiers du thème (assets, sections, snippets, config, layout, templates) sont synchronisés vers le store
