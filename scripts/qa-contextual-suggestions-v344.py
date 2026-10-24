#!/usr/bin/env python3
"""V344 — Chromium: painel/editor coerentes, slot sem ímpeto aplicável e legado intacto."""
import os,shutil
from playwright.sync_api import sync_playwright
URL=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 executable=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=executable,
    args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(URL+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',
    wait_until='domcontentloaded',timeout=40000)
   # Teste da API REAL que alimenta painel + editor, com entrada reproduzível.
   checked=page.evaluate("""() => {
    const p=window.CRAQUE_MANAGER_FICHAS_V324;
    if(!p?.screenContextualSuggestions)return null;
    const r=p.screenContextualSuggestions([
     {name:'Passe de primeira',why:'Combina com posse'},
     {name:'Toque duplo',why:'Escape'},
     {name:'toque  DUPLO',why:'Repetida'},
     {name:'Interceptação',why:'Marcação'}],
     'Passe de primeira','', 'Técnica','ausente');
    return {names:r.skills.map(x=>x.name),excluded:r.excluded.map(x=>x.reason),
     booster:r.boosterCandidate,theoretical:r.theoreticalBooster}
   }""")
   assert checked=={'names':['Toque duplo','Interceptação'],
    'excluded':['nativa_cadastrada','repetida_na_proposta'],
    'booster':None,'theoretical':'Técnica'},checked
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('V344 Evidence Consistent')
   page.locator('#friend-card-edition').fill('Edição de ensaio V344')
   page.locator('#friend-card-gameid').fill('105297')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-native').fill('Passe de primeira')
   page.locator('#friend-card-booster-slot').select_option('ausente')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('#friend-analysis-dialog .ct311-positional')
   root.wait_for(timeout=30000)
   root.locator('.ct326-primary-action').click()
   page.wait_for_function("""() => !!document.querySelector(
    '#friend-manager-version option[value="CT-MGR-071"]')""",timeout=30000)
   page.locator('#friend-manager-version').select_option('CT-MGR-071')
   root.locator('.ct331-role-open').click()
   box=root.locator('.ct324-profile')
   box.wait_for(timeout=25000)
   assert box.locator('.ct343-slot-evidence').count()==1
   # Nenhum candidato novo de ímpeto para um slot AUSENTE.
   opts=box.locator('select.ct324-booster option')
   assert opts.count()==1,[opts.nth(i).inner_text() for i in range(opts.count())]
   assert opts.first.input_value()==''
   panel=root.locator('.ct311-panel').filter(has_text='Ímpetos · posição')
   assert panel.count()>=1
   assert 'SEM SLOT ADICIONAL' in panel.first.inner_text()
   hero=root.locator('.ct326-focus')
   assert 'Sem slot adicional cadastrado' in hero.inner_text()
   # Testar a consistência da lista vista na UI, SEM gravar nenhuma skill.
   before=page.evaluate("""() => JSON.stringify(Object.keys(localStorage).sort()
      .map(k=>[k,localStorage.getItem(k)]))""")
   visible=box.locator('.ct324-skill-option span').all_inner_texts()
   raw=page.evaluate("""() => window.CRAQUE_MANAGER_FICHAS_V324.screenContextualSuggestions(
     [{name:'Passe de primeira'},{name:'Toque duplo'}],
     'Passe de primeira','','','ausente').skills.map(x=>x.name)""")
   assert raw==['Toque duplo']
   assert 'Passe de primeira' not in visible,'Skill nativa não deve reaparecer como NOVA sugestão'
   after=page.evaluate("""() => JSON.stringify(Object.keys(localStorage).sort()
      .map(k=>[k,localStorage.getItem(k)]))""")
   assert before==after,'Leitura da UI e do filtro nunca grava'
   assert not [x for x in errors if x!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3
   ctx.close()
 finally:
  browser.close()
print('V344 CHROMIUM PASS: filtros coerentes da edição, slot ausente teórico e nenhum salvamento na consulta Android/Windows.')
