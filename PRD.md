# Spécifications Projet : Master Theme Shopify Hybride (V1)

## 🎯 Vision du Projet

Créer un système de boutique Shopify "reproductible" et "ultra-performant", capable de basculer entre un mode **Mono-produit** (Landing Page) et **Multi-produits** (Gamme de niche). L'accent est mis sur la vitesse radicale, l'optimisation publicitaire (TikTok/Meta Ads) et une esthétique "Marque Premium" pour se démarquer du dropshipping classique.

---

## 🛠 ROADMAP DE DÉVELOPPEMENT

### PHASE 1 : Le Build (MVP - Construction du Système)

*Objectif : Zéro coût logistique, 100% focus sur le code et l'infrastructure.*

#### **Étape 1.1 : Fondations & Workflow**

* **Stack :** Shopify CLI + GitHub + Claude Code.
* **Master Theme :** Base sur une structure légère (ex: Dawn dégraissé).
* **Design System Modulaire :** Centralisation des variables CSS (couleurs, polices, border-radius) pour un rebranding instantané via l'éditeur.

#### **Étape 1.2 : Architecture de Vente (Le "Moteur")**

* **Template Hybride :** Développement de sections conditionnelles pour passer d'un mode "Landing Page" à un mode "Catalogue".
* **Mobile-First UX :**
* Panier latéral (Drawer Cart) ultra-fluide.
* Bouton d'achat collant (Sticky Add to Cart) sur mobile.
* Sélecteurs de variantes visuels (Swatches).


* **Performance :** Score Google PageSpeed > 90. Optimisation du LCP (Largest Contentful Paint).

#### **Étape 1.3 : Écosystème & Confiance**

* **SAV Natif :** Codage des pages FAQ, Politiques de retour et Formulaire de contact avec demande de n° de commande.
* **Emailing :** Personnalisation des templates d'emails transactionnels (Liquid) aux couleurs de la marque.
* **Test à blanc :** Validation du tunnel d'achat via la **Bogus Gateway** (Paiement fictif).

---

### PHASE 2 : Live Crash Test (Validation Réelle)

*Objectif : Éprouver la logistique et le SAV avec un achat réel.*

* **Liaison Fournisseur :** Installation d'une passerelle (type DSers/Zendrop) pour lier AliExpress.
* **Test de bout en bout :**
1. Achat réel avec carte bancaire sur la boutique.
2. Vérification de la transmission automatique au fournisseur.
3. Suivi du délai de livraison et état du colis à la réception.


* **Scénario SAV :** Simulation d'un litige (demande d'info de suivi + remboursement réel) pour valider le flux financier.

---

### PHASE 3 : Optimisation & Scale (Post-MVP)

* **Micro-interactions :** Animations CSS fluides pour l'aspect "Luxe".
* **Upsells Natifs :** Sections "Complétez votre look" codées sans apps tierces.
* **Analytics :** Configuration avancée du tracking (CAPI) pour les réseaux sociaux.

---

## 🏗 EXIGENCES TECHNIQUES POUR L'AGENT IA

### 1. Performance Publicitaire

* Le site doit être une "pente savonneuse" : réduire le nombre de clics entre l'ad et le checkout.
* Pas de "Layout Shift" (mouvement d'éléments au chargement).

### 2. Anti-Dropshipping Pattern

* Éviter les éléments natifs Shopify trop reconnaissables.
* Storytelling produit intégré via des blocs de contenu riches (pas de copier-coller de fiches AliExpress).

### 3. Scalabilité

* Le code doit utiliser les `settings schema` de Shopify pour permettre des modifications sans toucher au code une fois le Master Thème livré.
