#!/usr/bin/env python3
"""V325 — comprovar no Chromium que skill guardada não some do editor.
Dois viewports, acervo externo com técnico real e ida MAT→SA→MAT.
"""
import os, shutil
from playwright.sync_api import sync_playwright

URL=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
with sync_playwright() as pw:
    binary=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
    browser=pw.chromium.launch(headless=True,executable_path=binary,args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        for label,w,h,mobile in [('android',390,844,True),('windows',1366,768,False)]:
            ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
            page=ctx.new_page()
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(URL+'/outros-elencos-v227.html?colecao=minhas-cartas-adicionadas',wait_until='domcontentloaded')
            page.locator('#friend-new-card').click()
            page.locator('#friend-card-name').fill('Auditoria V325 Histórico')
            page.locator('#friend-card-position').select_option('MAT')
            page.locator('#friend-card-level').fill('35')
            page.locator('#friend-dialog-save').click()
            page.locator('.friends-card .friends-analysis-action').first.click()
            root=page.locator('.ct311-positional')
            root.wait_for(timeout=25000)
            page.locator('#friend-manager-version option[value="CT-MGR-071"]').wait_for(timeout=30000)
            page.locator('#friend-manager-version').select_option('CT-MGR-071')
            pos=root.locator('.ct311-controls .ct311-select')
            assert pos.input_value()=='MAT'
            box=root.locator('.ct324-profile')
            box.wait_for(timeout=25000)
            assert 'CT-MGR-071' in box.inner_text()
            box.get_by_role('button',name='Salvar ficha independente deste técnico').click()
            page.wait_for_function("""() => Object.keys(localStorage).some(k=>
                k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""")
            key=page.evaluate("""() => Object.keys(localStorage).find(k=>
                k.startsWith('scoutpro:v324:manager-profile:')&&k.includes('CT-MGR-071')&&k.includes('MAT'))""")
            # Simular habilidade histórica que deixou de ser sugerida
            # sem apagar nenhuma outra informação do rascunho.
            page.evaluate("""key => {
              const payload=JSON.parse(localStorage.getItem(key));
              payload.revisions[payload.revisions.length-1].skills=['Habilidade histórica V325'];
              localStorage.setItem(key,JSON.stringify(payload));
            }""",key)
            pos.select_option('SA')
            assert 'Habilidade histórica V325' not in box.inner_text()
            pos.select_option('MAT')
            box.get_by_text('Habilidade histórica V325').wait_for(timeout=15000)
            candidate=box.locator('.ct324-skill-option').filter(has_text='Habilidade histórica V325')
            assert candidate.locator('input').is_checked(),'Skill anterior deveria continuar marcada'
            assert 'Preservada do histórico' in candidate.inner_text()
            box.get_by_role('button',name='Salvar ficha independente deste técnico').click()
            stored=page.evaluate("""key => {
               const entries=JSON.parse(localStorage.getItem(key)).revisions;
               return entries[entries.length-1].skills;
            }""",key)
            assert 'Habilidade histórica V325' in stored,'Salvamento silencioso apagou skill anterior'
            assert 'Habilidade histórica V325' in box.inner_text()
            assert not errors,errors
            ctx.close()
    finally:
        browser.close()
print('V325 CHROMIUM PASS: skill histórica preservada ao mudar recomendação/cargo MAT→SA→MAT, Android + Windows, Outros Elencos.')
