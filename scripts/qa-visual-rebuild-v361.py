#!/usr/bin/env python3
"""V361: comprovar mudança realmente visível após o boot, sem modificar as 246 cartas."""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.getenv("SCOUT_VISUAL_BASE","http://127.0.0.1:8765").rstrip("/")
ART=Path("artifacts/visual-qa/v361")
ART.mkdir(parents=True,exist_ok=True)

with sync_playwright() as pw:
    exe=shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("google-chrome-stable")
    browser=pw.chromium.launch(headless=True,executable_path=exe,args=["--no-sandbox","--disable-dev-shm-usage"])
    try:
        for device,width,height,mobile in (("android320",320,700,True),("android390",390,844,True),("windows1366",1366,768,False)):
            context=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,reduced_motion="reduce")
            page=context.new_page()
            page.goto(BASE+"/index.html",wait_until="domcontentloaded",timeout=45000)
            page.locator("#ct361-home-mark").wait_for(state="visible",timeout=20000)
            page.wait_for_function("document.querySelector('#ct361-home-mark')?.textContent==='ACERVO PESSOAL'",timeout=10000)
            assert page.locator("#ct361-home-mark").inner_text()=='ACERVO PESSOAL', 'Identidade editorial ausente'
            assert page.locator("#cards .player-card").count()==246
            assert page.evaluate("document.documentElement.scrollWidth-innerWidth")<=8
            page.screenshot(path=str(ART/(device+"-home.png")),full_page=False)
            page.goto(BASE+"/fichas/001_Daniele_Massaro.html",wait_until="domcontentloaded",timeout=45000)
            page.locator("#ct361-player-glance").wait_for(state="attached",timeout=20000)
            page.locator("#scout-v188-principal").wait_for(state="attached",timeout=20000)
            page.wait_for_function('document.body.dataset.ct378Stage==="ready"',timeout=25000)
            state=page.evaluate("""() => {
                const q=s=>document.querySelector(s),v=s=>q(s)?.innerText?.trim()||'';
                const board=q('#ct361-player-glance'),img=q('.profile-content>.mobile-profile img');
                return {
                  on:document.body.dataset.ct361Ui,
                  glance:getComputedStyle(board).display,
                  original:getComputedStyle(q('.profile-content>.mobile-profile')).display,
                  name:v('.ct361-glance-name'),
                  oldName:q('.detail-header h1')?.textContent?.trim(),
                  image:board.querySelector('img')?.getAttribute('src'),
                  oldImage:img?.getAttribute('src'),
                  kpis:[...q('.ct361-glance-stats').querySelectorAll('strong')].map(x=>x.textContent.trim()),
                  oldKpis:[...document.querySelectorAll('.detail-header .hero-kpi strong')].slice(0,3).map(x=>x.textContent.trim()),
                  quick:document.querySelectorAll('#ct360-card-quick a').length,
                  firstPanel:q('#scout-v188-principal').getBoundingClientRect().top,
                  overflow:document.documentElement.scrollWidth-innerWidth,
                  updateInsideMore:!!q('#scout-app-bar .scout-v189-dock-options #scout-update')
                };
            }""")
            assert state["on"]=="ready" and state["name"]==state["oldName"],(device,state)
            assert 'V72' not in page.locator('.topbar .edition').inner_text(),(device,'Cabeçalho antigo')
            assert state["image"]==state["oldImage"] and "cartas/" in state["image"],(device,state)
            assert len(state["kpis"])==3 and state["kpis"]==state["oldKpis"],(device,state)
            assert state["quick"]==5 and state["overflow"]<=8,(device,state)
            if mobile:
                assert state["glance"]!="none" and state["original"]=="none",(device,state)
                assert state["firstPanel"]<580,(device,state)
                assert state["updateInsideMore"],(device,state)
                page.locator("#scout-app-bar .scout-v189-dock-more > summary").click()
                assert page.locator("#scout-update").is_visible(),(device,"Atualizador sumiu no Mais")
                page.locator("#scout-app-bar .scout-v189-dock-more > summary").click()
            else:
                assert state["glance"]!="none" and page.locator(".profile-sidebar").is_hidden(),(device,state)
                assert 'Card ID' in page.locator(".ct361-glance-cardno").inner_text(),(device,'Identidade preservada')
            page.screenshot(path=str(ART/(device+"-ficha.png")),full_page=False)
            page.goto(BASE+"/outros-elencos-v227.html",wait_until="domcontentloaded",timeout=45000)
            page.locator("#ct361-friends-mark").wait_for(state="visible",timeout=15000)
            assert page.locator("#friend-new-card").count()==1
            assert page.evaluate("document.documentElement.scrollWidth-innerWidth")<=8
            if mobile:page.screenshot(path=str(ART/(device+"-outros.png")),full_page=False)
            context.close()
        print("V361 CHROMIUM PASS: visual novo em Android 320/390, Windows preservado, 246 cartas, arte, PP e update acessível.")
    finally:
        browser.close()
