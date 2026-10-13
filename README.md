# Alper Çankaya — The Archive

Site fan indépendant. Pages CMS : anglais uniquement. Visiteurs : anglais et turc.

La biographie, les actualités et les descriptions de filmographie sont rédigées une seule fois en anglais dans Pages CMS. Les photos des personnages peuvent être ajoutées dans la filmographie.

Traduction turque automatique : GitHub Actions génère les traductions des textes nouveaux ou modifiés, les enregistre dans content/translations.tr.json puis déclenche le déploiement Netlify habituel.

À configurer une fois : activer Cloud Translation API (Basic/v2) et la facturation dans Google Cloud, créer une clé limitée à cette API, puis enregistrer celle-ci dans GitHub > Settings > Secrets and variables > Actions, sous le nom GOOGLE_CLOUD_TRANSLATE_API_KEY. Ne jamais l'ajouter au dépôt ni à un message. Lancer ensuite Actions > Auto-translate English content to Turkish > Run workflow.

Avant la configuration de la clé, les textes turcs existants restent visibles. Les nouveaux textes peuvent s'afficher en anglais dans la version turque jusqu'à l'activation.

Build Netlify : npm run build, dossier dist. Le site est indépendant de l'acteur et de ses représentants.
