"""Remote CI only: actual card overlays, current training and coach context."""
import json, os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path('artifacts/visual-qa/v376');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox'])
 try:
  for name,width,height in [('android320',320,700),('android390',390,844),('windows1366',1366,768)]:
   ctx=browser.new_context(viewport={'width':width,'height':height})
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   held=[]
   page.route('**/ct376-card-references.json',lambda route:held.append(route))
   page.goto(BASE+'/index.html',wait_until='domcontentloaded')
   page.locator('#ct364-owned-grid [data-owned-id="ct364-01"]').wait_for(state='attached',timeout=25000)
   page.locator('#ct364-owned-section > summary').click()
   page.locator('[data-owned-id="ct364-01"]').click()
   page.locator('#ct364-dialog[open]').wait_for()
   for _ in range(20):
    if held:break
    page.wait_for_timeout(500)
   assert held,(name,'requisição de referências não interceptada')
   for route in held:route.continue_()
   page.unroute('**/ct376-card-references.json')
   page.locator('#ct364-panel .ct376-panel').wait_for(state='attached',timeout=30000)
   page.locator('.ct364-close').click()
   page.wait_for_function("()=>document.querySelectorAll('#cards .ct376-ovr').length===246",timeout=30000)
   page.wait_for_function("()=>document.querySelectorAll('#ct364-owned-grid .ct376-ovr').length===15",timeout=15000)
   compact=page.locator('#ct364-owned-grid .ct376-ovr').first.evaluate("""e=>({
    font:parseFloat(getComputedStyle(e.firstElementChild).fontSize),width:e.getBoundingClientRect().width,
    position:getComputedStyle(e).position})""")
   assert compact['font']<=18 and compact['width']>=28 and compact['position']=='absolute',(name,compact)
   assert page.locator('.ct376-error').count()==0
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   assert page.evaluate("()=>localStorage.getItem('scoutpro:v376:current-training:cap:90')") is None
   page.screenshot(path=str(OUT/(name+'-catalog.png')))
   page.goto(BASE+'/fichas/090_Neymar_Jr.html',wait_until='domcontentloaded')
   page.locator('.ct376-panel').wait_for(state='attached',timeout=30000)
   assert page.locator('#ct-manager-v302').count()==1,(name,'seletor de técnico duplicado durante carregamento concorrente')
   page.evaluate("""() => {
    const id='90@88039044980128';
    for(const k of ['scoutpro:v307:manager-selection:'+id,'craque:v302:manager-selection:'+id])localStorage.removeItem(k);
    localStorage.setItem('scoutpro:v307:default-manager',JSON.stringify({catalog_id:'CT-MGR-071',tactic:'posse'}));
    window.dispatchEvent(new Event('scoutpro:manager-selected-v302'));
   }""")
   page.wait_for_function("()=>document.querySelector('.ct376-ovr')?.title.includes('Niko Kovač')")
   panel=page.locator('.ct376-panel');panel.locator('summary').click()
   form=panel.locator('.ct376-training-form')
   for i in range(10):form.locator('input[type=number]').nth(i).fill('0')
   form.locator('input[type=checkbox]').check();form.locator('button[type=submit]').click()
   page.wait_for_function("()=>JSON.parse(localStorage.getItem(window.CRAQUE_RATING_CONTEXT_V376.trainingKey(window.CRAQUE_REFERENCES_V376.cards.find(c=>c.capture===90)))).confirmedByOwner===true")
   observed=panel.locator('form').nth(1)
   observed.locator('input[type=number]').fill('105');observed.locator('input[type=checkbox]').check()
   observed.locator('button[type=submit]').click()
   page.wait_for_function("()=>document.querySelector('.ct376-ovr')?.dataset.state==='observed'")
   assert page.locator('.ct376-ovr').first.locator('span').first.inner_text()=='105'
   page.locator('#ct-manager-v302').get_by_role('button',name='Sem técnico selecionado',exact=True).click()
   page.wait_for_function("()=>document.querySelector('.ct376-ovr')?.dataset.state==='estimated'")
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   page.screenshot(path=str(OUT/(name+'-detail.png')),full_page=False)
   page.goto(BASE+'/fichas/153_Dean_Huijsen.html',wait_until='domcontentloaded')
   page.locator('.ct377-history').wait_for(state='attached',timeout=30000)
   old_record=page.evaluate("""async()=>{
    const archive=await(await fetch('../ct377-identity-corrections.json')).json();
    const old=archive.cards.find(c=>c.capture===153).beforeCanonical;
    const record=JSON.stringify({schema:'CRAQUE_CURRENT_TRAINING_V376',cardKey:'cap:153',cardId:old.id,
     budget:old.pp,levels:old.niveis,confirmedByOwner:true});
    localStorage.setItem('scoutpro:v376:current-training:cap:153',record);
    dispatchEvent(new Event('craque:data-changed'));return record;
   }""")
   try:
    page.wait_for_function("()=>document.querySelector('.ct376-ovr')?.dataset.state==='pending'")
   except Exception:
    print('V377 DIAGNOSTIC',page.evaluate("""async()=>{
     const ref=CRAQUE_REFERENCES_V376.cards.find(c=>c.capture===153);
     const card=(await(await fetch('../SCOUT_V69_AUDITORIA.json')).json()).cards.find(c=>c.numero===153);
     return {ref,context:CRAQUE_RATING_CONTEXT_V376.resolve(ref,card,localStorage,{managers:CRAQUE_MANAGERS_V302}),
      badges:[...document.querySelectorAll('.ct376-ovr')].map(b=>({state:b.dataset.state,title:b.title})),
      local:[...Array(localStorage.length)].map((_,i)=>localStorage.key(i)).filter(k=>k.includes('153')||k.includes('105780749692770')).map(k=>[k,localStorage.getItem(k)])};
    }"""),flush=True)
    page.screenshot(path=str(OUT/(name+'-identity-failure.png')),full_page=False)
    raise
   page.wait_for_function("()=>document.querySelector('.ct377-history')?.textContent.includes('current-training')")
   assert page.evaluate("()=>localStorage.getItem(CRAQUE_REFERENCES_V376.cards.find(c=>c.capture===153).labKey)") is None
   panel=page.locator('.ct376-panel');panel.locator('summary').first.click()
   panel.locator('.ct377-history > summary').click()
   assert 'current-training' in panel.locator('.ct377-history').inner_text()
   form=panel.locator('.ct376-training-form')
   for i in range(10):form.locator('input[type=number]').nth(i).fill('0')
   form.locator('input[type=checkbox]').check();form.locator('button[type=submit]').click()
   page.wait_for_function("()=>document.querySelector('.ct376-ovr')?.dataset.state==='estimated'")
   assert page.evaluate("()=>localStorage.getItem('scoutpro:v376:current-training:cap:153')")==old_record
   assert page.evaluate("()=>JSON.parse(localStorage.getItem('scoutpro:v376:current-training:cap:153:105780749692770')).confirmedByOwner")
   assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=12
   page.screenshot(path=str(OUT/(name+'-identity-correction.png')),full_page=False)
   assert not errors,(name,errors)
   (OUT/(name+'.json')).write_text(json.dumps({'errors':errors,'width':width,'currentTrainingConfirmed':True,'coachInvalidatesObservedOVR':True}),encoding='utf8')
   ctx.close()
  print('V376 VISUAL PASS: 261 overlays, 3 viewports, current training/observed OVR and coach invalidation; no browser errors.')
 finally:browser.close()
