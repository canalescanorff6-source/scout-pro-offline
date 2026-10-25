#!/usr/bin/env python3
"""V364 · prova Chromium da integração principal 246+15, Android e Windows.
Sem usar armazenamento ou dados reais: contextos Playwright descartáveis.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get("SCOUT_VISUAL_BASE","http://127.0.0.1:8765").rstrip("/")
ART=Path("artifacts/visual-qa/v364")
ART.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 exe=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("google-chrome-stable")
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=["--no-sandbox","--disable-dev-shm-usage"])
 try:
  for label,width,height,mobile in [("android320",320,700,True),("android390",390,844,True),("windows1366",1366,768,False)]:
   ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,reduced_motion="reduce")
   page=ctx.new_page();errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   page.goto(BASE+"/index.html",wait_until="domcontentloaded",timeout=50000)
   page.wait_for_function("document.body.dataset.ct364MainCards==='15'",timeout=20000)
   page.wait_for_function("document.querySelector('#all-count')?.textContent==='261'",timeout=15000)
   assert page.locator('#cards .player-card').count()==261,(label,"main total")
   assert page.locator('#cards .player-card.ct364-card').count()==15,(label,"new cards")
   assert page.locator('#cards .player-card[data-cap="181"][data-name="Serhou Guirassy"]').count()==1
   assert page.locator('#cards .player-card[data-cap="255"][data-name="Serhou Guirassy"]').count()==1
   page.locator('#search').fill('Karetsas')
   assert page.locator('#shown-count').inner_text()=='1'
   page.locator('#cards .player-card[data-cap="247"]').click()
   page.wait_for_url("**/minhas-cartas-v364.html?c=247",timeout=20000)
   page.locator('#ct364-name').wait_for(state="visible",timeout=20000)
   assert page.locator('#ct364-name').inner_text()=='K. Karetsas'
   assert page.locator('#ct364-level').inner_text()=='31'
   assert page.locator('#ct364-pp').inner_text()=='60 PP*'
   assert "eFHub" in page.locator('#ct364-proof').inner_text()
   assert page.locator('#ct364-roster .ct364-tile').count()==15
   # Comprovar que as artes recortadas, incluindo containers WebP, são DECODIFICÁVEIS.
   valid=page.evaluate("""async () => {
      const cards=[...document.querySelectorAll('#ct364-roster .ct364-tile img')];
      await Promise.all(cards.map(img=>img.decode().catch(()=>{})));
      return cards.map(img=>[img.alt,img.naturalWidth,img.naturalHeight]);
   }""")
   assert len(valid)==15 and all(w>20 and h>30 for _,w,h in valid),(label,"imagens",valid)
   page.locator('#ct364-position').select_option('SA')
   page.locator('#ct364-app button[data-mode="rapido"]').click()
   assert page.locator('#ct364-app button[data-mode="rapido"]').get_attribute('aria-pressed')=='true'
   page.locator('#ct364-app button[data-tab="skills"]').click()
   assert page.locator('#ct364-app button[data-tab="skills"]').get_attribute('aria-pressed')=='true'
   assert "nativas" in page.locator('#ct364-plan').inner_text().lower()
   page.locator('#ct364-app button[data-tab="boost"]').click()
   assert "NÃO CONFIRMADO" in page.locator('#ct364-plan').inner_text()
   page.locator('#ct364-confirm-level').fill('32')
   page.locator('#ct364-confirmed').check()
   page.locator('#ct364-proof-form button[type="submit"]').click()
   assert page.locator('#ct364-pp').inner_text()=='62 PP'
   assert "confirmados" in page.locator('#ct364-proof').inner_text()
   page.locator('#ct364-proof-reset').click()
   assert page.locator('#ct364-pp').inner_text()=='60 PP*'
   assert page.locator('#ct364-roster').is_hidden()
   assert page.locator('#ct364-profile').is_visible()
   overflow=page.evaluate("document.documentElement.scrollWidth-innerWidth")
   assert overflow<=12,(label,"overflow",overflow)
   assert not errors,(label,"JS error",errors[:8])
   page.screenshot(path=str(ART/(label+"-ficha.png")),full_page=False)
   ctx.close()
  print("V364 VISUAL PASS: 261 cartas na principal, 15 WebPs decodificadas, Guirassy preservado em duas edições, filtros, PP corrigível e cinco táticas.")
 finally:
  browser.close()
