"""Read-only coaching across both formations/styles; fresh mobile/desktop profiles."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from qa_navigation_v378 import reveal

BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/v394-coaching'))
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    try:
        for width,height in [(320,740),(390,844),(1366,900)]:
            ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
            page=ctx.new_page();errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(BASE+'/meu-time-duas-formacoes-v177.html',wait_until='domcontentloaded')
            page.wait_for_selector('#pitch button[data-slot="mat"]')
            for formation in ['4312','4213']:
                button=page.locator('#formation-pick [data-formation="'+formation+'"]')
                reveal(button);button.click()
                for mode in ['normal','rapido']:
                    mode_button=page.locator('#ct-v230-tactic-tabs [data-mode="'+mode+'"]')
                    reveal(mode_button);mode_button.click()
                    guide=page.locator('.ct-v392-counter-guide')
                    guide.wait_for()
                    page.wait_for_function('([f,m])=>window.CRAQUE_FORMATION_STATE_V231.formation()===f && window.CRAQUE_FORMATION_STATE_V231.mode()===m',arg=[formation,mode])
                    before=page.evaluate('JSON.stringify({...localStorage})')
                    squad_before=page.locator('#pitch').inner_text()
                    decisions=guide.locator('[data-counter-decisions]')
                    decisions.locator('summary').click()
                    assert decisions.locator('[data-counter-decision]').count()==6
                    assert 'Mobile STANDARD' in decisions.inner_text()
                    assert ('MLG' if formation=='4312' else 'SA central') in decisions.inner_text()
                    for item in decisions.locator('[data-counter-decision]').all():
                        assert all(label in item.inner_text() for label in ['Quando:','Faça:','Evite:'])
                    instructions=guide.locator('[data-counter-instructions]')
                    instructions.locator('summary').click()
                    assert instructions.locator('[data-instruction-phase="Ataque"]').count()==2
                    assert instructions.locator('[data-instruction-phase="Defesa"]').count()==2
                    actual_slots=page.locator('#pitch button[data-slot]').evaluate_all('(els)=>els.map(e=>e.dataset.slot)')
                    for item in instructions.locator('[data-instruction-slot]').all():
                        assert item.get_attribute('data-instruction-slot') in actual_slots+['']
                    field=instructions.get_by_role('textbox',name='Alvo adversário para avaliar marcação individual')
                    field.fill('MAT rival <sem HTML>')
                    assert 'Marcação individual em VOLD' in instructions.inner_text()
                    assert 'Alvo a confirmar no jogo: MAT rival <sem HTML>' in instructions.inner_text()
                    assert instructions.locator('sem').count()==0
                    field.fill('')
                    assert 'Alvo a confirmar no jogo:' not in instructions.inner_text()
                    assert page.evaluate('JSON.stringify({...localStorage})')==before,'Guide must never write local state'
                    assert page.locator('#pitch').inner_text()==squad_before,'Guide must never change lineup'
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Horizontal overflow'
                    assert guide.locator('a[href="manual-2027/index.html#comandos"]').count()==1
                    if formation=='4213' and mode=='rapido':
                        instructions.locator('summary').scroll_into_view_if_needed()
                        page.screenshot(path=str(OUT/f'coaching-instructions-{width}.png'))
                    guide.locator('summary').first.click()
                    assert not guide.evaluate('(el)=>el.open'),'Guide remains collapsible'
            assert not errors,errors
            ctx.close()
    finally:
        browser.close()
print('V394 coaching QA PASS: 12 formation/style/viewports; 6 decisions, conditional target, no writes or overflow.')
