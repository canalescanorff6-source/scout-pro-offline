# Scout PRO V194 — guia competitivo visível na ficha

## Objetivo
Encerrar um problema visual e funcional do modo compacto: o foco da build e a orientação *Como jogar* já existiam em cada arquivo `web/fichas/*.html`, mas estavam escondidos entre relatórios técnicos. A ficha principal V188 já mostra treino, ímpetos, cinco habilidades (V162) e biotipo (V189/V192).

## Implementação segura
- Reposiciona **o próprio elemento original** `#foco .focus-banner` para um bloco `Foco da build` antes do treino.
- Reposiciona **o próprio elemento original** `#jogar .gameplay-tip` para `Como jogar com esta carta` após o biotipo e antes de análises avançadas.
- Reaproveita o texto exato existente em cada carta, sem criar recomendação, atributo, Player ID, resultado de partida nem conteúdo fictício.
- Os relatórios extensos da seção `#jogar` continuam no modo avançado; os links da navegação lateral passam a apontar aos blocos efetivamente visíveis.
- Se uma edição não tiver orientação cadastrada, o aplicativo não fabrica texto nem mostra um bloco vazio.
- As alterações usam os arquivos compartilhados de `web/` (Capacitor Android / Electron Windows). Cache offline e fingerprint atualizados.

## Conferência automatizada
`scripts/test-ui-v194.cjs` protege a movimentação sem duplicação, links, fallback, idempotência, layout responsivo, preservação das 246 fichas e existência do conteúdo original nas páginas. Rodar `npm run check` antes do merge. O workflow só publica quando as verificações e os dois builds estiverem verdes.

## Pendências reais para dizer "idêntico"
1. Comparar prints do aplicativo instalado com o **mockup final aprovado**, ainda não recuperado em formato visual.
2. Testar rolagem, contraste, toque e margens no aparelho Android.
3. Inspecionar composição de duas colunas, imagens e fontes nas janelas Windows.
4. Confirmar instalação de atualização sobre APK já assinado e preservação de dados locais por backup.

CI verde prova integridade técnica e empacotamento, **não** equivalência pixel a pixel ou validação física.
