#!/usr/bin/env python3
"""V356 — impedir interface antiga no boot Android/Windows sob imagem lenta e script ausente."""
import os,shutil,time
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for name,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   context=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=context.new_page()
   def slow_image(route):
    time.sleep(12)
    route.continue_()
   page.route('**/cartas/CAP_001_*.png',slow_image)
   page.goto(BASE+'/index.html',wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function("""() => document.body?.dataset.ctUiBoot==='premium'""",timeout=10000)
   ui=page.evaluate("""() => {
    const q=(s)=>document.querySelector(s);
    const css=[...document.querySelectorAll('head link[rel=stylesheet]')];
    const n=f=>css.filter(x=>(x.getAttribute('href')||'').split('?')[0]===f).length;
    const backup=q('#ct356-static-shell');
    const proof=q('#ct356-boot-proof');
    return {
      ready:document.readyState,boot:document.body.dataset.ctUiBoot,
      proof:proof?.innerText||'',proofStatus:proof?.dataset.status,
      links:q('.scout-v189-quick')?.querySelectorAll('a').length||0,
      backupHidden:backup?.hidden===true,
      oldLinksHidden:q('.hero-text>.hero-actions')
        ?getComputedStyle(q('.hero-text>.hero-actions')).display==='none':false,
      cssCount:Object.fromEntries(['scout-ui-v189.css','craque-design-v230.css',
       'craque-experience-v232.css','craque-visual-system-v234.css'].map(x=>[x,n(x)])),
      scripts:[...document.scripts].filter(x=>x.src.endsWith('/scout-ui-v189.js')).length,
      overflow:document.documentElement.scrollWidth-innerWidth,
      cards:document.querySelectorAll('.player-card').length
    };
   }""")
   assert ui['boot']=='premium' and ui['proofStatus']=='premium',(name,ui)
   assert ui['ready']!='complete',(name,'Esperou imagem lenta em vez do DOM',ui)
   assert ui['links']==4 and ui['backupHidden'],(name,'Navegação Premium ausente',ui)
   assert ui['oldLinksHidden'],(name,'Links legados sobrepostos',ui)
   assert ui['scripts']==1,(name,'Scripts V189 duplicados',ui)
   assert all(n==1 for n in ui['cssCount'].values()),(name,'CSS Premium duplicado',ui)
   assert ui['overflow']<=3 and ui['cards']==246,(name,'Regressão catálogo',ui)
   assert 'Premium ativo' in ui['proof'] and 'v1.1.' in ui['proof'],(name,'Sem prova de versão',ui)
   page.close();context.close()
  # Se o JS de navegação falha, a tela antiga nunca deve voltar a ser a
  # única entrada. O acesso Premium estático de quatro ações permanece útil.
  ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  page=ctx.new_page()
  page.route('**/scout-ui-v189.js',lambda route:route.abort())
  page.goto(BASE+'/index.html',wait_until='domcontentloaded',timeout=45000)
  page.wait_for_function("document.body?.dataset.ctUiBoot==='fallback'",timeout=15000)
  state=page.evaluate("""() => ({
   entries:[...document.querySelectorAll('#ct356-static-shell a')].map(a=>a.getAttribute('href')),
   visible:getComputedStyle(document.querySelector('#ct356-static-shell')).display,
   legacy:getComputedStyle(document.querySelector('.hero-text>.hero-actions')).display,
   proof:document.querySelector('#ct356-boot-proof')?.innerText,
   cards:document.querySelectorAll('.player-card').length,
   overflow:document.documentElement.scrollWidth-innerWidth
  })""")
  assert len(state['entries'])==4 and state['visible']=='grid',state
  assert state['legacy']=='none' and state['cards']==246,state
  assert 'Premium em recuperação' in state['proof'],state
  assert state['overflow']<=3,state
  ctx.close()
 finally:browser.close()
print('V356 CHROMIUM PASS: 246 cartas preservadas, entrada Premium sem esperar imagens, CSS/JS únicos, contingência Android utilizável.')
