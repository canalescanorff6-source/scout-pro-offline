#!/usr/bin/env python3
"""V353 — smoke visual real das ferramentas internas, Android e Windows."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
PAGES=[
 ('progress','conferir-progresso-v248.html','progress-audit','#v248-search'),
 ('rotation','meu-time-testes-v219.html','rotation-lab','#black-save'),
 ('videos','pesquisa-videos-v106.html','video-evidence','#search'),
 ('biotype','player-model-v101.html','player-model','#body-form'),
 ('boosters','revisao-impetos-v103.html','boosters','#save'),
 ('tactics','revisao-tatica-v98.html','tactical-review','#search'),
 ('batch8','lote-8-conferencia.html','batch-8','.grid'),
 ('batch9','lote-9-cadastro.html','batch-9','#form'),
 ('rarity','raridade-cadastro-v91.html','rarity-audit','#form')]
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   for label,route,identity,control in PAGES:
    page=ctx.new_page()
    page.goto(BASE+'/'+route,wait_until='domcontentloaded',timeout=45000)
    page.wait_for_function("""() => {
     const link=document.querySelector('link[data-ct353-final="true"]');
     return link&&link.sheet;
    }""",timeout=30000)
    page.locator(control).first.wait_for(state='attached',timeout=30000)
    result=page.evaluate("""() => {
     const css=Array.from(document.querySelectorAll('head link[rel=stylesheet]'));
     const at=css.findIndex(e=>e.href.includes('craque-premium-workspaces-v353.css'));
     const legacy=css.findIndex(e=>e.href.includes('craque-visual-system-v234.css'));
     const style=getComputedStyle(document.body);
     return {page:document.body.dataset.page,style:style.backgroundImage,
      color:style.color,at,legacy,
      loaded:css.filter(e=>e.href.includes('craque-premium-workspaces-v353.css')).length,
      overflow:document.documentElement.scrollWidth-innerWidth};
    }""")
    assert result['page']==identity,(platform,label,result)
    assert 'rgb(7, 14, 26)' in result['style'],(platform,label,'tema antigo',result)
    assert result['loaded']==1,(platform,label,'CSS duplicado',result)
    assert result['color']=='rgb(233, 238, 247)',(platform,label,'cor',result)
    assert result['overflow']<=3,(platform,label,'overflow',result)
    if result['legacy']>=0:
     assert result['at']>result['legacy'],(platform,label,'CSS antigo venceu',result)
    assert page.locator('main').count()>0,(platform,label,'sem conteúdo')
    if label=='batch9':
     assert page.locator('#save').count()==1
     assert page.locator('#previous').count()==1
    if label=='rarity':
     assert page.locator('#rarity').count()==1
     assert page.locator('#next').count()==1
    page.close()
   page=ctx.new_page()
   page.goto(BASE+'/meu-time-posse-4312.html',wait_until='domcontentloaded',timeout=45000)
   page.locator('#pitch').wait_for(timeout=35000)
   page.wait_for_function("""() =>
    Array.from(document.querySelectorAll('head link[rel=stylesheet]'))
     .some(e=>e.href.includes('craque-premium-interiors-v352.css')&&e.sheet)""",timeout=30000)
   assert page.locator('.panel').count()>=2
   assert page.locator('#bench').count()==1
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=3
   page.close();ctx.close()
 finally:browser.close()
print('V353 CHROMIUM PASS: nove workspaces históricos e formação 4-3-1-2, CSS consistente sem flash, Android/Windows.')
