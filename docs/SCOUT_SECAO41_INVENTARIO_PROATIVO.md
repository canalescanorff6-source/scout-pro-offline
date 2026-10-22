# Inventário proativo — Seção 41 — 22/10/2026

Baseline anterior: `124d11ec83181398e05d7e88eb63a2c3f4a4c4d7`. Atualização verificada: V318 integrada via PR #228 (`9b864e23aeaf23a3a59154b41e8f30371d315c83`) e publicada como `v1.1.844`. Este inventário não comprova benefícios competitivos em partida.

| Prioridade | Módulo | Evidência | Impacto e causa | Solução / aceitação / teste | Estado |
|---|---|---|---|---|---|
| CRÍTICA | Cenários posicionais V311 | `withSaved` validava base/posição/estilo/técnico, mas não a assinatura documental nem consistência do orçamento PP | Uma revisão importada ou corrompida poderia contaminar a comparação com níveis/PP de outro estado | Rejeitar restauração contextual divergente sem apagar histórico; regressões de assinatura, PP e 10 níveis, MAT → SA → MAT, dois acervos | V318 integrada e publicada; CI/QA/compilação e release conjuntos aprovados |
| ALTA | Exibição de slots adicionais V228/V162 | V162 devolve `slotsRemaining:null` sem recibo; V228 convertia `5 − adicionais informadas` em `freeSkillSlots` e a UI exibia esse número | Risco de confundir possibilidade de recomendar com vaga de habilidade comprovadamente vazia; consequência é recomendação usada como se houvesse slot real | Separar `candidateCapacity` (máximo consultivo) de `freeSkillSlots` (somente dado comprovado), rever interface em Outros Elencos e testar paridade em Minhas Cartas | Implementado na branch V319; aguardando CI e QA |
| ALTA | Habilidades V162 e V228 | Recomendações devem ser comparadas a habilidades nativas e equipadas antes de ocupar os cinco slots | Risco de sugestões redundantes; faltam casos comprovados por Card ID | Auditar nomes oficiais, deduplicação e slots desconhecidos; testes por função/edição; nenhuma habilidade equipada modificada | Pendente de auditoria |
| ALTA | Ímpetos V103/V228 | Ranking consultivo exige validação de ímpeto fixo, slots e efeitos documentados | Risco de ranking genérico | Criar casos de ímpeto fixo/duplo/vazio/desconhecido e custo de oportunidade, sem inventar efeitos | Pendente |
| ALTA | Otimização PP V228/V220 | Alocação matemática por função e estilo pode ser válida sem ganho competitivo demonstrado | Custo progressivo e pesos por função precisam de testes com cartas exatas | Comparar propostas com mesmo orçamento, documentar hipóteses e não tocar builds homologadas | Pendente |
| MÉDIA | UX Android/Windows | A restauração de cenários é compartilhada, mas testes físicos não foram realizados nesta auditoria | Risco de diferença entre dispositivo real e QA | QA visual e teste físico de instalação/armazenamento offline | Pendente |

**Critérios globais:** preservar as 246 cartas originais, builds aprovadas e histórico; não afirmar endosso de Rentão/Blackjhon; distinguir proposta de equipamento; comprovar CI, QA e builds antes de publicação. A próxima execução deve atualizar o inventário com evidências e resultados reais.

## Continuidade V319

Código alterado: `web/craque-friends-training-v228.js`, `web/craque-friends-training-ui-v228.js`, cache offline e testes em `scripts/test-friends-training-v228.cjs` e `scripts/test-position-scenarios-v311.cjs`. Distinção de slots não equivale a comprovação de habilidades equipadas. Testes físicos em aparelhos continuam pendentes. Próximo ciclo: auditar recomendação específica de habilidades/ímpetos e custos de PP por função, sem inventar dados por edição.
