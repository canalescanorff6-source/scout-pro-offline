# Craque Tático — auditoria competitiva de PP e correção de rascunho subalocado

## Encontrado na auditoria do código real
A função `validTraining` em `craque-manager-fichas-v324.js` permite
corretamente uma ficha com gasto **menor ou igual** ao orçamento de PP. Esse
comportamento é importante: o proprietário pode salvar uma ficha provisória e
deixar pontos para decidir depois.

Entretanto, o motor de decisão `craque-ficha-decision-v327.js` chamava
`validateLevels`, que exigia custo **igual** ao orçamento. Consequências:

1. Um rascunho com pontos sobrando não era reconhecido como rascunho salvo.
2. O motor podia mostrar a proposta calculada no lugar dos dez níveis salvos.
3. A aprovação registrada numa revisão V311 anterior podia parecer aplicável
   quando o rascunho V324 tinha um vetor de PP diferente.
4. A tabela técnica de `craque-positional-ui-v311.js` usava a revisão V311 ou
   a proposta matemática na frente do rascunho independente, apesar de exibir
   mensagem de que o rascunho existia.
5. A métrica principal mostrava apenas o orçamento (ex.: 62 PP), omitindo
   o consumo e os pontos livres do rascunho (ex.: 54 / 62 PP).

## Solução sem alteração dos dados
- `validPlan` e `validateLevels` continuam a validar cálculos com PP exatos.
- Uma função de leitura `validDraft` aceita rascunho de 10 grupos com
  `0 <= PP utilizados <= orçamento`, seguindo o contrato de gravação V324.
- `resolve` prioriza o rascunho de contexto específico, inclusive zerado,
  e distingue `pp` (orçamento), `usedPP` (gasto) e `remainingPP` (saldo).
- Só preserva a indicação de aprovação quando o **vetor exibido** é igual
  aos dez níveis aprovados na revisão vigente. Um rascunho subalocado e
  diferente fica como **rascunho salvo**, não como homologação.
- A UI compartilhada lê o perfil V324 antes de desenhar o treinamento
  e exibe os níveis e o saldo do rascunho, sem misturá-lo com a proposta.
- Se o perfil independente está corrompido, a leitura de aprovação é
  conservadora e uma mensagem de bloqueio informa que o histórico foi mantido.
- Nenhum salvamento automático, substituição de builds, gasto de PP,
  alteração de Card ID ou escrita em habilidades/ímpetos.

## Exemplo reproduzível (valores do teste sintético)
Orçamento conhecido de 62 PP; rascunho de dez níveis com custo menor
que 62 PP é aceito pelo V324. No código anterior, o V327 ignorava esse
rascunho por não gastar todos os pontos, o que podia restaurar incorretamente
a proposta ou atribuir aprovação de outra distribuição.
O teste novo `scripts/test-partial-pp-draft-v336.cjs` afirma:
- custo progressivo exato;
- status `rascunho_salvo`;
- vetor original de 10 categorias sem substituição;
- `usedPP`, `remainingPP` e orçamento separados;
- ausência de falsa homologação por revisão anterior;
- rascunho totalmente zerado ainda válido;
- orçamento excedido e categorias inválidas rejeitados;
- 246 cartas originais intactas.

## Limites e próximos portões
Essa é uma correção de **integridade da decisão**, não comprova que uma
distribuição seja competitivamente superior ou validada por Rentão/Blackjhon.
Sem atribuir eficácia a uma skill, ímpeto ou cartão sem evidência de edição exata.

O PR cumulativo V336 incorpora V332–V335. Antes de integrar, verificar
`npm run check`, auditoria de 246 cartas, QA visual Android/Windows,
compilações de teste, revisão do proprietário e reconciliação de PRs
antecessores. Teste físico e publicação de APK/EXE seguem pendentes.
