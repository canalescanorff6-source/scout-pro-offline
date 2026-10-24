#!/usr/bin/env python3
"""V355: controle PWA troca sem navegação surpresa (Chromium Android/Windows)."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
STUB="""(() => {
 const sw={
   controller:{version:'old'}, listeners:{},
   addEventListener(name,callback){this.listeners[name]=callback},
   register(){return Promise.resolve({})},
   getRegistrations(){return Promise.resolve([])},
   change(version){this.controller={version};this.listeners.controllerchange?.({})}
 };
 Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:sw});
 window.__testSW=sw;
 window.__testConfirmCalls=0;
 window.confirm=()=>{window.__testConfirmCalls++;return false};
})()"""
with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for name,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   context=browser.new_context(viewport={'width':w,'height':h},
    is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   context.add_init_script(STUB)
   page=context.new_page()
   page.goto(BASE+'/index.html',wait_until='domcontentloaded',timeout=45000)
   page.locator('.scout-v189-home').wait_for(timeout=30000)
   assert page.locator('#ct355-update-ready').count()==0,(name,'banner apareceu sem update')
   page.evaluate("window.__testSW.change('new-v355')")
   banner=page.locator('#ct355-update-ready')
   banner.wait_for(state='visible',timeout=10000)
   assert banner.get_attribute('role')=='status'
   assert banner.get_attribute('aria-live')=='polite'
   assert page.locator('#ct355-apply-update').is_visible()
   assert page.locator('#ct355-update-later').is_visible()
   data=page.evaluate("""() => {
    const banner=document.querySelector('#ct355-update-ready');
    const br=banner.getBoundingClientRect();
    const dock=document.querySelector('#scout-app-bar');
    const dockVisible=dock&&getComputedStyle(dock).display!=='none'&&dock.getBoundingClientRect().height>0;
    const dr=dockVisible?dock.getBoundingClientRect():null;
    const apply=document.querySelector('#ct355-apply-update').getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth-innerWidth,
      bottom:br.bottom,top:br.top, dockTop:dr?.top??null,
      buttonHeight:apply.height,background:getComputedStyle(banner).backgroundImage};
   }""")
   assert data['overflow']<=3,(name,data)
   assert data['buttonHeight']>=43,(name,'botão pequeno',data)
   assert data['dockTop'] is None or data['bottom']<=data['dockTop']+4,(name,'obstrui ações',data)
   assert 'rgb(22, 41, 66)' in data['background'],(name,'visual antigo',data)
   page.evaluate("""() => {
      const form=document.createElement('form');
      const input=document.createElement('input');input.name='card-level';
      form.append(input);document.body.append(form);
      input.dispatchEvent(new Event('input',{bubbles:true}));
      form.remove();
   }""")
   page.locator('#ct355-apply-update').click()
   assert page.evaluate('window.__testConfirmCalls')==1,(name,'edição não foi protegida')
   assert banner.is_visible(),(name,'banner desapareceu ao recusar recarga')
   page.locator('#ct355-update-later').click()
   assert page.locator('#ct355-update-ready').count()==0,(name,'depois não escondeu')
   assert page.locator('.scout-v189-home').is_visible()
   context.close()
 finally:browser.close()
print('V355 CHROMIUM PASS: banner Premium aparece somente com update, editor protegido, sem rolagem ou colisão Android/Windows.')
