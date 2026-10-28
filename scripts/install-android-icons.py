from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
target=root/'android/app/src/main/res'
src=root/'resources/android'
assert target.is_dir(), 'Execute primeiro npx cap add android'
for path in src.glob('mipmap-*/*.png'):
    dest=target/path.parent.name/path.name;dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(path,dest)
dest=target/'drawable-nodpi/scout_foreground.png';dest.parent.mkdir(parents=True,exist_ok=True)
foreground=src/'scout_foreground.png'
if not foreground.is_file():
    foreground=root/'web/assets/icon-512.png'
if not foreground.is_file():
    raise FileNotFoundError('Ícone Android ausente: resources/android/scout_foreground.png ou web/assets/icon-512.png')
shutil.copy2(foreground,dest)
for p in (target/'mipmap-anydpi-v26').glob('ic_launcher*.xml'):
    s=p.read_text()
    import re
    s=re.sub(r'<foreground android:drawable="[^"]+"\s*/>', '<foreground android:drawable="@drawable/scout_foreground"/>', s)
    p.write_text(s)
print('Ícones Android instalados nas variantes de densidade.');
