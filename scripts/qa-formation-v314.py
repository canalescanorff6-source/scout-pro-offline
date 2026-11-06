#!/usr/bin/env python3
"""V314 — fluxo real: vaga no campo → contexto de PP, habilidades e ímpetos nos dois acervos."""
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal
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
      assert "FICHA EM FOCO" in scenario.inner_text()
      scenario.locator(".ct326-deep-dive > summary").click()
      assert "Cenário MAT · posse" in scenario.inner_text(),scenario.inner_text()[:1000]
      assert "PP exatos distribuídos" in scenario.inner_text()
      assert "habilidades adicionais" in scenario.inner_text().lower()
      assert "Ímpetos" in scenario.inner_text()
      assert "Posição original:" in scenario.locator('.ct311-origin').text_content()
      before=page.locator("#pitch button[data-slot='mat'] .p-cap").inner_text()
      # Trocar a vaga de simulação, sem tocar no titular real.
      scenario.locator('.ct331-role-open').click()
      scenario.locator(".ct314-formation-row .ct314-slot-select").select_option("cae")
      assert "Cenário CA · posse" in scenario.inner_text()
      assert page.locator("#pitch button[data-slot='mat'] .p-cap").inner_text()==before
      # V315: troca real e autorizada de titular provoca ficha contextual AUTOMÁTICA
      # para a NOVA carta, sem depender de "Abrir ficha na vaga".
      page.locator("#pitch button[data-slot='mat']").click()
      options=page.locator("#player-options button.option[data-cap]")
      options.first.wait_for(timeout=12000)
      prior=before.split("#",1)[1].split(" ",1)[0]
      candidate=None
      for i in range(options.count()):
        opt=options.nth(i)
        cap=opt.get_attribute("data-cap")
        if cap!=prior and opt.is_enabled():
          candidate=cap
          opt.click()
          break
      assert candidate is not None,"Não há segundo jogador MAT elegível para teste de troca real"
      auto=page.locator("#ct-v314-slot-panel .ct311-positional")
      auto.wait_for(timeout=15000)
      auto.locator(".ct326-deep-dive > summary").click()
      assert "Cenário MAT · posse" in auto.inner_text()
      assert "#"+candidate in page.locator("#ct-v314-slot-panel").inner_text()
      assert "#"+candidate in page.locator("#pitch button[data-slot='mat'] .p-cap").inner_text()
      assert "Treinamento" in auto.inner_text() and "Ímpetos" in auto.inner_text()
      # A proposta acompanha a tática selecionada, sem voltar ao jogador anterior.
      page.locator("#ct-v230-tactic-tabs button[data-mode='rapido']").click()
      page.wait_for_function("""cap => {
        const panel=document.querySelector('#ct-v314-slot-panel');
        return panel?.textContent?.includes('Cenário MAT · rapido') &&
         panel?.textContent?.includes('#'+cap);
      }""",arg=candidate,timeout=12000)
      assert "#"+candidate in page.locator("#pitch button[data-slot='mat'] .p-cap").inner_text()
      assert not errors,errors
      # Bruno Santos CD/Zico 106 SA tem 68 PP informados pelo proprietário,
      # mas não tem Card ID/edição da carta confirmados. NÃO homologar treino.
      page.goto(BASE+"/outros-elencos-v227.html?colecao=bruno-santos-cd",wait_until="domcontentloaded",timeout=40000)
      page.locator(".friends-card .friends-analysis-action").first.click(timeout=20000)
      unverified=page.locator("#friend-analysis-dialog .ct311-positional")
      unverified.wait_for(timeout=30000)
      assert "68 PP" in page.locator("#friend-analysis-dialog").inner_text()
      assert "68 PP exatos distribuídos" not in unverified.inner_text(), (
       "Sem Card ID exato, Zico não pode receber ficha numérica homologada")
      # A prova de posição/formação com histórico e PP utiliza uma SA real.
      page.goto(BASE+"/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas",wait_until="domcontentloaded",timeout=40000)
      page.locator("#friend-new-card").click()
      page.locator("#friend-card-name").fill("Raúl")
      page.locator("#friend-card-edition").fill("Epic — Schalke BW 10-11 (14 Aug 2025)")
      page.locator("#friend-card-gameid").fill("88036360649078")
      page.locator("#friend-card-position").select_option("SA")
      page.locator("#friend-card-level").fill("33")
      page.locator("#friend-dialog-save").click()
      page.locator(".friends-card .friends-analysis-action").first.click(timeout=20000)
      panel=page.locator("#friend-analysis-dialog .ct311-positional")
      panel.wait_for(timeout=30000)
      page.wait_for_function("""() => window.CRAQUE_REFERENCES_V376?.cards?.some(
       c => c.capture===2 && c.identityUsable===true) &&
       document.querySelector('#friend-analysis-dialog .ct311-positional')
        ?.textContent.includes('64 PP exatos distribuídos')""",timeout=30000)
      reveal(panel.locator('.ct326-deep-dive > summary'))
      panel.locator(".ct326-deep-dive > summary").click()
      assert "64 PP exatos distribuídos" in panel.inner_text()
      assert "Posição original: SA" in panel.locator('.ct311-origin').text_content()
      panel.locator('.ct331-role-open').click()
      panel.locator(".ct314-formation-row .ct311-select").select_option("4213")
      panel.locator(".ct314-slot-select").select_option("mat")
      assert "Cenário MAT · posse" in panel.inner_text()
      assert "64 PP exatos distribuídos" in panel.inner_text()
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
print("V315 QA PASS: posição real da vaga no campo, PP/skills/ímpetos atualizados; dois acervos; Android/Windows; titulares preservados.")
