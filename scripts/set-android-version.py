#!/usr/bin/env python3
"""VersionCode monotonic based on GitHub's run_number; no sensitive input."""
from pathlib import Path
import re,sys
if len(sys.argv)!=3: raise SystemExit('Uso: set-android-version.py RUN_NUMBER VERSION_NAME')
number=int(sys.argv[1]); name=sys.argv[2]
if not 0<number<2000000000: raise SystemExit('versionCode fora do limite')
if not re.fullmatch(r'\d+\.\d+\.\d+',name): raise SystemExit('versionName inválido')
p=Path('android/app/build.gradle')
s=p.read_text()
s,c=re.subn(r'\bversionCode\s+\d+', f'versionCode {number}', s,count=1)
if c!=1: raise SystemExit('Falta versionCode no arquivo do Capacitor')
s,c=re.subn(r'\bversionName\s+[\"\'][^\"\']+[\"\']', f'versionName "{name}"', s,count=1)
if c!=1: raise SystemExit('Falta versionName no arquivo do Capacitor')
p.write_text(s)
print(f'Android configurado: versionCode={number} versionName={name}')
