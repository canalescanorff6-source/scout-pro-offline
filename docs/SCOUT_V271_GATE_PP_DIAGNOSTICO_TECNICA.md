# Craque Tático V271 — PP no parecer competitivo e auditoria dos 101 casos Técnica

## Escopo e causa raiz

Origem: `main` no merge V270 `f7a5c0515a4d44e311889c229097cd267a064a80`, release `v1.1.633`.

O motor V103 recebeu na ficha principal V251 um `recommended_levels`, mas a função `methodologyGate` **omitia `pp`**. O motor `trainingAudit` considera **ambos** obrigatórios para conferir o custo. Como consequência, o parecer da ficha tratava investimentos coerentes como `pp_nao_documentados`, produzindo rankings de ímpeto sem o sinal complementar de treinamento.

## Correção

- Propagar `edition`, `pp` (somente com orçamento documentalmente aceito no checklist da mesma edição) e `training_provisional` ao motor.
- Não usar vetor não validado (incluindo Martinelli #191 nível 26 / PP 50, ainda marcado como proposto) ou PP divergentes.
- Exibir no parecer principal se o treino/PP entrou no ranking como sinal **consultivo** ou foi ignorado, sem confundir custo matemático conferido com gameplay validado.
- Expor status de PP e distância entre ímpetos calculados na API da ficha para auditoria; não alterar nenhum atributo-base, peso competitivo V270, habilidade nativa, equipamento, PP ou treino aprovado.

## Diagnóstico obrigatório de Técnica

`scripts/test-pp-methodology-technique-v271.cjs` roda **246 cartas × 5 táticas**, compara gate real com checklist V251, impede falso PP comprovado, garante identidade, imutabilidade do catálogo, ausência de autorização para gastar tokens e protege os vetores provisórios. O teste também:

- Calcula os **101** casos em que Técnica lidera Posse; não força redução numérica.
- Segmenta por função e estilo documentados, mede proximidade com a alternativa e separa casos sem treino validado.
- Produz `build/v271-tecnica-evidencias.json` contendo CAP/Card ID, nome, função, segundo ímpeto, margem, fonte de PP e status de base de cada caso.
- Nenhuma sugestão é atribuída a Blackjhon/Rentão sem vídeo da **mesma carta**; não há alegação de partida testada.

## Condições de liberação

1. CI e regressões antigas GREEN, inclusive V267–V270.
2. Auditoria física 246 cartas, APK de teste Android e instalador Windows GREEN.
3. QA visual responsivo (8 viewports) GREEN; sem overflow ou sobreposição reportada.
4. Merge por `expected_head_sha` apenas após gates concluídos.
5. Revalidar workflows `main` e release com APK oficial assinado, checksum, EXE, blockmap e `latest.yml`.

A instalação física em Android/Windows e a efetividade competitiva em partidas são verificações posteriores e **não** estão comprovadas por CI.
