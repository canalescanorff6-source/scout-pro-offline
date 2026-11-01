"""Níveis/PP e fichas corrigidos, sem usar dados do programa instalado."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v381'));OUT.mkdir(parents=True,exist_ok=True)
cards=json.loads((ROOT/'web/SCOUT_V69_AUDITORIA.json').read_text(encoding='utf8'))['cards']
audit=json.loads((ROOT/'web/ct381-level-audit.json').read_text(encoding='utf8'))
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  for width,height in [(320,700),(390,844),(1366,768)]:
   ctx=browser.new_context(viewport={'width':width,'height':height});page=ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(BASE+'/conferir-progresso-v248.html?cap=41',wait_until='domcontentloaded')
   row=page.locator('.ct248-card[data-cap="41"]');row.wait_for(timeout=25000)
   assert '62 PP' in row.locator('.ct248-budget').inner_text()
   assert '32' in row.locator('.ct248-budget').inner_text()
   assert row.locator('.ct248-status').inner_text()=='Referência revisada'
   assert 'página pública mostra 26' in row.locator('.ct248-explanation').inner_text()
   assert '261 de 261' in page.locator('#v248-feedback').inner_text()
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   page.screenshot(path=str(OUT/f'{width}-conferencia-havertz.png'))
   for cap,level,pp in [(183,32,62),(196,34,66),(50,29,56)]:
    page.goto(BASE+f'/conferir-progresso-v248.html?cap={cap}',wait_until='domcontentloaded')
    owner=page.locator(f'.ct248-card[data-cap="{cap}"]');owner.wait_for(timeout=25000)
    assert owner.locator('.ct248-status').inner_text()=='Nível informado por você'
    assert f'{pp} PP' in owner.locator('.ct248-budget').inner_text()
    if cap==50:assert 'edição/ID exatos ainda precisam' in owner.locator('.ct248-explanation').inner_text()
   page.goto(BASE+'/conferir-progresso-v248.html?cap=41',wait_until='domcontentloaded');row.wait_for()
   # Uma conferência antiga continua legível, sem sobrescrever a fonte corrigida.
   old=page.evaluate('''async()=>{const c=(await(await fetch('SCOUT_V69_AUDITORIA.json')).json()).cards.find(c=>c.numero===41);
    const key='scoutpro:v248:level-review:41@'+c.id,record={schema:'CRAQUE_PROGRESS_REVIEW_V248',numero:41,card_id:c.id,name:c.name,edition:c.versao,level:26,pp:50,confirmed_in_game:true,source:'fixture descartável',confirmed_at:'2026-10-30T00:00:00Z'};
    localStorage.setItem(key,JSON.stringify(record));return {key,value:localStorage.getItem(key)}}''')
   page.reload(wait_until='domcontentloaded');row.wait_for()
   assert row.locator('.ct248-status').inner_text()=='PP divergentes'
   assert 'Catálogo: 62 PP' in row.locator('.ct248-budget').inner_text()
   assert page.evaluate('(k)=>localStorage.getItem(k)',old['key'])==old['value']
   page.evaluate('(k)=>localStorage.removeItem(k)',old['key'])
   for cap in [16,41,126,177,185,191,196,198,204,224]:
    c=next(c for c in cards if c['numero']==cap)
    page.goto(BASE+'/'+c['arquivo'],wait_until='domcontentloaded')
    sheet=page.locator('.ct378-main-sheet');sheet.wait_for(timeout=25000)
    page.wait_for_function('()=>document.querySelector(".ct378-main-sheet .ct381-level-note")',timeout=25000)
    assert sheet.locator('.ct311-budget').inner_text().startswith(f'{c["pp"]} / {c["pp"]} PP')
    if cap in [126,204]:
     assert sheet.locator('.ct374-skill-reasons li').count()==0
     assert sheet.locator('.ct375-booster').count()==0
     assert sheet.get_by_role('button',name='Guardar esta ficha em nova revisão',exact=True).is_disabled()
    for tactic in ['normal','rapido','fora','longo','posse']:
     page.locator('#ct378-style').select_option(tactic)
     page.wait_for_function('(t)=>document.querySelector(".ct378-main-sheet")?.dataset.tactic===t',arg=tactic)
     assert sheet.locator('.ct311-budget').inner_text().startswith(f'{c["pp"]} / {c["pp"]} PP')
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12,(cap,width)
    assert page.locator('.ct381-history-note').count()==2
    if cap==196:
     notice=page.locator('.ct377-notice > p').inner_text()
     assert '34 e 66 PP' in notice and 'informados por você' in notice and '82 PP' not in notice
     assert '82 PP' in page.locator('.ct381-previous-notice').inner_text()
     assert page.locator('.detail-header .hero-kpi').first.locator('strong').text_content()=='66 PP'
    if cap==41:
     sheet.evaluate('(e)=>scrollTo(0,e.getBoundingClientRect().top+scrollY-12)');page.screenshot(path=str(OUT/f'{width}-ficha-havertz.png'))
    results.append({'cap':cap,'width':width,'pp':c['pp'],'styles':5})
   page.goto(BASE+'/index.html?owned=ct364-12',wait_until='domcontentloaded')
   owned=page.locator('#ct364-panel .ct378-main-sheet');owned.wait_for(timeout=25000)
   assert '56 / 56 PP' in owned.locator('.ct311-budget').inner_text(),'Provedel documentado: nível29/56PP'
   assert not errors,(width,errors)
   ctx.close()
 finally:browser.close()
(OUT/'resultados.json').write_text(json.dumps({'checks':results,'errors':[]},indent=2),encoding='utf8')
print(f'V381 VISUAL PASS: {len(results)} fichas originais, cinco estilos, 3 próprias, conferência e histórico preservado em três telas; zero erros.')
