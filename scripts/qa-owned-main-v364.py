#!/usr/bin/env python3
"""V364 — 15 cartas PRÓPRIAS no catálogo real, sem substituir as 246 fichas.
Cria contextos Playwright descartáveis e valida assets/filtragem/ficha e edição segura.
"""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get("SCOUT_VISUAL_BASE","http://127.0.0.1:8765").rstrip("/")
OUT=Path("artifacts/visual-qa/v364")
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 chrome=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("google-chrome-stable")
 browser=pw.chromium.launch(headless=True,executable_path=chrome,
                            args=["--no-sandbox","--disable-dev-shm-usage"])
 try:
  for name,width,height,mobile in [
   ("android320",320,700,True),("android390",390,844,True),
   ("windows1366",1366,768,False)
  ]:
   ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page()
   error=[]
   page.on("pageerror",lambda x:error.append(str(x)))
   page.goto(BASE+"/index.html",wait_until="domcontentloaded",timeout=55000)
   page.locator("body[data-ct364-owned=ready]").wait_for(state="attached",timeout=25000)
   page.locator("#ct364-owned-grid .ct364-player-card").first.wait_for(timeout=14000)
   assert page.locator("#cards .player-card").count()==246,(name,"246 originais mudadas")
   assert page.locator("#ct364-owned-grid .ct364-player-card").count()==15,(name,"15 adicionais faltam")
   assert page.locator("#ct364-owned-section").is_visible()
   assert not page.locator("#ct364-owned-section").evaluate("(e)=>e.open"),(name,"novas cartas devem iniciar recolhidas")
   # Expandir a seção intencionalmente para validar as 15 imagens; tela inicial
   # deve continuar com as 246 originais acessíveis na primeira dobra.
   page.locator("#ct364-owned-section > summary").click()
   assert page.locator("#ct364-owned-section").evaluate("(e)=>e.open")
   result=page.evaluate("""() => ({
     count:document.querySelectorAll('#ct364-owned-grid img').length,
     images:[...document.querySelectorAll('#ct364-owned-grid img')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),
     width:document.documentElement.scrollWidth-innerWidth,
     original:document.querySelectorAll('#cards .player-card').length
   })""")
   # As 15 artes são loading=lazy no aplicativo. O QA precisa forçar a
   # decodificação, pois imagens fora da viewport não são baixadas sozinhas.
   page.locator("#ct364-owned-grid img").evaluate_all("(imgs)=>imgs.forEach(i=>i.loading='eager')")
   page.wait_for_function("()=>[...document.querySelectorAll('#ct364-owned-grid img')].every(i=>i.complete&&i.naturalWidth>0)",timeout=24000)
   assert result["width"]<=12,(name,"rolagem horizontal",result)
   assert result["original"]==246
   page.screenshot(path=str(OUT/(name+"-catalogo-261.png")),full_page=False)
   # Distinção de versões: o Guirassy original #181 continua, novo abre na página principal.
   page.locator("#search").fill("Serhou Guirassy")
   assert page.locator("#ct364-owned-grid .ct364-player-card").count()==1
   assert page.locator('#cards .player-card[data-cap="181"]').count()==1
   page.locator("#search").fill("Karetsas")
   assert page.locator("#ct364-owned-grid .ct364-player-card").count()==1
   assert page.locator("#none").is_hidden(),(name,"novo card indevidamente marcado como nenhuma carta")
   page.locator("#ct364-owned-grid .ct364-player-card").first.click()
   dialog=page.locator("#ct364-dialog")
   assert dialog.is_visible(),(name,"ficha adicional não abre")
   assert page.locator("#ct364-title").inner_text()=="K. Karetsas"
   assert "PP" in page.locator("#ct364-panel").inner_text() or "PENDENTE" in page.locator("#ct364-panel").inner_text()
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator(".ct364-skill-list span").count()==10
   page.locator('#ct364-tabs [data-panel="boost"]').click()
   assert "simulação" in page.locator("#ct364-panel").inner_text().lower()
   page.locator('#ct364-tabs [data-panel="treino"]').click()
   assert page.locator(".ct364-modes button").count()==5
   assert "PENDENTE" in page.locator("#ct364-panel").inner_text().upper()
   page.locator('#ct364-tabs [data-panel="confirm"]').click()
   page.locator("#ct364-max-level").fill("35")
   page.locator(".ct364-save").click()
   assert "Confira" in page.locator(".ct364-feedback").inner_text(),(name,"salvou sem comprovação")
   page.locator("#ct364-ack").check()
   page.locator(".ct364-save").click()
   assert "Salvo localmente" in page.locator(".ct364-feedback").inner_text()
   recorded=page.evaluate("""() => {
      const saved=JSON.parse(localStorage.getItem('scoutpro:v364:owned-confirmed')||'{}');
      return {card:saved['ct364-01'],changedOriginal:localStorage.getItem('SCOUT_V69_AUDITORIA.json')};
   }""")
   assert recorded["card"]["maxLevel"]==35
   assert recorded["changedOriginal"] is None
   page.locator('#ct364-tabs [data-panel="treino"]').click()
   page.locator('.ct364-modes button').filter(has_text='Contra-Ataque Normal').click()
   assert page.locator('.ct364-modes button[aria-pressed="true"]').count()==1
   page.locator("#ct364-dialog-role").select_option("SA")
   assert page.locator("#ct364-dialog-role").input_value()=="SA"
   page.locator(".ct364-close").click()
   assert dialog.is_hidden()
   page.locator("#search").fill("")
   assert page.locator("#ct364-owned-grid .ct364-player-card").count()==15
   # Check scripts are not throwing even with lazy engines.
   assert not [e for e in error if "ct364" in e.lower()],(name,error)
   ctx.close()
  print("V364 VISUAL PASS: 246 originais + 15 imagens, busca, duas Guirassy, cinco estilos, confirmação manual, 3 resoluções.")
 finally:
  browser.close()
