#!/usr/bin/env python3
"""Testes V236: o auditor deve reprovar arquivos inválidos, não apenas aceitar o válido."""
import base64
import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SOURCE = Path(__file__).with_name("verify-published-assets-v236.py")
SPEC = importlib.util.spec_from_file_location("craque_release_audit", SOURCE)
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class ReleaseAuditorTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.apk = self.root / "ScoutPRO-Android.apk"
        self.exe = self.root / "ScoutPRO-Setup-1.1.409.exe"
        self.apk.write_bytes(b"A" * 140000)
        self.exe.write_bytes(b"W" * 145000)
        (self.root / (self.exe.name + ".blockmap")).write_bytes(b"blockmap")
        self.hash_file = self.root / "ScoutPRO-Android.apk.sha256"
        self.yml = self.root / "latest.yml"
        self.refresh()
        self.badging = ("package: name='br.com.scoutpro.offline' "
                        "versionCode='409' versionName='1.1.409'")
        self.manifest = ("E: provider android:name='br.com.scoutpro.offline.ScoutUpdateFileProvider'\n"
                         "A: authorities='br.com.scoutpro.offline.scoutupdate.files'")
        self.certificate = audit.CERT_SHA256

    def refresh(self):
        self.hash_file.write_text(
            hashlib.sha256(self.apk.read_bytes()).hexdigest()
            + "  ScoutPRO-Android.apk\n", encoding="utf-8")
        sha = base64.b64encode(hashlib.sha512(self.exe.read_bytes()).digest()).decode()
        self.yml.write_text(
            "version: 1.1.409\n"
            "files:\n"
            f"  - url: {self.exe.name}\n"
            f"    sha512: {sha}\n"
            f"path: {self.exe.name}\n"
            f"sha512: {sha}\n", encoding="utf-8")

    def mock_command(self, *args):
        if args[:3] == ("aapt", "dump", "badging"):
            return self.badging
        if args[:3] == ("aapt", "dump", "xmltree"):
            return self.manifest
        if args[:3] == ("apksigner", "verify", "--verbose"):
            return f"Signer #1 certificate SHA-256 digest: {self.certificate}"
        self.fail("Comando inesperado: " + repr(args))

    def verify(self):
        with patch.object(audit, "execute", side_effect=self.mock_command):
            audit.verify(self.root, "v1.1.409", "aapt", "apksigner")

    def test_release_valida(self):
        self.verify()

    def test_sha256_adulterado(self):
        self.apk.write_bytes(self.apk.read_bytes() + b"alteracao")
        with self.assertRaisesRegex(ValueError, "SHA256"):
            self.verify()

    def test_certificado_diferente(self):
        self.certificate = "0" * 64
        with self.assertRaisesRegex(ValueError, "Certificado"):
            self.verify()

    def test_windows_exe_divergente(self):
        self.exe.write_bytes(self.exe.read_bytes() + b"alteracao")
        with self.assertRaisesRegex(ValueError, "SHA512"):
            self.verify()

    def test_versioncode_incorreto(self):
        self.badging = self.badging.replace("versionCode='409'", "versionCode='407'")
        with self.assertRaisesRegex(ValueError, "versionCode"):
            self.verify()

    def test_atualizador_ausente(self):
        self.manifest = "E: activity"
        with self.assertRaisesRegex(ValueError, "FileProvider"):
            self.verify()

    def test_blockmap_ausente(self):
        (self.root / (self.exe.name + ".blockmap")).unlink()
        with self.assertRaisesRegex(ValueError, "Asset ausente"):
            self.verify()

    def test_sha512_yaml_falsificado(self):
        self.yml.write_text(self.yml.read_text().replace(
            "version: 1.1.409", "version: 1.1.407"), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "latest.yml divergente"):
            self.verify()


if __name__ == "__main__":
    unittest.main()
