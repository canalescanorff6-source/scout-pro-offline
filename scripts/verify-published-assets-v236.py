#!/usr/bin/env python3
"""Craque Tático V236 — auditoria somente leitura de assets já publicados.

Confere bytes baixados do GitHub: APK, SHA256, assinatura/identidade Android,
manifesto de atualização Windows, SHA512 do instalador e paridade de versão.
Não altera releases, chaves, cartas ou atualizadores.
"""
from __future__ import annotations

import argparse
import base64
import binascii
import hashlib
import re
import subprocess
from pathlib import Path

APP_ID = "br.com.scoutpro.offline"
CERT_SHA256 = "818a2b4144234810b9e6e68bddb1ccb1cf9f3b6636dcc0adc31536a4fec02c04"
ANDROID_PROVIDER = "br.com.scoutpro.offline.ScoutUpdateFileProvider"
ANDROID_AUTHORITY = "br.com.scoutpro.offline.scoutupdate.files"


def ensure(ok: bool, message: str) -> None:
    if not ok:
        raise ValueError(message)


def digest(path: Path, algorithm: str) -> bytes:
    h = hashlib.new(algorithm)
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.digest()


def execute(*args: str) -> str:
    out = subprocess.run(args, text=True, stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE, check=False)
    ensure(out.returncode == 0, f"Ferramenta falhou: {args[0]} (status {out.returncode})")
    return out.stdout


def verify(root: Path, tag: str, aapt: str, apksigner: str) -> None:
    match = re.fullmatch(r"v(\d+\.\d+\.(\d+))", tag)
    ensure(match is not None, "Tag inválida: esperado vMAJOR.MINOR.PATCH")
    version, code = match.group(1), match.group(2)
    apk = root / "ScoutPRO-Android.apk"
    checksum = root / "ScoutPRO-Android.apk.sha256"
    exe = root / f"ScoutPRO-Setup-{version}.exe"
    blockmap = root / f"ScoutPRO-Setup-{version}.exe.blockmap"
    yml = root / "latest.yml"
    for file in (apk, checksum, exe, blockmap, yml):
        ensure(file.is_file() and file.stat().st_size > 0,
               f"Asset ausente ou vazio: {file.name}")
    ensure(apk.stat().st_size > 100_000, "APK anormalmente pequeno")
    ensure(exe.stat().st_size > 100_000, "EXE anormalmente pequeno")

    # Arquivo SHA256 deve citar exatamente o APK, sem caminhos alternativos.
    checkline = checksum.read_text(encoding="utf-8").strip()
    checkmatch = re.fullmatch(r"([a-fA-F0-9]{64})\s+\*?ScoutPRO-Android\.apk", checkline)
    ensure(checkmatch is not None, "SHA256 do APK em formato inesperado")
    ensure(checkmatch.group(1).lower() == digest(apk, "sha256").hex(),
           "SHA256 não corresponde ao APK publicado")

    badging = execute(aapt, "dump", "badging", str(apk))
    identity = re.search(
        r"package:\s+name='([^']+)'\s+versionCode='([^']+)'\s+versionName='([^']+)'",
        badging)
    ensure(identity is not None, "Android: identidade do pacote ausente")
    ensure(identity.group(1) == APP_ID, "Android: applicationId diferente")
    ensure(identity.group(2) == code, "Android: versionCode não coincide com tag")
    ensure(identity.group(3) == version, "Android: versionName não coincide com tag")

    manifest = execute(aapt, "dump", "xmltree", str(apk), "AndroidManifest.xml")
    ensure(ANDROID_PROVIDER in manifest and ANDROID_AUTHORITY in manifest,
           "Android: FileProvider do atualizador ausente")

    proof = execute(apksigner, "verify", "--verbose", "--print-certs", str(apk))
    certificate_lines = [
        line.split("digest:", 1)[1].strip().replace(":", "").lower()
        for line in proof.splitlines()
        if "certificate SHA-256 digest:" in line
    ]
    ensure(CERT_SHA256 in certificate_lines, "Certificado Android não corresponde à identidade permanente V99")

    # Confere o instalador REAL contra o SHA512 que o Electron Updater distribui.
    metadata = yml.read_text(encoding="utf-8-sig")
    declared_version = re.search(r"^version:\s*(\S+)\s*$", metadata, flags=re.M)
    ensure(declared_version is not None and declared_version.group(1) == version,
           "Windows: version em latest.yml divergente")
    declared_path = re.search(r"^path:\s*(\S+)\s*$", metadata, flags=re.M)
    ensure(declared_path is not None and declared_path.group(1).strip('"\'') == exe.name,
           "Windows: latest.yml aponta para instalador incorreto")
    declared_hashes = re.findall(r"^\s*sha512:\s*(\S+)\s*$", metadata, flags=re.M)
    ensure(bool(declared_hashes), "Windows: falta sha512 no manifesto")
    actual_hash = digest(exe, "sha512")
    for value in declared_hashes:
        try:
            decoded = base64.b64decode(value, validate=True)
        except binascii.Error as e:
            raise ValueError("Windows: SHA512 inválido no manifesto") from e
        ensure(decoded == actual_hash, "Windows: SHA512 do EXE não corresponde ao manifesto")
    ensure(exe.name in metadata, "Windows: EXE não referenciado no manifesto")

    print(f"PASSOU: release {tag}; Android {APP_ID} com certificado V99, "
          "APK SHA256, FileProvider, versão Android/Windows, EXE SHA512 e blockmap.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", type=Path, required=True, help="Pasta dos assets da release")
    parser.add_argument("--tag", required=True, help="Tag exata, exemplo: v1.1.409")
    parser.add_argument("--aapt", required=True, help="Caminho do aapt do Android SDK")
    parser.add_argument("--apksigner", required=True, help="Caminho do apksigner do Android SDK")
    args = parser.parse_args()
    try:
        verify(args.dir, args.tag, args.aapt, args.apksigner)
    except (ValueError, FileNotFoundError, OSError) as e:
        print(f"FALHA DE AUDITORIA V236: {e}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
