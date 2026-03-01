## ADDED Requirements

### Requirement: Grille responsive de produits
La section `collection-grid` SHALL afficher les produits de la collection en grille responsive avec un nombre de colonnes configurable via le Theme Editor.

#### Scenario: Affichage desktop multi-colonnes
- **WHEN** `columns_desktop` est défini à 3 dans le Theme Editor
- **THEN** la grille affiche 3 colonnes sur écran ≥ 768 px avec `gap-4` entre les cards

#### Scenario: Affichage mobile
- **WHEN** `columns_mobile` est défini à 2
- **THEN** la grille affiche 2 colonnes sur mobile avec `gap-4`

#### Scenario: Collection vide
- **WHEN** la collection ne contient aucun produit (`collection.products.size == 0`)
- **THEN** un message d'état vide est affiché à la place de la grille

---

### Requirement: Card produit avec image anti-CLS
Chaque card produit SHALL inclure un conteneur image avec `aspect-ratio` fixe pour éviter tout layout shift au chargement.

#### Scenario: Chargement initial de la grille
- **WHEN** la page collection se charge
- **THEN** chaque image utilise `loading="lazy"`, `width` et `height` explicites, et un conteneur `aspect-product` avec dimensions CSS réservées

#### Scenario: Produit épuisé
- **WHEN** `product.available == false`
- **THEN** un badge "Épuisé" est visible sur la card

---

### Requirement: Settings Theme Editor
La section SHALL exposer les paramètres `products_per_page`, `columns_desktop`, `columns_mobile`, `show_vendor` dans son schema.

#### Scenario: Changement du nombre de colonnes
- **WHEN** le marchand modifie `columns_desktop` dans le Theme Editor
- **THEN** la grille reflète le nouveau nombre de colonnes sans modification de code
