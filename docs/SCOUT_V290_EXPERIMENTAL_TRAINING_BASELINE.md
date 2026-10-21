# V290 — A otimização de PP não se ancora em um treino experimental

## Contexto

O motor V251 compara distribuições de pontos respeitando custo e estilo tático. Porém, o método `allocate()` recebia o vetor do catálogo como baseline sempre que era matematicamente válido — mesmo que o próprio catálogo marcasse `treino_proposto_nao_validado: true`. Como a função objetivo penaliza afastamentos da baseline, uma **build experimental** influenciava as próximas propostas antes de ser aprovada.

## Correção

- O vetor matematicamente válido continua visível como informação registrada e comparação histórica.
- Se a edição estiver marcada `treino_proposto_nao_validado: true`, o vetor **não é usado como âncora** na otimização; as alternativas são recalculadas sem o termo de proximidade a uma distribuição não aprovada.
- A mesma proteção vale para cartas de referência no comparador de propostas entre edições.
- `baselineUsable` e `baselineStatus` são indicadores explicativos no objeto da proposta. Um vetor registrado não provisório **não significa** homologação por gameplay.
- A ficha informa, em PT-BR, quando a baseline experimental foi ignorada. A função de custo, estilos, posições e os vetores originais não são modificados.
- O caso Martinelli CAP191 (26 níveis, 50 PP, vetor experimental) tem regressões nos cinco estilos: proposta gerada sem baseline e comparação com fixture não provisória.
- Novo teste `scripts/test-training-baseline-v290.cjs` em `npm run check` e relatório `build/v290-training-baseline-audit.json`.

## Preservação e provas

246 cartas, Card IDs, imagens, raridades, progresso, nativas, ímpetos, backups e instalações não são alterados. A V290 usa a V289 como branch-base; não pode ser integrada antes da V289.

O cálculo de pontos exatos não prova melhor desempenho em eFootball. Nenhuma sugestão é aprovada nem gravada na conta; análise de Rentão e Blackjhon só pode ser citada com prova da edição/Card ID. Validação depende dos checks de PR e QA visual. Nenhuma release foi autorizada.
