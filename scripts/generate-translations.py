#!/usr/bin/env python3
"""Translate editable English archive content into Turkish using Argos Translate.
No API key, paid cloud translation, billing account or hosted inference service.
Only changed English strings are translated. The result is checked into Git.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE_PATH = ROOT / "content" / "translations.tr.json"
MODEL_URL = "https://data.argosopentech.com/argospm/v1/translate-en_tr-1_5.argosmodel"


def load_json(path, default=None):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def content_paths():
    paths = [ROOT / "content" / "bio.json", ROOT / "content" / "news.json"]
    for folder in ("works", "news", "awards"):
        paths.extend(sorted((ROOT / "content" / folder).glob("*.json")))
    return [p for p in paths if p.exists()]


def fields_for(path):
    if path.name == "bio.json":
        data = load_json(path, {})
        return sorted((key for key in data if re.fullmatch(r"p\d+_en", key)), key=lambda key: int(key[1:-3]))
    if path.parent.name == "works":
        return ("description_en",)
    if path.parent.name == "awards":
        return ("title_en", "competition_en", "festival_en")
    return ("title_en", "description_en")


def translate_paragraphs(text, engine):
    # Preserve editor's original paragraph boundaries (news items have blank lines).
    chunks = re.split(r"(\n\s*\n)", text)
    return "".join(
        engine.translate(chunk).strip() if chunk.strip() and not chunk.startswith("\n") else chunk
        for chunk in chunks
    ).strip()


def setup_translator():
    import argostranslate.package
    import argostranslate.translate
    installed = argostranslate.translate.get_installed_languages()
    if not any(lang.code == "en" for lang in installed) or not any(lang.code == "tr" for lang in installed):
        print("Downloading official Argos en→tr model (free, no account required)")
        # Prefer the official package index; stable direct model URL is the fallback.
        try:
            argostranslate.package.update_package_index()
            packages = argostranslate.package.get_available_packages()
            match = next(p for p in packages if p.from_code == "en" and p.to_code == "tr")
            model_path = match.download()
        except Exception as exc:
            print(f"Package index unavailable ({exc}); using official model archive")
            import tempfile
            import urllib.request
            model_path = Path(tempfile.gettempdir()) / "translate-en_tr-1_5.argosmodel"
            urllib.request.urlretrieve(MODEL_URL, model_path)
        argostranslate.package.install_from_path(model_path)
    translations = argostranslate.translate.get_installed_languages()
    en = next(lang for lang in translations if lang.code == "en")
    tr = next(lang for lang in translations if lang.code == "tr")
    return en.get_translation(tr)


def main():
    previous = load_json(CACHE_PATH, {"version": 1, "entries": {}}).get("entries", {})
    updated = {}
    missing = []
    for path in content_paths():
        data = load_json(path, {})
        rel = path.relative_to(ROOT).as_posix()
        for field in fields_for(path):
            source = str(data.get(field) or "").strip()
            if not source:
                continue
            key = rel + ":" + field
            old = previous.get(key, {})
            if old.get("source") == source and old.get("translation"):
                updated[key] = old
            else:
                missing.append((key, source))
    print(f"Cached: {len(updated)}; new or changed: {len(missing)}")
    if missing:
        engine = setup_translator()
        for index, (key, source) in enumerate(missing, start=1):
            text = translate_paragraphs(source, engine)
            if not text:
                raise RuntimeError(f"Empty Turkish translation for {key}")
            updated[key] = {"source": source, "translation": text}
            print(f"Translated {index}/{len(missing)}: {key}")
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(
        json.dumps({"version": 1, "entries": updated}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Saved {len(updated)} Turkish translations. No paid API used.")


if __name__ == "__main__":
    main()
