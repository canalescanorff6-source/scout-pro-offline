# Laboratório competitivo V289 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** melhorar decisões de treino, adicionais e ímpetos sem substituir os dados aprovados das 246 cartas.

**Architecture:** estender os módulos `skills-booster-v162.js`, `booster-engine-v103.js` e `craque-ficha-individual-v251.js`; componentes puros com retornos consultivos, UI sob demanda e as mesmas fontes offline.

**Tech Stack:** JavaScript UMD, Node assert, HTML/CSS, Electron, Capacitor, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-21-competitive-lab-design.md`

## Global Constraints

- 246 cartas; identidades, imagens, PP e builds originais imutáveis.
- Cinco estilos existentes; não usar Overall nem inventar validação de criadores.
- Nenhum merge em main ou release nesta execução.
- Confirmado, calculado, estimado e pendente permanecem distintos.

## Review Focus

- Confirmação inválida após editar lista, nativas, CAP, Card ID ou edição: não influenciar complementaridade.
- Lista conflitante e skill de GO em linha: não provar vagas.
- Zero PP, orçamento desconhecido e vetor incompatível: sem alternativa inválida.
- Retorno de outra função/tática: sem herdar recomendação ou gravar build.
- Comparator aberto em 320 px e offline: sem overflow ou acesso externo necessário.

### Task 1: adicionais e prova de contexto

**Files:** `web/skills-booster-v162.js`, `scripts/test-equipment-context-v289.cjs`.

**Interfaces:** manter `evaluate/checkedEquipment`; adicionar diagnóstico de elegibilidade e evidência de complementaridade por adicional conferida.

- [x] Escrever reproduções de incompatibilidade GO/linha, alias especial e contexto conferido; executar e observar falhas.
- [x] Corrigir validação e interpretação; adicionar explicações sem equipar nada.
- [x] Executar testes focados e regressões de adicionais; commit rastreável.

### Task 2: ímpetos com o mesmo contexto

**Files:** `web/booster-engine-v103.js`, `web/skills-booster-v162.js`, teste da Task 1.

**Interfaces:** contexto derivado somente de `checkedEquipment`; transportar lista e prova exatas até ranking sem ocupar slot presumido.

- [x] Testar prova adulterada e diferença entre adicional comprovada e informação parcial.
- [x] Implementar contribuição limitada, separada das nativas e dos atributos-base.
- [x] Verificar cinco estilos e zero aplicação automática; commit.

### Task 3: alternativas de treinamento

**Files:** `web/craque-ficha-individual-v251.js`, `scripts/test-training-frontier-v289.cjs`.

**Interfaces:** `trainingFrontier(weights, role, pp, baseline)` retorna candidatos viáveis, eixos, fronteira limitada e trocas em PP.

- [x] Testar ausência da API, custo exato, GO/linha, 0 PP, orçamento inválido, não mutação e Pareto.
- [x] Implementar busca determinística limitada reaproveitando `allocate`, sem alterar proposta principal.
- [x] Comparar as 85 cartas com PP documentados nos cinco estilos; demais ficam pendentes.
- [x] Testar e commit.

### Task 4: interface, auditoria e entrega

**Files:** ficha/CSS existente, QA de navegador, teste do acervo, `package.json`, `web/sw.js`, documentação final.

**Interfaces:** detalhes de comparação calculados somente ao abrir; explicações usam os resultados puros das Tasks 1–3.

- [ ] Testar interação de comparação, adicionais confirmadas e troca de tática/posição.
- [ ] Implementar comparador recolhível com tabela de custo/oportunidade e explicações de skills.
- [ ] Executar suite completa, QA visual, offline/persistência, auditoria e preservação; restaurar somente carimbos/HTML gerados pelos checks.
- [ ] Revisar branch, preparar PR e acompanhar CI/builds; documentar limitações reais sem publicar release.
