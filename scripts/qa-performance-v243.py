#!/usr/bin/env python3
"""V243: conferência Chromium real. Relatório NÃO é benchmark de hardware Android."""
from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "artifacts" / "performance-v243"
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get("SCOUT_VISUAL_BASE", "http://127.0.0.1:8765").rstrip("/")


def assert_that(cond: bool, msg: str) -> None:
    if not cond:
        raise AssertionError(msg)


def run() -> int:
    report = {
        "source": "Headless Chromium; emulação mobile 390×844, sem CPU de aparelho real",
        "limits": "RAF/Long Tasks de CI não comprovam FPS, memória, aquecimento ou persistência no celular",
    }
    with sync_playwright() as playwright:
        executable = shutil.which("google-chrome") or shutil.which("google-chrome-stable") or shutil.which("chromium")
        browser = playwright.chromium.launch(
            executable_path=executable, headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"])
        try:
            context = browser.new_context(
                viewport={"width": 390, "height": 844}, is_mobile=True,
                has_touch=True, reduced_motion="no-preference", device_scale_factor=1)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)[:220]))
            page.goto(BASE + "/index.html", wait_until="domcontentloaded", timeout=35000)
            page.wait_for_function("""() =>
              document.querySelectorAll('#cards .player-card').length===246 &&
              window.CRAQUE_MOTION_PAUSED_V360===true
            """, timeout=28000)
            catalog = page.evaluate("""async () => {
              const grid=document.getElementById('cards');
              const list=[...grid.querySelectorAll('.player-card')];
              const visible=()=>[...grid.children].filter(n=>n.matches('.player-card')&&!n.hidden);
              const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
              let moved=0;
              const observer=new MutationObserver(records=>{
                moved+=records.reduce((acc,r)=>acc+r.addedNodes.length,0);
              });
              observer.observe(grid,{childList:true});
              const input=document.querySelector('#search');
              const originally=visible().map(n=>n.dataset.cap);
              for(let k=0;k<9;k++)input.dispatchEvent(new Event('input',{bubbles:true}));
              await frame();
              const stableMoves=moved;
              const afterRepeat=visible().map(n=>n.dataset.cap);
              const sort=document.getElementById('sort');
              sort.value='reverse';sort.dispatchEvent(new Event('change',{bubbles:true}));
              await frame();
              const reverse=visible().map(n=>Number(n.dataset.cap));
              const atReverse=moved;
              for(let k=0;k<5;k++)sort.dispatchEvent(new Event('change',{bubbles:true}));
              await frame();
              const repeatedSortMoves=moved-atReverse;
              input.value='Sergi Cardona';input.dispatchEvent(new Event('input',{bubbles:true}));
              await frame();
              const match=visible().map(n=>n.dataset.name);
              input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
              await frame();
              observer.disconnect();
              return {
                total:list.length,uniqueIds:new Set(list.map(el=>el.dataset.cap)).size,
                initialVisible:originally.length,stableMoves,repeatedSortMoves,
                originalOrderKept:originally.join(',')===afterRepeat.join(','),
                reverseFirst:reverse[0],reverseCount:reverse.length,
                searchResults:match,finalVisible:visible().length,
                fxLayerCount:document.querySelectorAll(
                  '#cards .scout-motion-layer, #cards .ct234-motion-prism'
                ).length,
                effectsPaused:window.CRAQUE_MOTION_PAUSED_V360===true &&
                  !document.body.classList.contains('scout-motion-on'),
                effectsScriptsSkipped:document.body.dataset.scoutMotionInit!=='1'
              };
            }""")
            report["catalog"] = catalog
            assert_that(catalog["total"] == 246 and catalog["uniqueIds"] == 246,
                        "Catálogo perdeu/duplicou cartas originais")
            assert_that(catalog["initialVisible"] == 30 and catalog["finalVisible"] == 30,
                        "Paginação 30 cartas quebrada")
            assert_that(catalog["stableMoves"] == 0 and catalog["repeatedSortMoves"] == 0,
                        "Busca ou sort repetido continua movimentando cartas no DOM")
            assert_that(catalog["originalOrderKept"] and catalog["reverseFirst"] == 246,
                        "Ordem do catálogo incorreta")
            assert_that(catalog["searchResults"] == ["Sergi Cardona"],
                        "Busca Cardona incorreta")
            # V360: os efeitos pesados foram removidos a pedido do proprietário.
            # As mesmas 246 cartas continuam presentes, mas não instalam observers,
            # layers ou animações em segundo plano no Android.
            assert_that(catalog["fxLayerCount"] == 0 and
                        catalog["effectsPaused"] and catalog["effectsScriptsSkipped"],
                        "V360: efeitos de cartas continuam criando custo de GPU/DOM")
            assert_that(not errors, "Erro JS na biblioteca: " + repr(errors))
            page.wait_for_function("""() =>
              !!document.querySelector('#cards .player-card:not([hidden]) .card-art')
            """, timeout=18000)
            motion = page.evaluate("""() => {
              const art=document.querySelector('#cards .player-card:not([hidden]) .card-art');
              return {
                noFxLayers:!art?.querySelector('.scout-motion-layer, .ct234-motion-prism'),
                hiddenControls:!document.querySelector('.scout-motion-toggle'),
                bodyOff:!document.body.classList.contains('scout-motion-on'),
                noForcedTransforms:getComputedStyle(art).animationName==='none'
              };
            }""")
            report["mobile_motion_v360"] = motion
            assert_that(all(motion.values()),
                        "V360: efeito decorativo foi reativado indevidamente")
            
            page.goto(BASE + "/fichas/007_Sergi_Cardona.html",
                      wait_until="domcontentloaded", timeout=35000)
            page.wait_for_function("""() => {
              const archive=document.getElementById('scout-v229-legacy-archive');
              const id=document.getElementById('scout-v207-identity');
              return archive && id && archive.contains(id);
            }""", timeout=28000)
            cardona = page.evaluate("""() => {
              const archive=document.getElementById('scout-v229-legacy-archive');
              const id=document.getElementById('scout-v207-identity');
              const extra=document.getElementById('scout-v215-evidence');
              const training=document.querySelector('#scout-v220-training #scout-v208-training');
              const tabs=document.querySelectorAll('#scout-v220-tabs button[data-tactic]');
              return {
                archiveClosed:!archive.open,
                comparisonArchived:archive.contains(id),
                extraPresent:Boolean(extra),
                extraArchived:!extra||archive.contains(extra),
                singleMainTitle:document.querySelectorAll('.scout-v220-headline h2').length,
                mainTrainingCount:document.querySelectorAll('#scout-v220-training #scout-v208-training').length,
                modes:tabs.length,hasPP:Boolean(training?.textContent.trim()),
                layoutOverflow:document.documentElement.scrollWidth-innerWidth,
                fxLayerCount:document.querySelectorAll('.scout-motion-layer, .ct234-motion-prism').length,
                effectsPaused:window.CRAQUE_MOTION_PAUSED_V360===true
              };
            }""")
            report["cardona"] = cardona
            assert_that(cardona["archiveClosed"] and cardona["comparisonArchived"] and
                        cardona["extraArchived"], "Cardona exibe comparação fora do arquivo recolhido")
            assert_that(cardona["singleMainTitle"] == 1 and
                        cardona["mainTrainingCount"] == 1 and cardona["modes"] == 5,
                        "Cardona perdeu ficha única ou estilos")
            assert_that(cardona["hasPP"] and cardona["layoutOverflow"] <= 8,
                        "Cardona perdeu PP ou criou rolagem horizontal")
            assert_that(cardona["effectsPaused"] and cardona["fxLayerCount"] == 0,
                        "Ficha individual não respeitou o modo V360 sem efeitos")
            page.screenshot(path=str(OUT / "cardona_390.png"),
                            full_page=False, animations="disabled")
            assert_that(not errors, "Erro JS no Cardona: " + repr(errors))
            context.close()
        finally:
            browser.close()
    (OUT / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False),
                                     encoding="utf-8")
    print("V243 QA Chromium OK:", json.dumps(report["catalog"], ensure_ascii=False),
          "Cardona:", json.dumps(report["cardona"], ensure_ascii=False), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
