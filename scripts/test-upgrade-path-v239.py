#!/usr/bin/env python3
"""V239: casos positivos e negativos para a comparação entre APKs de releases."""
from __future__ import annotations

import base64
import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SOURCE = Path(__file__).with_name("verify-upgrade-path-v239.py")
SPEC = importlib.util.spec_from_file_location("craque_v239", SOURCE)
app = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(app)


class UpgradePathTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.old = self.base / "old"
        self.new = self.base / "new"
        self.old.mkdir()
        self.new.mkdir()
        self.meta = {}
        self.make_fixture(self.old, "v1.1.409", 409, b"OLD")
        self.make_fixture(self.new, "v1.1.422", 422, b"NEW")

    def make_fixture(self, folder, tag, code, payload):
        (folder / app.APK).write_bytes(payload)
        (folder / app.APK_SHA).write_text(
            hashlib.sha256(payload).hexdigest() + "  ScoutPRO-Android.apk\n",
            encoding="utf-8")
        version = tag[1:]
        executable = f"ScoutPRO-Setup-{version}.exe"
        digest = base64.b64encode(hashlib.sha512(payload).digest()).decode()
        (folder / "latest.yml").write_text(
            f"version: {version}\nfiles:\n  - url: {executable}\n"
            f"    sha512: {digest}\npath: {executable}\nsha512: {digest}\n",
            encoding="utf-8")
        self.meta[str(folder / app.APK)] = {
            "package": app.APP_ID, "code": code, "version": version,
            "cert": app.CERT_SHA256,
        }

    def fake_command(self, *argv):
        filename = argv[-1]
        profile = self.meta[filename]
        if argv[0] == "aapt":
            return (f"package: name='{profile['package']}' "
                    f"versionCode='{profile['code']}' "
                    f"versionName='{profile['version']}'")
        if argv[0] == "apksigner":
            return (f"Signer #1 certificate SHA-256 digest: {profile['cert']}\n"
                    "Verified using v2 scheme (APK Signature Scheme v2): true")
        self.fail("Comando inesperado: " + repr(argv))

    def verify(self):
        with patch.object(app, "command", side_effect=self.fake_command):
            app.verify(self.old, "v1.1.409", self.new, "v1.1.422", "aapt", "apksigner")

    def test_release_compativel(self):
        self.verify()

    def test_apk_adulterado(self):
        (self.new / app.APK).write_bytes(b"ALTERADO")
        with self.assertRaisesRegex(ValueError, "SHA256"):
            self.verify()

    def test_assinatura_nova_diferente(self):
        self.meta[str(self.new / app.APK)]["cert"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "certificado"):
            self.verify()

    def test_package_id_mudou(self):
        self.meta[str(self.new / app.APK)]["package"] = "org.incorreto.app"
        with self.assertRaisesRegex(ValueError, "packageId"):
            self.verify()

    def test_versioncode_repetido(self):
        self.meta[str(self.new / app.APK)]["code"] = 409
        with self.assertRaisesRegex(ValueError, "versionCode"):
            self.verify()

    def test_manifesto_windows_desatualizado(self):
        p = self.new / "latest.yml"
        p.write_text(p.read_text().replace("version: 1.1.422", "version: 1.1.409"))
        with self.assertRaisesRegex(ValueError, "versão divergente"):
            self.verify()

    def test_windows_mesmo_hash_de_exe(self):
        p = self.new / "latest.yml"
        old = self.old / "latest.yml"
        old_hash = old.read_text().split("sha512: ")[1].split("\n")[0]
        latest_hash = p.read_text().split("sha512: ")[1].split("\n")[0]
        p.write_text(p.read_text().replace(latest_hash, old_hash))
        with self.assertRaisesRegex(ValueError, "mesmo instalador"):
            self.verify()

    def test_downgrade_de_tags(self):
        with patch.object(app, "command", side_effect=self.fake_command):
            with self.assertRaisesRegex(ValueError, "não é posterior"):
                app.verify(self.new, "v1.1.422", self.old, "v1.1.409", "aapt", "apksigner")

    def test_manifesto_exe_errado(self):
        p = self.new / "latest.yml"
        p.write_text(p.read_text().replace(
            "path: ScoutPRO-Setup-1.1.422.exe",
            "path: OutroInstalador.exe"))
        with self.assertRaisesRegex(ValueError, "EXE incorreto"):
            self.verify()

    def test_checksum_formato_rejeitado(self):
        (self.old / app.APK_SHA).write_text("sem checksum")
        with self.assertRaisesRegex(ValueError, "malformado"):
            self.verify()


if __name__ == "__main__":
    unittest.main()
