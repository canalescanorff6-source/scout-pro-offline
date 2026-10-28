# Revisão das 261 cartas e Overall contextual

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Conferir individualmente as 246 cartas e 15 adições; corrigir inconsistências documentadas de nível/progresso e mostrar sobre a imagem o OVR correspondente ao treino e técnico selecionados, distinguindo cálculo de confirmação no jogo.

**Architecture:** Catálogo externo de referência separado dos registros originais e dos recibos da conta. Motor puro calcula estatísticas/OVR estimados com dados completos e contexto explícito; controlador lê treinos já salvos, acompanha troca de técnico e apresenta o resultado na arte sem editar imagens. Dados ausentes, IDs compartilhados e divergências ficam visíveis, nunca viram números inventados.

**Tech Stack:** JavaScript/Node offline, JSON de referências, HTML/CSS, pipeline Android/Windows existente.

**Spec:** Pedido de 27/10/2026; usuário escolheu treino atual com qualquer técnico. Também declarou possuir o pacote completo Borussia Dortmund 26-27 e quatro cartas externas ao pack. Essa declaração não autentica automaticamente cada captura/edição externa.

## Global Constraints
- Base remota main cc60fcff0d774e44b302b0fb49ee1570850503b3 (release1.1.1159). Branch nova feat/revisao-261-niveis-overall. Worktree já isolado, HEAD antigo e arquivos gerados devem ser preservados.
- Preservar as 261 imagens, IDs de origem, treinos e históricos. Não deduzir nível de OVR, nome do arquivo ou nível mostrado no simulador.
- Nível1 de fonte treinável/PPpositivo é potencial campo ausente: não zerar PP.
- Referência pública não vira confirmed_in_game nem comprovante de equipamento/familiaridade.
- OVR calculado deve dizer estimado; tabela de referência não é fórmula oficial Konami. OVR máximo do banco não equivale ao OVR do treino atual.
- Sem Computer Use: Escape anterior não revogado. Usar testes Node e CI remoto.
- Sem novos agentes: dois revisores de evidências atingiram limite, relatórios parciais foram salvos; conferir resultados diretamente.

## Review Focus
- Trocar técnico/estilo/posição/treino não pode reutilizar OVR de outro contexto.
- Falta de fonte completa, ID repetido e item/bônus desconhecido não podem resultar em zero ou número aparentemente confirmado.
- Vetor incompleto pode ter saldo; excesso de PP deve ser bloqueado sem apagar o histórico.
- Rótulos de nível público e nível informado precisam continuar distintos.
- Imagem original tem OVR impresso: a camada deve substituir visualmente esse valor, com contexto e contingência legível.

### Task1: Auditoria e referências
- [x] Ler todos os 261 registros e833 espelhos de cenário; coletar222IDs públicos, dados de15candidatas e preservar HTML/sha/fontes.
- [ ] Conferir candidatos das22 semID, campos ausentes e diferenças públicas; consolidar261 estados sem promover candidato a edição confirmada.
- [ ] Criar dataset de referência com procedência e confiança por campo. Preencher apenas níveis ausentes que não contradizem PP/declaração existente; outras correções ficam separadas para reconciliação.
- [ ] Sincronizar metadados nativos ausentes nas fichas com a lista já existente no catálogo, preservando listas e equipamentos de origem.

### Task2: Cálculo contextual
**Files:** criar web/craque-rating-v376.js, web/ct376-rating-model.json, scripts/test-card-rating-v376.cjs.
- [ ] Teste RED: base dos222IDs, treino/proficiência/boosters, saldo/excessoPP, fonte incompleta, IDcompartilhado, nomes/funções incompatíveis.
- [ ] Implementar cálculo próprio a partir dos parâmetros numéricos publicados, com etapas explícitas e proveniência. Não copiar implementação de terceiros.
- [ ] Relacionar treino corrente dos perfis V324/V311/lab e técnico V302; não usar treino proposto como treino atual.

### Task3: Exibição e progresso
**Files:** criar web/craque-rating-ui-v376.js/.css, integrar app-bridge.js, ct364-owned-main.js e manifesto de paridade.
- [ ] Mostrar OVR contextual na arte e nível máximo/PP distribuídos/saldo em catálogo/ficha e nas15 adições.
- [ ] Resolver o contexto salvo sem gravar ao consultar; atualizar quando o usuário muda técnico/treino/posição.
- [ ] Oferecer revisão por carta com fonte, diferença e pendência; OVR observado manualmente só vale para o contexto explicitamente confirmado.
- [ ] Testar controlador real em memória e dados das261cartas; arquivos/imagens originais preservados.

### Task4: Fechamento verificável
- [ ] Rodar check completo e CI visual/builds.
- [ ] PR revisável com quantidades exatas de cartas conferidas/corrigidas/pendentes. Não dizer todas refeitas se só houve alteração do sistema.
- [ ] Integração/publicação conforme autorização e regras do repositório; não instalar dispositivos nem alterar assinaturas.

## Limites conhecidos
22 cartas antigas semCardID;2IDs compartilhados em4CAPs.15adições tinham IDs/números máximos ausentes;11compatíveis com pack declarado,4externas exigem maior cuidado. Foram encontrados campos públicos nível1 incompletos; nenhuma conversão desses campos para PP0 é permitida. Desempenho online e fórmula oficial de Overall continuam sem homologação.

## Ledger — implementação V376
- Tarefas1–3: referências261,232fichas com metadados reconciliados, motor contextual e UI implementados.
- Ruling: V311/V324/V374 guardam propostas consultivas; não devem ser lidas como treino aplicado. Usar treino pessoal V67, cadastro identificado ou confirmação específica V376. Caso a proposta já tenha sido aplicada, o usuário confirma a distribuição no novo painel.
- Referências públicas de nível não alteram assinaturas de históricos nem comprovam dados da conta.
- TDD: cálculo/contexto/badge/metadados/alias especial observados RED→GREEN. Testes legados ajustados para distinguir fonte pública e lacunas efetivamente corrigidas; hash anterior integral recuperado ao retirar apenas154adições verificadas.
- Revisão independente anterior indisponível por limite de uso dos agentes; revisão local adicional e CI remoto ainda pendentes. Sem Computer Use local.

- Revisão independente final recebeu3achadosP2. Corrigidos numa rodada com testesRED→GREEN: identidade manual no salvar treino, escolha explícita sem técnico/evento de limpeza, fontes prontas após registro do listener do diálogo. QA remoto exercita os2fluxosDOM.152estimativas/109pendências reconferidos pelo revisor.

- 278/278 componentes no pós-revisão passaram. Confirmação posterior das4edições externas incorporada via testeRED→GREEN e fontes separadas;235referências de identidade utilizáveis,14níveis públicos nas15adições,Provedel sem nível inventado. Alteração final retestada nos testesV376 e paridade.
