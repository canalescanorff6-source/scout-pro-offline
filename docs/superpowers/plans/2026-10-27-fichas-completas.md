# Fichas completas por edição, função e estilo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar fichas utilizáveis das 261 cartas com treino proposto, habilidades adicionais e ímpetos justificados, sem modificar formações.

**Architecture:** Ampliar a revisão compartilhada existente V374, mantendo os motores V251/V233/V162/V103 e os históricos independentes. A mesma ficha alimenta a tela, cópia em texto e um pacote de consulta das 261 edições. Não criar outro otimizador com pesos arbitrários nem alterar o catálogo original.

**Tech Stack:** JavaScript offline, Node, HTML/CSS existentes, CI GitHub.

**Spec:** Pedido explícito do usuário em 2026-10-27: novas fichas, habilidades adicionais e ímpetos; excluir o trabalho externo de formações. Reutilizar a posição e os cinco estilos existentes; dados incompletos permanecem pendentes.

## Global Constraints
- Preservar identidades, imagens, PP de origem, cartas originais e equipamentos reais.
- Proposta consultiva não comprova atributos finais, ativação de estilo, familiaridade ou melhora online.
- Exibir até cinco candidatas ausentes das listas nativa/equipada; vagas só quando comprovadas.
- Ímpeto extra depende de slot elegível da edição; alternativas não equivalem a equipamentos.
- Sem Computer Use: o usuário interrompeu a sessão; validação remota existente permanece permitida.
- Sem merge/release sem autorização explícita; preservar worktree existente e alterações geradas.

## Review Focus
- Identidade exata na cópia: duas cartas Neymar não podem produzir texto sem edição/CAP.
- Cinco candidatas visíveis quando disponíveis; não truncar para três.
- PP de uma adição pendente não devem ser substituídos pelo nível simulado.
- Motivos do ímpeto e das habilidades devem refletir o contexto já calculado.
- Cópia com falha deve apresentar texto selecionável, sem salvar revisão ou equipamentos.

### Task 1: Ficha compartilhada completa
**Files:** `web/craque-friends-training-v228.js`, `web/craque-positional-ui-v311.js`, `web/craque-positional-v311.css`, `scripts/test-function-sheet-v375.cjs`.
**Interfaces:** `functionReview(card,result,currentLevels,deps)` preservada; adicionar campos de identidade, custos por grupo, informações de decisão das habilidades e ímpetos. Exportar `functionSheetText(review)` sem acesso a armazenamento.
- [ ] Escrever teste falhando para identidade, custo progressivo, motivos completos, cinco candidatas e texto de exportação; repetir os 1.305 cenários e dois exemplos adaptados.
- [ ] Implementar os campos reutilizando resultados reais; renderizar todas as candidatas, ímpeto principal e alternativas, tabela de treino e botão Copiar ficha com contingência selecionável.
- [ ] Conferir testes focados e ausência de gravação ao consultar/copiar.

### Task 2: Pacote concreto e integração
**Files:** `scripts/export-function-sheets-v375.cjs`, `package.json`, documentação desta revisão.
**Interfaces:** Gerador Node usa os mesmos adaptadores e `functionSheetText`; produz JSON/Markdown local fora do catálogo de origem.
- [ ] Gerar 261 × 5 fichas nativas mais Neymar #090 SA e Maldini #010 ZG nos cinco estilos; declarar PP pendentes das 15 adições.
- [ ] Rodar check completo por componentes no Windows, revisão independente e CI visual/builds.
- [ ] Atualizar PR 290 e entregar resultados reais, com limitações e autorização final apenas para merge/publicação.

## Decisions
- Pedido suficientemente específico; seguir a arquitetura atual e criar propostas separadas, sem substituir treinos aprovados.
- A entrega melhora a apresentação e acesso às fichas calculadas; não atribuir novas provas de meta ou novas fórmulas numéricas inexistentes.
