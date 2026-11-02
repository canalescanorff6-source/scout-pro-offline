"""Regressões da captura real: total assíncrono e contas sob cabeçalho Android."""
import json, os, shutil, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.getenv('SCOUT_VISUAL_BASE', 'http://127.0.0.1:8765').rstrip('/')
OUT = Path(os.getenv('SCOUT_QA_OUT', 'artifacts/visual-qa/v386'))
OUT.mkdir(parents=True, exist_ok=True)

def count_agrees(page, expected):
    page.wait_for_function('(n)=>Number(document.querySelector("#all-count").textContent)===n', arg=expected)
    page.wait_for_function('(n)=>document.querySelector(".scout-v203-filter-status").textContent.startsWith(n+" carta")', arg=expected, timeout=3000)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
    try:
        # O carregamento próprio ocorre após a montagem do resumo inicial.
        ctx = browser.new_context(viewport={'width': 390, 'height': 844})
        p = ctx.new_page()
        def late_owned(route):
            time.sleep(.5)
            route.continue_()
        p.route('**/ct364-owned-cards.json', late_owned)
        p.goto(BASE+'/index.html', wait_until='domcontentloaded')
        p.wait_for_function('document.querySelectorAll("#cards>.player-card,#cards>.ct364-player-card").length===261')
        count_agrees(p, 261)
        p.locator('#search').fill('Massaro')
        count_agrees(p, 1)
        p.locator('#search').fill('Nenhuma carta QA V386')
        count_agrees(p, 0)
        assert '246' not in p.locator('#scout-v205-empty-reset').inner_text()
        p.locator('#scout-v205-empty-reset').click()
        p.wait_for_function('Number(document.querySelector("#all-count").textContent)===261')
        # Atualização externa pelo motor, sem input/click, deve sincronizar o resumo.
        p.locator('#scout-v203-filter-toggle').click()
        p.locator('#sort').select_option('position')
        p.locator('#scout-v203-filter-toggle').click()
        p.evaluate("document.querySelector('#all-count').textContent='260'")
        count_agrees(p, 260)
        p.evaluate('CRAQUE_CATALOG_V379.refresh()')
        count_agrees(p, 261)
        p.screenshot(path=str(OUT/'count-primary.png'))
        ctx.close()

        for width in (320, 360, 390, 412):
            for safe in (28, 48):
                ctx = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True)
                ctx.add_init_script("window.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android',Plugins:{}}")
                p = ctx.new_page()
                for account in ('primary', 'secondary'):
                    p.goto(BASE+'/index.html?account='+account, wait_until='domcontentloaded')
                    p.wait_for_selector('.ct385-heading-row')
                    p.evaluate('(safe)=>document.body.style.setProperty("--scout-native-safe-top",safe+"px")', safe)
                    rect = p.evaluate('''() => {
                      const header=document.querySelector('.topbar').getBoundingClientRect();
                      const bar=document.querySelector('.ct385-account-bar').getBoundingClientRect();
                      return {headerBottom:header.bottom,barTop:bar.top,padding:parseFloat(getComputedStyle(document.body).paddingTop),overflow:document.documentElement.scrollWidth-innerWidth};
                    }''')
                    assert rect['barTop'] >= rect['headerBottom']+8, (width, safe, account, rect)
                    assert rect['padding'] >= safe and rect['overflow'] <= 1, rect
                    # Os botões reais permanecem acessíveis, inclusive após rolar e voltar.
                    p.evaluate('scrollTo(0,45)')
                    p.evaluate('scrollTo(0,0)')
                    for selector in ('#ct385-account-primary','#ct385-account-secondary','#ct385-manage>summary'):
                        assert p.locator(selector).evaluate('''e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}'''), (width,safe,selector)
                    p.locator('#ct385-manage>summary').click()
                    p.locator('#ct385-add').click()
                    assert account == p.locator('.ct385-editor [name="account"]').input_value()
                    p.locator('.ct385-editor').evaluate('(e)=>e.close()')
                    if account == 'secondary':
                        count_agrees(p, 0)
                        p.evaluate('''() => {
                          const L=CRAQUE_ACCOUNT_LIBRARY_V385;
                          L.saveCard(localStorage,'secondary',{id:'qa-v386',name:'Jogador QA V386',edition:'Teste',position:'MLG',maxLevel:32,pp:62,offenseStyle:'Orquestrador'});
                        }''')
                        p.reload(wait_until='domcontentloaded')
                        count_agrees(p, 1)
                        p.locator('#search').fill('inexistente')
                        count_agrees(p, 0)
                        assert '246' not in p.locator('#scout-v205-empty-reset').inner_text()
                    if safe == 48:
                        p.locator('#search').fill('')
                        p.evaluate('scrollTo(0,0)')
                        p.screenshot(path=str(OUT/f'android-{account}-{width}.png'))
                ctx.close()
    finally:
        browser.close()
print('V386 PASS: resumo acompanha total assíncrono, reset por conta, cabeçalho Android sem sobreposição em 4 larguras e 2 áreas seguras.')
