# Auditoria V389 das fichas individuais

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
