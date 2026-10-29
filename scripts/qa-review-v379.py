"""Biblioteca/conferência reais, usando armazenamento descartável."""
import os,json,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765')
OUT=Path('artifacts/visual-qa/v379');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 for width,height in [(320,700),(390,844),(1366,768)]:
  ctx=browser.new_context(viewport={'width':width,'height':height});page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/index.html',wait_until='domcontentloaded')
  page.wait_for_function('()=>window.CRAQUE_CATALOG_V379?.owned===true',timeout=25000)
  assert page.locator('#all-count').inner_text()=='261'
  assert page.locator('#cards > [data-owned-id]').count()==15
  page.locator('#search').fill('diego forlan')
  assert page.locator('#cards > [data-owned-id="ct364-14"]').is_visible()
  assert page.locator('#shown-count').inner_text()=='1'
  page.locator('[data-owned-id="ct364-14"]').click()
  page.locator('#ct364-panel .ct378-main-sheet').wait_for(timeout=25000)
  assert page.locator('#ct364-panel .ct378-main-sheet:visible').count()==1
  page.locator('#ct364-dialog .ct364-close').click()
  page.locator('#search').fill('')
  page.locator('#sort').evaluate('(e)=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==="DETAILS")p.open=true}')
  page.locator('#sort').select_option('reverse')
  assert page.locator('#cards > :visible').first.get_attribute('data-owned-id')=='ct364-15'
  page.goto(BASE+'/conferir-cartas.html#cap%3A1')
  page.wait_for_function('()=>document.body.dataset.review379==="ready"')
  assert page.locator('#review-jump option').count()==261
  assert page.locator('#review-art').evaluate('(e)=>e.complete&&e.naturalWidth>0')
  page.locator('[name="maxLevel"]').fill('32');page.locator('[name="currentLevel"]').fill('12')
  page.locator('[name="currentOverall"]').fill('95');page.locator('[name="maxOverall"]').fill('106')
  page.locator('[name="pp"]').fill('62');page.locator('[name="attackStyle"]').fill('Atacante pivô')
  page.locator('#review-draft').click();assert 'Rascunho' in page.locator('#review-feedback').inner_text()
  page.reload();page.wait_for_function('()=>document.body.dataset.review379==="ready"')
  assert page.locator('[name="currentLevel"]').input_value()=='12'
  assert page.locator('[name="maxOverall"]').input_value()=='106'
  page.get_by_role('button',name='Confirmar carta',exact=True).click()
  assert 'Marque' in page.locator('#review-feedback').inner_text()
  page.locator('#review-owner-confirm').check();page.get_by_role('button',name='Confirmar carta',exact=True).click()
  assert 'Carta confirmada' in page.locator('#review-feedback').inner_text()
  page.screenshot(path=str(OUT/f'{width}-conferencia.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=1
  page.locator('#review-next').click();assert page.locator('[name="currentLevel"]').input_value()==''
  page.locator('#review-prev').click();assert page.locator('[name="currentLevel"]').input_value()=='12'
  page.locator('#review-search').fill('diego forlan');assert page.locator('#review-name').inner_text()=='Diego Forlán'
  assert page.locator('#review-art').evaluate('(e)=>e.complete&&e.naturalWidth>0')
  page.locator('[name="rarity"]').select_option('ÉPICA')
  page.locator('#review-owner-confirm').check();page.get_by_role('button',name='Confirmar carta',exact=True).click()
  page.goto(BASE+'/index.html?q=Diego%20Forlan',wait_until='domcontentloaded')
  page.wait_for_function('()=>document.querySelector("[data-owned-id=ct364-14]")?.dataset.rarity==="ÉPICA"')
  rarity=page.locator('#rarities [data-value="ÉPICA"]');reveal(rarity);rarity.click()
  assert page.locator('[data-owned-id="ct364-14"]').is_visible()
  assert page.locator('#rarities [data-value="PENDENTE"]').count()==1
  # Os 22 IDs ainda pendentes não podem impedir salvar rascunhos no fluxo.
  page.goto(BASE+'/conferir-cartas.html#cap%3A246')
  page.wait_for_function('()=>document.body.dataset.review379==="ready"')
  assert page.locator('[name="cardId"]').input_value()==''
  page.locator('[name="currentLevel"]').fill('1');page.locator('#review-draft').click()
  assert 'Rascunho salvo' in page.locator('#review-feedback').inner_text()
  assert not errors,errors
  ctx.close()
 browser.close()
print('V379 visual PASS: biblioteca 261, Forlán, ordem, ficha única e conferência persistida em 320/390/1366px.')
