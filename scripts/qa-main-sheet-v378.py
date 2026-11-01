"""Ficha única real, perfis descartáveis; sem acessar dados do app instalado."""
import os,shutil,json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path('artifacts/visual-qa/v378');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 try:
  for name,width,height in [('android320',320,700),('android390',390,844),('windows1366',1366,768)]:
   ctx=browser.new_context(viewport={'width':width,'height':height});page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
   primary=page.locator('.ct378-main-sheet');primary.wait_for(timeout=25000)
   page.wait_for_function('()=>document.body.dataset.ct378Stage==="ready"')
   more=page.locator('.ct378-sheet-options').first
   assert not more.evaluate('(e)=>e.open')
   assert page.locator('#scout-v220-training').is_hidden()
   assert page.locator('#scout-v220-recs').is_hidden()
   assert page.locator('.ct378-main-sheet:visible').count()==1
   archive=page.locator('#scout-v229-legacy-archive')
   assert archive.count()==1 and not archive.evaluate('(e)=>e.open')
   for section in ['#engenharia','#foco','#pontos','#jogar']:
    assert page.locator(section).is_hidden(),(name,section,'Bloco antigo ainda visível na ficha principal')
   assert primary.locator('.ct375-training').is_visible()
   assert primary.locator('.ct374-skill-reasons li').count()<=5
   assert primary.locator('.ct375-booster').count()<=1
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   page.screenshot(path=str(OUT/(name+'-principal.png')),full_page=False)
   more.locator(':scope > summary').click()
   assert page.locator('#scout-v220-training').is_visible()
   assert page.locator('#scout-v220-recs').is_visible()
   technical=page.locator('#scout-v220-technical')
   assert technical.locator('#scout-v229-legacy-archive').count()==1, 'Arquivo original precisa estar dentro do painel técnico'
   technical.locator(':scope > summary').click()
   assert technical.evaluate('(e)=>e.open')
   archive.locator(':scope > summary').click()
   assert page.locator('#engenharia').is_visible()
   assert page.locator('#pontos').is_visible()
   archive.locator(':scope > summary').click()
   technical.locator(':scope > summary').click()
   more.locator(':scope > summary').click()
   for style in ['rapido','normal','fora','longo','posse']:
    page.locator('#ct378-style').select_option(style)
    page.wait_for_function('(style)=>document.querySelector(".ct378-main-sheet")?.dataset.tactic===style',arg=style)
    assert page.locator('.ct378-main-sheet:visible').count()==1
    assert not page.locator('.ct378-sheet-options').first.evaluate('(e)=>e.open')
   # Guardar deve manter exatamente as habilidades/ímpeto vistos na proposta.
   page.evaluate("""() => localStorage.setItem('scoutpro:v307:default-manager',JSON.stringify({catalog_id:'CT-MGR-071',tactic:'posse'}))""")
   page.reload(wait_until='domcontentloaded')
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.manager==="CT-MGR-071"')
   skillnames=primary.locator('.ct374-skill-reasons > li > strong').all_text_contents()
   booster=primary.locator('.ct375-booster > h4').all_text_contents()
   primary.get_by_role('button',name='Guardar esta ficha em nova revisão',exact=True).click()
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.source==="profile"')
   assert primary.locator('.ct374-skill-reasons > li > strong').all_text_contents()==skillnames
   assert primary.locator('.ct375-booster > h4').all_text_contents()==booster
   # Perfil parcial e vazio permanece parcial e vazio, sem ser trocado por proposta cheia.
   page.evaluate("""() => {
    const key=Object.keys(localStorage).find(k=>k.startsWith('scoutpro:v324:manager-profile:'));
    const record=JSON.parse(localStorage.getItem(key));
    record.revisions.at(-1).train=[0,4,4,4,0,0,0,0,0,0];record.revisions.at(-1).skills=[];record.revisions.at(-1).booster='';
    localStorage.setItem(key,JSON.stringify(record));
   }""")
   page.reload(wait_until='domcontentloaded');primary.wait_for(timeout=25000)
   page.wait_for_function('()=>document.querySelector(".ct378-main-sheet")?.dataset.source==="profile"')
   assert '12 / 62 PP' in primary.locator('.ct311-budget').inner_text()
   assert primary.locator('.ct374-skill-reasons li').count()==0
   assert primary.locator('.ct375-booster').count()==0
   page.evaluate("""() => {Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copiedSheet=text}},configurable:true})}""")
   primary.get_by_role('button',name='Copiar ficha completa',exact=True).click()
   page.wait_for_function('()=>typeof window.__copiedSheet==="string"')
   assert '12 / 62' in page.evaluate('window.__copiedSheet')
   # Endereço direto e hashchange revelam a ferramenta antiga no agrupamento.
   page.goto(BASE+'/fichas/001_Daniele_Massaro.html#performance',wait_until='domcontentloaded')
   page.wait_for_function('()=>document.body.dataset.ct378Stage==="ready"')
   assert page.locator('#performance').is_visible()
   assert page.locator('.ct378-sheet-options').first.evaluate('(e)=>e.open')
   page.locator('.ct378-sheet-options > summary').first.click()
   page.evaluate("location.hash='status'")
   page.wait_for_function('()=>document.querySelector(".ct378-sheet-options")?.open')
   assert page.locator('#status').is_visible()
   # Duas cartas e dois técnicos não compartilham rascunhos implicitamente.
   page.goto(BASE+'/index.html',wait_until='domcontentloaded')
   page.locator('#search').fill('Karetsas')
   page.locator('[data-owned-id="ct364-01"]').click()
   page.locator('#ct364-panel .ct378-main-sheet').wait_for(timeout=25000)
   assert page.locator('#ct364-tabs [data-panel="treino"]').get_attribute('aria-pressed')=='true'
   select=page.locator('#ct378-owned-manager')
   select.select_option('CT-MGR-071')
   page.wait_for_function('()=>document.querySelector("#ct364-panel .ct378-main-sheet")?.dataset.manager==="CT-MGR-071"')
   assert page.locator('#ct364-panel .ct378-main-sheet:visible').count()==1
   assert page.locator('#ct364-panel .ct364-stats:visible').count()==0
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   page.screenshot(path=str(OUT/(name+'-adicionada.png')),full_page=False)
   owned=page.locator('#ct364-panel .ct378-main-sheet')
   owned.get_by_role('button',name='Guardar esta ficha em nova revisão',exact=True).click()
   page.wait_for_function('()=>document.querySelector("#ct364-panel .ct378-main-sheet")?.dataset.source==="profile"')
   page.evaluate("""() => {
    const key=Object.keys(localStorage).find(k=>k.startsWith('scoutpro:v374:function-draft:'));
    const row=JSON.parse(localStorage.getItem(key));
    row.levels=[0,4,4,4,0,0,0,0,0,0];row.pp=12;row.skills=[];row.booster=null;
    localStorage.setItem(key,JSON.stringify(row));
   }""")
   select.select_option('CT-MGR-001')
   page.wait_for_function('()=>document.querySelector("#ct364-panel .ct378-main-sheet")?.dataset.manager==="CT-MGR-001"')
   assert owned.get_attribute('data-source')=='proposal'
   select=page.locator('#ct378-owned-manager');select.select_option('CT-MGR-071')
   page.wait_for_function('()=>document.querySelector("#ct364-panel .ct378-main-sheet")?.dataset.source==="profile"')
   assert owned.locator('.ct311-budget').inner_text().startswith('12 / ')
   assert owned.locator('.ct374-skill-reasons li').count()==0
   assert owned.locator('.ct375-booster').count()==0
   owned.get_by_role('button',name='Guardar esta ficha em nova revisão',exact=True).click()
   page.wait_for_function("()=>Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:v374:function-draft:')).some(k=>JSON.parse(localStorage.getItem(k)).revision===2)")
   snapshot=page.evaluate("()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('scoutpro:v374:function-draft:'))))")
   assert snapshot['pp']==12 and not snapshot['skills'] and not snapshot['booster'] and len(snapshot['history'])==1
   page.locator('#ct364-jump').select_option('ct364-12')
   page.locator('#ct364-panel .ct378-main-sheet').wait_for(timeout=25000)
   assert page.locator('#ct364-panel .ct375-training').count()==0
   assert 'PP pendentes' in page.locator('#ct364-panel .ct378-main-sheet').inner_text()
   # Familiaridade de SA continua explicita; a navegação não altera a carta nativa.
   page.goto(BASE+'/fichas/090_Neymar_Jr.html',wait_until='domcontentloaded')
   page.locator('.ct378-main-sheet').wait_for(timeout=25000)
   page.locator('.ct331-role-open').click();page.locator('.ct311-controls .ct311-select').select_option('SA')
   assert 'SA' in page.locator('.ct331-role-current').inner_text()
   assert page.locator('.ct378-main-sheet').count()==1
   # Goleiro mantém somente grupos compatíveis, inclusive treino físico/aéreo registrado.
   keeper=page.evaluate("""async()=>{const d=await(await fetch('../index.html')).text();return new DOMParser().parseFromString(d,'text/html').querySelector('[data-cap="169"]').getAttribute('href')}""")
   page.goto(BASE+'/'+keeper,wait_until='domcontentloaded')
   page.locator('.ct378-main-sheet').wait_for(timeout=25000)
   assert page.locator('.ct378-main-sheet .ct375-training > div').count()==5
   assert not errors,(name,errors)
   (OUT/(name+'.json')).write_text(json.dumps({'errors':errors,'uniqueMainSheet':True,'advancedPreserved':True}),encoding='utf8')
   ctx.close()
 finally:browser.close()
print('V378 VISUAL PASS: uma ficha principal, cinco contextos, ferramentas preservadas e técnico nas adicionadas;3telas.')
