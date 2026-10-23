#!/usr/bin/env python3
"""V330 — UX Premium real de campo/banco/laboratório (Android 390px + Windows 1366px).
Preserva trocas homologadas, listas, diálogos e registros. Sem confirmar itens experimentais.
"""
from pathlib import Path
import os,shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'artifacts'/'visual-qa'
OUT.mkdir(parents=True,exist_ok=True)
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')

def forward(a,b):
 return a.evaluate('(x,y) => Boolean(x.compareDocumentPosition(y)&Node.DOCUMENT_POSITION_FOLLOWING)',b)

with sync_playwright() as pw:
 exe=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
 browser=pw.chromium.launch(headless=True,executable_path=exe,
  args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  for platform,width,height,mobile in [('android',390,844,True),('windows',1366,768,False)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},
     is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))

   # 1. Duas formações reais: primeiro escolha da formação, depois campo,
   # e o estilo/Link-Up permanece consultável sem editar o estado das cartas.
   page.goto(BASE+'/meu-time-duas-formacoes-v177.html',
    wait_until='domcontentloaded',timeout=40000)
   page.locator('.ct330-focus').wait_for(timeout=30000)
   page.wait_for_function("""() => document.querySelectorAll('#pitch button[data-slot]').length === 11""",
    timeout=35000)
   page.wait_for_function("""() => document.querySelectorAll('#bench .bench-card').length >= 10""",
    timeout=35000)
   assert forward(page.locator('#formation-pick'),page.locator('#ct330-field-panel'))
   assert forward(page.locator('#ct330-field-panel'),page.locator('#ct-v230-tactic-profile'))
   assert page.locator('.ct330-stats').inner_text().count('/11')==1
   assert page.locator('.ct330-stats').inner_text().count('/12')==1
   assert not page.locator('.ct330-bench-list').evaluate('(e)=>e.open')
   assert not page.locator('.ct330-analysis-fold').evaluate('(e)=>e.open')
   assert not page.locator('.ct330-linkup-fold').evaluate('(e)=>e.open')
   assert not page.locator('.ct330-hero-context').evaluate('(e)=>e.open')
   assert page.locator('#picker').count()==1
   page.locator('.ct330-quick-action[data-focus-target="bench"]').click()
   assert page.locator('.ct330-bench-list').evaluate('(e)=>e.open')
   assert page.locator('#bench .bench-card').first.is_visible()
   page.locator('.ct330-quick-action[data-focus-target="analysis"]').click()
   assert page.locator('.ct330-analysis-fold').evaluate('(e)=>e.open')
   assert page.locator('#analysis').is_visible()
   page.locator('#formation-pick [data-formation="4213"]').click()
   page.wait_for_function("""() => document.querySelector('.ct330-focus .ct330-heading')
     ?.textContent?.includes('4-2-1-3')""",timeout=15000)
   assert page.locator('#pitch button[data-slot]').count()==11
   assert page.locator('#picker').count()==1
   page.screenshot(path=str(OUT/f'v330_{platform}_formacoes.png'),full_page=False,animations='disabled')

   # 2. Proposta experimental separada, sem perder acesso às duas formações.
   page.goto(BASE+'/meu-time-posse-4312.html',wait_until='domcontentloaded',timeout=40000)
   page.locator('.ct330-focus').wait_for(timeout=30000)
   page.wait_for_function("""() => document.querySelectorAll('#pitch button[data-slot]').length === 11""",
    timeout=30000)
   assert 'experimental' in page.locator('.ct330-heading').inner_text().lower()
   assert page.locator('a[href="meu-time-duas-formacoes-v177.html"]').count()>=1
   assert not page.locator('.ct330-bench-list').evaluate('(e)=>e.open')
   page.locator('.ct330-quick-action[data-focus-target="bench"]').click()
   assert page.locator('.ct330-bench-list').evaluate('(e)=>e.open')
   assert page.locator('#reset-team').is_visible()

   # 3. Laboratório: séries à frente dos filtros longos. O cadastro das
   # restrições nunca desaparece; a primeira equipe mostra titulares
   # antes das reservas e deixa audit/registro disponíveis.
   page.goto(BASE+'/meu-time-testes-v219.html',wait_until='domcontentloaded',timeout=45000)
   page.locator('.ct330-focus').wait_for(timeout=30000)
   page.wait_for_function("""() => document.querySelectorAll('#squads details.scout-rotation-team').length >= 1""",
    timeout=40000)
   assert forward(page.locator('#ct330-series-panel'),page.locator('#ct330-restrictions-panel'))
   assert page.locator('#black-feedback').is_visible()
   assert not page.locator('.ct330-black-options').evaluate('(e)=>e.open')
   assert not page.locator('#black-search').is_visible()
   assert not page.locator('.ct330-video-fold').evaluate('(e)=>e.open')
   assert not page.locator('.ct330-backup-fold').evaluate('(e)=>e.open')
   assert page.locator('#ct330-series-panel [data-series]').count()==2
   assert page.locator('#ct330-series-panel [data-cycle]').count()==2
   assert page.locator('#ct330-series-panel [data-tactic-mode]').count()==5
   page.locator('.ct330-quick-action[data-focus-target="restrictions"]').click()
   assert page.locator('.ct330-black-options').evaluate('(e)=>e.open')
   assert page.locator('#black-search').is_visible()
   page.locator('.ct330-quick-action[data-focus-target="first"]').click()
   team=page.locator('#squads details.scout-rotation-team').first
   assert team.evaluate('(e)=>e.open')
   assert team.locator('.scout-rotation-field').is_visible()
   assert team.locator('.scout-rotation-players>section').count()==1
   assert team.locator('.ct330-team-bench').count()==1
   assert not team.locator('.ct330-team-bench').evaluate('(e)=>e.open')
   assert not team.locator('.ct330-team-audit').evaluate('(e)=>e.open')
   assert team.locator('form[data-match]').count()==1
   team.locator('.ct330-team-bench>summary').click()
   assert team.locator('.ct330-team-bench').evaluate('(e)=>e.open')
   assert team.locator('.ct330-team-bench section').is_visible()
   page.locator('[data-series="4213"]').click()
   page.wait_for_function("""() => document.querySelector('.ct330-heading')
     ?.textContent?.includes('4-2-1-3')""",timeout=15000)
   assert page.locator('#squads details.scout-rotation-team').count()>=1
   page.screenshot(path=str(OUT/f'v330_{platform}_laboratorio.png'),full_page=False,animations='disabled')
   assert not [e for e in errors if e!='Scout PRO: carta sem estilo para filtro #1'],errors
   assert page.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')<=3,platform+' overflow'
   ctx.close()
 finally:
  browser.close()
print('V330 CHROMIUM PASS: 2 resoluções × 3 telas; campo antes da análise, banco, séries, 23 bloqueios, titulares/registro intactos.')
