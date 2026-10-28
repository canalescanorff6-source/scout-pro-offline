# V292 — Ímpetos com confiança por evidência, não por pontuação calculada

**Base:** PR #198, dependente do comparador V289 do PR #197.

## Problema

O campo `confianca` do ranking de ímpetos V103 era derivado praticamente da existência de um vetor de níveis matematicamente consistente. Isso podia exibir `comparativa_limitada` quando Card ID, edição, habilidades nativas e origem comprovada do nível ainda estavam pendentes. A nota de ranking não deve servir de homologação.

## Regras implementadas

O campo `estado_confianca` identifica:
- `PENDENTE_IDENTIDADE`: CAP, Card ID ou edição ausentes/provisórios.
- `PENDENTE_NATIVAS`: lista de nativas não cadastrada ou provisória.
- `BAIXA_SEM_PROVA_NIVEL_PP`: nível máximo, origem ou coerência de PP não documentados.
- `BAIXA_SEM_BUILD_CONFERIDA`: nível/orçamento de origem conhecidos, mas falta vetor utilizável.
- `COMPARACAO_LIMITADA`: identidade/nativas, nível e custo matemático consistentes. Não equivale a prova de performance.

A explicação do ímpeto inclui bloqueios documentais, e a saída `evidencias` apresenta os quatro sinais de origem separadamente. O campo legível `confianca` nunca anuncia certeza alta ou uma build meta. As regras de ranking, os quatro atributos do ímpeto, o custo de PP, os slots e as cartas originais permanecem intactos.

O adaptador V162 agora passa `max_level` e `pp_origem` ao motor V103, pois sem isso a classificação documental seria artificialmente baixa mesmo em cartas com PP confirmados no catálogo.

## Testes

Novo `scripts/test-booster-confidence-v292.cjs`: 246 cartas × cinco estilos; coerência da classificação entre candidatos; pendências de identidade/nativas/origem e vetor experimental; fixture Martinelli #191 (26/50); preservação das 246 cartas, veto a gameplay não documentado e proibição de gasto automático de tokens.

Teste inclui relatório `build/v292-booster-confidence-246x5.json` e integração no `npm run check`. O relatório quantifica **status de documentação**, nunca meta/forte/inferior com base em scores arbitrários.

Nenhum Card ID, imagem, build aprovada, nativa, PP, ímpeto fixo ou slot original modificado. Sem merge, release ou validação física nesta etapa.
