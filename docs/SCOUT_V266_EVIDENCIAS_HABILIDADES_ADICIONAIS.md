# Craque Tático V266 — evidências e complementaridade das habilidades adicionais

## Escopo

Evolução sobre v1.1.618 (V265). Preservar rigorosamente as 246 cartas, seus Card IDs, builds, PP, níveis, habilidades nativas e ímpetos fixos. As recomendações permanecem **hipóteses consultivas**: não são treinos homologados por Blackjhon/Rentão nem comprovam eficácia em partidas.

## Falhas identificadas

1. Habilidades nativas **fora da lista de 27 opções recomendáveis** (ex.: `Phenomenal Pass`) não participavam da detecção de conflito com habilidades adicionais digitadas, embora fossem a mesma habilidade.
2. Uma conferência nova da lista completa estava vinculada somente à edição e ao texto das adicionais, **não à lista nativa consultada**. Se o catálogo nativo fosse corrigido, a antiga confirmação poderia persistir.
3. Pontuações de cinco habilidades eram apresentadas sem separação das contribuições de função, tática, estilo e complementaridade nativa, dificultando revisar recomendações genéricas.

## Correções

- A identidade de habilidade compara aliases oficiais reconhecidos quando disponíveis e, para nomes desconhecidos, **texto normalizado literal**. Nativa não reconhecida nunca vira adicional automaticamente.
- `requiresReconciliation` marca conflito nativa/adicional e excesso de cinco adicionais. O formulário não salva nova confirmação de lista completa enquanto esses problemas existirem; **pode salvar rascunho parcial**.
- Novos registros V254 de confirmação passam a incluir `nativeFingerprint`; se o cadastro nativo daquela edição mudar, a confirmação V266 não vale mais. Registros V254 antigos continuam legíveis para não destruir dados já salvos, mas devem ser reconferidos quando houver mudança documentada.
- As recomendações exibem `criterios` com pesos heurísticos separados de **função, tática, estilo e complementaridade nativa**, sempre identificados como *pontuação relativa*, nunca atributo final, Overall ou prova de desempenho.
- Habilidades nativas fora do vocabulário de recomendações recebem aviso explícito. Isso não prova que sejam inválidas no eFootball.
- O código de pontuação e o catálogo de habilidades recomendáveis mantêm seus nomes e pesos anteriores; só se acrescenta proveniência e proteção documental. Não há alteração silenciosa de builds.

## Testes

`scripts/test-additional-evidence-v266.cjs` passa por 246 cartas × cinco táticas = **1.230 verificações**; exige justificativas rastreáveis e sem repetir habilidades nativas, prova mudanças no fingerprint das nativas, não transferência entre Card IDs, e rejeita novas confirmações contraditórias.

Também executar todos os testes anteriores via `npm run check`, auditoria física, builds de teste Windows e Android e QA visual 360/390/1366 px antes do merge. A publicação oficial requer CI pós-merge e instaladores assinados.

## Pendências competitivas

A V264 reportou edições e vetores ainda sem prova. Portanto a V266 não significa que todas as 246 fichas já sejam as melhores em gameplay. Ainda é necessária a conferência individual de atributos-base, níveis/PP, skills de cada edição e avaliação em jogo.
