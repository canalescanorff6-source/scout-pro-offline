# Craque Tático — Radar PRO Mundial V381 (01/11/2026)

## Objetivo
Conectar as **246 cartas originais** e os elencos externos à pesquisa mundial
de eFootball sem inventar PP, habilidades adicionais, ímpetos, prints,
Card IDs ou builds de Rentão, Blackjhon ou qualquer outro competidor.

Esta etapa **não afirma** ter recuperado fichas exatas de todos os profissionais.
É a primeira camada de fontes e rastreabilidade para a pesquisa contínua.

## Fontes públicas verificáveis
1. Konami: resultados finais 2026 — Rentao (Mobile), FUTEASY_10 (Console);
   YASSINE ETTADLAOUI e ETTORITO como finalistas.
   https://efootballchampionship.konami.net/en/news/detail/eFC2026-World-Finals-Results
2. Konami: chave dos 32 participantes (16 Mobile, 16 Console), múltiplas regiões.
   https://efootballchampionship.konami.net/en/worldfinals/history/2026
3. Partida publicada em canal DM7 PRO: Blackjhon × DM7 PRO (eFootball 2026).
   **Não prova qual Card ID, build ou habilidade Blackjhon equipou.**
   https://www.youtube.com/watch?v=fwCFo0mONck
4. CBF: Rentão e Juninho, seleção brasileira Mobile; análise de performance
   geral, não screenshot de distribuição.
   https://www.cbf.com.br/selecao-brasileira/noticias/selecao-brasileira/a/e-selecao-brasileira-mobile-inicia-semana-3-do-fifae-nations-league-em-primeiro-lugar
5. Regulamento Konami Mundial 2026: equipes não podiam usar jogadores
   desenvolvidos com Skill Training ou Position Training.
   https://new.efootball.pro/worldfinals/regulation/

## Como a ficha se apresenta
Em Minhas Cartas e Outros Elencos, o mesmo componente dinâmico
`reviewPanel` oferece o painel discreto **Radar PRO mundial**, fechado por padrão.

A cada mudança de posição e estilo, mostra:
- Card ID, edição, estilo e função atual, sem misturar cartas do mesmo atleta;
- custo de PP do treino efetivamente mostrado, identificado como rascunho,
  revisão ou motor consultivo;
- número de habilidades sugeridas pelo motor existente (até cinco), nunca
  supostamente comprovadas por pro player sem evidência;
- condição do slot de ímpeto (fixo/equipado preservados);
- critérios de observação para a função e preferência pela Posse central;
- fontes oficiais e a única fonte publicada de gameplay Blackjhon, rotuladas
  pelo que realmente demonstram.

## Regra de homologação por carta
Uma referência só pode ser considerada build exata quando os elementos
**CAP, Card ID, edição, tática, PP, vetor de 10 categorias e frames verificáveis**
forem consistentes. Para habilidades adicionais e ímpetos, exigir quadros
independentes mostrando esses campos. Não inferir conteúdos ausentes.

O módulo possui `exactCardProof`, `sourceForCard`, `inspect` e `panel`.
`PROVEN_BUILDS` começa vazio por escolha documental.
Não converter a participação em competição em prova de equipamento.
Não aplicar nem gravar a ficha automaticamente.

## Critérios de implementação
- O motor antigo V287 já avalia 246 cartas x 5 estilos, com ressalvas de
  evidência para cada habilidade e booster. Não foi refeito nem sobrescrito.
- V381 acrescenta proveniência mundial por cima da revisão **já calculada**.
- Integrado ao carregamento em `app-bridge.js` antes da montagem posicional.
- `sw.js` e `scripts/stamp-bundle-v189.cjs` incluem os dois arquivos.
- Testes automatizados: 32 participantes, cinco táticas, integridade da lista
  de cartas, validação exata por edição, recusa de falso testemunho, QA
  visual Android e Windows.
- Sem efeitos animados, sem acessos externos automáticos, sem uso de Overall
  como alvo, sem alterar dados pessoais/backup/autoatualização.

## Etapa seguinte de pesquisa
Para cada carta, obter vídeo ou print público com Card ID/edição e treino
legível; verificar autoria e minuto, registrar PP, cinco habilidades extras
se de fato estiverem visíveis, ímpeto fixo e segundo slot, versão do jogo,
técnico, função e estilo. Comparar com o motor e só então promover a fonte
de `pendente` para `confirmada`. A ausência de evidências permanece visível.
