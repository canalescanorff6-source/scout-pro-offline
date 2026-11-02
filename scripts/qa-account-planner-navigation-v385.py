"""Planejador: destino do cadastro e navegação devem acompanhar a conta selecionada."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width in [320,390,1366]:
   ctx=b.new_context(viewport={'width':width,'height':850});p=ctx.new_page();p.goto(BASE+'/plano-do-time-v382.html?account=secondary');p.wait_for_selector('body[data-team382="ready"]');p.locator('#ct382-accounts').wait_for(state='attached')
   assert 'account=secondary' in p.locator('header a').first.get_attribute('href')
   for link in p.locator('.ct362-appnav > a').all():
    href=link.get_attribute('href') or ''
    if 'index.html' in href and '/manual-2027/' not in href:assert 'account=' in href,href
    assert 'tecnicos-v307.html' not in href
    if 'plano-do-time-v382.html' in href:assert 'account=secondary' in href,href
   p.locator('.ct362-appnav > a[href*="plano-do-time-v382.html"]').first.click();p.wait_for_selector('body[data-team382="ready"]')
   assert p.locator('#secondary').get_attribute('aria-pressed')=='true'
   p.locator('#new-card').click();form=p.locator('.ct385-editor form');form.locator('[name="account"]').select_option('primary');form.locator('[name="name"]').fill('Destino Principal QA');form.locator('[name="maxLevel"]').fill('32');form.locator('button[type="submit"]').click()
   p.wait_for_function("document.querySelector('#primary').getAttribute('aria-pressed')==='true'")
   assert 'Principal' in p.locator('#feedback').inner_text();assert p.locator('#roster .library-card').count()==262
   p.locator('#secondary').click();assert p.locator('#roster .library-card').count()==0
   p.locator('header a').first.click();p.wait_for_selector('body[data-ct385-catalog="ready"]');assert p.locator('#ct385-account-secondary').get_attribute('aria-current')=='page';assert p.locator('#cards .player-card').count()==0
   ctx.close()
 finally:b.close()
print('V385 PLANNER NAV PASS: destino retornado pelo cadastro, menus e retorno mantêm a conta em3telas.')
