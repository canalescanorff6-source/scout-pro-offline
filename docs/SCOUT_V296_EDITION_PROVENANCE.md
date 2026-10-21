# V296 — Conferência de nível/PP vinculada à edição exata

**Base de continuidade:** V295/PR #203. Catálogo e imagens originais permanecem inalterados.

## Falha real

As conferências locais V248 armazenavam `numero`, `card_id` e `name`, mas não gravavam o nome da edição (`versao`). Os consumidores V249, V250 e a ficha V251 apresentavam esse comprovante como vinculado à edição exata mesmo que a versão da carta mudasse mantendo os mesmos CAP/Card ID/nome. O importador entre Android e Windows também aceitava arquivos sem identificação explícita da edição.

## Correção

- V248: novos recibos têm `edition:card.versao`; `validate` exige correspondência literal, não vazia.
- V249: avisos da ficha e catálogo nunca aceitam edição ausente/divergente.
- V250: importação de backup/exportação verifica `edition`, preserva atomicidade e rejeita arquivos antigos/misturados com erro explicativo; comparação de registros inclui edição.
- V251: nenhuma conferência local sem edição pode fornecer nível/PP ao otimizador; identidade/nível originais continuam intactos.
- Tela V248: quando existir registro antigo incompatível, o usuário recebe indicação de reconfirmação, sem apagar o valor salvo.

**Compatibilidade:** registros legados permanecem fisicamente armazenados em `localStorage` e no backup usual, mas não são classificados como confirmados. A reconfirmação manual na edição atual regrava o mesmo registro com `edition` explícita. Não existe migração automática nem remoção silenciosa.

## Evidência

- Regressão V296: 246 cartas e 984 recibos adversariais (sem edição, nula, vazia e versão diferente), invariantes dos quatro consumidores e importação atômica negativa.
- Testes históricos V248/V249/V250 atualizados para incluir edition, mantendo detecção de PP divergentes, caso Martinelli CAP191 nível 26/50, rollback e invariantes de 246 cartas.
- `npm run check` e workflow CI, mais QA visual e builds teste Android/Windows; seus resultados devem ser conferidos antes de integração.
- Artefato `build/v296-progress-proof-246.json` reproduzível na CI.

## Restrições

Nenhuma atualização automática do app instalada nesta etapa. Sem validação individual de gameplay ou atribuição de builds a terceiros. Não alterar Card IDs, PP, máximos, imagens, ímpetos, nativas nem treinos registrados. Versão do jogo só é conferida quando explicitamente declarada pelo usuário; o formulário local não substitui prova externa.
