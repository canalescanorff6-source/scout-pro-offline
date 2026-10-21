# V289 — diagnóstico anterior à implementação

Base inspecionada em 21/10/2026: `main`, `bd9c6226bd8475eb0c55b6cc3562ff94450351d8`, PR #194/V288. Release mais recente: `v1.1.710`. Os seis checks desse commit estavam aprovados. PRs ainda abertos: #160, #152, #146, #129, #85 e #43; não são a base deste trabalho.

`npm run check` executado integralmente antes de alterações: exit 0. A rotina altera HTML e carimbo durante a verificação; esses arquivos gerados foram restaurados à base antes de implementar.

## Acervo e evidência

- 246 cartas originais; 85 com nível/PP documentados; 161 sem comprovação de nível máximo.
- 243 listas de habilidades nativas registradas; registro documental não equivale a conferência física no jogo.
- 14 indicadores de atributos-base no catálogo, sujeitos às provas adicionais de edição/fonte existentes.
- Nenhuma build comprovada por gameplay no auditor atual.
- Martinelli #191, `105850811319718`: nível 26, 50 PP, proposta experimental já identificada na base. Não reaplicar a correção histórica de 66 PP.
- Yorke #040, `88029918268889`: carta original e build preservadas; a análise não autoriza um segundo ímpeto inexistente no catálogo.

## Reprodução de lacunas reais

1. `checkedEquipment` aceita “Reposição baixa do GO” como adicional confirmada de CA: compara fingerprints/duplicatas, mas não a função da habilidade.
2. `keyFor('Comandante da defesa GO')` retorna `captain`: confunde uma nativa especial com Liderança comum. A própria tabela contextual distingue GK Directing Defence de Captaincy.
3. `evaluate` com Chute de primeira adicional conferido produz ranking idêntico ao da mesma lista não conferida: adicionais ocupam vagas/excluem duplicatas, mas não alimentam a complementaridade.
4. `allocate` entrega uma solução escalar. A ficha não permite comparar uma fronteira de alternativas por objetivos nem o custo efetivo das trocas.

## Escopo verificável

Corrigir as causas nos módulos existentes. Acrescentar comparação experimental de PP, explicações de adicionais e contexto conferido de ímpetos. Não criar outra cadeia de fichas, modificar dados de cartas ou converter heurística em validação. Os relatórios automáticos das 246 cartas serão explicitamente distintos de validação individual em jogo.
