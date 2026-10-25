#!/usr/bin/env python3
"""V347 — ocupação DOCUMENTAL das cinco habilidades nos dois tamanhos."""
import os,shutil
from playwright.sync_api import sync_playwright
URL=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 executable=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=executable,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for device,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(URL+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
    wait_until='domcontentloaded',timeout=40000)
   state=page.evaluate("""() => {
     const p=window.CRAQUE_MANAGER_FICHAS_V324;
     const k=window.SCOUT_RECOMMENDATIONS_V162?.keyFor;
     if(!p?.reviewAdditionalCapacity || !k)return null;
     const pending=p.reviewAdditionalCapacity('',[],k);
     const full=p.reviewAdditionalCapacity('One-touch Pass;Double Touch;Through Passing;Interceptação;Bloqueador',
      ['Chute de primeira'],k);
     return {missing:pending.maxUnverifiedAdditional,count:full.informedCount,
       remaining:full.maxUnverifiedAdditional,swap:full.minReplacementsIfAllProposed};
   }""")
   assert state=={'missing':None,'count':5,'remaining':0,'swap':1},state
   page.locator('#friend-new-card').click()
    # V360: abrir os campos avançados como o usuário antes de validar/salvar.
    page.locator('details.friend-card-advanced > summary').click()
   page.locator('#friend-card-name').fill('V347 ocupação das adicionais')
   page.locator('#friend-card-edition').fill('Edição de teste V347')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-skills').fill(
    'One-touch Pass; Double Touch; Through Passing; Interceptação; Bloqueador')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=30000)
   root.locator('.ct326-primary-action').click()
   page.wait_for_function("""() => !!document.querySelector(
    '#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   root.locator('.ct331-role-open').click()
   cap=root.locator('.ct347-capacity-note')
   cap.wait_for(timeout=25000)
   assert '5/5 adicionais informadas' in cap.inner_text(),cap.inner_text()
   assert 'ALTERNATIVAS DE SUBSTITUIÇÃO' in cap.inner_text()
   editor=root.locator('.ct324-profile')
   editor.wait_for(timeout=25000)
   assert 'alternativas de substituição' in editor.inner_text()
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   ctx.close()
 finally:
  browser.close()
print('V347 CHROMIUM PASS: cinco adicionais sem vagas fictícias, alternativas claras, Android/Windows.')
