## ADDED Requirements

### Requirement: Theme Editor expose tous les tokens de design

Le système DOIT exposer l'ensemble des variables de design (couleurs, typographie, mise en page, performance, mode boutique) dans `config/settings_schema.json` pour qu'elles soient modifiables via le Theme Editor Shopify natif.

#### Scenario: Marchand modifie la couleur accent via Theme Editor

- **WHEN** le marchand change `color_accent` dans le Theme Editor Shopify
- **THEN** la modification est sauvegardée dans `settings_data.json` et visible en temps réel dans l'aperçu du Theme Editor

#### Scenario: Marchand bascule le mode boutique

- **WHEN** le marchand change `shop_mode` de `landing` à `catalogue` dans le Theme Editor
- **THEN** le thème bascule vers l'affichage multi-produits sans toucher au code

#### Scenario: Marchand sélectionne une police heading

- **WHEN** le marchand utilise le font_picker `font_heading` dans le Theme Editor
- **THEN** la police sélectionnée est appliquée à tous les titres du thème

### Requirement: CSS custom properties reflètent les settings en temps réel

Le snippet `css-variables.liquid` DOIT injecter toutes les CSS custom properties sur `:root` à partir des settings Shopify, de sorte que tout changement dans le Theme Editor se reflète immédiatement.

#### Scenario: color_accent est mappé vers --color-accent

- **WHEN** le Theme Editor définit `settings.color_accent` à une valeur HEX
- **THEN** `:root` contient `--color-accent: <valeur-hex>` dans le `<head>` de la page

#### Scenario: border_radius est mappé vers --border-radius

- **WHEN** le Theme Editor définit `settings.border_radius` à une valeur px
- **THEN** `:root` contient `--border-radius: <valeur>px` dans le `<head>` de la page

#### Scenario: font_heading est mappé avec ses variantes

- **WHEN** le Theme Editor définit `settings.font_heading`
- **THEN** `:root` contient `--font-heading: <font-family>` ET `--font-heading-weight: <weight>` ET `--font-heading-style: <style>`

### Requirement: Fichiers Liquid utilisent exclusivement les classes Tailwind mappées

Tous les fichiers `.liquid` DOIVENT utiliser uniquement les classes Tailwind mappées aux CSS custom properties (ex: `bg-accent`, `text-text-light`, `rounded-theme`). Aucune valeur CSS en dur n'est autorisée.

#### Scenario: Classe bg-accent utilise la CSS var accent

- **WHEN** un fichier `.liquid` utilise la classe `bg-accent`
- **THEN** la couleur de fond correspond à `var(--color-accent)` définie dans `tailwind.config.js`

#### Scenario: Aucune valeur hex ou px en dur dans les fichiers liquid

- **WHEN** un fichier `.liquid` est audité pour les valeurs CSS en dur
- **THEN** aucune valeur hexadécimale (`#...`), couleur nommée (`red`, `blue`), ou valeur de taille arbitraire n'est présente dans les attributs `style=""` ou `class=""`

### Requirement: Rebranding complet est réalisable en moins de 10 minutes via Theme Editor

Le système de Design Tokens DOIT permettre à un marchand sans connaissance technique de rebrancher entièrement le thème (couleurs, typographie, spacing, favicon) via le Theme Editor Shopify en moins de 10 minutes.

#### Scenario: Changement de palette complète sans code

- **WHEN** le marchand modifie `color_background`, `color_accent`, `color_text`, et `color_border` dans le Theme Editor
- **THEN** l'ensemble du thème adopte la nouvelle palette sans modification de fichier `.liquid`, `.js` ou `.css`

#### Scenario: Durée de rebranding respecte la cible

- **WHEN** un utilisateur teste un rebranding complet (nouvelle couleur, nouvelle police, nouveau favicon)
- **THEN** l'opération complète depuis l'ouverture du Theme Editor jusqu'à la sauvegarde dure < 10 minutes
