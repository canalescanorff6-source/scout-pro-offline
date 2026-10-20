# V274 — Fichas competitivas, 47 habilidades nativas especiais, cinco habilidades adicionais e ímpetos

## Continuidade
Base `main` V273: commit `046bf29e66ff7adf35a0655bd6700c4abb8d82af`, release `v1.1.650`. Não recriar o aplicativo; conservar todas as 246 identidades (Card ID/edição), fotos, PP e builds aprovadas, ímpetos fixos e adicionais equipados, saves e escalas.

## Problema de origem
O teste da V273 identificou 1.035 cenários de 246×5 nos quais uma ou mais skills NATIVAS eram consideradas "fora do vocabulário", embora os nomes estivessem efetivamente cadastrados. Isso reduzia a personalização por edição e criava ruído no laudo. Os exemplos incluem Outside Curler, Phenomenal Pass, Aerial Fort, Scissors Feint, Blitz Curler, GK Directing Defence, Cruzamento preciso e outros. Esses nomes NÃO são aliases das habilidades adicionais treináveis e não devem ser falsamente mapeados para os slots.

## Pacote V274 — alterações
1. Glossário conservador dos **47 nomes originais de habilidades nativas especiais** presentes no acervo, agrupados em seis famílias para contexto consultivo: condução, distribuição, amplitude, finalização, defesa e especial.
2. **Sem inventar tradução KONAMI**: manter strings originais que vieram das 246 cartas.
3. Habilidades especiais não passam a ser consideradas skills adicionais selecionáveis no sistema de 5 slots.
4. Nativas completamente desconhecidas, se surgirem em cartas futuras, continuam como **não interpretadas** e precisam de conferência.
5. Família de **distribuição** alimenta desempates leves de Passe de primeira, Passe na medida e Passe em profundidade em funções compatíveis.
6. Família de **condução** contribui apenas para alternativas de recepção, tabela e escape curto, sem deduzir atributos finais.
7. Família de **finalização** pode influenciar complementaridades de criação, sem sugerir copiar uma skill nativa.
8. Família de **defesa** influencia comparações defensivas e saída curta apenas nas posições coerentes.
9. Família de **amplitude** influencia a tática Por Fora quando essa é escolhida, preservando a preferência por Posse central.
10. Família **especial** fica em observação, sem bônus heurístico inventado.
11. Efeito contextual na nota de skill fica limitado a **6 pontos relativos por candidata por grupo**; não é aumento de atributo ou mecânica oficial.
12. Ímpetos também distinguem nativas documentadas como Fenomenal Pass, Outside Curler, Marseille Turn e Aerial Fort, em notas de função conservadoras.
13. Ímpetos registram **nomes das nativas que contribuíram no contexto** para transparência.
14. Bloquear homologação ou gasto automático por pontuação, mantendo teste físico real independente.
15. O novo laudo da ficha mostra nativas especiais por **nome original e grupo**, separado das habilidades adicionais equipáveis.
16. Nativas efetivamente desconhecidas aparecem em seção própria e não são apagadas.
17. Resumo dos critérios na ficha informa contagem de nativas especiais, custo matemático do PP e segundo slot.
18. Manter a integridade das cinco habilidades equipadas, sem sobreposição com nativas ou slots imaginados.
19. Manter a análise de cinco táticas por ficha, com seleção individual já homologada para posição treinada.
20. A gestão de builds mantém vetores aprovados imutáveis: 161 matematicamente coerentes, 84 ausentes e 1 proposta provisória em auditoria.
21. Teste específico de **246 cartas × cinco estilos = 1.230 cenários** e 47 rótulos documentais, verificando não duplicação, prova de slots, nativas e PP.
22. Teste de paridade entre nativas contextuais em PT e EN sem atribuir efeitos numéricos.
23. Dossiê JSON `build/v274-special-native-evidence-246x5.json` com Card ID, glossário, classes de nativas e top skill/ímpeto por tática.
24. Artifact CI `craque-v274-nativas-especiais-246x5` para investigação por carta.
25. Atualização segura do cache offline e componentes Android/Windows.
26. Preservação do laudo premium V273: dossiê, PP, justificativas, três opções de ímpeto e 5 adicionais.
27. Identificação de lacunas existentes: fonte de atributos-base, prova de Card ID/edição, status de slot, treino e vídeos oficiais.
28. Travas de regressão automatizada: 246 cartas, cinco estilos, Android/Windows, 8 viewports, PR protegido e release com checksum.

### Limites competitivos
Isto usa Rentão e Blackjhon apenas como **referências do rigor de triagem por edição**. Não há atribuição de recomendações à autoria deles. Nomes registrados de habilidades especiais são tratados como rótulos já presentes no próprio acervo, sem inferir efeitos numéricos individuais ou tradução oficial.

Conforme a KONAMI, são até **cinco habilidades adicionais** na carta, e o treinamento usa Pontos de Progresso: https://www.konami.com/efootball/pt-br/page/dreamteam . A KONAMI documenta os **28 tipos de ímpetos criáveis** na atualização v5.2.0: https://www.konami.com/efootball/pt-br/page/v5/versioninfo_v5-20 . A base oficial não prova que uma edição pessoal tenha 2º slot selecionável.

### Gate obrigatório
CI e integridade das 246 cartas GREEN; builds Android debug e Windows NSIS GREEN; QA 8 viewports GREEN; PR por SHA; testes pós-merge na main; APK Android assinado + checksum SHA256, Windows EXE + blockmap/latest.yml e release pública. Testes reais em aparelhos e partidas ainda são independentes.
