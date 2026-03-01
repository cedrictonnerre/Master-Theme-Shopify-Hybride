## MODIFIED Requirements

### Requirement: Affichage du prix sans doublon SSR/Alpine
La section `product-main` SHALL afficher le prix produit une seule fois à tout moment : le rendu SSR avant hydratation Alpine, le bloc Alpine après hydratation.

#### Scenario: Chargement initial (avant Alpine)
- **WHEN** la page produit se charge et Alpine n'est pas encore initialisé (`selectedVariant` est null)
- **THEN** le rendu SSR du prix (`product-price` snippet) est visible, le bloc Alpine est masqué (`x-cloak`)

#### Scenario: Après hydratation Alpine
- **WHEN** `variantPicker.init()` s'exécute et définit `selectedVariant`
- **THEN** le rendu SSR est masqué (`x-show="!selectedVariant"` devient false) et le bloc Alpine prend le relais sans flash visible
