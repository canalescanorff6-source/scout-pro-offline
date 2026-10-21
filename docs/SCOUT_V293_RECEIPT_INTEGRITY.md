# Craque Tático V293 — recibos de equipamento e conciliação de slots

## Base e escopo
Base: PR #200 (V292, `engineering/v292-booster-documentary-confidence`). O PR V293 não substitui builds nem identifica novas cartas; integra-se **após a V292**, sem publicar APK/EXE.

## Erros de confiabilidade corrigidos
1. **Confirmação de adicionais nas APIs de baixo nível:** a rotina `checkedEquipment` verificava a correspondência com o recibo, mas não bloqueava explicitamente Card IDs/edições provisórios antes de aceitar um registro sintaticamente consistente. A nova `identityEvidenceV293` exige CAP inteiro positivo, Card ID numérico presente e edição sem marcadores de pendência. A mesma política agora é usada por `verifiedRecommendationContextV288` e `boosterRecordEvidence`, evitando que chamadores internos contornem a validação da interface.
2. **Conflito segundo ímpeto versus slot vazio:** quando o catálogo contém o **nome de um segundo ímpeto registrado**, uma declaração local de `vazio` não passa mais como conferência reconciliada. O registro local permanece armazenado; a API retorna `catalogConflict`, um motivo em PT-BR e `valid: false` até revisão manual da versão.
3. **Ocupado sem nome:** a declaração de slot ocupado continua legítima mesmo sem nome de ímpeto, mas passa a sinalizar `equippedNamePending`. A recomendação é puramente comparativa e pode incluir o que já está equipado; esse aviso aparece no motor. Não é permitida aplicação ou gasto.
4. **Recibos malformados:** campo `equipped` em formato objeto ou não textual deixa de ser aceito.

## Regressão e cobertura
- `scripts/test-receipt-integrity-v293.cjs`: 246 cartas × cinco estilos. Valida Card ID, edição, diferença entre evidência da conta e catálogo, tratamento de slot vazio/ocupado e preservação integral do acervo.
- Incluído no `npm run check`; gera `build/v293-receipt-integrity-246x5.json` com diagnóstico por CAP, anexado no CI.
- `web/sw.js` revisado para atualização offline do motor no Android e Windows.
- Não foi alterado nenhum dos 246 HTMLs de fichas, nenhuma imagem, Card ID, PP, nível, ímpeto original, habilidade nativa ou build aprovada.

## Limitações
Um Card ID numérico no catálogo é apenas **identificação plausível**, não validação in-game. A confirmação da conta é uma declaração local do usuário e não comprova que um booster listado esteja disponível ou seja superior. Nenhum arquivo de gameplay foi testado como parte dessas rotinas. A regra conservadora para segundo ímpeto cadastrado como nome explícito exige reconciliação em caso de relato de vaga vazia; não apaga a declaração do dispositivo.

**Nunca confundir 1.230 cenários verificados automaticamente com 246 cartas individualmente homologadas.**
