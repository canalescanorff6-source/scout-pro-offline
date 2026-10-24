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
from qa_competitive_v289 import run_competitive_qa

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "artifacts" / "visual-qa"
OUT.mkdir(parents=True, exist_ok=True)
URL = os.environ.get("SCOUT_VISUAL_BASE", "http://127.0.0.1:8765").rstrip("/")
SCREENS = [
    ("mobile_320", 320, 700, True),
    ("mobile_360", 360, 800, True),
    ("mobile_390", 390, 844, True),
    ("mobile_412", 412, 915, True),
    ("windows_1024", 1024, 900, False),
    ("windows_1151", 1151, 840, False),
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

                # V248: verificar GEOMETRIA REAL das cartas no hero Windows.
                # Screenshot do usuário: 1151px, busca/atalhos cobrindo as artes.
                if not mobile:
                    geometry = page.evaluate("""() => {
                      const text=document.querySelector('.hero-text');
                      const art=document.querySelector('.hero-visual');
                      const quick=document.querySelector('.scout-v189-quick');
                      const search=document.querySelector('.scout-v192-search-shell');
                      const cardNodes=[...document.querySelectorAll('.hero-visual .featured')];
                      if(!text||!art||!quick||!search||cardNodes.length!==3)return {ok:false,error:'Nós do cabeçalho ausentes'};
                      const rect=e=>e.getBoundingClientRect();
                      const a=rect(text),b=rect(art),q=rect(quick),s=rect(search);
                      const horizontal=a.right<=b.left+2;
                      const vertical=a.bottom<=b.top+2;
                      const layout=horizontal?'colunas':vertical?'empilhado':'sobreposto';
                      const inside=e=>{
                        const r=rect(e);
                        return r.left>=a.left-2&&r.right<=a.right+2;
                      };
                      const gallery=cardNodes.map(img=>{
                        const r=rect(img);
                        const width=Math.max(0,Math.min(r.right,b.right)-Math.max(r.left,b.left));
                        const height=Math.max(0,Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top));
                        const ratio=(width*height)/Math.max(1,r.width*r.height);
                        return {visibleRatio:+ratio.toFixed(3),loaded:img.complete&&img.naturalWidth>0};
                      });
                      return {
                        ok:layout!=='sobreposto'&&inside(quick)&&inside(search)&&
                          gallery.every(x=>x.loaded&&x.visibleRatio>=.90),
                        layout,searchInside:inside(search),quickInside:inside(quick),gallery
                      };
                    }""")
                    home["v248_hero_geometry"] = geometry
                    if not geometry["ok"]:
                        problems.append(f"{name}: conteúdo ocupa espaço das artes ou imagem cortada: {geometry}")

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
                motion_button=page.locator("#catalogo .scout-v238-filter-motion-row .scout-motion-toggle")
                if motion_button.count()!=1 or not motion_button.is_visible():
                    problems.append(f"{name}: botão de animação não aparece ao lado dos filtros")
                if page.locator("#scout-v203-filter-panel .scout-motion-toggle").count()!=0:
                    problems.append(f"{name}: botão de animação voltou a ficar escondido nos filtros")
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
                # Com filtro ativo, o botão compacto precisa restaurar o motor original.
                page.locator("#scout-v205-clear").click()
                page.wait_for_function("() => Number(document.getElementById('all-count').textContent)===246")
                if page.locator("#search").input_value() or page.locator("#scout-v205-clear").is_visible():
                    problems.append(f"{name}: limpar filtros compacto não restaurou as 246 cartas")
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
                page.locator("#scout-v194-focus").wait_for(state="attached",timeout=25000)
                page.locator("#scout-v220-hero").wait_for(timeout=25000)
                page.locator("#scout-v194-gameplay").wait_for(state="attached",timeout=25000)
                page.locator("#scout-v162").wait_for(state="attached",timeout=25000)
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
                # V230: ver o resultado real dos dez ícones vetoriais novos.
                page.wait_for_function("""() => document.querySelectorAll('#scout-v208-training .scout-v230-svg').length===10""",timeout=20000)
                if page.locator('#scout-v208-training .scout-v230-svg').count()!=10:
                    problems.append(f"{name}: V230 pictogramas premium incompletos")
                detail["edition_collapsed_by_default"] = is_collapsed
                detail["navigator_buttons"] = page.locator("#scout-card-navigator button").count()
                # V229: auditoria da unificação de SEIS seções antigas nesta carta.
                page.locator('#scout-v229-legacy-archive').wait_for(state='attached',timeout=25000)
                curation=page.evaluate("""() => window.CRAQUE_CARD_CURATOR_V229?.inspect(document)""")
                detail['curation_v229']=curation
                if (not curation or curation['main']!=1 or curation['archive']!=1 or
                    curation['present']!=6 or curation['archived']!=6 or
                    curation['mainTables']!=1 or curation['mainProgress']!=1 or
                    curation['duplicateIds'] or curation['visibleLegacy'] or not curation['compact']):
                    problems.append(f"{name}: V229 ficha principal ou arquivo legado com problema {curation}")
                if page.locator('#scout-v229-legacy-archive').evaluate('(e)=>e.open'):
                    problems.append(f"{name}: V229 acervo legado não deve aparecer expandido")
                if page.locator('.scout-v220-headline h2').count()!=1:
                    problems.append(f"{name}: V229 deve existir apenas uma ficha principal")
                # V220: engenharia técnica fica recolhida; abrir apenas para executar testes legados.
                tech=page.locator('#scout-v220-technical')
                if tech.count()!=1 or tech.evaluate('(e)=>e.open'):
                    problems.append(f"{name}: V220 precisa iniciar com engenharia recolhida")
                else:
                    page.locator('#scout-v220-technical > summary').click()
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
                focus = rectangle(page,"#scout-v220-tabs") or {}
                if mobile and focus.get("y", 9999) > (820 if width <= 340 else 800):
                    problems.append(f"{name}: seletor de estilos não aparece cedo: y={focus.get('y')}")
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
                page.locator('#scout-v220-technical > summary').click()
                if tech.evaluate('(e)=>e.open'):
                    problems.append(f"{name}: engenharia deve voltar a ficar recolhida")
                page.screenshot(path=str(OUT / f"{name}_profile_header.png"), full_page=False, animations="disabled")

                # V208: comparação estrutural direta com a referência do usuário.
                page.wait_for_function("() => document.querySelectorAll('#scout-v208-training tbody tr').length===10 && !!document.getElementById('scout-v218-controls')",timeout=25000)
                reference=page.evaluate("""() => {
                  const table=document.getElementById('scout-v208-training');
                  const rows=[...table.querySelectorAll('tbody tr')];
                  const levels=rows.map(row=>Number(row.querySelector('.scout-v208-level').textContent));
                  const pp=rows.map(row=>Number(row.querySelector('.scout-v208-cost').textContent));
                  const cost=n=>{let p=0;for(let i=0;i<n;i++)p+=1+Math.floor(i/4);return p};
                  return {
                    title:document.getElementById('scout-v208-heading').textContent.trim(),
                    names:rows.map(row=>row.querySelector('.scout-v208-label').textContent.trim()),
                    icons:rows.filter(row=>!!row.querySelector('.scout-v208-svg')).length,
                    levels,pp,sum:pp.reduce((a,b)=>a+b,0),
                    costsCorrect:rows.every((_,i)=>pp[i]===cost(levels[i])),
                    total:table.querySelector('.scout-v208-total').textContent.trim(),
                    hiddenFallback:document.getElementById('v188-train').getAttribute('aria-hidden')==='true',
                    overflow:table.scrollWidth-table.clientWidth
                  };
                }""")
                detail["v208_reference"]=reference
                if reference["title"]!="SCOUT · Treino registrado · Posse":
                    problems.append(f"{name}: V218 deve identificar o treino registrado sem exibir a antiga letra A falsa")
                if reference["names"]!=["Chute","Passe","Drible","Destreza","Força das pernas","Jogo aéreo","Defesa","Goleiro 1","Goleiro 2","Goleiro 3"]:
                    problems.append(f"{name}: V208 categoria ou ordem incorreta")
                if reference["icons"]!=10 or not reference["hiddenFallback"]:
                    problems.append(f"{name}: V208 ícones/fallback incorretos")
                if not reference["costsCorrect"] or reference["sum"]!=62 or reference["total"]!="62 / 62":
                    problems.append(f"{name}: V208 PP incorretos")
                if reference["overflow"]>3:
                    problems.append(f"{name}: V208 overflow horizontal {reference['overflow']} px")
                page.locator("#scout-v208-training").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_training_reference_v208.png"),full_page=False,animations="disabled")

                # V218: a ficha de treino do topo passa a ser a ÚNICA área principal,
                # com controles funcionais. Tudo que for editado é apenas rascunho local.
                for advanced in ('pontos','performance'):
                    shell=page.locator('#scout-v218-advanced-'+advanced)
                    if shell.count()!=1 or shell.evaluate('(e)=>e.open'):
                        problems.append(f"{name}: V218 deve manter comparações antigas recolhidas ({advanced})")
                main_state=page.locator('#scout-v218-status').inner_text()
                if 'REGISTRO DA CARTA' not in main_state or '62 / 62 PP' not in main_state:
                    problems.append(f"{name}: V218 não inicia na build registrada de Massaro")
                page.locator('#scout-v218-edit').click()
                page.wait_for_function("() => document.querySelectorAll('#scout-v208-training .scout-v218-stepper').length===10",timeout=10000)
                first=page.locator('#scout-v208-training tbody tr').first
                if not first.locator('button[aria-label="Aumentar Chute"]').is_disabled():
                    problems.append(f"{name}: V218 permite ultrapassar PP quando 62 já foram distribuídos")
                page.evaluate("""() => {
                    window.__v324events=[];
                    for(const type of ['scoutpro:training-preview-v324','scoutpro:training-edit-v218','scoutpro:v324:context-selected']) {
                        window.addEventListener(type,e=>window.__v324events.push({type,
                          cap:e.detail?.cap,card_id:e.detail?.card_id,levels:e.detail?.levels?.slice(0,2),
                          ctx:e.detail?.context?.manager}));
                    }
                }""")
                first.locator('button[aria-label="Reduzir Chute"]').click()
                try:
                    page.wait_for_function("""() => {
                        const t=document.querySelector('#scout-v208-training');
                        return t.querySelector('.scout-v208-total').textContent.trim()==='59 / 62' &&
                               t.querySelector('.scout-v218-level')?.textContent==='9' &&
                               document.querySelector('#lab-controls .lab-group input')?.value==='9';
                    }""",timeout=10000)
                except Exception as exc:
                    info=page.evaluate("""() => ({
                        total:document.querySelector('.scout-v208-total')?.textContent,
                        first:document.querySelector('#scout-v208-training .scout-v218-level')?.textContent,
                        lab:document.querySelector('#lab-controls .lab-group input')?.value,
                        status:document.querySelector('#scout-v218-status')?.textContent,
                        note:document.querySelector('#scout-v218-feedback')?.textContent,
                        events:window.__v324events||[],
                        keys:Object.keys(localStorage).filter(k=>k.includes('v324')).slice(0,5)
                    })""")
                    raise AssertionError(f"V324 regressão de sincronismo do laboratório: {info}") from exc
                changes=page.evaluate("""() => ({
                    overflow:document.querySelector('#scout-v208-training').scrollWidth-
                             document.querySelector('#scout-v208-training').clientWidth,
                    pageOverflow:document.documentElement.scrollWidth-innerWidth,
                    buttons:[...document.querySelectorAll('#scout-v208-training .scout-v218-step')]
                            .filter(x=>x.getBoundingClientRect().height<34).length
                })""")
                if changes['overflow']>3 or changes['pageOverflow']>3 or changes['buttons']:
                    problems.append(f"{name}: V218 overflow ou controles de ajuste muito pequenos: {changes}")
                page.screenshot(path=str(OUT / f"{name}_training_editable_v218.png"),full_page=False,animations="disabled")
                first.locator('button[aria-label="Aumentar Chute"]').click()
                page.wait_for_function("() => document.querySelector('#scout-v208-training .scout-v208-total').textContent.trim()==='62 / 62'",timeout=10000)
                page.locator('#scout-v218-reset').click()
                page.wait_for_function("() => document.querySelector('#scout-v218-status').dataset.mode==='registered'",timeout=10000)
                page.locator('#scout-v218-compare>summary').click()
                compareA=page.locator('#scout-v218-compare [data-scenario="A"]')
                if compareA.count():
                    compareA.click()
                    page.wait_for_function("""() =>
                        document.querySelector('#scout-v208-training .scout-v208-level .scout-v218-level')?.textContent==='12' &&
                        document.querySelector('#scout-v218-status')?.dataset.mode==='draft'
                    """,timeout=10000)
                    page.locator('#scout-v218-reset').click()
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v208-training .scout-v208-total').textContent.trim()==='62 / 62' &&
                    document.querySelector('#scout-v208-training tbody tr .scout-v208-level').textContent.trim()==='10'
                """,timeout=10000)

                # V302: técnicos por versão com troca real de estilo e Overload pendente.
                manager=page.locator('#ct-manager-v302')
                manager.wait_for(state='attached',timeout=20000)
                if not manager.evaluate('(e)=>e.open'):
                    problems.append(f"{name}: painel V303 deve abrir visível para escolha do técnico")
                page.locator('#ct-manager-select').select_option('CT-MGR-001')
                page.wait_for_function("""() =>
                    document.querySelector('#ct-manager-style')?.value==='rapido' &&
                    document.querySelector('#scout-v220-tabs [data-tactic="rapido"]')?.getAttribute('aria-pressed')==='true'
                """,timeout=12000)
                if 'Jürgen Klopp' not in page.locator('#ct-manager-details').inner_text():
                    problems.append(f"{name}: técnico V302 não exibiu versão exata")
                page.locator('#ct-manager-style').select_option('overload')
                page.wait_for_function("""() =>
                    document.querySelector('#ct-manager-details')?.textContent.includes('motor de PP') &&
                    document.querySelector('#scout-v220-tabs [data-tactic="rapido"]')?.getAttribute('aria-pressed')==='true'
                """,timeout=12000)
                page.screenshot(path=str(OUT / f"{name}_v302_manager_selection.png"),full_page=False,animations="disabled")
                page.locator('#ct-manager-style').select_option('posse')
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v220-tabs [data-tactic="posse"]')?.getAttribute('aria-pressed')==='true'
                """,timeout=12000)
                manager.locator('.ct-manager-actions button').click()
                manager.locator('summary').click()
                # V220: uma ficha principal para os CINCO estilos, sem segunda ficha concorrente.
                main_tabs=page.locator('#scout-v220-tabs button[data-tactic]')
                if main_tabs.count()!=5:
                    problems.append(f"{name}: V220 deve oferecer cinco estilos de técnico no mesmo painel")
                if page.locator('#scout-v220-training #scout-v208-training').count()!=1:
                    problems.append(f"{name}: V220 duplicou ou perdeu a tabela principal de PP")
                if page.locator('#scout-v220-technical #engenharia').count()!=1:
                    problems.append(f"{name}: engenharia do vídeo não ficou dentro do painel técnico")
                if page.locator('#scout-v220-technical').evaluate('(e)=>e.open'):
                    problems.append(f"{name}: engenharia V220 começou expandida")
                main_skills=page.locator('#scout-v220-skill-list .scout-v220-skill').count()
                if main_skills!=5:
                    problems.append(f"{name}: V220 precisa mostrar cinco candidatas em Posse: {main_skills}")
                # V221: Status do acervo deve aparecer na mesma ficha, sem outro formulário de treino.
                page.locator('#scout-v221-review').wait_for(timeout=25000)
                audit_label=page.locator('#scout-v221-review .scout-v221-stage').inner_text()
                if 'REVISÃO' not in audit_label:
                    problems.append(f"{name}: V221 não avisou build repetida Massaro/Batistuta: {audit_label}")
                if page.locator('#scout-v221-review .scout-v221-summary').count()!=1:
                    problems.append(f"{name}: V221 não exibiu Card ID, PP e habilidades nativas")
                panel=page.locator('#scout-v221-review > details')
                if panel.evaluate('(e)=>e.open'):
                    problems.append(f"{name}: V221 auditoria detalhada não deveria ocupar a tela inicial")
                panel.locator('summary').click()
                if page.locator('#scout-v221-review a.scout-v221-peer[href*="032_"]').count()!=1:
                    problems.append(f"{name}: V221 não ligou Massaro à carta Batistuta para comparar")
                checks=page.locator('#scout-v221-review input[type="checkbox"]')
                if checks.count()!=4:
                    problems.append(f"{name}: V221 precisa ter as 4 conferências pessoais")
                checks.first.check()
                page.locator('#scout-v221-review textarea').fill('Versão Massaro conferida visualmente; dados restantes ainda pendentes.')
                page.locator('#scout-v221-review button.scout-v221-save').click()
                if 'salva' not in page.locator('#scout-v221-review .scout-v221-feedback').inner_text().lower():
                    problems.append(f"{name}: nota V221 não foi salva localmente")
                if not page.locator('.scout-v221-personal-progress').inner_text().startswith('1 / 4'):
                    problems.append(f"{name}: V221 não diferenciou revisão pessoal de homologação")
                panel.locator('summary').click()
                if page.locator('#scout-v221-review').evaluate('(e)=>e.scrollWidth-e.clientWidth')>8:
                    problems.append(f"{name}: V221 gerou rolagem horizontal no Android/Windows")

                # V301: Massaro tem PP cadastrados e treino registrado, mas
                # o nível máximo ainda não está comprovado. Mostrar a REFERÊNCIA
                # original (62/62), sem tratá-la como build recalculada ou homologada.
                # O rascunho manual permanece isolado e persistente por estilo.
                # A mesma carta deve guardar o rascunho de contra-ataque independentemente da Posse.
                page.locator('#scout-v220-tabs [data-tactic="rapido"]').click()
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v218-status')?.textContent.includes('HIPÓTESE') &&
                    document.querySelector('#scout-v208-training .scout-v208-total')?.textContent.trim()==='62 / 62' &&
                    document.querySelector('#scout-v220-tabs [data-tactic="rapido"]')?.getAttribute('aria-pressed')==='true'
                """, timeout=12000)
                rapido_levels=page.evaluate("""() =>
                    [...document.querySelectorAll('#scout-v208-training tbody tr .scout-v208-level')]
                      .map(x=>Number(x.textContent.trim()))
                """)
                if len(rapido_levels)!=10 or sum(rapido_levels)==0:
                    problems.append(f"{name}: CA Rápido V303 não gerou níveis por estilo")
                rapido_skill_names=page.locator('#scout-v220-skill-list strong').all_inner_texts()
                if len(rapido_skill_names)<1:
                    problems.append(f"{name}: CA Rápido perdeu sugestões contextuais de habilidades")
                rapido_boost=page.locator('#scout-v220-booster-name').inner_text()
                if not rapido_boost or rapido_boost=='—':
                    problems.append(f"{name}: CA Rápido perdeu o ímpeto consultivo")
                page.locator('#scout-v220-tabs [data-tactic="normal"]').click()
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v220-tabs [data-tactic="normal"]')?.getAttribute('aria-pressed')==='true'
                """,timeout=10000)
                normal_levels=page.evaluate("""() =>
                    [...document.querySelectorAll('#scout-v208-training tbody tr .scout-v208-level')]
                      .map(x=>Number(x.textContent.trim()))
                """)
                if normal_levels==rapido_levels:
                    problems.append(f"{name}: V303 CA Normal e CA Rápido exibem distribuição idêntica em Massaro")
                page.locator('#scout-v220-tabs [data-tactic="rapido"]').click()
                page.locator('#scout-v218-edit').click()
                # V303: o ponto inicial NÃO é mais a ficha de Posse. Reduzir
                # uma categoria positiva e verificar o rascunho local por estilo,
                # sem presumir os níveis antigos de Chute/Passe.
                positive=next(i for i,v in enumerate(rapido_levels) if v>0)
                row=page.locator('#scout-v208-training tbody tr').nth(positive)
                row.locator('.scout-v218-step').first.click()
                page.wait_for_function("""(args) => {
                  const cells=[...document.querySelectorAll('#scout-v208-training tbody tr .scout-v218-level')];
                  return Number(cells[args.i]?.textContent)===args.old-1;
                }""",arg={"i":positive,"old":rapido_levels[positive]},timeout=10000)
                adjusted=page.evaluate("""() =>
                    [...document.querySelectorAll('#scout-v208-training tbody tr .scout-v218-level')]
                     .map(x=>Number(x.textContent))
                """)
                page.locator('#scout-v220-tabs [data-tactic="posse"]').click()
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v208-training tbody tr .scout-v208-level')?.textContent.trim()==='10' &&
                    document.querySelector('#scout-v218-status')?.dataset.mode==='registered'
                """,timeout=10000)
                page.locator('#scout-v220-tabs [data-tactic="rapido"]').click()
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v218-status')?.dataset.mode==='draft'
                """,timeout=10000)
                remembered=page.evaluate("""() =>
                    [...document.querySelectorAll('#scout-v208-training tbody tr .scout-v208-level')]
                     .map(x=>Number(x.textContent))
                """)
                if remembered!=adjusted:
                    problems.append(f"{name}: rascunho V220 não ficou separado por estilo de jogo")
                page.locator('#scout-v218-reset').click()
                for tactic in ('normal','fora','longo'):
                    page.locator(f'#scout-v220-tabs [data-tactic="{tactic}"]').click()
                    page.wait_for_function("""tactic => {
                      const btn=document.querySelector('#scout-v220-tabs [data-tactic="'+tactic+'"]');
                      return btn?.getAttribute('aria-pressed')==='true' &&
                        document.querySelector('#scout-v208-training .scout-v208-total')?.textContent.trim()==='62 / 62' &&
                        document.querySelector('#scout-v218-status')?.textContent.includes('HIPÓTESE');
                    }""",arg=tactic,timeout=10000)
                    booster=page.locator('#scout-v220-booster-name').inner_text().strip()
                    if not booster or booster in ('—','Calculando…'):
                        problems.append(f"{name}: V220 ímpeto não recalculou em {tactic}")
                page.locator('#scout-v220-tabs [data-tactic="posse"]').click()
                page.wait_for_function("""() =>
                    document.querySelector('#scout-v208-training tbody tr .scout-v208-level')?.textContent.trim()==='10'
                """,timeout=10000)
                page.locator('#scout-v220-outcome').select_option('promissor')
                page.locator('#scout-v220-notes').fill('Teste de Massaro em Posse com tabelas curtas e movimentação observada.')
                page.locator('#scout-v220-save-notes').click()
                if 'guardadas' not in page.locator('#scout-v220-notice').inner_text():
                    problems.append(f"{name}: registro local de teste por tática não confirmou salvamento")
                page.screenshot(path=str(OUT / f"{name}_v220_card_five_styles.png"),full_page=False,animations="disabled")
                v220_geom=page.evaluate("""() => ({
                    tabs:document.querySelectorAll('#scout-v220-tabs button').length,
                    panel:document.querySelector('#scout-v220-hero')?.getBoundingClientRect().width,
                    overflow:document.documentElement.scrollWidth-innerWidth,
                    main:document.querySelectorAll('#scout-v220-training #scout-v208-training').length
                })""")
                detail['v220_unified']=v220_geom
                if v220_geom['overflow']>8:
                    problems.append(f"{name}: ficha premium V220 cria rolagem lateral {v220_geom['overflow']} px")

                # V207: painel individual com PP e Card ID reais.
                page.wait_for_function("""() => {
                  const root=document.getElementById('scout-v207-identity');
                  return root&&root.querySelector('#scout-v207-status')&&root.querySelector('.scout-v207-preview');
                }""",timeout=25000)
                # V242: comparação individual não pode parecer uma segunda ficha.
                # Abrir o arquivo SOMENTE para testar os recursos legados completos.
                page.wait_for_function("""() => {
                  const archive=document.getElementById('scout-v229-legacy-archive');
                  const identity=document.getElementById('scout-v207-identity');
                  return archive&&identity&&archive.contains(identity)&&!archive.open;
                }""",timeout=25000)
                if not page.locator('#scout-v220-technical').evaluate('(e)=>e.open'):
                    page.locator('#scout-v220-technical > summary').click()
                page.locator('#scout-v229-legacy-archive > summary').click()
                audit=page.evaluate("""() => {
                  const panel=document.getElementById('scout-v207-identity');
                  return {status:panel.querySelector('#scout-v207-status').textContent,
                    peerSummary:panel.querySelector('.scout-v207-peers>summary').textContent,
                    width:panel.scrollWidth,client:panel.clientWidth};
                }""")
                detail["v207_individual_audit"]=audit
                if "62 PP" not in audit["status"] or "registrado" not in audit["status"]:
                    problems.append(f"{name}: V207 perdeu orçamento ou treino registrado")
                if audit["width"]>audit["client"]+3:
                    problems.append(f"{name}: V207 causou overflow no painel")
                page.locator("#scout-v207-identity .scout-v207-preview>summary").click()
                page.wait_for_function("""() => document.querySelector('#scout-v207-identity .scout-v207-preview')?.open""")
                if page.locator("#scout-v207-identity .scout-v207-level").count()<4:
                    problems.append(f"{name}: comparador V207 com progressões incompletas")
                page.wait_for_function("""() => document.querySelector('#scout-v207-identity .scout-v207-peers>summary')?.textContent.includes('Distribuição igual')""",timeout=15000)
                page.locator("#scout-v207-identity .scout-v207-peers>summary").click()
                if page.locator("#scout-v207-identity .scout-v207-peer a").count()==0:
                    problems.append(f"{name}: sem cartas semelhantes no painel de auditoria")
                page.locator("#scout-v207-identity").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_individual_v207.png"),full_page=False,animations="disabled")
                page.locator("#scout-v207-identity .scout-v207-preview>summary").click()
                page.locator("#scout-v207-identity .scout-v207-peers>summary").click()

                # V230: paleta oficial da nova logo azul-noite e ouro, sem herança neon V210.
                palette=page.evaluate("""() => {
                  const panel=document.querySelector('#scout-v188-principal .scout-v188-progress.scout-v208-reference');
                  const icon=document.querySelector('#scout-v208-training .scout-v208-icon');
                  const total=document.querySelector('#scout-v208-training tfoot td:last-child');
                  return {border:getComputedStyle(icon).borderTopColor,
                   total:getComputedStyle(total).color,
                   iconFilter:getComputedStyle(icon.querySelector('svg')).filter,
                   panelBackground:getComputedStyle(panel).backgroundImage};
                }""")
                detail["v210_palette"]=palette
                if "234, 195, 108" not in palette["border"] or "246, 213, 139" not in palette["total"]:
                    problems.append(f"{name}: V230 cores do escudo não aplicadas nos atributos: {palette}")
                if "hue-rotate" in palette["iconFilter"]:
                    problems.append(f"{name}: V230 ainda aplica filtro verde dos ícones antigos")
                page.screenshot(path=str(OUT / f"{name}_palette_v210.png"),full_page=False,animations="disabled")
                # V211: Massaro e Batistuta compartilham o mesmo vetor mas exigem revisão.
                page.wait_for_function("() => !!document.getElementById('scout-v211-audit')",timeout=25000)
                review=page.evaluate("""() => {
                  const n=document.getElementById('scout-v211-audit');
                  return {status:n.dataset.reviewStatus,text:n.innerText,
                   overflow:n.scrollWidth-n.clientWidth,
                   total:document.querySelector('#scout-v208-training .scout-v208-total').textContent.trim()};
                }""")
                detail["v211_review"]=review
                if review["status"]!="revisao_documental_prioritaria" or "2 cartas" not in review["text"]:
                    problems.append(f"{name}: V211 não identificou repetição documental Massaro/Batistuta")
                if "sem troca automática" not in review["text"].lower() or review["total"]!="62 / 62":
                    problems.append(f"{name}: V211 alterou treino ou omitiu aviso de auditoria")
                if review["overflow"]>3:
                    problems.append(f"{name}: V211 causou overflow na ficha")
                page.locator("#scout-v211-audit").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_review_v211.png"),full_page=False,animations="disabled")

                # V212: verificar dossiê de Massaro, PP real e aviso não homologado.
                page.wait_for_function("() => !!document.getElementById('scout-v212-dossier')",timeout=25000)
                page.locator('#scout-v212-dossier>summary').click()
                dossier=page.evaluate("""() => {
                    const d=document.getElementById('scout-v212-dossier');
                    return {open:d.open,stage:d.dataset.stage,
                        rows:[...d.querySelectorAll('tbody tr')].map(r=>[r.children[1]?.textContent,r.children[2]?.textContent]),
                        text:d.textContent,overflow:d.scrollWidth-d.clientWidth,
                        pp:document.querySelector('#scout-v208-training .scout-v208-total').textContent.trim()};
                }""")
                detail["v212_dossier"]=dossier
                if not dossier["open"] or len(dossier["rows"])!=10:
                    problems.append(f"{name}: V212 não abre ou não exibe dez categorias")
                if not all(str(row[0]).isdigit() and str(row[1]).isdigit() for row in dossier["rows"]):
                    problems.append(f"{name}: V212 níveis ausentes/não inteiros")
                if "NÃO HOMOLOGADO" not in dossier["text"] or "nenhuma ficha foi alterada" not in dossier["text"]:
                    problems.append(f"{name}: V212 não esclarece que é experimental")
                if dossier["pp"]!="62 / 62" or dossier["overflow"]>3:
                    problems.append(f"{name}: V212 alterou PP ou causou overflow")
                page.locator('#scout-v212-dossier').scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_dossie_posse_v212.png"),full_page=False,animations="disabled")
                page.locator('#scout-v212-dossier>summary').click()

                # V215: auditoria de habilidades deve aparecer e abrir na ficha real.
                # Massaro possui Heading nativa e Cabeceio como candidata: não equipar duas vezes.
                page.wait_for_selector('#scout-v215-evidence', state='attached', timeout=25000)
                v215=page.locator('#scout-v215-evidence')
                if not page.evaluate("""() =>
                    document.getElementById('scout-v229-legacy-archive')
                      ?.contains(document.getElementById('scout-v215-evidence'))
                """):
                    problems.append(f"{name}: V242 deixou auditoria adicional fora do arquivo recolhido")
                if v215.evaluate('(e)=>e.open'):
                    problems.append(f"{name}: V215 deve começar recolhido, inclusive no Windows")
                v215.locator('summary').click()
                review215=page.evaluate("""() => {
                    const e=document.getElementById('scout-v215-evidence');
                    const summary=e.querySelector('summary').getBoundingClientRect();
                    return {open:e.open,overlaps:e.dataset.nativeOverlaps,
                        replacements:[...e.querySelectorAll('.scout-v215-replacements li strong')].map(x=>x.textContent),
                        text:e.innerText,overflow:e.scrollWidth-e.clientWidth,
                        summaryHeight:summary.height,
                        registeredPP:document.querySelector('#scout-v208-training .scout-v208-total').textContent.trim()};
                }""")
                detail['v215_skill_evidence']=review215
                if not review215['open'] or review215['overlaps']!='1':
                    problems.append(f"{name}: V215 não encontrou habilidade candidata duplicada de Massaro")
                if "Cabeceio" not in review215['text'] or "Heading" not in review215['text']:
                    problems.append(f"{name}: V215 não explica equivalência EN/PT-BR")
                if len(review215['replacements']) != 1 or review215['replacements'][0] in ('Cabeceio', 'Cabeçada'):
                    problems.append(f"{name}: V216 não propôs uma alternativa distinta de Heading")
                if "Mantidas apenas para conferência" not in review215['text'] or "Passe de primeira" not in review215['text']:
                    problems.append(f"{name}: V216 não separou as quatro sugestões históricas sem colisão")
                if "hipóteses por função" not in review215['text'].lower():
                    problems.append(f"{name}: V216 não esclarece que a alternativa não foi homologada")
                if "não alterar habilidades" not in review215['text'].lower() or review215['registeredPP']!='62 / 62':
                    problems.append(f"{name}: V215 omite preservação de build/PP")
                if review215['overflow']>3 or review215['summaryHeight']<44:
                    problems.append(f"{name}: painel V215 transborda ou possui alvo menor que 44 px")
                v215.scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_evidencia_skills_v215.png"),full_page=False,animations="disabled")
                # V217: atualizar o painel SEM recarregar após preencher as cinco adicionais,
                # sem criar uma sexta habilidade ou modificar treino/PP.
                # V220: painel de cadastro avançado deve permanecer oculto até solicitação explícita.
                if not page.locator('#scout-v220-technical').evaluate('(e)=>e.open'):
                    page.locator('#scout-v220-technical > summary').click()
                if not page.locator('#scout-v220-advanced-skills').evaluate('(e)=>e.open'):
                    page.locator('#scout-v220-advanced-skills > summary').click()
                page.locator('#scout-v162 > details:not(#v273-dossier) > summary').click()
                page.locator('#v162-equipped').fill(
                    'Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Toque de calcanhar'
                )
                page.locator('#v162-save').click()
                page.wait_for_function("""() => {
                    const e=document.getElementById('scout-v215-evidence');
                    return e?.open && e.querySelectorAll('.scout-v215-replacements li').length===0 &&
                      e.innerText.includes('Cinco habilidades adicionais distintas');
                }""",timeout=10000)
                full_slots=page.locator('#scout-v215-evidence').inner_text()
                if '5/5 distintas' not in full_slots:
                    problems.append(f"{name}: V217 não considera cinco adicionais distintas no registro local")
                if page.locator('#scout-v208-training .scout-v208-total').inner_text().strip()!='62 / 62':
                    problems.append(f"{name}: V217 alterou PP ao salvar habilidades adicionais")
                page.screenshot(path=str(OUT / f"{name}_skills_5_slots_v217.png"),full_page=False,animations="disabled")
                # Alias manual e habilidade nativa informada não podem contar como novos slots.
                page.locator('#v162-equipped').fill('Passe de primeira; One-touch Pass; Cabeceio')
                page.locator('#v162-save').click()
                page.wait_for_function("""() => {
                    const e=document.getElementById('scout-v215-evidence');
                    return e?.open && e.innerText.includes('1/5 distintas') &&
                      e.innerText.includes('Conflito com nativas');
                }""",timeout=10000)
                # Limpar registro inserido somente pelo próprio QA.
                page.locator('#v162-equipped').fill('')
                page.locator('#v162-save').click()
                page.wait_for_function("""() =>
                    document.getElementById('scout-v215-evidence')?.open &&
                    document.querySelectorAll('#scout-v215-evidence .scout-v215-replacements li').length===1
                """,timeout=10000)
                page.locator('#scout-v215-evidence > summary').click()

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
                # V206 — conferir no Chromium os 10 ícones e os controles originais.
                page.wait_for_function("""() => {
                  const keys=['chute','passe','drible','destreza','pernas','aereo','defesa','goleiro1','goleiro2','goleiro3'];
                  const icons=[...document.querySelectorAll('#lab-controls .lab-group>label .scout-v206-svg')];
                  return icons.length===10&&keys.every(k=>icons.some(e=>e.dataset.scoutV206Symbol===k));
                }""",timeout=25000)
                # Abrir avançadas somente para os testes legados do laboratório.
                if not page.locator('#scout-v220-technical').evaluate('(e)=>e.open'):
                    page.locator('#scout-v220-technical > summary').click()
                if not page.locator('#scout-v229-legacy-archive').evaluate('(e)=>e.open'):
                    page.locator('#scout-v229-legacy-archive > summary').click()
                page.locator('#scout-v218-advanced-performance > summary').click()
                # Medir geometria com o Laboratório aberto (seção compacta é display:none).
                was_compact=page.evaluate("document.body.classList.contains('scout-v188-compact')")
                if was_compact:
                    page.evaluate("document.body.classList.remove('scout-v188-compact')")
                premium=page.evaluate("""() => {
                  const summary=[...document.querySelectorAll('#v188-train .scout-v188-train-chip')];
                  const rows=[...document.querySelectorAll('#lab-controls .lab-group')];
                  const svgs=rows.map(row=>row.querySelector('label .scout-v206-svg'));
                  return {
                    summary:summary.length,
                    summaryPremium:summary.filter(chip=>!!chip.querySelector('.scout-v206-svg')).length,
                    lab:rows.length,
                    uniqueSymbols:new Set(svgs.map(svg=>svg?.dataset.scoutV206Symbol)).size,
                    visible:svgs.every(svg=>!!svg&&getComputedStyle(svg).display!=='none'),
                    overflow:rows.filter(row=>row.scrollWidth>row.clientWidth+3).length,
                    smallButtons:rows.flatMap(row=>[...row.querySelectorAll('.lab-adjust button')]).filter(btn=>btn.getBoundingClientRect().width<38||btn.getBoundingClientRect().height<40).length,
                    withNames:rows.filter(row=>!!row.querySelector('label')?.textContent?.trim()).length,
                    accents:new Set(svgs.map(svg=>getComputedStyle(svg).color)).size
                  };
                }""")
                detail["v206_premium_icons"]=premium
                if premium["lab"]!=10 or premium["uniqueSymbols"]!=10 or not premium["visible"]:
                    problems.append(f"{name}: V206 não exibiu os dez SVGs exclusivos")
                if premium["summary"]!=premium["summaryPremium"]:
                    problems.append(f"{name}: V206 não atualizou todo o resumo de treino")
                if premium["overflow"] or premium["smallButtons"]:
                    problems.append(f"{name}: V206 com overflow={premium['overflow']} ou botões pequenos={premium['smallButtons']}")
                if premium["withNames"]!=10 or premium["accents"]<1:
                    problems.append(f"{name}: V230 perdeu nomes ou pictogramas do treinamento")
                # Capturar o estado aberto e restaurar a ficha original em seguida.
                page.locator("#lab-controls .lab-group").first.scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_lab_premium_v206.png"),full_page=False,animations="disabled")
                if was_compact:
                    page.evaluate("document.body.classList.add('scout-v188-compact')")

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
                # V229: o antigo ajuste GLOBAL de "mostrar todas as análises" não pode
                # fazer as 6 fichas V72 reaparecerem após carregar outra carta.
                page.evaluate("""() => localStorage.setItem('scoutpro:v187:full-analysis','1')""")
                page.reload(wait_until='domcontentloaded')
                page.wait_for_function("""() => {
                    const c=window.CRAQUE_CARD_CURATOR_V229?.inspect(document);
                    return c?.archived===6 && c?.mainTables===1 && c?.compact;
                }""",timeout=25000)
                legacy_after_reload=page.evaluate("""() => ({
                  details:document.querySelector('#scout-v229-legacy-archive')?.open,
                  technical:document.querySelector('#scout-v220-technical')?.open,
                  rootVisible:[...document.querySelectorAll('.profile-content>section.topic')].filter(
                    el=>getComputedStyle(el).display!=='none').length
                })""")
                detail['v229_legacy_pref_inert']=legacy_after_reload
                if (legacy_after_reload['details'] or legacy_after_reload['technical'] or
                    legacy_after_reload['rootVisible']):
                    problems.append(f"{name}: V229 configuração antiga reabriu fichas: {legacy_after_reload}")
                page.evaluate("""() => localStorage.removeItem('scoutpro:v187:full-analysis')""")
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
                # V224: 23 cartas por equipe, 23 restrições e nenhuma repetição entre elencos da mesma rodada.
                page.goto(URL + "/meu-time-testes-v219.html",wait_until="domcontentloaded",timeout=35000)
                page.wait_for_function("""() => document.querySelectorAll('#squads details[data-team]').length===10""",timeout=25000)
                if 'PRÉVIA INCOMPLETA' not in page.locator('#black-feedback').inner_text():
                    problems.append(f"{name}: V222 não marcou a escalação sem as 23 cartas verificadas como prévia")
                # V330: restrições seguem acessíveis, agora em painel recolhido.
                page.locator('.ct330-black-options > summary').click()
                assert page.locator('#black-search').is_visible(), "Restrições V330 inacessíveis"
                page.locator('#black-search').fill('Massaro')
                page.wait_for_function("""() =>
                    document.querySelector('#black-candidates button[data-black-cap="1"][data-action="add"]')
                """,timeout=12000)
                if not page.locator('#black-candidates').inner_text().lower().count('massaro'):
                    problems.append(f"{name}: V222 busca visual não localizou carta real de Massaro")
                page.locator('#black-candidates button[data-black-cap="1"][data-action="add"]').click()
                page.wait_for_function("""() =>
                    document.getElementById('black-count')?.textContent==='1 / 23' &&
                    !!document.querySelector('#black-reserved button[data-black-cap="1"][data-action="remove"]')
                """,timeout=12000)
                page.wait_for_function("""() =>
                    ![...document.querySelectorAll('#squads .scout-rotation-player div small:first-of-type')]
                      .some(x=>x.textContent.includes('#001'))
                """,timeout=12000)
                page.locator('#black-reserved button[data-black-cap="1"][data-action="remove"]').click()
                page.wait_for_function("""() => document.getElementById('black-count')?.textContent==='0 / 23'""",timeout=12000)
                page.locator('#black-search').fill('')
                page.locator('.scout-rotation-quick-paste > summary').click()
                ids=', '.join(str(n) for n in range(1,24))
                page.locator('#black-input').fill(ids)
                page.locator('#black-save').click()
                page.wait_for_function("""() =>
                    document.getElementById('black-count').textContent.includes('23 / 23') &&
                    document.querySelectorAll('#squads details[data-team]').length===9
                """,timeout=12000)
                checkbox=page.locator('#black-reviewed')
                if checkbox.is_disabled():
                    problems.append(f"{name}: V222 revisão de 23 cartas bloqueada mesmo com lista completa")
                checkbox.check()
                page.wait_for_function("""() =>
                    document.querySelector('#black-feedback')?.textContent.includes('Conferência pessoal declarada')
                """,timeout=10000)
                if name in ('mobile_390','windows_1366'):
                    imported=page.evaluate("""async () => {
                      const roster=(await (await fetch('SCOUT_V69_AUDITORIA.json')).json()).cards;
                      const ids=JSON.parse(localStorage.getItem('scoutpro:v219:black-caps'));
                      return window.SCOUT_RESTRICT_V222.makeRecord(ids,roster,true);
                    }""")
                    page.locator('#black-import').set_input_files({
                      'name':'ScoutPRO-test-23.json','mimeType':'application/json',
                      'buffer':json.dumps(imported).encode('utf-8')
                    })
                    page.wait_for_function("""() =>
                        document.querySelector('#black-feedback')?.textContent.includes('Lista importada')
                    """,timeout=10000)
                    if page.locator('#black-reviewed').is_disabled() or not page.locator('#black-reviewed').is_checked():
                        problems.append(f"{name}: V222 importação perdeu a confirmação pessoal das 23 cartas")
                # V225: arquivos JSON realmente gerados no Chromium, não apenas um clique sem download.
                if name in ('mobile_390','windows_1366'):
                    with page.expect_download(timeout=12000) as export_wait:
                        page.locator('#black-export').click()
                    exported=export_wait.value
                    payload=json.loads(Path(exported.path()).read_text(encoding='utf8'))
                    if len(payload.get('excluded', []))!=23 or payload.get('limit')!=23:
                        problems.append(f"{name}: V225 exportação das 23 restrições gerou conteúdo incorreto")
                    if not exported.suggested_filename.endswith('.json'):
                        problems.append(f"{name}: V225 exportação das restrições sem extensão JSON")
                formation_metrics=page.evaluate("""() => {
                  const squads=[...document.querySelectorAll('#squads details[data-team]')];
                  const ids=squads.flatMap(s=>[...s.querySelectorAll('.scout-rotation-player')].map(p=>
                    Number(p.querySelector('small')?.textContent.match(/#([0-9]{3})/)?.[1]||0)));
                  return {squads:squads.length,players:ids.length,unique:new Set(ids).size,
                    excluded:[...new Set(ids)].filter(n=>n>=1&&n<=23),
                    horizontal:Math.max(0,document.documentElement.scrollWidth-innerWidth),
                    blackVerified:document.querySelector('#series-diagnostics')?.innerText.includes('imagens não foram verificadas externamente')
                  };
                }""")
                result['rotation_lab_4312']=formation_metrics
                if formation_metrics['squads']!=9 or formation_metrics['players']!=207 or formation_metrics['unique']!=207 or formation_metrics['excluded']:
                    problems.append(f"{name}: V219 não dividiu 223 cartas em 9 equipes exclusivas de 23 {formation_metrics}")
                if not formation_metrics['blackVerified']:
                    problems.append(f"{name}: V219 declarou mapeamento do Black como validado sem imagem")
                if formation_metrics['horizontal']>8:
                    problems.append(f"{name}: V219 laboratório tem overflow horizontal {formation_metrics['horizontal']} px")
                first=page.locator('#squads details[data-team]').first
                first.locator(':scope > summary').click()
                page.locator('#squads details[data-team]').first.locator('input[name="goals"]').fill('2')
                page.locator('#squads details[data-team]').first.locator('input[name="conceded"]').fill('0')
                page.locator('#squads details[data-team]').first.locator('textarea[name="notes"]').fill('Teste de passe curto e coberturas')
                page.locator('#squads details[data-team]').first.locator('button[type="submit"]').click()
                page.wait_for_function("""() =>
                    document.querySelector('#squads details[data-team] summary small')?.textContent.includes('1 partidas')
                """,timeout=12000)
                if name in ('mobile_390','windows_1366'):
                    with page.expect_download(timeout=12000) as squads_wait:
                        page.locator('#rotation-export').click()
                    exported_squads=json.loads(Path(squads_wait.value.path()).read_text(encoding='utf8'))
                    series=exported_squads.get('series', {})
                    current=series.get('4312-1', {}).get('teams', [])
                    if len(current)!=9 or not all(len(t.get('starters', []))==11 and len(t.get('bench', []))==12 for t in current):
                        problems.append(f"{name}: V225 arquivo exportado perdeu as 9 equipes de 23")
                    if not exported_squads.get('matches'):
                        problems.append(f"{name}: V225 arquivo exportado perdeu a partida registrada")
                    with page.expect_download(timeout=12000) as backup_wait:
                        page.locator('#rotation-backup').click()
                    backup=json.loads(Path(backup_wait.value.path()).read_text(encoding='utf8'))
                    if (backup.get('format')!='craque-tatico-backup-v226' or
                            'scoutpro:v219:black-caps' not in backup.get('items', {}) or
                            backup.get('checksum_algorithm')!='SHA-256' or
                            len(str(backup.get('checksum','')))!=64):
                        problems.append(f"{name}: V226 backup inválido, sem bloqueios ou sem SHA-256")

                page.screenshot(path=str(OUT / f"{name}_rotation_4312_v219.png"),full_page=False,animations="disabled")
                page.locator('button[data-series="4213"]').click()
                page.wait_for_function("""() =>
                    document.querySelectorAll('#squads details[data-team]').length===9 &&
                    document.querySelector('#series-diagnostics').innerText.includes('Série 4213')
                """,timeout=12000)
                second=page.evaluate("""() => {
                  const ids=[...document.querySelectorAll('#squads .scout-rotation-player div small:first-of-type')]
                    .map(x=>Number(x.textContent.match(/#([0-9]{3})/)?.[1]||0));
                  return {players:ids.length,unique:new Set(ids).size,
                   overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
                }""")
                result['rotation_lab_4213']=second
                if second['players']!=207 or second['unique']!=207 or second['overflow']>8:
                    problems.append(f"{name}: V219 4-2-1-3 incompleta ou repetida: {second}")
                # Rodada 2: incluir em equipes as 16 cartas que sobraram na Rodada 1.
                diagnostics_before=page.locator('#series-diagnostics').inner_text()
                page.locator('button[data-cycle="2"]').click()
                page.wait_for_function("""() =>
                    document.querySelectorAll('#squads details[data-team]').length===9 &&
                    document.querySelector('#series-diagnostics').textContent.includes('Rodada 2')
                """,timeout=10000)
                cycle2=page.evaluate("""() => {
                    const ids=[...document.querySelectorAll('#squads .scout-rotation-player div small:first-of-type')]
                      .map(x=>Number(x.textContent.match(/#([0-9]{3})/)?.[1]||0));
                    return {players:ids.length,unique:new Set(ids).size,overflow:document.documentElement.scrollWidth-innerWidth};
                }""")
                result['rotation_cycle_2']=cycle2
                if cycle2['players']!=207 or cycle2['unique']!=207 or cycle2['overflow']>8:
                    problems.append(f"{name}: V219 segunda rodada não manteve elenco sem repetição {cycle2}")
                page.screenshot(path=str(OUT / f"{name}_rotation_second_cycle_v219.png"),full_page=False,animations="disabled")
                if not page.locator('#rec-start').is_disabled():
                    problems.append(f"{name}: V219 gravação web sem plugin Android não deveria fingir estar funcionando")
                page.screenshot(path=str(OUT / f"{name}_rotation_4213_v219.png"),full_page=False,animations="disabled")
                page.screenshot(path=str(OUT / f"{name}_v222_black_roster_picker.png"),full_page=False,animations="disabled")
                # A lista continua idêntica quando alterna entre as duas formações.
                if page.locator('#black-count').inner_text()!='23 / 23':
                    problems.append(f"{name}: V222 bloqueios não persistiram nas duas formações")
                # V221: cards pendentes e IDs compartilhados também precisam de evidência própria.
                if name in ('mobile_390','windows_1366'):
                    page.goto(URL + "/fichas/050_Lionel_Messi.html",wait_until="domcontentloaded",timeout=35000)
                    page.locator('#scout-v221-review .scout-v221-stage').wait_for(timeout=25000)
                    messi=page.locator('#scout-v221-review').inner_text()
                    if 'PENDENTE' not in messi.upper() or 'SEM VALIDAÇÃO' not in messi.upper() or 'HABILIDADES NATIVAS' not in messi.upper():
                        problems.append(f"{name}: Messi #050 ganhou falsa homologação ou perdeu pendências reais")
                    if page.locator('#scout-v221-review').evaluate('(e)=>e.scrollWidth-e.clientWidth')>8:
                        problems.append(f"{name}: V221 Messenger #050 extrapolou a tela")
                    page.screenshot(path=str(OUT / f"{name}_v221_messi_pending.png"),full_page=False,animations="disabled")
                    page.goto(URL + "/fichas/144_Dean_Huijsen.html",wait_until="domcontentloaded",timeout=35000)
                    page.locator('#scout-v221-review .scout-v221-stage').wait_for(timeout=25000)
                    huijsen=page.locator('#scout-v221-review').inner_text()
                    if 'IDENTIDADE A REVER' not in huijsen:
                        problems.append(f"{name}: Dean Huijsen com Card ID duplicado não foi sinalizado")
                    page.locator('#scout-v221-review > details > summary').click()
                    if page.locator('#scout-v221-review a.scout-v221-peer').count()<1:
                        problems.append(f"{name}: Huijsen #144 perdeu comparação de builds iguais")
                    page.screenshot(path=str(OUT / f"{name}_v221_huijsen_shared_id.png"),full_page=False,animations="disabled")
                # V230: interface da logo e 5 estilos nas duas formações sem alterar histórico.
                page.goto(URL + '/meu-time-duas-formacoes-v177.html',wait_until='domcontentloaded',timeout=35000)
                page.locator('#ct-v230-tactic-tabs button').first.wait_for(timeout=25000)
                page.wait_for_function("""() =>
                    !!window.CRAQUE_FORMATION_UI_V230 &&
                    document.querySelectorAll('#pitch button[data-slot]').length===11 &&
                    document.querySelectorAll('#ct-v230-tactic-details .ct-v230-fit-row').length===11
                """,timeout=25000)
                if page.locator('#ct-v230-tactic-tabs button').count()!=5:
                    problems.append(f"{name}: V230 seletor dos cinco estilos na formação ausente")
                # V255: testar o módulo REAL no navegador (sem alterar titulares)
                # contra outra versão da mesma pessoa e falso ganho numérico
                # quando a posição de um titular não está confirmada.
                if name in ('mobile_390','windows_1366'):
                    check255=page.evaluate("""async () => {
                      const roster=(await (await fetch('SCOUT_V69_AUDITORIA.json')).json()).cards;
                      const byCap=new Map(roster.map(c=>[Number(c.numero),c]));
                      const bench=window.CRAQUE_BENCH_ADVISOR_V247;
                      const base=window.SCOUT_POSITION_TRAINING_V246;
                      const training={...base,status:(card,role)=>base.status(
                        card,role,{getItem:()=>null})};
                      const opts={byCap,mode:'posse',training,
                        tactics:window.CRAQUE_TACTICS_V230,
                        identity:window.SCOUT_PLAYER_IDENTITY_V245};
                      const duplicate=bench.recommend({...opts,card:byCap.get(53),
                        starters:[{slot:'cae',role:'CA',cap:50}],
                        selections:{cae:50}});
                      const repair=bench.recommend({...opts,card:byCap.get(40),
                        starters:[{slot:'cae',role:'CA',cap:191}],
                        selections:{cae:191}});
                      return {duplicate:duplicate.status,
                        duplicateAllowed:duplicate.eligible,
                        repairType:repair.decision,
                        repairGain:repair.gain,
                        repairText:repair.text,
                        repairReason:repair.reason};
                    }""")
                    if (check255['duplicateAllowed'] or check255['duplicate']!='já escalado'
                        or check255['repairType']!='corrigir_posicao_titular'
                        or check255['repairGain'] is not None
                        or 'Substituir #191' not in check255['repairText']
                        or 'NÃO é prova' not in check255['repairReason']):
                        problems.append(f"{name}: V255 reserva/identidade ou ganho indevido: {check255}")
                page.locator('#ct-v230-tactic-tabs [data-mode="rapido"]').click()
                if 'Contra-Ataque Rápido' not in page.locator('#ct-v230-tactic-name').inner_text():
                    problems.append(f"{name}: V230 contra-ataque rápido não selecionado")
                page.locator('[data-formation="4213"]').click()
                page.locator('#ct-v230-tactic-tabs [data-mode="longo"]').click()
                if ('Bola Longa' not in page.locator('#ct-v230-tactic-name').inner_text() or
                    page.locator('#pitch button[data-slot]').count()!=11):
                    problems.append(f"{name}: V230 alternar tática alterou os 11 titulares")
                # V231: formação e estilo têm ONZE titulares independentes.
                # A troca é feita pela UI real de jogador, nunca por alteração artificial no storage.
                page.locator('[data-formation="4312"]').click()
                page.locator('#ct-v230-tactic-tabs [data-mode="posse"]').click()
                page.wait_for_function("""() => window.CRAQUE_FORMATION_STATE_V231?.mode()==='posse'""",timeout=12000)
                poss_before=page.evaluate("""() => window.CRAQUE_FORMATION_STATE_V231.snapshot()""")
                page.locator('#ct-v230-tactic-tabs [data-mode="rapido"]').click()
                page.wait_for_function("""() => window.CRAQUE_FORMATION_STATE_V231?.mode()==='rapido'""",timeout=12000)
                page.locator('#pitch button[data-slot="go"]').click()
                page.locator('#player-search').fill('Oblak')
                page.locator('#player-options button[data-cap="170"]').click()
                page.wait_for_function("""() => window.CRAQUE_FORMATION_STATE_V231?.snapshot()?.go===170""",timeout=12000)
                state_fast=page.evaluate("""() => ({
                 saved:JSON.parse(localStorage.getItem('scoutpro:v231:formation-lineup:4312:rapido')||'null'),
                 current:window.CRAQUE_FORMATION_STATE_V231.snapshot()
                })""")
                if (not state_fast['saved'] or state_fast['saved']['mode']!='rapido' or
                    state_fast['current']['go']!=170):
                    problems.append(f"{name}: V231 trocou jogador mas não salvou XI do contra-ataque")
                page.locator('#ct-v230-tactic-tabs [data-mode="posse"]').click()
                poss_after=page.evaluate("""() => window.CRAQUE_FORMATION_STATE_V231.snapshot()""")
                if poss_after!=poss_before:
                    problems.append(f"{name}: V231 sobrepôs os 11 titulares de Posse {poss_after}")
                page.locator('#ct-v230-tactic-tabs [data-mode="rapido"]').click()
                if page.locator('#pitch button[data-slot="go"] .p-cap').inner_text().find('#170')<0:
                    problems.append(f"{name}: V231 não restaurou GO Oblak no modo rápido")
                page.reload(wait_until='domcontentloaded')
                page.wait_for_function("""() => window.CRAQUE_FORMATION_STATE_V231?.mode()==='rapido' &&
                  window.CRAQUE_FORMATION_STATE_V231?.snapshot()?.go===170""",timeout=25000)
                page.locator('[data-formation="4213"]').click()
                page.locator('#ct-v230-tactic-tabs [data-mode="longo"]').click()
                page.wait_for_function("""() => window.CRAQUE_FORMATION_STATE_V231?.formation()==='4213' &&
                  window.CRAQUE_FORMATION_STATE_V231?.mode()==='longo'""",timeout=12000)
                second=page.evaluate("""() => window.CRAQUE_FORMATION_STATE_V231.snapshot()""")
                if second.get('go')!=11:
                    problems.append(f"{name}: V231 vazamento de goleiro entre as duas formações")
                page.locator('[data-formation="4312"]').click()
                page.wait_for_function("""() => window.CRAQUE_FORMATION_STATE_V231?.formation()==='4312' &&
                  window.CRAQUE_FORMATION_STATE_V231?.mode()==='rapido'""",timeout=12000)
                if page.evaluate("""() => window.CRAQUE_FORMATION_STATE_V231.snapshot().go""")!=170:
                    problems.append(f"{name}: V231 perdeu titulares ao alternar formações")
                if name in ('mobile_390','windows_1366'):
                    page.locator('#ct-v230-tactic-profile details > summary').click()
                    if page.locator('#ct-v230-tactic-details .ct-v230-fit-row').count()!=11:
                        problems.append(f"{name}: V230 faltam diagnósticos individuais por posição")
                    page.screenshot(path=str(OUT / f"{name}_five_modes_v230.png"),full_page=False,animations="disabled")
                    # V246: Martinelli PTE só passa a CA após confirmação REAL no seletor.
                    page.locator('#pitch button[data-slot="cae"]').click()
                    page.locator('#show-all').check()
                    page.locator('#player-search').fill('Gabriel Martinelli')
                    page.locator('#player-options [data-v246-confirm="191"]').wait_for(timeout=12000)
                    before_v246=page.evaluate("""() => window.SCOUT_POSITION_TRAINING_V246.status(
                      {numero:191,id:'105850811319718',posicao:'PTE'},'CA').eligible""")
                    if before_v246:
                        problems.append(f"{name}: V246 liberou CA antes da confirmação de treino")
                    page.once("dialog",lambda dialog:dialog.accept())
                    page.locator('#player-options [data-v246-confirm="191"]').click()
                    page.wait_for_function("""() => window.SCOUT_POSITION_TRAINING_V246.status(
                      {numero:191,id:'105850811319718',posicao:'PTE'},'CA').status==='treinada'""",timeout=10000)
                    if not page.evaluate("""() => window.CRAQUE_TACTICS_V230.fit(
                       {numero:191,id:'105850811319718',posicao:'PTE'},'cae').match"""):
                        problems.append(f"{name}: V246 não reconheceu Martinelli CA no motor tático")
                    page.locator('#player-options [data-v246-remove="191"]').click()
                    if page.evaluate("""() => window.SCOUT_POSITION_TRAINING_V246.status(
                        {numero:191,id:'105850811319718',posicao:'PTE'},'CA').eligible"""):
                        problems.append(f"{name}: V246 não reverteu treino de posição")
                    page.locator('#picker-close').click()
                page.goto(URL + '/meu-time-testes-v219.html',wait_until='domcontentloaded',timeout=35000)
                page.wait_for_function("""() => document.querySelectorAll('#squads details[data-team]').length>=9""",timeout=25000)
                page.locator('#ct-v230-rotation-modes [data-tactic-mode="normal"]').click()
                if (page.locator('#squads details[data-team]').count()<9 or
                    page.locator('#ct-v230-rotation-modes [data-tactic-mode="normal"]').get_attribute('aria-pressed')!='true'):
                    problems.append(f"{name}: V230 laboratório não gera contra-ataque normal")
                page.locator('#ct-v230-rotation-modes [data-tactic-mode="rapido"]').click()
                if page.locator('#squads details[data-team]').count()<9:
                    problems.append(f"{name}: V230 laboratório de contra-ataque rápido sem equipes")
                page.locator('#ct-v230-rotation-modes [data-tactic-mode="posse"]').click()
                # A escolha de modo é apenas um sinal da tática, nunca um novo bloco de PP.
                # V227: acervos de outras pessoas isolados, sem tocar as 246 cartas oficiais.
                page.goto(URL + "/outros-elencos-v227.html", wait_until="domcontentloaded", timeout=35000)
                page.locator("#friend-person-name").wait_for(timeout=12000)
                # V357: duas coleções originais, preservando Bruno e 246 cartas.
                page.wait_for_function("""() => {
                  const s=localStorage.getItem('scoutpro:v227:friends-collections');
                  if(!s)return false;
                  const d=JSON.parse(s);
                  const owner=d.owners.find(o=>o.name==='7$');
                  return d.owners.some(o=>o.name==='Bruno Santos CD') &&
                    owner && d.cards.filter(c=>c.ownerId===owner.id).length===3;
                }""",timeout=12000)
                if (page.locator("#bruno-featured").count()!=1 or
                    page.locator("#ct7-featured").count()!=1 or
                    page.locator("#friend-people .friends-person").count()!=2):
                    problems.append(f"{name}: V357 Bruno/7$ não aparecem como coleções separadas")
                seven=page.evaluate("""() => {
                  const d=JSON.parse(localStorage.getItem('scoutpro:v227:friends-collections'));
                  const owner=d.owners.find(o=>o.name==='7$');
                  const cards=d.cards.filter(c=>c.ownerId===owner?.id);
                  return {
                    ids:cards.map(c=>c.cardId).sort(),
                    levels:cards.map(c=>c.level).sort(),
                    pp:cards.map(c=>c.pp).sort(),
                    images:cards.every(c=>c.image?.startsWith('data:image/webp;base64,')),
                    profiles:cards.every(c=>Object.keys(c.analysis?.profiles||{}).length===5)
                  };
                }""")
                if (seven['ids']!=sorted(['89137214427270','88041460993477','89138556700485']) or
                    seven['levels']!=[32,33,33] or seven['pp']!=[62,64,64] or
                    not seven['images'] or not seven['profiles']):
                    problems.append(f"{name}: V357 identidade, progresso ou fotos não verificados: {seven}")
                page.locator("#ct7-featured button").click()
                if page.locator("#friend-cards .friends-card").count()!=3:
                    problems.append(f"{name}: V357 não mostrou as três cartas do 7$")
                if not page.locator('#friend-cards .friends-card img').first.evaluate(
                    '(e)=>e.complete && e.naturalWidth>0'):
                    problems.append(f"{name}: V357 a imagem não carregou na coleção 7$")
                page.locator("#bruno-open-collection").click()
                page.locator("#bruno-open-collection").click()
                page.locator("#friend-cards .friends-card").first.wait_for(timeout=15000)
                # V305: acesso visível e exclusivo por carta às cinco fichas do app.
                if "Ver ficha do app" not in page.locator("#friend-cards .friends-card").first.inner_text():
                    problems.append(f"{name}: V305 não exibe botão para consultar a ficha")
                page.locator("#friend-cards .friends-analysis-action").first.click()
                if (page.locator("#friend-analysis-modes button").count()!=5 or
                    "68 PP" not in page.locator("#friend-analysis-badges").inner_text()):
                    problems.append(f"{name}: V310 perdeu cinco fichas / PP 68 confirmados do Zico")
                if not page.locator("#friend-analysis-content").inner_text().count("68 / 68 PP distribuídos"):
                    problems.append(f"{name}: V310 Zico 35 não gerou as cinco fichas com 68 PP")
                page.locator('#friend-analysis-sections [data-panel="skills"]').click()
                if not page.locator('#friend-analysis-content [data-panel="skills"]').is_visible():
                    problems.append(f"{name}: V305 habilidades adicionais não acessíveis")
                page.locator('#friend-analysis-sections [data-panel="boost"]').click()
                if not page.locator('#friend-analysis-content [data-panel="boost"]').is_visible():
                    problems.append(f"{name}: V305 ímpetos não acessíveis")
                page.locator('#friend-analysis-sections [data-panel="treino"]').click()
                page.locator('#friend-analysis-close').click()
                cover_valid=page.locator("#bruno-featured-card-art").evaluate(
                    "(e)=>e.complete && e.naturalWidth>0")
                if not cover_valid:
                    problems.append(f"{name}: V304 imagem enviada da carta Zico não renderizou")
                first=page.locator("#friend-cards .friends-card").first.inner_text()
                if ("Zico" not in first or "106 SA" not in first or
                    "Armador criativo" not in first):
                    problems.append(f"{name}: V304 Zico 106 SA ausente do Bruno")
                recorded=page.evaluate("""() => {
                  const coll=JSON.parse(localStorage.getItem('scoutpro:v227:friends-collections'));
                  const owner=coll.owners.find(x=>x.name==='Bruno Santos CD');
                  const c=coll.cards.find(x=>x.ownerId===owner?.id && x.name==='Zico');
                  return {id:c?.cardId,pp:c?.pp,level:c?.level,position:c?.position,
                    image:c?.image?.startsWith('data:image/jpeg;base64,'),
                    teams:coll.owners.length,cards:coll.cards.length}
                }""")
                if recorded!={'id':'','pp':68,'level':35,'position':'SA',
                    'image':True,'teams':2,'cards':4}:
                    problems.append(f"{name}: V310 falhou ao guardar nível/PP confirmados do Zico: {recorded}")
                page.reload(wait_until="domcontentloaded")
                if page.locator("#friend-people .friends-person").count()!=2:
                    problems.append(f"{name}: V357 duplicou ou perdeu Bruno/7$ ao recarregar")
                page.locator("#friend-person-name").fill("Acervo da Ana")
                page.locator("#friend-person-form button[type=submit]").click()
                page.locator("#friend-new-card").click()
                page.locator("#friend-card-name").fill("Lionel Messi")
                page.locator("#friend-card-edition").fill("Épico de Ana")
                page.locator("#friend-card-position").select_option("SA")
                page.locator("#friend-card-gameid").fill("TESTE-ANA")
                page.locator("#friend-dialog-save").click()
                if page.locator("#friend-cards .friends-card").count()!=1:
                    problems.append(f"{name}: V227 falha ao cadastrar carta de outra pessoa")

                # V228: nova carta sem PP exibe pendência, nunca níveis inventados.
                page.locator('#friend-cards .friends-analysis-action').click()
                if not page.locator('#friend-analysis-content').inner_text().count('Treino ainda não calculável'):
                    problems.append(f"{name}: V228 ficha sem PP inventou treino")
                if page.locator('#friend-analysis-modes button').count()!=5:
                    problems.append(f"{name}: V228 faltam estilos táticos de técnico")
                page.locator('#friend-analysis-close').click()
                # Registrar somente informações fornecidas pelo dono da carta.
                page.locator('#friend-cards .friends-actions button').filter(has_text='Editar').click()
                page.locator('#friend-card-pp').fill('62')
                page.locator('#friend-card-native').fill('Passe de primeira; Toque duplo')
                page.locator('#friend-card-skills').fill('Passe em profundidade')
                page.locator('#friend-card-fixed-booster').fill('Technique')
                page.locator('#friend-card-booster-slot').select_option('vazio')
                page.locator('#friend-dialog-save').click()
                page.locator('#friend-cards .friends-analysis-action').click()
                if (page.locator("#friend-analysis-modes button").count()!=5 or
                    not page.locator("#friend-analysis-cover-empty").is_visible()):
                    problems.append(f"{name}: V305 ficha premium de Ana não iniciou corretamente")
                if page.locator('.friend-analysis-table tbody tr').count()!=10:
                    problems.append(f"{name}: V228 não mostrou 10 grupos de treino")
                for tactic in ['posse','normal','rapido','fora','longo']:
                    page.locator(f'#friend-analysis-modes button[data-style="{tactic}"]').click()
                    if page.locator('.friend-analysis-table tbody tr').count()!=10:
                        problems.append(f"{name}: V228 tabela ausente para {tactic}")
                    if not page.locator('.friend-analysis-pp').inner_text().count('62'):
                        problems.append(f"{name}: V228 PP incorreto no modo {tactic}")
                if name in ('mobile_390','windows_1366'):
                    with page.expect_download(timeout=12000) as sheet_wait:
                        page.locator('#friend-analysis-export').click()
                    sheet=json.loads(Path(sheet_wait.value.path()).read_text(encoding='utf8'))
                    if (sheet.get('format')!='craque-friend-training-v228' or
                        len(sheet.get('styles',{}))!=5 or
                        sheet['styles']['posse']['training']['pp']!=62):
                        problems.append(f"{name}: V228 exportação de fichas táticas incompleta")
                page.locator('#friend-analysis-sections [data-panel="skills"]').click()
                if not page.locator('#friend-analysis-content [data-panel="skills"]').is_visible():
                    problems.append(f"{name}: V305 habilidades calculadas não aparecem")
                page.locator('#friend-analysis-sections [data-panel="boost"]').click()
                if not page.locator('#friend-analysis-content [data-panel="boost"]').is_visible():
                    problems.append(f"{name}: V305 ímpetos calculados não aparecem")
                page.locator('#friend-analysis-close').click()
                saved=page.evaluate("""() => {
                  const items=JSON.parse(localStorage.getItem('scoutpro:v227:friends-collections')).cards;
                  const ana=items.find(x=>x.edition==='Épico de Ana');
                  return {version:ana?.analysis?.version,
                    profiles:Object.keys(ana?.analysis?.profiles||{}),
                    posse:ana?.analysis?.profiles?.posse?.pp,
                    source:ana?.analysis?.source,
                    native:ana?.nativeSkills,
                    boosters:ana?.boosterSlot}
                }""")
                if (saved['version']!=228 or len(saved['profiles'])!=5 or
                    saved['posse']!=62 or saved['boosters']!='vazio' or
                    'Passe de primeira' not in saved['native']):
                    problems.append(f"{name}: V228 ficha automática não persistiu {saved}")

                page.locator("#friend-person-name").fill("Acervo do Bruno")
                page.locator("#friend-person-form button[type=submit]").click()
                if page.locator("#friend-cards .friends-card").count()!=0:
                    problems.append(f"{name}: V227 cartas da primeira pessoa apareceram no segundo acervo")
                page.locator("#friend-new-card").click()
                page.locator("#friend-card-name").fill("Lionel Messi")
                page.locator("#friend-card-edition").fill("Show Time de Bruno")
                page.locator("#friend-dialog-save").click()
                if page.locator("#friend-cards .friends-card").count()!=1:
                    problems.append(f"{name}: V227 Bruno não conseguiu ter sua própria carta Messi")
                page.locator("#friend-people .friends-person").filter(has_text="Acervo da Ana").click()
                card_text=page.locator("#friend-cards .friends-card").first.inner_text()
                if "Épico de Ana" not in card_text or "Show Time de Bruno" in card_text:
                    problems.append(f"{name}: V227 acervos misturados ao voltar para Ana")
                if name in ('mobile_390','windows_1366'):
                    with page.expect_download(timeout=12000) as friend_export:
                        page.locator("#friend-export").click()
                    file_data=json.loads(Path(friend_export.value.path()).read_text(encoding="utf8"))
                    if (file_data.get('format')!='craque-friend-profile-v227' or
                        len(file_data.get('cards',[]))!=1 or
                        file_data['cards'][0].get('edition')!='Épico de Ana'):
                        problems.append(f"{name}: V227 exportação individual misturou pessoas")
                    page.locator("#friend-open-backup").click()
                    page.locator("#scout-backup-modal").wait_for(state='visible',timeout=12000)
                    page.locator("#scout-close").click()
                page.reload(wait_until="domcontentloaded")
                if page.locator("#friend-people .friends-person").count()!=4:
                    problems.append(f"{name}: V227/V304/V357 coleções desapareceram após recarregar")
                stored_guests=page.evaluate("""() => {
                  const v=JSON.parse(localStorage.getItem('scoutpro:v227:friends-collections')||'null');
                  return {owners:v?.owners?.length||0,cards:v?.cards?.length||0,
                   personal:localStorage.getItem('scoutpro:v219:black-caps'),
                   horizontalOverflow:document.documentElement.scrollWidth-innerWidth}
                }""")
                result['friends_v227']=stored_guests
                if stored_guests['owners']!=4 or stored_guests['cards']!=6 or stored_guests['horizontalOverflow']>8:
                    problems.append(f"{name}: V227 isolamento/persistência/layout falhou {stored_guests}")
                page.screenshot(path=str(OUT / f"{name}_friends_v227.png"),full_page=False,animations="disabled")
                if errors:
                    relevant=[e for e in errors if 'craque-friends' in e or 'outros-elencos' in e]
                    if relevant:problems.append(f"{name}: V227 erro JS {relevant[:2]}")
                # V248: formulário de conferência no Windows e no Android simulado,
                # sem modificar as 246 fichas originais. Exportação deve preservar Card ID.
                if name in ('mobile_390','windows_1151'):
                    page.goto(URL + '/conferir-progresso-v248.html',
                        wait_until='domcontentloaded',timeout=35000)
                    page.locator('#v248-cards .ct248-card').first.wait_for(timeout=25000)
                    counts=page.locator('#v248-stats').inner_text()
                    if '85 níveis documentados' not in counts or '161 sem nível comprovado' not in counts:
                        problems.append(f"{name}: auditoria V248 não separa os 85 níveis conhecidos dos 161 pendentes: {counts}")
                    first=page.locator('#v248-cards .ct248-card').first
                    first_cap=int(first.get_attribute('data-cap'))
                    first.scroll_into_view_if_needed()
                    try:
                        page.wait_for_function("""() => {
                          const i=document.querySelector('#v248-cards .ct248-card .ct248-art img');
                          return i&&i.complete&&i.naturalWidth>0;
                        }""",timeout=15000)
                    except Exception:
                        problems.append(f"{name}: imagem original ausente no painel de níveis")
                    first.locator('.ct248-details>summary').click()
                    first.locator('input[name=level]').fill('26')
                    first.locator('input[name=confirmed]').check()
                    first.locator('button[type=submit]').click()
                    page.wait_for_function("""() => Object.keys(localStorage)
                      .some(k=>k.startsWith('scoutpro:v248:level-review:'))""",timeout=12000)
                    exported=page.evaluate("""() => {
                      const k=Object.keys(localStorage).find(k=>k.startsWith('scoutpro:v248:level-review:'));
                      const x=JSON.parse(localStorage.getItem(k));
                      return {level:x.level,pp:x.pp,cap:x.numero,card_id:x.card_id,
                        confirmed:x.confirmed_in_game};
                    }""")
                    if (exported['level']!=26 or exported['pp']!=50 or
                        exported['cap']!=first_cap or not exported['confirmed']):
                        problems.append(f"{name}: confirmação V248 perdeu nível/PP/identidade: {exported}")
                    with page.expect_download(timeout=16000) as audit_export:
                        page.locator('#v248-export').click()
                    exported_json=json.loads(Path(audit_export.value.path()).read_text(encoding='utf8'))
                    if (exported_json.get('total')!=1 or
                        exported_json['records'][0]['card_id']!=exported['card_id']):
                        problems.append(f"{name}: exportação de níveis V248 não preservou a edição")
                    page.reload(wait_until='domcontentloaded')
                    page.locator('#v248-stats').wait_for()
                    result['progress_review_v248']=exported
                    page.screenshot(path=str(OUT / f"{name}_progress_review_v248.png"),
                        full_page=False,animations="disabled")
                    # V249: a confirmação deve aparecer na carta do catálogo
                    # e na ficha ORIGINAL, sem reescrever o orçamento da build.
                    sheet_href=page.locator('#v248-cards .ct248-card').first.locator('.ct248-open').get_attribute('href')
                    page.goto(URL+'/index.html',wait_until='domcontentloaded',timeout=35000)
                    badge=page.locator(f'#cards .player-card[data-cap="{first_cap}"] .ct249-local-tag')
                    badge.wait_for(state='visible',timeout=20000)
                    if '50' not in badge.inner_text() or badge.get_attribute('data-status')!='divergente':
                        problems.append(f"{name}: V249 catálogo não alertou diferença de PP confirmada")
                    page.goto(URL+'/'+sheet_href,wait_until='domcontentloaded',timeout=35000)
                    alert=page.locator('#ct249-progress-alert')
                    alert.wait_for(state='visible',timeout=20000)
                    if (alert.get_attribute('data-status')!='divergente' or
                        '50 PP' not in alert.inner_text()):
                        problems.append(f"{name}: V249 ficha omitiu PP real confirmado")
                    review_link=alert.locator('.ct249-review-link')
                    if f'cap={first_cap}' not in (review_link.get_attribute('href') or ''):
                        problems.append(f"{name}: V249 não vincula conferência à edição exata")
                    page.screenshot(path=str(OUT/f"{name}_progress_consistency_v249.png"),
                        full_page=False,animations="disabled")
                    review_link.click()
                    page.locator(f'#v248-cards .ct248-card[data-cap="{first_cap}"]').wait_for(timeout=20000)
                    if page.locator('#v248-filter').input_value()!='all':
                        problems.append(f"{name}: V249 deep link não mostra carta confirmada")
                    page.locator(f'#v248-cards .ct248-card[data-cap="{first_cap}"] .ct248-details>summary').click()
                    page.once('dialog',lambda dialog:dialog.accept())
                    page.locator(f'#v248-cards .ct248-card[data-cap="{first_cap}"] button[data-undo]').click()
                    page.wait_for_function("""() => !Object.keys(localStorage)
                       .some(k=>k.startsWith('scoutpro:v248:level-review:'))""",timeout=12000)
                    page.goto(URL+'/index.html',wait_until='domcontentloaded',timeout=35000)
                    page.locator('#scout-v203-filter-panel > summary').wait_for(timeout=20000)
                    page.wait_for_timeout(450)
                    if page.locator(f'#cards .player-card[data-cap="{first_cap}"] .ct249-local-tag').count():
                        problems.append(f"{name}: V249 ainda mostra PP locais depois de desfazer")
                    result['progress_consistency_v249']={'cap':first_cap,'confirmed_pp':50,
                        'undo_ok':True}
                    # V250 — importar o JSON exportado em outro dispositivo
                    # sem misturar Card IDs, sem sobrescrever conflito por padrão.
                    page.goto(URL+'/conferir-progresso-v248.html',
                              wait_until='domcontentloaded',timeout=35000)
                    picker=page.locator('#v250-file')
                    await_file={'name':'niveis-exportados-v248.json',
                         'mimeType':'application/json',
                         'buffer':json.dumps(exported_json,ensure_ascii=False).encode('utf8')}
                    picker.set_input_files(await_file)
                    page.locator('#v250-preview').wait_for(state='visible',timeout=15000)
                    preview=page.locator('#v250-preview-count').inner_text()
                    if not ('1 novas conferências' in preview and '0 conflitos' in preview):
                        problems.append(f"{name}: V250 prévia de arquivo exportado inválida: {preview}")
                    before_import=page.evaluate("""() => Object.keys(localStorage)
                       .filter(k=>k.startsWith('scoutpro:v248:level-review:')).length""")
                    if before_import:
                        problems.append(f"{name}: V250 gravou dados antes da confirmação")
                    page.locator('#v250-import').click()
                    page.wait_for_function("""() => Object.keys(localStorage)
                       .some(k=>k.startsWith('scoutpro:v248:level-review:'))""",timeout=12000)
                    review_level=page.evaluate("""() => {
                      const k=Object.keys(localStorage).find(k=>k.startsWith('scoutpro:v248:level-review:'));
                      return JSON.parse(localStorage.getItem(k)).level;
                    }""")
                    if review_level!=26:
                        problems.append(f"{name}: V250 importou nível diferente do arquivo: {review_level}")
                    counts=page.locator('#v248-stats').inner_text()
                    if '1 divergências' not in counts:
                        problems.append(f"{name}: V250 não atualizou contador de PP divergente: {counts}")
                    # O mesmo arquivo não duplica nem sobrescreve.
                    picker.set_input_files(await_file)
                    page.locator('#v250-preview').wait_for(state='visible',timeout=15000)
                    if page.locator('#v250-import').is_enabled():
                        problems.append(f"{name}: V250 reimportação sem novidades deveria ser desabilitada")
                    page.locator('#v250-cancel').click()
                    # Mesmo CAP com nível diferente exige escolha explícita.
                    changed_export=json.loads(json.dumps(exported_json))
                    changed_export['records'][0]['level']=27
                    changed_export['records'][0]['pp']=52
                    changed_export['divergent']=1
                    altered={'name':'niveis-outro-dispositivo.json',
                         'mimeType':'application/json',
                         'buffer':json.dumps(changed_export,ensure_ascii=False).encode('utf8')}
                    picker.set_input_files(altered)
                    page.locator('#v250-preview').wait_for(state='visible',timeout=15000)
                    conflicts=page.locator('#v250-preview-count').inner_text()
                    if '1 conflitos' not in conflicts or page.locator('#v250-confirm').is_checked():
                        problems.append(f"{name}: V250 não protege conflitos: {conflicts}")
                    page.locator('#v250-import').click()
                    remaining=page.evaluate("""() => {
                      const k=Object.keys(localStorage).find(k=>k.startsWith('scoutpro:v248:level-review:'));
                      return JSON.parse(localStorage.getItem(k)).level;
                    }""")
                    if remaining!=26:
                        problems.append(f"{name}: V250 substituiu conflito sem autorização")
                    picker.set_input_files(altered)
                    page.locator('#v250-confirm').check()
                    page.once('dialog',lambda dialog:dialog.accept())
                    page.locator('#v250-import').click()
                    page.wait_for_function("""() => Object.keys(localStorage).some(k=>{
                       if(!k.startsWith('scoutpro:v248:level-review:'))return false;
                       return JSON.parse(localStorage.getItem(k)).level===27;
                    })""",timeout=12000)
                    # Um ID adulterado deve barrar todo o arquivo.
                    tampered=json.loads(json.dumps(exported_json))
                    tampered['records'][0]['card_id']='CARD_ID_ADULTERADO'
                    picker.set_input_files({'name':'niveis-incompatíveis.json',
                      'mimeType':'application/json',
                      'buffer':json.dumps(tampered,ensure_ascii=False).encode('utf8')})
                    page.wait_for_function("""() => document.querySelector('#v250-notice')
                       ?.textContent.includes('Importação bloqueada')""",timeout=15000)
                    if not page.locator('#v250-preview').is_hidden():
                        problems.append(f"{name}: V250 permitiu prévia de Card ID incompatível")
                    result['progress_transfer_v250']={'cap':first_cap,'imported':True,
                        'conflict_preserved':True,'explicit_replacement':True,
                        'wrong_card_id_blocked':True}
                    page.screenshot(path=str(OUT/f"{name}_progress_transfer_v250.png"),
                        full_page=False,animations="disabled")
                # V251: 84 cartas com PP comprovado e sem build precisam
                # apresentar HIPÓTESE por edição, sem alterar o treino original.
                if name in ('mobile_390','windows_1151'):
                    page.goto(URL+'/fichas/007_Sergi_Cardona.html',
                              wait_until='domcontentloaded',timeout=35000)
                    # V253: a auditoria fica recolhida DENTRO da ficha principal.
                    review253=page.locator('#ct253-integrated-review')
                    review253.wait_for(state='visible',timeout=22000)
                    if review253.evaluate('(e)=>e.open'):
                        problems.append(f"{name}: V253 abriu uma segunda ficha na tela principal")
                    page.locator('#ct253-integrated-review > summary').click()
                    v251=page.locator('#ct251-individual-ficha')
                    v251.wait_for(state='visible',timeout=22000)
                    if v251.get_attribute('data-review')!='no_build':
                        problems.append(f"{name}: V251 confundiu sem build com ficha registrada")
                    # V283: sensibilidade na ficha ÚNICA, fechada inicialmente.
                    risk=v251.locator('.ct283-sensitivity')
                    try:
                        risk.wait_for(state='attached',timeout=14000)
                    except Exception:
                        pass
                    if risk.count()!=1:
                        problems.append(f"{name}: seção de sensibilidade V283 ausente ou duplicada")
                    else:
                        if risk.evaluate('(e)=>e.open'):
                            problems.append(f"{name}: V283 abriu explicações extensas por padrão")
                        risk.locator('summary').click()
                        if risk.locator('li').count()<2:
                            problems.append(f"{name}: V283 sem comparação de nativas e PP")
                        page.screenshot(path=str(OUT/f"{name}_v283_sensitivity.png"),
                            full_page=False,animations="disabled")
                    # V284: laboratório dentro da mesma ficha, fechado por padrão.
                    lab284=v251.locator('.ct284-decision-lab')
                    lab284.wait_for(state='attached',timeout=18000)
                    if lab284.count()!=1:
                        problems.append(f"{name}: laboratório V284 duplicado ou ausente")
                    else:
                        if lab284.evaluate('(e)=>e.open'):
                            problems.append(f"{name}: laboratório V284 ocupa a tela inicial")
                        lab284.locator('summary').first.click()
                        if lab284.locator('.ct284-decision-skills > li').count()<1:
                            problems.append(f"{name}: ranking de habilidades V284 ausente")
                        if lab284.locator('.ct284-booster-rank > li').count()<1:
                            problems.append(f"{name}: matriz de ímpetos V284 ausente")
                        if lab284.locator('.ct284-pending > li').count()<1:
                            problems.append(f"{name}: pendências documentais V284 ausentes")
                        # V285: testar painel único, fechado inicialmente e sem duplicação.
                        lab285=lab284.locator('.ct285-quality-lab')
                        if lab285.count()!=1:
                            problems.append(f"{name}: segunda opinião V285 ausente ou duplicada")
                        else:
                            if lab285.evaluate('(e)=>e.open'):
                                problems.append(f"{name}: V285 não está recolhida por padrão")
                            lab285.locator(':scope > summary').click()
                            if lab285.locator('.ct285-stat').count()!=4:
                                problems.append(f"{name}: V285 não mostra os quatro indicadores")
                            if lab285.locator('.ct285-tactic').count()!=5:
                                problems.append(f"{name}: V285 não mostra os cinco estilos")
                            if lab285.locator('.ct285-skill > strong').count()<1:
                                problems.append(f"{name}: V285 sem justificativa individual de habilidade")
                            if lab285.locator('.ct285-experiments > li').count()!=3:
                                problems.append(f"{name}: V285 sem três ablações")
                            if lab285.locator('.ct285-tasks > li').count()<1:
                                problems.append(f"{name}: V285 sem pendências")
                            if lab285.evaluate('(e)=>e.scrollWidth>e.clientWidth+6'):
                                problems.append(f"{name}: painel V285 com overflow horizontal")
                            # V286: comparar listas dentro da ficha, recolhida por padrão.
                            opt286=lab284.locator('.ct286-strategic')
                            if opt286.count()!=1:
                                problems.append(f"{name}: V286 sem otimizador no laboratório")
                            else:
                                if opt286.evaluate('(e)=>e.open'):
                                    problems.append(f"{name}: painel V286 aberto por padrão")
                                opt286.locator(':scope > summary').click()
                                if opt286.locator('.ct286-side').count()!=2:
                                    problems.append(f"{name}: comparação antes/depois não montou")
                                if opt286.locator('.ct286-new-list > li').count()<1:
                                    problems.append(f"{name}: nenhuma habilidade consultiva na lista")
                                if opt286.locator('.ct286-pending > li').count()<1:
                                    problems.append(f"{name}: pendências documentais ausentes")
                                if opt286.evaluate('(e)=>e.scrollWidth>e.clientWidth+6'):
                                    problems.append(f"{name}: V286 causou overflow horizontal")
                                page.screenshot(path=str(OUT/f"{name}_v286_portfolio.png"),
                                    full_page=False,animations="disabled")
                            # V288: prova de slots não deve inventar vagas na primeira visita.
                            proof288=lab284.locator('.ct288-proof-status')
                            if proof288.count()!=1:
                                problems.append(f"{name}: resumo de provas V288 ausente/duplicado")
                            else:
                                if proof288.get_attribute('data-skills')!='pending':
                                    problems.append(f"{name}: V288 declarou slots sem confirmação")
                                if 'vagas desconhecidas' not in proof288.inner_text():
                                    problems.append(f"{name}: V288 informou vagas como livres sem prova")
                                if proof288.evaluate('(e)=>e.scrollWidth>e.clientWidth+6'):
                                    problems.append(f"{name}: resumo V288 com overflow")
                                page.screenshot(path=str(OUT/f"{name}_v288_provas.png"),
                                    full_page=False,animations="disabled")
                            # V287: conferir o conselho e suas evidências por edição.
                            audit287=lab284.locator('.ct287-evidence-council')
                            if audit287.count()!=1:
                                problems.append(f"{name}: conselho V287 ausente ou duplicado")
                            else:
                                if audit287.evaluate('(e)=>e.open'):
                                    problems.append(f"{name}: V287 aberto por padrão")
                                audit287.locator(':scope > summary').click()
                                if audit287.locator('.ct287-metric').count()!=4:
                                    problems.append(f"{name}: V287 sem resumo de quatro indicadores")
                                if audit287.locator('.ct287-priority > li').count()<1:
                                    problems.append(f"{name}: V287 sem evidências pendentes")
                                if audit287.locator('.ct287-skill-council > li').count()<1:
                                    problems.append(f"{name}: V287 sem conselho de habilidades")
                                if audit287.locator('.ct287-booster-council > li').count()<1:
                                    problems.append(f"{name}: V287 sem análise de ímpetos")
                                if audit287.evaluate('(e)=>e.scrollWidth>e.clientWidth+6'):
                                    problems.append(f"{name}: V287 com overflow horizontal")
                                page.screenshot(path=str(OUT/f"{name}_v287_conselho.png"),
                                    full_page=False,animations="disabled")
                            page.screenshot(path=str(OUT/f"{name}_v285_segunda_opiniao.png"),
                                full_page=False,animations="disabled")
                        page.screenshot(path=str(OUT/f"{name}_v284_laboratorio.png"),
                            full_page=False,animations="disabled")
                    if '68 / 68 PP' not in v251.inner_text():
                        problems.append(f"{name}: V251 não fechou PP de Sergi Cardona")
                    pos=page.locator('#scout-v218-status')
                    page.once('dialog',lambda dialog:dialog.accept())
                    v251.locator('.ct251-use').click()
                    # O rascunho depende de confirmação explícita do usuário.
                    pos.wait_for(timeout=12000)
                    page.wait_for_function("""() =>
                      document.querySelector('#scout-v218-status')
                        ?.textContent.includes('Rascunho individual V251')""",timeout=12000)
                    if '68 / 68 PP' not in pos.inner_text():
                        problems.append(f"{name}: V251 carregou PP diferente no editor")
                    page.locator('#scout-v220-tabs button[data-tactic="rapido"]').click()
                    if 'Contra-Ataque Rápido' not in v251.inner_text():
                        problems.append(f"{name}: V251 não respeitou a tática selecionada")
                    # V253: justificativas dentro da mesma ficha, sem overflow.
                    explanations=v251.locator('.ct253-reasons').first
                    if explanations.count()!=1:
                        problems.append(f"{name}: justificativa por função/tática não apareceu")
                    else:
                        explanations.locator('summary').click()
                        if not explanations.locator('li').count():
                            problems.append(f"{name}: faltam os sinais que justificam os PP")
                    if page.evaluate("""() => document.documentElement.scrollWidth - innerWidth""")>8:
                        problems.append(f"{name}: V253 gerou rolagem horizontal na ficha")
                    page.screenshot(path=str(OUT/f"{name}_v253_one_sheet.png"),
                      full_page=False,animations="disabled")
                    page.screenshot(path=str(OUT/f"{name}_v251_individual_68pp.png"),
                      full_page=False,animations="disabled")
                    # A build legada do Massaro (62 PP) não tem nível máximo
                    # comprovado: nunca sugerir que a heurística é homologada.
                    page.goto(URL+'/fichas/001_Daniele_Massaro.html',
                              wait_until='domcontentloaded',timeout=35000)
                    # O QA V250 anterior importou PP locais para esta carta.
                    # Testar estado sem prova separadamente, sem considerar
                    # nível importado como se fosse nível do catálogo.
                    page.evaluate("""() => {
                      const c=JSON.parse(document.querySelector('#scout-v68-data').textContent);
                      localStorage.removeItem('scoutpro:v248:level-review:'+c.capture+'@'+c.id);
                    }""")
                    page.reload(wait_until='domcontentloaded')
                    page.locator('#ct253-integrated-review > summary').click()
                    p251=page.locator('#ct251-individual-ficha')
                    p251.wait_for(state='visible',timeout=22000)
                    if p251.get_attribute('data-review')!='no_level':
                        problems.append(f"{name}: V251 não bloqueou ficha com nível pendente")
                    if p251.locator('.ct251-use').count():
                        problems.append(f"{name}: V251 permitiu aplicar novo treino com PP não confirmado")
                    # V256: prova documental precisa ser exigida PELO MOTOR,
                    # não apenas por um componente visual que esconde botões.
                    inspect256=page.evaluate("""async () => {
                      const c=(await (await fetch('../SCOUT_V69_AUDITORIA.json')).json()).cards.find(c=>c.numero===1);
                      const E=window.CRAQUE_INTERPRETATION_V233;
                      const card={...c,capture:c.numero,edition:c.versao,
                        shown_position:c.posicao,recommended_levels:c.niveis};
                      const result=E.compare(card,'posse',{});
                      return {documented:result.analysis?.levelDocumented,
                        proposal:result.proposal,reason:result.reason};
                    }""")
                    if (inspect256['documented'] is not False or
                        inspect256['proposal'] is not None or
                        'Nível máximo' not in inspect256['reason']):
                        problems.append(f"{name}: V256 permitiu PP sem prova no motor V233: {inspect256}")
                    # Martinelli #191: corrigir HABILIDADES da cópia antiga
                    # somente após CAP + Card ID + edição exata.
                    page.goto(URL+'/fichas/191_Gabriel_Martinelli.html',
                              wait_until='domcontentloaded',timeout=35000)
                    page.locator('#ct253-integrated-review > summary').click()
                    martinelli_v251=page.locator('#ct251-individual-ficha')
                    martinelli_v251.wait_for(state='visible',timeout=22000)
                    if (martinelli_v251.get_attribute('data-review')!='complete' or
                        'Nível 26' not in martinelli_v251.inner_text()):
                        problems.append(f"{name}: V251 não leu o nível 26 de Martinelli")
                    if '10 habilidades nativas' not in martinelli_v251.inner_text():
                        problems.append(f"{name}: V251 não reconciliou nativas do Martinelli")
                    martinelliProof256=page.evaluate("""async () => {
                      const c=(await (await fetch('../SCOUT_V69_AUDITORIA.json')).json()).cards.find(c=>c.numero===191);
                      return window.CRAQUE_INTERPRETATION_V233.levelDocumented(c);
                    }""")
                    if martinelliProof256 is not True:
                        problems.append(f"{name}: V256 rejeitou indevidamente Martinelli 26/50 PP")
                    page.wait_for_function("""() =>
                      document.querySelector('#v162-skills-status')
                        ?.textContent.includes('Nativas catalogadas: 10')""",timeout=15000)
                    page.wait_for_function("""() =>
                      document.querySelector('#scout-v220-skills-caution')
                        ?.textContent.includes('Nativas cadastradas: 10')""",timeout=15000)
                    page.screenshot(path=str(OUT/f"{name}_v251_martinelli.png"),
                      full_page=False,animations="disabled")
                    # V252: critérios documentais são específicos da edição.
                    proof=martinelli_v251.locator('.ct251-proof')
                    if (proof.count()!=1 or
                        proof.locator('li').count()!=10 or
                        'pendentes' not in proof.locator('summary').inner_text()):
                        problems.append(f"{name}: matriz de 10 critérios V252 ausente ou incompleta")
                    # Confirmar PP diferente no jogo deve bloquear TANTO o painel
                    # V251 quanto o editor principal V218, sem alterar dados.
                    page.evaluate("""() => {
                      const c=JSON.parse(document.querySelector('#scout-v68-data').textContent);
                      localStorage.setItem('scoutpro:v248:level-review:'+c.capture+'@'+c.id,
                        JSON.stringify({schema:'CRAQUE_PROGRESS_REVIEW_V248',
                          numero:Number(c.capture),card_id:String(c.id),name:String(c.name),
                          edition:String(c.edition),level:27,pp:52,confirmed_in_game:true,
                          source:'conferência manual no eFootball',
                          confirmed_at:new Date().toISOString()}));
                    }""")
                    page.reload(wait_until='domcontentloaded')
                    page.locator('#ct253-integrated-review > summary').click()
                    martinelli_v251=page.locator('#ct251-individual-ficha')
                    martinelli_v251.wait_for(state='visible',timeout=22000)
                    page.wait_for_function("""() =>
                      document.querySelector('#scout-v218-status')?.dataset.mode==='blocked'
                    """,timeout=18000)
                    if martinelli_v251.get_attribute('data-review')!='unsupported':
                        problems.append(f"{name}: V252 não bloqueou cálculo com PP divergentes")
                    if page.locator('#scout-v218-edit').is_enabled():
                        problems.append(f"{name}: V252 manteve editor habilitado com PP 52 vs 50")
                    if 'PP DIVERGENTES' not in martinelli_v251.inner_text():
                        problems.append(f"{name}: V252 não informou a divergência de PP da edição")
                    # V299: o checklist documental também deve suspender a prova
                    # de nível/PP; quando a divergência é desfeita, recupera.
                    budget_pending=page.locator('#ct251-individual-ficha .ct251-proof-list li').filter(
                        has_text='Nível máximo e PP comprovados pelo usuário')
                    if (budget_pending.count()!=1 or
                        budget_pending.get_attribute('data-proof')!='pending' or
                        'PP DIVERGENTES' not in (budget_pending.text_content() or '')):
                        problems.append(f"{name}: V299 marcou PP divergentes como orçamento DOCUMENTADO")
                    # V299: PP divergentes suspendem todos os laboratórios
                    # V283–V287, não apenas o parecer primário V298.
                    pp_guard=page.locator('#ct251-individual-ficha .ct299-pp-gate')
                    if (pp_guard.count()!=1 or
                        pp_guard.get_attribute('data-review')!='pp_divergentes' or
                        '52 PP' not in pp_guard.inner_text()):
                        problems.append(f"{name}: V299 não exibiu bloqueio único dos laboratórios por PP divergentes")
                    for gated in ['ct283-sensitivity','ct284-decision-lab',
                                  'ct285-quality-lab','ct286-strategic','ct287-evidence-council']:
                        if page.locator('#ct251-individual-ficha .'+gated).count():
                            problems.append(f"{name}: V299 exibiu {gated} apesar dos PP divergentes")
                    page.screenshot(path=str(OUT/f"{name}_v252_pp_divergentes.png"),
                      full_page=False,animations="disabled")
                    page.evaluate("""() => {
                      const c=JSON.parse(document.querySelector('#scout-v68-data').textContent);
                      localStorage.removeItem('scoutpro:v248:level-review:'+c.capture+'@'+c.id);
                    }""")
                    page.reload(wait_until='domcontentloaded')
                    page.locator('#ct253-integrated-review > summary').click()
                    page.locator('#ct251-individual-ficha').wait_for(state='visible',timeout=22000)
                    if (page.locator('#scout-v218-status').get_attribute('data-mode')=='blocked' or
                        page.locator('#ct251-individual-ficha').get_attribute('data-review')!='complete'):
                        problems.append(f"{name}: V252 não recuperou o treino após desfazer PP divergente")
                    if page.locator('#ct251-individual-ficha .ct299-pp-gate').count():
                        problems.append(f"{name}: V299 não removeu o aviso após desfazer conflito de PP")
                    budget_reconciled=page.locator('#ct251-individual-ficha .ct251-proof-list li').filter(
                        has_text='Nível máximo e PP comprovados pelo usuário')
                    if budget_reconciled.count()!=1 or budget_reconciled.get_attribute('data-proof')!='documented':
                        problems.append(f"{name}: V299 não restaurou a prova de nível/PP do Martinelli após reconciliação")
                    if not page.locator('#ct251-individual-ficha .ct284-decision-lab').count():
                        problems.append(f"{name}: V299 não reativou os laboratórios após reconciliação dos PP")
                    result['ficha_individual_v251']={'tested':True,'levels':68,
                       'pending_blocked':True,'martinelli_26_50':True,
                       'v252_proof_matrix':True,'v252_budget_guard':True}
                    # V254: NÃO presumir cinco slots vazios. A confirmação
                    # fica no Card ID da edição e é invalidada quando a
                    # lista completa de equipadas for alterada.
                    page.goto(URL+'/fichas/040_Dwight_Yorke.html',
                              wait_until='domcontentloaded',timeout=35000)
                    skill_count=page.locator('#scout-v220-skill-count')
                    skill_count.wait_for(state='visible',timeout=18000)
                    if 'Slots não conferidos' not in skill_count.inner_text():
                        problems.append(f"{name}: V254 inventou slots vagos antes da confirmação")
                    page.locator('#scout-v220-technical > summary').click()
                    page.locator('#scout-v220-advanced-skills > summary').click()
                    page.locator('#scout-v162 > details:not(#v273-dossier) > summary').click()
                    ta=page.locator('#v162-equipped')
                    ta.fill('Toque duplo; Controle com a sola; Interceptação; Marcação individual; Passe na medida')
                    page.locator('#v254-confirm-equipped').check()
                    page.locator('#v162-save').click()
                    page.wait_for_function("""()=>
                      document.querySelector('#scout-v220-skill-count')
                        ?.textContent.includes('0 vaga(s) conferida(s)')
                    """,timeout=16000)
                    if page.locator('#scout-v220-skill-list li').count()!=0 or (
                        'Cinco adicionais conferidas' not in
                        page.locator('#scout-v220-skill-list').inner_text()):
                        problems.append(f"{name}: V254 ofereceu sexta habilidade a Yorke")
                    page.reload(wait_until='domcontentloaded')
                    page.locator('#v254-confirm-equipped').wait_for(state='attached',timeout=15000)
                    if not page.locator('#v254-confirm-equipped').is_checked():
                        problems.append(f"{name}: V254 perdeu confirmação desta edição após reiniciar")
                    page.locator('#scout-v220-tabs button[data-tactic="fora"]').click()
                    page.wait_for_function("""() => document.querySelector('#scout-v220-booster-why')
                      ?.textContent.includes('em Por Fora')""",timeout=15000)
                    page.locator('#scout-v220-tabs button[data-tactic="longo"]').click()
                    page.wait_for_function("""() => document.querySelector('#scout-v220-booster-why')
                      ?.textContent.includes('em Passe Longo')""",timeout=15000)
                    # Alterar texto sem confirmar invalida prova anterior.
                    page.locator('#scout-v220-technical > summary').click()
                    page.locator('#scout-v220-advanced-skills > summary').click()
                    page.locator('#scout-v162 > details:not(#v273-dossier) > summary').click()
                    ta=page.locator('#v162-equipped')
                    ta.fill('Toque duplo; Controle com a sola')
                    if page.locator('#v254-confirm-equipped').is_checked():
                        problems.append(f"{name}: V254 manteve confirmação após modificar adicionais")
                    page.locator('#v162-save').click()
                    page.wait_for_function("""() =>
                      document.querySelector('#scout-v220-skill-count')
                        ?.textContent.includes('Slots não conferidos')
                    """,timeout=16000)
                    if page.evaluate("""() => document.documentElement.scrollWidth - innerWidth""")>8:
                        problems.append(f"{name}: V254 criou scroll lateral na lista de skills")
                    page.screenshot(path=str(OUT/f"{name}_v254_equipped_skills.png"),
                        full_page=False,animations="disabled")
                    result['skill_slots_v254']={'not_assumed':True,'five_full':True,
                       'edition_persisted':True,'editing_invalidated':True,
                       'tactic_labels_ok':True}
                if name in ('mobile_320', 'mobile_390', 'windows_1151', 'windows_1920'):
                    try:
                        result['competitive_v289'] = run_competitive_qa(page, URL, OUT, name)
                    except Exception as error:
                        problems.append(f'{name}: fluxo competitivo V289: {error}')
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
