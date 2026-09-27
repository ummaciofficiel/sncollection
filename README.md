# SN Collection — Site e-commerce

Site vitrine + boutique pour **SN Collection**, connecté à un **Google Sheet** : toutes les modifications de contenu (produits, catégories, collections, articles de blog, coordonnées) se font depuis le tableur, sans toucher au code.

---

## 1. Structure du projet

```
sn-collection/
├── index.html            → Accueil
├── boutique.html         → Liste des produits (filtres, tri, pagination)
├── produit.html          → Fiche produit (?id=...)
├── collections.html      → Collections thématiques
├── a-propos.html         → À propos
├── blog.html             → Liste des articles
├── article.html          → Article de blog (?id=...)
├── contact.html          → Formulaire + coordonnées
├── panier.html           → Panier + commande via WhatsApp
├── compte.html           → Connexion / création de compte (interface)
├── 404.html              → Page d'erreur
├── css/style.css         → Toute la mise en forme du site
├── js/
│   ├── config.js         → ⭐ Identifiant de votre Google Sheet (à modifier)
│   ├── data.js           → Lit le Google Sheet (ou les données de démo)
│   ├── ui.js              → En-tête, pied de page, panier, etc.
│   ├── cart.js            → Logique du panier
│   ├── icons.js           → Icônes du site
│   └── pages/…            → Un fichier par page
├── data/*.sample.json    → Données de démonstration (utilisées tant que
│                            le Google Sheet n'est pas connecté)
└── assets/               → Logo, photos, favicon
```

Le site est 100% statique (HTML/CSS/JS) : il fonctionne sur GitHub Pages sans aucun serveur ni base de données à gérer.

---

## 2. Voir le site avant de le publier

Comme le site charge des fichiers (`data/*.json`) via JavaScript, ouvrir directement `index.html` dans le navigateur (double-clic) ne fonctionnera pas bien. Pour tester en local :

1. Installez [Python](https://python.org) (déjà présent sur Mac) **ou** utilisez l'extension "Live Server" de VS Code.
2. Dans le dossier du site, lancez :
   ```
   python3 -m http.server 8000
   ```
3. Ouvrez `http://localhost:8000` dans votre navigateur.

Une fois publié sur GitHub Pages, ce problème ne se pose plus.

---

## 3. Mettre en place le Google Sheet (le "back-office" du site)

### Étape 1 — Créer le classeur

1. Allez sur [sheets.google.com](https://sheets.google.com) → **Classeur vierge**.
2. Renommez-le **"SN Collection — Données du site"**.
3. En bas, créez **5 onglets** avec ces noms exacts :
   `Produits`, `Categories`, `Collections`, `Blog`, `Parametres`

### Étape 2 — Remplir chaque onglet

Respectez le **nom des colonnes en 1ère ligne** (les accents/majuscules n'ont pas d'importance, mais gardez les mots).

#### Onglet **Produits**

| id | nom | categorie | prix | ancien_prix | image_1 | image_2 | image_3 | description | tailles | couleurs | badge | note | avis | stock | vedette | nouveaute |
|----|-----|-----------|------|--------------|---------|---------|---------|-------------|---------|----------|-------|------|------|-------|---------|-----------|
| robe-001 | Robe longue wax bordeaux | Robes | 29900 | | https://.../photo1.jpg | | | Robe longue en wax... | S, M, L, XL | Bordeaux | Nouveau | 4.8 | 12 | Oui | Oui | Oui |

- **id** : identifiant unique, sans espace ni accent (ex : `robe-001`). Ne le changez jamais après création, il sert de lien vers la fiche produit.
- **categorie** : doit correspondre à un nom de catégorie de l'onglet *Categories*.
- **prix / ancien_prix** : nombres uniquement (pas de "F CFA" ni d'espace). Laissez `ancien_prix` vide s'il n'y a pas de promotion.
- **image_1 / image_2 / image_3** : liens directs vers vos photos (voir §4 ci-dessous). **Laissez vide si vous n'avez pas encore la photo** — le site affichera automatiquement un espace "Photo à venir" propre, jamais une image cassée.
- **tailles / couleurs** : séparées par des virgules.
- **badge** : `Nouveau`, `Promo`, `Tendance` ou vide.
- **stock / vedette / nouveaute** : écrivez `Oui` ou `Non`.
  - `vedette = Oui` → apparaît dans "Nos collections en vedette" sur l'accueil.
  - `nouveaute = Oui` → apparaît dans "Nouvelle collection".

#### Onglet **Categories**

| nom | slug | image | description |
|-----|------|-------|--------------|
| Robes | robes | https://.../robes.jpg | Robes en wax pour toutes les occasions |
| Pantalons & Jupes | | | |

Laissez `image` vide pour les catégories sans photo pour l'instant.

#### Onglet **Collections** (page "Collections")

| nom | image | description | lien_categorie |
|-----|-------|--------------|------------------|
| Collection Wax | https://... | Les couleurs tendance de la saison | Robes |

`lien_categorie` doit correspondre à un nom de l'onglet *Categories* : c'est vers cette catégorie que la tuile renverra.

#### Onglet **Blog**

| id | titre | image | extrait | contenu | date | auteur |
|----|-------|-------|---------|---------|------|--------|
| article-1 | Comment porter le wax | https://... | Résumé court affiché sur la liste | Texte complet de l'article... | 2026-09-01 | SN Collection |

- **date** au format `AAAA-MM-JJ` (ex : `2026-09-01`).
- **contenu** : allez à la ligne (Entrée dans la cellule avec `Alt+Entrée` ou `Cmd+Entrée`) pour créer des paragraphes séparés.

#### Onglet **Parametres** (textes et coordonnées du site)

| cle | valeur |
|-----|--------|
| hero_titre | SN Collection |
| hero_sous_titre | Votre style, notre signature |
| hero_texte | Découvrez notre collection... |
| banniere_titre | Élégante aujourd'hui, unique toujours. |
| banniere_texte | Chaque saison, une nouvelle histoire de style à raconter. |
| telephone | +225 07 00 00 00 00 |
| whatsapp | 22507000000 |
| email | contact@sncollection.ci |
| adresse | Abidjan, Côte d'Ivoire |
| facebook | https://facebook.com/... |
| instagram | https://instagram.com/... |
| tiktok | https://tiktok.com/@... |
| youtube | |

Le numéro `whatsapp` doit être écrit **sans "+" ni espaces** (ex : `22507000000`) : c'est ce numéro qui reçoit les commandes passées depuis le panier.

### Étape 3 — Partager le classeur publiquement (lecture seule)

1. Cliquez sur **Partager** (en haut à droite du Google Sheet).
2. Sous "Accès général", choisissez **"Tous les utilisateurs disposant du lien"**.
3. Réglez le rôle sur **"Lecteur"** (surtout pas "Éditeur").
4. Cliquez sur **Copier le lien**, puis sur **Terminé**.

> Cette étape est indispensable : sans elle, le site ne pourra pas lire vos données.

### Étape 4 — Récupérer l'identifiant du classeur

Regardez l'URL de votre Google Sheet, elle ressemble à :

```
https://docs.google.com/spreadsheets/d/1A2B3C4d5E6f7G8h9I0jKlmnop/edit#gid=0
                                        └──────────── ceci est le SHEET_ID ────────────┘
```

Copiez la partie entre `/d/` et `/edit`.

### Étape 5 — Connecter le site à votre Sheet

Ouvrez `js/config.js` et collez votre identifiant :

```js
window.SITE_CONFIG = {
  SHEET_ID: "1A2B3C4d5E6f7G8h9I0jKlmnop",   // ← collé ici
  ...
};
```

Enregistrez, republiez sur GitHub (voir §5) : le site affichera désormais vos données. Il relit automatiquement le Sheet toutes les **10 minutes** par visiteur (modifiable via `CACHE_MINUTES` dans le même fichier).

---

## 4. Ajouter des photos (image_1, image_2...)

Un Google Sheet ne peut pas héberger des images utilisables directement : il vous faut un lien internet vers chaque photo. Deux solutions simples et gratuites :

**Option A — imgbb.com (recommandé, le plus simple)**
1. Allez sur [imgbb.com](https://imgbb.com), déposez votre photo.
2. Une fois envoyée, copiez le lien **"Lien direct"** (se terminant par `.jpg`/`.png`).
3. Collez ce lien dans la colonne `image_1` de votre produit.

**Option B — Google Drive**
1. Déposez la photo dans un dossier Google Drive.
2. Clic droit → Partager → "Tous les utilisateurs disposant du lien" → Lecteur.
3. Copiez l'ID du fichier dans l'URL de partage, puis utilisez ce format de lien :
   `https://lh3.googleusercontent.com/d/VOTRE_ID_FICHIER`

Tant qu'un article n'a pas encore de photo, laissez simplement les cases `image_1/2/3` vides : le site affiche un encart élégant "Photo à venir" plutôt qu'une image cassée.

---

## 5. Déployer sur GitHub Pages

1. Créez un nouveau dépôt sur GitHub (ex : `sn-collection`), public.
2. Depuis votre ordinateur, dans le dossier du site :
   ```
   git init
   git add .
   git commit -m "Premier envoi du site SN Collection"
   git branch -M main
   git remote add origin https://github.com/VOTRE-UTILISATEUR/sn-collection.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages**.
4. Sous "Build and deployment" → Source : **Deploy from a branch**.
5. Branche : **main**, dossier : **/ (root)** → **Save**.
6. Après 1 à 2 minutes, votre site est en ligne à l'adresse :
   `https://VOTRE-UTILISATEUR.github.io/sn-collection/`

Pour utiliser votre propre nom de domaine (ex : `www.sncollection.ci`), ajoutez-le dans Settings → Pages → "Custom domain", puis configurez un enregistrement CNAME chez votre registrar pointant vers `VOTRE-UTILISATEUR.github.io`.

Chaque fois que vous modifiez un fichier (ex : `js/config.js`), il suffit de refaire :
```
git add .
git commit -m "Mise à jour"
git push
```

**Les modifications de contenu (produits, textes, prix...) ne nécessitent elles aucun `git push`** : elles se font uniquement dans le Google Sheet et apparaissent automatiquement sur le site.

---

## 6. Personnalisation rapide

- **Couleurs / polices** : tout est centralisé en haut du fichier `css/style.css` (section `:root`).
- **Logo / favicon** : remplacez les fichiers dans `assets/` (`logo.png`, `favicon-32.png`, `apple-touch-icon.png`) en gardant les mêmes noms.
- **Numéro WhatsApp de commande** : à modifier dans l'onglet *Parametres* du Google Sheet (clé `whatsapp`), pas dans le code.

---

## 7. Limites à connaître

- Le **panier** et la **commande** fonctionnent via WhatsApp (pas de paiement en ligne intégré), cohérent avec un fonctionnement "paiement à la livraison".
- La page **Mon compte** est une interface prête à l'emploi mais sans connexion réelle à une base de données (GitHub Pages ne permet pas d'hébergement de compte utilisateur). Si vous avez besoin de comptes clients réels, il faudra ajouter un service tiers (ex : Firebase).
- Le **formulaire de contact** confirme l'envoi à l'écran ; pour recevoir réellement les messages par e-mail, vous pouvez le brancher à un service gratuit comme [Formspree](https://formspree.io) (quelques lignes à ajouter dans `js/pages/contact.js`) — dites-le-moi si vous voulez que je l'intègre.

---

Besoin d'aide pour une étape (Google Sheet, GitHub, nom de domaine) ? Revenez avec la question précise et je vous guide.
