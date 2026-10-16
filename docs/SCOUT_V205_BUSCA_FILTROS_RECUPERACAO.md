# Scout PRO V205 — busca transparente e recuperação de filtros

## Problema demonstrável na V204
A implementação V203 atualiza o resumo somente ao clicar na posição, raridade ou ordenação. O campo REAL de busca \`#search\` é movido para o hero V192 e filtra cartas via \`premium.js\`, mas não avisa o resumo recolhido. Assim, uma pesquisa pode mostrar **"Todas as cartas · filtros opcionais"**, apesar da coleção já estar filtrada. Ao encontrar zero resultados, o bloco \`#none\` só mostra orientação textual, sem um comando para recuperar as 246 cartas.

## V205 — melhoria incremental
- O painel \`Filtrar e ordenar\` passa a mostrar uma contagem de resultados e os critérios ativos, incluindo texto da busca e ordenação.
- Um botão "Limpar filtros" só aparece na linha de contagem quando há critérios ativos; **não acrescenta altura à primeira tela vazia**.
- Em busca sem resultado, o estado vazio mantém o texto existente e ganha uma ação "Mostrar todas as 246 cartas".
- Reset utiliza os mesmos botões \`TODOS/TODAS\`, o select original e o evento \`input\` do campo de busca, portanto o filtro oficial segue sendo executado por \`premium.js\`; não se duplicam motores.
- A busca, IDs, fichas, PP, pinturas originais, ímpetos, habilidades, progresso, backups e atualizadores permanecem inalterados.
- CSS restrito a \`body[data-page="catalog"]\`; CSS/JS comuns a Electron e Capacitor entram no cache offline e no fingerprint.

## Testes de aceite
1. A home sem filtros não ganha nenhuma nova faixa ou botão visível, mantendo a primeira carta na primeira dobra.
2. Ao digitar um nome existente, contagem e resumo deixam de informar "Todas as cartas".
3. Busca inexistente: \`#all-count=0\`, cartão vazio e botão de recuperar elenco disponíveis.
4. Clicar no reset restaura \`#all-count=246\`, busca vazia, posição TODOS, raridade TODAS, ordenação original e remove o indicador de critérios ativos.
5. Validar tudo em Chromium 320/360/390/412, 1366/1920 px, mantendo os controles originais da V203 e cartões da V204.
6. CI Windows/Android GREEN, assinatura persistente e release oficial somente depois da validação.

**Limitações:** comparação pixel a pixel com o mockup premium continua pendente da imagem. Capturas no navegador não são homologação do APK físico.
