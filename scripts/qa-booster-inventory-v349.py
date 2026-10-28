#!/usr/bin/env python3
"""V349 — ímpetos em múltiplas linhas: motor e editor Android/Windows."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for device,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(BASE+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
    wait_until='domcontentloaded',timeout=40000)
   audited=page.evaluate("""() => {
    const api=window.CRAQUE_MANAGER_FICHAS_V324;
    if(!api?.reviewBoosterRanking)return null;
    const list='Regista; Técnica\\nForça';
    const r=api.reviewBoosterRanking(
     {name:'Técnica',reason:'Base'},
     [{name:'Força',reason:'Alternativa 1'},
      {name:'Agilidade',reason:'Alternativa 2'}],
     'Defesa',list,'ocupado');
    const review=api.reviewDraftReadiness({
     train:[10,5,5,8,8,6,0,0,0,0],budget:62,skills:[],
     booster:'Técnica',fixedBooster:'Defesa',
     informedBooster:list,boosterSlot:'ocupado'});
    return {primary:r.primary,excluded:r.excluded.map(x=>x.reason),
     notice:review.advisories.some(x=>x.includes('já consta como adicional informado')),
     canSave:review.canSave,slot:r.slot.status};
   }""")
   assert audited=={
    'primary':'Agilidade',
    'excluded':['ja_informado_como_adicional','ja_informado_como_adicional'],
    'notice':True,'canSave':True,'slot':'slot_ocupado'},audited
   page.locator('#friend-new-card').click()
   # V360: abrir os campos avançados como o usuário antes de validar/salvar.
   page.locator('details.friend-card-advanced > summary').click()
   page.locator('#friend-card-name').fill('V349 inventário multilinha')
   page.locator('#friend-card-edition').fill('Edição ensaio V349')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-fixed-booster').fill('Defesa')
   page.locator('#friend-card-booster').fill('Regista; Técnica\nForça')
   page.locator('#friend-card-booster-slot').select_option('ocupado')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=30000)
   root.locator('.ct326-primary-action').click()
   page.wait_for_function("""() => !!document.querySelector(
    '#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   root.locator('.ct331-role-open').click()
   root.locator('.ct324-profile').wait_for(timeout=25000)
   assert root.locator('.ct324-booster').count()==1
   assert 'Regista; Técnica' in root.inner_text()
   assert not [x for x in errors if x!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   ctx.close()
 finally:
  browser.close()
print('V349 CHROMIUM PASS: inventário de ímpetos multilinha, editor real e desempenho visual Android/Windows.')
