# Scout PRO V183 — Raridades confirmadas e habilidades documentadas por Card ID

Data da confirmação: 14/10/2026. Base: V182 (246 cartas).

## Confirmação do usuário aplicada

| Nº | Jogador | Raridade confirmada | Edição de catálogo | Habilidades |
|---|---|---|---|---|
| #075 | Luis Díaz | **SHOW TIME** | Show Time — Daily Bonus 2026 | 10 habilidades **pesquisadas externamente** por Card ID `106780671726691`; não vistas diretamente na conta |
| #151 | Willian Pacho | **DISTINGUIDO** | Highlight — Ligue 1 McDonald’s Selection 2 Mar '26 | **Bloqueado:** Card ID `106776376791946` devolve Show Time na PESDB |
| #170 | Jan Oblak | **SHOW TIME** | Show Time — Extraordinary One 4 Dec '25 | 5 habilidades **pesquisadas externamente** por Card ID `106766444571720`; não vistas diretamente na conta |
| #181 | Serhou Guirassy | **DISTINGUIDO** | Highlight — eFootball League Rewards Phase 9 | **Bloqueado:** Card ID `106769397419872` devolve Show Time na PESDB |

As etiquetas visuais das quatro fichas já eram coerentes na V182, mas #075 e #170 possuíam descrição histórica Highlight. Corrigidos os metadados no índice, na ficha, auditorias e pesquisa. As raridades de Pacho e Guirassy não foram alteradas, apenas novamente confirmadas; seus IDs seguem sob investigação.

**Regra de fidelidade:** registrar uma lista da PESDB que corresponde ao nome, Card ID, raridade e campanha, **não** equivale a homologar as habilidades dentro da conta do usuário. Os ímpetos/slots/treinamentos equipados permanecem inalterados.

## Contagem atual

- **246** cartas preservadas.
- **242** com listas de habilidades registradas (130 legado, 91 externas por Card ID, 21 correspondências multifatoriais sem ID autenticado).
- **4** cartas ainda sem lista (Messi #050, Pacho #151, Guirassy #181, Rodri #225).
- **Nenhuma nova confirmação direta de slot livre de ímpeto.** Os 95 slots registrados como selecionáveis ainda dependem de verificação da conta.

## Rodri #225 — Card ID a validar

O ID atualmente conservado em `web/SCOUT_V69_AUDITORIA.json`, `106780940205246`, resolve **Nico O'Reilly** externamente, incompatível com o nome da carta. A ficha HTML já apresenta `105779675902175`, candidato a **Rodri Highlight — Back in the Game 14 Aug '25**. A PESDB registra esse Rodri com **52 PP** e estilo Anchor Man (Primeiro volante), enquanto a auditoria original também registra 52 PP. A coleção PESMaster da mesma data inclui Rodri nesse pacote.

**Importante:** coincidência de nome, pacote, posição e PP é uma evidência externa relevante, mas a identidade da imagem original e o ID exibido na conta ainda não foram autenticados. Não substituir o ID principal nem copiar habilidades para #225 até essa prova. A ficha HTML apresenta um candidato, não uma homologação inequívoca; reconciliar o ID visível ao concluir a inspeção da própria carta.

Fontes:
- https://pesdb.net/efootball/players/rodri-105779675902175
- https://pesdb.net/efootball/players/nico-o-reilly-106780940205246
- https://www.pesmaster.com/pt/efootball-2022/player/featured/?date=2025-08-14
- https://pesdb.net/efootball/players/luis-diaz-106780671726691
- https://pesdb.net/efootball/players/jan-oblak-106766444571720
- https://pesdb.net/efootball/players/willian-pacho-106776376791946
- https://pesdb.net/efootball/players/serhou-guirassy-106769397419872

## Auditoria de ímpetos
Permanece a categorização V182: 95 slots selecionáveis indicados sem homologação; 3 possíveis; 4 com segundo ímpeto nomeado; 144 indefinidos. **Não** confundir ímpeto fixo, segundo fixo, slot selecionável e ímpeto selecionado. Nenhum ímpeto/slot foi alterado nesta etapa.

## Integridade de atualização

Arquivos de catálogo e visualização atualizados; teste `scripts/test-user-rarity-v183.cjs` integrado ao `npm check`; cache PWA incrementado para forçar recarga dos dados publicados. Release, APK e integração somente são anunciados após CI concluir GREEN.
