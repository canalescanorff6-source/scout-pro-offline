#!/usr/bin/env python3
"""V364 — 15 cartas PRÓPRIAS no catálogo real, sem substituir as 246 fichas.
Cria contextos Playwright descartáveis e valida assets/filtragem/ficha e edição segura.
"""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal
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
   page.locator("#cards .ct364-player-card").first.wait_for(state="attached",timeout=14000)
   external=page.locator("#ct-formacoes-premium-link")
   assert external.count()==1 and external.is_visible(),(name,"acesso às formações ausente ou duplicado")
   assert external.get_attribute("href")=="https://craque-tatico-formacoes-premium.vocalclock33.chatgpt.site/"
   assert external.get_attribute("target")=="_blank"
   assert page.locator("#cards .player-card").count()==246,(name,"246 originais mudadas")
   assert page.locator("#cards .ct364-player-card").count()==15,(name,"15 adicionais faltam")
   assert page.locator("#ct364-owned-section").is_hidden()
   assert not page.locator("#ct364-owned-section").evaluate("(e)=>e.open"),(name,"novas cartas devem iniciar recolhidas")
   hint=page.locator("#catalogo .list-meta").get_by_text("Toque na carta para abrir a ficha",exact=False)
   assert hint.count()==1,(name,"instrução na DOM não localizada; revisar posicionamento mobile")
   if width<=355:
    assert hint.is_hidden(),(name,"dica redundante ainda ocupa a primeira dobra")
    first=page.locator("#cards .player-card:visible").first.bounding_box()
    if not first or first["y"]>=height-38:
     import json
     detail=page.evaluate("""() => {
       const rect=sel=>{const e=document.querySelector(sel),r=e?.getBoundingClientRect();
         const c=e?getComputedStyle(e):null;
         return r?{y:r.y,height:r.height,display:c.display,marginTop:c.marginTop,
           marginBottom:c.marginBottom,paddingTop:c.paddingTop,style:e.getAttribute('style')}:null;};
       const original=document.querySelector('#cards');
       const c=original?.querySelector('.player-card');
       const before=c?.getBoundingClientRect().y;
       original?.style.setProperty('transform','translateY(-14px)','important');
       const after=c?.getBoundingClientRect().y;
       original?.style.removeProperty('transform');
       return {width:innerWidth,media:matchMedia('(max-width:355px)').matches,
         cardBefore:before,cardTransformTest:after,
         catalog:rect('#catalogo'),sectionTop:rect('#catalogo .section-top'),
         list:rect('#catalogo .list-meta'),lastHint:rect('#catalogo .list-meta>span:last-child'),
         filter:rect('#scout-v203-filter-panel'),owned:rect('#ct364-owned-section'),
         cards:rect('#cards'),firstCard:rect('#cards .player-card')};
      }""")
     print("V364 DEBUG 320PX: "+json.dumps(detail,ensure_ascii=False),flush=True)
    assert first and first["y"]<height-38,(name,"primeira carta encoberta",first)
   else:
    assert hint.is_visible(),(name,"dica deve continuar em telas mais amplas")
   # Expandir a seção intencionalmente para validar as 15 imagens; tela inicial
   # deve continuar com as 246 originais acessíveis na primeira dobra.
   reveal(page.locator("#ct379-archive > summary"))
   page.locator("#ct379-archive > summary").click()
   # V365: auditoria das 15 cartas permanece fechada ao abrir o grupo,
   # com dados locais nunca copiados dos níveis simulados do eFHub.
   review=page.locator("#ct365-review")
   assert review.is_visible() and not review.evaluate("(e)=>e.open")
   page.locator("#ct365-review > summary").click()
   assert page.locator("#ct365-review-rows .ct365-review-row").count()==15
   assert "15 níveis máximos pendentes" in page.locator("#ct365-review-summary").inner_text()
   assert "0 de 15 níveis máximos informados" in page.locator("#ct365-review-count").inner_text()
   row=page.locator('[data-review-card="ct364-01"]')
   assert "31 (simulação, não máximo)" in row.inner_text()
   assert "PP: PENDENTES" in row.inner_text()
   page.locator("#ct365-review-filter").select_option("missing-id")
   assert page.locator("#ct365-review-rows .ct365-review-row").count()==15
   page.locator("#ct365-review-filter").select_option("with-level")
   assert page.locator("#ct365-review-rows .ct365-review-row").count()==0
   page.locator("#ct365-review-filter").select_option("all")
   page.locator('[data-review-card="ct364-01"] .ct365-review-open').click()
   assert page.locator("#ct364-title").inner_text()=="K. Karetsas"
   assert page.locator('#ct364-tabs [data-panel="confirm"]').get_attribute('aria-pressed')=="true"
   page.locator(".ct364-close").click()
   page.locator("#ct365-review > summary").click()
   result=page.evaluate("""() => ({
     count:document.querySelectorAll('#cards .ct364-player-card img').length,
     images:[...document.querySelectorAll('#cards .ct364-player-card img')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),
     width:document.documentElement.scrollWidth-innerWidth,
     original:document.querySelectorAll('#cards .player-card').length
   })""")
   # As 15 artes são loading=lazy no aplicativo. O QA precisa forçar a
   # decodificação, pois imagens fora da viewport não são baixadas sozinhas.
   page.locator("#cards .ct364-player-card img").evaluate_all("(imgs)=>imgs.forEach(i=>i.loading='eager')")
   page.wait_for_function("()=>[...document.querySelectorAll('#cards .ct364-player-card img')].every(i=>i.complete&&i.naturalWidth>0)",timeout=24000)
   assert result["width"]<=12,(name,"rolagem horizontal",result)
   assert result["original"]==246
   page.screenshot(path=str(OUT/(name+"-catalogo-261.png")),full_page=False)
   # Distinção de versões: o Guirassy original #181 continua, novo abre na página principal.
   page.locator("#search").fill("Serhou Guirassy")
   assert page.locator("#cards .ct364-player-card:visible").count()==1
   assert page.locator('#cards .player-card[data-cap="181"]').count()==1
   page.locator("#search").fill("Karetsas")
   assert page.locator("#cards .ct364-player-card:visible").count()==1
   assert page.locator("#none").is_hidden(),(name,"novo card indevidamente marcado como nenhuma carta")
   page.locator("#cards .ct364-player-card:visible").first.click()
   dialog=page.locator("#ct364-dialog")
   assert dialog.is_visible(),(name,"ficha adicional não abre")
   assert page.locator("#ct364-title").inner_text()=="K. Karetsas"
   page.evaluate("""() => {
      window.__ct364BackupSignals=0;
      window.addEventListener('craque:data-changed',()=>{
       window.__ct364BackupSignals++;
      });
   }""")
   # V364.2: navegar como nas cartas principais, isolando identidade e edicao.
   assert page.locator("#ct364-card-navigator").is_visible(),(name,"navegacao ausente")
   assert page.locator("#ct364-jump option").count()==15
   page.locator(".ct364-next").click()
   assert page.locator("#ct364-title").inner_text()=="Ethan Nwaneri"
   page.locator(".ct364-previous").click()
   assert page.locator("#ct364-title").inner_text()=="K. Karetsas"
   page.locator("#ct364-jump").select_option("ct364-15")
   assert page.locator("#ct364-title").inner_text()=="Joane Gadou"
   page.locator(".ct364-next").click()
   assert page.locator("#ct364-title").inner_text()=="K. Karetsas"
   assert "Minha carta 1 de 15" in page.locator("#ct364-card-index").inner_text()
   assert "PP" in page.locator("#ct364-panel").inner_text() or "PENDENTE" in page.locator("#ct364-panel").inner_text()
   reveal(page.locator('#ct364-tabs [data-panel="skills"]'))
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator(".ct364-skill-list span").count()==10
   # V366: recomendações do MESMO motor oficial, reagindo à tática.
   assert page.locator("#ct366-advisory .ct364-modes button").count()==5
   page.wait_for_function("""() => document.querySelector('#ct366-advisory .ct366-results')?.textContent.includes('Vagas adicionais livres verificadas')""",timeout=25000)
   assert "PENDENTE" in page.locator("#ct366-advisory").inner_text()
   assert page.locator('#ct366-advisory [data-pro-kind="skills"]').count()==1,(name,"V373 não mostrou carteira de habilidades")
   assert "Vagas livres comprovadas" in page.locator('#ct366-advisory [data-pro-kind="skills"]').inner_text()
   assert "NÃO COMPROVADAS" in page.locator('#ct366-advisory [data-pro-kind="skills"]').inner_text()
   page.locator("#ct366-advisory .ct364-modes button").filter(has_text="Contra-Ataque Normal").click()
   assert "Contra-Ataque Normal" in page.locator("#ct366-advisory").inner_text()
   assert page.locator("#ct366-advisory .ct364-modes button[aria-pressed=true]").count()==1
   page.locator("#ct366-advisory .ct364-modes button").filter(has_text="Posse de Bola").click()
   # V364.3: as cinco vagas manuais não presumem equipamento; nomes
   # duplicados com habilidades observadas e edições vizinhas ficam isolados.
   assert page.locator('[data-skill-slot]').count()==5,(name,"faltam cinco vagas manuais")
   own_native=page.locator(".ct364-skill-list span").first.inner_text()
   page.locator('[data-skill-slot="1"]').fill(own_native)
   page.locator(".ct364-ack input").check()
   page.locator(".ct364-save").click()
   assert "Conflito" in page.locator(".ct364-feedback").inner_text()
   page.locator('[data-skill-slot="1"]').fill("Habilidade de QA descartável")
   page.locator('[data-skill-slot="3"]').fill("Outra habilidade de QA descartável")
   page.locator(".ct364-save").click()
   assert "salvo" in page.locator(".ct364-feedback").inner_text()
   page.locator(".ct364-next").click()
   reveal(page.locator('#ct364-tabs [data-panel="skills"]'))
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator('[data-skill-slot="1"]').input_value()=="",(name,"equipamento vazou para Nwaneri")
   page.locator(".ct364-previous").click()
   reveal(page.locator('#ct364-tabs [data-panel="skills"]'))
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator('[data-skill-slot="1"]').input_value()=="Habilidade de QA descartável"
   assert page.locator('[data-skill-slot="2"]').input_value()==""
   assert page.locator('[data-skill-slot="3"]').input_value()=="Outra habilidade de QA descartável"
   reveal(page.locator('#ct364-tabs [data-panel="boost"]'))
   page.locator('#ct364-tabs [data-panel="boost"]').click()
   assert page.locator("#ct366-advisory .ct364-modes button").count()==5
   page.wait_for_function("""() => document.querySelector('#ct366-advisory .ct366-results')?.textContent.includes('Gastar tokens')""",timeout=25000)
   assert "NÃO AUTORIZADO" in page.locator("#ct366-advisory").inner_text()
   assert page.locator('#ct366-advisory [data-pro-kind="boost"]').count()==1,(name,"V373 sem alternativas por função")
   assert "Slot adicional comprovado" in page.locator('#ct366-advisory [data-pro-kind="boost"]').inner_text()
   page.locator("#ct364-dialog-role").select_option("SA")
   assert "Papel SA" in page.locator("#ct366-advisory").inner_text()
   page.locator("#ct364-dialog-role").select_option("MAT")
   page.locator("#ct364-booster-slot").select_option("ocupado")
   page.locator("#ct364-equipped-booster").fill("Ímpeto de QA descartável")
   page.locator(".ct364-ack input").check()
   page.locator(".ct364-save").click()
   assert "salvo" in page.locator(".ct364-feedback").inner_text()
   manual=page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v364:owned-equipment')||'{}')""")
   assert manual["ct364-01"]["slot"]=="ocupado"
   assert manual["ct364-01"]["skills"]==[
    "Habilidade de QA descartável","","Outra habilidade de QA descartável","",""
   ],(name,"indices das cinco vagas foram compactados")
   assert "ct364-02" not in manual,(name,"skills foram compartilhadas entre cartas")
   reveal(page.locator('#ct364-tabs [data-panel="boost"]'))
   page.locator('#ct364-tabs [data-panel="boost"]').click()
   assert "simulação" in page.locator("#ct364-panel").inner_text().lower()
   reveal(page.locator('#ct364-tabs [data-panel="treino"]'))
   page.locator('#ct364-tabs [data-panel="treino"]').click()
   assert page.locator(".ct364-modes button").count()==5
   assert "PENDENTE" in page.locator("#ct364-panel").inner_text().upper()
   page.wait_for_function("""() => document.querySelector('#ct364-panel [data-pro-kind="treino"]')!==null""",timeout=25000)
   reveal(page.locator('#ct364-panel [data-pro-kind="treino"]'))
   assert "Treino atual" in page.locator('#ct364-panel [data-pro-kind="treino"]').inner_text()
   reveal(page.locator('#ct364-tabs [data-panel="confirm"]'))
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
   # V367: anotações reais associadas à carta, função e tática escolhidas.
   reveal(page.locator('#ct364-tabs [data-panel="gameplay"]'))
   page.locator('#ct364-tabs [data-panel="gameplay"]').click()
   assert page.locator("#ct367-gameplay").is_visible()
   assert "PENDENTE" in page.locator("#ct367-gameplay").inner_text()
   assert page.locator("#ct367-gameplay > .ct372-observed").is_visible()
   page.locator("#ct367-matches").fill("2")
   page.locator("#ct367-notes").fill("Passe curto e recepção sob pressão observados em duas partidas.")
   page.locator("#ct367-link").fill("")
   page.locator("#ct367-ack").check()
   # V372: rejeitar êxitos acima das tentativas antes de salvar.
   page.locator("#ct367-gameplay > .ct372-observed summary").click()
   page.locator('[data-ct372-total="shortPass"]').fill("8")
   page.locator('[data-ct372-success="shortPass"]').fill("9")
   page.locator("#ct367-save").click()
   assert "êxitos devem ficar entre" in page.locator("#ct367-feedback").inner_text()
   assert page.evaluate("() => localStorage.getItem('scoutpro:v367:owned-gameplay')") is None
   page.locator('[data-ct372-success="shortPass"]').fill("6")
   page.locator("#ct367-link").fill("javascript:alert(1)")
   page.locator("#ct367-save").click()
   assert "link HTTPS válido" in page.locator("#ct367-feedback").inner_text()
   page.locator("#ct367-link").fill("https://www.youtube.com/watch?v=abcdefghijk")
   page.locator("#ct367-save").click()
   assert "Registro individual salvo" in page.locator("#ct367-feedback").inner_text()
   stored=page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v367:owned-gameplay')||'{}')""")
   assert "ct364-01|MAT|posse" in stored,(name,"evidência de gameplay não isolada")
   assert stored["ct364-01|MAT|posse"]["matches"]==2
   assert stored["ct364-01|MAT|posse"]["observed"]["shortPass"]=={"total":8,"success":6}
   assert "Passes curtos sob pressão: 6 / 8" in page.locator("#ct367-comparison").inner_text()
   assert "75% desta amostra declarada" in page.locator("#ct367-comparison").inner_text()
   assert stored["ct364-01|MAT|posse"]["cardIdAtCapture"]==""
   # V369 — segunda revisão mantém a primeira, mas NÃO soma partidas.
   page.locator("#ct367-notes").fill("Segunda revisão da observação: passe curto seguro, mesmo total de duas partidas.")
   page.locator("#ct367-save").click()
   saved_revision=page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v367:owned-gameplay')||'{}')['ct364-01|MAT|posse']""")
   assert saved_revision["matches"]==2
   assert len(saved_revision["history"])==1,(name,"revisão anterior apagada")
   assert "recepção sob pressão" in saved_revision["history"][0]["notes"]
   assert "mesmo total" in saved_revision["notes"]
   assert "Histórico de revisões · 2" in page.locator("#ct369-owned-history summary").inner_text()
   page.locator("#ct369-owned-history summary").click()
   assert "não cumulativas" in page.locator("#ct369-owned-history").inner_text()
   # V370: duas revisões, mesma build — não inventar melhora de desempenho.
   owned_diff=page.locator("#ct369-owned-history .ct370-diff")
   assert owned_diff.is_visible()
   assert "Nenhuma mudança de build documentada" in owned_diff.inner_text()
   # V371: não inventar reteste quando as duas revisões têm mesma build.
   assert "Nenhuma alteração de build foi documentada" in owned_diff.locator(".ct371-retest").inner_text()
   assert owned_diff.locator(".ct371-retest-item").count()==0
   assert owned_diff.locator(".ct370-from").input_value()=="0"
   assert owned_diff.locator(".ct370-to").input_value()=="1"
   page.locator("#ct369-owned-history summary").click()
   queue=page.locator("#ct369-test-queue")
   assert queue.is_visible() and not queue.evaluate("(e)=>e.open")
   page.locator("#ct369-test-queue summary").click()
   page.wait_for_function("""() => document.querySelector('#ct369-queue-stats')?.textContent.includes('15 cartas')""")
   assert "15 cartas" in page.locator("#ct369-queue-stats").inner_text()
   assert page.locator("#ct369-queue-list .ct369-queue-item").count()>=1
   page.locator("#ct369-queue-status").select_option("missing")
   assert page.locator("#ct369-queue-list .ct369-queue-item").count()==14
   page.locator("#ct369-queue-status").select_option("all")
   assert page.locator("#ct369-queue-list .ct369-queue-item").count()==15
   page.locator("#ct369-test-queue summary").click()
   page.locator("#ct367-other").select_option("ct364-02")
   assert "PENDENTE: sem partidas documentadas" in page.locator("#ct367-comparison").inner_text()
   assert "Função adaptada" in page.locator("#ct367-comparison").inner_text()
   # V368: ler as 246 originais da mesma fonte canônica, sem tocar suas builds.
   page.wait_for_function("""() =>
    document.querySelectorAll('#ct367-other optgroup[data-catalog="original"] option').length === 246
   """,timeout=25000)
   page.locator("#ct367-other").select_option("cap:181")
   comparison=page.locator("#ct367-comparison")
   assert "Serhou Guirassy" in comparison.inner_text(),(name,"CAP 181 não encontrado")
   assert "Card ID catalogado" in comparison.inner_text()
   assert "PENDENTE: sem partidas pessoais registradas" in comparison.inner_text()
   assert comparison.locator("#ct368-matches").is_visible()
   page.locator("#ct368-matches").fill("3")
   page.locator(".ct368-original-form .ct372-observed summary").click()
   page.locator('.ct368-original-form [data-ct372-total="receive"]').fill("3")
   page.locator('.ct368-original-form [data-ct372-success="receive"]').fill("2")
   page.locator("#ct368-notes").fill("Observei três partidas do Guirassy original na função MAT com passes curtos e movimentação.")
   page.locator("#ct368-save").click()
   assert "Confirme que observou" in page.locator("#ct368-feedback").inner_text()
   page.locator("#ct368-link").fill("javascript:alert(1)")
   page.locator("#ct368-ack").check()
   page.locator("#ct368-save").click()
   assert "link HTTPS válido" in page.locator("#ct368-feedback").inner_text()
   page.locator("#ct368-link").fill("https://www.youtube.com/watch?v=zzzzzzzzzzz")
   page.locator("#ct368-save").click()
   assert "Registro salvo" in page.locator("#ct368-feedback").inner_text()
   page.locator("#ct368-notes").fill("Segunda revisão sobre o Guirassy #181 na mesma função, preservando as três partidas declaradas.")
   page.locator("#ct368-ack").check()
   page.locator("#ct368-save").click()
   assert "Histórico de revisões · 2" in page.locator(".ct369-original-history summary").inner_text()
   page.locator(".ct369-original-history summary").click()
   assert "não cumulativas" in page.locator(".ct369-original-history").inner_text()
   original_diff=page.locator(".ct369-original-history .ct370-diff")
   assert original_diff.is_visible()
   assert "Nenhuma mudança de build documentada" in original_diff.inner_text()
   assert original_diff.locator(".ct371-retest-item").count()==0
   page.locator(".ct369-original-history summary").click()
   page.locator("#ct369-test-queue summary").click()
   page.locator("#ct369-queue-collection").select_option("original")
   page.locator("#ct369-queue-status").select_option("all")
   page.locator("#ct369-queue-search").fill("cap:181")
   page.wait_for_function("""() => document.querySelector('#ct369-queue-stats')?.textContent.includes('246 cartas')""",timeout=25000)
   assert "246 cartas" in page.locator("#ct369-queue-stats").inner_text()
   row=page.locator('#ct369-queue-list [data-test-key="cap:181"]')
   assert row.count()==1,(name,"Guirassy original não aparece na fila")
   assert "Registro pessoal atual" in row.inner_text()
   page.locator("#ct369-test-queue summary").click()
   origin=page.evaluate("""() => ({
    game:JSON.parse(localStorage.getItem('scoutpro:v368:original-gameplay')||'{}'),
    original:localStorage.getItem('SCOUT_V69_AUDITORIA.json')
   })""")
   assert origin["game"]["cap:181|MAT|posse"]["matches"]==3
   assert origin["game"]["cap:181|MAT|posse"]["observed"]["receive"]=={"total":3,"success":2}
   assert "amostra pequena, sem percentual" in page.locator("#ct367-comparison").inner_text()
   assert len(origin["game"]["cap:181|MAT|posse"]["history"])==1
   assert origin["game"]["cap:181|MAT|posse"]["cardIdAtCapture"],(name,"original sem ID exato de referência")
   assert origin["original"] is None,(name,"cadastro original modificado em localStorage")
   assert "3 · declaração do proprietário" in page.locator("#ct367-comparison").inner_text()
   page.locator("#ct367-other").select_option("ct364-02")
   assert page.locator("#ct368-matches").count()==0,(name,"original persistiu fora da comparação")
   page.locator("#ct367-other").select_option("cap:181")
   assert page.locator("#ct368-matches").input_value()=="3"
   page.locator("#ct367-other").select_option("ct364-02")
   page.locator("#ct367-gameplay .ct364-modes button").filter(has_text="Contra-Ataque Normal").click()
   assert page.locator("#ct367-matches").input_value()=="",(name,"prova vazou para outra tática")
   page.locator("#ct367-gameplay .ct364-modes button").filter(has_text="Posse de Bola").click()
   assert page.locator("#ct367-matches").input_value()=="2"
   page.locator("#ct364-dialog-role").select_option("SA")
   assert page.locator("#ct367-matches").input_value()=="",(name,"prova vazou para outra posição")
   page.locator("#ct364-dialog-role").select_option("MAT")
   assert page.locator("#ct367-matches").input_value()=="2"
   assert "PENDENTE DE AVALIAÇÃO" in page.locator("#ct367-comparison").inner_text()
   page.locator("#ct367-other").select_option("ct364-02")
   assert "PENDENTE" in page.locator("#ct367-comparison").inner_text()
   # Uma alteração posterior das habilidades invalida a prova daquela build,
   # mas conserva o registro (histórico) e não muda o jogador comparado.
   reveal(page.locator('#ct364-tabs [data-panel="skills"]'))
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   page.locator('[data-skill-slot="2"]').fill("Nova habilidade de QA após o teste")
   page.locator(".ct364-ack input").check()
   page.locator(".ct364-save").click()
   assert "salvo" in page.locator(".ct364-feedback").inner_text()
   reveal(page.locator('#ct364-tabs [data-panel="gameplay"]'))
   page.locator('#ct364-tabs [data-panel="gameplay"]').click()
   assert "REGISTRO EXIGE RECONFERÊNCIA" in page.locator("#ct367-gameplay").inner_text()
   # V370: nova revisão depois de mudar uma habilidade da build.
   page.locator("#ct367-notes").fill("Terceira revisão, já com habilidade alterada; observações exigem testes independentes.")
   page.locator("#ct367-ack").check()
   page.locator("#ct367-save").click()
   assert "Registro individual salvo" in page.locator("#ct367-feedback").inner_text()
   page.locator("#ct369-owned-history summary").click()
   owned_diff=page.locator("#ct369-owned-history .ct370-diff")
   diagnostic=page.evaluate("""() => {
    const v=JSON.parse(localStorage.getItem('scoutpro:v367:owned-gameplay')||'{}')['ct364-01|MAT|posse'];
    return {history:v?.history?.map(x=>x.buildSnapshot),now:v?.buildSnapshot,
     n:v?.history?.length};
   }""")
   assert "Habilidade adicional · vaga 2" in owned_diff.inner_text(),(name,diagnostic,owned_diff.inner_text())
   assert "Nova habilidade de QA após o teste" in owned_diff.inner_text()
   assert "PENDENTE — dado incompleto" in owned_diff.inner_text()
   # V371: após completar vaga 2, a lista pede conferência e reteste
   # na posição MAT/Posse, sem alterar gameplay ou o catálogo.
   retest=owned_diff.locator(".ct371-retest")
   assert retest.is_visible()
   assert "MAT · Posse de Bola" in retest.inner_text()
   assert "vaga 2" in retest.inner_text()
   assert "Somente lacunas documentais" in retest.inner_text()
   assert "3–5 partidas por condição" not in retest.inner_text()
   assert retest.locator(".ct371-retest-item").count()>=2
   assert "0 de " in retest.locator(".ct371-retest-progress").inner_text()
   retest.locator(".ct371-retest-item input").first.check()
   assert "1 de " in retest.locator(".ct371-retest-progress").inner_text()
   # O checklist não persiste validação/partidas fictícias.
   assert page.evaluate("""() => localStorage.getItem('scoutpro:v371:retest')""") is None
   # Inverter cronologia deve ser bloqueado, não mostrar falsa mudança.
   owned_diff.locator(".ct370-from").select_option("2")
   owned_diff.locator(".ct370-to").select_option("0")
   assert "sem inverter a ordem cronológica" in owned_diff.inner_text()
   owned_diff.locator(".ct370-from").select_option("1")
   owned_diff.locator(".ct370-to").select_option("2")
   assert "Habilidade adicional · vaga 2" in owned_diff.inner_text()
   page.locator("#ct369-owned-history summary").click()
   # V371: uma mudança entre duas habilidades JÁ INFORMADAS habilita um plano
   # contextual de reteste. Não alterar Card IDs ou treinos aprovados.
   reveal(page.locator('#ct364-tabs [data-panel="skills"]'))
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   page.locator('[data-skill-slot="2"]').fill("Habilidade diferente de QA para a mesma vaga")
   page.locator(".ct364-ack input").check()
   page.locator(".ct364-save").click()
   assert "salvo" in page.locator(".ct364-feedback").inner_text()
   reveal(page.locator('#ct364-tabs [data-panel="gameplay"]'))
   page.locator('#ct364-tabs [data-panel="gameplay"]').click()
   page.locator("#ct367-notes").fill("Quarta revisão após troca de habilidade anotada na mesma vaga para comparação documental.")
   page.locator("#ct367-ack").check()
   page.locator("#ct367-save").click()
   assert "Registro individual salvo" in page.locator("#ct367-feedback").inner_text()
   page.locator("#ct369-owned-history summary").click()
   real=page.locator("#ct369-owned-history .ct370-diff")
   assert "Habilidade adicional · vaga 2" in real.inner_text()
   assert "Alteração registrada" in real.inner_text()
   retest=real.locator(".ct371-retest")
   assert "MAT · Posse de Bola" in retest.inner_text()
   assert "triangulações centrais" in retest.inner_text()
   assert "3–5 partidas por condição" in retest.inner_text()
   assert retest.locator(".ct371-retest-item").count()>=3
   page.locator("#ct369-owned-history summary").click()
   still=page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v367:owned-gameplay')||'{}')""")
   assert still["ct364-01|MAT|posse"]["matches"]==2,(name,"histórico da build anterior foi perdido")
   assert len(still["ct364-01|MAT|posse"]["history"])==3,(name,"V371 apagou revisões após reteste documental")
   # O diálogo modal ainda está aberto: conferir a DOM sem clicar sob backdrop.
   assert "14 níveis máximos pendentes" in page.locator("#ct365-review-summary").text_content()
   saved_row=page.locator('[data-review-card="ct364-01"]')
   assert "Máximo informado: 35 · 68 PP calculados" in saved_row.text_content()
   assert page.evaluate("() => window.__ct364BackupSignals")>=11,(name,"gameplay não notificou o backup completo")
   reveal(page.locator('#ct364-tabs [data-panel="treino"]'))
   page.locator('#ct364-tabs [data-panel="treino"]').click()
   page.locator('#ct378-owned-style').select_option('normal')
   assert page.locator('.ct364-modes button[aria-pressed="true"]').count()==1
   page.locator("#ct364-dialog-role").select_option("SA")
   assert page.locator("#ct364-dialog-role").input_value()=="SA"
   page.locator(".ct364-close").click()
   assert dialog.is_hidden()
   page.locator("#ct365-review > summary").click()
   page.locator("#ct365-review-filter").select_option("with-level")
   assert page.locator("#ct365-review-rows .ct365-review-row").count()==1
   page.locator("#ct365-review-filter").select_option("missing-level")
   assert page.locator("#ct365-review-rows .ct365-review-row").count()==14
   page.locator("#ct365-review > summary").click()
   page.locator("#search").fill("")
   assert page.locator("#cards .ct364-player-card").count()==15
   # Check scripts are not throwing even with lazy engines.
   assert not [e for e in error if "ct364" in e.lower()],(name,error)
   ctx.close()
  print("V364 VISUAL PASS: 246 originais + 15 imagens, busca, duas Guirassy, cinco estilos, confirmação manual, 3 resoluções.")
 finally:
  browser.close()
