# Craque Tático V338 — fronteira multiobjetivo com saldo de PP

## Defeito confirmado
O comparador de investimentos V289 (em `web/craque-ficha-individual-v251.js`)
exigia `total(baseline)===pp` para reconhecer um treino registrado como
referência. Porém, o editor de fichas por posição/técnico V324 permite salvar
rascunhos com `total(train)<=budget`, e a correção V336 tornou explícitos
os PP disponíveis. Antes desta alteração, um rascunho de 61 de 62 PP, por
exemplo, era classificado como `orcamento_divergente` e excluído da comparação.

Havia ainda uma segunda incoerência metodológica: a dominância dos candidatos
considerava apenas os eixos de investimento, não o PP gasto. Um cenário que
consumisse mais PP poderia aparentar dominar outro com saldo disponível.

## Regra de segurança V338
- **Reconhecimento explicitamente solicitado**: somente
  `trainingFrontier(weights,role,pp,train,{baselineSource:'rascunho_independente'})`
  aceita uma base válida com saldo de PP como referência. Não converter
  automaticamente orçamentos inconsistentes em rascunhos legítimos.
- A origem `baselineProvisional:true` continua **sem âncora registrada**.
- Bloquear custo acima do orçamento, categorias de goleiro em jogadores de
  linha (e vice-versa), vetores de dez níveis inválidos e papéis desconhecidos.
- Propostas geradas continuam com orçamento de PP exato, sem substituição de
  rascunho humano; o próprio rascunho aparece separadamente para comparação.
- `referenceSpent`, `referenceRemainingPP`, `spent`, `remainingPP`,
  `netDeltaPP`, `redistributedPP` e `freePPInvested` são custos
  matemáticos auditáveis; não equivalem a atributos finais.
- **Dominância com custo**: um candidato domina outro somente se não gasta
  mais PP, não piora nenhum eixo da heurística e melhora ao menos um eixo
  ou economiza PP. A fronteira permanece apenas da pequena amostra gerada,
  não da busca exaustiva, nem prova competitiva.
- A apresentação V251 agora esclarece **PP usados, livres, redistribuídos e
  adicionais investidos do saldo**, sem chamar gasto novo de realocação
  existente. A legenda reforça o caráter experimental.

## Testes e rastreabilidade
`scripts/test-pp-pareto-saldo-v338.cjs` testa um rascunho sintético
com 61 / 62 PP, proteção contra dominância com orçamento maior, custos
incrementais, rejeição da fonte desconhecida, dados provisórios, função
incorreta, orçamento excedido, determinismo e integridade das 246 cartas.
A nova regressão integra `npm run check` e o cache PWA foi atualizado.

## Limites
Esta etapa melhora o **motor multiobjetivo e a visualização do comparador
individual V251**. A passagem do rascunho independente V324 para o comparador
V251 depende de integração contextual explícita entre esses dois módulos;
não alegar que essa conexão já foi implementada. O contrato da API está pronto
e testado para essa futura integração, sem copiar perfis entre acervos.

Nenhuma das 246 cartas, imagens, IDs, PP aprovados, habilidades equipadas ou
ímpetos foi modificada. Posição alternativa requer familiaridade comprovada,
edição exata e provas reais antes de homologação de build. Não atribuir
recomendações específicas a Rentão/Blackjhon sem fonte.

## Publicação
PR cumulativo sobre a V337 (#250) e versões ainda pendentes; só fazer merge
após reconciliar a sequência de PRs e confirmar CI/QA/compilações e aprovação
expressa do proprietário. A nova lógica NÃO implica build instalada,
APK Android assinado ou EXE Windows publicado.
