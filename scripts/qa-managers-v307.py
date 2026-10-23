#!/usr/bin/env python3
"""V307: prova real no Chromium da central compartilhada Android/Windows."""
from __future__ import annotations
import json
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "artifacts" / "visual-qa"
OUT.mkdir(parents=True, exist_ok=True)
URL = os.environ.get("SCOUT_VISUAL_BASE", "http://127.0.0.1:8765").rstrip("/")

def run():
    results = {}
    with sync_playwright() as pw:
        local = shutil.which("google-chrome") or shutil.which("google-chrome-stable") or shutil.which("chromium")
        browser = pw.chromium.launch(executable_path=local, headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        try:
            for label, width, height, mobile in [
                ("manager_mobile_390", 390, 844, True),
                ("manager_windows_1366", 1366, 768, False),
            ]:
                ctx = browser.new_context(viewport={"width": width, "height": height},
                    is_mobile=mobile, has_touch=mobile, reduced_motion="reduce")
                page = ctx.new_page()
                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.goto(URL + "/tecnicos-v307.html", wait_until="domcontentloaded", timeout=35000)
                page.wait_for_function("document.querySelectorAll('.hub-card').length===23", timeout=30000)
                assert page.locator(".hub-card").first.locator(".hub-sub").inner_text().find("CT-MGR-071") >= 0, "Kovač precisa estar no topo como novo técnico"
                first = page.locator(".hub-card").first
                assert first.locator(".hub-score").count() == 6, "Cada técnico precisa de seis estilos"
                assert page.locator("#hub-count-total").inner_text() == "71"
                page.locator("#hub-cards").screenshot(path=str(OUT / (label + "_cards.png")),
                    timeout=30000, animations="disabled")
                page.select_option("#hub-scope", "all")
                page.wait_for_function("document.querySelectorAll('.hub-card').length===71", timeout=30000)
                page.select_option("#hub-scope", "featured")
                page.locator("#hub-search").fill("Klopp")
                page.wait_for_function("document.querySelectorAll('.hub-card').length===2", timeout=30000)
                assert page.locator(".hub-score").count()==12, "Duas edições, seis estilos cada"
                page.locator("#hub-search").fill("")
                page.locator(".hub-card .hub-actions .hub-btn").first.click()
                assert page.locator(".hub-card [aria-pressed='true']").count() >= 1
                page.locator(".hub-card .hub-actions .hub-btn").nth(2).click()
                assert not page.locator("#hub-compare").is_hidden(), "Comparação não abriu"
                page.locator(".hub-card .hub-actions .hub-btn.primary").first.click()
                assert page.evaluate("localStorage.getItem('craque:v302:manager-selection')") is not None
                overflow=page.evaluate("document.documentElement.scrollWidth - innerWidth")
                assert overflow <= 3, f"Vazamento horizontal na central {label}: {overflow}px"
                assert not errors, "Erros no navegador: " + " | ".join(errors)
                results[label]={"featured":23,"catalog":71,"search_klopp":2,"profiles_per_coach":6,
                    "overflow":overflow,"errors":errors}
                ctx.close()
        finally:
            browser.close()
    (OUT / "manager-v307-report.json").write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding="utf-8")
    print("V324 VISUAL PASS: 23/71 técnicos; duas versões Klopp; 6 estilos por técnico; comparação, favorito, padrão e mobile/Windows.")

if __name__=="__main__":
    run()
