## MODIFIED Requirements

### Requirement: Source unique pour le composant stickyAtc
Le composant `stickyAtc` SHALL être défini uniquement via `Alpine.data('stickyAtc', ...)` dans `frontend/entrypoints/main.js`. Aucun script inline ne SHALL exister dans `sections/sticky-atc.liquid`.

#### Scenario: Chargement de la page produit
- **WHEN** la page produit se charge et Alpine s'initialise
- **THEN** `x-data="stickyAtc"` (sans parenthèses) résout le composant depuis `Alpine.data` et appelle automatiquement `init()`

#### Scenario: Absence de script inline
- **WHEN** `sticky-atc.liquid` est rendu
- **THEN** aucun bloc `<script>` inline n'est présent dans le HTML généré

---

### Requirement: Propriétés price et loading dans Alpine.data stickyAtc
Le composant `Alpine.data('stickyAtc')` SHALL exposer les propriétés `price` (string formaté), `loading` (boolean) et initialiser `available`, `variantId` depuis les `data-*` attributes SSR.

#### Scenario: Initialisation depuis SSR
- **WHEN** `init()` s'exécute au montage Alpine
- **THEN** `this.price`, `this.variantId` et `this.available` sont lus depuis `this.$el.dataset` (valeurs injectées via Liquid dans les `data-*` attributes)

#### Scenario: Mise à jour au changement de variante
- **WHEN** `CustomEvent('variant:change')` est dispatché
- **THEN** `price`, `variantId` et `available` sont mis à jour avec les valeurs de la nouvelle variante

#### Scenario: État loading pendant l'ajout au panier
- **WHEN** `addToCart()` est appelé
- **THEN** `loading` passe à `true` pendant l'appel AJAX et revient à `false` à la fin
