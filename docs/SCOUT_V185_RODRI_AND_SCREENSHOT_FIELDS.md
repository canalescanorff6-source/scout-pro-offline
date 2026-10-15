# SCOUT PRO V185 — Rodri #225 e plano de aproveitamento dos 241 prints eFHUB

## Correção Rodri #225 (15/10/2026)

**Original:** cadastro central erroneamente apontava para `106780940205246`, que a PESDB atribui a Nico O'Reilly Show Time; isso bloqueava a lista de habilidades nativas de Rodri.

**Atual (ligação externa de alta consistência):** Rodri Highlight — Back in the Game 14 Aug 2025, Card ID `105779675902175`, por quatro fatores independentes:

1. A PESDB e PESMaster atribuem o número e a edição a Rodri e mostram 52 PP no simulador PESDB.
2. A arte `Rodri_efhub_0.jpg` é a de Manchester City (não Espanha), com 190 cm, 82 kg e nível 27 exibido.
3. As **10 habilidades nativas** do screenshot batem, item por item, com as habilidades dessa edição na PESDB.
4. A ficha HTML já usava `105779675902175` em `lab-data` e no Card ID visível, mas o cadastro mestre e `scout-v68-data` estavam conflitantes.

**Lista da edição externa preservando os nomes PESDB:** Sole Control; Rising Shot; Long-range Shooting; One-touch Pass; Through Passing; Low Lofted Pass; Man Marking; Interception; Aerial Superiority; Fighting Spirit.

**Não confundir com:** `Rodri_efhub.jpg` (camisa da Espanha, habilidades incluem Bloqueador e não Chute ascendente), nem com Rodri #020 (`105684112879839`, Highlight Espanha de 05/09/2024). **A captura espanhola não está validada contra o Card ID #020:** embora a arte seja da Espanha, as habilidades divergem da lista externa para o número desse cadastro. Não importar.

**Limite da prova:** o print não mostra o número Card ID dentro da conta do usuário. A ligação da edição é externamente sustentada por nome, campanha, arte, altura, PP e lista nativa. O campo `proof_in_game` permanece **false**. `NENHUM BOOSTER NATIVO CONFIRMADO` não foi convertido em "não tem booster" ou "slot livre"; sugestões de ímpeto continuam condicionais.

**Invariantes preservadas:** 246 cartas e artes, Rodri #225 52 PP e níveis `[0,8,4,4,4,4,12,0,0,0]`, Rodri #020 e Nico O'Reilly #133 intocados, ímpetos e habilidades adicionais equipadas não inventados. Como resultado, **243/246 listas de habilidades documentadas**, com #050 Messi, #151 Pacho e #181 Guirassy ainda sem inclusão na ficha canônica. Os dois últimos têm skills de print, mas ainda não possuem identificação numérica confiável da edição Distinguido.

## O que mais é aproveitável dos 241 prints do eFHUB

### A. Informações de alto valor, relativamente estáveis por edição
- **Nome e arte da carta:** facilita desambiguação, mas não substitui Card ID numérico.
- **Nativas e especiais**, com grafia original em português: remover skills duplicadas, selecionar até cinco sugestões adicionais por função e por tática sem inventar espaço ocupado; requer verificar edição exata.
- **Estilo ofensivo/defensivo e posições com proficiência:** composição por função em 4-3-1-2 e 4-2-1-3 de posse; sem transformar posição secundária em posição com estilo ativo sem checar a regra do jogo.
- **Uso/precisão do pé fraco, forma física e resistência a lesões:** calcular adequação a receber orientado, giro para cada lado, passes rápidos, consistência e rotação; características declaradas, não garantia de desempenho.
- **Parâmetros de corpo:** comprimento dos braços/pernas, tamanho de tronco, largura de ombro, coxa e panturrilha; métricas derivadas de cobertura de pernas/braços, altura de salto e colisão. Podem alimentar indicadores físicos separados por fonte, **não** equivalem a Player ID oficial nem provam uma animação em campo.
- **Estilos de IA**: somente incluir se fonte da edição apresentar explicitamente (a tela eFHUB usada não basta).

### B. Informações dependentes do cenário do print — não substituir o projeto
- **Atributos e radar de posições em tela:** treinados + manager/booster e outros bônus, portanto não usar como atributos-base do card. Comparar cenários simulados *somente se treino, estilo de equipe, gerente, bônus e versão forem conhecidos*.
- **Progressão/categorias e técnico Xabi Alonso:** guardar como simulação de referência; os níveis e PP do Scout PRO são fonte principal.
- **Ímpeto 1 e 2:** a tela do eFHUB pode exibir opções personalizadas ou `Sem Impulso`; não demonstra automaticamente quais ímpetos o usuário equipou no jogo, nem se o slot existe, está livre ou ocupado.
- **Overall/OVR:** serve para reconhecer imagens e comparar contexto, não para escolher "melhor" carta ou otimizar treinamento.

### C. Dados ausentes dos prints, exigem outra evidência
- Card ID numérico **dentro do jogo** e confirmação final da identidade da carta.
- Player ID/animações ocultas e efeitos efetivos de colisão/drible/desarme em partidas.
- Habilidades adicionais e ímpeto de fato **equipados pelo usuário** (não confundidos com configuração do simulador).
- Latência, comportamento de IA e pro-player em gameplay; exigir vídeo válido da edição, idealmente sequência de jogo controlada e comparações.

## Próximo aproveitamento de dados

A V184 contém **241 listas de habilidades**, 2.243 ocorrências de nomes, 60 nomes distintos e 15 registros aprofundados de modelo/ímpetos. O conjunto de 241 prints também mostra em tela muitos atributos físicos, formas de jogo e campos situacionais **ainda não transcritos de maneira completa nas demais 226 capturas**. Uma próxima etapa pode extrair e auditar esses campos dos 241 prints por lote, com indicador de confiança, preservando capturas originais, sem inferir falta de booster e sem modificar nível/PP.

Para a inteligência tática: formar indicadores separados de *primeira recepção/passe*, *cobertura defensiva central*, *duelo/alcance físico*, *resposta ao pé fraco* e *resistência de partida*; pontuar somente fatores efetivamente observados e demonstrar incerteza. Vídeo e jogo continuam necessários para inferir movimentação/Player ID. Nenhum score é considerado "validado" por imagem isolada.

## Referências
- https://pesdb.net/efootball/players/rodri-105779675902175
- https://www.pesmaster.com/rodri/efootball-2022/player/105779675902175/
- https://pesdb.net/efootball/players/nico-o-reilly-106780940205246
- https://pesdb.net/efootball/players/rodri-105684112879839
- `web/SCOUT_V185_RODRI_225_EVIDENCE.json`
- `web/SCOUT_V184_EFHUB_241_COMPLETE.json`

## Homologação
Rodri #225 validado externamente; Card ID numérico no próprio jogo ainda não inspecionado. CI e publicações somente confirmadas após execução GitHub Actions GREEN.
