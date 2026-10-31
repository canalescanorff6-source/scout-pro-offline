"""Evitar estatísticas cortadas na revisão tática, em perfis descartáveis."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,768)]:
   ctx=browser.new_context(viewport={'width':width,'height':height});page=ctx.new_page()
   page.goto(BASE+'/revisao-tatica-v98.html',wait_until='domcontentloaded')
   page.wait_for_function('()=>document.body.dataset.ct362Ui==="true"')
   page.locator('#player-name').wait_for()
   page.evaluate('()=>document.fonts.ready')
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=3, 'Revisão tática ultrapassa a largura da tela'
   assert page.locator('.metrics .metric').count()==5
   for metric in page.locator('.metrics .metric').all():
    assert metric.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'), 'Texto de estatística cortado'
   ctx.close()
  print('Revisão tática PASS: cinco indicadores legíveis em 320/390/1366, sem corte ou rolagem horizontal.')
 finally:browser.close()
