"""Interação de cenários V289; usa a sessão Chromium do QA existente."""
import json
from qa_navigation_v378 import reveal


def run_competitive_qa(page, url, out, name):
    page.goto(url + '/fichas/191_Gabriel_Martinelli.html', wait_until='domcontentloaded')
    reveal(page.locator('#ct253-integrated-review > summary'))
    page.locator('#ct253-integrated-review > summary').click()
    comparison = page.locator('#ct289-training-comparison')
    comparison.wait_for(state='visible', timeout=20000)
    assert comparison.locator('select').count() == 0, 'Busca deve ser calculada somente ao abrir'
    # Apenas dados de treino/equipamentos, sem timestamps do atualizador.
    storage = """() => JSON.stringify(Object.fromEntries(Object.keys(localStorage)
      .filter(k => /lab|training|equipped|additional-confirmed|booster:/.test(k))
      .sort().map(k => [k,localStorage.getItem(k)])))"""
    before = page.evaluate(storage)
    original = page.locator('#scout-v68-data').text_content()
    comparison.locator('summary').click()
    page.wait_for_function("() => document.querySelector('#ct289-training-comparison')?.dataset.ready === 'true'")
    select = comparison.locator('select')
    options = select.locator('option')
    candidate_count = options.count()
    assert candidate_count >= 3, 'Faltam alternativas viáveis'
    select.select_option(options.last.get_attribute('value'))
    assert '50 / 50 PP' in comparison.locator('.ct289-comparison-summary').inner_text()
    assert comparison.locator('tbody tr').count() == 7
    assert comparison.locator('tbody tr').evaluate_all(
        '(rows) => rows.reduce((n,row) => n+Number(row.dataset.deltaPp),0)') == 0
    assert 'experimental' in comparison.locator('.ct289-scenario').inner_text().lower()
    assert 'Ímpetos' in comparison.locator('.ct289-scenario').inner_text()
    assert before == page.evaluate(storage), 'Comparar gravou um treino ou equipamento'
    assert original == page.locator('#scout-v68-data').text_content()
    assert page.evaluate('document.documentElement.scrollWidth-innerWidth') <= 8
    comparison.screenshot(path=str(out / f'{name}_v289_comparison.png'), animations='disabled')
    # Outro estilo recria uma comparação independente, sem herdar o candidato.
    page.locator('#ct378-style').select_option('rapido')
    page.wait_for_function("() => document.querySelector('#ct289-training-comparison')?.dataset.tactic === 'rapido'")
    fresh = page.locator('#ct289-training-comparison')
    assert not fresh.get_attribute('open'), 'Candidato de outra tática foi reaproveitado'
    fresh.locator('summary').click()
    page.wait_for_function("() => document.querySelector('#ct289-training-comparison')?.dataset.ready === 'true'")
    assert '50 / 50 PP' in fresh.inner_text()
    # A simulação só precisa dos módulos e fontes já carregados.
    page.context.set_offline(True)
    try:
        fresh.locator('select').select_option(index=0)
        assert '50 / 50 PP' in fresh.inner_text()
        assert 'Complementos neste cenário experimental' in fresh.inner_text()
    finally:
        page.context.set_offline(False)
    # Testar o formulário real e a persistência da prova na edição de Yorke.
    page.goto(url + '/fichas/040_Dwight_Yorke.html', wait_until='domcontentloaded')
    page.locator('#v162-equipped').wait_for(state='attached', timeout=20000)
    page.evaluate("""() => {
      for(const id of ['scout-v220-technical','scout-v220-advanced-skills'])
        document.getElementById(id).open=true;
      document.querySelector('#v162-equipped').closest('details').open=true;
    }""")
    reveal(page.locator('#v162-equipped'))
    page.locator('#v162-equipped').fill('Reposição baixa do GO')
    page.locator('#v254-confirm-equipped').check()
    page.locator('#v162-save').click()
    assert 'CONFERÊNCIA NÃO SALVA' in page.locator('#v162-feedback').inner_text()
    page.locator('#v162-equipped').fill('Passe em profundidade')
    page.locator('#v254-confirm-equipped').check()
    page.locator('#v162-save').click()
    page.wait_for_function("() => document.querySelector('#scout-v220-skill-count')?.textContent.includes('4 vaga(s)')")
    evidence = page.evaluate("""() => {
      const raw=JSON.parse(document.querySelector('#scout-v68-data').textContent);
      const native=localStorage.getItem('scoutpro:v162:equipped:'+raw.capture+':'+raw.id);
      return {native,proof:localStorage.getItem('scoutpro:v254:additional-confirmed:'+raw.capture+'@'+raw.id)};
    }""")
    assert evidence['native'] == 'Passe em profundidade'
    assert json.loads(evidence['proof'])['confirmed'] is True
    page.reload(wait_until='domcontentloaded')
    page.wait_for_function("() => document.querySelector('#scout-v220-skill-count')?.textContent.includes('4 vaga(s)')")
    return {'exact_budget': 50, 'alternatives': candidate_count,
            'readonly': True, 'offline': True, 'tactic_reset': True,
            'incompatible_skill_blocked': True, 'confirmation_persisted': True}
