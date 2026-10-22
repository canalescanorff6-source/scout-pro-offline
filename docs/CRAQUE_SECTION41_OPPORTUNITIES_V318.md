# Seção 41 — inventário proativo de oportunidades / V318

**Baseline verificável ao iniciar esta execução:** `main@45076a51f82721509ceec6261e3de5e6355e33a8`, release `v1.1.840`; CI/QA da release publicados com sucesso. Não reiniciar o aplicativo.

## Oportunidades auditadas

| ID | Prioridade | Módulo | Evidência no código | Impacto e causa | Solução e aceitação | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| OP-318-A | **CRÍTICA** | `craque-positional-v311.js` — persistência offline | `stored()` capturava JSON inválido/esquema divergente e devolvia `{}`; `save()` poderia gravar por cima do histórico original | Risco real de perda irrecuperável de revisões MAT/SA e aprovações históricas, independentemente de proprietário | Bloquear gravações quando há corrupção; nunca alterar bytes anteriores; aviso explícito e regressões para JSON truncado, esquema incompatível e revisão de tipo incorreto | **Implementada na branch V318; CI/QA ainda devem validar** |
| OP-318-B | **ALTA** | UI de histórico posicional | O painel acessava somente `saved()`, que devolvia a revisão mais recente da chave composta. Revisões antigas existiam no JSON, mas não eram navegáveis | Impossibilidade prática de consultar proposta/aprovação anterior depois de salvar outra revisão | Novo seletor read-only de revisões por carta+posição+estilo+edição do técnico; alternar MAT/SA conserva escolha; salvar mantém versões anteriores | **Implementada na branch V318; CI/QA pendentes** |
| OP-318-C | ALTA | Habilidades adicionais de Minhas Cartas | O adaptador pessoal `fromPersonal()` usa `skills:''` e `boosterSlot:'pendente'`, ao passo que o externo consulta os campos do cadastro | Potencial de recomendar habilidade já equipada se esse dado estiver registrado em outra fonte da ficha pessoal; risco de inferioridade na precisão de um acervo | Auditar campos efetivamente documentados/evidência antes de integrar; sem presumir cinco slots livres; regressão por Card ID e posição | **Pendente: exige auditoria da origem dos equipamentos** |
| OP-318-D | ALTA | Ímpetos e posições | `familiarity()` marca posição original como registrada; para outras posições sem comprovação retorna pendente; cenário não valida ativação de estilo individual | Evitar recomendações afirmando proficiência/estilo ativo sem prova | Integrar fontes oficiais por edição, distinguir treinável/familiar/inativa sem Overall | **Pendente de fonte documental por edição** |
| OP-318-E | MÉDIA | Orquestração de formação | Motor V314 já oferece função/vaga no contexto, mas integração com todas as vagas reais da escalação não foi homologada | Risco de contexto do laboratório diferente da vaga efetiva | Testes de ponta a ponta com escalação real e cenários por proprietário | **Pendente** |
| OP-318-F | MÉDIA | Testes de desempenho em coleções | Limite de 1.200 cartas externas documentado em V227, mas não há evidência desta execução sobre latência para muitas coleções/snapshots | Travamentos ou estouro de quota sob carga | Benchmark por quantidade de cartas e snapshots com medição de tempo e armazenamento | **Pendente** |

## Escopo do lote V318

**Motores compartilhados:** `web/craque-positional-v311.js` e `web/craque-positional-ui-v311.js` (ambos os acervos, sem mudar o armazenamento da carta-base). Foco: proteção do histórico e navegação por revisão. Nenhum Card ID, PP, habilidade, ímpeto, imagem ou build aprovada foi alterado.

### Testes de aceitação
- JSON truncado, schema inesperado e coleção de revisões malformada devem bloquear `save()`, preservando os bytes da chave local.
- `revisions()` deve listar tanto a revisão MAT #1 quanto a #2, sem alterar qualquer uma; SA e técnicos permanecem isolados.
- Regressão MAT→SA→MAT, cinco estilos, PP, habilidades e ímpetos compartilham motores existentes, com fichas originais intactas.
- QA visual Android/Windows deve permitir alternar revisões SA #1/#2 e comprovar bloqueio de gravação de histórico ilegível, sem apagar dados.
- Integrar/publicar somente quando CI, QA visual, auditoria das 246 cartas, compilação e assinatura Android e Windows passarem no commit final.

## Limites e próxima prioridade

Não homologar resultado competitivo real apenas por cálculo; sem evidência de edição, marcar PENDENTE. Nenhuma execução assíncrona contínua foi agendada: ao receber **Continue**, reconsultar GitHub e retomar a oportunidade pendente de maior impacto, começando por OP-318-C. Testes físicos nos aparelhos do usuário continuam pendentes.
