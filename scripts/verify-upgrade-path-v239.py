#!/usr/bin/env python3
"""V239: audita transição entre DOIS APKs publicados, sem instalar ou publicar.

Este teste prova a compatibilidade de identidade/assinatura/versionCode dos
pacotes e coerência dos manifestos Windows. Não prova restauração de dados
em dispositivo, permissões concedidas ou atualização real em Android/Windows.
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
APK = "ScoutPRO-Android.apk"
APK_SHA = "ScoutPRO-Android.apk.sha256"


def require(value: bool, reason: str) -> None:
    if not value:
        raise ValueError(reason)


def tag_version(tag: str) -> tuple[int, int, int]:
    match = re.fullmatch(r"v(\d+)\.(\d+)\.(\d+)", tag)
    require(match is not None, "Tag inválida: use vMAJOR.MINOR.PATCH")
    return tuple(map(int, match.groups()))


def command(*args: str) -> str:
    proc = subprocess.run(args, check=False, capture_output=True, text=True)
    require(proc.returncode == 0, f"Falha da ferramenta {args[0]} (status {proc.returncode})")
    return proc.stdout


def sha256_file(file: Path) -> str:
    digest = hashlib.sha256()
    with file.open("rb") as stream:
        for part in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(part)
    return digest.hexdigest()


def android_release(folder: Path, tag: str, aapt: str, apksigner: str) -> dict:
    apk = folder / APK
    checksums = folder / APK_SHA
    require(apk.is_file() and apk.stat().st_size > 0, f"{tag}: APK ausente ou vazio")
    require(checksums.is_file(), f"{tag}: checksum do APK ausente")
    declared = checksums.read_text(encoding="utf-8").strip()
    check = re.fullmatch(r"([0-9A-Fa-f]{64})\s+\*?ScoutPRO-Android\.apk", declared)
    require(check is not None, f"{tag}: checksum malformado")
    require(sha256_file(apk) == check.group(1).lower(), f"{tag}: APK diferente do SHA256 publicado")

    meta = command(aapt, "dump", "badging", str(apk))
    pkg = re.search(
        r"package:\s+name='([^']+)'\s+versionCode='(\d+)'\s+versionName='([^']+)'",
        meta,
    )
    require(pkg is not None, f"{tag}: não foi possível identificar pacote e versão Android")
    name, code, version_name = pkg.groups()
    require(name == APP_ID, f"{tag}: packageId diferente — instalação por cima proibida")
    require(version_name == tag.removeprefix("v"), f"{tag}: versionName diferente da release")
    require(int(code) == tag_version(tag)[2], f"{tag}: versionCode divergente")

    proof = command(apksigner, "verify", "--verbose", "--print-certs", str(apk))
    # Mesmo parser já validado pela auditoria V236. Versões recentes do
    # apksigner podem exibir mais de uma linha de certificado (ex.: lineage).
    signer_lines = [
        line.split("digest:", 1)[1].strip().replace(":", "").lower()
        for line in proof.splitlines()
        if "certificate SHA-256 digest:" in line
    ]
    signer_set = frozenset(signer_lines)
    require(bool(signer_set) and CERT_SHA256 in signer_set,
            f"{tag}: certificado Android incompatível com a assinatura oficial V99")
    return {"package": name, "code": int(code), "certs": signer_set}


def windows_release(folder: Path, tag: str) -> dict:
    path = folder / "latest.yml"
    require(path.is_file(), f"{tag}: latest.yml ausente")
    content = path.read_text(encoding="utf-8-sig")
    expected = tag.removeprefix("v")
    version = re.search(r"^version:\s*['\"]?([0-9.]+)['\"]?\s*$", content, re.M)
    require(version is not None and version.group(1) == expected,
            f"{tag}: versão divergente no manifesto Windows")
    executable = f"ScoutPRO-Setup-{expected}.exe"
    actual = re.search(r"^path:\s*['\"]?([^'\"\r\n]+)['\"]?\s*$", content, re.M)
    require(actual is not None and actual.group(1) == executable,
            f"{tag}: latest.yml aponta para EXE incorreto")
    require(re.search(r"^\s*-\s+url:\s*['\"]?" + re.escape(executable) + r"['\"]?\s*$",
                      content, re.M) is not None,
            f"{tag}: Windows não lista o EXE nos arquivos do updater")
    hashes = re.findall(r"^\s*sha512:\s*['\"]?([A-Za-z0-9+/=]+)['\"]?\s*$", content, re.M)
    require(bool(hashes), f"{tag}: SHA512 ausente no manifesto Windows")
    decoded = []
    for value in hashes:
        try:
            raw = base64.b64decode(value, validate=True)
        except binascii.Error as error:
            raise ValueError(f"{tag}: SHA512 inválido") from error
        require(len(raw) == 64, f"{tag}: tamanho incorreto de SHA512")
        decoded.append(raw)
    require(len(set(decoded)) == 1, f"{tag}: hashes SHA512 divergentes no manifesto")
    return {"sha512": decoded[0], "version": tag_version(tag), "exe": executable}


def verify(previous_dir: Path, previous_tag: str,
           latest_dir: Path, latest_tag: str, aapt: str, apksigner: str) -> None:
    old_version, new_version = tag_version(previous_tag), tag_version(latest_tag)
    require(new_version > old_version, "Novo lançamento não é posterior ao anterior")
    old_android = android_release(previous_dir, previous_tag, aapt, apksigner)
    new_android = android_release(latest_dir, latest_tag, aapt, apksigner)
    require(new_android["code"] > old_android["code"], "Android: downgrade ou versionCode repetido")
    require(new_android["package"] == old_android["package"] == APP_ID,
            "Android: packageId alterado, atualização por cima incompatível")
    require(new_android["certs"] == old_android["certs"],
            "Android: certificados assinantes diferentes entre versões")
    old_windows = windows_release(previous_dir, previous_tag)
    new_windows = windows_release(latest_dir, latest_tag)
    require(new_windows["version"] > old_windows["version"],
            "Windows: versão nova não supera versão anterior")
    require(new_windows["sha512"] != old_windows["sha512"],
            "Windows: manifesto parece reutilizar o mesmo instalador")
    print(f"V239 PASSOU: {previous_tag} -> {latest_tag}; APKs oficiais verificados, "
          f"assinatura igual, versionCode {old_android['code']} -> {new_android['code']}, "
          "identidade Android fixa e manifestos de atualização Windows coerentes.")
    print("ATENÇÃO: teste de atualização/backup em aparelho real ainda é necessário.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--previous-dir", type=Path, required=True)
    parser.add_argument("--previous-tag", required=True)
    parser.add_argument("--latest-dir", type=Path, required=True)
    parser.add_argument("--latest-tag", required=True)
    parser.add_argument("--aapt", required=True)
    parser.add_argument("--apksigner", required=True)
    args = parser.parse_args()
    try:
        verify(args.previous_dir, args.previous_tag, args.latest_dir,
               args.latest_tag, args.aapt, args.apksigner)
    except (ValueError, FileNotFoundError, OSError) as error:
        print(f"V239 FALHOU: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
