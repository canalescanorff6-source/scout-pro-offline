"""Workspace de contas em perfis descartáveis; nunca acessa a instalação pessoal."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v382'));OUT.mkdir(parents=True,exist_ok=True)
draft_path=os.getenv('CRAQUE_ACCOUNT_DRAFT')
if draft_path:
 draft=json.loads(Path(draft_path).read_text(encoding='utf8'))
else:
 slots=json.loads((ROOT/'web/ct382-formations.json').read_text())['formations'][0]['slots']
 draft={'schema':'CRAQUE_SECONDARY_ACCOUNT_DRAFT_V382','cards':[{'id':'test-'+str(i),'name':'Jogador '+str(i),'position':s['position'],'maxLevel':31,'pp':60,'edition':'Edição de teste','nativeSkills':['Passe de primeira'],'nativeVerified':True,'skills':[],'skillsVerified':True,'skillCapacity':5} for i,s in enumerate(slots)],'managers':[{'id':'test-manager','name':'Técnico teste','edition':'Edição de teste','proficiency':{'posse':90,'rapido':88,'normal':88,'fora':90,'longo':87,'overload':80}}]}
 draft['cards'] += [{'id':'bench-'+str(i),'name':'Reserva '+str(i),'position':'CA'} for i in range(12)]
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,900)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/plano-do-time-v382.html');page.wait_for_selector('body[data-team382="ready"]',timeout=30000)
   assert page.locator('#roster .library-card').count()==261
   page.evaluate("localStorage.setItem('scoutpro:test-preserved','principal')")
   before=page.evaluate("JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('scoutpro:')&&k!=='scoutpro:v382:accounts')))")
   page.locator('#import-account').set_input_files({'name':'conta.json','mimeType':'application/json','buffer':json.dumps(draft,ensure_ascii=False).encode()})
   page.wait_for_function("document.querySelector('#roster-count').textContent.startsWith('23')")
   assert page.locator('#secondary').get_attribute('aria-pressed')=='true'
   page.locator('#manager').select_option(draft['managers'][0]['id']);page.locator('#style').select_option('rapido');page.locator('#family').select_option('4-3-1-2')
   page.locator('#auto').click()
   page.locator('[aria-label="Ataque ld"]').select_option('defensive')
   page.locator('[aria-label="Ataque mlg1"]').select_option('anchoring')
   page.locator('#calculate').click();page.wait_for_selector('.result-card',timeout=15000)
   assert page.locator('.result-card').count()==11
   page.locator('#save-plan').click();page.wait_for_function("document.querySelector('#feedback').textContent.includes('Nova revisão')")
   with page.expect_download() as dl:page.locator('#export-json').click()
   file=OUT/f'plan-{width}.json';dl.value.save_as(file);plan=json.loads(file.read_text(encoding='utf8'))
   assert plan['accountId']=='secondary' and len(plan['context']['instructions'])==2 and len(plan['cards'])==11
   for c in plan['cards']:
    r=c['review']
    if r['proposed']:assert sum(n+max(0,n-4)+max(0,n-8)+max(0,n-12)+max(0,n-16) for n in r['proposed'])==r['pp']
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.screenshot(path=str(OUT/f'team-{width}.png'),full_page=False)
   with page.expect_download() as dl:page.locator('#backup-export').click()
   backup=OUT/f'backup-{width}.json';dl.value.save_as(backup);data=json.loads(backup.read_text(encoding='utf8'));assert 'scoutpro:v382:accounts' in data['items']
   page.reload();page.wait_for_selector('body[data-team382="ready"]');page.locator('#history button').first.click()
   assert page.locator('.result-card').count()==11
   page.locator('#primary').click();assert page.locator('#roster .library-card').count()==261;assert page.locator('#history button').count()==0
   page.locator('#secondary').click();assert page.locator('#roster .library-card').count()==23;assert page.locator('#history button').count()==1
   # Cadastro pela interface, incluindo PP e slot, permanece só na Secundária.
   page.locator('#new-card').click();page.locator('[name="name"]').fill('Carta QA');page.locator('[name="edition"]').fill('Edição QA');page.locator('[name="maxLevel"]').fill('31');page.locator('[name="pp"]').fill('60');page.locator('#card-editor button[type="submit"]').click()
   assert page.locator('#roster .library-card').count()==24
   page.locator('#backup-import').set_input_files(str(backup));page.wait_for_selector('#backup-confirm:not([hidden])');page.locator('#backup-confirm').click()
   page.wait_for_function("document.querySelector('#roster-count').textContent.startsWith('23')")
   assert page.evaluate("localStorage.getItem('scoutpro:test-preserved')")=='principal'
   after=page.evaluate("JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('scoutpro:')&&k!=='scoutpro:v382:accounts')))")
   # O relógio do backup é fora de scoutpro; os dados pessoais legados não mudam.
   assert before==after
   if width==1366:
    page.evaluate("navigator.serviceWorker.register('./sw.js')")
    page.wait_for_function("navigator.serviceWorker.controller!==null",timeout=60000)
    # Só caches públicos do produto: nunca arquivos privados importados.
    ctx.set_offline(True);page.reload();page.wait_for_selector('body[data-team382="ready"]',timeout=30000)
    assert page.locator('#roster .library-card').count()==23
    ctx.set_offline(False)
   assert not errors,errors
   results.append({'viewport':[width,height],'cards':23,'planMembers':11,'errors':errors,'accountIsolation':True,'backupRestored':True})
   ctx.close()
 finally:browser.close()
(OUT/'report.json').write_text(json.dumps(results,indent=2),encoding='utf8')
print('V382 UI QA PASS:320/390/1366, importação23, onze/instruções, revisão, exportação, backup, isolamento e offline.')
