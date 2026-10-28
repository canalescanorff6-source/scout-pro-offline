# Correção das edições CAP153 e CAP196

Baseline remota: a1cb6d665ae20f0ae651d4cb5a44724a828e97fc (PR292).
Autorização: usuário pediu procurar e colocar os IDs corretos, revisar progresso e publicar atualização.

1. Registrar comparação de arte e metadados públicos. Arquivar catálogo e JSONs anteriores; preservar todas as imagens. CAP153: Summer Transfer 14Aug25, 105780749692770; CAP196: Advertisement Reward 24Apr25, 105754711432614.
2. Corrigir identidade, nativas, ímpeto fixo, máximo público e orçamento. Treinos antigos ficam no arquivo histórico; propostas são experimentais e não treino atual. O nível42 de Savinho vem do eFootballEdge, pois o outro catálogo não informa nível válido.
3. Separar novas gravações de treino/OVR por Card ID, manter leitura compatível das antigas e acesso ao histórico sem aplicar comprovantes de outra edição.
4. Reconciliar verificações de integridade usando snapshots exatos das duas cartas, sem alterar hashes das imagens ou esconder diferenças nas demais244. Executar testes locais e CI visual/builds, revisão independente, commit/PR, integrar e publicar conforme autorização existente.

Também incluir as correções já testadas de Jogo Aéreo para goleiros e os quatro máximos de OVR declarados, sem convertê-los em nível ou confirmação do treino atual.

## Registro

- 28/10: retomada; release1166 concluída. Correção V377 ainda não publicada.
- Decisão: a referência pública de nível não é prova da conta. Orçamento e treino antigos da edição errada ficam somente no histórico. Nenhum equipamento é migrado ou instalado.
- Preflight: referências, arquivos HTML e contexto compartilham a identidade; corrigir todos antes de regenerar. Não atualizar a branch local antiga nem tocar no índice Git compartilhado; branch remota nova via conector.

- Execução: 280/280 verificações locais completas aprovadas. Revisão independente encontrou histórico de partidas V67 inacessível: corrigido leitor read-only das chaves exatas V67:test e V80:matches, com teste RED→GREEN nas duas CAPs e exclusão das cartas irmãs. Nova bateria completa em execução antes do commit.

- CI: 280 checks e builds passaram, mas QA detectou gravação automática real pelo evento training-edit-v218 mode switch. Correção: listener apenas visualiza eventos diferentes de save; teste do listener real RED→GREEN. Nova bateria281 completa e QA de ausência de gravação. Diagnóstico publicado temporariamente em árvore incompleta do PR; corrigido sem mudar main, PR conferido de novo sem remoções.
