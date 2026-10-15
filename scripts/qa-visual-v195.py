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
    ("mobile_360", 360, 800, True),
    ("mobile_390", 390, 844, True),
    ("windows_1366", 1366, 768, False),
]
SCREENS_SELECTORS = {
    "catalog": [
        "body[data-page='catalog']", ".scout-v189-home",
        ".scout-v192-search-shell #search", ".scout-v189-quick",
        "#catalogo", "#cards .player-card"
    ],
    "detail": [
        "body[data-page='detail']", ".mobile-profile",
        "#scout-v188-principal", "#scout-v194-focus",
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
                home = metrics(page, SCREENS_SELECTORS["catalog"])
                shortcuts = page.locator(".scout-v189-quick a").count()
                home["quick_links"] = shortcuts
                home["errors"] = list(errors)
                if shortcuts != 4:
                    problems.append(f"{name}: home precisa de 4 atalhos, recebeu {shortcuts}")
                if home["horizontalOverflow"] > 8:
                    problems.append(f"{name}: catálogo com overflow horizontal de {home['horizontalOverflow']} px")
                page.screenshot(path=str(OUT / f"{name}_catalog.png"), full_page=False, animations="disabled")

                errors.clear()
                page.goto(URL + "/fichas/001_Daniele_Massaro.html", wait_until="domcontentloaded", timeout=35000)
                page.locator("#scout-v194-focus").wait_for(timeout=25000)
                page.locator("#scout-v194-gameplay").wait_for(timeout=25000)
                page.locator("#scout-v162").wait_for(timeout=25000)
                page.wait_for_timeout(650)
                detail = metrics(page, SCREENS_SELECTORS["detail"])
                detail["errors"] = list(errors)
                detail["guide_count"] = page.locator("#scout-v194-focus, #scout-v194-gameplay").count()
                detail["skills_panels"] = page.locator("#scout-v162").count()
                if detail["guide_count"] != 2 or detail["skills_panels"] != 1:
                    problems.append(f"{name}: guia / habilidades não unificados na ficha")
                if detail["horizontalOverflow"] > 8:
                    problems.append(f"{name}: ficha com overflow horizontal de {detail['horizontalOverflow']} px")
                page.screenshot(path=str(OUT / f"{name}_profile_header.png"), full_page=False, animations="disabled")
                page.locator("#scout-v194-gameplay").scroll_into_view_if_needed()
                page.screenshot(path=str(OUT / f"{name}_profile_gameplay.png"), full_page=False, animations="disabled")
                results[name] = {"catalog": home, "detail": detail}
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
