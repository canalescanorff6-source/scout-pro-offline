#!/usr/bin/env python3
"""V326 — navegação simples, foco real e análises aprofundadas em dois viewports.
Capturas são testes de interface e não substituem testes físicos APK/EXE.
"""
import os,shutil
from playwright.sync_api import sync_playwright
ROOT=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   context=browser.new_context(viewport={'width':width,'height':height},
       is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=context.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(ROOT+'/index.html',wait_until='domcontentloaded')
   tiles=page.locator('.scout-v189-quick .scout-v189-tile')
   tiles.first.wait_for(timeout=25000)
   assert tiles.count()==4, 'A tela inicial não deve exibir atalhos em excesso'
   assert [t.locator('strong').inner_text() for t in tiles.all()]==[
    'Minhas Cartas','Outros Elencos','Escalação','Laboratório']
   assert [t.get_attribute('href') for t in tiles.all()]==[
    '#catalogo','outros-elencos-v227.html','meu-time-duas-formacoes-v177.html','meu-time-testes-v219.html']
   assert not page.locator('.scout-v189-extra').evaluate('(node)=>node.open')
   page.locator('.scout-v189-extra > summary').click()
   assert page.locator('.scout-v189-extra-links a[href="revisao-impetos-v103.html"]').count()>0
   assert page.locator('.scout-v189-extra-links a[href="player-model-v101.html"]').count()>0
   assert page.locator('.scout-v326-managers-entry').count()==1
   # Erro legado conhecido do filtro na home: documentado separadamente.
   # Não misturar erro anterior do catálogo com regressão no novo acervo.
   known='Scout PRO: carta sem estilo para filtro #1'
   assert not [e for e in errors if e!=known],errors
   errors.clear()
   # O próprio atalho navega para o acervo, não é um botão decorativo.
   tiles.nth(1).click()
   page.wait_for_url('**/outros-elencos-v227.html',timeout=20000)
   page.locator('#friend-new-card').click()
   page.locator('#friend-card-name').fill('Visual V326')
   page.locator('#friend-card-position').select_option('MAT')
   page.locator('#friend-card-level').fill('35')
   page.locator('#friend-dialog-save').click()
   page.locator('.friends-card .friends-analysis-action').first.click()
   root=page.locator('.ct311-positional')
   root.wait_for(timeout=25000)
   assert root.locator('.ct326-focus').is_visible()
   # V331: a ficha mostra posição e formação sem despejar dois seletores.
   assert root.locator('.ct331-role-overview').is_visible()
   assert 'Em análise:' in root.locator('.ct331-role-current').inner_text()
   assert not root.locator('.ct331-role-chooser').evaluate('(e)=>e.open')
   assert not root.locator('.ct311-controls .ct311-select').is_visible()
   prior=page.evaluate("""() => JSON.stringify(
     Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v311:')).sort())""")
   root.locator('.ct331-role-open').click()
   assert root.locator('.ct331-role-chooser').evaluate('(e)=>e.open')
   assert root.locator('.ct311-controls .ct311-select').is_visible()
   assert prior==page.evaluate("""() => JSON.stringify(
     Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v311:')).sort())"""),(
      'Abrir a escolha de posição não deve salvar fichas')
   assert not root.locator('.ct326-deep-dive').evaluate('(e)=>e.open'), 'Análise avançada inicia fechada'
   assert 'FICHA EM FOCO' in root.locator('.ct326-focus').inner_text()
   assert root.locator('.ct326-metric').count()==3
   assert 'não equipado automaticamente' in root.locator('.ct326-focus').inner_text() or 'Escolha o técnico' in root.locator('.ct326-focus').inner_text()
   assert not root.locator('.ct311-actions').is_visible(), 'Ações complexas devem ficar no detalhamento'
   root.locator('.ct326-primary-action').click()
   assert root.locator('.ct326-deep-dive').evaluate('(e)=>e.open')
   assert root.locator('.ct311-actions').is_visible()
   assert '68 PP exatos distribuídos' in root.inner_text()
   root.locator('.ct311-controls .ct311-select').select_option('SA')
   assert root.locator('.ct326-deep-dive').evaluate('(e)=>e.open'), 'Troca de posição não pode fechar ficha aberta'
   assert 'Cenário SA' in root.inner_text()
   root.locator('.ct326-secondary-action').click()
   assert root.locator('.ct327-style-panel').is_visible()
   assert root.locator('.ct327-style-row').count()==5
   root.locator('.ct311-compare > summary').click()
   assert root.locator('.ct311-compare').evaluate('(e)=>e.open')
   assert 'Comparar MAT × SA' in root.inner_text()
   assert not errors,errors
   overflow=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert overflow<=3, f'Overflow horizontal {overflow}px em {platform}'
   context.close()
 finally:
  browser.close()
print('V326 CHROMIUM PASS: quatro atalhos, ficha em foco, análise aberta, posição SA e comparação, Android/Windows.')
