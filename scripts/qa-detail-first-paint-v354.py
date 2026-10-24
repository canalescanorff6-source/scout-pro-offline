#!/usr/bin/env python3
"""V354 — as 246 fichas usam CSS estático e marca Premium sem tela V72."""
import os,shutil,time
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
CARDS=[
 '001_Daniele_Massaro.html','050_Lionel_Messi.html',
 '120_Rodrigo_Bentancur.html','246_Eric_Cantona.html'
]
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for name,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   for file in CARDS:
    page=ctx.new_page()
    page.route('**/craque-visual-system-v234.css',lambda route:(time.sleep(.6),route.continue_()))
    page.goto(BASE+'/fichas/'+file,wait_until='domcontentloaded',timeout=45000)
    page.wait_for_function("""() =>
     document.querySelector('.topbar .brand-copy b')?.textContent === 'CRAQUE TÁTICO'""",timeout=30000)
    got=page.evaluate("""() => {
     const bar=document.querySelector('.topbar');
     const logo=bar?.querySelector('.brand-logo-img');
     const styles=[...document.styleSheets];
     const body=getComputedStyle(document.body);
     return {name:bar?.querySelector('.brand-copy b')?.textContent,
      subtitle:bar?.querySelector('.brand-copy small')?.textContent,
      icon:logo?.getAttribute('src'),alt:logo?.alt,
      background:body.backgroundImage,
      staticCSS:styles.some(s=>s.href?.includes('app-bridge.css')),
      count:document.querySelectorAll('.topbar .brand-logo-img').length,
      images:document.querySelectorAll('.side-art img').length,
      cardSource:document.querySelector('.side-art img')?.getAttribute('src'),
      overflow:document.documentElement.scrollWidth-innerWidth};
    }""")
    assert got['name']=='CRAQUE TÁTICO',(name,file,got)
    assert got['icon']=='../assets/craque-tatico-icon.svg',(name,file,got)
    assert got['alt']=='Craque Tático'
    assert got['count']==1
    assert got['staticCSS'],(name,file,'CSS de primeira pintura ausente')
    assert 'rgb(7, 14, 26)' in got['background'],(name,file,'tema antigo',got)
    assert got['images']>=1 and got['cardSource'] and got['cardSource'].startswith('../cartas/'),(name,file,'arte não preservada',got)
    assert got['overflow']<=3,(name,file,'rolagem horizontal',got)
    assert page.locator('.side-nav').count()>=1
    assert page.locator('#scout-app-bar').count()==1
    page.close()
   ctx.close()
 finally:browser.close()
print('V354 CHROMIUM PASS: primeira pintura Premium e escudo em fichas reais Android/Windows, artes intactas.')
