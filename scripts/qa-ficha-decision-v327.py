#!/usr/bin/env python3
"""V327 — evidência visual da comparação de cinco estilos no mesmo Card ID.
Duas resoluções, dois acervos. Mudança de PRÉVIA sem aplicar PP ou skills.
"""
import os,shutil
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   context=browser.new_context(viewport={'width':width,'height':height},
       is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=context.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V327 Cinco Estilos')
   page.locator('#friend-card-edition').fill('Teste visual de edição')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=25000)
   # V336: justificar candidatos no mesmo painel sem alterar a ficha.
   reasons=root.locator('.ct336-equipment-evidence')
   assert reasons.count()==1
   assert not reasons.evaluate('(node)=>node.open'), 'Justificativas devem iniciar recolhidas'
   reasons.locator('summary').click()
   assert reasons.evaluate('(node)=>node.open')
   assert 'não validação em gameplay' in reasons.inner_text()
   assert 'Ímpeto adicional' in reasons.inner_text()
   reasons.locator('summary').click()
   assert 'Por que esta ficha' in root.inner_text() or root.locator('.ct327-why').count()==1
   assert 'Proposta contextual para avaliar' in root.inner_text() or 'Ficha pendente' in root.inner_text()
   assert not root.locator('.ct327-style-panel').is_visible()
   reveal(root.locator('.ct326-secondary-action'))
   root.locator('.ct326-secondary-action').click()
   five=root.locator('.ct327-style-row')
   assert five.count()==5, 'Cinco propostas de estilo devem existir'
   # V337: o comparador compartilha o custo marginal real nos dois acervos.
   assert 'PP utilizados' in five.first.inner_text(), (
       'Exibir gasto e orçamento do treino, não somente níveis')
   assert 'custo' in root.locator('.ct327-style-note').inner_text().lower(), (
       'Diferença de PP não equivale a ganho competitivo comprovado')
   assert five.filter(has_text='SELECIONADO').count()==1
   assert 'superioridade' in root.locator('.ct327-style-note').inner_text().lower() or 'eleger' in root.locator('.ct327-style-note').inner_text().lower()
   before=page.evaluate("""() => ({
     snapshots:localStorage.getItem('scoutpro:v311:position-scenarios'),
     profiles:Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v324:manager-profile:'))
   })""")
   root.locator('.ct327-style-row[data-style="rapido"] .ct327-style-activate').click()
   page.wait_for_function("""() => document.querySelector('#friend-analysis-modes [data-style="rapido"]')?.getAttribute('aria-pressed')==='true'""",timeout=20000)
   assert 'RAPIDO' in root.locator('.ct326-kicker').inner_text()
   assert root.locator('.ct327-style-panel').is_visible()
   assert root.locator('.ct327-style-row[data-current="true"]').get_attribute('data-style')=='rapido'
   root.locator('.ct331-role-open').click()
   root.locator('.ct311-controls .ct311-select').select_option('SA')
   assert ' SA · RAPIDO' in root.locator('.ct326-kicker').inner_text()
   root.locator('.ct311-controls .ct311-select').select_option('MAT')
   assert ' MAT · RAPIDO' in root.locator('.ct326-kicker').inner_text()
   after=page.evaluate("""() => ({
     snapshots:localStorage.getItem('scoutpro:v311:position-scenarios'),
     profiles:Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v324:manager-profile:'))
   })""")
   assert before==after,'Comparar estilos não pode salvar builds/rascunhos automaticamente'
   # O mesmo motor em Minhas Cartas, sem recomputar uma build da edição.
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded',timeout=40000)
   personal=page.locator('.ct311-main-slot .ct311-positional')
   personal.wait_for(timeout=35000)
   # Mesmo mecanismo explicativo em Minhas Cartas.
   original_reasons=personal.locator('.ct336-equipment-evidence')
   assert original_reasons.count()==1
   assert not original_reasons.evaluate('(node)=>node.open')
   reveal(original_reasons.locator('summary'))
   original_reasons.locator('summary').click()
   assert 'Ímpeto adicional' in original_reasons.inner_text()
   reveal(original_reasons.locator('summary'))
   original_reasons.locator('summary').click()
   assert personal.locator('.ct327-why').count()==1
   reveal(personal.locator('.ct326-secondary-action'))
   personal.locator('.ct326-secondary-action').click()
   assert personal.locator('.ct327-style-row').count()==5
   assert 'PP utilizados' in personal.locator('.ct327-style-row').first.inner_text()
   personal.locator('.ct327-style-row[data-style="normal"] .ct327-style-activate').click()
   page.wait_for_function("""() => document.querySelector('#scout-v220-hero .scout-v220-tab[data-tactic="normal"]')?.getAttribute('aria-pressed')==='true'""",timeout=25000)
   assert 'NORMAL' in personal.locator('.ct326-kicker').inner_text()
   assert not [error for error in errors if error!='Scout PRO: carta sem estilo para filtro #1'],errors
   overflow=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert overflow<=3,platform+' overflow='+str(overflow)
   context.close()
 finally:
  browser.close()
print('V327 CHROMIUM PASS: cinco estilos, botão real, MAT-SA-MAT, sem salvar treinos; dois acervos e duas resoluções.')
