#!/usr/bin/env python3
"""V351 — primeira pintura Premium sem flash HTML legado sob CSS atrasado."""
import os,shutil,time
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for name,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   def delay_css(route):
    time.sleep(0.8)
    route.continue_()
   page.route('**/craque-visual-system-v234.css',delay_css)
   page.goto(BASE+'/index.html',wait_until='commit',timeout=30000)
   splash=page.locator('#ct-v351-boot-cover')
   splash.wait_for(state='visible',timeout=18000)
   early=page.evaluate("""() => ({
    boot:document.documentElement.classList.contains('ct-v351-boot'),
    visible:getComputedStyle(document.getElementById('ct-v351-boot-cover')).display,
    inner:(document.getElementById('ct-v351-boot-cover').innerText||'')
   })""")
   assert early['boot'],early
   assert early['visible']=='flex',early
   assert 'Preparando sua interface Premium' in early['inner'],early
   page.wait_for_function("""() =>
    document.body?.dataset.ctUiBoot === 'premium'""",timeout=30000)
   assert not splash.is_visible(), 'A tela de inicialização precisa desaparecer'
   assert page.locator('.scout-v189-home').is_visible()
   assert page.locator('.scout-v189-tile').count()==4
   assert not page.locator('.hero-actions').is_visible()
   assert page.locator('.player-card').count()==246
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   page.locator('.scout-v189-tile').first.click()
   assert page.evaluate('document.body.dataset.ctUiBoot')=='premium'
   ctx.close()
 finally:browser.close()
print('V351 CHROMIUM PASS: primeira pintura protegida, CSS final atrasado, Premium estável em Android/Windows, 246 cartas preservadas.')
