#!/usr/bin/env python3
"""V328: busca/edições, favoritos, seis proficiências recolhidas nos 2 acervos.
QA Chromium em viewport Android e Windows; nunca aplica PP ou ímpetos.
"""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'artifacts'/'visual-qa';OUT.mkdir(parents=True,exist_ok=True)
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 binary=shutil.which('google-chrome') or shutil.which('google-chrome-stable') or shutil.which('chromium')
 browser=pw.chromium.launch(headless=True,executable_path=binary,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,
    has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/tecnicos-v307.html',wait_until='domcontentloaded')
   cards=page.locator('.hub-card')
   page.wait_for_function("document.querySelectorAll('.hub-card').length===23",timeout=30000)
   first=cards.first
   assert first.locator('.hub-v328-preview').is_visible()
   assert 'Posse de Bola' in first.locator('.hub-v328-preview').inner_text()
   assert '90' in first.locator('.hub-v328-preview').inner_text()
   assert not first.locator('.hub-v328-scores').evaluate('(e)=>e.open')
   assert first.locator('.hub-score').count()==6
   assert not first.locator('.hub-score').first.is_visible()
   first.locator('.hub-v328-scores>summary').click()
   assert first.locator('.hub-score').first.is_visible()
   # Recurso antigo de favorito é promovido à navegação rápida, sem criar
   # nova estrutura paralela nem misturar proprietário.
   first.locator('.hub-actions .hub-btn').nth(1).click()
   page.locator('#hub-v328-presets button[data-scope="favorites"]').click()
   assert cards.count()==1
   assert page.locator('#hub-scope').input_value()=='favorites'
   cards.first.locator('.hub-actions .hub-btn').nth(1).click()
   assert cards.count()==0
   page.locator('#hub-v328-presets button[data-scope="featured"]').click()
   assert cards.count()==23
   page.locator('#hub-search').fill('klopp')
   assert cards.count()==2
   assert cards.first.locator('.hub-v328-versions').count()==1
   cards.first.locator('.hub-v328-versions').click()
   assert page.locator('#hub-scope').input_value()=='all'
   assert cards.count()==2
   ids=[c.locator('.hub-sub').inner_text().split('CT-MGR-')[-1] for c in cards.all()]
   assert len(set(ids))==2,'Não fundir versões de Klopp'
   page.locator('#hub-style').select_option('rapido')
   assert cards.count()==2
   assert 'Contra-Ataque Rápido' in cards.first.locator('.hub-v328-preview').inner_text()
   page.screenshot(path=str(OUT/('v328_'+label+'_central.png')),full_page=False,animations='disabled')
   # Outros Elencos: pesquisar sem alterar ficha escolhida.
   page.goto(BASE+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
    wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('Pesquisa V328')
   page.locator('#friend-card-edition').fill('Edição teste')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog')
   select=root.locator('#friend-manager-version')
   select.wait_for(timeout=30000)
   page.wait_for_function("document.querySelectorAll('#friend-manager-version option').length>=72",
    timeout=30000)
   search=root.locator('#friend-v328-manager-search')
   search.fill('klopp')
   assert select.locator('option').count()==3,'Duas edições de Klopp mais opção vazia'
   select.select_option('CT-MGR-001')
   assert select.input_value()=='CT-MGR-001'
   status=root.locator('#friend-manager-status')
   assert status.locator('.friend-v328-manager-primary').is_visible()
   assert status.locator('.friend-manager-scores>div').count()==6
   assert not status.locator('.friend-v328-manager-scores').evaluate('(e)=>e.open')
   original_selection=page.evaluate("""() => Object.entries(localStorage).filter(([k])=>
    k.startsWith('scoutpro:v306:manager:')).map(([k,v])=>[k,v])""")
   search.fill('Kovač')
   assert select.input_value()=='CT-MGR-001','Pesquisa não pode trocar edição salva'
   assert select.locator('option[value="CT-MGR-001"]').count()==1
   assert select.locator('option[value="CT-MGR-071"]').count()==1
   after_selection=page.evaluate("""() => Object.entries(localStorage).filter(([k])=>
    k.startsWith('scoutpro:v306:manager:')).map(([k,v])=>[k,v])""")
   assert original_selection==after_selection,'Buscar não pode atualizar ficha do técnico'
   status.locator('.friend-v328-manager-scores>summary').click()
   assert status.locator('.friend-manager-scores>div').first.is_visible()
   # Minhas Cartas: mesmo catálogo e mesmo critério de pesquisa, sem vazar
   # o histórico de Outros Elencos.
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded',timeout=40000)
   main=page.locator('#ct-manager-v302')
   main.wait_for(timeout=30000)
   searchMain=main.locator('#ct-v328-manager-search')
   selection=main.locator('#ct-manager-select')
   searchMain.fill('Klopp')
   options=selection.locator('option')
   assert 3<=options.count()<=4, 'Busca Klopp exibiu opções fora do filtro: '+str(
    options.all_text_contents())
   assert selection.locator('option[value="CT-MGR-001"]').count()==1
   assert selection.locator('option[value="CT-MGR-017"]').count()==1
   selection.select_option('CT-MGR-001')
   assert main.locator('.ct-v328-manager-primary').is_visible()
   assert main.locator('.ct-manager-score').count()==6
   assert not main.locator('.ct-v328-manager-scores').evaluate('(e)=>e.open')
   searchMain.fill('Tuchel')
   assert selection.input_value()=='CT-MGR-001'
   assert selection.locator('option[value="CT-MGR-001"]').count()==1
   assert selection.locator('option[value="CT-MGR-013"]').count()==1
   main.locator('.ct-v328-manager-scores>summary').click()
   assert main.locator('.ct-manager-score').first.is_visible()
   page.screenshot(path=str(OUT/('v328_'+label+'_ficha.png')),full_page=False,animations='disabled')
   assert not errors,'Erros do navegador: '+str(errors)
   overflow=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert overflow<=3,f'Overflow horizontal em {label}: {overflow}px'
   ctx.close()
 finally:
  browser.close()
print('V328 CHROMIUM PASS: 23/71 versões, Kovač 90, 2 Klopp, favoritos, seletor nos dois acervos, seis proficiências preservadas.')
