#!/usr/bin/env python3
"""Verificação V311 de troca posicional nos dois acervos."""
import os,shutil
from playwright.sync_api import sync_playwright
ROOT=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as p:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=p.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for label,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(ROOT+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
   page.locator('#friend-new-card').click()
   # V360: navegar até as opções avançadas antes de escolher slot.
   page.locator('details.friend-card-advanced > summary').click()
   page.locator('#friend-card-name').fill('Cenário MAT SA')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-card-booster-slot').select_option('vazio')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('.ct311-positional')
   root.wait_for(timeout=25000)
   # V326: a ficha principal é compacta; abrir detalhes preserva integralmente
   # o mesmo motor, revisões e recomendações testados pelas versões antigas.
   assert not root.locator('.ct326-deep-dive').evaluate('(e) => e.open')
   assert 'FICHA EM FOCO' in root.inner_text()
   root.locator('.ct326-deep-dive > summary').click()
   # V321: relato de slot vazio na conta NÃO valida disponibilidade do
   # segundo slot na edição; ranking segue consultivo em ambas as telas.
   page.locator('#friend-analysis-sections [data-panel="boost"]').click()
   boost_view=page.locator('#friend-analysis-content [data-panel="boost"]')
   assert 'Slot relatado vazio, mas a edição não possui prova independente' in boost_view.inner_text()
   assert 'NÃO gastar tokens' in boost_view.inner_text()
   assert 'Ranking' in boost_view.inner_text() or 'ranking' in boost_view.inner_text()
   page.locator('#friend-analysis-sections [data-panel="treino"]').click()
   assert '68 PP exatos distribuídos' in root.inner_text()
   root.locator('.ct331-role-open').click()
   selector=root.locator('.ct311-controls .ct311-select')
   assert selector.input_value()=='MAT'
   selector.select_option('SA')
   assert 'Cenário SA' in root.inner_text()
   assert 'Mapa de posições' in root.inner_text()
   root.locator('.ct311-positions-map summary').click()
   assert 'SA —' in root.locator('.ct311-positions-map').inner_text()
   assert 'não confirmad' in root.locator('.ct311-positions-map').inner_text().lower()
   assert '68 PP exatos distribuídos' in root.inner_text()
   assert 'MAT → SA' in page.locator('#friend-analysis-badges').inner_text()
   assert 'Ataque:' in root.inner_text() and 'Defesa:' in root.inner_text()
   assert 'Slots livres não são presumidos' in root.inner_text()
   assert 'Ranking consultivo' in root.inner_text()
   root.locator('.ct311-button').first.click()
   assert 'Revisão 1 salva' in root.inner_text()
   snapshot=page.evaluate("""() => {
    const e=JSON.parse(localStorage.getItem('scoutpro:v311:position-scenarios')).entries;
    const v=Object.values(e).flat().find(r=>r.selectedPosition==='SA'&&r.style==='posse');
    return {rank:!!v?.boosterRanking,focus:!!v?.focus?.priority,
     roles:!!v?.responsibilities?.offense,skills:Array.isArray(v?.recommendations)}
   }""")
   assert all(snapshot.values()),snapshot
   selector.select_option('MAT')
   root.locator('.ct311-button').first.click()
   # Simular revisão MAT anteriormente validada com prioridades distintas.
   # A comparação deve exibir o registro salvo, não recomputar a MAT por cima.
   page.evaluate("""() => {
    const key='scoutpro:v311:position-scenarios';
    const payload=JSON.parse(localStorage.getItem(key));
    const revision=Object.values(payload.entries).flat().find(x=>
      x.selectedPosition==='MAT'&&x.style==='posse');
    if(!revision)throw Error('Revisão MAT não salva');
    revision.focus.priority=['Prioridade original MAT preservada'];
    revision.recommendations=[{name:'Habilidade MAT registrada',why:'Evidência anterior'}];
    revision.boosterRanking={primary:{name:'Ímpeto MAT registrado',reason:'Função MAT'},alternatives:[]};
    localStorage.setItem(key,JSON.stringify(payload));
   }""")
   selector.select_option('SA')
   assert 'revisão salva restaurada' in root.inner_text().lower()
   root.locator('.ct311-compare summary').click()
   comparison=root.locator('.ct311-compare').inner_text()
   assert 'Prioridade original MAT preservada' in comparison,comparison
   assert 'Habilidade MAT registrada' in comparison,comparison
   assert 'Ímpeto MAT registrado' in comparison,comparison
   # V318: duas revisões SA independentes, versão antiga consultável sem sobrescrita.
   root.locator('.ct311-button').first.click()
   revisionSelect=root.locator('.ct318-revision-select')
   assert revisionSelect.locator('option').count()==2
   page.evaluate("""() => {
      const key='scoutpro:v311:position-scenarios',payload=JSON.parse(localStorage.getItem(key));
      const revisions=Object.values(payload.entries).find(rows=>
        Array.isArray(rows)&&rows.length===2&&rows[0].selectedPosition==='SA'&&rows[0].style==='posse');
      if(!revisions)throw Error('Não encontrou duas revisões SA');
      revisions[0].recommendations=[{name:'Habilidade SA antiga preservada',why:'Histórico do proprietário'}];
      localStorage.setItem(key,JSON.stringify(payload));
   }""")
   revisionSelect.select_option('0')
   assert 'Habilidade SA antiga preservada' in root.inner_text()
   selector.select_option('MAT')
   selector.select_option('SA')
   assert root.locator('.ct318-revision-select').input_value()=='0'
   assert 'Habilidade SA antiga preservada' in root.inner_text()
   root.locator('.ct318-revision-select').select_option('1')
   assert 'Habilidade SA antiga preservada' not in root.inner_text()
   # V320: o vetor de dez categorias pode ser estruturalmente válido, mas
   # custo 0 != orçamento 68 PP. A ficha deve permanecer somente histórica.
   page.evaluate("""() => {
     const key='scoutpro:v311:position-scenarios';
     const payload=JSON.parse(localStorage.getItem(key));
     const rows=Object.values(payload.entries).find(items=>
       Array.isArray(items)&&items.length===2&&
       items[1].selectedPosition==='SA'&&items[1].style==='posse');
     if(!rows)throw Error('Histórico SA não localizado');
     rows[1].levels=Array(10).fill(0);
     rows[1].recommendations=[{name:'Skill indevida V320',why:'vetor errado'}];
     localStorage.setItem(key,JSON.stringify(payload));
   }""")
   selector.select_option('MAT')
   selector.select_option('SA')
   assert 'DESATUALIZADA' in root.inner_text()
   assert 'Skill indevida V320' not in root.inner_text(),root.inner_text()
   assert 'desatualizada' in root.locator('.ct318-revision-select option').nth(1).inner_text()
   assert '68 PP exatos distribuídos' in root.inner_text()
   page.locator('#friend-analysis-modes [data-style=rapido]').click()
   # Histórico ilegível deve bloquear gravação, sem apagá-lo.
   page.evaluate("""() => {
      window._validScenarioBackup=localStorage.getItem('scoutpro:v311:position-scenarios');
      localStorage.setItem('scoutpro:v311:position-scenarios','{historico-invalido');
   }""")
   selector.select_option('MAT')
   assert 'GRAVAÇÃO BLOQUEADA' in root.locator('.ct311-status').inner_text()
   assert root.locator('.ct311-button').first.is_disabled()
   assert page.evaluate("localStorage.getItem('scoutpro:v311:position-scenarios')")== '{historico-invalido'
   page.evaluate("""() => localStorage.setItem(
      'scoutpro:v311:position-scenarios',window._validScenarioBackup)""")
   selector.select_option('SA')
   assert 'GRAVAÇÃO BLOQUEADA' not in root.locator('.ct311-status').inner_text()
   assert 'Cenário SA · rapido' in root.inner_text()
   page.goto(ROOT+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
   main=page.locator('.ct311-main-slot .ct311-positional')
   try:main.wait_for(timeout=35000)
   except Exception:
    print('V311_MAIN_DIAG',page.evaluate("""() => ({
     page:document.body?.dataset?.page,hero:!!document.querySelector('#scout-v220-hero'),
     detail:!!document.querySelector('#scout-v68-data'),
     v311Engine:!!window.CRAQUE_POSITIONAL_V311,
     v311UI:!!window.CRAQUE_POSITIONAL_UI_V311,
     v228:!!window.CRAQUE_FRIEND_TRAINING_V228,
     scripts:[...document.scripts].filter(x=>x.src.includes('v311')||x.src.includes('v228')).map(x=>x.src),
     errorNodes:[...document.querySelectorAll('.ct311-positional')].length
    })"""), 'JS_ERRORS',errors)
    raise
   assert not main.locator('.ct326-deep-dive').evaluate('(e) => e.open')
   main.locator('.ct326-deep-dive > summary').click()
   assert 'Posição original: CA' in main.locator('.ct311-origin').text_content()
   main.locator('.ct331-role-open').click()
   main.locator('.ct311-controls .ct311-select').select_option('SA')
   assert 'Cenário SA' in main.inner_text()
   assert 'PP exatos distribuídos' in main.inner_text()
   assert 'Mapa de posições' in main.inner_text()
   main.locator('.ct311-positions-map summary').click()
   assert 'Posição original' in main.inner_text()
   evidence=page.evaluate("""async () => {
      const catalog=await (await fetch('../SCOUT_V69_AUDITORIA.json')).json();
      const card=catalog.cards.find(x=>x.numero===1);
      return window.SCOUT_POSITION_TRAINING_V246.confirm(card,'SA',true,localStorage,'familiar').status;
   }""")
   assert evidence=='familiar',evidence
   page.wait_for_function("""() => {
    const x=document.querySelector('.ct311-positions-map');
    return x&&x.textContent.includes('Familiaridade existente');
   }""",timeout=9000)
   assert 'Familiaridade existente' in main.inner_text()
   assert 'Ataque:' in main.inner_text() and 'Defesa:' in main.inner_text()
   assert page.evaluate("JSON.parse(document.getElementById('scout-v68-data').textContent).shown_position")=='AC'
   assert not errors,errors
   ctx.close()
 finally:
  browser.close()
print('V311 QA PASS: ambos os acervos, MAT SA MAT, cinco táticas e original intacto.')
