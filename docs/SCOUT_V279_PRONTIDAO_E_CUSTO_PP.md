# Craque Tático V279 — consistência entre prontidão competitiva e PP reais

## Problema diagnosticado após a V278
A ficha de prontidão V264 e o dossiê 246×5 classificavam um treino como “build registrada” só pela existência de dez números inteiros de progresso. A V267 já possuía o controle mais rigoroso `trainingAudit`, que verifica orçamento de PP, custo progressivo por categoria e se o vetor está marcado como **proposta não validada**. Os dois painéis podiam, portanto, apresentar situações diferentes para a mesma edição. Exemplo concreto: **Martinelli #191, nível 26 e 50 PP**, com vetor matematicamente correto mas registrado como proposta não homologada.

## Solução da V279
- `craque-competitive-readiness-v264.js` passa a consultar `SCOUT_BOOSTERS_V103.trainingAudit(card)` antes de classificar o treino; no Node utiliza o mesmo motor via `require`, no Android/Windows consulta o motor carregado no navegador. Caso a auditoria esteja indisponível, **não** presume validação e mantém a ficha pendente.
- Estado `registrada_sem_homologacao` só quando o custo matemático confere e o vetor não está marcado como provisório; nenhum desses estados comprova meta/competitividade nem autoriza substituir build.
- Estados específicos para `proposta_nao_homologada` e `orcamento_pp_divergente` identificam a pendência na única ficha. A UI usa textos em português legível, sem expor identificadores técnicos.
- O dossiê consultivo JSON exporta o status da auditoria de PP, custo calculado, orçamento e se o vetor passou na verificação. Não muda o campo `treino_original`, preservando dados originais e compatibilidade de consumo externo.
- Dados contraditórios, inválidos e sem orçamento não passam a “registrada”, nem podem entrar no status de revisão de gameplay. Não altera a prova de Card ID, edição, ímpeto ou cinco adicionais.

## Escopo da auditoria: 246 cartas × cinco estilos
O teste `scripts/test-readiness-training-v279.cjs` exige 1.230 avaliações consistentes com o motor V267, sendo **161 vetores com PP coerentes**, **1 proposta ainda não validada** e **84 sem vetor de treino no catálogo principal**. Provas sintéticas testam PP de Martinelli 50→66, ausência de orçamento, vetor inválido e verdadeiro registro de Raúl. A V264 tem suas expectativas de Martinelli corrigidas.

## Regras de proteção
- Preservar todas as 246 cartas originais, edições, imagens, Card IDs, níveis, PP, builds e saves aprovados.
- Posse de Bola central é a tática prioritária, sem remover os outros quatro estilos.
- Blackjhon e Rentão são referências metodológicas; nenhuma build é atribuída a eles sem vídeo e Card ID exatos.
- Não alegar que as 246 fichas foram homologadas competitivamente apenas porque a CI passou.
- Só integrar a V279 à `main` se a CI, a auditoria V101, o QA visual 360/390/1366 e os dois builds de teste passarem; publicação oficial separada após merge assinado.
