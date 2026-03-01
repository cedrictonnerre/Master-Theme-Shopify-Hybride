## ADDED Requirements

### Requirement: Plugin @alpinejs/collapse enregistré
Le plugin `@alpinejs/collapse` SHALL être installé comme dépendance runtime et enregistré dans `main.js` avant `Alpine.start()`.

#### Scenario: Directive x-collapse fonctionnelle
- **WHEN** `Alpine.plugin(collapse)` est appelé avant `Alpine.start()`
- **THEN** la directive `x-collapse` est disponible dans tous les éléments Alpine du thème (notamment l'accordéon dans `product-main.liquid`)

#### Scenario: Impact bundle JS
- **WHEN** `npm run build` est exécuté après ajout de la dépendance
- **THEN** le bundle JS final reste inférieur à 25 Ko gzip
