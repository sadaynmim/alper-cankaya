# Alper Çankaya — The Archive

Independent, unofficial fan archive. The editor uses English only in [Pages CMS](https://app.pagescms.org); site visitors can select English or Turkish.

## Free English → Turkish translations

The `.github/workflows/translate-to-turkish.yml` workflow uses **Argos Translate** (open source) on the standard GitHub Actions runner for this public repository, with no paid API and no billing account.

- Edit the English texts in `content/bio.json`, `content/works/*.json` and `content/news/*.json` using Pages CMS.
- The action installs the free offline English → Turkish model when new or modified texts need translation.
- `scripts/generate-translations.py` writes the translated texts to `content/translations.tr.json`.
- An automatic commit triggers the site's normal Netlify deployment.
- Unchanged content is read from the translation cache. Existing manually entered Turkish text remains available as a fallback until it has a cached translation.
- Open GitHub → Actions → **Translate English to Turkish (free, offline)** to check the latest translation run or start it manually.

Translation quality is machine-generated, so review important names and quotations. There is no Google Cloud Translation API requirement, subscription, or secret.

## Other website content

- Filmography has a **Character photo** field for each role.
- Gallery supports photo credit and source links.
- The display design, layout and Netlify build setup are unchanged.
- Build: `npm run build`, publish directory: `dist`.

This independent fan site is not affiliated with the actor or his representatives.
