#!/usr/bin/env python3
"""V352 — paridade visual Premium nas três telas internas, mobile/desktop."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
CASES=[
 ('friends','outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
  '.friends-panel','.friends-primary'),
 ('team','meu-time-duas-formacoes-v177.html','.panel','.formation-button'),
 ('manager-hub','tecnicos-v307.html','.hub-card','.hub-btn')
]
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   for kind,url,card,button in CASES:
    page=ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/'+url,wait_until='domcontentloaded',timeout=40000)
    page.locator(card).first.wait_for(timeout=35000)
    page.wait_for_function("""() =>
     document.querySelectorAll('link[data-ct352-final="true"]').length === 1 &&
     Array.from(document.styleSheets).some(s => s.href?.includes('craque-premium-interiors-v352.css'))""",timeout=35000)
    style=page.locator(card).first.evaluate("""e=>({
     bg:getComputedStyle(e).backgroundImage,
     border:getComputedStyle(e).borderColor,
     radius:getComputedStyle(e).borderRadius
    })""")
    assert 'rgb(22, 41, 66)' in style['bg'],kind+': visual legado prevaleceu '+str(style)
    assert style['border']!='rgb(0, 0, 0)',kind+': borda perdida '+str(style)
    assert page.locator(button).count()>0,kind+': ação perdida'
    assert page.evaluate("""() => document.documentElement.scrollWidth-innerWidth""")<=3,(platform,kind,'overflow')
    if kind in ('friends','team'):
     order=page.evaluate("""() => {
      const styles=Array.from(document.querySelectorAll('head link[rel="stylesheet"]'));
      return {
       final:styles.findIndex(e=>e.href.includes('craque-premium-interiors-v352.css')),
       legacy:styles.findIndex(e=>e.href.includes('craque-visual-system-v234.css')),
       total:styles.filter(e=>e.href.includes('craque-premium-interiors-v352.css')).length
      };
     }""")
     assert order['total']==1 and order['final']>order['legacy'],(kind,order)
    if kind=='friends':
     page.locator('#friend-new-card').click()
     modal=page.locator('#friend-card-dialog')
     assert modal.is_visible()
     assert 'rgb(22, 41, 66)' in modal.evaluate(
      'e=>getComputedStyle(e).backgroundImage')
     page.locator('#friend-dialog-cancel').click()
     assert not modal.is_visible()
     assert page.locator('#friend-people').count()==1
    elif kind=='team':
     assert page.locator('#pitch').count()==1
     assert page.locator('#bench').count()==1
     page.locator('#formation-pick [data-formation="4213"]').click()
     assert page.locator('#formation-pick [data-formation="4213"]').count()==1
     assert page.locator('#pitch').is_visible()
    else:
     page.wait_for_function("document.querySelectorAll('.hub-card').length>=23",timeout=30000)
     page.locator('.hub-v329-other-scores > summary').first.click()
     assert page.locator('.hub-v329-other-scores').first.evaluate('(e)=>e.open')
     page.locator('#hub-search').fill('Klopp')
     page.wait_for_timeout(200)
     assert page.locator('.hub-card').count()>0
    known='Scout PRO: carta sem estilo para filtro #1'
    assert not [x for x in errors if x!=known],(platform,kind,errors)
    page.close()
   ctx.close()
 finally:browser.close()
print('V352 CHROMIUM PASS: 3 telas Premium, menus e modais intactos, prioridade CSS e mobile/desktop sem overflow.')
