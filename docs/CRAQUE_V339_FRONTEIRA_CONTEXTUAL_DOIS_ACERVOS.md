# V339 — Integração contextual da fronteira multiobjetivo de PP

## Defeito real no fluxo
Na v1.1.967, o V324 permite rascunhos independentes por **proprietário,
coleção, carta, Card ID, edição, técnico, posição, estilo e assinatura da fonte**.
O motor V251/V338 passou a aceitar rascunhos explícitos com PP livres, mas o
comparador V251 da ficha individual ainda recebia como referência o treino
estático original (ou proposta recalculada). O painel V311, presente nos dois
acervos, também não disponibilizava esse motor multiobjetivo contextual.

Consequência: a pessoa poderia ver uma simulação de PP que não partia da
distribuição realmente salva naquele técnico/posição, embora o rascunho fosse
válido e estivesse íntegro.

## Solução
1. `web/craque-frontier-context-v339.js` implementa uma **ponte pura e somente
   leitura** entre V324 (identidade + revisão), V220 (PP progressivo e pesos por
   papel/tática) e V251 (a mesma fronteira multiobjetivo V338).
2. Não duplica o algoritmo de alocação ou Pareto. Reutiliza
   `CRAQUE_FICHA_INDIVIDUAL_V251.trainingFrontier()` somente se os motores
   existirem e a carta, familiaridade, Card ID numérico, edição, técnico,
   orçamento e função forem coerentes.
3. Em caso de rascunho V324, fornece
   `{baselineSource:'rascunho_independente'}` e elege inicialmente o
   candidato **registrado**, preservando saldos (como 61/62 PP).
   Sem rascunho, a referência é **proposta contextual experimental** com
   `baselineProvisional:true`, nunca homologação implícita.
4. `web/craque-positional-ui-v311.js` adiciona **Comparar investimentos de
   PP desta ficha** dentro da análise avançada; carrega cálculos só ao abrir,
   exibe custo por categoria, saldo, redistribuição, PP investidos e índices
   relativos. Sem botões de salvar, equipar ou substituir builds.
5. `Outros Elencos` carrega V251 como **API pura** (sem montar observadores
   pessoais), antes da ponte V339 e da UI V311. Em `Minhas Cartas`, a cadeia
   do app-bridge inclui V339 antes de carregar a UI compartilhada.
6. `web/sw.js` faz precache offline do novo módulo e invalida o cache.
   `scripts/stamp-bundle-v189.cjs` inclui a fonte no hash de paridade
   Android/Windows. Pequeno ajuste visual em
   `web/craque-positional-v311.css`.

## Regressão automatizada
`scripts/test-frontier-context-v339.cjs`, incluído no `npm run check`,
cobre rascunho de 61 PP sob orçamento 62, seleção inicial da revisão,
continuidade CA→SA→CA, separação por estilo/técnico/assinatura da edição,
Minhas Cartas versus Outros Elencos, PP em excesso, edição/ID pendentes,
posição não comprovada, histórico corrompido sem gravação e catálogo original
de 246 cartas intacto.

## Limites e aceite
Os **pesos de investimento** são heurísticos e não representam atributos
finais ou evidência de gameplay. A mudança do usuário entre candidatos na
comparação não modifica o treino aprovado, nível, PP, cinco habilidades
adicionais, ímpeto fixo ou extra, backup ou dispositivo. Sem evidência da
mesma versão/Card ID, a comparação fica **PENDENTE**.

A integração requer validação de CI, testes visuais em Android/Windows,
builds de teste e aprovação humana. Nova publicação não é autorizada
automaticamente pelo merge da versão anterior.
