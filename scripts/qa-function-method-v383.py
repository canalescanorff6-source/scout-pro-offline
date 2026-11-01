"""Fluxo real em perfil descartável: função, observação, histórico e offline."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v383'));OUT.mkdir(parents=True,exist_ok=True)
form=next(f for f in json.loads((ROOT/'web/ct382-formations.json').read_text())['formations'] if f['family']=='4-3-1-2')
draft={'schema':'CRAQUE_SECONDARY_ACCOUNT_DRAFT_V382','managers':[],'cards':[]}
for i,s in enumerate(form['slots']):
 draft['cards'].append({'id':'qa-'+str(i),'name':'Jogador QA '+str(i),'edition':'Edição de teste','position':s['position'],'maxLevel':31,'pp':60,
  'offenseStyle':'Jogador de infiltração' if s['position']=='MLG' else 'Ala produtivo' if s['position']=='MAT' else 'Básico',
  'defenceStyle':'O destruidor' if s['position']=='LD' else 'Básico'})
reports=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,900)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(BASE+'/plano-do-time-v382.html?account=secondary');p.wait_for_selector('body[data-team382="ready"]',timeout=30000)
   p.locator('#import-account').set_input_files({'name':'teste.json','mimeType':'application/json','buffer':json.dumps(draft).encode()})
   p.locator('#style').select_option('rapido');p.locator('#family').select_option('4-3-1-2');p.locator('#auto').click()
   p.locator('[aria-label="Função mlg1"]').select_option('infiltrate');p.locator('#calculate').click();p.wait_for_selector('.result-card')
   assert p.locator('.activation-status[data-activation="active"]').count()>=3
   assert p.locator('.activation-status[data-activation="inactive"]').count()==1
   assert p.locator('#match-form').is_hidden()
   p.locator('#save-plan').click();p.wait_for_function("document.querySelector('#feedback').textContent.includes('Nova revisão')")
   p.locator('#match-form [name="memberId"]').select_option(draft['cards'][6]['id'])
   p.locator('#match-form [name="mode"]').select_option('friends');p.locator('#match-form [name="games"]').fill('3')
   p.locator('#match-form [name="support"]').select_option('better');p.locator('#match-form [name="coverage"]').select_option('worse')
   p.locator('#match-form [name="note"]').fill('Melhor apoio, mas deixou espaço ao perder. Mesma formação e técnico.')
   p.locator('#match-form button').click();p.wait_for_function("document.querySelectorAll('.match-observation').length===1")
   assert p.locator('#match-list').inner_text().count('Melhor apoio')==1
   with p.expect_download() as dl:p.locator('#export-json').click()
   path=OUT/f'plan-{width}.json';dl.value.save_as(path);plan=json.loads(path.read_text(encoding='utf8'))
   assert plan['observations'][0]['coverage']=='worse' and plan['observations'][0]['mode']=='friends'
   assert plan['context']['functions'][draft['cards'][6]['id']]=='infiltrate'
   assert plan['gameplayValidated'] is False and plan['appliedInGame'] is False
   p.locator('#save-plan').click();assert p.locator('.match-observation').count()==0
   p.locator('#history button').last.click();assert p.locator('.match-observation').count()==1
   assert p.locator('[aria-label="Função mlg1"]').input_value()=='infiltrate'
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   p.locator('.result-card').first.scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'function-{width}.png'))
   p.locator('#match-section').scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'observation-{width}.png'))
   with p.expect_download() as dl:p.locator('#backup-export').click()
   backup=OUT/f'backup-{width}.json';dl.value.save_as(backup)
   p.locator('#primary').click();assert p.locator('#history button').count()==0
   p.locator('#secondary').click();assert p.locator('#history button').count()==2
   p.locator('#backup-import').set_input_files(str(backup));p.wait_for_selector('#backup-confirm:not([hidden])');p.locator('#backup-confirm').click()
   p.locator('#history button').last.click();assert p.locator('.match-observation').count()==1
   if width==1366:
    p.evaluate("navigator.serviceWorker.register('./sw.js')");p.wait_for_function('navigator.serviceWorker.controller!==null',timeout=60000)
    ctx.set_offline(True);p.reload();p.wait_for_selector('body[data-team382="ready"]',timeout=30000);p.locator('#history button').last.click()
    assert p.locator('.match-observation').count()==1 and p.locator('.activation-status').count()==22
   assert not errors,errors
   reports.append({'viewport':[width,height],'functions':11,'phaseStatuses':22,'observationsIsolated':True,'backupRestored':True,'errors':errors});ctx.close()
 finally:browser.close()
(OUT/'report.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
print('V383 UI QA PASS:320/390/1366, função/PP, ativação por fase, relato por revisão, histórico, backup e offline.')
