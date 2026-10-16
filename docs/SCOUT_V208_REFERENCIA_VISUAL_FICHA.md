# V208 — layout de treino baseado na imagem entregue pelo usuário
Referência: painel 1280 × 1536 px, moldura dupla ciano, título A - Posse central, colunas Categoria/Nível/PP, dez linhas (incluindo zeros) e Total 68/68 no exemplo.

A tabela real usa sempre os níveis e PP da respectiva carta. O código mantém o identificador real do cenário (A, P etc.), portanto não renomeia uma build P como A só para corresponder ao título ilustrativo. O custo PP é o somatório progressivo por nível: 1–4: 1; 5–8: 2; 9–12: 3; 13–16: 4; 17–20: 5.

162 builds registradas, 84 fichas pendentes e seus arquivos originais não foram alterados. Uma distribuição draftA pode ser exibida como prévia experimental (nunca validada automaticamente). Sem distribuição, níveis mostram travessões, e não zeros inventados. A tabela estática não substitui os controles editáveis do Laboratório.

Android e Windows usam a mesma base JS/CSS e cache offline. A estética foi reproduzida estruturalmente e com desenhos SVG originais; não se afirma identidade pixel a pixel dos pictogramas rasterizados da referência. QA exige seis resoluções e build GREEN antes do merge.

## V209 — atualização autorizada do cabeçalho visual
Por solicitação explícita do usuário, toda tabela exibe o cabeçalho **A - Posse central**, independentemente da letra interna do treino. É mudança exclusivamente de apresentação: `state.scenario` permanece A/B/C/P real, inclusive para a escolha de um draft, e distribuição, PP, habilidades e ímpetos não se alteram. Teste Node confirma títulos uniformes com cenários internos preservados; Chromium verifica Massaro (P interno) mostrando A visual, todas as resoluções e 246 cartas.
