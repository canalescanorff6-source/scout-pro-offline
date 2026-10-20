# Craque Tático V265 — função correta no ranking de ímpetos

## Problema comprovado no motor V104/V103

A consulta direta `B.rank(card,style)` usava `card.posicao || card.shown_position || card.role_used`. Como `posicao` é a origem imutável, uma função alternativa **já confirmada** pelo treinamento de posição V246/V263 podia ser ignorada. Exemplo: Gabriel Martinelli #191, PTE original, passando a CA mediante confirmação V246. A função em `S.booster()` tinha proteção parcial, mas outros consumidores do motor direto continuavam divergentes.

No mesmo motor, o mapa de posições **omitia MLE** (oito cartas no catálogo) e representava `DE` e `LE` como `LD`, prejudicando a identificação funcional de laterais esquerdos. O motor de habilidades e o motor tático já possuem essas posições corretamente.

## Correção V265

1. `B.rank` usa `role_used || shown_position || posicao`, o mesmo eixo prioritário do painel V162. Isso é apenas **análise**: `B.rank` não confere doutrinação; a V251/V246 continua sendo a barreira de confirmação por CAP e Card ID.
2. O motor passa a mapear `MLE: ALA` e `DE/LE: LE`. Os pesos de LE foram copiados da função LD já existente: nenhuma força numérica, atributo-base, overall ou build foi inventada. A mudança corrige a identificação e a ausência de ranking, não altera o padrão de movimentação do eFootball.
3. Cada resultado de ímpeto exibe a propriedade `funcao_considerada`, para auditar divergências sem usar Overall.
4. O teste `scripts/test-booster-role-v265.cjs` percorre **246 cartas × cinco estilos = 1.230 cenários**, exige opções comparativas para todas as posições cadastradas, valida MLE e LE/DE, confirma a paridade do ranking com o adaptador V162 e prova Martinelli PTE→CA somente após V246, com revogação e isolamento por edição.
5. A suite continua proibindo afirmar que alguma recomendação foi aprovada por Blackjhon ou Rentão sem vídeo e Card ID exatos.

## Garantias e publicação

Nenhum arquivo de carta, vetor de PP, arte, ID, habilidade nativa, habilidade adicional confirmada, ímpeto fixo ou save foi editado. Alteram-se exclusivamente o **algoritmo de leitura**, os testes, a documentação e o cache offline Windows/Android.

Esta V265 não homologa automaticamente as 246 builds competitivas. O dossiê V264 continua a fonte consultiva com evidências e pendências por carta.

Merge somente depois de CI, auditoria de integridade, QA visual e builds Windows/Android aprovados. Release oficial somente após testes pós-merge; instalação física deve ser conferida nos dispositivos.
