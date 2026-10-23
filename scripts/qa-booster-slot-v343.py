#!/usr/bin/env python3
"""V343 — QA real de slot de ímpeto AUSENTE, histórico e recuperação da ficha."""
import os,shutil
from playwright.sync_api import sync_playwright
URL=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 executable=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=executable,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(URL+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V343 Sem Slot')
   page.locator('#friend-card-edition').fill('Edição de ensaio V343')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-booster-slot').select_option('ausente')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=25000)
   root.locator('.ct326-primary-action').click()
   page.wait_for_function("""() => !!document.querySelector('#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   root.locator('.ct331-role-open').click()
   role=root.locator('.ct311-controls .ct311-select')
   box=root.locator('.ct324-profile')
   box.wait_for(timeout=25000)
   assert box.locator('.ct343-slot-evidence').count()==1
   button=box.get_by_role('button',name='Salvar ficha independente deste técnico')
   assert button.is_enabled(),'É permitido salvar ficha SEM ímpeto para carta sem slot'
   button.click()
   page.wait_for_function("""() => Object.keys(localStorage).some(k=>
    k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""",timeout=15000)
   key=page.evaluate("""() => Object.keys(localStorage).find(k=>
    k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""")
   page.evaluate("""key => {
    const doc=JSON.parse(localStorage.getItem(key));
    doc.revisions[doc.revisions.length-1].booster='Técnica';
    localStorage.setItem(key,JSON.stringify(doc));
   }""",key)
   role.select_option('SA');role.select_option('MAT')
   box=root.locator('.ct324-profile')
   choice=box.locator('.ct324-booster')
   choice.wait_for(timeout=15000)
   assert choice.input_value()=='Técnica'
   note=box.locator('.ct342-live-audit')
   assert note.get_attribute('data-status')=='revisar_impeto_slot'
   assert note.get_attribute('data-slot-status')=='slot_ausente'
   assert 'SEM slot adicional' in note.inner_text()
   button=box.get_by_role('button',name='Salvar ficha independente deste técnico')
   assert button.is_disabled(),'Não criar novo rascunho com ímpeto de slot ausente'
   before=page.evaluate('(key)=>localStorage.getItem(key)',key)
   choice.select_option('')
   assert button.is_enabled(),'Limpar candidato deve permitir salvar o PP sem ímpeto'
   assert note.get_attribute('data-slot-status')=='sem_candidato'
   assert page.evaluate('(key)=>localStorage.getItem(key)',key)==before,'Mudança local nunca grava'
   button.click()
   history=page.evaluate("""key => {
    const r=JSON.parse(localStorage.getItem(key)).revisions;
    return {length:r.length,old:r[0].booster,new:r[r.length-1].booster}
   }""",key)
   assert history=={'length':2,'old':'Técnica','new':''},history
   assert not [err for err in errors if err!='Scout PRO: carta sem estilo para filtro #1'],errors
   overflow=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert overflow<=3,f'{platform} overflow={overflow}'
   ctx.close()
 finally:
  browser.close()
print('V343 CHROMIUM PASS: ímpeto sem slot bloqueado, limpar reabilita, histórico intacto, Android e Windows.')
