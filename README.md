# ORYXIA Design — Site web (gravure laser)

Site vitrine **premium** pour ORYXIA Design, atelier indépendant de gravure laser
sur tous supports (bois, métal, verre, cuir, médailles, plexiglas, ardoise…).

## ✨ Aperçu

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) au design haut de gamme
reprenant l'identité du logo : **noir, or et argent métallisés**, typographie *Cinzel*.

### Pages
| Page | Fichier |
|------|---------|
| Accueil | `index.html` |
| Services (par matériau) | `services.html` |
| Réalisations (galerie filtrable) | `realisations.html` |
| **Simulateur de gravure** 🏅 | `simulateur.html` |
| Tarifs + estimateur | `tarifs.html` |
| À propos | `a-propos.html` |
| Notre procédé | `processus.html` |
| FAQ | `faq.html` |
| Contact / devis | `contact.html` |
| Mentions légales | `mentions-legales.html` |

### 🏅 Simulateur de gravure (fonctionnalité phare)
Module 100 % côté navigateur (`assets/js/simulateur.js`, Canvas) :
- import d'une image par glisser-déposer (logo, photo, dessin) ;
- rendu simulé sur **médaille, disque, carré, plaque ou médaillon** ;
- choix de la matière (**or, argent, bronze, noir mat, bois**) ;
- réglages profondeur / contraste / luminosité / inversion ;
- texte gravé personnalisable (titre + sous-titre courbés) ;
- export PNG de l'aperçu.
- 🔒 Aucune image n'est envoyée à un serveur.

## 🚀 Essayer

**En local :** ouvrez simplement `index.html` dans un navigateur.

**En ligne :** le dépôt déploie automatiquement sur **GitHub Pages**
via `.github/workflows/deploy.yml`.
URL une fois activé : `https://cronobots.github.io/oryxia/`

> Si la page n'apparaît pas : Settings → Pages → Source = *GitHub Actions*,
> puis relancer le workflow « Déploiement GitHub Pages » (ou fusionner sur `main`).

## 🗂️ Structure
```
assets/
  css/style.css        # Système de design complet
  js/main.js           # En-tête/pied partagés, nav, animations, FAQ, estimateur
  js/simulateur.js     # Moteur du simulateur de gravure (Canvas)
  img/logo.jpeg        # Logo ORYXIA
*.html                 # Pages du site
```
