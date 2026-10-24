# V347 — Habilidades adicionais: capacidade informada, não vagas inventadas

## Lacuna real
V344–V346 filtravam duplicatas e itens nativos/adicionais, mas o painel
recomendava até cinco **novas** candidatas sem contextualizar que a
mesma edição podia ter cinco habilidades adicionais já informadas.
Era fácil confundir a lista de alternativas para avaliação com vagas livres
ou supor que uma nova candidata caberia sem retirar uma antiga.

## Engenharia
- `V324.reviewAdditionalCapacity(equipped, proposed, keyFor)` é puro e
  apenas documental. Conta nomes adicionais distintos por alias
  previamente registrado em V162 e detecta duplicatas/cadastro com mais de
  cinco itens. Sem inventário, `maxUnverifiedAdditional=null`,
  **jamais cinco vagas disponíveis**.
- Com dados informados, mostra o limite superior `5 - nomes únicos`
  **não comprovado**. Quando todas as propostas excederem esse limite,
  calcula quantas precisariam substituir habilidades registradas,
  **caso todas fossem equipadas**. Não faz troca nem grava.
- O painel apresenta estado no foco da carta e o editor explica que
  cinco adicionais já informadas implicam **substituições teóricas**,
  nunca novas vagas garantidas.
- `reviewDraftReadiness` preserva a gravação de propostas consultivas
  e fornece avisos de substituição e inconsistências; não impede analisar
  uma ficha alternativa nem marca equipamento como efetuado.
- O comportamento é compartilhado entre **Minhas Cartas** e
  **Outros Elencos**, com isolamento por Card ID, edição, proprietário,
  técnico, posição e estilo; rascunhos e históricos anteriores intocados.
- Não modifica nenhuma das 246 cartas, PP, cinco slots, habilidades
  equipadas, ímpetos, fontes, assinatura Android nem instalador Windows.

## Validação
- Node: `scripts/test-additional-capacity-v347.cjs`, integrado ao
  `npm run check`: 246 cartas, inventário ausente, parcial e completo,
  duplicatas PT-BR/EN, necessidade teórica de troca, rascunho
  consultivo, isolamento entre os dois acervos, sem escrita pela auditoria.
- Chromium: `scripts/qa-additional-capacity-v347.py`, integrado ao
  workflow de QA, valida cadastro externo 5/5 e mensagens no Android e
  Windows, sem overflow visual.
- Revalidar todos os workflows e builds de teste no HEAD final do PR.

## Limite
O número cadastrado **não prova** que uma habilidade esteja equipada ou
uma vaga efetivamente disponível. O cálculo de troca é condicional
ao que foi informado, e não valida decisão de gameplay nem substitui a
metodologia competitiva individual.

A V347 é cumulativa sobre V339–V346. PR apenas para revisão; sem merge
na `main` nem release Android/Windows sem autorização explícita.
