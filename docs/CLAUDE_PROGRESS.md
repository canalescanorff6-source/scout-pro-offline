# Craque Tático — continuidade

## 2026-10-30 · editor individual implementado e validado
- Base: `ef0dc5d` (`origin/main`); branch `feat/individual-card-info-editor`.
- Commit da implementação: `333c4ab`. PR da branch: https://github.com/canalescanorff6-source/scout-pro-offline/compare/main...feat/individual-card-info-editor
- Catálogo consultado: 246 originais + 15 próprias = 261 cartas.
- Checkout antigo `C:/Users/Marques/Projetos/scout-pro-offline`, branch `melhorias-claude`, preservado com três arquivos não rastreados; nenhum commit local exclusivo da main.
- Objetivo: botão **EDITAR INFORMAÇÕES DA CARTA** ao final de cada ficha, quatro campos preenchidos, persistência local, restauração e atualização das fichas.
- Decisão: estender módulo de conferência V379 com registro local separado por identidade; manter conferências, rascunhos, equipamentos e treinos aprovados intactos. Usar eventos existentes para atualizar as telas. Overall máximo permanece informativo e separado do calculado.
- Implementado: formulário ao fim da ficha original e do diálogo das próprias; nível/PP/raridade/Overall máximo, restauração persistente, catálogo, ficha principal e laboratório atualizados por evento. Novos registros são vinculados à identidade exata e entram no backup V226 já existente.
- Integridade: nenhum JSON canônico, imagem, Card ID, edição, ficha aprovada ou recibo foi modificado. Orçamento menor mantém o treino salvo e indica excesso; nível/PP incoerentes bloqueiam cálculos até corrigir. Overall máximo nunca alimenta a otimização.
- Arquivos: módulo V379, contexto/UI/CSS V376, motores/UI V311, próprias V364, laboratório; cache PWA e impressão do bundle; testes unitário/QA, CI visual e executor sequencial Windows; CLAUDE.md e este checkpoint.
- Testes: `npm run check:sequential` PASS (285 comandos, a mesma sequência do `check`); `qa-card-info-editor.py` PASS em 320×700, 390×844 e 1366×768, originais e próprias, catálogo, atualização imediata, persistência, restauração, conflito PP e laboratório; `qa-main-sheet-v378.py` e `qa-rating-v376.py` PASS nas três telas. Após ajustes finais: repetidos QA do editor, sintaxe, fingerprint V338, editor, V379, contexto/UI V376 e laboratório V377, todos PASS.
- Baseline Windows: `npm run check` excede limite de linha antes dos testes. Novo `npm run check:sequential` executa todos os mesmos comandos em subprocessos, sem afrouxar verificações. O normalizador do teste altera data-search do index de forma não idempotente; esse efeito gerado foi revertido, fora do escopo.
- Revisão: revisão local do diff, restauração de estado, corrupção/erro de gravação, identidade, treino acima do orçamento e isolamento dos rascunhos. Sem agentes paralelos.
- Pendências: consultar CI após publicação; builds nativos e instalação física Android/Windows não executados localmente. Nenhum APK/EXE ou release foi declarado validado/publicado.
- Próxima ação exata: verificar CI do PR desta branch e revisão humana antes de merge. Depois consultar auditorias existentes e selecionar 10–15 IDs ainda com pendências, registrando os IDs sem repetir a auditoria já feita.
- Auditoria extensa e pesquisa competitiva ficam para a próxima sessão; reaproveitar `web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json`, `web/SCOUT_V221_EVIDENCE_INDEX.json` e documentação de auditoria existente.
