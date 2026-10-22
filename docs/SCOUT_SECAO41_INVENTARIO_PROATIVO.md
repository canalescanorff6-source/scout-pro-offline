# Inventário proativo — Seção 41 — 22/10/2026

Baseline anterior: `124d11ec83181398e05d7e88eb63a2c3f4a4c4d7`. Atualização verificada: V318 integrada via PR #228 (`9b864e23aeaf23a3a59154b41e8f30371d315c83`) e publicada como `v1.1.844`. Este inventário não comprova benefícios competitivos em partida.

| Prioridade | Módulo | Evidência | Impacto e causa | Solução / aceitação / teste | Estado |
|---|---|---|---|---|---|
| CRÍTICA | Cenários posicionais V311 | `withSaved` validava base/posição/estilo/técnico, mas não a assinatura documental nem consistência do orçamento PP | Uma revisão importada ou corrompida poderia contaminar a comparação com níveis/PP de outro estado | Rejeitar restauração contextual divergente sem apagar histórico; regressões de assinatura, PP e 10 níveis, MAT → SA → MAT, dois acervos | V318 integrada e publicada; CI/QA/compilação e release conjuntos aprovados |
| ALTA | Exibição de slots adicionais V228/V162 | V162 devolve `slotsRemaining:null` sem recibo; V228 convertia `5 − adicionais informadas` em `freeSkillSlots` e a UI exibia esse número | Risco de confundir possibilidade de recomendar com vaga de habilidade comprovadamente vazia; consequência é recomendação usada como se houvesse slot real | Separar `candidateCapacity` (máximo consultivo) de `freeSkillSlots` (somente dado comprovado), rever interface em Outros Elencos e testar paridade em Minhas Cartas | V319 integrada e publicada; vagas consultivas separadas dos slots comprovados (release v1.1.846) |
| ALTA | Habilidades V162 e V228 | Recomendações devem ser comparadas a habilidades nativas e equipadas antes de ocupar os cinco slots | Risco de sugestões redundantes; faltam casos comprovados por Card ID | Auditar nomes oficiais, deduplicação e slots desconhecidos; testes por função/edição; nenhuma habilidade equipada modificada | Pendente de auditoria |
| ALTA | Ímpetos V103/V228 | Ranking consultivo exige validação de ímpeto fixo, slots e efeitos documentados | Risco de ranking genérico | Criar casos de ímpeto fixo/duplo/vazio/desconhecido e custo de oportunidade, sem inventar efeitos | Pendente |
| ALTA | Otimização PP V228/V220 | Alocação matemática por função e estilo pode ser válida sem ganho competitivo demonstrado | Custo progressivo e pesos por função precisam de testes com cartas exatas | Comparar propostas com mesmo orçamento, documentar hipóteses e não tocar builds homologadas | Pendente |
| MÉDIA | UX Android/Windows | A restauração de cenários é compartilhada, mas testes físicos não foram realizados nesta auditoria | Risco de diferença entre dispositivo real e QA | QA visual e teste físico de instalação/armazenamento offline | Pendente |

**Critérios globais:** preservar as 246 cartas originais, builds aprovadas e histórico; não afirmar endosso de Rentão/Blackjhon; distinguir proposta de equipamento; comprovar CI, QA e builds antes de publicação. A próxima execução deve atualizar o inventário com evidências e resultados reais.

## Continuidade V319

Código alterado: `web/craque-friends-training-v228.js`, `web/craque-friends-training-ui-v228.js`, cache offline e testes em `scripts/test-friends-training-v228.cjs` e `scripts/test-position-scenarios-v311.cjs`. Distinção de slots não equivale a comprovação de habilidades equipadas. Testes físicos em aparelhos continuam pendentes. Próximo ciclo: auditar recomendação específica de habilidades/ímpetos e custos de PP por função, sem inventar dados por edição.

## V320 — Detecção proativa: custo progressivo e contaminação goleiro/linha

- **Prioridade:** CRÍTICA (integridade matemática e recuperação de histórico).
- **Módulo:** `web/craque-positional-v311.js` compartilhado nos dois acervos.
- **Evidência:** `revisions()` marcava como vigente qualquer snapshot cuja assinatura de base coincidisse, mesmo que seu vetor de 10 níveis custasse menos/mais PP que o orçamento. `withSaved()` validava faixas de níveis, mas não custo progressivo nem categorias compatíveis com GO/jogador de linha.
- **Causa:** confiança excessiva em assinatura local/PP declarado, sem revalidar a alocação do histórico antes da apresentação.
- **Impacto funcional/competitivo:** poderia apresentar como atual treino matematicamente impossível, ou treinamento de GK em jogador de linha, contaminando comparação MAT/SA, skills e ímpetos associados ao cenário.
- **Alteração:** `revisionCurrent()` verifica chave e identidade documental, custo pela mesma fórmula tática V220, orçamento, categoria da função e histórico pendente. `saved()` e `withSaved()` compartilham o mesmo verificador. Histórico original continua íntegro, embora o snapshot incorreto seja sinalizado como desatualizado.
- **Risco/limite:** não prova desempenho em partidas; nenhuma alteração do orçamento, aprovação, atributos-base ou imagem.
- **Critérios de aceitação:** revisão íntegra segue vigente; revisão de custo errado passa a stale; mover PP para categorias GO/linha com o mesmo custo bloqueia; MAT→SA→MAT continua preservado; 246 cartas intactas; Android/Windows usam o mesmo arquivo.
- **Testes:** `scripts/test-position-scenarios-v311.cjs` e `npm run check` em CI; QA visual; builds Android/Windows; nenhum teste físico afirmado.
- **Estado:** V320 integrada e publicada na release v1.1.848; CI, QA visual e pacotes oficiais aprovados.

**Próximo risco a auditar:** robustez das recomendações de cinco habilidades quando a lista nativa e a lista equipada estão incompletas ou usam grafias equivalentes; validar candidatos por função sem alegar slots equipados.

## V321 — Detecção proativa: elegibilidade circular do segundo ímpeto

- **Prioridade:** CRÍTICA, integridade da evidência antes de gastar tokens.
- **Módulos afetados:** `web/craque-friends-training-v228.js`, `web/craque-friends-training-ui-v228.js`, cadastro externo e motor compartilhado de ímpetos V162/V103.
- **Evidência de código:** antes da V321, `profileOf()` convertia `boosterSlot:'vazio'`, um relato manual da conta, em `boost2:'SLOT SELECIONÁVEL'`. O motor V162 consultava esse novo marcador como se viesse da edição/catálogo. Assim, um relato era usado como fonte independente de si mesmo, e `boosterEligible` podia tornar-se `true` sem comprovação da edição.
- **Causa provável:** adaptação de dados de conta ao formato do catálogo, que mistura prova de existência de slot na carta com relato de ocupação/vazio.
- **Impacto competitivo:** indicação falsamente elegível pode induzir investimento incorreto de tokens e interpretação equivocada do ranking de ímpetos. Não cria PP, mas compromete recomendações.
- **Impacto funcional:** etiquetas na ficha externa exageravam a confiança no slot. A carta original, o ímpeto fixo e nomes de ímpetos equipados NÃO podem ser alterados pelo ajuste.
- **Dados necessários:** comprovação independente, por Card ID/edição exata, de que há um segundo slot selecionável. O esquema de cadastro externo atual não inclui recibo documental separado desse marcador.
- **Solução implementada na branch:** preservar o nome de ímpeto informado; quando não existe evidência própria do catálogo, representar `boost2` como nome registrado ou `PENDENTE`; retornar `boosterEligible:false` mesmo que usuário tenha relatado slot vazio; manter comparação/ranking; expor `boosterSlotEvidence` com estados distintos; avisar quando “vazio” contradiz o nome equipado. Texto do cadastro e painel explicitam a lacuna.
- **Riscos:** a alteração torna mais conservadora a indicação de elegibilidade em Outros Elencos; pode exigir futura confirmação documental para permitir sugestões acionáveis. Nenhum equipamento real é apagado nem modificado.
- **Critérios de aceitação:** `vazio` relatado sem comprovação de edição não fabrica `SLOT SELECIONÁVEL`; o mesmo ímpeto fixo não reaparece como recomendação; nome cadastrado não desaparece; rankings dos cinco estilos continuam consultivos; provas positivas independentes no motor V162 continuam reconhecidas; Minhas Cartas e Outros Elencos mantêm o mesmo motor de posição/PP/skills/boosters; 246 cartas intactas.
- **Testes exigidos:** `scripts/test-friends-training-v228.cjs`, `scripts/test-position-scenarios-v311.cjs`, `scripts/qa-position-v311.py` em duas dimensões Android/Windows, `npm run check`, CI e builds, auditoria dos 246 IDs/cartas, integridade Android e Windows.
- **Estado:** V321 implementada na branch `fix/v321-booster-slot-evidence-separation`, aguardando PR/CI/QA/publicação; não afirmar validação física ou melhoria competitiva em jogo.

**Próxima oportunidade de prioridade alta:** considerar uma prova de suporte a slot vinculada à edição/ID da carta externa, separada do estado de ocupação do usuário, sem inferir esses dados de Overall ou de nome do jogador. Auditar também deduplicação de habilidades nativas/especiais e variação por função tática.
