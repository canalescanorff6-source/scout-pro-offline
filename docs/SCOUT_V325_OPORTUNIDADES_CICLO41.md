# V325 — ciclo 41 de engenharia proativa · inventário técnico de oportunidades

**Base verificada:** `main` em `fc5bd3f` e release conjunta `v1.1.875` (Android + Windows).  
**Escopo:** Minhas Cartas (246 identidades preservadas) + Outros Elencos, aplicativo web offline compartilhado.  
**Objetivo mensurável:** eliminar corrupção induzida pelo limite de revisões e evitar perda silenciosa de candidatas a habilidades ao atualizar o motor.

## Achados com evidências, impacto, aceitação e situação

### V325-001 · CRÍTICA · Histórico pode ficar ilegível ao completar 51 revisões
- **Módulo:** `web/craque-manager-fichas-v324.js` (`readAll/save`).
- **Prova no código da v1.1.875:** `readAll` recusa `revisions.length>50`; `save` calculava `next=[...versions,row]` sem verificar a contagem. Depois da 51ª gravação o próprio aplicativo passava a recusar leitura e escrita desse perfil.
- **Causa:** validação assimétrica entre leitura e persistência.
- **Impacto:** indisponibilidade de PP/skills/ímpeto candidatos do perfil; nenhum arquivo da carta original corrompido, mas risco real de bloquear histórico de usuário.
- **Risco da correção:** baixo, nenhuma migração de dados, revisão 50 continua legível.
- **Solução executada:** rejeitar a 51ª **antes** da escrita; autorizar apenas a consolidação de auto-rascunho quando ele já é a revisão final.
- **Critérios de aceitação:** 50 revisões manuais válidas; 51ª rejeitada mantendo bytes existentes; auto-rascunho na 50ª continua operando sem apagar snapshots manuais; testes nos dois acervos.
- **Estado:** implementado em branch V325; não declarar integrado sem CI/QA.

### V325-002 · ALTA · Habilidades históricas desaparecem silenciosamente do editor
- **Módulo:** `web/craque-positional-ui-v311.js`.
- **Prova no código anterior:** lista era recriada somente de `recorded.recommendations || outcome.suggestedSkills`, limitada a 5. Itens antigos de `savedProfile.skills` eram usados só para marcar checkboxes presentes na lista nova. Ao salvar, só esses checkboxes eram copiados. Itens não mais recomendados eram excluídos da revisão sem escolha do proprietário.
- **Causa:** descarte do conjunto histórico na criação das opções do formulário.
- **Impacto:** perda de candidatas personalizadas quando a metodologia evolui; pode alterar comparações de técnicos sem intenção.
- **Risco:** baixo/médio; adiciona rótulos de histórico e evita seleções acima de cinco.
- **Solução executada:** unir itens **salvos** com sugestões atuais, históricos primeiro; preservar marcações, marcar candidatos anteriormente salvos mesmo que não mais ranqueados; nunca transformar proposta em skill equipada.
- **Critério:** `Passe de primeira` + `Passe em profundidade` do histórico continuam marcados após nova sugestão de `Toque duplo`, sem ocultar nenhum; só remover por desmarcação explícita; dois acervos isolados; teste de MAT→SA→MAT.
- **Estado:** implementado em branch V325, sujeito aos testes.

### V325-003 · ALTA · Recomendações redundantes com habilidades conhecidas
- **Módulo:** seleção de sugestões de habilidade no perfil.
- **Evidência anterior:** deduplicação exclusivamente textual, até cinco sugestões de saída; o campo `model.skills` de Outros Elencos não era consultado e sugestões salvas em conflito não tinham aviso.
- **Solução executada:** deduplicação controlada por caixa, acentos e espaços; omitir novas candidatas que coincidam com habilidades nativas ou já equipadas **informadas**; manter candidatas históricas coincidentes, mas sinalizar `REVISAR`, sem apagá-las.
- **Limite de prova:** a fonte é somente o cadastro disponível; `model.skills` vazio não autoriza presumir vagas livres. Não comparar equivalências semânticas ou versões distintas sem mapeamento oficial Konami.
- **Estado:** implementado para revisão, sem mudança nos equipamentos reais.

### V325-004 · ALTA · Lacunas na validação de equipamento em Minhas Cartas
- **Módulo:** armazenamento e captura dos cinco slots equipados.
- **Evidência:** `fromPersonal` retorna `skills:''`; ausência de documentação não confirma cinco vagas livres.
- **Impacto:** motor pode sugerir candidato funcional já equipado sem que exista prova no banco pessoal.
- **Solução futura:** esquema de evidência para habilidades adicionais efetivamente equipadas por Card ID e edição (com origem/print e confirmação manual), sincronizar apenas depois de confirmar os slots.
- **Critério:** cada um dos cinco slots tem estado `confirmado`, `vazio comprovado` ou `pendente`; recomendações não são equipadas automaticamente.
- **Estado:** pendente por dados/evidência.

### V325-005 · MÉDIA · Comparação competitiva de propostas PP por técnico
- **Módulo:** V311, V324, motor de frontier e pesos por função.
- **Oportunidade:** explicar ganhos marginais por custo incremental sem Overall, origem dos atributos-base e provas que justificam a recomendação.
- **Critério:** não alterar builds aprovadas, comparação lado a lado da mesma carta/técnico/posição, PP exatos, registrar incerteza quando faltar base.
- **Estado:** próxima candidata independente para o ciclo `Continue`.

## Regras de continuidade (Seção 41)
- Ao receber `Continue`, partir da última `main` e release comprovadas; verificar CI, QA, builds e resultados competitivos, não recitar tarefas.
- Não presumir que 246 fichas já têm novos treinos comprovados para todos os técnicos. Cada recomendação permanece consultiva até validação da edição exata.
- **Teste permanente:** MAT → SA → MAT deve devolver o mesmo perfil e revisões originais de MAT, sem contaminar SA.
- Não alterar PP, 5 habilidades equipadas, ímpetos fixos, raridade, imagens ou Card IDs de origem.
- Só integrar/publicar se CI, QA visual, build Android, assinatura e Windows passarem; pacote conjunto deve ser idêntico em fingerprint.

## Testes adicionados
`node scripts/test-manager-history-v325.cjs` no `npm run check`.
Cobertura de históricos (50/51), auto-rascunhos, duas coleções, id de técnico, posição, deduplicação, nativas/equipadas, proteção das 246 cartas e integração da interface.
