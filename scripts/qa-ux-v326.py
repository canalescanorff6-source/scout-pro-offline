#!/usr/bin/env python3
"""V326 — UX real: home clara, uma ficha principal e comparação recolhível."""
from pathlib import Path
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path('artifacts/visual-qa');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,
  executable_path=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable'),
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
     is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/index.html',wait_until='domcontentloaded')
   page.locator('#ct326-home-head').wait_for(timeout=25000)
   links=page.locator('.scout-v189-quick a.ct326-home-action')
   assert links.count()==3,'Página inicial deve mostrar três ações principais'
   assert [links.nth(i).get_attribute('href') for i in range(3)]==[
    '#catalogo','meu-time-duas-formacoes-v177.html','outros-elencos-v227.html']
   assert page.locator('body').evaluate("(e)=>e.classList.contains('ct326-catalog')")
   page.screenshot(path=str(OUT/f'v326_{label}_inicio.png'),full_page=False,animations='disabled')
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
   choice=page.locator('#ct326-choice')
   try:choice.wait_for(timeout=17000)
   except Exception as exc:
    info=page.evaluate("""() => ({
      page:document.body?.dataset?.page,
      ready:document.readyState,
      hero:!!document.querySelector('#scout-v220-hero'),
      card:!!document.querySelector('#scout-v188-principal'),
      raw:!!document.querySelector('#scout-v68-data'),
      ux:!!window.CRAQUE_UX_V326,
      script:[...document.scripts].filter(s=>s.src.includes('v326')).map(s=>s.src),
      home:!!document.querySelector('#ct326-home-head'),
      choice:!!document.querySelector('#ct326-choice')
    })""")
    raise AssertionError(f"V326 orientador ausente: {info}; page errors: {errors}") from exc
   assert 'Como usar esta carta?' in choice.inner_text()
   assert 'treino registrado' in choice.inner_text().lower() or 'comprovad' in choice.inner_text().lower()
   fold=page.locator('#ct326-comparisons')
   fold.wait_for(timeout=35000)
   assert not fold.evaluate("(e)=>e.open"),'As simulações devem iniciar fechadas'
   assert page.locator('#scout-v220-training #scout-v208-training').count()==1
   assert page.locator('#scout-v220-recs').count()==1
   choice.get_by_role('button',name='Comparar outras fichas').click()
   assert fold.evaluate("(e)=>e.open"),'Botão comparar deve abrir as alternativas reais'
   fold.locator('.ct311-controls .ct311-select').wait_for(timeout=20000)
   assert 'Posição original' in fold.inner_text()
   page.locator('#scout-v220-tabs [data-tactic="rapido"]').click()
   page.wait_for_function("""() => document.querySelector('#ct326-choice-selected')?.textContent?.includes('Simulação')""",timeout=12000)
   assert 'automaticamente' in page.locator('#ct326-choice-explain').inner_text()
   page.screenshot(path=str(OUT/f'v326_{label}_carta.png'),full_page=False,animations='disabled')
   page.goto(BASE+'/outros-elencos-v227.html?colecao=bruno-santos-cd',wait_until='domcontentloaded')
   page.locator('.friends-card .friends-analysis-action').first.click(timeout=25000)
   ext=page.locator('#ct326-external-comparisons');ext.wait_for(timeout=22000)
   assert not ext.evaluate("(e)=>e.open"),'Outros Elencos deve iniciar com treino principal, sem várias fichas'
   assert 'Uma carta, uma orientação principal' in page.locator('.ct326-friend-note').inner_text()
   ext.locator('summary').first.click()
   ext.locator('.ct311-controls .ct311-select').wait_for(timeout=16000)
   assert not errors,errors
   ctx.close()
 finally:
  browser.close()
print('V326 QA PASS: 3 entradas, orientação única, comparação real opcional, Android/Windows e Outros Elencos.')
