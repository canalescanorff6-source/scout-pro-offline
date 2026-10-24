# V349 — Ímpetos informados em múltiplas linhas e avisos consistentes

## Lacuna reproduzível
Na página de Outros Elencos, `#friend-card-booster` é uma textarea que permite
registrar vários ímpetos por linhas ou ponto e vírgula. Até a V348,
`reviewBoosterRanking()` comparava um ranking inteiro com
`"Regista; Técnica\\nForça"` como um só nome. Nenhuma dessas candidatas
era filtrada como já informada. O editor também advertia colisão com
ímpeto fixo, mas não consultava os ímpetos adicionais informados.

## Correção V349
- `reviewBoosterRanking` usa a função documental `skillList` já
  consolidada (separadores `;`, vírgulas e novas linhas) para construir
  conjuntos de nomes registrados como fixos/adicionais da mesma carta.
  A comparação usa apenas a grafia/acento normalizados; não inventa
  aliases de ímpetos ou compatibilidades entre versões.
- `auditEquipmentSelection` aceita o novo argumento opcional
  `informedBooster`, mantendo compatibilidade com chamadas legadas.
  O campo `informedBoosterSame` indica sobreposição documental, sem
  transformar essa coincidência em proibição mecânica no eFootball.
- `reviewDraftReadiness` e `save` recebem a mesma evidência. Avisos
  ao vivo, salvamento e resumo Premium usam o cadastro da edição.
  Rascunhos antigos continuam íntegros e legíveis.
- Novas recomendações filtradas nunca equipam ímpetos. Um nome salvo
  continua preservado na seleção histórica; a comparação apenas alerta.
- Minhas Cartas e Outros Elencos compartilham a interface e continuam
  isolados por carta, proprietário, edição, função, estilo e técnico.

## Testes e aceitação
- `scripts/test-booster-inventory-v349.cjs`, integrado a `npm run check`:
  múltiplos separadores, ímpetos fixos, adicional informado, motivo
  contextual, permissividade consultiva, histórico, separação das
  coleções e contagem imutável das 246 cartas.
- `scripts/qa-booster-inventory-v349.py` no Chromium Android/Windows:
  API real no navegador, formulário de Outros Elencos, painel e editor
  carregados, sem overflow.
- Manter os testes existentes V335–V348 e compilações de teste. A V346
  agora exige que a guarda de persistência reconheça a evidência
  adicional opcional.
- Não editar catálogo, builds aprovadas, metadados de jogador, PP,
  atualizador ou assinatura. Nenhum teste de navegador valida
  equipamento real nem partida jogada.

## Publicação
Candidato V349 sobre a release oficial v1.1.988. Abrir PR e validar
CI, QA e compilações. Não mesclar na `main` nem publicar APK/EXE
sem uma nova autorização explícita do proprietário.
