# Craque Tático V337 — auditoria de custo de oportunidade do PP

## Problema comprovado no código
O comparador de cinco estilos V327 classificava e exibia as diferenças em
**níveis de treinamento**, sem calcular o custo marginal desses ajustes.
No eFootball, o custo progressivo de PP por categoria significa que o ganho ou
a retirada de **um nível** pode consumir/recuperar PP diferentes conforme a faixa.
Comparar apenas valores absolutos de níveis confunde o custo matemático.

## Solução implementada
- `craque-ficha-decision-v327.js`: `diff` aceita o motor de custo de PP verificado
  e acrescenta `beforePP`, `afterPP`, `deltaPP` a cada grupo com diferença.
- `compare` preserva o contrato anterior de três argumentos, mas aceita o quarto
  `tactical` para cálculo matemático exato. Com contexto válido, devolve:
  `usedPP`, `remainingPP`, `referenceUsedPP`, `addedPP`, `removedPP`,
  `redistributedPP`, `netDeltaPP` e estado `costBasis`.
- As três maiores mudanças agora são ordenadas por **PP absolutos**, e não apenas
  pelo número de níveis, somente quando há custo validado. Sem motor confiável,
  os valores de PP são `null`, nunca inferidos.
- `craque-positional-ui-v311.js`: nos cinco estilos da mesma carta, técnico,
  posição e edição mostra `PP usados / orçamento`, as diferenças por categoria,
  quantidade redistribuída, variação líquida de gasto e saldo.
- `scripts/test-pp-opportunity-cost-v337.cjs` testa dois movimentos de um nível
  com custos diferentes (−3 PP em Chute, +2 PP em Passe), **61 / 62 PP** utilizados,
  1 ponto livre, 2 pontos redistribuídos, comparação sem motor e isolamento por
  Card ID/edição; os 246 cartões não são alterados.
- `scripts/qa-ficha-decision-v327.py` testa apresentação em ambos acervos
  com viewports Android/Windows.
- `web/sw.js` renova o cache offline PWA; `npm run check` incorpora a regressão.

## Limites de validade
Esta auditoria corrige **comparabilidade matemática**; não avalia quanto cada
nível produz em atributos finais, eficácia real, movimentação nem sinergia
competitiva. `redistributedPP` é a interseção matemática entre PP retirados e
adicionados, não um indicador de superioridade.

As sugestões continuam hipotéticas até existirem provas do mesmo Card ID,
edição, níveis, nativas, ímpetos, posição, técnico e gameplay. Não atribuir
builds a Rentão/Blackjhon sem fonte direta. Não modificar históricos,
treinamentos aprovados, habilidades equipadas ou os 246 jogadores.

## Estado de entrega
Este PR é **empilhado sobre V336**, que já tinha CI/QA/builts de teste aprovados
separadamente. V337 exige nova CI completa, testes Chromium, auditoria de 246,
compilações Android/Windows e revisão. PR empilhado não é release nem atualização
instalada. A main permanece oficialmente v1.1.938 até integração autorizada.

## Próximo ciclo sugerido
Avaliar as propostas do motor de fronteira multiobjetivo V289 pela mesma função,
orçamento, posição e edição; documentar pesos demonstráveis e incertezas de
atributos-base, impedir falsa superioridade e identificar perfis dominados apenas
dentro do conjunto amostrado. Nunca substituir build homologada automaticamente.
