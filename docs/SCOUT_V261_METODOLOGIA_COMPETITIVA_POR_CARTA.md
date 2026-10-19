# Craque Tático V261 — Metodologia competitiva por edição: treino, habilidades e ímpetos

## Regra de aceite obrigatória

O projeto segue critérios de análise competitiva associados pelo usuário a **Blackjhon e Rentão**. Isso **não** significa copiar builds de outras edições, afirmar que os criadores aprovaram as propostas ou substituir evidências da carta exata. Só citar uma build desses criadores como validada quando houver fonte verificável, Card ID/versão compatíveis e indicação do trecho relevante.

## O que muda nesta versão

- A única ficha principal V220/V251 passa a incluir um parecer **recolhível e responsivo** por edição e por estilo: estado do treino, cinco habilidades adicionais, elegibilidade de ímpeto e documentos ainda faltantes.
- O motor puro `methodologyGate` usa **CAP + Card ID**, prova local V254 (lista de equipadas e slots confirmados), motor de boosters, PP e status de origem. Apresenta as prioridades de habilidades como hipóteses táticas, não como instalação comprovada.
- Para **íntentos selecionáveis**, o registro `status='vazio'` no dispositivo é insuficiente quando o próprio catálogo não afirma slot selecionável. O motor V162 agora exige simultaneamente `slotSupported` pela edição (status `selecionavel`/`possivel`) **e** confirmação local de vazio. Quando uma dessas peças falta, a saída é apenas comparativa e o estado é `slot_nao_documentado` ou `slot_nao_verificado`.
- Segundo ímpeto já nomeado/fixo permanece fixo. Slot ocupado/ausente continua impeditivo. Se slot e origem divergem, não equipar nem gastar token sem conferir o Plano de Jogo.
- A recomendação consulta a tática escolhida (prioridade **Posse de Bola central**) e a função tática. Não altera o vetor de níveis original; nenhuma classificação “meta” é produzida sem gameplay comparável.

## Critérios específicos da engenharia

1. **Treino**: PP e nível não autorizam por si só otimização competitiva. Sem atributos-base completos e vídeos/partidas da mesma edição, a build fica registrada ou pendente, nunca atribuída a um criador.
2. **Habilidades**: mostrar até três prioridades no parecer (as demais já estão no painel V162), sem duplicar nativas; slots não confirmados permanecem desconhecidos. Sem nativas documentadas, toda sugestão permanece provisória.
3. **Ímpetos**: explicar a hipótese pelo motor V103 (quatro atributos afetados, função, estilo, investimento e tática), sem confundir o ranking com permissão para equipar; “Instinto Artilheiro” não é resposta universal para atacante.
4. **Proveniência**: fonte da edição, prints/vídeos com Card ID e minuto, biotipo/Player ID e testes comparáveis ainda são requisitos independentes. Nenhuma nova fonte externa foi comprovada nesta V261.
5. **Preservação**: 246 artes e Card IDs, fichas HTML, builds aprovadas, saves, PP, níveis, raridades, ímpetos fixos e formações ficam intactos.

## Testes de regressão

`scripts/test-competitive-method-v261.cjs` percorre **246 cartas × cinco táticas = 1.230** pareceres e verifica:
- Não homologação indevida e ausência de presunção de slots;
- CAP/Card ID por edição;
- Slot “vazio” sem seleção documentada continua bloqueado;
- Slot selecionável + vazio confirmado torna-se elegível para comparação;
- Ímpeto fixo, slot ocupado ou ausente não ficam disponíveis;
- Lista V254 confirmada por fingerprint e invalidação de lista alterada;
- Nenhuma mutação do catálogo original;
- Painel recolhível embutido na ficha única e cache offline atualizado.

O teste entra em `npm run check`. Merge e release requerem CI, auditoria e QA visual Windows/Android aprovados. A instalação física continua dependente de validação no dispositivo. A Issue #165 documenta o aceite permanente.

## Limites atuais

Esta versão **não** entrega fichas “iguais” às builds pessoais de Blackjhon/Rentão, porque essa identificação exige prints/vídeos concretos da mesma edição e confirmação da metodologia/aplicação. A V261 prepara o sistema para bloquear inferências sem fonte e exibir claramente as lacunas por carta. A revisão competitiva individual é uma etapa seguinte, não declarada concluída aqui.
