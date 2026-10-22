#!/usr/bin/env python3
"""V314 — fluxo real: vaga no campo → contexto de PP, habilidades e ímpetos nos dois acervos."""
from playwright.sync_api import sync_playwright
import shutil
BASE="http://127.0.0.1:8765"
with sync_playwright() as pw:
  exe=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("google-chrome-stable")
  browser=pw.chromium.launch(headless=True,executable_path=exe,args=["--no-sandbox","--disable-dev-shm-usage"])
  try:
    for name,w,h,mobile in (("android",390,844,True),("windows",1366,768,False)):
      context=browser.new_context(viewport={"width":w,"height":h},is_mobile=mobile,has_touch=mobile,reduced_motion="reduce")
      page=context.new_page();errors=[]
      page.on("pageerror",lambda error:errors.append(str(error)))
      page.goto(BASE+"/meu-time-duas-formacoes-v177.html",wait_until="domcontentloaded",timeout=40000)
      # O painel de onze titulares inicia fechado: abrir antes de exigir visibilidade.
      page.locator(".ct-v230-tactic-advanced summary").click()
      page.locator("#ct-v230-tactic-details .ct-v230-fit-row").first.wait_for(timeout=30000)
      mat=page.get_by_role("button",name="Abrir ficha na vaga MAT").first
      mat.click(timeout=15000)
      scenario=page.locator("#ct-v314-slot-panel .ct311-positional")
      scenario.wait_for(timeout=30000)
      assert "Cenário MAT · posse" in scenario.inner_text(),scenario.inner_text()[:1000]
      assert "PP exatos distribuídos" in scenario.inner_text()
      assert "habilidades adicionais" in scenario.inner_text().lower()
      assert "Ímpetos" in scenario.inner_text()
      assert "Posição original:" in scenario.inner_text()
      before=page.locator("#pitch button[data-slot='mat'] .p-cap").inner_text()
      # Trocar a vaga de simulação, sem tocar no titular real.
      scenario.locator(".ct314-formation-row .ct314-slot-select").select_option("cae")
      assert "Cenário CA · posse" in scenario.inner_text()
      assert page.locator("#pitch button[data-slot='mat'] .p-cap").inner_text()==before
      page.goto(BASE+"/outros-elencos-v227.html?colecao=bruno-santos-cd",wait_until="domcontentloaded",timeout=40000)
      page.locator(".friends-card .friends-analysis-action").first.click(timeout=20000)
      panel=page.locator("#friend-analysis-dialog .ct311-positional")
      panel.wait_for(timeout=30000)
      assert "68 PP exatos distribuídos" in panel.inner_text()
      assert "Posição original: SA" in panel.inner_text()
      panel.locator(".ct314-formation-row .ct311-select").select_option("4213")
      panel.locator(".ct314-slot-select").select_option("mat")
      assert "Cenário MAT · posse" in panel.inner_text()
      assert "68 PP exatos distribuídos" in panel.inner_text()
      assert "posição" in panel.inner_text().lower()
      panel.locator(".ct311-actions .ct311-button").first.click()
      panel.locator(".ct311-select-label .ct311-select").first.select_option("SA")
      assert "Cenário SA · posse" in panel.inner_text()
      panel.locator(".ct311-actions .ct311-button").first.click()
      panel.locator(".ct311-select-label .ct311-select").first.select_option("MAT")
      assert "revisão salva restaurada" in panel.inner_text().lower()
      count=page.evaluate("""() => Object.entries(JSON.parse(localStorage.getItem('scoutpro:v311:position-scenarios')).entries)
        .filter(([k])=>k.includes('outros-elencos')).length""")
      assert count>=2,count
      assert not errors,errors
      context.close()
  finally:
    browser.close()
print("V314 QA PASS: posição real da vaga no campo, PP/skills/ímpetos atualizados; dois acervos; Android/Windows; titulares preservados.")
