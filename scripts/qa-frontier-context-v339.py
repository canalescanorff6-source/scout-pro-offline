#!/usr/bin/env python3
"""V339 — Chromium real: Pareto V251 a partir do contexto V324 em 2 acervos."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
SNAP="""() => JSON.stringify(Object.keys(localStorage)
 .filter(k=>k.startsWith('scoutpro:v324:manager-profile:') ||
            k.startsWith('scoutpro:v311:position-scenarios'))
 .sort().map(k=>[k,localStorage.getItem(k)]))"""
with sync_playwright() as pw:
 executable=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=executable,
   args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for kind,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   # Outros Elencos recebe a API V251 como motor puro, sem observador de ficha pessoal.
   page.goto(BASE+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
     wait_until='domcontentloaded',timeout=40000)
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V339 Pareto Contextual')
   page.locator('#friend-card-edition').fill('Edição de teste V339')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('32')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   page.locator('#friend-manager-version').wait_for(timeout=30000)
   page.wait_for_function("""() => !!document.querySelector(
      '#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   ext=page.locator('#friend-analysis-dialog .ct311-positional')
   ext.wait_for(timeout=25000)
   ext.locator('.ct326-primary-action').click()
   panel=ext.locator('.ct339-frontier')
   assert panel.count()==1
   assert not panel.evaluate('(node)=>node.open')
   saved=page.evaluate(SNAP)
   panel.locator('summary').click()
   page.wait_for_function("""() => document.querySelector(
      '#friend-analysis-dialog .ct339-frontier')?.dataset.ready==='true'""",timeout=15000)
   assert panel.locator('.ct339-candidate option').count()>=1
   assert 'PP utilizados' in panel.inner_text()
   assert 'índices relativos' in panel.inner_text()
   assert panel.locator('.ct339-cost-table tbody tr').count()==7
   choices=panel.locator('.ct339-candidate')
   if choices.locator('option').count()>1:
    choices.select_option(index=1)
    assert 'PP livres' in panel.locator('.ct311-budget').inner_text()
   assert page.evaluate(SNAP)==saved,'Comparação externa NÃO pode gravar PP'
   # Minhas Cartas: mesmo motor, sem herdar rascunho do acervo externo.
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded',timeout=40000)
   page.locator('#ct-manager-select').wait_for(timeout=35000)
   page.wait_for_function("""() => !!document.querySelector(
      '#ct-manager-select option[value="CT-MGR-071"]')""",timeout=35000)
   page.locator('#ct-manager-select').select_option('CT-MGR-071')
   personal=page.locator('.ct311-main-slot .ct311-positional')
   personal.wait_for(timeout=35000)
   personal.locator('.ct326-primary-action').click()
   own=personal.locator('.ct339-frontier')
   assert own.count()==1
   saved=page.evaluate(SNAP)
   own.locator('summary').click()
   page.wait_for_function("""() => document.querySelector(
      '.ct311-main-slot .ct339-frontier')?.dataset.ready==='true'""",timeout=15000)
   assert own.locator('.ct339-candidate option').count()>0
   assert 'PP utilizados' in own.inner_text()
   assert own.locator('.ct339-cost-table tbody tr').count()==7
   assert page.evaluate(SNAP)==saved,'Comparação pessoal NÃO pode gravar PP'
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   over=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert over<=3,f'{kind}: overflow horizontal de {over}px'
   ctx.close()
 finally:
  browser.close()
print('V339 CHROMIUM PASS: Pareto V324-V251 nos 2 acervos, Android/Windows, somente leitura.')
