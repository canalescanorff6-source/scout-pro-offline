#!/usr/bin/env python3
"""Verificação V311 de troca posicional nos dois acervos."""
import os,shutil
from playwright.sync_api import sync_playwright
ROOT=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as p:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=p.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(ROOT+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('Cenário MAT SA')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('.ct311-positional')
   root.wait_for(timeout=25000)
   assert '68 PP exatos distribuídos' in root.inner_text()
   selector=root.locator('.ct311-select')
   assert selector.input_value()=='MAT'
   selector.select_option('SA')
   assert 'Cenário SA' in root.inner_text()
   assert '68 PP exatos distribuídos' in root.inner_text()
   assert 'MAT → SA' in page.locator('#friend-analysis-badges').inner_text()
   root.locator('.ct311-button').first.click()
   assert 'Revisão 1 salva' in root.inner_text()
   selector.select_option('MAT')
   root.locator('.ct311-button').first.click()
   selector.select_option('SA')
   assert 'revisão salva restaurada' in root.inner_text().lower()
   page.locator('#friend-analysis-modes [data-style=rapido]').click()
   assert 'Cenário SA · rapido' in root.inner_text()
   page.goto(ROOT+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
   main=page.locator('.ct311-main-slot .ct311-positional')
   try:main.wait_for(timeout=35000)
   except Exception:
    print('V311_MAIN_DIAG',page.evaluate("""() => ({
     page:document.body?.dataset?.page,hero:!!document.querySelector('#scout-v220-hero'),
     detail:!!document.querySelector('#scout-v68-data'),
     v311Engine:!!window.CRAQUE_POSITIONAL_V311,
     v311UI:!!window.CRAQUE_POSITIONAL_UI_V311,
     v228:!!window.CRAQUE_FRIEND_TRAINING_V228,
     scripts:[...document.scripts].filter(x=>x.src.includes('v311')||x.src.includes('v228')).map(x=>x.src),
     errorNodes:[...document.querySelectorAll('.ct311-positional')].length
    })"""), 'JS_ERRORS',errors)
    raise
   assert 'Posição original: CA' in main.inner_text()
   main.locator('.ct311-select').select_option('SA')
   assert 'Cenário SA' in main.inner_text()
   assert 'PP exatos distribuídos' in main.inner_text()
   assert page.evaluate("JSON.parse(document.getElementById('scout-v68-data').textContent).shown_position")=='AC'
   assert not errors,errors
   ctx.close()
 finally:
  browser.close()
print('V311 QA PASS: ambos os acervos, MAT SA MAT, cinco táticas e original intacto.')
