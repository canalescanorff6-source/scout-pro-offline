#!/usr/bin/env python3
"""V362: aparência nova precisa ser observável em cada módulo, não só no código.
Sem screenshot comparativo cego nem alteração de dados salvos.
"""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
ART=Path('artifacts/visual-qa/v362');ART.mkdir(parents=True,exist_ok=True)
ROUTES=[
 ('home','index.html','catalog'),
 ('friends','outros-elencos-v227.html','friends'),
 ('team','meu-time-duas-formacoes-v177.html','team'),
 ('lab','meu-time-testes-v219.html','rotation-lab'),
 ('managers','tecnicos-v307.html','manager-hub'),
 ('progress','conferir-progresso-v248.html','progress-audit'),
 ('rarities','raridade-cadastro-v91.html','rarity-audit'),
 ('batch8','lote-8-conferencia.html','batch-8'),
 ('batch9','lote-9-cadastro.html','batch-9'),
 ('detail','fichas/001_Daniele_Massaro.html','detail')
]
with sync_playwright() as p:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=p.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for mode,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page()
   for label,path,kind in ROUTES:
    page.goto(BASE+'/'+path,wait_until='domcontentloaded',timeout=60000)
    page.locator('#ct362-design-proof').wait_for(state='attached',timeout=24000)
    assert page.locator('body.ct362-design').count()==1,(mode,label,'shell ausente')
    surface=page.evaluate("""() => {
     const tag=document.getElementById('ct362-design-proof');
     const body=document.body;
     return {loaded:body.dataset.ct362Ui,
       version:tag?.textContent||'', background:getComputedStyle(body).backgroundColor,
       overflow:document.documentElement.scrollWidth-innerWidth,
       nav:document.querySelectorAll('#ct362-appnav > a.ct362-navitem').length}
    }""")
    assert surface['loaded']=='true' and 'V362' in surface['version'],(mode,label,surface)
    assert surface['overflow']<=12,(mode,label,'overflow',surface)
    if kind in ('friends','team','manager-hub','rotation-lab'):
     assert surface['nav']==4,(mode,label,'navegação unificada ausente',surface)
    if kind=='friends':
     legacy=page.locator('#scout-app-bar')
     legacy.wait_for(state='attached',timeout=15000)
     assert not legacy.is_visible(),(mode,'barra antiga duplicada sobre navegação V362')
     more=page.locator('#ct362-appnav .ct362-navmore')
     more.click()
     assert page.locator('body.ct362-options-open').count()==1
     if mobile:assert legacy.is_visible(),(mode,'controles antigos ficaram inacessíveis no Mais')
     more.click()
     assert not legacy.is_visible()
    if kind=='catalog':
     page.locator('.scout-v189-quick a').first.wait_for(timeout=20000)
     assert page.locator('#cards .player-card').count()==246
     assert page.locator('.scout-v189-quick a').count()==4
     assert 'SEM COMPLICAÇÃO' in page.locator('.hero h1').inner_text()
     color=page.locator('.hero').evaluate("(e)=>getComputedStyle(e).backgroundColor")
     assert color not in ('rgba(0, 0, 0, 0)','transparent'),(mode,label,'hero velho',color)
    if kind=='detail':
     page.locator('#ct361-player-glance').wait_for(state='attached',timeout=20000)
     page.locator('#scout-v220-tabs button').first.wait_for(timeout=20000)
     assert page.locator('.ct361-glance-name').inner_text()=='Daniele Massaro'
     assert page.locator('.ct361-glance-art img').get_attribute('src')==page.locator('.mobile-profile img').get_attribute('src')
     assert page.locator('#scout-v220-training').count()==1
     assert page.locator('#scout-v220-recs').count()==1
     assert page.locator('#scout-v220-hero .scout-v220-practice').count()==1
     coach=page.locator('details.ct-manager-v302')
     coach.wait_for(state='attached',timeout=15000)
     assert coach.evaluate("(e)=>getComputedStyle(e).backgroundColor")=='rgb(19, 31, 48)',(mode,'seletor de técnico com visual antigo')
     if mobile:
      assert page.locator('.scout-v220-head').evaluate("(e)=>getComputedStyle(e).display=='none'"),'Cabeçalho V220 antigo ainda duplicado'
    if label in ('home','friends','managers','detail'):
     page.screenshot(path=str(ART/(mode+'-'+label+'.png')),full_page=False)
   ctx.close()
  print('V362 VISUAL PASS: 10 rotas x 2 resoluções, 246 cartas, menu, ficha e estilos globais ativos.')
 finally:
  browser.close()
