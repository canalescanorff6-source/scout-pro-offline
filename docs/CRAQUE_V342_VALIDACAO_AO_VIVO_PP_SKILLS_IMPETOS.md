# V342 — Validação dinâmica de PP, cinco habilidades e ímpetos

## Evidência do problema
Na versão candidata V341 (PR #254), a verificação V340 já **bloqueia novas revisões** que repetem habilidades cadastradas como nativas ou adicionais, mas o botão de salvar só explicava a falha **após o clique**. O editor não exibia imediatamente o motivo do bloqueio quando a pessoa alternava as habilidades, nem avisava na seleção do ímpeto que o nome coincidia com o fixo. Além disso, duas habilidades com grafia equivalente após remoção de acentos e espaços ainda podiam ser incluídas juntas numa **nova** revisão por uma chamada direta a `save`.

## Implementação
1. `CRAQUE_MANAGER_FICHAS_V324.reviewDraftReadiness` (pura, somente leitura): combina orçamento PP progressivo, até cinco candidatas, conflitos com listas **nativas/adicionais informadas** na carta, nomes equivalentes, ímpeto coincidente com fixo e evidência do slot. Retorna `canSave`, `issues`, `advisories`, `spent`, `remainingPP` e `status` congelados.
2. `CRAQUE_POSITIONAL_UI_V311`: indicador dinâmico com `role=status` e `aria-live=polite`, atualizado ao marcar/desmarcar cada habilidade ou trocar o ímpeto. O botão **Salvar ficha independente deste técnico** fica desabilitado quando a seleção atual conflita com os dados cadastrados ou PP não fecham. A mesma validação é repetida no handler de salvar, contra interação desatualizada.
3. **Preservação de legados:** `profiles.save` rejeita **somente novas gravações** de habilidades com nomes equivalentes (ex.: “Condução firme” e “Conducao Firme”). O leitor `readAll` e o `validateRecord` não foram endurecidos retroativamente: rascunhos históricos continuam legíveis e editáveis para remoção de conflito. Nenhum histórico é truncado, apagado ou sobrescrito.
4. O aviso sobre ímpeto de mesmo nome do fixo e disponibilidade de slot permanece **orientativo**, não uma proibição fictícia do jogo.
5. UX Premium Android/Windows com CSS e cache PWA novos. A V342 é empilhada **sobre V341**, preservando as funcionalidades anteriores no candidato cumulativo.

## Testes e aceitação
- `scripts/test-live-equipment-v342.cjs` roda no `npm run check`: rascunho 61/62 PP, PP excedente, até cinco candidatas, colisão nativas/adicionais, equivalência de acentos, ímpeto fixo, slot pendente, legacy readable/new save blocked, 2 acervos separados e acervo original de 246 cartas imutável.
- `scripts/qa-live-equipment-v342.py` no workflow visual testa Chromium mobile e desktop: criar carta externa, técnico exato, abrir ficha, guardar histórico, injetar uma revisão legada inconsistente sem apagá-la, MAT→SA→MAT, bloqueio ao vivo de nova gravação, desmarcar candidata, salvar revisão corrigida, confirmar histórico anterior e isolamento de Minhas Cartas.
- Os jobs Android debug/Windows de teste serão verificados no GitHub Actions.
- **Sem** alterações de dados originais, Card IDs, builds aprovadas, assinaturas, pacote Android, autoatualizador ou sincronismo.
- Nenhuma seleção é considerada **equipada ou aprovada** sem comprovação; o alerta de slot não traduz disponibilidade em aprovação.

## Publicação
PR novo cumulativo, sem merge na `main` e sem release. As revisões V339/V340/V341 já presentes no ramo são dependências. Depois de CI verde e revisão humana, **pedir autorização expressa** antes de integrar/publicar; não mesclar também os PRs ancestrais para evitar duplicação.
