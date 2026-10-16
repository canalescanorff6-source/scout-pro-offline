# Scout PRO V203 — A biblioteca precisa aparecer na primeira tela

## Referência e diagnóstico
A imagem exata do mockup premium aprovado permanece indisponível. A captura **V202** comprovou que, mesmo com o catálogo começando em Y≈412 px no Android 390, as fichas dos jogadores continuavam **abaixo da primeira dobra**, pois os filtros de 12 posições, cinco raridades, ordenação e controle das animações consumiam várias linhas antes do primeiro card.

Nos screenshots do Windows 1366×768, a home ficou mais compacta, mas os controles de filtro ainda impediam ver uma carta no viewport inicial.

## Mudanças V203
- **Uma superfície premium "Filtrar e ordenar"**, recolhida por padrão, com o estado atual acessível num resumo ("Todas as cartas", ou "CA · ÉPICA · Nome A–Z").
- Ao expandir, os **mesmos elementos e listeners** `#sort`, `#roles`, `#rarities` e `.scout-motion-controls` permanecem disponíveis. Nenhuma opção é removida e nenhum filtro é duplicado.
- Busca original do catálogo continua na hero como na V192/V202. Botões de atualizar, favoritos, formação, ímpeto e backup continuam onde estavam.
- Filtros de posição/raridade atuam imediatamente nos dados reais. O resumo confirma as escolhas, mesmo após fechar o painel.
- Em deep links com `?role=` e `?style=`, o painel abre para tornar o filtro contextual explícito.
- Layout compacto e acessível em 320/360/390/412 e 1366/1920 px, com alvos ≥42 px, foco visível, contraste e movimento reduzido.

## QA
- `scripts/test-ui-v203.cjs` valida os 246 cartões, IDs/atalhos/navegação, presença e originalidade dos filtros, cache e bundle.
- `scripts/qa-visual-v195.py` mede o topo do **primeiro cartão visível**, não só o início do `#catalogo`. Exige que a carta apareça na primeira tela com margem mínima, e abre/fecha o filtro e testa CA (44 cartas), raridade ÉPICA, ordenação A–Z, reset para as 246 cartas, controle de animação acessível e ausência de overflow.
- Capturas de catálogo e filtros expandidos geradas nas seis larguras e aprovadas antes de merge.
- As 246 fichas e imagens, PP, builds, ímpetos V200, ilustrações de treino V201, atualizadores e backups permanecem intactos.
- O teste Chromium não é teste físico do APK nem prova correspondência pixel a pixel com uma referência ausente.

## Próxima etapa para igualdade completa
Com a imagem original do layout lado a lado, comparar espaçamentos, proporções de cartões, tipos, superfícies e animações, e homologar as telas reais no Android/Windows instalados. Não declarar "100% idêntico" sem esse confronto.
