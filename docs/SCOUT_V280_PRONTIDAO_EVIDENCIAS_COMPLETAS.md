# Craque Tático V280 — prontidão documental com 9/9 evidências

## Base real e princípio
Continuação do projeto existente, a partir da `main` em `571fd197d71801dcbe1b627b50e19a58974271de` (V279, release `v1.1.670`). Nenhum arquivo de cartas, CAP, Card ID, edição, imagens, níveis, PP, fichas aprovadas, saves ou slots equipados é alterado.

## Falha reproduzida (teste RED)
O classificador consultivo `web/craque-competitive-readiness-v264.js` permitia classificar `gameplay` com apenas identidade, treino matematicamente coerente, orçamento, base, vídeo e gameplay. Faltavam três exigências já exibidas na própria tela: lista das **habilidades nativas**, **cinco habilidades adicionais/equipamento** e **situação documental do ímpeto/segundo slot**. Isso podia mostrar uma classificação alta enquanto o dossiê ainda listava pendências materiais.

## Correção
`documentaryComplete` exige que os **nove** sinais do próprio `sources` estejam verdadeiros: identity, training, budget, natives, equipment, slot, base, video e field.

- Só se classifica `gameplay` com 9/9 documentalmente completos.
- Mantém `blocked` quando a identidade exata é inconclusiva; mantém `registered` quando o PP confere mas outras provas faltam e `review` quando o PP não confere.
- `documentaryComplete` é exposto também em `build/v264-competitive-246x5.json` como `evidencias_documentais_completas`.
- **Mesmo 9/9 não significa build meta, treino homologado, teste físico nem autorização de escrever builds ou gastar tokens automaticamente.**
- Estado de habilidade, ímpeto, vídeo, fonte, edição ou gameplay não é criado automaticamente.
- `web/sw.js` renova o cache, mantendo offline Android/Windows.

## Regressões
`scripts/test-readiness-complete-v280.cjs` testa as 246 cartas × cinco táticas = 1.230 classificações, imutabilidade do catálogo, ausência de homologação automática e casos sintéticos em todas as táticas, retirando uma a uma as oito evidências não-PP, além de treino explicitamente provisório.

A primeira execução na CI do PR #185 falhou como esperado em `Status documental #1 posse: undefined !== false`, confirmando teste RED. O próximo commit adicionou a implementação (GREEN a conferir na mesma CI em novo SHA).

## Gates de liberação
PR #185 rascunho: exigir `npm run check`, auditoria das 246 cartas e integridade física, builds de teste Android e Windows, QA visual, revisão e só então avaliar merge/release. Nunca descrever a metodologia de Blackjhon e Rentão como autoria da build sem vídeo da carta/Card ID exato.
