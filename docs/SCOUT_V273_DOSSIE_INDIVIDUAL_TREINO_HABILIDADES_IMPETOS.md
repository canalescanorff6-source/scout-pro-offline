# V273 — Laboratório competitivo individual, habilidades e ímpetos

## Ponto de partida e escopo
Main da V272 `30733d0d45608a045d86331e0534da4faf0484f4`, release `v1.1.645`. Preservar rigorosamente as 246 cartas com imagens, Card IDs, edições, PP, vetores, skills nativas, progresso, builds, equipamentos, escalações e saves. Nenhuma seleção automática.

**Rentão e Blackjhon:** inspiração nos critérios de análise de treino manual, função, sinergia, habilidades e ímpetos. Sem print/vídeo da MESMA edição (Card ID), **não afirmar que uma build é de nenhum dos dois**. Não julgar só Overall.

## V273 — mudanças verificáveis
1. **Diferenciador de habilidades por PP reais:** as cinco recomendações deixam de considerar apenas função, tática, estilo e nativas; agora incorporam investimento documental da build, quando o custo PP corresponde exatamente ao vetor.
2. A nova contribuição tem peso máximo de **8 pontos relativos por habilidade**, documentado e reversível, sem converter pontos em atributos finais.
3. Custo calculado pelas dez categorias oficiais do projeto; vetor inválido, ausente ou divergente não contribui.
4. Treino **proposto não validado** continua excluído; Martinelli #191 não recebe status de treino aprovado.
5. PP sem origem comprovada não viram prova competitiva: análise permanece consultiva.
6. PP estimado (`pp_estimated` ou `pp_estimado`) é bloqueado, inclusive compatibilidade com formatos de ficha distintos.
7. Motivo do ranking expõe a quinta parcela **investimento**, além de função/tática/estilo/nativas.
8. Ficha principal de habilidades agora contém um **dossiê recolhível por CAP e Card ID** sem uma segunda ficha de treino.
9. Dossiê indica o **arquétipo individual** (finalizador, pivô, apoio, ruptura, orquestrador, volante, zagueiro construtor/destruidor, lateral e goleiro), derivado de estilos cadastrados.
10. Dossiê registra função, posição original e posição de análise; **não prova proficiência** sem V246/V263.
11. Dossiê lista as dez categorias do vetor com seus níveis, sem chamá-las de atributos finais.
12. Compara os **cinco estilos táticos**: primeira habilidade, primeiro ímpeto, margem e confiança.
13. Ímpeto principal e alternativas permanecem consultivos, condicionados a existência/ocupação de segundo slot.
14. Critério de slot vazio exige registro local compatível, não um campo genérico do catálogo.
15. Nativas desconhecidas sinalizadas nominalmente, preservadas integralmente e **nunca tratadas como ausentes**.
16. Diferenças de pontuação próximas são sinalizadas para conferir atributos-base e gameplay.
17. Edição, Card ID e vínculo documental insuficientes bloqueiam interpretação homologada.
18. Lista incompleta das cinco habilidades adicionais permanece **sem vagas presumidas**.
19. Nenhuma recomendação é atribuída a criadores externos sem fonte exata.
20. Todas as saídas incluem `competitivelyApproved:false` e `maySpendTokensAutomatically:false`.
21. Novo teste percorre **246 × 5 = 1.230 cenários**, exercita PP válido/inválido, nativas, slots, posições, cinco táticas e identidades.
22. O teste identifica **grupos de recomendações idênticas** dentro de papéis/estilos equivalentes, documentando CAP e Card ID; não muda builds arbitrariamente para forçar variedade.
23. Dossiê JSON `build/v273-card-evidence-246x5.json` disponibilizado como artefato CI, com lacunas por carta.
24. Novo service worker para atualização offline, mantendo Android e Windows sincronizados ao mesmo código publicado.
25. Visual alinhado ao escudo (azul-noite/dourado), leitura de rolagem em celular, painel de justificativas recolhível.
26. Regressões V270 e V272 atualizadas para validar soma das **cinco fontes** da nota.
27. Nenhuma modificação ao catálogo `SCOUT_V69_AUDITORIA.json`.
28. Qualidade de software bloqueia publicação até checks GREEN, Android debug, Windows NSIS, QA visual (oito viewports), merge protegido pelo commit, builds oficiais e checksum.

### Importante: verificações externas
A documentação da KONAMI confirma que há até cinco habilidades adicionais e treino por Pontos de Progresso. O anúncio de setembro/2026 explica as fichas de seleção de habilidades e posições na atualização v6.1.0; isso não comprova que uma carta específica possua uma habilidade ou um segundo slot. Nenhuma mídia ou conteúdo de terceiro foi copiado ao acervo.

### Critérios de liberação
- `npm run check` sem falhas, auditoria 246 cartas e relatório anexado
- APK Android debug e instalador Windows de validação sem falhas
- QA visual oito resoluções / sem overflow ou falha
- PR merge com `expected_head_sha` verificado
- CI/QA da `main` + release Android assinada, SHA256, Windows EXE, blockmap e latest.yml
- Testes em aparelhos e desempenho real continuam etapas distintas; não alegar homologação só pela CI
