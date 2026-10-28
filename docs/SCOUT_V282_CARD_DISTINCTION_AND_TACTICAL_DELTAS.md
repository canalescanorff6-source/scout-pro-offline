# V282 — Distinção por evidências reais, contrafactuais táticos e auditoria de recomendações repetidas

Base oficial: `canalescanorff6-source/scout-pro-offline`, main `d610a2e8aba64138ffd8f9c4a2867f379971bf2d` (continuação de V281, release anterior v1.1.680). **Não é projeto novo.**

## Entregas técnicas (sem modificar builds)
1. Perfil de evidências para cada um dos **246 Card IDs/edições** e seus cinco estilos.
2. Identidade CAP, Card ID, nome da edição, posição original e posição utilizada tratadas como campos distintos.
3. Impressão documental das habilidades nativas, incluindo aliases normalizados.
4. Contagem separada de nativas comuns, especiais contextuais e nomes sem interpretação.
5. Vincular orçamento PP, estado de validação e vetor exato à análise sem arredondar PP estimado.
6. Mostrar vetor de dez categorias somente quando o orçamento matemático foi verificado; matemático **não significa aprovado por criador**.
7. Para cada uma das cinco habilidades sugeridas, expor separadamente função, tática, estilo, nativas e investimento de treino.
8. Conferir que a soma dos cinco fatores reproduz exatamente a pontuação consultiva.
9. Mostrar margem para próxima habilidade, deixando claro que diferenças pequenas não provam superioridade.
10. Identificar elementos documentais pendentes por carta (identidade, nativas, vetor, atributos-base, slots).
11. Manter nativas especiais como referência de contexto, não como adicionais equipáveis.
12. Manter limites reais das cinco habilidades e nunca pressupor que existam cinco slots vazios.
13. Impedir alteração automática de treinos, ímpetos e habilidades em qualquer parecer.
14. Comparar duas cartas da mesma função, tática ou contexto **sem mesclar identidades**.
15. Detectar quando duas cartas recebem as mesmas cinco recomendações apesar de terem nativas distintas.
16. Detectar a mesma situação quando os vetores PP são diferentes.
17. Detectar a mesma situação quando o orçamento PP, estilo ou função são diferentes.
18. Distinguir “perfil sem divergências comprovadas” de “mesmas skills com evidências distintas”.
19. Marcar grupos suspeitos como **fila de auditoria**, nunca como erros confirmados.
20. Preservar recomendações iguais quando ambas são justificáveis; não criar diversidade artificial.
21. Registrar o motivo de cada divergência e as edições envolvidas.
22. Comparar contrafactualmente Posse com CA Normal, CA Rápido, Por Fora e Passe Longo.
23. Mostrar quais das cinco habilidades mudaram de prioridade em cada combinação.
24. Explicar por fator quanto a pontuação relativa mudou; posição fora do top oito equivale a **desconhecido**, não a zero.
25. Validar dez atributos de saída do diagnóstico comparativo sem inferir status finais.
26. Mostrar visualmente na ficha existente o perfil e a justificativa tática, sem duplicar fichas de treino.
27. Cuidar de Martinelli #191 (original PTE, uso CA opcional, nível 26, PP 50) sem “corrigir” o progresso por heurística.
28. Auditar **246×5 = 1.230 cenários**, **246×4 = 984 comparações contrafactuais**, mais grupos de resultados iguais com evidências diferentes.
29. Exportar `build/v282-individual-card-distinction-246x5.json` como artifact de CI, incluindo Card IDs e causas das semelhanças.
30. Manter os tests de versões anteriores, Android, Windows, QA visual oito resoluções, atualização offline e assinatura da release como gates.

## Metodologia competitiva
Rentão e Blackjhon servem como **referência de rigor** (verificar versão exata, vídeo correspondente, PP, atributos-base, habilidades nativas, função e sinergia). **Não há homologação ou autoria desses criadores sem uma fonte verificada da edição específica.**

Os resultados deste pacote descrevem **diferenças nas evidências e no algoritmo**, não desempenho real no eFootball nem prova de que uma build será melhor.

## Teste e segurança
`node scripts/test-card-distinction-v282.cjs` deve garantir imutabilidade da base original, preservação das 246 cartas, comparação por tática e ausência de equip/treino automático. O release gate exige PR protegido, CI GREEN, Android debug, Windows NSIS, QA oito viewports e confirmação de APK assinado + SHA256 e executável Windows + atualização.
