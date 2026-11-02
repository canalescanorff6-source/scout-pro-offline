# Meu elenco por conta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Catálogo e fichas equivalentes nas duas contas, com cadastro/importação de cartas novas isolados por conta.
**Architecture:** Adaptar o catálogo existente antes de premium.js; estender o armazenamento V382 de modo compatível; ficha comum para cartas privadas reutiliza V382/V383. Preservar fichas canônicas existentes.
**Tech Stack:** JavaScript/CSS/HTML offline, Electron, Capacitor, Node assert, Playwright.
**Spec:** docs/superpowers/specs/2026-11-02-account-roster-design.md

## Global Constraints
Preservar246originais+15próprias, evidências, CardIDs, PP, assinaturas, atualizadores e dados privados. Sem OCR, estatísticas inventadas, dados privados no pacote ou dependências novas. Contas são independentes e os links devem manter a conta.

## Review Focus
- Backups anteriores sem primary devem abrir sem escrita automática; incluir teste de leitura legada.
- Mesmo id nas duas contas não pode compartilhar ficha ou equipamento; testar revisões isoladas.
- Arquivo para outra conta/conflito não pode causar importação parcial; testar bytes anteriores.
- Secundária vazia não pode exibir cartas, imagens ou ferramentas de acervo da Principal; testar DOM/links.
- Mudança de edição invalida confirmações e torna revisões antigas somente históricas; testar assinatura de contexto.

### Task 1: armazenamento e fichas privadas
**Files:** web/craque-accounts-v382.js, web/craque-account-library-v385.js; scripts/test-account-library-v385.cjs.
**Interfaces:** A.read/save/roster compatíveis; Library.saveCard(store,account,raw), previewImport(store,account,data), importCards(store,account,data), individualContext(card,options), saveSheet(store,account,card,context,review), sheets(store,account,card).
- [ ] Escrever teste: legado sem primary não escreve; adicionar Principal/Secundária preserva legado; arquivo errado/conflitos recusados; revisão por conta/identidade; quota preserva bytes.
- [ ] Executar teste e observar RED.
- [ ] Implementar extensão opcional e módulo puro, sem alterar o motor de PP.
- [ ] Testes novos e V382/V383 GREEN; registrar resultado.

### Task 2: catálogo e ficha comuns
**Files:** web/craque-account-catalog-v385.js/css, web/ficha-da-conta-v385.html, web/craque-account-sheet-v385.js, index.html, premium.js, ct364-owned-main.js, craque-rating-ui-v376.js, craque-account-ui-v382.js, craque-team-plan-v382.js/html.
**Interfaces:** ?account=primary|secondary, ficha?id=<localid>&account=...; eventos de dados existentes; conta na importação e editor. Bibliotecas privadas entram no A.roster, que alimenta também o planejador.
- [ ] Escrever QA navegável: mesmo catálogo em ambas; importação e confirmação do destino; abrir ficha; gerar treino válido, salvar/reabrir, trocar contas; tela vazia e imagem local.
- [ ] Executar e observar RED antes da UI.
- [ ] Implementar adaptador síncrono antes de premium.js, registros de filtros, guarda contra injeção de acervo legado na Secundária, ficha e formulários comuns; manter fichas legadas e ferramentas compartilhadas.
- [ ] QA320/390/1366px, sem transbordamento/errosJS; backup/restauração e offline; regressões V378/V381/V382/V383/V384.

### Task 3: integração e distribuição
**Files:** scripts/stamp-bundle-v189.cjs, web/sw.js, scripts/verify-android-premium-payload-v356.py, package.json, QA workflow, README.md, CLAUDE.md, docs/CLAUDE_PROGRESS.md.
- [ ] Teste exige novos arquivos em cache/fingerprint/verificadorAPK; observar RED.
- [ ] Registrar arquivos e nova chave de cache; repetir testes completos e QA pertinente.
- [ ] Revisão independente final somente leitura; resolver achados com regressões.
- [ ] PR, CI Android/Windows/visual; publicação e atualização autorizadas no contexto da entrega, com backup e conferência de assinatura/paridade. Sem alegar Android físico sem aparelho.

## Ledger
Base26386d6; workspace isolado existente, branchfeat/unified-account-roster-v385. Checkpoint V384 não commitado preservado. Inspeção nativa confirmou Principal1278; Secundária aponta ao planejador por construção. Ruling: reutilizar index em vez de copiar telas — atende à igualdade solicitada e evita duplicação de catálogo.

- Task1: complete. Biblioteca/legado/importação/PP/revisões/quota RED→GREEN.
- Task2: complete. Catálogo/editor/plano/fichas em ambas as contas; QA5larguras e regressões V382/V383/V384. Revisão independente corrigida, incluindo fixo2/fontes e navegação Time.
- Task3: CI em andamento naPR312.304checks PASS; builds Android/Windows e fluidez PASS. Nenhuma publicaçãoV385 ainda.
- Ruling: o marcador editorial deve permanecer visível; margens pontuais não estabilizaram a primeira dobra em todos os ambientes. Agrupar título e selo numa linha flex, movendo os nós existentes, libera uma linha e mantém os controles. Hipótese de rótulo de versão longo não reproduziu sozinha a diferença; QA agora cobre também essa variante explicitamente. Sem relaxar o limite525px da primeira dobra.
- CI: corrigida espera assíncrona da rejeição de arquivo para outra conta, reproduzida com40msde leitura. Casos novos passam primeiro no workflow para identificar regressões cedo; todos os QA anteriores mantidos.
