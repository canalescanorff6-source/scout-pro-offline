# V344 — Sugestões coerentes por edição, posição e tática

## Defeito confirmado no código V343
O editor V311/V324 já recusava sugerir novas habilidades repetidas com as listas
**nativas cadastradas** ou **adicionais informadas** da carta. Contudo, o painel
de recomendações e o resumo Premium continuavam usando as recomendações brutas
do motor `outcome.suggestedSkills`, podendo exibir nomes rejeitados pelo próprio
editor como se fossem candidatos distintos. O painel de ímpetos também mostrava
"primeiro candidato" apesar de cadastro `boosterSlot=ausente`.

## Mudança incremental V344
1. `CRAQUE_MANAGER_FICHAS_V324.screenContextualSuggestions` é uma API
   **pura** para triar sugestões da mesma carta (nativas/adicionais informadas,
   duplicatas após normalizar nomes e acentos e até cinco candidatas).
   Mantém os motivos fornecidos pelo motor original, sem inventar
   traduções PT-BR, razões, probabilidade de slot, atributos ou gameplay.
   Retorna exclusões com motivo e identifica nativas ausentes como
   `pendente`, nunca como carta sem habilidades.
2. O painel V311 usa **a mesma lista triada** nas recomendações, na ficha
   Premium, nas justificativas "por quê?" e como entrada para o editor
   de seleção de habilidades. Excluídas aparecem somente ao abrir
   `Não mostrar como novas candidatas`, com o motivo documental.
3. **Rascunhos V324 salvos têm prioridade total**: qualquer nome histórico,
   inclusive com possível conflito documental, permanece visível.
   O filtro novo opera apenas em **novas sugestões**, não reescreve
   nem apaga as seleções anteriores; bloqueios de novas revisões continuam
   sendo feitos por V340/V342.
4. Com `boosterSlot=ausente`, o ranking ainda pode ser consultado,
   mas é claramente rotulado como **teórico** (não como primeiro candidato
   para esta edição). O resumo Premium não apresenta essa hipótese como
   ímpeto disponível. O editor só oferece a opção vazia e, se existir,
   o ímpeto salvo de um legado para que o usuário possa limpá-lo;
   nunca oferece um novo candidato contraditório.
5. A mudança usa apenas as listas informadas para a identidade ativa
   `collection/owner/cardKey/Card ID/edition/position/style/manager`
   que a UI V311 já seleciona. Não copia listas entre acervos,
   edições, posições ou técnicos.
6. `web/sw.js` recebe nova geração do cache offline, preservando os
   mecanismos existentes de atualização Android/Windows.

## Provas
- `scripts/test-contextual-suggestion-screen-v344.cjs`: prioridades e
  razões preservadas, remoção de repetidas, nativas/adicionais informadas,
  quatro estados do slot, rascunho legado, acervos isolados e 246 cartas.
- `scripts/qa-contextual-suggestions-v344.py`: Chromium Android/Windows
  com carta externa real, nativas informadas e slot ausente; verifica
  coerência da UI, ausência de novas opções de ímpeto e nenhuma escrita
  implícita em `localStorage`.
- Inclusão em `npm run check` e QA visual obrigatório do PR.

## Limites e segurança
Esses filtros são **documentais**, não confirmam cinco slots livres,
inventário nativo completo, comprovação de edição, habilidade equipada,
ativação de ímpeto ou superioridade no gameplay. Não mudam Card IDs,
imagens, build, PP, provas oficiais, assinatura Android ou instalador.
O PR V344 acumula V339–V343, aguardando CI e revisão humana.

**Nenhuma publicação sem autorização explícita de merge e release.**
