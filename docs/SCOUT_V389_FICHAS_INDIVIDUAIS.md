# Auditoria V389 das fichas individuais

## Apoio por dentro e cobertura na lateral

O Plano do Time e a ficha por função passam a calcular a opção **Apoiar por dentro e recuperar** com uma ação própria, que combina passe curto, domínio, equilíbrio, velocidade, resistência e cobertura. A instrução **Defensivo** mantém a prioridade de cobertura. A função do app é uma hipótese de uso da carta. A ativação de estilos continua vinculada à posição e à fase informadas.

Juan Foyth #131, Card ID `105864769945293`, LD, Contra-Ataque Rápido, 56 PP em cada cenário. A projeção soma a distribuição aos atributos-base antes dos bônus e da condição.

| Função no plano | Passe rasteiro | Controle de bola | Aceleração | Talento defensivo | Desarme |
| --- | ---: | ---: | ---: | ---: | ---: |
| Dar apoio seguro pelo lado | 73 | 73 | 82 | 84 | 84 |
| Apoiar por dentro e recuperar | 75 | 75 | 81 | 83 | 83 |
| Apoiar por dentro e recuperar, com Defensivo | 74 | 73 | 82 | 84 | 84 |

As recomendações respeitam as nativas da edição e o catálogo indica ausência de slot adicional de ímpeto. Os cenários com instruções diferentes servem para comparar o encaixe do conjunto. Para medir apenas a ficha em PvP, mantenha posição, técnico, instruções e equipamento iguais. Registre tabelas concluídas sob pressão por recepções e coberturas bem-sucedidas por bolas jogadas no corredor, com o placar e o período da partida. As entrevistas sustentam a escolha do que observar e o resultado em partida permanece em aberto. [Edição de Foyth](https://efhub.com/players/105864769945293) · [Notas da Konami](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00) · [Entrevistas no eFHUB](https://efhub.com/es/articles/260930_3-which-defender-playing-style-is-best)

## Estudos de Amadeusz na ficha do aplicativo

O ganho marginal de passe rasteiro, passe alto, finalização e cabeceio usa três faixas de precisão com quebras em 60 e 90, quando esses atributos fazem parte da ação da carta. O modelo usa inclinações aproximadas do estudo como fatores editoriais e mantém o custo progressivo dos PP. A projeção considera a base e o ímpeto fixo documentado. Proficiência do técnico, condição e habilidades situacionais ficam fora dessa projeção. [Estudo de precisão](https://efhub.com/articles/261019_3-passing-and-finishing-the-threshold-is-90-for-both)

As fichas publicadas para Neuer #011, Cristiano Ronaldo #024 e Matheus Cunha #093 aparecem em um painel separado quando edição, posição e orçamento coincidem. O painel mostra níveis, atributos projetados antes dos bônus e o ímpeto exibido na publicação com José Mourinho. A ficha do Cristiano inclui o nível de Goleiro 1 do original publicado. O painel é somente para consulta e não altera treinos salvos. [Neuer](https://efhub.com/articles/261013_1-this-move-beats-neuer) · [Cristiano Ronaldo](https://efhub.com/articles/261003_1-top-10-cfs-updated-progression-builds-for-90-proficiency-managers) · [Matheus Cunha](https://efhub.com/articles/261028_2-five-new-sss-tier-cards-featured-ss-rankings-10-28)

A auditoria comparou 1.305 cenários. Houve 21 mudanças de distribuição nos quatro estilos alternativos e uma mudança no primeiro ímpeto sugerido. As listas de adicionais permaneceram iguais. As 261 propostas de Posse de Bola foram preservadas e os dados de entrada mantiveram os mesmos hashes.

## Evolução V390 da ficha recomendada

Nos quatro estilos alternativos, a recomendação passou a distinguir a ação da carta na posição escolhida. O V233 identifica tarefas como ruptura, primeiro passe, cobertura, bote, cruzamento, lançamento e recepção da segunda bola. O V251 considera o ganho de cada nível nos atributos documentados relevantes para essa ação, dentro do custo progressivo de PP. A pontuação é uma regra editorial e o ganho estimado parte da base da edição e do ímpeto fixo documentado. [Estilos coletivos](https://efhub.com/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed) · [Aceleração](https://efhub.com/articles/261017_4-acceleration-thresholds-decoded) · [Notas da Konami](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00)

O V162 prioriza habilidades para a ação dentro do conjunto compatível e exclui as que já são nativas ou equipadas. O V103 compara os atributos alcançados pelo ímpeto com a mesma distribuição exibida. O V378 e o V228 suspendem a sugestão de novo ímpeto se a referência exata usada na análise não documenta slot selecionável. O Plano do Time e as fichas privadas recebem as mesmas prioridades por ação, combinadas com a função e as instruções disponíveis.

Na comparação com o V389, a auditoria refeita para as 261 cartas mostrou 874 mudanças de distribuição nos quatro estilos alternativos e nenhuma em Posse. Também foram preservadas as listas de habilidades e o primeiro ímpeto nos 261 cenários de Posse. A análise por ação alcançou 239 edições e 956 cenários alternativos. As 22 cartas sem base suficiente mantêm o estado de evidência pendente. Os resultados são propostas para comparar em jogo.

| Cenário | V389 | V390 |
| --- | --- | --- |
| Nihat #037 · Contra-Ataque Rápido | 8/6/6/8/8/7/0 | 9/4/6/9/8/6/0 |
| Aubameyang #183 · Contra-Ataque Rápido | 8/5/6/8/8/8/0 | 8/4/6/10/8/6/0 |
| Martinelli #191 · Por Fora | 7/8/8/8/8/4/4 | 5/8/10/7/8/4/4 |
| Lukaku #178 · Bola Longa | 8/7/4/7/7/8/2 | 7/7/8/6/6/8/0 |

Os resultados a seguir registram a entrega inicial do V389. A comparação mais recente usa o relatório do V389 como linha de base.

## O que causava as repetições

Na revisão `9e6ade9`, a ficha principal chegava ao distribuidor V251 por V311 → V228 → V233. Os pesos levavam em conta função, tática e sinais já cadastrados. Os atributos-base públicos da edição só chegavam ao V378, depois da distribuição. Por isso duas cartas diferentes podiam entregar entradas matemáticas iguais mesmo com atributos documentados distintos. O cache do V251 reaproveitava cálculos de pesos e orçamento iguais. A auditoria isolada não reproduziu vazamento de ficha salva entre cartas, técnicos ou estilos.

## Como a ficha passou a ser calculada

- V228 e V233 conferem Card ID, edição e CAP quando aplicável. Em quatro estilos alternativos, ajustam os pesos com os atributos relevantes da edição, comparando margens dentro da própria carta. Altura entra junto de salto e cabeceio em situações aéreas. Nativas e ímpeto fixo documentados podem modular prioridades. Cada ajuste mostra os valores que realmente usou.
- V251 continua a fechar o custo exato dos PP. A referência pública enriquece a recomendação com os dados da edição. Nível, PP, imagem, inventário e equipamentos registrados continuam nas respectivas fontes.
- V378 resolve treino, habilidades e ímpeto a partir da mesma distribuição. A ficha mostra a origem e os fatores da proposta. A gravação leva as escolhas exibidas, inclusive listas vazias. O V303 usa o mesmo cálculo para prévias dos quatro estilos alternativos.
- Plano do Time V382 acrescenta função coletiva e instruções. As fichas privadas V385 preservam as revisões e o cadastro de cada conta. Outros Elencos pode usar a referência pública exata sem transferir dados de conta.
- A troca de posição usa a função escolhida. Quando uma regra de ativação disponível indica inatividade na posição alternativa, o respectivo padrão individual deixa de pesar nas propostas dos quatro estilos alternativos. A familiaridade continua sujeita à conferência da posição.
- A edição do técnico separa o contexto e a leitura de proficiência. As propostas individuais não somam bônus de técnico sem comprovação de aplicação. A auditoria reproduzível usa Niko Kovač CT-MGR-071, na posição original de cada carta.
- Posse de Bola conserva as distribuições exibidas na revisão de referência. Fichas manuais e aprovadas preservam a origem e as revisões existentes.

## Resultado por estilo

| Estilo | Cenários | Distribuições diferentes da versão anterior |
| --- | ---: | ---: |
| Posse de Bola | 261 | 0 |
| Contra-Ataque Normal | 261 | 124 |
| Contra-Ataque Rápido | 261 | 93 |
| Por Fora | 261 | 125 |
| Passe Longo | 261 | 124 |
| **Total** | **1.305** | **466** |

São 246 originais e 15 adicionais embarcadas. As três fontes de catálogo e referências mantiveram os mesmos hashes. Os 1.305 cenários fecharam o custo de PP e passaram na conferência de identidade com o cadastro. As cartas com identidade ainda pendente mantiveram essa condição. As dez combinações de progressão fixa continuam sem distribuir PP.

Das 261 cartas, 239 têm base pública vinculada. Nos quatro estilos alternativos, 956 cenários usam essa base e 88 ficam com dados insuficientes para individualizar pelos atributos-base. Esses 88 cenários correspondem a 22 cartas.

## Repetições antes e depois

Havia 707 pares com vetor igual nos quatro estilos alternativos para investigar. Destes, 269 passaram a ter distribuições diferentes. O novo cálculo apresentou 557 pares iguais, dos quais 493 vieram de análises individuais documentadas e 64 ainda dependem de dados da edição. O relatório classifica coincidência justificada como A, omissão de fatores como B, falta de dados como C e reaproveitamento incorreto como D. Nenhum par permaneceu em B ou D nos quatro estilos no recorte auditado. Os 208 pares de Posse pertencem ao recorte preservado.

A indicação de coincidência compara a edição, o técnico, a posição, o estilo, o orçamento, os dados e a distribuição do cenário auditado. Ela aparece quando esses elementos correspondem à proposta aberta. A lista embarcada cobre o contexto reproduzível acima.

| Carta e contexto | PP | Antes | Depois |
| --- | ---: | --- | --- |
| Nihat #037, CA, Contra-Ataque Rápido | 62 | 9/4/6/8/8/7/1 | 8/6/6/8/8/7/0 |
| Aubameyang #183, CA, Contra-Ataque Rápido | 62 | 9/4/6/8/8/7/1 | 8/5/6/8/8/8/0 |
| Rijkaard #104, VOL, Contra-Ataque Rápido | 64 | 2/8/4/7/8/8/8 | 2/8/4/7/8/8/8 |
| Tchouaméni #107, VOL, Contra-Ataque Rápido | 64 | 2/8/4/7/8/8/8 | 4/7/4/7/8/8/8 |

A ordem da tabela é Chute, Passe, Drible, Destreza, Força nas pernas, Força em bola aérea e Defesa. As três categorias de goleiro estão zeradas nos exemplos. Nihat e Aubameyang têm aceleração 79 e 74, equilíbrio 73 e 62 e passe rasteiro 63 e 69, respectivamente. Mbappé #049 e Thuram #182 chegaram ao mesmo vetor de 60 PP após ajustes individuais distintos de passe. Essas decisões são propostas de treino. A validação de rendimento em partidas exige observação no jogo.

## Reproduzir e testar

Execute o mesmo script da auditoria com as dependências de cada revisão e grave o resultado em caminhos novos. Para reproduzir o antes, use uma cópia do script em um worktree na revisão `9e6ade9`.

```text
node scripts/audit-fichas-individuais-v389.cjs --output antes.json
node scripts/audit-fichas-individuais-v389.cjs --output depois.json --baseline antes.json --index web/ct389-training-repetitions.json
npm run check:sequential
```

O executor sequencial roda a lista completa de `npm run check` sem o limite de comprimento de comando do Windows. A interface foi conferida no navegador em 390 e 1.366 pixels. Electron e Capacitor usam o mesmo diretório `web`. A execução física do APK e do EXE fica pendente de uma compilação de teste para os respectivos dispositivos.
