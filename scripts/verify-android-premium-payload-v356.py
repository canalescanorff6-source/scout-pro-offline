#!/usr/bin/env python3
"""V356: prove the compiled APK embeds the intended Premium interface bytes.

Call after Gradle compile, never before packaging. This verifies the APK
itself, not only GitHub source, fingerprints or aapt versionName.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRITICAL = (
    "index.html",
    "app-bridge.js",
    "craque-ui-bootstrap-v351.js",
    "scout-ui-v189.js",
    "scout-ui-v189.css",
    "craque-visual-rebuild-v361.js",
    "craque-visual-rebuild-v361.css",
    "craque-app-shell-v362.js",
    "craque-app-shell-v362.css",
    "outros-elencos-v227.html",
    "craque-friends-page-v227.js",
    "craque-friends-focus-v363.css",
    "ct364-owned-main.js",
    "ct364-owned-main.css",
    "ct364-owned-cards.json",
    "craque-design-v230.css",
    "craque-experience-v232.css",
    "craque-visual-system-v234.css",
    "scout-build-info.json",
)
REQUIRED_MARKERS = {
    "index.html": (
        'data-ct356-entry="premium-home"',
        'data-ct356-core="v189"',
        'data-ct356-core="v230"',
        'data-ct356-core="v232"',
        'data-ct356-core="v234"',
        'id="ct356-static-shell"',
        'id="ct356-boot-proof"',
        'data-ct361-final="true"',
        'data-ct362-design="true"',
        'data-ct364-owned="true"',
    ),
    "app-bridge.js": (
        'script[data-ct356-entry="premium-home"]',
        'link[data-ct356-core="v234"]',
        'craque-visual-rebuild-v361.css',
        'craque-visual-rebuild-v361.js',
        'craque-app-shell-v362.js',
        'craque-app-shell-v362.css',
    ),
    "craque-ui-bootstrap-v351.js": (
        "DOMContentLoaded",
        "scout-build-info.json",
        "ct356-boot-proof",
    ),
    "outros-elencos-v227.html": (
        'id="ct363-readiness"',
        'data-ct363-friends="true"',
        'id="ct363-filter-count"',
    ),
    "craque-friends-page-v227.js": (
        "ct363Readiness='all'",
        "ct363Readiness==='ready'",
        "ct363Readiness==='pending'",
    ),
    "craque-friends-focus-v363.css": (
        'friends-columns>.friends-main',
        'ct363-readiness',
    ),
    "ct364-owned-main.js": (
        "ct364-owned-cards.json",
        "ct364-owned-section",
        "CRAQUE_FRIEND_TRAINING_V228",
        "scoutpro:v364:owned-confirmed",
    ),
    "ct364-owned-main.css": (
        "ct364-owned-section",
        "ct364-dialog",
    ),
    "ct364-owned-cards.json": (
        '"schema": "craque-owned-cards-v364"',
        '"additions": 15',
    ),
    "craque-app-shell-v362.js": (
        'ct362-design-proof',
        'ct362-appnav',
        'ct362-design',
    ),
    "craque-app-shell-v362.css": (
        'body.ct362-design',
        'scout-v220-hero',
        'ct362-appnav',
    ),
    "craque-visual-rebuild-v361.js": (
        'ct361-player-glance',
        'ct361-glance-stats',
        'options.insertBefore(update,options.firstChild)',
    ),
    "craque-visual-rebuild-v361.css": (
        '.ct361-player-glance',
        'ct361-detail-ready',
        'ct361-dock-ready',
    ),
    "scout-ui-v189.js": (
        "ct356-static-shell",
        "scout-v189-home",
    ),
}


def verify(apk_path: Path, web_dir: Path) -> dict:
    if not apk_path.is_file() or apk_path.stat().st_size == 0:
        raise ValueError("APK ausente ou vazio: " + str(apk_path))
    if not zipfile.is_zipfile(apk_path):
        raise ValueError("O APK não é um ZIP válido")
    compared = {}
    with zipfile.ZipFile(apk_path, "r") as apk:
        names = set(apk.namelist())
        for name in CRITICAL:
            zip_name = "assets/public/" + name
            source_path = web_dir / name
            if zip_name not in names:
                raise ValueError("APK SEM ARQUIVO PREMIUM: " + zip_name)
            if not source_path.is_file():
                raise ValueError("Arquivo web de referência ausente: " + str(source_path))
            packaged = apk.read(zip_name)
            original = source_path.read_bytes()
            if packaged != original:
                raise ValueError("APK CONTÉM ARQUIVO DIFERENTE do build: " + name)
            decoded = packaged.decode("utf-8-sig")
            for marker in REQUIRED_MARKERS.get(name, ()):
                if marker not in decoded:
                    raise ValueError("Entrada Premium V356 ausente em " + name + ": " + marker)
            compared[name] = hashlib.sha256(packaged).hexdigest()
        # V364: validar os 15 WebP REAIS individualmente, não só HTML/JS.
        manifest = json.loads(apk.read("assets/public/ct364-owned-cards.json"))
        if manifest.get("schema") != "craque-owned-cards-v364" or len(manifest.get("cards", [])) != 15:
            raise ValueError("15 cartas próprias V364 ausentes no APK")
        if len({c.get("key") for c in manifest["cards"]}) != 15:
            raise ValueError("V364 contém identidades duplicadas")
        for card in manifest["cards"]:
            name = card.get("image")
            if not isinstance(name, str) or not name.startswith("cartas/novas/ct364_") or not name.endswith(".webp"):
                raise ValueError("Caminho de arte própria inválido")
            zip_name = "assets/public/" + name
            source_path = web_dir / name
            if zip_name not in names or not source_path.is_file():
                raise ValueError("Arte V364 não empacotada: " + name)
            if apk.read(zip_name) != source_path.read_bytes():
                raise ValueError("Arte V364 divergente da fonte: " + name)
            compared[name] = hashlib.sha256(apk.read(zip_name)).hexdigest()
        metadata = json.loads(apk.read("assets/public/scout-build-info.json"))
        if metadata.get("schema") != "scout_v189_shared_web_bundle":
            raise ValueError("Metadados da versão Android inválidos")
        if metadata.get("mobile_web_container") != "Capacitor webDir=web":
            raise ValueError("O APK não declara o mesmo código web da release")
        if "assets/public/SCOUT_V69_AUDITORIA.json" in names:
            data = json.loads(apk.read("assets/public/SCOUT_V69_AUDITORIA.json"))
            if len(data.get("cards", [])) != 246:
                raise ValueError("APK não contém as 246 cartas originais")
        else:
            raise ValueError("Arquivo de auditoria 246 ausente no APK")
    return {"apk": str(apk_path), "verified_files": len(compared),
            "version": metadata.get("version"),
            "revision": metadata.get("git_revision"),
            "hashes": compared}


def self_test() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        web = root / "web"
        web.mkdir()
        entries = {}
        for name in CRITICAL:
            content = (json.dumps({
                "schema": "scout_v189_shared_web_bundle",
                "mobile_web_container": "Capacitor webDir=web",
                "version": "1.1.1004", "git_revision": "test"
            }) if name == "scout-build-info.json"
            else "\n".join(REQUIRED_MARKERS.get(name, ("arquivo presente",))))
            (web / name).write_text(content, encoding="utf-8")
            entries["assets/public/" + name] = content.encode()
        entries["assets/public/SCOUT_V69_AUDITORIA.json"] = json.dumps(
            {"cards": [{} for _ in range(246)]}).encode()
        apk = root / "test.apk"
        def make_apk():
            with zipfile.ZipFile(apk, "w") as output:
                for name, data in entries.items():
                    output.writestr(name, data)
        make_apk()
        assert verify(apk, web)["verified_files"] == len(CRITICAL)
        entries.pop("assets/public/scout-ui-v189.js")
        make_apk()
        try:
            verify(apk, web)
            raise AssertionError("Missing Premium JavaScript was not detected")
        except ValueError as exc:
            assert "SEM ARQUIVO PREMIUM" in str(exc), exc
        entries["assets/public/scout-ui-v189.js"] = b"wrong script"
        make_apk()
        try:
            verify(apk, web)
            raise AssertionError("Stale bundled script was not detected")
        except ValueError as exc:
            assert "ARQUIVO DIFERENTE" in str(exc), exc
    print("V356 APK PACKAGING PASS: arquivos presentes, ausentes e divergentes detectados corretamente.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("apk", nargs="?", help="Caminho do APK compilado")
    parser.add_argument("--web-dir", default=str(ROOT / "web"))
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    elif not args.apk:
        parser.error("Informe o APK ou use --self-test")
    else:
        try:
            result = verify(Path(args.apk), Path(args.web_dir))
            print("V356 APK PREMIUM CONFIRMADO:", result["verified_files"],
                  "arquivos idênticos no APK e web/; versão:", result["version"],
                  "revisão:", result["revision"])
        except (ValueError, zipfile.BadZipFile, UnicodeError, json.JSONDecodeError) as exc:
            print("BLOQUEADO: " + str(exc), file=sys.stderr)
            sys.exit(1)
