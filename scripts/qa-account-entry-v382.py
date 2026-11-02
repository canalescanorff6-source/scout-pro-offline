"""Contas acessíveis no menu sem empurrar a biblioteca para fora da primeira tela."""
import os,shutil
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,768)]:
   ctx=b.new_context(viewport={'width':width,'height':height});page=ctx.new_page();page.goto(BASE+'/index.html')
   page.wait_for_selector('body[data-ct364-owned="ready"]');entry=page.locator('#ct382-accounts');entry.wait_for(state='attached')
   assert page.locator('.scout-v189-dock-options #ct382-accounts').count()==1
   if width==320:assert page.locator('#cards .player-card').first.bounding_box()['y']<height-38
   menu=page.locator('#scout-app-bar .scout-v189-dock-more > summary');reveal(menu);menu.click()
   assert entry.is_visible();assert 'Principal' in entry.inner_text()
   entry.get_by_role('link',name='Conta Secundária →').click();page.wait_for_selector('body[data-team382="ready"]')
   assert page.locator('#secondary').get_attribute('aria-pressed')=='true'
   assert page.locator('#roster .library-card').count()==0
   ctx.close()
 finally:b.close()
print('V382 ACCOUNT ENTRY PASS: três telas, acesso pelo menu e primeira carta preservada em320px.')
