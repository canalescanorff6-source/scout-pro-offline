#!/usr/bin/env python3
"""V345: conferir identidade documental das habilidades V162 no Chromium real."""
import os,shutil
from playwright.sync_api import sync_playwright
URL=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 executable=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=executable,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for kind,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(URL+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
    wait_until='domcontentloaded',timeout=40000)
   check=page.evaluate("""() => {
    const evidence=window.SCOUT_RECOMMENDATIONS_V162?.keyFor;
    const profiles=window.CRAQUE_MANAGER_FICHAS_V324;
    if(typeof evidence!=='function'||!profiles?.skillEvidenceKey)return null;
    const r=profiles.screenContextualSuggestions([
     {name:'Passe de primeira',why:'Posse de bola'},
     {name:'Toque duplo',why:'Giro curto'},
     {name:'Interceptação',why:'Defesa'}],
     'One-touch Pass\\nThrough Passing','Double Touch','','pendente',evidence);
    const train=[10,5,5,8,8,6,0,0,0,0];
    const readiness=profiles.reviewDraftReadiness({
     train,budget:62,skills:['Passe de primeira'],
     native:'One-touch Pass',skillKeyFor:evidence});
    return {names:r.skills.map(x=>x.name),reasons:r.excluded.map(x=>x.reason),
     ready:readiness.canSave,conflicts:readiness.audit.conflicts.map(x=>x.name),
     one:evidence('One-touch Pass'),portuguese:evidence('Passe de primeira')};
   }""")
   assert check=={
    'names':['Interceptação'],
    'reasons':['nativa_cadastrada','adicional_informada'],
    'ready':False,'conflicts':['Passe de primeira'],
    'one':'onepass','portuguese':'onepass'},check
   # Validar no editor real e histórico independente sem alterar treino salvo.
   page.locator('#friend-new-card').click()
    # V360: abrir os campos avançados como o usuário antes de validar/salvar.
    page.locator('details.friend-card-advanced > summary').click()
   page.locator('#friend-card-name').fill('V345 Alias')
   page.locator('#friend-card-edition').fill('Edição de ensaio V345')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-native').fill('One-touch Pass')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=30000)
   root.locator('.ct326-primary-action').click()
   page.wait_for_function("""() => !!document.querySelector(
     '#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   root.locator('.ct331-role-open').click()
   box=root.locator('.ct324-profile');box.wait_for(timeout=30000)
   save=box.get_by_role('button',name='Salvar ficha independente deste técnico')
   assert save.is_enabled()
   save.click()
   page.wait_for_function("""() => Object.keys(localStorage).some(k=>
    k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""",timeout=12000)
   key=page.evaluate("""() => Object.keys(localStorage).find(k=>
    k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""")
   page.evaluate("""key => {
     const x=JSON.parse(localStorage.getItem(key));
     x.revisions[x.revisions.length-1].skills=['Passe de primeira'];
     localStorage.setItem(key,JSON.stringify(x));
   }""",key)
   role=root.locator('.ct311-controls .ct311-select')
   role.select_option('SA');role.select_option('MAT')
   box=root.locator('.ct324-profile')
   box.wait_for(timeout=15000)
   note=box.locator('.ct342-live-audit')
   assert note.get_attribute('data-status')=='revisar_habilidades'
   assert 'NÃO SALVAR' in note.inner_text()
   assert box.get_by_role('button',name='Salvar ficha independente deste técnico').is_disabled()
   before=page.evaluate('key => localStorage.getItem(key)',key)
   alias=box.locator('.ct324-skill-option').filter(has_text='Passe de primeira')
   assert alias.count()==1
   alias.locator('input').uncheck()
   assert box.get_by_role('button',name='Salvar ficha independente deste técnico').is_enabled()
   assert page.evaluate('key => localStorage.getItem(key)',key)==before
   assert not [x for x in errors if x!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   ctx.close()
 finally:
  browser.close()
print('V345 CHROMIUM PASS: aliases documentados V162, nativas multilinha, bloqueio live e histórico intacto Android/Windows.')
