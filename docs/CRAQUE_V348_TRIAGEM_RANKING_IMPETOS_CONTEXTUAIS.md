# V348 — Ímpetos por função: triagem da mesma edição e motivos preservados

## Lacuna verificável
A V347 já protegia os cinco slots de habilidades adicionais, mas o ranking
de ímpetos ainda oferecia como **novo candidato** o nome do ímpeto fixo
ou do ímpeto adicional informado da mesma carta. Alternativas repetidas
também apareciam no seletor. O editor e a ficha Premium não utilizavam
uma fonte única para esta triagem, diferentemente das habilidades.

## Implementação
- API pura `V324.reviewBoosterRanking(primary, alternatives, fixed, equipped,
  boosterSlot)`, com comparação conservadora de nomes/acento e SEM
  atribuir equivalências de boosters não documentadas no catálogo.
- A opção principal passa a ser a primeira alternativa **não repetida**
  e não informada como fixa/adicional; o motivo original do motor
  acompanha a alternativa promovida, sem inventar outro motivo.
- Exclusões e seus motivos ficam recolhidos sob demanda, incluindo
  nome igual ao fixo, nome já informado como adicional, repetição ou
  nome pendente. Esses nomes não são tratados como novas propostas.
  A coincidência **não prova proibição no eFootball**.
- `boosterSlot='ausente'` mantém apenas ranking teórico, sem candidato
  no painel/editor. Slots `ocupado`, `vazio` ou `pendente` são
  apenas sinais documentais consultivos; não se presume equipamento.
- Painel, seletor de ímpeto, resumo Premium e justificativas de ficha
  utilizam a mesma candidata selecionada. Um ímpeto já salvo no
  rascunho **permanece visível** mesmo se o ranking novo o rejeita;
  é possível revisá-lo/limpá-lo sem alterar o histórico.
- Ambos os acervos utilizam a mesma UI; os contextos por Card ID,
  edição, técnico, estilo e posição continuam independentes.

## Verificações
- `scripts/test-booster-ranking-v348.cjs` na CI: ímpeto fixo,
  adicional, alternativas duplicadas, motivo contextual, slot ausente,
  comparação por função, histórico preservado, isolamento dos acervos,
  integridade das 246 cartas.
- `scripts/qa-booster-ranking-v348.py`: Chromium Android/Windows,
  API carregada na página e cadastro com fixed/adicional/slot ocupado,
  editor real e ausência de overflow visual.
- Testes V335/V344 foram atualizados para conferir o **novo filtro**,
  sem remover testes ou flexibilizar integridade.
- CSS/caches offline versionados. Builds de teste e QA devem passar no
  HEAD final antes de marcar pronto para revisão.

## Limites
Nenhum ímpeto, habilidade, PP, aprovação ou slot foi alterado/equipado
automaticamente. Ranqueamento e classificação são hipóteses e não
validação competitiva em partida. Nenhum merge na main ou publicação
Android/Windows sem autorização nominal do proprietário.
