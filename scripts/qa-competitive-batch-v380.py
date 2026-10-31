"""Revisão por edição no navegador, em perfis descartáveis."""
import json, os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v380'));OUT.mkdir(parents=True,exist_ok=True)
cards=json.loads((ROOT/'web/SCOUT_V69_AUDITORIA.json').read_text(encoding='utf-8'))['cards']
caps=[1,2,4,5,6,8,9,10,11,14,24,47,208]
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 try:
  for width,height,selected in [(390,844,caps),(320,700,[1,11,47,208]),(1366,768,[1,11,47,208])]:
   ctx=browser.new_context(viewport={'width':width,'height':height});page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   for cap in selected:
    c=next(c for c in cards if c['numero']==cap)
    page.goto(BASE+'/'+c['arquivo'],wait_until='domcontentloaded')
    page.wait_for_function('()=>document.querySelector(".ct378-main-sheet .ct380-evidence")',timeout=30000)
    sheet=page.locator('.ct378-main-sheet')
    assert sheet.get_attribute('data-source')=='proposal'
    assert sheet.locator('.ct311-budget').inner_text().startswith(str(c['pp'])+' / '+str(c['pp']))
    assert sheet.locator('.ct374-skill-reasons > li').count()<=5
    if cap in [6,11,14,24,47,208]:assert sheet.locator('.ct375-booster').count()==0
    sheet.locator('.ct380-evidence > summary').click()
    assert sheet.locator('.ct380-evidence a').count()==2
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12,(cap,width,'overflow')
    # Abrir/copiar não deve escrever rascunho ou comprovar equipamento.
    assert not page.evaluate('Object.keys(localStorage).some(k=>k.startsWith("scoutpro:v324:manager-profile:"))')
    page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:async s=>window.__sheet=s},configurable:true})")
    sheet.get_by_role('button',name='Copiar ficha completa',exact=True).click()
    page.wait_for_function('()=>window.__sheet?.includes("REVISÃO CENTRAL · LOTE 01")')
    assert 'pesdb.net/efootball/players/' in page.evaluate('window.__sheet')
    if width in [320,1366]:
     sheet.scroll_into_view_if_needed();page.screenshot(path=str(OUT/f'{width}-cap-{cap:03}.png'))
    results.append({'cap':cap,'width':width,'pp':c['pp'],'overflow':False})
   # Alternar estilo remove o selo deste lote e não transporta a proposta.
   page.locator('#ct378-style').select_option('rapido')
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.tactic==="rapido"')
   assert page.locator('.ct380-evidence').count()==0
   page.locator('#ct378-style').select_option('posse')
   page.wait_for_function('()=>document.querySelector(".ct380-evidence")')
   # Adotar cria revisão; recarregar preserva vetor e escolhas exibidas.
   skills=sheet.locator('.ct374-skill-reasons > li > strong').all_text_contents()
   groups=sheet.locator('.ct375-training dd').all_text_contents()
   sheet.get_by_role('button',name='Guardar esta ficha em nova revisão',exact=True).click()
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.source==="profile"')
   page.reload(wait_until='domcontentloaded')
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.source==="profile"')
   assert sheet.locator('.ct375-training dd').all_text_contents()==groups
   assert sheet.locator('.ct374-skill-reasons > li > strong').all_text_contents()==skills
   assert page.locator('.ct380-evidence').count()==0,'Revisão salva não deve ganhar rótulo editorial novamente'
   compare=page.get_by_role('button',name='Comparar proposta revista para Posse',exact=True)
   compare.click(timeout=25000)
   page.wait_for_function('()=>document.querySelector(".ct380-evidence")')
   assert page.locator('.ct378-main-sheet:visible').count()==1
   page.get_by_role('button',name='Voltar à ficha salva',exact=True).click()
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.source==="profile"')
   assert sheet.locator('.ct375-training dd').all_text_contents()==groups
   assert not errors,(width,errors)
   ctx.close()
 finally:browser.close()
(OUT/'resultados.json').write_text(json.dumps({'openings':len(results),'results':results,'errors':[]},indent=2),encoding='utf-8')
print(f'V380 VISUAL PASS: {len(results)} aberturas, 13 edições, 3 telas, cópia e adoção preservadas; zero erros.')
