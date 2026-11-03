"""Salvar, exibir, reabrir e limpar máximo por conta/pessoa em perfis descartáveis."""
import os, shutil, json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path('artifacts/visual-qa/v387');OUT.mkdir(parents=True,exist_ok=True)
REFERENCE=next(c for c in json.loads((Path(__file__).resolve().parents[1]/'web/ct376-card-references.json').read_text(encoding='utf-8'))['cards'] if c.get('ownerMaximumOverall') and c.get('file'))

def legacy_save(p,value,root='.ct-card-info-editor'):
    editor=p.locator(root);editor.wait_for(timeout=30000)
    editor.get_by_role('button',name='EDITAR INFORMAÇÕES DA CARTA',exact=True).click()
    editor.get_by_label('Overall máximo da carta (informativo)',exact=True).fill(value)
    editor.get_by_role('button',name='Salvar alterações',exact=True).click()

with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
    try:
        for width,height in [(320,740),(390,844),(1366,900)]:
            ctx=b.new_context(viewport={'width':width,'height':height},service_workers='block')
            p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
            p.goto(BASE+'/'+REFERENCE['file'],wait_until='domcontentloaded')
            p.wait_for_function('(value)=>document.querySelector(".ct376-ovr[data-state=maximum]")?.textContent.includes(String(value))',arg=REFERENCE['ownerMaximumOverall']['value'],timeout=4000)
            p.goto(BASE+'/fichas/001_Daniele_Massaro.html',wait_until='domcontentloaded')
            legacy_save(p,'112')
            p.wait_for_function('document.querySelector(".ct376-ovr[data-state=maximum]")?.textContent.includes("112")',timeout=4000)
            assert 'máx.' in p.locator('.ct376-ovr').first.inner_text()
            p.reload(wait_until='domcontentloaded')
            p.wait_for_function('document.querySelector(".ct376-ovr[data-state=maximum]")?.textContent.includes("112")')
            p.goto(BASE+'/index.html',wait_until='domcontentloaded')
            tile=p.locator('#cards .player-card[data-cap="1"]')
            tile.locator('.ct376-ovr[data-state=maximum]').wait_for()
            assert '112' in tile.inner_text()
            # Rascunho de formato antigo de outra edição não herda o máximo ativo.
            p.evaluate('''async()=>{
              const R=CRAQUE_CARD_REVIEW_V379,raw=(await (await fetch('SCOUT_V69_AUDITORIA.json')).json()).cards[0],c=R.catalog([raw],[])[0];
              const draft={...R.validate(c,{cardId:'123456780',edition:'Outra edição QA'},false),updatedAt:new Date().toISOString(),activeConfirmed:R.read(localStorage,c,true)};
              localStorage.setItem(R.PREFIX+c.key,JSON.stringify(draft));
            }''')
            p.goto(BASE+'/conferir-cartas.html#cap%3A1',wait_until='domcontentloaded')
            p.locator('#review-workspace').wait_for()
            assert p.locator('[name=maxOverall]').input_value()=='','Rascunho legado de outra edição não herda máximo ativo'
            p.evaluate("localStorage.removeItem(CRAQUE_CARD_REVIEW_V379.PREFIX+'cap:1')")
            p.reload(wait_until='domcontentloaded')
            p.locator('#review-workspace').wait_for()
            assert p.locator('[name=maxOverall]').input_value()=='112','Conferir cartas deve abrir o valor atual, não um campo desatualizado'
            p.locator('[name=maxOverall]').fill('115')
            p.locator('#review-owner-confirm').check()
            p.locator('#review-form button[type=submit]').click()
            assert 'Carta confirmada' in p.locator('#review-feedback').inner_text()
            p.goto(BASE+'/index.html',wait_until='domcontentloaded')
            p.wait_for_function("""()=>document.querySelector('.player-card[data-cap="1"] .ct376-ovr[data-state=maximum]')?.textContent.includes('115')""")
            p.goto(BASE+'/conferir-cartas.html#cap%3A1',wait_until='domcontentloaded')
            p.locator('#review-workspace').wait_for()
            assert p.locator('[name=maxOverall]').input_value()=='115'
            p.locator('[name=maxOverall]').fill('')
            p.locator('#review-owner-confirm').check()
            p.locator('#review-form button[type=submit]').click()
            p.goto(BASE+'/index.html',wait_until='domcontentloaded')
            p.locator('.player-card[data-cap="1"] .ct376-ovr').wait_for()
            assert p.locator('.player-card[data-cap="1"] .ct376-ovr[data-state=maximum]').count()==0
            p.goto(BASE+'/index.html?owned=ct364-01',wait_until='domcontentloaded')
            p.locator('#ct364-dialog[open]').wait_for(timeout=30000)
            legacy_save(p,'108','#ct364-dialog .ct-card-info-editor')
            assert '108' in p.locator('#ct364-dialog-art').locator('..').locator('.ct376-ovr').inner_text()

            # Mesmo ID nas duas contas; cada máximo deve continuar próprio.
            for account,value in [('primary','117'),('secondary','109')]:
                p.goto(BASE+'/index.html?account='+account,wait_until='domcontentloaded')
                p.locator('#ct385-manage>summary').click();p.locator('#ct385-add').click()
                form=p.locator('.ct385-editor form')
                form.locator('[name=name]').fill('QA máximo '+account)
                form.locator('[name=edition]').fill('Edição QA')
                form.locator('[name=maxLevel]').fill('32')
                form.locator('[name=maxOverall]').fill(value)
                form.locator('button[type=submit]').click()
                p.wait_for_selector('body[data-ct385-catalog=ready]')
                p.locator('#search').fill('QA máximo '+account)
                card=p.locator('#cards [data-account-card]')
                assert value in card.locator('.ct385-maximum').inner_text()
                card.click();p.wait_for_selector('body[data-ct385-sheet=ready]')
                assert 'Overall máximo: '+value in p.locator('#sheet-meta').inner_text()
                p.reload(wait_until='domcontentloaded');p.wait_for_selector('body[data-ct385-sheet=ready]')
                assert value in p.locator('#sheet-meta').inner_text()
                p.screenshot(path=str(OUT/f'{account}-{width}.png'))
                p.locator('#sheet-team').click();p.wait_for_selector('.library-card')
                p.locator('#search').fill('QA máximo '+account)
                assert 'Overall máximo: '+value in p.locator('#roster').inner_text()
                p.locator('#roster a,#roster button').first.click()
                p.wait_for_selector('body[data-ct385-sheet=ready]')
                p.locator('#sheet-edit').click()
                p.locator('.ct385-editor [name=maxOverall]').fill('')
                p.locator('.ct385-editor button[type=submit]').click()
                p.wait_for_selector('body[data-ct385-sheet=ready]')
                assert 'Overall máximo: '+value not in p.locator('#sheet-meta').inner_text()

            p.goto(BASE+'/outros-elencos-v227.html',wait_until='domcontentloaded')
            p.locator('#friend-person-name').fill('QA máximo outro')
            p.locator('#friend-person-form button[type=submit]').click()
            p.locator('#friend-new-card').click()
            p.locator('#friend-card-name').fill('QA Outro jogador')
            p.locator('#friend-card-position').select_option('CA')
            p.locator('#friend-card-level').fill('32')
            p.locator('#friend-card-max-overall').fill('106')
            p.locator('#friend-dialog-save').click()
            assert 'Overall máximo: 106' in p.locator('#friend-cards').inner_text()
            p.locator('#friend-cards .friends-analysis-action').click()
            assert 'Overall máximo: 106' in p.locator('#friend-analysis-badges').inner_text()
            p.reload(wait_until='domcontentloaded')
            assert 'Overall máximo: 106' in p.locator('#friend-cards').inner_text()
            assert p.evaluate('document.documentElement.scrollWidth-innerWidth')<=8
            assert not errors,errors
            ctx.close()
    finally:b.close()
print('V387 UI PASS: legadas/próprias, Principal/Secundária/Outros, fichas e plano; máximo imediato e após reabrir, limpeza e separação do treino.')
