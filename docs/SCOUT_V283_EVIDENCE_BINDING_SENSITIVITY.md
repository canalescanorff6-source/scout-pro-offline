# Craque Tático V283 — prova por edição e sensibilidade competitiva

Base: V282 `v1.1.682` (`41670184e2ae73a9b0307f3e97f3b6ca54007172`).
Escopo: **motor existente**, 246 cartas × 5 estilos, Android/Capacitor e Windows/Electron offline.

## Problema confirmado no código
- `revisao-impetos-v103.js` gravava `card_id`, `status` e nome do ímpeto **sem** CAP e edição. Já a verificação V278 exigia edição, resultando em conferências não reconhecidas na ficha. O painel unificado V220 e o parecer V251 aceitavam estados locais conferindo basicamente o Card ID, permitindo interpretar um registro incompleto como verificado.
- Registros legados foram **preservados**, mas não são prova de slot vazio, ocupado ou ausente; precisam ser reconfirmados pelo usuário no jogo. Nada é migrado ou equipado automaticamente.

## Alterações
1. `booster-engine-v103.js`: relatório de cada carta inclui sua **edição exata**.
2. `revisao-impetos-v103.html`: inclui verificador documental existente da V162.
3. `revisao-impetos-v103.js`: confirmação vinculada a `CRAQUE_BOOST_SLOT_V283`, CAP, Card ID, edição e status; aviso para registro antigo; plano não comprovado permanece separado de slot confirmado.
4. `skills-booster-v162.js`: prova estrita de CAP/Card ID/edição + estado de slot; rejeita confirmação legada, status inválido e paradoxo "vazio mas equipado". Uma vaga só entra na avaliação condicional quando é compatível com a **edição do catálogo**.
5. `scout-card-unified-v220.js` e `craque-ficha-individual-v251.js`: consultam o mesmo validador de prova; removidas aceitações conflitantes por leitura local permissiva.
6. `evidenceSensitivityV283`: adiciona dois cenários contrafactuais para cada edição e estilo: retirar sinais de habilidades nativas e retirar o vetor de PP. Mostra mudança do top cinco e do primeiro ímpeto. Isso identifica **dependência de evidência**, não estatística final ou vantagem meta.
7. Ficha principal: seção recolhível de comparação. A ficha homologada/registrada, imagem, posição original e dados dos 246 registros são preservados.
8. Cache offline incrementado para atualização consistente entre Android e Windows.
9. Teste novo `scripts/test-evidence-sensitivity-v283.cjs`: valida as 246 cartas × cinco táticas, 1.230 cenários, prova de edição, estabilidade e imutabilidade da base. Teste histórico V278 recebeu fixture com a prova reforçada, **sem remover suas demais verificações**.

## Regras de segurança
- Sem alteração de `SCOUT_V69_AUDITORIA.json`, imagens, Card IDs, níveis, PP, builds, habilidades equipadas ou ímpetos fixos.
- Sem atribuição de fichas a Rentão ou Blackjhon sem fonte exata.
- Sem uso de Overall como fundamento, simulação de atributos finais ou efeito numérico inexistente.
- Sem concessão automática de habilidade, ímpeto ou token.
- Sensibilidade de heurística **não é** desempenho observado em partidas.
- Verificação local é declaração do usuário, **não** prova documental externa.

## Validação
Executar `npm check`, a auditoria V283, os testes regressivos do V278 e as compilações Android/Windows. Verificar os relatórios de QA visual nas resoluções suportadas. **Não integrar nem publicar antes de concluir esses gates.** A CI não substitui teste físico em celular real.

## Pendências fora do escopo deste pacote
Validar prints/links da edição exata para perfis com atributos-base ausentes; a interface não preenche dados faltantes artificialmente. Comparar resultados táticos em partidas reais permanece uma etapa manual/documental.
