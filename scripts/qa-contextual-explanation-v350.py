#!/usr/bin/env python3
"""V350 — justificativas ligadas ao alias V162 e ímpeto elegível, Android/Windows."""
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
   res=page.evaluate("""() => {
    const guide=window.CRAQUE_FICHA_DECISION_V327;
    const api=window.CRAQUE_MANAGER_FICHAS_V324;
    const v162=window.SCOUT_RECOMMENDATIONS_V162;
    if(!guide||!api||!v162?.keyFor)return null;
    const recommended=[{name:'Passe de primeira',why:'Tabela no MAT'}];
    const ranking=api.reviewBoosterRanking(
     {name:'Técnica',reason:'Motivo do fixo'},
     [{name:'Força',reason:'Complemento por função'}],
     'Técnica','','ocupado');
    const reason=guide.explainEquipment(
     guide.equipmentSummary({skills:['One-touch Pass'],booster:'Técnica'}),
     recommended,{primary:ranking.primaryInfo,alternatives:ranking.alternatives},
     v162.keyFor);
    const fresh=guide.explainEquipment(
     guide.equipmentSummary({skills:[],booster:'Força'}),recommended,
     {primary:ranking.primaryInfo,alternatives:ranking.alternatives},v162.keyFor);
    return {
     alias:reason.skills[0].matchedBy,
     why:reason.skills[0].reason,
     stale:reason.booster.status,
     fresh:fresh.booster.reason,blocked:ranking.excluded.length
    };
   }""")
   assert res=={
    'alias':'alias_v162_documentado','why':'Tabela no MAT',
    'stale':'motivo_pendente','fresh':'Complemento por função','blocked':1
   },res
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V350 razões por habilidade')
   page.locator('#friend-card-edition').fill('Edição de teste V350')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-fixed-booster').fill('Técnica')
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
   explain=root.locator('details.ct336-equipment-evidence').first
   explain.wait_for(timeout=30000)
   explain.locator('summary').click()
   assert 'Ímpeto adicional' in explain.inner_text()
   assert 'Por que estas habilidades e ímpeto?' in explain.inner_text()
   assert not [err for err in errors if err!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   ctx.close()
 finally:browser.close()
print('V350 CHROMIUM PASS: motivos por alias V162, ímpetos filtrados e painel Premium Android/Windows.')
