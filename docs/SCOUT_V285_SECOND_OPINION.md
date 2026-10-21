# V285 — segunda opinião competitiva para as 246 cartas

**Continuidade:** `v1.1.695` (V284). Nenhuma carta, build homologada, imagem, Card ID ou vetor de PP original foi alterado.

## O que foi implementado

- Uma **segunda opinião recolhível** dentro da ficha principal V251/V284, disponível na interface compartilhada offline Android/Windows.
- Recomendações não são atribuídas a Rentão ou Blackjhon sem evidência verificável da **mesma edição / Card ID**; ambos são referências de critérios de análise, não autores dos cálculos.
- Todas as 246 cartas são processadas nos cinco estilos do técnico (1.230 cenários).
- Para cada carta: confrontar cinco estilos e os **10 pares de táticas**, verificando ordem das cinco skills, interseção de listas e primeiro ímpeto.
- Não gerar diversidade artificial quando os cinco estilos pedirem a mesma habilidade; **expor a repetição** para revisão, com evidência.
- Contar quantos conjuntos distintos de cinco habilidades a carta recebe, sem confundir conjunto repetido com falta de qualidade.
- Contar quantos ímpetos diferentes encabeçam cada estilo e quando o melhor ímpeto é igual em várias táticas.
- Em cada uma das até cinco skills da ficha principal: nome canônico, função usada, justificativa de campo individual, sinergia de apoio, risco tático e quantos estilos a incluem.
- Mostrar a família registrada da habilidade, se existe nativa conhecida da mesma família e qual alternativa disputa a prioridade.
- Destacar diferenças pequenas entre as notas sem declarar vencedor comprovado em partidas.
- Preservar exclusão de habilidades adicionais idênticas às nativas reconhecidas e das adicionais efetivamente informadas.
- Recalcular contrafactuais **sem as nativas cadastradas**, **sem vetor de PP** e **sem estilo ofensivo/defensivo**; apresentar quantas posições do top cinco mudariam e se o primeiro ímpeto mudaria.
- Quando uma evidência não está presente, **marcar teste indisponível** em vez de fabricar uma alteração.
- Se PP é estimado, provisório, ausente ou divergente, não usá-lo como sinal confirmado de treinamento.
- Explicar até três ímpetos, seus quatro atributos técnicos, sobreposição com o fixo e distância do candidato seguinte.
- Separar prova do slot no catálogo e confirmação local de slot vazio; sem ambas, gasto de tokens não é autorizado.
- Não supor atributos finais a partir do custo de PP e não inferir que sobreposição de ímpetos é desperdício.
- Listar pendências por edição: identidade, posição alternativa, nativas, orçamento PP, atributos-base, habilidades adicionais, segundo slot e gameplay.
- Não usar Overall como prova de qualidade, não modificar as builds aprovadas e não aplicar configurações automaticamente.

## Matriz de robustez, não score de gameplay

Os indicadores da segunda opinião são **comparações de heurísticas**: mudanças de ordenação, repetição de conjuntos e omissão de evidências. Nenhum número representa vitória provável, metas de atributos, ganho de velocidade/chute, rendimento comprovado, build meta homologada ou recomendação efetivamente feita por um criador.

## Qualidade técnica

- `scripts/test-competitive-quality-v285.cjs`: verifica **1.230 cenários e 12.300 comparações de pares táticos**, compatibilidade da V284, cinco habilidades, quatro eixos de cada ímpeto, 3 ablações e todos os bloqueios de aplicação.
- `build/v285-quality-246x5.json`: relatório consultivo exportado para auditoria; artefato da CI.
- Testes explícitos de identidade CAP+Card ID+edição; Martinelli #191, nível 26/50 PP; PP estimado excluído de sensibilidades de investimento.
- QA real em Chromium (320, 360, 390, 412, 1024, 1151, 1366, 1920); abertura do novo painel conferida em 390 e 1151 px.
- CSS específico mobile/desktop em `web/craque-ficha-individual-v251.css`, mantendo a identidade do projeto.
- Versionamento do cache offline e reutilização do mesmo JS nos dois pacotes.

**Publication gate:** mesclar somente com testes gerais, auditoria das 246 cartas, QA visual e compilações Android/Windows concluídos; novo APK assinado, EXE e atualizador verificados só após pipeline da main. CI green não substitui teste em aparelho físico.
