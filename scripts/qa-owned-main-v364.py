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
   page.locator("#ct364-owned-grid .ct364-player-card").first.wait_for(state="attached",timeout=14000)
   assert page.locator("#cards .player-card").count()==246,(name,"246 originais mudadas")
   assert page.locator("#ct364-owned-grid .ct364-player-card").count()==15,(name,"15 adicionais faltam")
   assert page.locator("#ct364-owned-section").is_visible()
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
   page.locator("#ct364-owned-section > summary").click()
   assert page.locator("#ct364-owned-section").evaluate("(e)=>e.open")
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
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator(".ct364-skill-list span").count()==10
   # V366: recomendações do MESMO motor oficial, reagindo à tática.
   assert page.locator("#ct366-advisory .ct364-modes button").count()==5
   page.wait_for_function("""() => document.querySelector('#ct366-advisory .ct366-results')?.textContent.includes('Vagas adicionais livres verificadas')""",timeout=25000)
   assert "PENDENTE" in page.locator("#ct366-advisory").inner_text()
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
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator('[data-skill-slot="1"]').input_value()=="",(name,"equipamento vazou para Nwaneri")
   page.locator(".ct364-previous").click()
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   assert page.locator('[data-skill-slot="1"]').input_value()=="Habilidade de QA descartável"
   assert page.locator('[data-skill-slot="2"]').input_value()==""
   assert page.locator('[data-skill-slot="3"]').input_value()=="Outra habilidade de QA descartável"
   page.locator('#ct364-tabs [data-panel="boost"]').click()
   assert page.locator("#ct366-advisory .ct364-modes button").count()==5
   page.wait_for_function("""() => document.querySelector('#ct366-advisory .ct366-results')?.textContent.includes('Gastar tokens')""",timeout=25000)
   assert "NÃO AUTORIZADO" in page.locator("#ct366-advisory").inner_text()
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
   # V367: anotações reais associadas à carta, função e tática escolhidas.
   page.locator('#ct364-tabs [data-panel="gameplay"]').click()
   assert page.locator("#ct367-gameplay").is_visible()
   assert "PENDENTE" in page.locator("#ct367-gameplay").inner_text()
   page.locator("#ct367-matches").fill("2")
   page.locator("#ct367-notes").fill("Passe curto e recepção sob pressão observados em duas partidas.")
   page.locator("#ct367-link").fill("javascript:alert(1)")
   page.locator("#ct367-ack").check()
   page.locator("#ct367-save").click()
   assert "link HTTPS válido" in page.locator("#ct367-feedback").inner_text()
   page.locator("#ct367-link").fill("https://www.youtube.com/watch?v=abcdefghijk")
   page.locator("#ct367-save").click()
   assert "Registro individual salvo" in page.locator("#ct367-feedback").inner_text()
   stored=page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v367:owned-gameplay')||'{}')""")
   assert "ct364-01|MAT|posse" in stored,(name,"evidência de gameplay não isolada")
   assert stored["ct364-01|MAT|posse"]["matches"]==2
   assert stored["ct364-01|MAT|posse"]["cardIdAtCapture"]==""
   page.locator("#ct367-other").select_option("ct364-02")
   assert "PENDENTE: sem partidas documentadas" in page.locator("#ct367-comparison").inner_text()
   assert "Função adaptada" in page.locator("#ct367-comparison").inner_text()
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
   page.locator('#ct364-tabs [data-panel="skills"]').click()
   page.locator('[data-skill-slot="2"]').fill("Nova habilidade de QA após o teste")
   page.locator(".ct364-ack input").check()
   page.locator(".ct364-save").click()
   assert "salvo" in page.locator(".ct364-feedback").inner_text()
   page.locator('#ct364-tabs [data-panel="gameplay"]').click()
   assert "REGISTRO EXIGE RECONFERÊNCIA" in page.locator("#ct367-gameplay").inner_text()
   still=page.evaluate("""() => JSON.parse(localStorage.getItem('scoutpro:v367:owned-gameplay')||'{}')""")
   assert still["ct364-01|MAT|posse"]["matches"]==2,(name,"histórico da build anterior foi perdido")
   # O diálogo modal ainda está aberto: conferir a DOM sem clicar sob backdrop.
   assert "14 níveis máximos pendentes" in page.locator("#ct365-review-summary").text_content()
   saved_row=page.locator('[data-review-card="ct364-01"]')
   assert "Máximo informado: 35 · 68 PP calculados" in saved_row.text_content()
   assert page.evaluate("() => window.__ct364BackupSignals")>=5,(name,"gameplay não notificou o backup completo")
   page.locator('#ct364-tabs [data-panel="treino"]').click()
   page.locator('.ct364-modes button').filter(has_text='Contra-Ataque Normal').click()
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
   assert page.locator("#ct364-owned-grid .ct364-player-card").count()==15
   # Check scripts are not throwing even with lazy engines.
   assert not [e for e in error if "ct364" in e.lower()],(name,error)
   ctx.close()
  print("V364 VISUAL PASS: 246 originais + 15 imagens, busca, duas Guirassy, cinco estilos, confirmação manual, 3 resoluções.")
 finally:
  browser.close()
