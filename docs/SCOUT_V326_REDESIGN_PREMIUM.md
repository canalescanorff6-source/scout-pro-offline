# V326 — Reestruturação Premium: uma decisão por carta (Android + Windows)

## Diagnóstico do vídeo enviado pelo proprietário (2 min 06 s, 720×1600)
- **00–28 s:** catálogo com muitas ferramentas sem ordem de execução e cartões com informações concorrentes.
- **28–56 s:** seletor extenso de técnicos, seleção contextual, avisos e várias fichas intercaladas sem deixar evidente qual utilizar.
- **63–98 s:** opções de vagas e posição, PP do cenário, recomendações, editor contextual e outras áreas de análise dispersas.
- **98–126 s:** comparação CA/SA e treino original reaparecem como painéis separados; usuário não consegue identificar uma escolha principal.
- Falha de produto: a riqueza de **análise** foi confundida com várias **fichas aprovadas**. Não é seguro dizer que uma simulação matemática é superior a uma build registrada sem evidências competitivas.

## Mudanças implementadas em V326
1. **Início com três caminhos:** `Ver minhas cartas`, `Montar meu time` e `Outros elencos`. Ferramentas históricas continuam em `Mais ferramentas`. Usa o mesmo catálogo de 246 cartas, sem reconstruir dados nem substituir imagens.
2. **Orientação principal por carta:** bloco no topo com apenas uma recomendação de _como proceder_: manter treino registrado quando ainda não há comprovação, mostrar rascunho contextual como rascunho, indicar simulação de outro estilo como não homologada ou registrar teste de partida documentado. Não chama uma opção de “melhor” sem comparação comprovável.
3. **Ações principais claras:** `Ver meu treino`, `Habilidades e ímpeto` e `Comparar outras fichas`. As ações levam ao painel existente, preservando listeners e revisões.
4. **Comparações sob demanda:** mover a área real `.ct311-main-slot` (sem recriar/mudar os IDs) para a caixa `Comparar técnicos, posições e outros treinos`. Os mecanismos de MAT→SA→MAT, Card ID, PP e habilidades continuam ativos e independentes.
5. **Outros Elencos:** a simulação posicional também fica recolhida sob a análise principal; nenhuma ficha é removida. Um lembrete sucinto distingue treinamento, candidatos e equipamento real.
6. **Visual compartilhado:** paleta verde-profundo com superfícies mais sóbrias, tipografia responsiva, foco visível, cartões com hierarquia, navegação sem excesso de bordas e três botões de decisão com áreas de toque grandes. Redução de movimento respeitada.
7. **Bundle único:** novos assets são adicionados ao `app-bridge.js`, `sw.js` e ao fingerprint de build para Windows/Android/PWA; cache offline invalidado.
8. **Modo avançado preservado:** acesso explícito às comparações e às análises técnicas já existentes; nenhuma build, equipe, habilidade equipada ou ímpeto fixo modificado.
9. **Filtro de estilos do catálogo corrigido:** `position-order.js` era executado ANTES de carregar qualquer atributo `data-style` nas cartas e abortava com `Scout PRO: carta sem estilo para filtro #1`. Agora cria o seletor antes de `premium.js`, carrega os 246 registros V69, vincula por número + nome original, publica somente estilos cadastrados e mantém pesquisa/filtragem disponíveis quando a fonte estiver indisponível. Sem fabricar estilos nem depender de Overall.

## Critério honesto para “qual ficha é a melhor?”
- **Build registrada:** é a referência segura até haver evidência comparativa, não confirmação automática de meta.
- **Rascunho de técnico:** alternativa armazenada; não equipar nem sobrescrever treinamento original.
- **Outro estilo:** hipótese específica da função/edição, requer prova de familiaridade, atributos e testes.
- **Teste documentado:** mostrar estado de evidência somente quando `training_gameplay_verified===true` e `training_provisional!==true`.
- Habilidades propostas, PP matemáticos e ímpetos candidatos NÃO são marcação de slots equipados.

## QA e critérios de aceite
- Novo teste Node: `scripts/test-ux-v326.cjs` via `npm run check`.
- Novo teste real Chromium `scripts/qa-ux-v326.py` nas resoluções Android/Windows: três atalhos, ficha orientativa única, comparações fechadas por padrão, botão de abrir, táticas e modal de Outros Elencos.
- Regressões V195/V307/V309/V311/V314/V325 mantidas, agora abrindo as alternativas explicitamente antes dos testes funcionais.
- Bloquear merge e release se falhar CI, QA visual ou compilação assinada.
- Limite deliberado: não substituir a experiência de gestão do técnico com um algoritmo “vencedor” sem PP, atributos, slots e desempenho da edição comprovados.

## Próximas oportunidades
- Pesquisa filtrável de técnico por nome/edição na carta, em lugar da lista nativa longa.
- Dashboard de prioridade por elenco (sem pontuações genéricas de Overall).
- Comparador com **critério de evidência** e ganho marginal por PP, função e slot, selecionando um cenário para teste sem gravá-lo como equipamento.
- QA físico no Moto G56 e Windows com check de legibilidade de texto, barras do sistema e alvos táteis.
