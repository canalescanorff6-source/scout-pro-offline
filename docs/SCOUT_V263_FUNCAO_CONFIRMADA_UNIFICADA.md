# Craque Tático V263 — sincronizar a função confirmada entre PP, habilidades e ímpetos

## Diagnóstico na main v1.1.604

A V251 já permitia consultar o treino por uma função alternativa confirmada no V246. Contudo, o painel principal V220 e o painel V162 ainda podiam usar a posição original; em Martinelli #191, ao escolher CA treinado, a simulação de PP era de centroavante enquanto cinco habilidades e ímpetos podiam continuar como PTE/ALA. A revisão V263 unifica a função considerada **sem alterar a posição original da carta**.

A proposta anterior [PR #160](https://github.com/canalescanorff6-source/scout-pro-offline/pull/160) permaneceu aberta em branch antiga, mas não foi integrada. A V263 implementa a correção na main atual sem presumir que aquele PR tenha sido publicado.

## Regras

1. Função original por padrão. O seletor V251 só oferece alternativa após `SCOUT_POSITION_TRAINING_V246.status(card,position,store)` sinalizar `treinada` ou `familiar` para CAP e Card ID da edição atual.
2. A função escolhida é **temporária na sessão**: não grava no catálogo, nos saves, na confirmação de treinamento ou nos próprios atributos da edição.
3. Depois da validação V251, o evento `scoutpro:role-selected-v263` publica CAP, Card ID, função e categoria de evidência. Cada painel destinatário **revalida** a existência dessa posição no V246, em vez de confiar no evento ou no Overall.
4. V220 e V162 recalculam habilidades, prioridades de treino e ímpetos para a mesma função. Ambos mostram a função considerada e se é original, treinada ou familiar. O V251 mantém o orçamento original de PP e o nível sem inventar valores finais.
5. Ao revogar o treinamento/familiaridade na V246, o evento `craque:data-changed` força novo cálculo da ficha. Se a seleção não for mais elegível, volta à original e comunica a alteração aos painéis.
6. A escolha não atravessa edições com o mesmo nome: exige CAP + Card ID. GO não pode ser treinado em jogador de linha por mera pontuação de Overall.
7. Os nomes de estilo no painel V162 ficam consistentes em PT-BR: **Por Fora** e **Passe Longo**.
8. Priorizar **Posse de Bola central**, mantendo Contra-Ataque Normal, Contra-Ataque Rápido, Por Fora e Passe Longo. As recomendações são consultivas; não são homologadas por Blackjhon ou Rentão sem fonte da edição exata.

## Regressões e publicação

`scripts/test-confirmed-role-v263.cjs`:
- verifica 246 cartas × 5 estilos = **1.230 cenários**;
- valida Martinelli #191 com 26 níveis e 50 PP, primeiro em PTE, depois CA somente após confirmação;
- exige concordância entre o papel do V220, cinco habilidades adicionais V162, ranking dos ímpetos V103 e a análise de PP V251;
- testa impossibilidade de GO, revogação de CA, familiaridade em SA, não herança por CAP ou Card ID e não mutação de nenhuma carta.

Executar `npm run check`, auditoria física e QA visual 360/390/1366 px, compilações de teste Android e Windows. Não integrar ou publicar até todos aprovados. Instalação física e rendimento em gameplay continuam pendentes de validação em dispositivos e partidas.

## Escopo preservado

Nenhuma alteração nas 246 cartas originais, Card IDs, níveis, PP, habilidades nativas, ímpetos fixos, saves, formações, backups, vídeos, prints ou builds homologadas. A escolha de posição é somente de **análise**; o programa não aplica doutrinação/treino no eFootball.
