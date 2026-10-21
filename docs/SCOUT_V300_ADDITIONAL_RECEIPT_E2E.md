# V300 — prova das cinco habilidades adicionais, da interface ao motor

**Base:** V299 aprovada 5/5 no PR #207; branch V300 contém o histórico cumulativo V289–V300, sem merge duplicado.

## Falha identificada

O checklist `proofChecklist` na ficha principal verificava a assinatura lógica V254 através de `S.checkedEquipment(identity,installedSkills,equipmentRecord)`, mas em seguida invocava o motor `S.evaluate` apenas com `{equippedConfirmed:true}`, **sem encaminhar `equipmentRecord`**. A proteção V294 corretamente tratava essa flag isolada como insuficiente e retornava `equippedConfirmed:false`.

Resultado: a mesma ficha tinha critérios diferentes para documentação do inventário e confirmação de cinco slots, embora uma prova V254 válida estivesse armazenada.

## Correção

- Encaminhar o registro V254 exato para o motor: `{equippedConfirmed:true,equipmentRecord}`.
- O checklist só marca adicionais como documentados se `S.checkedEquipment` **e** `S.evaluate(...).equippedConfirmed` forem verdadeiros, sem conflitos de nomes, limite ou reconciliação.
- Registros de outra edição, Card ID, impressão digital nativa/lista adulterada, flag isolada e registro desconfirmado continuam PENDENTE; nenhuma vaga é inventada.
- Nenhuma mudança em catálogo, Card IDs, PP, nativas, builds, ímpetos, posições ou equipamentos locais.

## Testes

- `scripts/test-additional-receipt-end-to-end-v300.cjs`: 246 cartas; 1.230 avaliações em cinco estilos; seis variações adversariais por carta (1.476 bloqueios esperados); inventário V254 legítimo e uma adicional específica na edição Martinelli 26/50.
- A verificação direta de fonte antes do CI encontrou 219 cartas que podiam ser confirmadas por recibo sintético; isto **não afirma que os usuários tenham equipamentos realmente confirmados**.
- `npm run check` e QA Chromium/compilações de teste Android/Windows devem passar no PR.
- Relatório `build/v300-additional-receipt-246x5.json` anexado à CI.
- Só confirmação de gameplay real na edição permite homologação competitiva; testes sintéticos não bastam.

## Integração e release

Não integrar PRs cumulativos em duplicidade. Sem merge e publicação até todos os critérios condicionais do Prompt Mestre, inclusive comprovação de assinatura Android oficial, artefatos Windows e instalação real. Testes de PR só validam debug.
