# V312 · Auditoria complementar da inteligência posicional V311

## Evidências de origem
- Base: `v1.1.822` e `main@e6573cd8be9a`.
- Os dois acervos já contavam com o seletor de posição V311; esta revisão **não os recria**.
- A edição do técnico separava o armazenamento, porém não exibia suas proficiências dentro do novo painel.
- O snapshot persistia PP/habilidades/primeiro ímpeto, mas perdia o ranking de alternativas, justificativas e prioridades ofensivo-defensivas do momento em que o plano foi salvo.
- A importação de Outros Elencos rejeitava snapshots com aprovação anteriormente registrada, contrariando a obrigação de preservação de histórico.

## Correções
- `web/craque-positional-v311.js`: `managerEvidence` obtém somente dados documentados na base V302 por versão exata e estilo coletivo; bônus nunca contam como PP. `responsibilities` descreve responsabilidades ofensivas/defensivas como hipóteses funcionais, sem inventar movimentação ou ativação individual.
- `snapshot()`: registra distribuição PP, habilidades candidatas com explicações, ranking de ímpetos e alternativas, prioridades de atributos, responsabilidades, avisos e contexto de técnico. `save()` cria uma nova revisão sem alterar builds homologadas.
- `importOwnerScenarios()`: preserva `approved` em cenários importados da mesma edição e sinaliza `evidenceImported`; não concede novas aprovações. Rejeita importações cuja identidade de edição não corresponda à carta importada. Mantém isolamento de proprietário.
- `web/craque-positional-ui-v311.js`: mostra dados reais do técnico por edição e recupera as informações do cenário persistido, não misturando ímpetos e prioridades recém-recalculados com a revisão anterior.
- `web/craque-friends-training-ui-v228.js`: esclarece que cinco recomendações **não comprovam** disponibilidade de cinco slots livres.
- Cache offline V312 invalidado para Android e Windows.

## Provas automatizadas
- `scripts/test-position-scenarios-v311.cjs`: comparação MAT/SA, paridade dos cinco estilos, duas versões do técnico, restauração de foco/habilidades/ranking/PP, importação preservando aprovação anterior e identificadores de terceiros sem contaminação.
- `scripts/qa-position-v311.py`: verifica UI de ambos acervos em viewport Android e Windows, incluindo responsabilidades, limitações de slots e integridade do snapshot.
- CI, QA, builds de teste, assinatura/release pós-merge são gates independentes. Não considerar publicação concluída sem confirmação de artefatos.

## Limites
Sem Card ID e comprovação de posição treinada/estilo ativado, a informação permanece **PENDENTE**; cenário SA é simulação. Não existe atribuição automática de habilidades, ímpetos, bônus, nem alteração real da carta no eFootball. Integração direta com TODAS as vagas das formações permanece item de auditoria posterior.
