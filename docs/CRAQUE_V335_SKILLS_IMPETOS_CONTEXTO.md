# Craque Tático — V335 · Skills e ímpetos sem falsas escolhas

## Base
A V334 (PR #247) foi validada em CI/QA. Esta branch parte de V334, preservando as
alterações Premium da V332 e o atualizador Windows da V333. Não há merge em main.

## Problema de integridade visual confirmado
Na ficha V311 compartilhada entre **Minhas Cartas** e **Outros Elencos**, o quadro
`FICHA EM FOCO` usava `savedProfile?.skills?.length ? ... : recommendations`
e `savedProfile?.booster || candidate`. Assim, um rascunho contextual salvo com
**zero habilidades selecionadas** ou **nenhum ímpeto adicional escolhido** era
visualmente substituído por sugestões do algoritmo, confundindo sugestão
com seleção humana.

Um segundo ponto: `verified` considerava diretamente a revisão V311 com
`approved:true`, sem verificar se a distribuição PP exibida (por exemplo a
de um rascunho V324) correspondia à aprovação. O motor V327 já possui a
validação correta; a apresentação não a utilizava integralmente.

## Correção V335
- `craque-ficha-decision-v327.js`: nova função pura `equipmentSummary`
  distingue proposta calculada e rascunho independente; preserva explicitamente
  seleções vazias sem herdar habilidades/ímpetos sugeridos.
- `craque-positional-ui-v311.js`: o resumo da ficha usa os dados exatamente
  salvos no mesmo contexto (carta, coleção, posição, estilo e técnico);
  quando vazio, mostra **0 selecionadas** e **Nenhum selecionado**.
- Alternativas calculadas permanecem na análise completa, **sem serem
  declaradas equipadas, comprovadas ou homologadas**.
- O indicador de aprovação textual exige `decision.approved===true`, o
  mesmo laudo contextual V327 que compara a build e a revisão de PP.
- `scripts/test-equipment-summary-v335.cjs` cobre vazio explícito, seleção
  salva, proposta sem rascunho, congelamento da decisão e integridade das 246
  cartas; passa a integrar `npm run check`.

## Exigências
Validar CI geral, QA Chromium Android/Windows, compilações de teste e auditoria
das 246 cartas. Sem alterar níveis, PP, skills nativas, ímpetos originais,
identidade, prints, históricos ou builds aprovadas. Sem instalar, publicar ou
integrar sem aprovação. Testes estáticos de apresentação não substituem
avaliação visual nem gameplay da mesma carta e edição.

## Próximos ciclos candidatos
1. Mostrar, ao lado dos candidatos, **por que** a habilidade e o ímpeto são
   sugeridos e as fontes disponíveis, sempre com indicação de incerteza.
2. Exibir no mesmo contexto a distinção **rascunho**, **revisão aprovada de PP**
   e **equipamento efetivamente confirmado pelo proprietário**.
3. Seguir homologação das cartas com skills nativas/slots sem evidências, sem
   preencher automaticamente lacunas.
