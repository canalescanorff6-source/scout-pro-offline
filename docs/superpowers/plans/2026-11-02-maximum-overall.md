# Overall máximo em todos os acervos — V387

**Objetivo:** valores informados pelo usuário devem persistir e aparecer nos cartões, fichas e plano do time da Principal/Secundária, nas 261 cartas legadas e em Outros Elencos.

**Base:** d598b4d / v1.1.1286. Worktree existente, branch fix/maximum-overall-v387; inclui checkpoint local 407a29d da entrega anterior. Pedido de corrigir o app e atualização já autorizada permanecem aplicáveis. Não repetir V386.

**Diagnóstico:** a revisão/info V379 salva maxOverall, mas paint V376 desenha somente OVR contextual. Modelos privados V382 e Outros V227 descartam o campo. Seus formulários e apresentações não o incluem. Não inventar números nem modificar treinos/PP para produzir um Overall.

## Etapas

- [x] Testes RED para preservação/importação/exportação, validação opcional 1–150, limpeza, isolamento e vínculo à edição. Overall informativo não deve invalidar histórico de treino.
- [x] Integrar maxOverall opcional aos modelos privados e Outros. Preservar estruturas antigas sem nova escrita automática. Integrar campo aos editores, cartões, fichas e plano.
- [x] Resolver máximo declarado das 261 legadas respeitando identidade e restauração. Mostrar no selo como máximo informado; manter OVR contextual separado no painel e no cálculo. Atualização imediata ao salvar e após reabrir.
- [ ] QA real de salvar/reabrir/limpar nas duas contas, carta original/própria e outro elenco; identidade, histórico, backup e regressões. 305 checks e matriz visual. Revisão independente.
- [ ] PR/CI, publicação e atualização Windows com backup. APK oficial para Android; respeitar restrição já observada no aparelho, sem repetir tentativa ou alterar segurança sem nova orientação.

## Limites

- Não alterar as 246 cartas/fichas/imagens originais em disco nem dados privados existentes.
- Número declarado é informativo, não prova de treinamento/técnico e não altera desempenho calculado.
- Limpar o campo remove a referência manual; outra edição não herda o máximo anterior.
- Evitar migrar ou gravar automaticamente os cadastros antigos; continuar exportando/restaurando com isolamento por conta/pessoa.

## Evidências e revisão

- RED: normalizador descartava111; selo não exibia112 após salvar; importação com novo ID perdia máximo. GREEN: validação, isolamento, importação e histórico informativo passam.
- Revisão independente encontrou quatro referências declaradas omitidas do selo e conflito entre INFO/revisão V379. RED→GREEN:112 antigo não bloqueia115 posterior; limpeza explícita não recupera referência. Timestamps monotônicos entre editores e marcador de presença distinguem ausência/limpeza sem migrar registros antigos.
- Rechecagem encontrou herança indevida ao reabrir rascunho legado de outra edição; QA RED→GREEN com guard de identidade. Projeções personal/owned também seguem o máximo atual. Revisão final sem novos achados importantes.
- UI novo PASS em320/390/1366: quatro referências, originais/próprias, duas contas, Outros, plano, edição, reabertura, limpar e112→115 entre editores.305checks finais PASS, QA editor/revisão/rating PASS. Uma tentativa de rating em execução concorrente falhou na assertiva do seletor; repetição com o mesmo código passou, sem mudança no produto. CI ainda deve conferir esse caso.
- Matriz ampliada final em andamento; nenhuma nova publicação ou instalação feita nesta etapa ainda.
