# V343 — Evidência de slot de ímpeto por edição, em ambos os acervos

## Defeito reproduzido
Na V342, o cadastro de **Outros Elencos** aceita o estado `ausente` com o texto
"Esta carta não possui slot", mas `reviewDraftReadiness` deixava salvar uma
**nova** revisão com ímpeto adicional candidato sem alertar a contradição.
Isso não era equipamento automático; mesmo assim, a nova revisão ficava
semanticamente inconsistente com a evidência explicitamente cadastrada.

## Correção
- `V324.reviewBoosterSlot` é pura, somente leitura, e distingue
  `slot_ausente`, `slot_ocupado`, `slot_vazio_declarado`,
  `slot_nao_comprovado` e `sem_candidato`.
- Se e somente se o cadastro declara `ausente` **e existe candidato**,
  `reviewDraftReadiness` retorna `canSave:false`,
  `status:revisar_impeto_slot` e explica como resolver: remover a
  candidata ou revisar os dados da edição. Uma ficha **sem ímpeto** pode
  ser salva mesmo com `ausente`.
- Para slot `ocupado`, `vazio` ou `pendente`, o editor mantém
  a hipótese consultiva mas avisa sobre evidências não confirmadas.
  Não inventa compatibilidade nem a existência de slot para a edição.
- A interface V311 destaca o estado `ausente` ao lado do seletor
  e transmite `data-slot-status` no diagnóstico ao vivo. Selecionar
  e remover ímpeto atualiza o botão de salvar sem gravar automaticamente.
- `save` e `readAll` não foram alterados: registros antigos com
  ímpeto candidato e slot posteriormente declarado `ausente` continuam
  legíveis, sem apagamento ou alteração silenciosa.

## Provas obrigatórias
- `scripts/test-booster-slot-guard-v343.cjs` roda em `npm run check`,
  cobrindo estados de slot, acentuação/capitalização, compatibilidade com
  PP, habilidades, isolamento dos acervos e catálogo original 246 intacto.
- `scripts/qa-booster-slot-v343.py` roda no workflow Chromium para
  Android e Windows: carta externa sem slot, criar rascunho vazio, simular
  legado existente com ímpeto, alternar MAT→SA→MAT, conferir bloqueio,
  limpar e salvar nova revisão, preservar a anterior.
- Cache offline invalidado para atualização da interface.

## Restrições
Não modificar Card IDs, imagens, PP aprovados, chaves de assinatura,
pacote Android, dados do usuário ou o sistema de atualização. Não afirmar
que a presença de `vazio` valida suporte oficial da edição; pode ser
somente relato de conta. A geração de propostas continua matemática/
consultiva, não é validação de gameplay por Rentão ou Blackjhon.

A V343 parte da branch V342 já testada e carrega cumulativamente
V339–V342 para evitar merges contraditórios. Exigir CI, QA visual,
builds de teste, revisão humana e **autorização explícita** antes de
integrar `main` e publicar Android/Windows.
