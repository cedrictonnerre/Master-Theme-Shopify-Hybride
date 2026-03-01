## ADDED Requirements

### Requirement: Hero section pour page collection
La section `collection-hero` SHALL afficher le titre et la description de la collection avec une image de fond optionnelle, paramétrable via le Theme Editor.

#### Scenario: Affichage titre et description
- **WHEN** la page collection se charge
- **THEN** `collection.title` est rendu en H1 avec `font-heading` et `collection.description` est affiché si non vide

#### Scenario: Image de fond absente
- **WHEN** aucune image n'est configurée dans le Theme Editor
- **THEN** la section affiche un fond coloré via le setting `background_color`

---

### Requirement: Image de fond responsive avec LCP optimal
Si une image est configurée, la section SHALL utiliser `<picture>` avec `srcset`, `fetchpriority="high"` et `loading="eager"` pour optimiser le LCP.

#### Scenario: Chargement avec image de fond
- **WHEN** `hero_image` est défini et la page se charge
- **THEN** l'image utilise `fetchpriority="high"`, `loading="eager"`, `srcset` avec variantes 768w/1200w/1920w et `sizes="100vw"`

---

### Requirement: Overlay configurable
La section SHALL supporter un overlay couleur + opacité sur l'image de fond, activable via le Theme Editor.

#### Scenario: Overlay activé
- **WHEN** `show_overlay` est true et une image est présente
- **THEN** un div overlay est rendu avec la couleur et l'opacité définies dans le schema

#### Scenario: Overlay désactivé
- **WHEN** `show_overlay` est false
- **THEN** aucun div overlay n'est rendu
