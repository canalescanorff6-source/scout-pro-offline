# Craque Tático V268 — porta de evidências completas para comparar ímpetos

## Diagnóstico do catálogo oficial

O acervo mantém 246 cartas originais. O índice V221/V260 registra 14 fichas com informação numérica **parcial**, mas nenhuma possui, no estado atual, prova completa validada (mesma edição/Card ID, fonte do print, pelo menos vinte campos-base e concordância entre cadastro e laboratório).

Usar essas bases para classificar jogadores como meta ou otimizar ímpetos produziria precisão fictícia. A V268 **não** eleva nenhuma das 14 cartas a homologada e não altera nenhuma build.

## Implementação

- `web/booster-engine-v103.js`: `baseStatsAudit(card)` exige objeto-base com 20+ campos numéricos inteiros de 0 a 120, pelo menos 16 atributos reconhecidos no vocabulário do motor, prova `CRAQUE_BASE_PROOF_V260` da mesma edição/Card ID, `source_ref`, status `confirmed_in_game`/completo, contagem coerente e confirmação da fonte e print no índice da carta. Rejeita fonte parcial, corrompida, sem nome ou de outra versão.
- Com documentação completa, `rank` permite uma ponderação **relativa pequena, limitada a -2 a +2 pontos**, comparando os atributos-base documentados com a média dos atributos relevantes da própria função. Não inventa status finais, não projeta ganho garantido, não usa Overall ou estuda atributos sem prova.
- Sem a prova, `score_base=0` e a ordem das 246 cartas permanece idêntica à V267. A referência dos atributos-base e o motivo de bloqueio ficam legíveis por ímpeto.
- `web/craque-ficha-individual-v251.js` só transmite informações-base ao painel mediante aprovação do validador V260, CAP+Card ID+edição, usando os dados do laboratório original. Os dados passam pelo evento canônico existente; nenhum cadastro individual é substituído.
- `web/skills-booster-v162.js` envia o contexto completo ao motor de ímpetos e apresenta explicitamente quando as bases estão pendentes ou parciais.
- A nomenclatura oficial Konami em PT-BR deve ser preservada onde documentada; versões e edições não podem ser inferidas pelo nome do atleta.

## Cobertura dos testes

`scripts/test-verified-base-booster-v268.cjs` executa 246 cartas × cinco estilos = **1.230 rankings** e verifica que **nenhuma** base parcial modifica a pontuação. Uma fixture sintética com 21 campos e prova completa correspondente demonstra a funcionalidade; outras 12 variações negativas verificam fonte divergente, Card ID/edição trocados, contagem errada, valor inválido e ausência de confirmação. A fixture não é salva nem representa carta real homologada.

**Sem homologação automática de gameplay ou builds por Blackjhon e Rentão:** são referências metodológicas; qualquer atribuição exige vídeo comprovado da mesma edição e Card ID. Fichas aprovadas, cinco adicionais confirmadas, ímpetos fixos, PP, imagens, saves e formações permanecem intactos.

## Publicação

Só integrar após `npm run check`, auditoria V101, testes de build Android/Windows e QA visual verdes. Só anunciar versão instalável depois da release assinada e dos metadados do atualizador publicados. Instalação física permanece uma validação separada.
