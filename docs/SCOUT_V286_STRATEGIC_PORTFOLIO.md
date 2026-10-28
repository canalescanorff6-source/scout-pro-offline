# V286 — Otimizador de conjunto das cinco habilidades e ímpetos

**Base oficial:** `v1.1.699` (V285) no repositório existente. **Acervo original:** 246 cartas preservadas. As avaliações cobrem os cinco estilos: Posse de Bola, Contra-Ataque Normal, Contra-Ataque Rápido, Por Fora e Passe Longo.

## Mudanças de decisão (não apenas texto)

1. O `evaluate` oferece agora a relação completa das habilidades elegíveis, além do top cinco e da alternativa equilibrada das versões anteriores.
2. A V286 examina **todas as combinações possíveis de até cinco habilidades dentro dessa relação**, sem transformar as habilidades em atributos finais mensuráveis.
3. Mantém a soma dos sinais documentais de função, estilo, nativas e investimento coerente de PP que o motor já usava.
4. Considera cobertura de famílias prioritárias à função e cobertura das famílias relevantes ao estilo.
5. Penaliza repetições excessivas da mesma família, sem proibir repetições quando fazem sentido.
6. Penaliza levemente o excesso de habilidades da mesma família de nativas cadastradas; não assume equivalência de skills distintas.
7. Recompensa complementaridades consultivas explícitas: tabela e profundidade, domínio e giro, interceptação e bloqueio, passe e chute de primeira.
8. Usa desempate estável pela ordem existente do motor; não muda a lista sem um ganho heurístico relevante.
9. **Preserva o top cinco anterior** quando a melhora da combinação for menor que três pontos ou não houver mudança real.
10. A recomendação é uma **segunda proposta consultiva**, nunca uma substituição de build ou habilidade aprovada.
11. Se nativas/skills já presentes deixam menos de cinco candidatas, mostra exatamente o número disponível sem inventar habilidades, duplicar nativas ou declarar vagas reais.
12. Quando o usuário confirma a lista de habilidades da edição, o cálculo respeita os slots restantes sem permitir mais de cinco.
13. Faz uma comparação lado a lado das habilidades originais e do conjunto proposto; mostra critérios de cobertura, bônus e penalidades.
14. Apresenta cada habilidade em português, família, prioridade anterior e o motivo técnico já cadastrado.
15. Mantém a escolha inicial de ímpeto por motor de função/tática/treino, mas compara alternativa de score próximo pela sobreposição dos quatro atributos com o ímpeto fixo.
16. Não muda o ímpeto líder por ganho de diversidade arbitrária, e sobreposição nunca é tratada como bônus ou desperdício garantido.
17. Sem segundo slot no catálogo ou sem comprovação de slot vazio na conta, não existe permissão para gastar tokens.
18. Evidências pendentes são priorizadas: CAP/Card ID/edição, nativas desconhecidas, PP, adicionais, status dos dois slots, bases completas e comparação de gameplay.
19. Identidades **pendentes** permanecem explicitamente pendentes (inclusive #050 Messi).
20. A V286 não altera `SCOUT_V69_AUDITORIA.json`, fichas HTML de origem, imagens, códigos, raridades ou treinos aprovados.
21. Integração na ficha principal como seção recolhível, responsiva, com a identidade visual do projeto em Android e Windows offline.
22. Compatibilidade das versões anteriores preservada: os rankings `V162/V284/V285` continuam disponíveis para comparação, não apagados.
23. Novo teste `scripts/test-strategic-portfolio-v286.cjs` percorre 246 × 5 cenários, verifica exclusão de nativas, unicidade de habilidades, falta de candidatas, compatibilidade do slot e não alteração dos dados.
24. Relatório `build/v286-strategic-portfolios-246x5.json` detalha todas as propostas, alterações e lacunas de evidências por edição e tática.
25. QA em Chromium com oito viewports, detalhamento de comparação V286 em 390 px e 1151 px.
26. Cache offline sincronizado e arquivos de Android/Windows gerados do mesmo commit após gates verdes.

**Limitações essenciais:** o objetivo é melhorar a robustez da heurística; nenhuma nota demonstra taxa de vitórias, performance, build meta, atributos finais, vantagem real de booster ou aprovação atribuível a Rentão/Blackjhon. Esses criadores são referências de rigor técnico; a atribuição exige vídeo e carta exatos.

**Publicação:** revisão, testes, auditoria física, QA visual e builds de validação todos verdes antes de mesclar; somente publicar APK assinado e EXE quando o pipeline da `main` terminar e os cinco artefatos da release forem conferidos.
