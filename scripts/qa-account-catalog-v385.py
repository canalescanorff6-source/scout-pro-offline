"""Meu elenco compartilhado: importação, fichas e isolamento em perfis descartáveis."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v385'));OUT.mkdir(parents=True,exist_ok=True)
card={'id':'local-qa','name':'Jogador QA','edition':'Edição de teste','cardId':'123456789','position':'MLG','positions':['MLG','MAT'],'maxLevel':32,'pp':62,'offenseStyle':'Jogador de infiltração','defenceStyle':'Básico','nativeSkills':['Passe de primeira'],'nativeVerified':True,'skills':[],'skillsVerified':True,'skillCapacity':5,'identityVerified':True,'boosterSlot':'vazio'}
def upload(page,account,data):
 page.locator('#ct385-manage').evaluate('(e)=>e.open=true')
 page.locator('#ct385-import').set_input_files({'name':'carta.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
 page.locator('#ct385-confirm-import').wait_for(state='visible')
 assert account in page.locator('#ct385-import-preview').inner_text()
 page.locator('#ct385-confirm-import').click()
 page.wait_for_selector('body[data-ct385-catalog="ready"]')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,900)]:
   ctx=b.new_context(viewport={'width':width,'height':height},accept_downloads=True);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(BASE+'/index.html?account=secondary');p.wait_for_selector('body[data-ct385-catalog="ready"]',timeout=12000)
   assert p.locator('#cards .player-card').count()==0
   assert p.locator('#ct385-account-secondary').get_attribute('aria-current')=='page'
   assert p.locator('#ct385-empty').is_visible()
   assert p.locator('#ct364-owned-section').count()==0
   assert p.locator('#ct361-home-mark').is_visible()
   if width<520:assert p.locator('#catalogo').bounding_box()['y']<=(545 if width<=340 else 525)
   p.locator('#ct382-accounts').wait_for(state='attached')
   assert 'account=primary' in p.locator('#ct382-accounts a').filter(has_text='Conta Principal →').get_attribute('href')
   payload={'schema':'CRAQUE_ACCOUNT_CARD_IMPORT_V385','accountId':'secondary','cards':[card]}
   upload(p,'Secundária',payload)
   assert p.locator('#cards .player-card').count()==1
   assert '62 PP' in p.locator('#cards').inner_text()
   p.locator('#search').fill('Não existe');assert p.locator('#none').is_visible();p.locator('#search').fill('Jogador QA')
   p.locator('#cards .player-card').click();p.wait_for_selector('body[data-ct385-sheet="ready"]')
   assert 'Secundária' in p.locator('#sheet-account').inner_text()
   p.locator('#sheet-function').select_option('infiltrate');p.locator('#sheet-generate').click()
   assert '62 / 62 PP' in p.locator('#sheet-result').inner_text()
   p.locator('#sheet-save').click();assert p.locator('#sheet-history button').count()==1
   p.screenshot(path=str(OUT/f'sheet-secondary-{width}.png'),full_page=True)
   p.locator('#sheet-back').click();p.wait_for_selector('body[data-ct385-catalog="ready"]')
   p.locator('#ct385-account-primary').click();p.wait_for_selector('body[data-ct364-owned="ready"]')
   p.wait_for_function("()=>document.querySelectorAll('#cards>.player-card,#cards>.ct364-player-card').length===261")
   assert p.locator('#cards>.player-card,#cards>.ct364-player-card').count()==261
   upload(p,'Principal',{'schema':'CRAQUE_ACCOUNT_CARD_IMPORT_V385','accountId':'primary','cards':[{**card,'maxLevel':31,'pp':60}]})
   p.wait_for_function("()=>document.querySelectorAll('#cards>.player-card,#cards>.ct364-player-card').length===262")
   assert p.locator('#cards>.player-card,#cards>.ct364-player-card').count()==262
   p.locator('#search').fill('Jogador QA');p.locator('#cards .player-card[data-account-card]').click();p.wait_for_selector('body[data-ct385-sheet="ready"]')
   assert 'Principal' in p.locator('#sheet-account').inner_text();assert p.locator('#sheet-history button').count()==0
   p.locator('#sheet-generate').click();assert '60 / 60 PP' in p.locator('#sheet-result').inner_text();p.locator('#sheet-save').click()
   p.locator('#sheet-back').click();p.wait_for_selector('body[data-ct385-catalog="ready"]');p.locator('#ct385-account-secondary').click();p.wait_for_selector('body[data-ct385-catalog="ready"]')
   assert p.locator('#cards .player-card').count()==1
   p.screenshot(path=str(OUT/f'catalog-secondary-{width}.png'),full_page=True)
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   assert p.locator('.scout-v189-quick a[href*="outros-elencos"]').count()==0
   if width==1366:
    # O backup deve restaurar cartas e revisões nas duas contas, sem tocar nas261legadas.
    backup=p.evaluate('()=>CRAQUE_BACKUP_V226.create()')
    p.evaluate("()=>{const A=CRAQUE_ACCOUNTS_V382,d=A.read(localStorage);d.primary.cards=[];d.secondary.cards=[];A.save(localStorage,d);localStorage.removeItem('scoutpro:v385:sheets:secondary:local-qa');}")
    p.evaluate('async backup=>{const B=CRAQUE_BACKUP_V226;await B.restore(await B.inspect(backup));}',backup)
    assert p.evaluate("()=>CRAQUE_ACCOUNTS_V382.read(localStorage).primary.cards.length")==1
    p.reload();p.wait_for_selector('body[data-ct385-catalog="ready"]')
    assert p.locator('#cards .player-card').count()==1
    p.evaluate("navigator.serviceWorker.register('./sw.js')")
    p.wait_for_function('navigator.serviceWorker.controller!==null',timeout=60000)
    p.evaluate("card=>CRAQUE_ACCOUNT_LIBRARY_V385.saveCard(localStorage,'secondary',{...card,id:'offline-never-opened'})",card)
    ctx.set_offline(True);p.reload();p.wait_for_selector('body[data-ct385-catalog="ready"]')
    p.locator('#cards .player-card[data-account-card="offline-never-opened"]').click();p.wait_for_selector('body[data-ct385-sheet="ready"]',timeout=10000)
    assert p.locator('#sheet-history button').count()==0
    p.locator('#sheet-generate').click();assert '62 / 62 PP' in p.locator('#sheet-result').inner_text()
    ctx.set_offline(False)
   assert not errors,errors
   ctx.close()
 finally:b.close()
print('V385 CATALOG PASS: três telas, mesmas cartas visuais, importação por conta e fichas/revisões isoladas.')
