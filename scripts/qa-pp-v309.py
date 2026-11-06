#!/usr/bin/env python3
"""V309: navegar pelo cadastro real em Android-like e Windows; PP automáticos nos dois acervos."""
from __future__ import annotations
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"artifacts"/"visual-qa"
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("SCOUT_VISUAL_BASE","http://127.0.0.1:8765").rstrip("/")
def run():
 results={}
 with sync_playwright() as pw:
  exe=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("google-chrome-stable")
  browser=pw.chromium.launch(headless=True,executable_path=exe,args=["--no-sandbox","--disable-dev-shm-usage"])
  try:
   for key,width,height,mobile in [("pp_android",390,844,True),("pp_windows",1366,768,False)]:
    ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile)
    page=ctx.new_page();errors=[]
    page.on("pageerror",lambda e: errors.append(str(e)))
    page.goto(URL+"/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas",wait_until="domcontentloaded",timeout=35000)
    page.wait_for_function("window.CRAQUE_FRIENDS_V227 && document.querySelector('#friend-current-name')?.textContent==='Minhas Cartas Adicionadas'",timeout=20000)
    page.locator("#friend-new-card").click()
    page.locator("#friend-card-name").fill("Zico — teste nível 35")
    page.locator("#friend-card-position").select_option(label="SA")
    page.locator("#friend-card-level").fill("35")
    assert "68 PP" in page.locator("#friend-budget-preview").inner_text()
    assert not page.locator("#friend-card-pp").input_value(),"PP manuais permanecem vazios"
    page.locator("#friend-dialog-save").click()
    page.wait_for_function("document.querySelectorAll('.friends-card').length>=1",timeout=20000)
    assert "68 PP" in page.locator(".friends-card").first.inner_text()
    page.locator(".friends-card .friends-analysis-action").first.click()
    page.wait_for_function("window.CRAQUE_REFERENCES_V376?.cards?.length>0",timeout=30000)
    assert 'Treino ainda não calculável' in page.locator('#friend-analysis-content').inner_text(),(
      'Nível e orçamento informados não comprovam a edição de Zico')
    assert page.locator('.friend-analysis-pp').count()==0
    page.locator('#friend-analysis-close').click()
    # V395: seis distribuições numéricas somente com edição identificada.
    page.locator('#friend-new-card').click()
    page.locator('#friend-card-name').fill('Rivaldo')
    page.locator('#friend-card-edition').fill('Epic — FC Barcelona 98-99')
    page.locator('#friend-card-gameid').fill('88035555413454')
    page.locator('#friend-card-position').select_option('MAT')
    page.locator('#friend-card-level').fill('35')
    assert '68 PP' in page.locator('#friend-budget-preview').inner_text()
    assert not page.locator('#friend-card-pp').input_value()
    page.locator('#friend-dialog-save').click()
    page.locator('.friends-card').filter(has_text='Rivaldo').locator('.friends-analysis-action').click()
    page.wait_for_function("""() => window.CRAQUE_REFERENCES_V376?.cards?.some(
     c => c.capture===77 && c.identityUsable===true) &&
     document.querySelector('.friend-analysis-pp')?.textContent.includes('68 / 68')""",timeout=30000)
    assert 'seis estilos' in page.locator('#friend-analysis-state').inner_text()
    assert "68 PP" in page.locator("#friend-analysis-dialog").inner_text()
    for label in ["Posse de Bola","Contra-Ataque Normal","Contra-Ataque Rápido","Por Fora","Bola Longa","Sobreposição"]:
     assert label in page.locator("#friend-analysis-dialog").inner_text()
    plans=[]
    for tactic in ['posse','normal','rapido','fora','longo','overload']:
     page.locator(f'#friend-analysis-modes button[data-style="{tactic}"]').click()
     assert '68 / 68 PP distribuídos' in page.locator('.friend-analysis-pp').inner_text()
     rows=page.locator('.friend-analysis-table tbody tr')
     assert rows.count()==10
     plans.append(rows.all_inner_texts())
    assert all(plan==plans[0] for plan in plans),'A edição tem uma ficha global nos seis estilos'
    page.screenshot(path=str(OUT/(key+"_6_fichas.png")),full_page=False)
    page.locator("#friend-analysis-close").click()
    page.goto(URL+"/outros-elencos-v227.html?colecao=bruno-santos-cd",wait_until="domcontentloaded")
    page.wait_for_function("document.querySelector('#friend-current-name')?.textContent==='Bruno Santos CD'",timeout=20000)
    assert "Bruno Santos CD"==page.locator("#friend-current-name").inner_text()
    assert not errors,"Console errors: "+"|".join(errors)
    results[key]={"pp_rivaldo":68,"levels":35,"unknown_zico_pending":True,"six_styles":True,"personal_owner_isolated":True,"errors":[]}
    ctx.close()
  finally:browser.close()
 (OUT/"pp-universal-v309-report.json").write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding="utf-8")
 print("V309 QA PASS: Android/Windows, Zico sem edição pendente, Rivaldo #077 nível 35 -> 68 PP, seis fichas, Bruno isolado.")
if __name__=="__main__":run()
