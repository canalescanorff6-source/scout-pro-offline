# Fichas por função — continuação da PR 311

Estado: método aprovado pelo proprietário: “psr é eu quero isso para o meu app”. Complementa as seções de função/ativação e observação do desenho de contas já aprovado. Baseline: 7f0aab2, branch feat/secondary-context-20261101; não reiniciar contas, formações ou design.

Resultado verificável: cada ficha do Plano do time distingue familiaridade, ativação ofensiva/defensiva, tarefa com/sem bola, prioridades de treino, candidatas complementares e observações manuais da revisão. Sem prometer vitórias, simular partidas, alterar cartas canônicas ou instalar/publicar versões.

## Task 1: regras de ativação e contrato de função
- [x] Criar teste RED para Destruidor em LD, infiltração em MLG, ala produtivo em MAT, fase fluida, rótulo desconhecido, mudança de função/contexto.
- [x] Implementar módulo puro versionado com fonte/data, status ativo/inativo/básico/pendente e contratos de função por posição. Familiaridade independente. Aliases ambíguos permanecem pendentes.
- [x] Integrar ao contexto, usar somente estilo ofensivo ativo no motor e aplicar prioridades editoriais explícitas por função; habilidades/ímpetos complementam a tarefa com limites existentes.
- [x] Rodar teste focado e regressões V382; registrar RED/GREEN e commit.

## Task 2: escolha, explicação e observações na interface
- [x] Teste RED para seleção de função, fonte/status visível, exportação, observação vinculada a conta/revisão/contexto e validação de entrada.
- [x] Integrar escolhas por jogador e exibir contrato/ativação/prioridades/fontes sem redesenhar shell. Preservar escolhas em mudanças compatíveis de formação e históricos.
- [x] Registrar observações manuais (modo, amostra, apoio, infiltração, recomposição, cobertura e nota), sem alterar ficha ou gameplayValidated; manter no documento de contas/backup com validação.
- [x] Registrar revisões na exportação e no histórico; incluir dependências offline/bundle. Teste e commit.

## Task 3: verificação e entrega revisável
- [x] Testes completos, QA móvel/Windows e offline/backup. Um revisor novo somente leitura por executing-plans; corrigir achados importantes com RED/GREEN.
- [x] Documentar fontes, limitações e evidências; atualizar PR 311 e conferir CI do novo HEAD. Sem merge/release/instalação.

## Decisões e fontes
Regra é levantamento técnico independente, não confirmação da carta da conta. Fontes consultadas em 01/11/2026: eFHUB (resumo defensivo da versão 2027; excluir quatro estilos especulativos) e eFootball Explained (posições por estilo, versão 11.1.1; fonte declara verificação em andamento). Não importar seus números internos de IA. Aliases antigos sem equivalência documentada: pendentes.

- https://efhub.com/articles/260816_1-four-new-playing-styles-found-in-the-game-files
- https://efootballexplained.com/playing-styles/hole-player/
- https://efootballexplained.com/playing-styles/prolific-winger/
- https://efootballexplained.com/playing-styles/orchestrator/
- https://efootballexplained.com/playing-styles/creative-playmaker/
- https://efootballexplained.com/playing-styles/defensive-full-back/
- https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00

Ruling: continuar o desenho e a autorização existentes sem nova confirmação — o usuário aprovou explicitamente o método; a etapa acrescenta a precisão que faltava, mantendo a barreira de produção.
Ruling: observação é relato por revisão, não prova causal nem nota automática de rendimento — o vídeo original contém menus, sem partida filmada.
