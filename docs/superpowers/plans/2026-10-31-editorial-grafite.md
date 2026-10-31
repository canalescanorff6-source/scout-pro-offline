# Editorial grafite e vinho — implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar o visual editorial grafite suave/vinho aprovado ao frontend offline compartilhado por Android e Windows.
**Architecture:** Consolidar os estilos na folha global já existente `craque-app-shell-v362.css`, preservando seletores estruturais, DOM funcional e carregadores. Compartilhar tokens com ficha principal, cartas próprias e diálogos; nenhuma nova camada de tema ou dependência remota.
**Tech Stack:** CSS, JavaScript existente, Electron/Capacitor, Node e Playwright.
**Spec:** `docs/CLAUDE_NEXT_PHASE.md` e aprovação da prévia grafite/vinho no chat.

## Global Constraints
- Preservar logo, artes, IDs, PP, fichas, posições, equipamentos, armazenamento, backups e atualização.
- Grafite suave `#28282c`, superfície `#333236`, texto `#f2eded`, vinho claro de destaque `#dfa6b5`, preenchimento vinho `#78394b`, texto sobre vinho `#fff4f6`.
- Sem gradientes decorativos, brilho ou reescrita de controladores. Manter cores de estado que expressem erro/sucesso e indicadores táticos.
- Funcionar offline em 320/390/1366 px. Esta entrega é UI; cartas competitivas e 500 formações pertencem às próximas etapas.
- Produzir PR e verificar CI. Aprovação visual não é autorização específica para nova release/instalação; preparar a alteração revisável antes dessa decisão.

## Review Focus
- Fichas carregadas depois do shell e diálogos dinâmicos precisam manter o mesmo tema.
- Texto de ação selecionada precisa de contraste, inclusive nos cinco estilos de técnico.
- Campos, foco, Mais, backup e atualização devem continuar acessíveis por teclado/toque.
- Nomes e edições longos e formulários abertos não podem criar overflow em 320 px.
- Imagens e cores funcionais de erro/posição não podem receber filtro global ou perder significado.

### Task 1: consolidar apresentação global
**Files:** `web/craque-app-shell-v362.css`, `web/craque-app-shell-v362.js`; QA `scripts/qa-editorial-theme.py`.
**Interfaces:** consumidores existentes continuam usando `.ct362-design` e seletores atuais; tokens `--ct362-*` passam a representar a paleta editorial.
- [x] Escrever e executar QA de cores/contraste nas rotas e falhar no azul/dourado atual.
- [x] Substituir cores e tipografia na folha existente; consolidar superfícies, ações, navegação, fichas/diálogos e campo. Manter layout responsivo e semântica dos estados.
- [x] Conferir três larguras, imagens reais, busca, detalhes, menu Mais e formulários. Inspecionar capturas.

### Task 2: integração e entrega
**Files:** QA históricos com cores antigas fixadas, `.github/workflows/visual-qa.yml`, `web/sw.js`, metadata gerada por `scripts/stamp-bundle-v189.cjs`, `docs/CLAUDE_PROGRESS.md`.
**Interfaces:** mesmos nomes/cache/fontes do bundle; workflow executa QA editorial adicional, testes de comportamento históricos preservados.
- [x] Atualizar expectativas visuais substituídas pelo design aprovado, sem remover verificações funcionais.
- [x] Executar QA novo, QA relevante histórico e `npm run check:sequential`; conferir diff e integridade dos dados/artes.
- [x] Atualizar cache/fingerprint pelo mecanismo existente, criar commit/PR e verificar CI disponível.
- [x] Registrar evidências, limitações físicas Android/Electron e próxima ação, declarando somente o que foi verificado.

Autorização posterior: mantenedor aprovou integrar/publicar; PR #299 integrado e v1.1.1188 publicada. Windows instalado/reaberto com 57 registros preservados; Android assinado e validado como pacote/transição, sem aparelho conectado. Evidências em CLAUDE_PROGRESS; esta implementação está concluída.
