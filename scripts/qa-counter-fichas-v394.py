"""Real counter-style fichas across three libraries; disposable Chromium profiles only."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal

ROOT = Path(__file__).resolve().parents[1]
BASE = os.getenv('SCOUT_VISUAL_BASE', 'http://127.0.0.1:8765').rstrip('/')
OUT = Path(os.getenv('SCOUT_QA_OUT', 'artifacts/visual-qa/v394-fichas'))
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = next(c for c in json.loads((ROOT / 'web/SCOUT_V69_AUDITORIA.json').read_text(encoding='utf8'))['cards'] if c['numero'] == 37)
FIXTURE = {
    'id': 'qa-counter-v394-nihat', 'name': SOURCE['name'],
    'cardId': SOURCE['id'], 'edition': SOURCE['versao'],
    'position': SOURCE['posicao'], 'positions': [SOURCE['posicao']],
    'maxLevel': SOURCE['max_level'], 'pp': SOURCE['pp'],
    'offenseStyle': SOURCE['estilo_ataque'], 'defenceStyle': SOURCE['estilo_defesa'],
    'nativeSkills': SOURCE['habilidades_nativas'].split('; '), 'nativeVerified': True,
    'skills': [], 'identityVerified': False, 'boosterSlot': 'pendente',
    'notes': 'Fixture QA descartável; edição pública real, sem comprovação de posse.'
}
# These keys store UI selections, never saved training/equipment or account data.
SNAPSHOT = """() => Object.fromEntries(Object.keys(localStorage).sort()
 .filter(k=>!k.startsWith('scoutpro:v220:style:') &&
             !k.startsWith('scoutpro:v311:position-selection:') &&
             !k.startsWith('scoutpro:v306:manager:') &&
             !k.startsWith('scoutpro:v307:manager-selection:') &&
             !k.startsWith('craque:v302:manager-selection:') &&
             k!=='scoutpro:v307:default-manager' && k!=='scoutpro:v302:manager')
 .map(k=>[k,localStorage.getItem(k)]))"""


def inspect(page, container, library, mode, width):
    guide = container.locator('.ct394-counter-role')
    guide.wait_for(timeout=25000)
    assert guide.count() == 1, (library, mode, 'Duplicated phase advice')
    assert guide.get_attribute('data-tactic') == mode
    summary = guide.locator(':scope > summary')
    assert summary.inner_text().startswith('Atacar e defender · Contra-Ataque')
    assert ('Rápido' in summary.inner_text()) == (mode == 'rapido')
    if not guide.evaluate('(el)=>el.open'):
        reveal(summary)
        summary.click()
    paragraphs = guide.locator(':scope > p').all_text_contents()
    for label in ['Com a bola · ', 'Sem a bola · ', 'Risco e correção · ']:
        line = next((p for p in paragraphs if p.startswith(label)), '')
        assert len(line) > len(label) + 15, (library, mode, label, paragraphs)
    note = guide.locator('.ct311-note').inner_text().lower()
    assert 'editoria' in note and 'não garante' in note, (library, mode, note)
    assert not any(word in guide.inner_text().lower() for word in ['vitória garantida', 'sem perder resistência'])
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (library, mode, width, 'Page overflow')
    assert guide.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'), (library, mode, width, 'Guide overflow')
    summary.scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / f'{library}-{mode}-{width}.png'))
    summary.click()
    assert not guide.evaluate('(el)=>el.open'), 'Advice must remain collapsible'
    return {'library': library, 'mode': mode, 'width': width, 'paragraphs': paragraphs}


def unchanged(page, before, library):
    after = page.evaluate(SNAPSHOT)
    changed = [key for key in set(before) | set(after) if before.get(key) != after.get(key)]
    assert not changed, (library, 'Comparison changed saved data', changed)


results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    try:
        for width, height in [(320, 740), (390, 844), (1366, 900)]:
            ctx = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            try:
                # Principal: real exact-edition canonical card, normal style UI.
                page.goto(BASE + '/fichas/226_Jose_Maria_Gimenez.html', wait_until='domcontentloaded')
                page.wait_for_function('()=>document.body.dataset.ct378Stage==="ready"', timeout=30000)
                sheet = page.locator('.ct311-main-slot .ct378-main-sheet')
                sheet.wait_for()
                before = page.evaluate(SNAPSHOT)
                for mode in ['normal', 'rapido']:
                    page.locator('#ct378-style').select_option(mode)
                    page.wait_for_function('(m)=>document.querySelector(".ct311-main-slot .ct378-main-sheet")?.dataset.tactic===m', arg=mode)
                    assert '/226_Jose_Maria_Gimenez.html' in page.url and 'Gim' in page.title()
                    results.append(inspect(page, sheet, 'principal', mode, width))
                    unchanged(page, before, 'Principal')

                # Secundária: import the real edition through the existing preview/confirm UI.
                page.goto(BASE + '/index.html?account=secondary', wait_until='domcontentloaded')
                page.wait_for_selector('body[data-ct385-catalog="ready"]', timeout=30000)
                manage = page.locator('#ct385-manage > summary')
                reveal(manage)
                manage.click()
                payload = {'schema': 'CRAQUE_ACCOUNT_CARD_IMPORT_V385', 'accountId': 'secondary', 'cards': [FIXTURE]}
                page.locator('#ct385-import').set_input_files({'name': 'qa-real-edition.json', 'mimeType': 'application/json', 'buffer': json.dumps(payload).encode('utf8')})
                page.locator('#ct385-confirm-import').wait_for()
                assert 'Secundária' in page.locator('#ct385-import-preview').inner_text()
                page.locator('#ct385-confirm-import').click()
                page.locator('#cards [data-account-card="qa-counter-v394-nihat"]').click()
                page.wait_for_selector('body[data-ct385-sheet="ready"]', timeout=30000)
                assert 'Secundária' in page.locator('#sheet-account').inner_text()
                assert SOURCE['id'] in page.locator('#sheet-data-note').inner_text()
                before = page.evaluate(SNAPSHOT)
                for mode in ['normal', 'rapido']:
                    page.locator('#sheet-style').select_option(mode)
                    page.locator('#sheet-generate').click()
                    assert '62 / 62 PP' in page.locator('#sheet-result').inner_text()
                    assert 'Dados da edição consultados' in page.locator('#sheet-result').inner_text()
                    results.append(inspect(page, page.locator('#sheet-result'), 'secundaria', mode, width))
                    assert page.locator('#sheet-history button').count() == 0
                    unchanged(page, before, 'Secundária')

                # Outros Elencos: actual shipped 7$ Hazard edition, existing style buttons.
                page.goto(BASE + '/outros-elencos-v227.html', wait_until='domcontentloaded')
                page.locator('#ct7-featured button').wait_for(timeout=30000)
                page.locator('#ct7-featured button').click()
                hazard = page.locator('#friend-cards .friends-card').filter(has_text='Eden Hazard')
                assert hazard.count() == 1
                hazard.locator('.friends-analysis-action').click()
                sheet = page.locator('#friend-analysis-dialog .ct378-main-sheet')
                sheet.wait_for(timeout=30000)
                page.wait_for_function('()=>Boolean(window.CRAQUE_REFERENCES_V376)', timeout=30000)
                before = page.evaluate(SNAPSHOT)
                for mode in ['normal', 'rapido']:
                    button = page.locator(f'#friend-analysis-modes [data-style="{mode}"]')
                    reveal(button)
                    button.click()
                    page.wait_for_function('(m)=>document.querySelector("#friend-analysis-dialog .ct378-main-sheet")?.dataset.tactic===m', arg=mode)
                    assert 'Hazard' in page.locator('#friend-analysis-dialog').inner_text()
                    results.append(inspect(page, sheet, 'outros', mode, width))
                    unchanged(page, before, 'Outros Elencos')
                assert not errors, (width, errors)
            except Exception:
                page.screenshot(path=str(OUT / f'failure-{width}.png'), full_page=True)
                raise
            finally:
                ctx.close()
    finally:
        browser.close()
(OUT / 'results.json').write_text(json.dumps({'cases': results, 'jsErrors': []}, ensure_ascii=False, indent=2), encoding='utf8')
print('V394 ficha QA PASS: 18 library/style/viewports, real editions, phase advice, no saved-data changes, JS errors or overflow.')
