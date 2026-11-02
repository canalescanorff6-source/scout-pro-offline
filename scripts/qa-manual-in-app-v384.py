"""App menu -> bundled guide -> offline feints -> native home; disposable browser profiles."""
import hashlib,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal
R=Path(__file__).resolve().parents[1];BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v384'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for w,h in [(320,740),(390,844),(1366,900)]:
   ctx=b.new_context(viewport={'width':w,'height':h},accept_downloads=True);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(BASE+'/index.html');p.wait_for_selector('#ct382-accounts',state='attached');menu=p.locator('#scout-app-bar .scout-v189-dock-more > summary');reveal(menu);menu.click()
   p.locator('#ct382-accounts a[href$="manual-2027/index.html#fintas"]').click();p.wait_for_selector('.feint-card')
   assert '/manual-2027/index.html' in p.url;assert p.locator('.feint-card').count()==13
   assert p.locator('#chapter-list button').count()==18
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.locator('#feint-search').fill('CHÁLEIRA');assert p.locator('.feint-card').count()==1
   p.locator('#feint-search').fill('double touch');p.locator('[data-feint-facing="left"]').click();assert 'frente ←' in p.locator('.feint-card ol').inner_text()
   p.locator('#feint-search').fill('');p.locator('#feint-group').select_option('Recepção');assert p.locator('.feint-card').count()==2
   p.locator('#feint-group').select_option('')
   p.locator('#hero-diagram img').scroll_into_view_if_needed();p.locator('#hero-diagram img').evaluate('(img)=>img.decode()')
   p.locator('#mark-read').click();assert '1 de 18' in p.locator('#progress-label').inner_text()
   with p.expect_download() as download:p.locator('.hero-actions a[download]').click()
   path=OUT/f'manual-{w}.pdf';download.value.save_as(path)
   assert hashlib.sha256(path.read_bytes()).digest()==hashlib.sha256((R/'web/manual-2027/manual-2027.pdf').read_bytes()).digest()
   with p.expect_download() as download:p.locator('#export-state').click()
   download.value.save_as(OUT/f'progress-{w}.json')
   p.locator('#fintas').scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'feints-{w}.png'))
   p.locator('.return-app').click();p.wait_for_selector('#ct382-accounts',state='attached')
   assert '/index.html' in p.url and '/manual-2027/' not in p.url
   if w==1366:
    # Native packages are offline by construction; the HTTPS-only PWA worker is explicitly registered on this localhost QA origin.
    p.evaluate('()=>navigator.serviceWorker.register("/sw.js")');p.wait_for_function('navigator.serviceWorker.controller!==null');ctx.set_offline(True)
    p.goto(BASE+'/manual-2027/index.html#fintas');p.wait_for_selector('.feint-card');assert p.locator('.feint-card').count()==13
    assert '1 de 18' in p.locator('#progress-label').inner_text()
    image=p.locator('#hero-diagram img');image.scroll_into_view_if_needed();image.evaluate('(img)=>img.decode()')
   assert not errors,errors
   ctx.close()
 finally:b.close()
print('V384 QA PASS:menu Mais,manual18capítulos,13fintas,PDF/JSON,retorno,3telas eoffline.')
