# V330 — Premium Fase 5 · Escalação e Laboratório em foco

**Repositório:** `canalescanorff6-source/scout-pro-offline`  
**Base:** `main` com release `v1.1.930` (V329)  
**Alvos:** `meu-time-duas-formacoes-v177.html`, `meu-time-posse-4312.html`, `meu-time-testes-v219.html`.  
**Diretriz:** Seção 41 — melhorias proativas verificadas, sem inventar dados ou substituir fichas.

## Auditoria do problema
A tela oficial de **Duas Formações** apresentava blocos de estilo e Link-Up antes de exibir o campo — o primeiro objetivo do proprietário ficava abaixo de avisos e análises. A formação experimental 4-3-1-2 também abria as 12 reservas e funções detalhadas simultaneamente, agravando a sobrecarga visual. No **Laboratório**, o formulário das 23 cartas restritas e o backup apareciam antes das séries e equipes a serem testadas. Cada equipe exibida, quando aberta, mostrava campo, 11 titulares, 12 reservas, evidências e formulário em uma longa sequência sem hierarquia.

## Mudanças reais
1. Novo módulo de **aprimoramento progressivo**, `web/craque-lineup-focus-v330.js`, exclusivamente leitor da tela. Ele NÃO usa `localStorage.setItem`, APIs de treino, nem modifica Card IDs, planos ou builds. Em navegadores antigos que não o carregarem, as páginas originais continuam totalmente funcionais.
2. Novo estilo `craque-lineup-focus-v330.css`: azul-noite + dourado discreto, contraste alto, alvos de toque com 44px+, 4 indicadores de contexto e 4 atalhos grandes em duas colunas no mobile.
3. **Minhas Duas Formações**: após escolher 4-3-1-2/4-2-1-3, o **campo real** aparece antes das explicações. Abaixo ficam o banco de 12 reservas (dobrado inicialmente), escolha de estilo e detalhes avançados (Link-Up, funções). Os 11 titulares e a troca de cartas permanecem iguais; o badge e o painel acompanham a formação escolhida.
4. **4-3-1-2 experimental**: mesmo painel de decisão; identifica explicitamente que se trata de **proposta experimental** e que nenhuma ficha foi homologada. Campo, reservas, plano de jogo e análise conservam seus seletores e funcionalidades.
5. **Laboratório**: séries e estilo são apresentados antes do grande cadastro das 23 restrições. O painel avisa o número realmente selecionado e não confunde marcação do usuário com evidência externa. Botões de acesso à formação, primeiro elenco, restrições e gravação. As restrições ainda podem ser cadastradas, pesquisadas, importadas, exportadas e removidas, mas sua longa lista fica recolhida. Backup, vídeo e critérios aparecem sob demanda.
6. **Equipes do laboratório**: ao abrir um elenco, vê-se primeiro campo e 11 titulares; banco de 12 reservas e revisão documental ficam recolhidos, enquanto o formulário de registrar partida permanece intacto. Nenhum resultado de partida anterior ou candidato é excluído.
7. Textos longos de contexto continuam legíveis por meio de `details` (“Entenda o contexto e os limites”). Nenhum disclaimer ou alerta de validação é eliminado do DOM.
8. Cache offline `web/sw.js` renovado para V330 e fingerprint Windows/Android em `scripts/stamp-bundle-v189.cjs`; ambos passam a distribuir exatamente os mesmos dois novos arquivos.

## Segurança
- 246 cartas originais e imagens intocadas.
- Builds PP, habilidades nativas/adicionais, ímpetos e versões/Card ID intocados.
- Exigências de familiaridade de posição e Link-Up **não** são transformadas em homologação. A decisão de escalar continua manual.
- 23 restrições do Black continuam dependendo de confirmação visual do proprietário; não criar lista falsa.
- Backup e gravação Android continuam sendo funções originais; a V330 move apenas painéis, não altera APIs nativas.
- Sem sincronização automática de dados salvos entre Windows/Android (compartilhar código ≠ compartilhar armazenamento).

## Testes adicionados
- `scripts/test-lineup-focus-v330.cjs`: motor puro de contexto, duas formações, cinco estilos, ciclo de teste, 23 restrições, seleção preservada, 246 cartas íntegras, ausência de gravação e integridade do bundle/cache.
- `scripts/qa-lineup-focus-v330.py`: Chromium em 390×844 (Android) e 1366×768 (Windows), validando as três telas reais: 11 titulares, banco, abertura dos painéis, campo antes da tática, formação 4213, laboratório com restrições acessíveis, primeiro elenco, registro de partida e ausência de overflow.
- Regressões antigas (V176/V177/V219/V230/V246/V314 etc.) continuam executadas pela CI e QA visual.

## Portas obrigatórias antes da publicação
1. CI e auditoria das 246 cartas verdes;
2. QA visual de todas as resoluções e teste V330 com interação real verde;
3. Builds Android e Windows de teste verdes;
4. Somente então merge seguro de PR na `main`, compilação oficial Android assinado + Windows NSIS, verificação conjunta de release e links reais.

## Oportunidades seguintes
- V331: reduzir a altura da tela inicial de carta móvel e preparar uma seleção rápida de formação por jogador, com explicação da posição real de uso sem trocar builds.
- V332: resumo de desempenho do laboratório por partidas comparáveis, sem ranking inferido apenas de Overall.
- V333: verificar consistência visual de reservas no Android físico, sem inventar estatísticas ausentes.
