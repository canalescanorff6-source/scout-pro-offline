#!/usr/bin/env python3
"""QA visual da interface web compartilhada Android/Windows.
Screenshots em Chromium representam viewports, não homologação física do APK ou Electron.
"""
from __future__ import annotations
import json
import os
import shutil
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "artifacts" / "visual-qa"
OUT.mkdir(parents=True, exist_ok=True)
URL = os.environ.get("SCOUT_VISUAL_BASE", "http://127.0.0.1:8765").rstrip("/")
SCREENS = [
    ("mobile_320", 320, 700, True),
    ("mobile_360", 360, 800, True),
    ("mobile_390", 390, 844, True),
    ("mobile_412", 412, 915, True),
    ("windows_1366", 1366, 768, False),
    ("windows_1920", 1920, 1080, False),
]
SCREENS_SELECTORS = {
    "catalog": [
        "body[data-page='catalog']", ".scout-v189-home",
        ".scout-v192-search-shell #search", ".scout-v189-quick",
        "#catalogo", "#cards .player-card"
    ],
    "detail": [
        "body[data-page='detail']", ".mobile-profile",
        "#scout-card-navigator", "#scout-v197-edition", ".detail-header",
        "#scout-v188-principal", "#v188-top-rec", "#v200-alternatives", "#v200-caution", "#scout-v194-focus",
        "#scout-v162", "#scout-v189-biotype", "#scout-v194-gameplay",
    ],
}

def rectangle(page, selector):
    loc = page.locator(selector).first
    if loc.count() == 0:
        return None
    r = loc.bounding_box()
    if not r:
        return {"visible": False}
    return {k: round(r[k], 1) for k in ("x", "y", "width", "height")}

def metrics(page, selectors):
    result = page.evaluate("""() => ({
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow: Math.max(0,document.documentElement.scrollWidth-innerWidth),
        page: document.body.dataset.page
    })""")
    result["elements"] = {name: rectangle(page, name) for name in selectors}
    result["dock"] = page.evaluate("""() => {
      const e=document.getElementById('scout-app-bar');
      if(!e)return null;
      const b=e.getBoundingClientRect(), st=getComputedStyle(e);
      return {x:Math.round(b.x),y:Math.round(b.y),width:Math.round(b.width),
        height:Math.round(b.height),display:st.display,direction:st.flexDirection,
        position:st.position,bottomGap:Math.round(innerHeight-b.bottom)};
    }""")
    return result

def run():
    results = {}
    problems = []
    with sync_playwright() as p:
        local = shutil.which("google-chrome") or shutil.which("google-chrome-stable") or shutil.which("chromium")
        browser = p.chromium.launch(executable_path=local, headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        try:
            for name, width, height, mobile in SCREENS:
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    device_scale_factor=1, is_mobile=mobile, has_touch=mobile,
                    reduced_motion="reduce"
                )
                page = context.new_page()
                errors = []
                page.on("pageerror", lambda err: errors.append(str(err)[:260]))
                page.goto(URL + "/index.html", wait_until="domcontentloaded", timeout=35000)
                page.locator(".scout-v192-search-shell #search").wait_for(timeout=20000)
                page.locator(".scout-v189-quick a").first.wait_for()
                page.wait_for_timeout(550)
                page.locator("#scout-v203-filter-panel > summary").wait_for(timeout=20000)
                home = metrics(page, SCREENS_SELECTORS["catalog"])
                shortcuts = page.locator(".scout-v189-quick a").count()
                home["quick_links"] = shortcuts
                home["errors"] = list(errors)
                if shortcuts != 4:
                    problems.append(f"{name}: home precisa de 4 atalhos, recebeu {shortcuts}")
                if home["horizontalOverflow"] > 8:
                    problems.append(f"{name}: catálogo com overflow horizontal de {home['horizontalOverflow']} px")
                # V202: primeira dobra deve chegar ao elenco. Não é teste pixel-perfect.
                start=(home["elements"].get("#catalogo") or {}).get("y",9999)
                hero_caption=page.locator(".scout-v189-intro")
                if hero_caption.is_visible():
                    problems.append(f"{name}: descrição redundante ocupando espaço antes da busca")
                shortcuts=page.locator(".scout-v189-quick .scout-v189-tile")
                if shortcuts.count()!=4 or not all(x.is_visible() for x in shortcuts.all()):
                    problems.append(f"{name}: quatro atalhos principais inacessíveis")
                if mobile:
                    if start>(545 if width<=340 else 525):
                        problems.append(f"{name}: catálogo ainda começa tarde demais na V202: y={start}")
                    headline=page.locator(".hero h1").inner_text()
                    if "CARTA.SEU" in headline.replace("\\n",""):
                        problems.append(f"{name}: título sem espaço entre linhas")
                elif width>=1200 and start>610:
                    problems.append(f"{name}: primeira dobra desktop sem biblioteca: y={start}")
                home["v202_catalog_y"]=start
                home["v202_intro_hidden"]=not hero_caption.is_visible()

                if not mobile:
                    if page.locator(".lab-intro").is_visible() or page.locator(".v68-method").is_visible():
                        problems.append(f"{name}: metodologia extensa aparece antes do elenco no Windows")
                    if not page.locator("#scout-v198-tools").count():
                        problems.append(f"{name}: menu de ações do Windows não foi montado")
                    else:
                        page.locator("#scout-v198-tools > summary").click()
                        visible_update = page.locator("#scout-v198-tools #scout-update").is_visible()
                        if not visible_update:
                            problems.append(f"{name}: Atualizar ficou inacessível após remover dock flutuante")
                        page.locator("#scout-v198-tools .scout-v189-dock-more > summary").click()
                        if not page.locator("#scout-v198-tools #scout-backup").is_visible():
                            problems.append(f"{name}: Backup ficou inacessível no menu Ferramentas > Mais")
                        page.screenshot(path=str(OUT / f"{name}_tools_open.png"),full_page=False,animations="disabled")
                        page.locator("#scout-v198-tools > summary").click()
                    page.locator(".scout-v189-about").click()
                    if not page.locator(".lab-intro").is_visible() or not page.locator(".v68-method").is_visible():
                        problems.append(f"{name}: painel completo de metodologia não abre ao solicitar")
                    page.locator(".scout-v189-about").click()
                    if page.locator(".lab-intro").is_visible():
                        problems.append(f"{name}: painel de metodologia não fecha")
                    home["methodology_collapsed_by_default"] = True
                    home["tools_menu_accessible"] = visible_update if page.locator("#scout-v198-tools").count() else False
                    library=home["elements"].get("#catalogo") or {}
                    if library.get("y",9999) > 1100:
                        problems.append(f"{name}: catálogo começa longe demais: y={library.get('y')}")

                library = home["elements"].get("#catalogo") or {}
                if mobile and library.get("y", 9999) > (700 if width <= 340 else 645):
                    problems.append(f"{name}: catálogo começa muito abaixo da primeira tela: y={library.get('y')}")
                # V203: posição, raridade, ordenação e controle de animação preservados.
                panel = page.locator("#scout-v203-filter-panel")
                if panel.evaluate("(e)=>e.open"):
                    problems.append(f"{name}: filtros avançados não devem ocupar a primeira tela por padrão")
                if page.locator("#scout-v203-filter-panel #roles").count()!=1 or page.locator("#scout-v203-filter-panel #rarities").count()!=1:
                    problems.append(f"{name}: filtros originais não foram movidos, ou foram duplicados")
                if page.locator("#scout-v203-filter-panel #sort").count()!=1:
                    problems.append(f"{name}: ordenação original ficou inacessível")
                if page.locator("#scout-v203-filter-panel .scout-motion-toggle").count()!=1:
                    problems.append(f"{name}: controle de animação se perdeu na reorganização")
                initial_count=int(page.locator("#all-count").inner_text())
                if initial_count!=246:
                    problems.append(f"{name}: acervo inicial não tem 246 cartas: {initial_count}")
                visible_cards=page.locator("#cards .player-card:visible")
                first=visible_cards.first.bounding_box() if visible_cards.count() else None
                first_y=first["y"] if first else 9999
                home["v203_first_card_y"]=round(first_y,1)
                home["v203_filter_default_closed"]=not panel.evaluate("(e)=>e.open")
                if first_y>=height-38:
                    problems.append(f"{name}: nenhuma carta aparece na primeira dobra, y={first_y}, tela={height}")
                panel.locator("summary").click()
                if not panel.evaluate("(e)=>e.open"):
                    problems.append(f"{name}: filtros não abrem por toque/clique")
                page.locator("#roles button[data-value='CA']").click()
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)===44")
                if "CA" not in panel.locator(".scout-v203-filter-status").inner_text():
                    problems.append(f"{name}: resumo não atualiza ao escolher CA")
                if page.locator("#cards .player-card:visible:not([data-role='CA'])").count():
                    problems.append(f"{name}: filtro CA não filtrou as cartas")
                page.locator("#rarities button[data-value='ÉPICA']").click()
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)<44")
                if "ÉPICA" not in panel.locator(".scout-v203-filter-status").inner_text():
                    problems.append(f"{name}: raridade ativa não aparece no resumo")
                page.select_option("#sort","alpha")
                if "Nome" not in panel.locator(".scout-v203-filter-status").inner_text():
                    problems.append(f"{name}: ordenação ativa não aparece no resumo")
                opened = metrics(page, SCREENS_SELECTORS["catalog"])
                if opened["horizontalOverflow"]>8:
                    problems.append(f"{name}: filtros abertos ultrapassam a tela")
                page.screenshot(path=str(OUT / f"{name}_filters_open.png"),full_page=False,animations="disabled")
                page.locator("#roles button[data-value='TODOS']").click()
                page.locator("#rarities button[data-value='TODAS']").click()
                page.select_option("#sort","cap")
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)===246")
                panel.locator("summary").click()
                page.evaluate("window.scrollTo(0, 0)")
                if panel.evaluate("(e)=>e.open"):
                    problems.append(f"{name}: filtros não fecham")
                if "Todas as cartas" not in panel.locator(".scout-v203-filter-status").inner_text():
                    problems.append(f"{name}: resumo não volta ao padrão")
                home["v203_filters_preserve_count"]=246
                home["v203_filters_open_overflow"]=opened["horizontalOverflow"]
                # V204: validar o acabamento real dos cartões (não só presença de CSS).
                readability = page.evaluate("""() => {
                  const cards=[...document.querySelectorAll('#cards .player-card')];
                  const first=cards[0], name=first?.querySelector('.player-name');
                  const edition=first?.querySelector('.player-version');
                  const n=name?getComputedStyle(name):null;
                  const e=edition?getComputedStyle(edition):null;
                  return {
                    count:cards.length,
                    nameWhiteSpace:n?.whiteSpace||null,
                    nameLineClamp:n?.webkitLineClamp||null,
                    editionWhiteSpace:e?.whiteSpace||null,
                    editionLineClamp:e?.webkitLineClamp||null,
                    bottomOverflow:cards.slice(0,30).filter(c=>{
                      const b=c.querySelector('.player-bottom');
                      return b&&b.scrollWidth>b.clientWidth+3;
                    }).length
                  };
                }""")
                home["v204_card_readability"]=readability
                if readability["count"]!=246:
                    problems.append(f"{name}: V204 não preservou os 246 cartões")
                if readability["nameWhiteSpace"]!="normal" or readability["nameLineClamp"]!="2":
                    problems.append(f"{name}: nome longo continua truncado em uma única linha")
                expected_lines="3" if mobile else "2"
                if readability["editionWhiteSpace"]!="normal" or readability["editionLineClamp"]!=expected_lines:
                    problems.append(f"{name}: versão não utiliza o limite de linhas previsto")
                if readability["bottomOverflow"]:
                    problems.append(f"{name}: {readability['bottomOverflow']} rodapés de cartões com overflow")
                page.screenshot(path=str(OUT / f"{name}_catalog.png"), full_page=False, animations="disabled")
                page.evaluate("""() => {
                  const grid=document.getElementById('cards');
                  if(grid)scrollTo(0,scrollY+grid.getBoundingClientRect().top-32);
                }""")
                page.screenshot(path=str(OUT / f"{name}_catalog_cards_v204.png"),full_page=False,animations="disabled")
                page.evaluate("window.scrollTo(0,0)")

                # Diagnóstico explícito de inicialização: o V205 deve montar antes das buscas.
                page.wait_for_timeout(350)
                if not page.locator("#scout-v205-empty-reset").count():
                    state=page.evaluate("""() => ({
                      ready:document.readyState, mounted:document.body.classList.contains('scout-v205-ready'),
                      catalog:!!document.getElementById('catalogo'), panel:!!document.getElementById('scout-v203-filter-panel'),
                      empty:!!document.getElementById('none'), search:!!document.getElementById('search'),
                      scripts:[...document.scripts].map(x=>x.getAttribute('src')).filter(x=>x&&x.includes('v205')),
                      styles:[...document.querySelectorAll('link')].map(x=>x.getAttribute('href')).filter(x=>x&&x.includes('v205'))
                    })""")
                    raise AssertionError(f"{name}: V205 não montou. Estado={state}, erros={errors}")
                # V205: busca no HERO nunca pode dizer "Todas as cartas" com filtro ativo.
                page.locator("#search").fill("Szoboszlai")
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)>0 && Number(document.getElementById('all-count').textContent)<246")
                status_search=page.locator(".scout-v203-filter-status").inner_text()
                if "Busca:" not in status_search or "Todas as cartas" in status_search:
                    problems.append(f"{name}: resumo V205 não reflete o texto digitado")
                if not page.locator("#scout-v205-clear").is_visible():
                    problems.append(f"{name}: ação de limpar filtros não está visível")
                page.locator("#search").fill("__SCOUT_NENHUMA_CARTA_V205__")
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)===0")
                if not page.locator("#none").is_visible() or not page.locator("#scout-v205-empty-reset").is_visible():
                    problems.append(f"{name}: busca vazia sem botão de recuperação")
                if "0 cartas" not in page.locator(".scout-v203-filter-status").inner_text():
                    problems.append(f"{name}: busca sem resultado não mostra contagem zero")
                page.screenshot(path=str(OUT / f"{name}_search_empty_v205.png"),full_page=False,animations="disabled")
                page.locator("#scout-v205-empty-reset").click()
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)===246")
                if page.locator("#search").input_value() or page.locator("#none").is_visible():
                    problems.append(f"{name}: limpar filtros não restaurou busca e catálogo")
                if page.locator("#scout-v205-clear").is_visible():
                    problems.append(f"{name}: reset V205 permaneceu visível sem filtros")
                if "Todas as cartas" not in page.locator(".scout-v203-filter-status").inner_text():
                    problems.append(f"{name}: resumo V205 não voltou ao padrão")
                if page.locator("#sort").input_value()!="cap":
                    problems.append(f"{name}: reset V205 não restaurou ordenação")
                page.evaluate("window.scrollTo(0,0)")

                errors.clear()
                page.goto(URL + "/fichas/001_Daniele_Massaro.html", wait_until="domcontentloaded", timeout=35000)
                page.locator("#scout-v194-focus").wait_for(timeout=25000)
                page.locator("#scout-v194-gameplay").wait_for(timeout=25000)
                page.locator("#scout-v162").wait_for(timeout=25000)
                # V196: assegurar que o renderizador traduziu os nomes nativos conhecidos.
                page.wait_for_function("""() =>
                    window.SCOUT_SKILL_NAMES_V196 &&
                    [...document.querySelectorAll('.skill-cloud .skill')].some(x=>x.textContent.trim()==='Cabeçada')
                """, timeout=20000)
                names = [x.strip() for x in page.locator(".skill-cloud .skill").all_text_contents()]
                for expected in ("Cabeçada", "Efeito de longe", "Folha seca", "Chute ascendente", "Precisão à distância", "Chute de primeira"):
                    if expected not in names:
                        problems.append(f"{name}: habilidade PT-BR não exibida: {expected}")
                if "Heading" in names or "Long-Range Curler" in names:
                    problems.append(f"{name}: inglês legado ainda visível na lista principal")
                page.wait_for_selector("#scout-v197-edition", state="attached", timeout=15000)
                is_collapsed = page.locator("#scout-v197-edition").evaluate("(e) => !e.open")
                if mobile and not is_collapsed:
                    problems.append(f"{name}: edição deve começar recolhida no celular")
                if not mobile and is_collapsed:
                    problems.append(f"{name}: origem e campanha devem aparecer no Windows")
                if mobile:
                    page.locator("#scout-v197-edition > summary").click()
                    if not page.locator("#scout-v197-edition").evaluate("(e) => e.open && !!e.querySelector('.detail-sub')"):
                        problems.append(f"{name}: a origem da carta desapareceu ao expandir")
                    page.locator("#scout-v197-edition > summary").click()
                    page.evaluate("window.scrollTo(0, 0)")
                page.wait_for_timeout(650)
                detail = metrics(page, SCREENS_SELECTORS["detail"])
                detail["edition_collapsed_by_default"] = is_collapsed
                detail["navigator_buttons"] = page.locator("#scout-card-navigator button").count()
                primary = page.locator("#v188-top-rec").first.inner_text()
                caution = page.locator("#v200-caution").first.inner_text()
                alternatives = page.locator("#v200-alternatives").first.inner_text()
                detail["impeto_recomendacao"] = primary
                detail["impeto_aviso"] = caution
                detail["impetos_alternativos"] = alternatives
                if page.locator(".v200-why").count() != 1:
                    problems.append(f"{name}: justificativa detalhada precisa estar acessível")
                else:
                    why = page.locator(".v200-why")
                    if why.evaluate("(e)=>e.open"):
                        problems.append(f"{name}: método extenso não deve ocupar espaço ao abrir")
                    why.locator("summary").click()
                    if not page.locator("#v188-reason").is_visible():
                        problems.append(f"{name}: justificativa extensa não abre")
                    why.locator("summary").click()
                    page.evaluate("window.scrollTo(0, 0)")
                if not primary.strip() or "Calculando" in primary:
                    problems.append(f"{name}: cálculo individual do ímpeto não concluiu")
                if not caution.strip() or not alternatives.strip():
                    problems.append(f"{name}: comparativo e cautela do ímpeto ausentes")
                if "Physicality" in primary or "Fisicalidade" in primary:
                    problems.append(f"{name}: Massaro já tem fisicalidade fixa; não recomendar de novo")
                detail["native_skills_ptbr"] = names
                detail["errors"] = list(errors)
                detail["direct_children"] = page.evaluate("""() => [...document.querySelectorAll(".profile-content > *")].map(e=>({id:e.id||"",className:typeof e.className==="string"?e.className:"",visible:getComputedStyle(e).display!=="none"}))""")
                detail["guide_count"] = page.locator("#scout-v194-focus, #scout-v194-gameplay").count()
                detail["skills_panels"] = page.locator("#scout-v162").count()
                if detail["guide_count"] != 2 or detail["skills_panels"] != 1:
                    problems.append(f"{name}: guia / habilidades não unificados na ficha")
                if detail["horizontalOverflow"] > 8:
                    problems.append(f"{name}: ficha com overflow horizontal de {detail['horizontalOverflow']} px")
                if detail["navigator_buttons"] != 3:
                    problems.append(f"{name}: navegação entre cartas precisa de 3 controles")
                main = detail["elements"].get("#scout-v188-principal") or {}
                nav = detail["elements"].get("#scout-card-navigator") or {}
                if mobile and main.get("y",9999)>(555 if width<=340 else 520):
                    problems.append(f"{name}: ficha compacta V202 começa tarde: y={main.get('y')}")
                if mobile and main.get("y", 9999) > (640 if width <= 340 else 590):
                    problems.append(f"{name}: ficha principal começa muito abaixo: y={main.get('y')}")
                if mobile and nav.get("height", 9999) > 94:
                    problems.append(f"{name}: navegador de cartas excessivamente alto: {nav.get('height')} px")
                focus = detail["elements"].get("#scout-v194-focus") or {}
                if mobile and focus.get("y", 9999) > (740 if width <= 340 else 710):
                    problems.append(f"{name}: foco competitivo não aparece cedo: y={focus.get('y')}")
                if mobile:
                    dock = detail.get("dock") or {}
                    if dock.get("height", 999) > 90 or dock.get("direction") != "row" or dock.get("bottomGap", 999) > 35:
                        problems.append(f"{name}: dock inferior desproporcional: {dock}")
                else:
                    if page.locator("#scout-v198-tools").count()==0:
                        problems.append(f"{name}: menu Ferramentas não montado na ficha de Windows")
                    else:
                        if page.locator("#scout-app-bar").is_visible():
                            problems.append(f"{name}: dock ainda ocupa parte inferior da ficha no Windows")
                        if page.locator("#scout-app-bar").evaluate("(e)=>e.parentElement?.id")!="scout-v198-tools":
                            problems.append(f"{name}: ações não foram movidas para o menu do cabeçalho")
                        if detail["dock"].get("position")=="fixed":
                            problems.append(f"{name}: barra persistente ainda sobrepõe conteúdo Windows")

                for legacy in ("#scout-performance-v80", "#scout-v74"):
                    if page.locator(legacy).count() and page.locator("body.scout-v188-compact").count():
                        if page.locator(legacy).is_visible():
                            problems.append(f"{name}: laboratório antigo {legacy} apareceu antes da ficha principal compacta")
                page.screenshot(path=str(OUT / f"{name}_profile_header.png"), full_page=False, animations="disabled")

                # V201: categorias do treino são apenas ilustradas, sem tocar no PP.
                page.wait_for_function("""() => {
                  const labels=[...document.querySelectorAll('#lab-controls .lab-group>label')];
                  return labels.length===10&&labels.every(e=>e.hasAttribute('data-scout-training-icon'));
                }""",timeout=25000)
                icons=page.locator("#v188-train .scout-v201-icon").count()
                training_chips=page.locator("#v188-train .scout-v188-train-chip").count()
                if training_chips and icons!=training_chips:
                    problems.append(f"{name}: pictogramas ausentes no resumo de treino ({icons}/{training_chips})")
                lab_labels=page.locator("#lab-controls .lab-group>label").count()
                lab_icons=page.locator("#lab-controls .lab-group>label .scout-v201-svg").count()
                if lab_labels!=10 or lab_icons!=10:
                    problems.append(f"{name}: laboratório não apresenta as 10 ilustrações")
                original_lab=page.locator("#lab-controls .lab-group").first.locator("input").input_value()
                original_val=int(original_lab)
                # Usar click DOM para conferir rerender de laboratório oculto, sem publicar modificações.
                page.evaluate("""() => document.querySelector('#lab-controls .lab-group [data-d="1"]')?.click()""")
                page.wait_for_function("""() => {
                    const row=document.querySelector('#lab-controls .lab-group');
                    return row&&Number(row.querySelector('input').value)>0&&
                           document.querySelectorAll('#lab-controls .lab-group>label.scout-v201-enriched').length===10;
                }""",timeout=15000)
                updated_val=int(page.locator("#lab-controls .lab-group").first.locator("input").input_value())
                if updated_val!=min(20,original_val+1):
                    problems.append(f"{name}: controle de PP alterou mais que um nível")
                page.evaluate("""() => document.querySelector('#lab-controls .lab-group [data-d="-1"]')?.click()""")
                page.wait_for_function("""() => document.querySelectorAll('#lab-controls .lab-group>label.scout-v201-enriched').length===10""",timeout=15000)
                recovered_val=int(page.locator("#lab-controls .lab-group").first.locator("input").input_value())
                if recovered_val!=original_val:
                    problems.append(f"{name}: teste de ícones não restaurou nível original")
                detail["train_icons_summary"]=icons
                detail["train_icons_lab"]=lab_icons
                detail["train_rerender_preserved"]=recovered_val==original_val
                page.locator("#scout-v188-principal .scout-v188-progress").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_profile_training.png"),full_page=False,animations="disabled")

                page.locator(".scout-v188-best").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_profile_impeto.png"), full_page=False, animations="disabled")
                page.locator("#scout-v194-gameplay").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_profile_gameplay.png"), full_page=False, animations="disabled")
                result = {"catalog": home, "detail": detail}
                if name in ("mobile_390", "windows_1366"):
                    page.goto(URL + "/revisao-impetos-v103.html?c=24",
                              wait_until="domcontentloaded", timeout=35000)
                    page.locator("#tactics article").first.wait_for(timeout=25000)
                    page.wait_for_function("""() => {
                      const n=document.getElementById('player-name');
                      return n && n.textContent.includes('Cristiano Ronaldo');
                    }""", timeout=25000)
                    choices = page.locator("#tactics article strong").all_text_contents()
                    for chosen in choices:
                        if "Striker's Instinct" in chosen or "Physicality" in chosen:
                            problems.append(f"{name}: revisão ainda sugere boost já embutido no Ronaldo Big Time")
                    result["booster_review"] = {"choices_ronaldo_24": choices,
                                               "is_covered": page.locator("#tactics article").count() == 3}
                    page.locator("#tactics").scroll_into_view_if_needed()
                    page.screenshot(path=str(OUT / f"{name}_booster_review.png"),
                                    full_page=False, animations="disabled")
                results[name] = result
                context.close()
        finally:
            browser.close()
    report = {"source": "Chromium via servidor web local, NÃO capturas do Android/Windows físico",
              "reference_mockup": "Referência final ainda não disponível no repositório",
              "results": results, "problems": problems}
    (OUT / "visual_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf8")
    print("Scout QA visual:", len(results), "viewports;", len(problems), "problemas", flush=True)
    for problem in problems:
        print("ERRO:", problem, file=sys.stderr, flush=True)
    return 1 if problems else 0

if __name__ == "__main__":
    raise SystemExit(run())
