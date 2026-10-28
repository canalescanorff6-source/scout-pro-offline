# Scout PRO V187 — ficha principal de Posse, ímpetos e pendências

## Diagnóstico resolvido

O motor V162 produzia um ranking válido de ímpetos, mas retornava `primary=null` quando o slot adicional não estava confirmado. Isso impedia que a ficha mostrasse **qual ímpeto seria o melhor para a função**, confundindo sugestão competitiva com autorização de equipar.

O motor agora devolve sempre a melhor opção de sua lista oficial de 28 ímpetos selecionáveis para cada uma das 246 cartas, por tática e função. A disponibilidade do slot é uma avaliação **separada**: `condicionado_a_slot`, `slot_nao_verificado`, `comparacao_segundo_fixo` ou `impossivel_na_conta`. Não se inventa segundo slot, não se trata um booster do eFHUB como equipado e não se pede que o usuário insira primeiro um booster para saber qual é a recomendação.

Ranking é uma **hipótese fundamentada em quatro atributos afetados, estilo, posição e tática**. Não é prova de melhor desempenho absoluto, nem garante aplicação. Nas cartas com dois ímpetos fixos, só se mostra comparação informativa; não se pede terceiro booster.

## Cinco habilidades adicionais

- Exclui nativas documentadas (243/246), adicionais que o usuário informou já equipar e nomes equivalentes PT-BR/EN.
- Melhora equivalências de tradução verificáveis nos prints: Chute de primeira, Precisão à distância, Cabeçada, reposições de goleiro, entre outras.
- NÃO confunde `Chute ascendente` com `Chute de longa distância`: são habilidades diferentes.
- Deixa claras cinco **prioridades para a função**, não garantias de que o token tenha sido aplicado. Nas três cartas sem lista canônica (#050, #151 e #181) a recomendação continua explicitamente provisória, embora seus prints de skills possam ser consultados na ficha.
- Default tático: **Posse de Bola**. Contra-ataques permanecem nas opções.

## Uma ficha para usar

O topo de cada ficha agora explica **qual abrir primeiro**: `Minha ficha principal · Posse de Bola`, com uso/função, cenário de treino e PP preservados, acesso direto às cinco habilidades e melhor ímpeto.

Relatórios anteriores ficam recolhidos por padrão, mas continuam acessíveis no botão **Ver análises detalhadas (opcional)**. O painel técnico de prints V184 também fica recolhido. Nada foi apagado: o objetivo é reduzir a redundância.

## Biotipo com rastreabilidade, não Player ID inventado

- `web/scout-posse-v187.js` vincula **apenas as 15 observações físicas já transcritas** em `SCOUT_V184_EFHUB_241_COMPLETE.json` a suas respectivas fichas, quando há associação singular.
- Mostra altura, peso, uso e precisão do pé fraco, forma física, resistência a lesões, alcance de pernas/braços, salto e colisão **quando constam no print**.
- A visualização ainda é do eFHUB, não leitura numérica do Card ID na conta. Não transforma medidas em Play ID oculto, velocidade de animação ou habilidade de gameplay comprovada.
- As **226 capturas restantes** precisam de segunda transcrição focada nas medidas, pé fraco e forma; nenhuma medida foi inferida nesta mudança. As 241 listas de habilidades V184 estão preservadas para essa etapa.

## Raridades: separação entre cadastro e histórico

Os 56 casos na página V91 já constam com `raridade_confirmada` no repositório. A página ainda exibia uma lista histórica de divergências como se houvesse trabalho pendente. Agora mostra **somente mudanças feitas localmente que ainda não foram enviadas**; se não houver, diz `Raridades desta revisão: tudo registrado`. O histórico continua acessível. Atualizações de raridade **salvas somente em localStorage** precisam ser copiadas/encaminhadas para o GitHub: isso não é sincronização automática.

## Proteção de dados

Preservados 246 artes, Card IDs, níveis máximos, PP, builds, jogadores, bios anteriormente registradas, slots/boosters e ímpetos de fábrica. Sem alegar instalação automática de habilidades/booster, teste competitivo real ou certificação de Player ID.

## Arquivos

- `web/skills-booster-v162.js`: correção do bloqueio do `primary`, equivalências, ordenação de função e mensagens.
- `web/scout-posse-v187.js` e `.css`: ficha principal e biotipo, expansão controlada dos relatórios.
- `web/app-bridge.js`: ativação em todas as fichas.
- `web/raridade-cadastro-v91.html`, `web/index.html`: distinção histórico x pendências.
- `web/sw.js`: cache offline para atualização.
- Testes existentes V162/V178 atualizados e `scripts/test-posse-v187.cjs` integrado ao npm check.

Apenas completar o GitHub Actions com auditoria e builds Windows/Android GREEN antes de integrar e publicar. O teste físico de usabilidade e desempenho do Android ainda depende de instalação no dispositivo.
