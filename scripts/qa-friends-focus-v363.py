#!/usr/bin/env python3
"""V363: coleções independentes com cartas em primeiro plano e filtro real por PP/posição.

Rodar com servidor local da pasta web. Contextos descartáveis, nunca tocam dados do usuário.
"""
import os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.getenv("SCOUT_VISUAL_BASE","http://127.0.0.1:8765").rstrip("/")
ART=Path("artifacts/visual-qa/v363")
ART.mkdir(parents=True,exist_ok=True)

with sync_playwright() as pw:
 exe=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("google-chrome-stable")
 browser=pw.chromium.launch(headless=True,executable_path=exe,args=["--no-sandbox","--disable-dev-shm-usage"])
 try:
  for platform,width,height,mobile in [("android320",320,700,True),("android390",390,844,True),("windows1366",1366,768,False)]:
   ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,reduced_motion="reduce")
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda error:errors.append(str(error)))
   page.goto(BASE+"/outros-elencos-v227.html",wait_until="domcontentloaded",timeout=45000)
   page.locator("body.ct362-design").wait_for(timeout=16000)
   page.locator("#friend-owner-jump option").first.wait_for(state="attached",timeout=18000)
   page.locator("#ct363-readiness").wait_for(state="visible",timeout=16000)
   assert page.locator("#ct363-readiness button").count()==3
   assert not page.locator(".ct363-method").evaluate("(e)=>e.open"),(platform,"instruções devem iniciar recolhidas")
   boxes=page.evaluate("""() => {
      const rect=s=>{const x=document.querySelector(s).getBoundingClientRect();return {top:x.top,left:x.left,width:x.width}};
      return {
        jump:rect('.friends-jump'),main:rect('.friends-main'),people:rect('.friends-people'),
        featured:rect('.friends-featured-owner'),
        overflow:document.documentElement.scrollWidth-innerWidth
      };
   }""")
   assert boxes["overflow"]<=12,(platform,"overflow",boxes)
   if mobile:
    assert boxes["jump"]["top"]<boxes["main"]["top"]<boxes["people"]["top"]<boxes["featured"]["top"],(platform,"ordem no Android",boxes)
   else:
    assert boxes["people"]["left"]<boxes["main"]["left"],(platform,"colunas Windows",boxes)
   page.screenshot(path=str(ART/(platform+"-colecoes.png")),full_page=False)

   # Coleção descartável para validar o filtro sem depender de sementes Bruno/7$.
   page.locator("#friend-person-name").fill("V363 QA local")
   page.locator("#friend-person-form button[type=submit]").click()
   assert page.locator("#friend-current-name").inner_text()=="V363 QA local"
   assert page.locator("#friend-cards .friends-card").count()==0
   page.locator("#friend-new-card").click()
   page.locator("#friend-card-name").fill("Carta Pendente QA")
   page.locator("#friend-dialog-save").click()
   assert page.locator("#friend-cards .friends-card").count()==1
   assert page.locator("#friend-cards .friends-card").first.get_attribute("data-ready")=="false"
   page.locator("#friend-new-card").click()
   page.locator("#friend-card-name").fill("Carta Pronta QA")
   page.locator("#friend-card-position").select_option("CA")
   page.locator("#friend-card-level").fill("35")
   page.locator("#friend-dialog-save").click()
   assert page.locator("#friend-cards .friends-card").count()==2,(platform,"cartas foram perdidas")
   assert page.locator("#ct363-filter-count").inner_text().startswith("2 de 2")
   page.locator('#ct363-readiness button[data-filter="ready"]').click()
   assert page.locator("#friend-cards .friends-card").count()==1,(platform,"prontas")
   assert "Carta Pronta QA" in page.locator("#friend-cards").inner_text()
   assert page.locator('#ct363-readiness button[data-filter="ready"]').get_attribute("aria-pressed")=="true"
   page.locator('#ct363-readiness button[data-filter="pending"]').click()
   assert page.locator("#friend-cards .friends-card").count()==1,(platform,"pendentes")
   assert "Carta Pendente QA" in page.locator("#friend-cards").inner_text()
   page.locator("#friend-owner-jump").select_option(index=0)
   assert page.locator('#ct363-readiness button[data-filter="all"]').get_attribute("aria-pressed")=="true",(platform,"filtro não reiniciou")
   assert "V363 QA local" not in page.locator("#friend-current-name").inner_text()
   assert not errors,(platform,errors)
   ctx.close()
  print("V363 VISUAL PASS: coleções à frente no Android, filtro PP real e isolado, cadastro e troca de dono, Windows preservado.")
 finally:
  browser.close()
