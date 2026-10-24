# V350 — Motivos de habilidades por alias V162 e ímpetos explicados sem herdar evidência excluída

## Problema identificado
O motor V345 já reconhece que `One-touch Pass` e `Passe de primeira`
são a mesma habilidade segundo o dicionário documental V162. Porém,
`V327.explainEquipment` buscava justificativas apenas por grafia/
acento. Uma skill histórica em inglês não recebia a explicação tática
da proposta atual em PT-BR, mesmo quando o alias estava documentado.

Também havia uma inconsistência entre a lista de ímpetos novos
filtrada pelas V348/V349 e o painel de justificativas: ele continuava
consultando o ranking original, que ainda continha nomes iguais ao
ímpeto fixo ou ao adicional já informado.

## Correção
- `explainEquipment(summary, recommendations, boosterRanking, skillKeyFor)`
  aceita opcionalmente o resolvedor `keyFor` oficial do V162.
- Nomes idênticos normalizados têm prioridade. Se não houver correspondência,
  somente um alias documentado do V162 permite associar o motivo.
  Uma skill desconhecida ou ausente do dicionário continua com
  `motivo_pendente`: não há tradução, sinergia ou prova inventada.
- O resultado indica `matchedBy` (`grafia_normalizada`,
  `alias_v162_documentado` ou `pendente`) e deixa claro que o
  motivo vem **do cenário atual**, não comprova a build salva.
- A ficha Premium envia a `skillKeyFor` existente e utiliza como
  ranking justificativo somente `boosterReview.primaryInfo` e
  `boosterReview.alternatives`. Um rascunho legado com ímpeto que
  coincide com nome fixo/adicional conserva a seleção, mas NÃO recebe
  a justificativa de uma candidata agora excluída.
- A API mantém compatibilidade retroativa com três argumentos e
  continua pura, sem modificar cartas, treino, equipamentos ou histórico.

## Testes
- `scripts/test-contextual-explanation-alias-v350.cjs`:
  alias PT-BR/EN, preferência por correspondência literal, nomes
  desconhecidos, motivos distintos quando a posição muda, ímpeto
  filtrado, seleção histórica intacta, armazenamento não alterado,
  isolamento Minhas Cartas/Outros Elencos e 246 originais.
- Atualizado o teste V336 para exigir o ranking filtrado e o fallback
  apenas quando o filtro não existir.
- `scripts/qa-contextual-explanation-v350.py`: Chromium real nas
  resoluções Android 390×844 e Windows 1366×768; painel Premium aberto,
  API documental disponível e sem overflow.
- `npm run check`, QA visual e builds de teste Android/Windows devem
  passar no commit final antes de marcar o PR como pronto para revisão.

## Limitações e regras permanentes
Os motivos continuam hipóteses do próprio motor, sem comprovação em
partida e sem atribuição de recomendações a vídeos não verificados de
Rentão ou Blackjhon. Não trocar Card IDs, PP, habilidades nativas,
builds aprovadas, slots, assinaturas, atualizador ou versões oficiais.
Base cumulativa V349; não integrar `main` nem publicar APK/Windows
sem autorização explícita para uma nova atualização.
