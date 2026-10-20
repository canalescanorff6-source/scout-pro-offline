# V275 — Engenharia competitiva das fichas, habilidades e ímpetos

Base do repositório oficial `canalescanorff6-source/scout-pro-offline`, main `b0675a6849c2235bbc109ea24974f3354ac00402` (V274, release `v1.1.655`). Não criar projeto novo nem substituir builds, 246 imagens, edições, Card IDs, PP, vetores, habilidades, ímpetos fixos ou saves.

## Problemas técnicos tratados de uma só vez
1. **Posição original alterada na leitura do laudo:** após a doutrinação de PTE para CA, o painel marcava CA como posição original, escondendo a verdadeira origem da carta.
2. **Identidade documental frouxa:** laudo considerava a versão identificada mesmo quando só havia Card ID e a edição estava vazia.
3. **Desempate alfabético:** recomendações com score igual eram ordenadas por nome técnico em vez da prioridade funcional da carta.
4. **Ausência de diferenciação de empate real:** ranking não alertava quando a 1ª e 2ª habilidades possuíam scores próximos.
5. **Falta de checklist independente:** itens como PP, Card ID, skills nativas, doutrinação, equipamentos e segundo slot apareciam em textos desconectados.
6. **Risco de confundir evidência documental com desempenho:** completude cadastral e eficácia competitiva são dimensões diferentes.
7. **Sem visibilidade de estabilidade:** era difícil saber se a primeira habilidade e o primeiro ímpeto mudavam entre os cinco estilos.
8. **Sem guia operacional por papel e tática:** os resultados da ficha não explicavam como usar a carta sob pressão.
9. **Conferências legadas sem edição explícita:** risco de interpretar as confirmações antigas como prova da versão exata.

## Pacote V275
10. Posição de origem persistida independentemente da posição treinada; o laudo mostra ambas.
11. Proficiência da posição alternativa só é reconhecida quando confirmada pela integração de doutrinação V246/V263. PTE ≠ CA por Overall.
12. Exigir Card ID e edição preenchidos, sem marcadores como PENDENTE, para estado de identidade identificável.
13. Checklist em **sete dimensões independentes**: identidade, posição, nativas, PP matemático não provisório, cinco adicionais, segundo ímpeto, atributos-base comprovados.
14. Pontuação de checklist representa documentação cadastrada, **não qualidade, Overall ou tier competitivo**.
15. Comparação de rankings dos cinco estilos exibe quantidade de escolhas distintas da primeira habilidade e primeiro ímpeto.
16. Ordem determinística de desempate da lista de habilidades respeita o POOL específico da função — não a ordenação alfabética.
17. Margem relativa por habilidade com alerta para alternativas muito próximas, sem forçar variação ou alterar habilidade nativa.
18. Plano de jogo contextual para **10 funções** (CA, SA, MAT, MLG, VOL, ZG, LD, LE, ALA, GO).
19. Orientações específicas de **cinco estilos** (Posse, CA Normal, CA Rápido, Por Fora e Passe Longo), totalizando 50 combinações de orientação. Posse central sem cruzamento obrigatório.
20. Cada guia distingue tarefa, linha de apoio e risco de posse/cobertura — sugestões, não testes medidos de gameplay.
21. Prova de lista de adicionais agora registra edição exata nos novos salvamentos e recusa prova de edição divergente.
22. Confirmações antigas permanecem legíveis, mas mostram advertência quando o estado do segundo ímpeto não declara a edição.
23. Ímpeto principal e alternativos mantêm os 4 atributos e pontuação relativa sem exigir segundo slot inexistente.
24. Os 47 nomes nativos especiais da V274 permanecem catalogados sem virar skills selecionáveis.
25. A ficha exibe o checklist e as variações táticas numa seção recolhível existente, sem duplicar builds.
26. Teste de segurança do Martinelli #191 PTE→CA (nível 26, PP 50), só reconhecendo proficiência confirmada sem usar treino provisório.
27. **246×5=1.230 cenários automatizados** e dossiê completo `build/v275-competitive-evidence-246x5.json`.
28. Auditoria de listas iguais por função, estilo e Card ID, sem diferenças fabricadas.
29. Capturas visuais responsivas (oito resoluções) e integridade Android/Windows exigidas antes de merge.
30. Nova chave de cache offline para ambos os dispositivos, build APK/EXE e release assinada condicionada à CI pós-merge.

## Regras obrigatórias
- Rentão e Blackjhon são referências de rigor e triagem; **não atribuir autoria ou validar uma build deles sem print/vídeo da edição exata**.
- A pontuação heurística não substitui atributos-base comprovados, gameplay real, proficiência, nem configurações efetivas do jogador.
- Nunca gastar fichas de habilidade/ímpeto automaticamente.
- Preservar as 246 cartas e todos os dados aprovados. Vetores ausentes ou provisórios não podem ser corrigidos com suposições.
- Compatibilidade com as rotinas existentes; testes legados devem ser ajustados apenas quando a regra anterior conflitar comprovadamente com o novo contrato de segurança.

## Gates para liberação
1. `npm run check` completo GREEN e artifact 246×5 disponível.
2. Auditoria V101, compilação Android debug e instalador Windows validação GREEN.
3. QA visual 8 viewports sem problemas.
4. Merge do PR com SHA de HEAD verificado.
5. Testes na main GREEN, Android assinado/sha256 e Windows NSIS/blockmap/latest.yml publicados.
6. Instalação em aparelhos reais e partidas competitivas continuam etapas posteriores.
