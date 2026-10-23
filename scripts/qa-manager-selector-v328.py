#!/usr/bin/env python3
"""V328: selector real, busca sem acento, favoritos compartilhados e isolamento por carta.
Executar em Chromium nos viewports Android/Windows, sem mudar as 246 cartas originais.
"""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},
     is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V328 QA técnico')
   page.locator('#friend-card-edition').fill('Edição de teste')
   page.locator('#friend-card-gameid').fill('V328-ID-TEMP')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   page.locator('#friend-manager-search').wait_for(timeout=30000)
   page.wait_for_function("""() => !!document.querySelector('#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   select=page.locator('#friend-manager-version')
   search=page.locator('#friend-manager-search')
   scope=page.locator('#friend-manager-scope')
   select.select_option('CT-MGR-071')
   assert select.input_value()=='CT-MGR-071'
   assert 'Kovač' in page.locator('#friend-manager-status').inner_text()
   search.fill('Kovac')
   assert 'CT-MGR-071' in [option.get_attribute('value') for option in select.locator('option').all()]
   assert select.input_value()=='CT-MGR-071'
   fav=page.locator('.friend-manager-v328-fav')
   fav.click()
   assert fav.get_attribute('aria-pressed')=='true'
   assert 'CT-MGR-071' in page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v307:manager-favorites'))""")
   # Mesmo oculto pelo filtro/pesquisa, o técnico vinculado permanece selecionado.
   search.fill('Klopp')
   assert select.input_value()=='CT-MGR-071'
   assert select.locator('option[value="CT-MGR-071"]').count()==1
   assert select.locator('option[value="CT-MGR-001"]').count()==1
   scope.select_option('favorites')
   assert select.input_value()=='CT-MGR-071'
   scope.select_option('all')
   select.select_option('CT-MGR-001')
   assert select.input_value()=='CT-MGR-001'
   assert 'Klopp' in page.locator('#friend-manager-status').inner_text()
   fav.click()
   assert 'CT-MGR-001' in page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v307:manager-favorites'))""")
   before=page.evaluate("""() => ({
      profiles:Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v324:manager-profile:')),
      revisions:Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v311:')),
      saved:Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v306:manager:'))
     })""")
   assert before['profiles']==[], 'O seletor não pode aprovar treinamentos por conta própria'
   assert len(before['saved'])==1,'Uma carta, uma escolha individual de técnico'
   # O técnico é salvo por carta, e não pelo estado da busca/favoritos.
   page.locator('#friend-analysis-close').click()
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('Outra carta V328')
   page.locator('#friend-card-edition').fill('Outra edição V328')
   page.locator('#friend-card-gameid').fill('V328-ID-OUTRA')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   page.locator('#friend-manager-version').wait_for(timeout=15000)
   assert page.locator('#friend-manager-version').input_value()=='', 'Outra carta não pode herdar o técnico do teste anterior'
   assert not errors,errors
   overflow=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert overflow<=3,f'{label}: overflow horizontal {overflow}px'
   ctx.close()
 finally:
  browser.close()
print('V328 CHROMIUM PASS: busca, favoritos, seleção preservada, separação por Card ID, Android e Windows.')
