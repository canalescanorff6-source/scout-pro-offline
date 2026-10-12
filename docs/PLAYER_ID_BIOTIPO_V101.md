# SCOUT PRO V101 — Player ID, estatura, biotipo e animações
Implementação inicial auditável em Windows Electron, Android Capacitor e web offline, compartilhando os mesmos arquivos de interface.
## Fontes e confiança
- **Konami v6.0.0**: https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00 — movimentações, seleção de animações, dribles, consciência de linhas de passe, estilos de jogo ofensivo e defensivo. Não fornece nesta página um identificador numérico público universal para "Player ID" comportamental.
- **PESDB eFootball 2027**: https://pesdb.net/efootball/players/ — banco de dados **terceiro, não afiliado à KONAMI**. Possui altura, peso, pé dominante, perna ruim, parâmetros físicos, comprimentos e métricas *derivadas*, com páginas individualizadas por edição. Exige correspondência exata do Card ID da carta possuída.
- **Player ID ≠ Card ID**. Card ID identifica edição; comportamento de animações, sensação de corpo e resposta no controle não deve receber uma pontuação secreta ou prefixos pseudo-oficiais.
- A informação **"comprimento da perna"** está em escala de modelo no PESDB. "Alcance da perna" e "largura de colisão" são métricas derivadas calculadas/publicadas no PESDB, não distâncias comprovadas de tackle nem garantia de superioridade competitiva.
- Fonte externa verificada é evidência **documental**; a avaliação da carta como meta exige ensaio prático controlado.
## Estado do lote inicial
- 246 cartas do catálogo original V98 preservadas. 246 imagens e fichas originais continuam intactas.
- 15 cartas com dados físicos da edição correspondente ao Card ID, consultadas em 12/10/2026: #002, #010, #011, #025, #033, #039, #078, #095, #104, #106, #127, #143, #145, #147, #150.
- As outras **231** continuam com dados físicos incompletos, sem misturar versões ou inferir tamanho a partir de foto.
- Os 14 atributos-base completos existentes e os treinos antigos seguem inalterados; biometria/modelo não é treino nem PP.
## Uso
1. Abra **Player ID e Biotipo** pelo catálogo ou pela auditoria tática.
2. Escolha uma das 246 cartas. O sistema confere *número interno + Card ID* antes de utilizar uma fonte.
3. Consulte dados físicos, fonte, versão e pé. Se necessário, registre os dados de um print ou fonte confirmada e indique a origem. Entradas pessoais não alteram a fonte externa nem o treino.
4. Registre o comportamento observado de giro, primeiro toque, aceleração, proteção e cobertura após cada partida em contexto equivalente.
5. Com cinco observações, reavalie a hipótese comparando cartas na mesma função, técnico, formação e adversários similares; cinco partidas **não provam causalidade**.
6. **Meus dados** na barra inferior faz backup de todas as chaves `scoutpro:`, inclusive as V101. Exporte no Windows e importe no Android, ou vice-versa. Não existe sincronização automática. A sincronização de conteúdo do APK depende de uma **release oficial Android** publicada e instalada; alterar o GitHub não atualiza um APK antigo automaticamente.
## Proteção
- Não calcular score/"meta" pelo Overall ou só pelo peso e altura.
- Não sobrescrever Card ID, arte, habilidades, ímpetos, PP nem nenhuma das 246 fichas.
- Valores desconhecidos permanecem **pendentes** com motivo.
- Conservar evidência e provenance; nunca afirmar Player ID oculto conhecido por "leitura" de screenshots.
- Build Windows e APK Android devem passar na CI completa antes da integração na `main`.
## Testes
`node scripts/test-player-model-v101.cjs` e `npm run check`.
