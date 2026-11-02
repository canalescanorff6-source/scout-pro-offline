"""Cadastro manual compartilhado, imagem local e mudança de edição sem reaproveitar provas."""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
png=(Path(__file__).resolve().parents[1]/'web/assets/icon-192.png').read_bytes()
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width in [320,390,1366]:
   ctx=b.new_context(viewport={'width':width,'height':850});p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(BASE+'/index.html?account=secondary');p.wait_for_selector('body[data-ct385-catalog="ready"]')
   p.locator('#ct385-manage').evaluate('(e)=>e.open=true');p.locator('#ct385-add').click();form=p.locator('.ct385-editor form')
   form.locator('[name="account"]').select_option('primary');form.locator('[name="name"]').fill('Cadastro manual QA');form.locator('[name="edition"]').fill('Edição A');form.locator('[name="position"]').select_option('MLG');form.locator('[name="maxLevel"]').fill('32')
   assert form.locator('[name="pp"]').input_value()=='62'
   form.locator('[name="nativeSkills"]').fill('Passe de primeira');form.locator('[name="nativeVerified"]').check();form.locator('[name="identityVerified"]').check();form.locator('[name="imageFile"]').set_input_files({'name':'arte.png','mimeType':'image/png','buffer':png})
   form.locator('button[type="submit"]').click();p.wait_for_function("()=>location.search==='?account=primary'||document.querySelector('.ct385-editor [role=status]')?.textContent")
   assert p.url.endswith('index.html?account=primary'),p.locator('.ct385-editor [role=status]').inner_text()
   p.wait_for_selector('body[data-ct385-catalog="ready"]')
   assert p.locator('#cards [data-account-card]').count()==1
   p.locator('#search').fill('Cadastro manual QA');tile=p.locator('#cards [data-account-card]');tile.locator('img').evaluate('(e)=>e.decode()');tile.click();p.wait_for_selector('body[data-ct385-sheet="ready"]')
   assert p.locator('#sheet-art').is_visible();assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.evaluate("()=>{const L=CRAQUE_ACCOUNT_LIBRARY_V385,c=CRAQUE_ACCOUNTS_V382.read(localStorage).primary.cards[0];L.saveCard(localStorage,'primary',{...c,fixedBoosters:[{name:'Passe',value:1,verified:true,source:'Fonte A'},{name:'Técnica',value:1,verified:true,source:'Fonte B'}],extraBooster:{name:'Agilidade',value:1,verified:true,source:'Fonte C'},boosterSlot:'ocupado',boosterSlotSupported:true});}")
   p.reload();p.wait_for_selector('body[data-ct385-sheet="ready"]');p.locator('#sheet-edit').click();p.locator('.ct385-editor button[type="submit"]').click();p.wait_for_selector('body[data-ct385-sheet="ready"]')
   equipment=p.evaluate("()=>{const c=CRAQUE_ACCOUNTS_V382.read(localStorage).primary.cards[0];return {fixed:c.fixedBoosters,extra:c.extraBooster};}")
   assert len(equipment['fixed'])==2,equipment
   assert [b['source'] for b in equipment['fixed']]==['Fonte A','Fonte B'];assert equipment['extra']['source']=='Fonte C'
   p.locator('#sheet-generate').click();p.locator('#sheet-save').click();assert p.locator('#sheet-history button').count()==1
   p.locator('#sheet-edit').click();form=p.locator('.ct385-editor form');assert form.locator('[name="account"]').is_disabled();form.locator('[name="edition"]').fill('Edição B');form.locator('button[type="submit"]').click();p.wait_for_selector('body[data-ct385-sheet="ready"]')
   assert 'dados anteriores' in p.locator('#sheet-history').inner_text()
   state=p.evaluate("()=>{const c=CRAQUE_ACCOUNTS_V382.read(localStorage).primary.cards[0];return {native:c.nativeVerified,identity:c.identityVerified,image:c.image.slice(0,23)}}")
   assert not state['native'] and not state['identity'];assert state['image'].startswith('data:image/webp;base64,')
   p.locator('#sheet-back').click();p.wait_for_selector('body[data-ct385-catalog="ready"]');p.locator('#ct385-account-secondary').click();p.wait_for_selector('body[data-ct385-catalog="ready"]');assert p.locator('#cards .player-card').count()==0
   assert not errors,errors;ctx.close()
 finally:b.close()
print('V385 EDITOR PASS: cadastro por conta, PP automático, imagem local, edição invalida provas e histórico preservado em3telas.')
