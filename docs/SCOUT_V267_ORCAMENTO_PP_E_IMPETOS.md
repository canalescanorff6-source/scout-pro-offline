# Craque Tático V267 — auditoria de PP antes do ranking de ímpetos

## Diagnóstico realizado

O motor V103/V265 aceitava qualquer vetor numérico de dez grupos de treino e atribuía confiança `comparativa_limitada` sem verificar o custo progressivo dos pontos em relação ao orçamento da edição. Isso poderia distorcer o ranking de ímpetos em uma carta com treino digitado incorretamente, PP de outra versão ou proposta ainda não homologada. **Não é uma medição dos atributos finais.**

A auditoria do catálogo V69 encontrou:
- **161 cartas** com vetor de custo matematicamente conferido e sem indicação de proposta pendente;
- **1 carta (Martinelli #191, 26 níveis / 50 PP)** com vetor de custo coerente, mas `treino_proposto_nao_validado=true`;
- **84 cartas** sem vetor no catálogo principal.

A contagem não significa homologação em gameplay ou que o usuário não tenha build válida em seu dispositivo.

## Correções

1. Novo `trainingAudit(card)` em `web/booster-engine-v103.js`: valida exatamente dez inteiros entre 0 e 20, orçamento de PP inteiro e dentro do intervalo de 0 a 238, e custo progressivo exato `1 + floor(i/4)` para cada ponto de uma categoria.
2. Estados explícitos: `vetor_ausente`, `vetor_invalido`, `pp_nao_documentados`, `pp_divergentes`, `treino_proposto_nao_validado` e `custo_pp_conferido`.
3. O ranking só aplica o ajuste de investimento por categorias quando o vetor é matematicamente coerente **e não está marcado como proposta**. Se faltar evidência, o ranking por função, estilo e habilidades nativas permanece consultivo, sem afirmar que o treino é válido.
4. Cada candidato expõe `evidencias.pp_status`, `pp_orcamento`, `pp_investidos` e o status de confiança. Em ficha, o painel mostra alerta visível quando custo ou PP divergem.
5. O adaptador V162 encaminha o orçamento `pp` e `training_provisional` junto ao vetor, impedindo diferenças entre o ranking direto e a ficha principal. Os testes legados foram atualizados para incluir esse dado **já existente no catálogo original** quando comparam motores.
6. Não há alteração nos vinte e oito ímpetos originais, nem nas regras para slot, quatro atributos, presença de ímpeto fixo, habilidades adicionais ou treino efetivamente salvo pelo usuário.

## Testes e publicação

`scripts/test-booster-pp-v267.cjs`: 246 cartas × 5 táticas = **1.230 cenários**, igualdade de ranking do motor com o painel, 161/1/84 vetores classificados, regressão de PP 50→66, arrays incompletos, valores fora do limite, vetor sem orçamento e treino provisório. As 246 cartas permanecem idênticas.

A V267 **não representa** 246 builds competitivamente homologadas. Blackjhon e Rentão continuam referências metodológicas — não se atribui uma ficha a eles sem vídeo de mesma edição/Card ID. A prioridade tática é Posse de Bola central, mantendo os outros quatro estilos.

Publicar somente após `npm run check`, auditoria das 246 cartas, builds Windows/Android e QA visual aprovados. O QA não substitui instalação física nem testes em partidas.
