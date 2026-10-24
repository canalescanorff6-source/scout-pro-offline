#!/usr/bin/env python3
"""V348 — ranking de ímpetos para o contexto real, com histórico intacto."""
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
   reviewed=page.evaluate("""() => {
     const p=window.CRAQUE_MANAGER_FICHAS_V324;
     if(!p?.reviewBoosterRanking)return null;
     const ranked=p.reviewBoosterRanking(
      {name:'Técnica',reason:'Original'},
      [{name:'Regista',reason:'Já informado'},
       {nome:'Força',motivo:'Recuperação defensiva'},
       {name:'forca',reason:'Duplicata'}],
      'tecnica','Regista','ocupado');
     const without=p.reviewBoosterRanking('Técnica',['Força'],'','','ausente');
     return {name:ranked.primary,reason:ranked.primaryInfo?.reason,
       excluded:ranked.excluded.map(x=>x.reason),
       slot:ranked.slot.status,absent:without.primary,
       theoretical:without.theoretical.map(x=>x.name)};
   }""")
   assert reviewed=={
    'name':'Força','reason':'Recuperação defensiva',
    'excluded':['mesmo_nome_do_fixo','ja_informado_como_adicional',
                'repetido_no_ranking'],
    'slot':'slot_ocupado','absent':None,
    'theoretical':['Técnica','Força']},reviewed
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V348 ranking de ímpetos')
   page.locator('#friend-card-edition').fill('Edição simulada V348')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-fixed-booster').fill('Técnica')
   page.locator('#friend-card-booster').fill('Regista')
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
   panel=root.locator('.ct311-panel').filter(has_text='Ímpetos · posição').first
   assert 'Ímpeto fixo: Técnica' in panel.inner_text()
   assert 'Slot: ocupado' in panel.inner_text()
   assert root.locator('.ct324-booster').count()==1
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   ctx.close()
 finally:
  browser.close()
print('V348 CHROMIUM PASS: ranking de ímpetos sem candidatos repetidos, slot documental, ficha Android/Windows.')
