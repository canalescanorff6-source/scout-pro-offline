#!/usr/bin/env python3
"""V342: validação ao vivo no Chromium real, Android/Windows e dois acervos."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 binary=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=binary,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V342 Live Skills')
   page.locator('#friend-card-edition').fill('Edição experimental V342')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-native').fill('Passe de primeira; Chute de primeira')
   page.locator('#friend-card-fixed-booster').fill('Técnica')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=30000)
   root.locator('.ct326-primary-action').click()
   page.wait_for_function("""() => !!document.querySelector(
     '#friend-manager-version option[value="CT-MGR-071"]')""",timeout=25000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   root.locator('.ct331-role-open').click()
   role=root.locator('.ct311-controls .ct311-select')
   box=root.locator('.ct324-profile')
   box.wait_for(timeout=30000)
   note=box.locator('.ct342-live-audit')
   button=box.get_by_role('button',name='Salvar ficha independente deste técnico')
   assert note.get_attribute('role')=='status'
   assert note.get_attribute('aria-live')=='polite'
   assert 'RASCUNHO PRONTO' in note.inner_text()
   assert button.is_enabled()
   button.click()
   page.wait_for_function("""() => Object.keys(localStorage).some(k=>
     k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""")
   key=page.evaluate("""() => Object.keys(localStorage).find(k=>
     k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""")
   # Revisão histórica pré-existente conflitante é mantida, mas uma nova
   # revisão com skill nativa coincidente não pode ser registrada.
   page.evaluate("""key => {
     const data=JSON.parse(localStorage.getItem(key));
     data.revisions[data.revisions.length-1].skills=['Passe de primeira'];
     data.revisions[data.revisions.length-1].booster='Técnica';
     localStorage.setItem(key,JSON.stringify(data));
   }""",key)
   role.select_option('SA');role.select_option('MAT')
   box=root.locator('.ct324-profile')
   candidate=box.locator('.ct324-skill-option').filter(has_text='Passe de primeira')
   candidate.wait_for(timeout=15000)
   note=box.locator('.ct342-live-audit')
   button=box.get_by_role('button',name='Salvar ficha independente deste técnico')
   assert candidate.locator('input').is_checked()
   assert button.is_disabled(), 'Conflito com nativa cadastrada precisa bloquear nova revisão'
   assert note.get_attribute('data-status')=='revisar_habilidades'
   assert 'NÃO SALVAR' in note.inner_text()
   before=page.evaluate("(key)=>localStorage.getItem(key)",key)
   candidate.locator('input').uncheck()
   assert button.is_enabled(), 'Desmarcar candidata coincidente deve reabilitar salvamento'
   assert 'RASCUNHO PRONTO' in note.inner_text()
   assert 'ímpeto candidato coincide' in note.inner_text()
   assert page.evaluate("(key)=>localStorage.getItem(key)",key)==before, (
    'Trocar seleção de skill NÃO pode alterar histórico antes do clique')
   button.click()
   saved=page.evaluate("""key => {
    const rows=JSON.parse(localStorage.getItem(key)).revisions;
    return {count:rows.length,before:rows[rows.length-2].skills,
            after:rows[rows.length-1].skills};
   }""",key)
   assert saved['count']==2,saved
   assert saved['before']==['Passe de primeira'],saved
   assert saved['after']==[],saved
   # Acervo pessoal: apresenta o mesmo diagnóstico e não importa histórico externo.
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded',timeout=40000)
   page.locator('#ct-manager-select').wait_for(timeout=40000)
   page.locator('#ct-manager-select').select_option('CT-MGR-071')
   own=page.locator('.ct311-main-slot .ct311-positional')
   own.wait_for(timeout=30000)
   own.locator('.ct326-primary-action').click()
   own.locator('.ct324-profile .ct342-live-audit').wait_for(timeout=25000)
   assert own.locator('.ct342-live-audit').get_attribute('aria-live')=='polite'
   assert own.locator('.ct324-profile').count()==1
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   over=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert over<=3, f'{label}: overflow horizontal {over}px'
   ctx.close()
 finally:
  browser.close()
print('V342 CHROMIUM PASS: feedback vivo de skills/PP/ímpeto e bloqueio sem perda de histórico; dois acervos Android/Windows.')
