# Correções V377 — edições exatas e histórico

Baseline: PR292, a1cb6d665ae20f0ae651d4cb5a44724a828e97fc.

| CAP | Edição da arte | ID corrigido | Nível público | PP de referência |
|---|---|---|---|---|
| 153 | Dean Huijsen — Summer Transfer 14/08/2025 | 105780749692770 | 25 | 48 |
| 196 | Savinho — Advertisement Reward 24/04/2025 | 105754711432614 | 42 | 82 |

A composição da arte, posição, clube e edição foram comparados com os recursos públicos; não foi usada identificação facial. Os hashes das imagens originais não mudaram. Os snapshots exatos anteriores estão em `ct377-identity-corrections.json`. As nativas do Huijsen foram corrigidas: a edição Highlight não herda Visionary Pass nem Rebuilding +3 do Show Time.

O [Savinho](https://pesdb.net/efootball/players/savio-105754711432614) tem nível1 incompleto no primeiro catálogo. O [eFootballEdge informa42](https://efootballedge.com/en/cards/105754711432614-savinho); essa fonte complementar é declarada separadamente, sem inventar confirmação no jogo. O [Huijsen](https://pesdb.net/efootball/players/dean-huijsen-105780749692770) tem25, também apresentado no [eFootballEdge](https://efootballedge.com/en/cards/105780749692770-dean-huijsen).

Os PP52/56 e treinos antigos das duas cartas pertenciam ao cadastro da edição errada. Foram preservados no histórico, não transferidos ao treino atual. As novas distribuições em draftA são propostas experimentais. Os registros locais de cenários, equipamentos, níveis, treino e OVR antigos continuam consultáveis sem gravação ou migração automática. As novas confirmações de treino e OVR usam também o Card ID na chave; a leitura dos registros antigos compatíveis continua funcionando.

As CAP61/144 permanecem com os IDs anteriores corretos e passam a ter identidade individualmente utilizável e níveis públicos29/27, sem alterar seus PP56/52. O índice V221 e demais pesquisas antigas continuam snapshots históricos: testes de reprodução conciliam somente as duas correções autorizadas e o app recusa o vínculo delas às novas identidades. Os outros244 registros continuam protegidos pelo mesmo hash original reconciliado.

Também incluídos: cálculo dos treinos GO com Jogo Aéreo já existentes no laboratório; máximos declarados de OVR106(Casillas),97(Pedro),103(Almada),103(Provedel) registrados separadamente de nível e treino atual. Ainda faltam os níveis máximos dessas quatro cartas; Overall máximo não determina nível, PP nem técnico.

A revisão é documental/computacional, não validação de261 jogadores em partidas online. Não se afirma equivalência às builds de criadores sem uma fonte individual comprovada. Nenhum APK foi instalado pelo agente, nem configurações do Windows ou Android alteradas.
