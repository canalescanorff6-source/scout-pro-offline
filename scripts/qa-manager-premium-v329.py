#!/usr/bin/env python3
"""V329: Chrome headless real nas fichas pessoais e Central Premium, Android/Windows.
Sem criar ou alterar builds de usuários. Valida seleção por edição e filtros locais.
"""
import os,shutil
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal

BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
 executable=(shutil.which('google-chrome') or shutil.which('google-chrome-stable')
    or shutil.which('chromium'))
 browser=pw.chromium.launch(headless=True,executable_path=executable,
    args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for name,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   context=browser.new_context(viewport={'width':width,'height':height},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   # Primeiro, selecionar técnico numa das 246 fichas pessoais originais.
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',
    wait_until='domcontentloaded',timeout=45000)
   page.locator('#ct-manager-select').wait_for(state='attached',timeout=35000)
   reveal(page.locator('#ct-manager-select'))
   page.locator('#ct-manager-search').wait_for(timeout=35000)
   select=page.locator('#ct-manager-select')
   search=page.locator('#ct-manager-search')
   scope=page.locator('#ct-manager-scope')
   fav=page.locator('#ct-manager-favorite')
   page.wait_for_function("""() => !!document.querySelector(
      '#ct-manager-select option[value="CT-MGR-071"]')""",timeout=35000)
   assert scope.input_value()=='featured'
   assert select.locator('option[value^="CT-MGR-"]').count()==23
   reveal(select)
   select.select_option('CT-MGR-071')
   assert select.input_value()=='CT-MGR-071'
   assert page.locator('#ct-manager-count').is_visible()
   assert '90' in page.locator('#ct-manager-details').inner_text()
   assert page.locator('.ct-manager-v329-more').count()==1
   assert not page.locator('.ct-manager-v329-more').evaluate('(el)=>el.open')
   assert page.locator('.ct-manager-v329-more .ct-manager-score').count()==5
   # Capturar somente o vínculo de técnico; a busca e favoritos não o mudam.
   original=page.evaluate("""() => {
    const data=JSON.parse(document.querySelector('#scout-v68-data').textContent);
    return localStorage.getItem('scoutpro:v307:manager-selection:'+
      data.capture+'@'+data.id);
   }""")
   search.fill('Kovac')
   assert select.locator('option[value="CT-MGR-071"]').count()==1
   search.fill('Klopp')
   assert select.locator('option[value^="CT-MGR-"]').count()==3, 'Dois Klopp + escolhido preservado'
   assert select.input_value()=='CT-MGR-071'
   scope.select_option('favorites')
   assert select.input_value()=='CT-MGR-071', 'Filtro não pode apagar a seleção'
   assert original==page.evaluate("""() => {
    const data=JSON.parse(document.querySelector('#scout-v68-data').textContent);
    return localStorage.getItem('scoutpro:v307:manager-selection:'+
      data.capture+'@'+data.id);
   }"""), 'Pesquisar não pode reescrever o técnico da carta'
   fav.click()
   assert fav.get_attribute('aria-pressed')=='true'
   assert 'CT-MGR-071' in page.evaluate("""() => JSON.parse(
    localStorage.getItem('scoutpro:v307:manager-favorites'))""")
   scope.select_option('all')
   search.fill('')
   assert select.locator('option[value^="CT-MGR-"]').count()==71
   page.locator('.ct-manager-v329-more > summary').click()
   assert page.locator('.ct-manager-v329-more').evaluate('(el)=>el.open')
   assert page.locator('.ct-manager-v329-more .ct-manager-score').first.is_visible()
   page.locator('#ct-manager-style').select_option('rapido')
   assert page.locator('.ct-manager-v329-more').evaluate('(el)=>el.open'),(
     'Abrir os detalhes deve permanecer ao trocar de estilo')
   assert '67' in page.locator('#ct-manager-details').inner_text()
   # Navegar para Central com os mesmos favoritos em armazenamento.
   page.goto(BASE+'/tecnicos-v307.html',wait_until='domcontentloaded',timeout=30000)
   page.wait_for_function("document.querySelectorAll('.hub-card').length===23",timeout=30000)
   card=page.locator('.hub-card').first
   assert 'CT-MGR-071' in card.locator('.hub-sub').inner_text()
   assert card.locator('.hub-v329-primary-score .hub-score').count()==1
   assert card.locator('.hub-v329-other-scores .hub-score').count()==5
   assert not card.locator('.hub-v329-other-scores').evaluate('(el)=>el.open')
   assert card.locator('.hub-v329-primary-score .hub-score').is_visible()
   assert not card.locator('.hub-v329-other-scores .hub-score').first.is_visible()
   card.locator('.hub-v329-other-scores > summary').click()
   assert card.locator('.hub-v329-other-scores .hub-score').first.is_visible()
   # A Central atualiza apenas a proficiência EM FOCO, sem regravar a carta.
   page.locator('#hub-style').select_option('rapido')
   top=page.locator('.hub-card').filter(has_text='Niko Kovač').first
   assert 'Rápido' in top.locator('.hub-v329-kicker').inner_text()
   assert top.locator('.hub-v329-other-scores').evaluate('(el)=>el.open'),(
    'Abertura de outras proficiências deve sobreviver à troca de filtro')
   page.locator('#hub-scope').select_option('favorites')
   assert page.locator('.hub-card').count()==1
   assert 'CT-MGR-071' in page.locator('.hub-card .hub-sub').first.inner_text()
   page.locator('#hub-scope').select_option('all')
   page.locator('#hub-style').select_option('')
   page.wait_for_function("document.querySelectorAll('.hub-card').length===71",timeout=25000)
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   overflow=page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   assert overflow<=3,name+' overflow: '+str(overflow)
   context.close()
 finally:
  browser.close()
print('V329 CHROMIUM PASS: 23/71 versões, filtro e favoritos nas fichas pessoais, proficiência em foco e 5 secundárias, Android/Windows.')
