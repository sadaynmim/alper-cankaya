# Alper Çankaya — The Archive

Site fan non officiel, version préparatoire, direction artistique noir et blanc validée.

## Installation
1. Importer tous les fichiers de ce dossier dans un nouveau dépôt GitHub (branche `main`).
2. Sur Netlify : Add new project > Import an existing project > GitHub > sélectionner ce dépôt.
3. Netlify utilisera `npm run build` et publiera `dist` (voir `netlify.toml`).
4. Sur https://app.pagescms.org, se connecter avec GitHub, autoriser le dépôt, le sélectionner. Le fichier `.pages.yml` propose Filmographie, Galerie, Biographie et Actualité.
5. Chaque enregistrement dans Pages CMS crée un commit GitHub puis déclenche une nouvelle publication Netlify.

## Modifier des contenus
- `content/works/`: une fiche JSON par film/série, descriptions par langue.
- `content/gallery/`: une photo par fichier JSON, crédit et lien de source. Seules les quatre premières photos sont visibles sur la page d'accueil actuelle.
- `content/bio.json`: deux paragraphes de biographie dans quatre langues (les champs vides reprennent le contenu d'origine).
- `content/news.json`: actualité mise en avant (les champs vides reprennent le contenu d'origine).
- `media/`: fichiers téléversés par Pages CMS.

## Important avant une sortie publique
Cette première version est une **maquette fonctionnelle avec contenu administrable**, pas une archive complète. Certains portraits sont référencés par URLs tierces : vérifier le droit de les reproduire avant de publier, ou les remplacer par des photos autorisées. Les traductions restent à relire. Le site ne génère pas encore de pages séparées SEO pour chaque film et chaque langue ; les nouvelles entrées s'affichent dans la grille et dans une modale. Les vidéos sont encore dans la maquette et non administrables via le CMS. Les sources d'actualité sont encore intégrées dans la maquette.

## Tester en local
Exécuter `npm run build` puis servir le dossier `dist/` avec un serveur HTTP local.
