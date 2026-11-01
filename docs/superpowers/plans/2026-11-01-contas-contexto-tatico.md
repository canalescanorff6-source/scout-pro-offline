# Contas e contexto tático — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar aqui, tarefa a tarefa, com revisão independente final. Passos usam checkboxes. O proprietário aprovou o desenho e autorizou implementar; não pedir novamente escolha de execução ou aprovação do plano.

**Goal:** entregar Principal/Secundária independentes e plano do time com técnico, estilo, formação, fases, instruções, fichas, adicionais e ímpetos coerentes.

**Architecture:** coordenador V382 sobre motores JS existentes; novo armazenamento da Secundária e de contextos sem regravar a Principal. Interface integrada ao shell grafite/vinho, com página compartilhada de plano e acesso no catálogo/fichas. Inventário privado importável, sem dados da conta no bundle público.

**Tech Stack:** JavaScript UMD offline, HTML/CSS existentes, Node para testes/geração; Playwright para QA descartável. Sem API paga ou dependência nova de produto.

**Spec:** ../specs/2026-11-01-contas-contexto-tatico-design.md — aprovada em01/11/2026.

## Global Constraints

- Preservar 246 originais, 15 próprias, IDs/artes/edições, equipamento e histórico. Instâncias entre contas não compartilham estado mutável.
- Posse sem PTE/PTD/MLE/MLD. Seis estilos, Sobreposição com identidade própria; nenhum bônus inventado.
- Fatos observados/relatados, cálculo e hipótese tática separados. Sem promessa de rendimento universal online.
- Dados novos scoutpro:; restauração antiga seleciona Principal e invalida apenas seleções dependentes, sem apagar Secundária/histórico.
- Formações: grade10, distância mínima10, equivalência até5, espelhos equivalentes contam1. Conferir inventário anterior antes das500adicionais.
- Produção exige autorização separada. Não escrever nos dados do programa instalado nesta implementação.

## Review Focus

- Mesma carta nas duas contas com treino/ímpetos diferentes: isolamento em todos os caminhos de leitura/gravação/exportação.
- Restauração antiga depois de criar contexto novo: dados restaurados visíveis, Secundária preservada, sem cache ocultando valores.
- Mudança de vizinho/instrução sem mudança de PP: assinatura/contexto novo e comparação histórica correta.
- GO1 com benefício físico e ímpetos de mesmo nome em slots documentados: não rejeitar pelo rótulo; rejeitar prova de outra edição/slot.
- Formações espelhadas e quase iguais, ou estilo sem regra: não inflar contagem nem cair silenciosamente em outro estilo.

### Task 1 — armazenamento e importação de contas

**Files:** criar web/craque-accounts-v382.js, scripts/test-accounts-v382.cjs; modificar backup V226 somente no evento de restauração.

**Interfaces:** Accounts.read(store) → {schema,active,secondary,plans}; Accounts.save(store,data), select(store,id); Accounts.roster(accountId,sources,store) → instâncias normalizadas; importDraft(store,file) → resumo; account IDs primary/secondary; planKey inclui conta.

- [x] Escrever teste RED de duas instâncias iguais, gravação separada, JSONcorrompido/quota, importação duplicada e rollback.
- [x] Implementar validação e adaptadores originais/próprias/adicionadas; Secundária própria, import privado e nenhum bootstrap que regrave legados.
- [x] Testar restauração antiga e backup novo com memória descartável, incluindo dados ocultos por seleção corrente.
- [x] Rodar node scripts/test-accounts-v382.cjs e registrar commit.

### Task 2 — regras físicas, slots e contexto

**Files:** criar web/craque-team-context-v382.js e scripts/test-team-context-v382.cjs; alterações focadas em V228/V378/V311/V376 apenas onde regra antiga impossibilita preservar treino válido.

**Interfaces:** Context.compile({accountId,manager,style,formation,lineup,instructions},cards) → contexto estável com identity/warnings/roles; evaluateCard(context,slot,deps) → ficha+contexto; trainingAllowed(position,index,proof), boosterCompatible(card,selection,proof). Instruções por fase e instância; saves exigem assinatura atual.

- [x] Testes RED: vetor Forlán60PP, GO1 físico, dois Goleiro +4/+1 documentados, slot/prova errados, LDcomDestruidor e mudança de vizinho/instrução.
- [x] Implementar regras por atributo e slots; manter contratos legados para registros sem nova prova, sem sumir com equipamento informado.
- [x] Acrescentar seis estilos e regras versionadas, sem mapear Sobreposição para Por Fora.
- [x] Rodar testes novos e regressões focadas V378/V380/V376; commit.

### Task 3 — catálogo e 500 desenhos

**Files:** criar web/craque-formations-v382.js, web/ct382-formations.json, scripts/build-formations-v382.cjs e scripts/test-formations-v382.cjs.

**Interfaces:** Formations.validate(plan), signature(plan), equivalent(a,b), eligible(plan,style); dados {id,family,label,slots,offBallSlots,roles,risks,source,status}; coordenadas0..100, ataque para topo.

- [x] Inventariar geometrias locais/externas, guardar contagem/hash de origem e mapear aliases.
- [x] Testes RED de espelhos/deslocamentos, 11 vagas/umGO/distância10, duplicação de pessoa e Possecentral.
- [x] Gerar500assinaturas adicionais com funções/riscos explícitos; não preencher por renomeação. Mostrar contagem de desenhos separada dos planos/escalações.
- [x] Rodar teste e geração determinística/check; commit.

### Task 4 — cálculo conjunto e exportação

**Files:** expandir contexto V382; criar scripts/test-team-recommendations-v382.cjs.

**Interfaces:** Context.recommend(context,deps) → {cards,balance,alternatives,pending,search}; exportText(plan), exportJSON(plan), adopt(store,plan,expectedSignature). Resolver escalação sem repetir pessoa; escolhas fixadas pelo usuário são limites.

- [x] RED para técnico/posição/instrução/companhias alterando prioridades/contexto, sem obrigar vetores diferentes; slots e PP consistentes em tela/exportação.
- [x] Reutilizar custos, atributos e avaliadores existentes, com busca limitada explicitamente; avaliar cobertura/apoio/profundidade. Finalstats só com atributos/fórmula documentados.
- [x] Preservar treinos observados, capacidade real das skills e restrições de edição; comparar com proposta, sem aplicação automática.
- [x] Testar cinco estilos existentes mais Sobreposição, ausência de dados e chamadas sem técnico; commit.

### Task 5 — experiência integrada de duas contas e plano

**Files:** criar web/craque-account-ui-v382.js, web/craque-team-plan-v382.js, web/craque-team-plan-v382.css, web/plano-do-time-v382.html; integrar app-bridge/shell, sw.js e stamp-bundle-v189.cjs.

**Interfaces:** seletor Principal/Secundária persiste apenas active; catálogo/ficha mostram conta; workspace permite técnico/estilo/formação/vagas/instruções, comparação, salvar nova revisão e exportar/importar. Acesso mantém ferramentas legadas em consulta.

- [x] QA RED de troca de contas, importação privada23cartas, salvar/reabrir, instruções e exportação com orçamento/contexto iguais.
- [x] Montar componentes usando tema aprovado; dropdowns e estados de pendência legíveis em320/390/1366px. Selecionar uma formação nunca apaga planos de outra.
- [x] Integrar todos os arquivos em offline/bundle e atualizar cache; routes antigas da Principal continuam disponíveis. Fora do workspace, não exibir estado da Principal sob rótulo de Secundária.
- [x] Rodar QA e regressões de shell/ficha/backup; commit.

### Task 6 — dados privados, revisão e entrega

**Files:** artefatos fora do repo em outputs/Analise-Conta-Secundaria; script QA; package/check/workflow; docscheckpoint.

- [x] Concluir inventário observado23cartas e arquivo privado importável com provas/status. Não incluir vídeo/imagens/inventário privado no Git.
- [x] Verificar pacote, fullcheck e QA end-to-end offline/backup/contextos; nenhum dado do programa instalado alterado.
- [x] Revisão independente final; corrigir achados relevantes com regressão e retestar o necessário.
- [x] Commit/push/PR revisável, consultar CI e registrar limitações concretas. Não encerrar como remodelação pronta se faltar alguma tarefa do desenho.
