"""Editor individual real, somente em perfis descartáveis do navegador."""
import os, json, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/card-info-editor')); OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.getenv('SCOUT_CHROME') or shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,768)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},service_workers='block')
   page=ctx.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
   page.locator('.ct378-main-sheet').wait_for(timeout=30000)
   editor=page.locator('.ct-card-info-editor')
   editor.get_by_role('button',name='EDITAR INFORMAÇÕES DA CARTA',exact=True).wait_for(timeout=5000)
   assert editor.is_visible(), 'Editor deve estar fora das ferramentas recolhidas'
   editor.get_by_role('button',name='EDITAR INFORMAÇÕES DA CARTA',exact=True).click()
   assert editor.get_by_label('Nível máximo da carta',exact=True).input_value()=='32'
   assert editor.get_by_label('Pontos de Progresso (PP)',exact=True).input_value()=='62'
   assert editor.get_by_label('Raridade da carta',exact=True).input_value()
   original=page.evaluate('JSON.parse(document.getElementById("scout-v68-data").textContent)')
   # Independent PP changes cannot silently retrain or increase an OVR target.
   editor.get_by_label('Nível máximo da carta',exact=True).fill('34')
   editor.get_by_label('Pontos de Progresso (PP)',exact=True).fill('66')
   editor.get_by_label('Raridade da carta',exact=True).fill('BIG TIME')
   editor.get_by_label('Overall máximo da carta (informativo)',exact=True).fill('108')
   editor.get_by_role('button',name='Salvar alterações',exact=True).click()
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.textContent.includes("66")')
   assert '66 PP' in editor.inner_text()
   assert page.locator('#lab-budget').text_content().endswith(' / 66'), 'Laboratório deve acompanhar o orçamento sem redistribuir treino'
   assert page.locator('.mobile-profile div > div[style]').first.text_content()=='BIG TIME'
   assert page.evaluate('JSON.parse(document.getElementById("scout-v68-data").textContent)')==original
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   editor.scroll_into_view_if_needed();page.screenshot(path=str(OUT/(str(width)+'-editor.png')))
   page.goto(BASE+'/index.html',wait_until='domcontentloaded')
   page.wait_for_function('()=>window.CRAQUE_REFERENCES_V376')
   tile=page.locator('.player-card[data-cap="1"]')
   assert tile.locator('.pp').inner_text()=='66 PP'
   assert tile.locator('.mini-rarity').inner_text()=='BIG TIME'
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
   page.reload(wait_until='domcontentloaded')
   editor=page.locator('.ct-card-info-editor');editor.wait_for(timeout=30000)
   assert '108' in editor.inner_text()
   editor.get_by_role('button',name='EDITAR INFORMAÇÕES DA CARTA',exact=True).click()
   assert editor.get_by_label('Pontos de Progresso (PP)',exact=True).input_value()=='66'
   editor.get_by_role('button',name='Restaurar valores anteriores',exact=True).click()
   assert '62 PP' in editor.inner_text()
   assert page.locator('#lab-budget').text_content().endswith(' / 62')
   editor.get_by_label('Pontos de Progresso (PP)',exact=True).fill('1')
   editor.get_by_role('button',name='Salvar alterações',exact=True).click()
   assert page.locator('#lab-budget').text_content()=='Sem orçamento'
   assert 'incompatíveis' in editor.inner_text()
   editor.get_by_role('button',name='Restaurar valores anteriores',exact=True).click()
   assert page.locator('#lab-budget').text_content().endswith(' / 62')
   # A real owned-card dialog must also expose the editor and refresh its sheet.
   page.goto(BASE+'/index.html?owned=ct364-01',wait_until='domcontentloaded')
   page.locator('#ct364-dialog[open]').wait_for(timeout=30000)
   editor=page.locator('#ct364-dialog .ct-card-info-editor');editor.wait_for(timeout=30000)
   editor.get_by_role('button',name='EDITAR INFORMAÇÕES DA CARTA',exact=True).click()
   editor.get_by_label('Nível máximo da carta',exact=True).fill('31')
   editor.get_by_label('Pontos de Progresso (PP)',exact=True).fill('60')
   editor.get_by_label('Raridade da carta',exact=True).fill('DISTINGUIDO')
   editor.get_by_role('button',name='Salvar alterações',exact=True).click()
   page.wait_for_function('()=>document.querySelector("#ct364-dialog .ct378-main-sheet")?.textContent.includes("60")')
   assert '60 PP' in editor.inner_text()
   assert not errors, errors
   ctx.close()
  print('Editor UI PASS: 320/390/1366, originais e próprias, atualização imediata, reinício, restauração e identidade.')
 finally: browser.close()
