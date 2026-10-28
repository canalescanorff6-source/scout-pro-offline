# V277 — Fichas individuais, complementaridade de habilidades e matriz de ímpetos

## Continuidade
Parte da **V276 v1.1.659** (`0416793622d78c02edd0a5e38d009cc83ef88bb2`) no MESMO repositório `canalescanorff6-source/scout-pro-offline`.

Não recriar o aplicativo, não inventar builds, atributos, fotos, habilidades, ímpetos, pontos ou edição. **Preservar as 246 cartas** com seus Card IDs. A metodologia competitiva de Rentão e Blackjhon é referência de rigor, não prova de que alguma recomendação desta versão seja atribuível a eles.

## 27 entregas técnicas da V277

### Complementaridade das cinco habilidades
1. Preservar ranking principal V276 intacto e permitir comparação com proposta complementar.
2. Interpretar **famílias das habilidades NATIVAS comuns** da mesma carta quando seus nomes são canônicos (PT-BR/EN).
3. Não presumir equivalência entre duas habilidades da mesma família; a coincidência é um sinal leve, não exclusão.
4. Ajustar a proposta complementar com penalização **limitada de 7 pontos relativos** por família já presente nas nativas.
5. Considerar **famílias de habilidades adicionais efetivamente informadas na conta**, separadas das nativas.
6. Ajustar a proposta por família já equipada com sinal de 12 pontos relativos, sem proibir complemento útil.
7. Conservar prioridade de função e tática no desempate, sem depender da ordem alfabética.
8. Preservar os limites do jogo: no máximo cinco adicionais e nenhuma vaga livre assumida sem confirmação.
9. Evitar cópias de habilidades nativas, adicionais já equipadas ou aliases de idioma.
10. Para cada candidata, explicar bônus de função, bônus tático e penalidades de redundância.
11. Expor famílias das nativas e dos equipamentos na ficha, separadas da nova proposta.
12. Não transformar habilidades especiais (como Phenomenal Pass) em skills adicionais canônicas sem evidência.
13. Não forçar cinco escolhas quando já não há slots livres comprovados.
14. Manter fichas originais e builds aprovadas intocadas.

### Ímpetos e prova da edição
15. Mostrar uma **matriz dos três primeiros ímpetos** por edição, com notas relativas auditáveis.
16. Decompor a nota em função, investimento, contexto e atributos-base documentados.
17. Exibir margem em relação ao primeiro colocado, avisando quando há empate competitivo.
18. Manter comparação dos **quatro atributos** com o ímpeto fixo documentado.
19. Conservar alternativa de menor sobreposição apenas para consulta, não promovê-la a melhor por fórmula.
20. Advertir quando o tipo de ímpeto fixo não é identificável.
21. Advertir quando o segundo slot não é documentado na edição ou não foi conferido vazio.
22. Advertir quando vetor PP ou atributos-base da edição não têm comprovação suficiente.
23. Separar **nota relativa** de atributo final, Overall, tier competitivo e desempenho medido.
24. Manter todo o motor de ímpetos condicional; jamais gastar tokens automaticamente.

### Interface, testes e publicação
25. A ficha premium passa a mostrar família nativa/equipada, explicação por skill e matriz de ímpetos sem segundo painel de treino incompatível.
26. Teste `scripts/test-evidence-matrix-v277.cjs`: **246 × 5 = 1.230** cenários, com alias PT-BR/EN, limites dos slots, candidato nativo, fator de score, Martinelli #191 e proteção dos dados. JSON `build/v277-evidence-matrix-246x5.json`.
27. Gate de release: CI, auditoria física das cartas, Android debug, Windows NSIS, oito resoluções de QA, merge protegido por SHA e confirmação dos cinco assets (APK assinado + SHA256, EXE, blockmap, latest.yml).

## Critérios competitivos
Uma ficha de qualidade começa verificando Card ID e edição exatos; níveis e PP; habilidades nativas originais; treino homologado; função nativa/doutrinada; cinco adicionais; tipo fixo, slot extra e quatro atributos de cada ímpeto. **Sem vídeo da mesma carta e evidência concreta, não atribuir autoria a criadores nem prometer rendimento meta**.

As alterações são mecanismos de recomendação e transparência, não substituem testes de partidas reais. As recomendações alternativas não aplicam mudanças nem sobrepõem builds.
