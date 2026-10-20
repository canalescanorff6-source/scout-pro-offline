# V280 — Comparador competitivo de fichas, habilidades adicionais e ímpetos

## Escopo e continuidade
Mesmo projeto `canalescanorff6-source/scout-pro-offline`, partindo da V279 `v1.1.670` (main `571fd197d71801dcbe1b627b50e19a58974271de`). Não substitui builds, cartas, versões, Card IDs, imagens, PP, habilidades ou ímpetos homologados.

## Implementações
1. O dossiê de cada carta compara **cinco estilos de jogo do técnico** no mesmo local.
2. Forma **10 pares por carta** em vez de verificar apenas cada estilo isolado.
3. Calcula o percentual de interseção de habilidades adicionais sugeridas nos dois estilos, sem contar duplicatas por idioma.
4. Detecta listas idênticas e listas com **80% ou mais** de sobreposição.
5. Guarda o número de habilidades iguais e distintas em cada par, auditável.
6. Confere se a primeira skill do ranking permanece a mesma no par.
7. Confere se o primeiro ímpeto permanece o mesmo entre os estilos.
8. Exibe explicitamente quando **não há candidatos por slot**, em vez de chamar o conjunto vazio de lista idêntica.
9. Detecta quando a **primeira habilidade é igual nos cinco estilos** e evita afirmar que é universalmente superior.
10. Detecta quando o **primeiro ímpeto é igual nos cinco estilos**, sem substituir por outro artificialmente.
11. Mantém os scores e margens de confiança da V277, sem criar atributos finais.
12. Adiciona aviso quando habilidades têm prioridades muito próximas (distância relativa abaixo de 3).
13. Adiciona aviso quando ímpetos têm prioridades muito próximas (diferença relativa abaixo de 2).
14. Preserva a comparação com o portfólio complementar de até cinco habilidades.
15. Mantém a distinção entre candidatos e **vagas efetivamente conferidas na conta**.
16. Mantém 47 contextos de habilidades nativas especiais sem tratá-las como adicionais disponíveis.
17. Mantém a classificação da posição original e do jogador doutrinado separadas.
18. Em cada carta, a matriz vincula análise ao Card ID/edição, não ao Overall.
19. O comparador jamais altera a ficha de treino, PP ou níveis.
20. A página da carta mostra os pares de estilo em texto responsivo dentro do dossiê existente.
21. Detecta globalmente **grupos com recomendações iguais, mas habilidades nativas diferentes**, para orientar revisão de clones.
22. Agrupa apenas papéis e estilos de jogo equivalentes; não chama semelhança de bug por si só.
23. Em todos os grupos, mantém CAP e Card ID para impedir mistura de versões.
24. Gera o relatório `build/v280-matrix-246x5.json`, incluindo matrizes individuais e potenciais clones.
25. Testa 246 cartas × cinco estilos = **1.230 cenários**.
26. Testa 246 cartas × dez comparações = **2.460 pares**.
27. Confere as listas resultantes contra os motores de habilidades e ímpetos reais.
28. Verifica ausência de habilidade nativa repetida entre adicionais sugeridas.
29. Garante que o conjunto vazio não gera falsa semelhança máxima.
30. Mantém `maySpendTokensAutomatically=false`, `competitivelyApproved=false` e sem autorias inventadas.
31. Atualiza cache offline Android/Windows para expor as melhorias.
32. Exige regressão de todas as versões anteriores, auditoria de 246 cartas, compilação Android/Windows e QA visual antes do merge.
33. Release só após CI e QA pós-merge, APK assinado, SHA256, EXE, blockmap e latest.yml.

## Limites da metodologia competitiva
**Rentão e Blackjhon** são referências de rigor técnico, não fontes inventadas de builds. Sem vídeo da mesma versão/Card ID e análise em partidas, não há homologação de skills, PP ou ímpetos. Igualdade de recomendações pode ser consequência legítima de escassez de dados; jamais mudar uma build para passar em métrica de diversidade.
