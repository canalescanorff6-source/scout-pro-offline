# V340 — Auditoria de habilidades e ímpetos da edição, sem equipamento inventado

## Defeito confirmado
O editor V311/V324 já mostrava “REVISAR” quando uma candidata de
habilidade também constava na lista **nativa cadastrada** ou na lista de
**adicionais informadas** para aquela carta. Contudo, o botão “Salvar ficha
independente” ainda gravava nova revisão com a coincidência, permitindo
reforçar uma recomendação provavelmente inválida. Além disso, a ficha em
foco não destacava que o ímpeto candidato repetia o nome do ímpeto fixo.

## Engenharia entregue
- `CRAQUE_MANAGER_FICHAS_V324.auditEquipmentSelection` é uma função
  **pura**, específica das listas fornecidas para aquela carta.
- Detecta, com normalização de maiúsculas e acentos, habilidades que
  coincidem com nativas cadastradas ou adicionais informadas, identifica
  ímpeto candidato com o mesmo nome do fixo, e mantém o estado informado
  do slot como **pendente**, se não existe comprovação.
- Uma **nova revisão manual** da V324 só é salva depois de excluir
  habilidades coincidentes, oferecendo mensagem explicativa. A operação
  falha antes de chamar `profiles.save`: registros históricos permanecem
  legíveis e imutáveis; nada é excluído, substituído ou equipado.
- A ficha em foco exibe advertência visível para colisões encontradas.
  Uma coincidência no ímpeto fixo gera aviso de revisão, mas não é
  classificada como proibição oficial sem prova da regra do jogo.
- A mesma implementação atua nas fichas de **Minhas Cartas** e de
  **Outros Elencos**, respeitando os modelos da edição e proprietário
  já selecionados pelo V311. Sem travessia de identidades ou cópia de
  habilidades entre acervos.
- O teste `scripts/test-equipment-collision-v340.cjs` cobre conflito
  de nativa/adicional, acentuação, equivalência ao ímpeto fixo, ausência
  de documentação, histórico prévio, proteção entre acervos e
  246 cartas intocadas. Executado pelo `npm run check`.

## Limites documentais
Listas “nativas” ou “adicionais” informadas não provam equipamento
no jogo, quantas vagas estão abertas nem confirmação da identidade
da carta. Não supor que um ímpeto candidato esteja instalado ou
possa ocupar um segundo slot. Esta auditoria não define o ranking
de melhores skills/boosters nem altera builds aprovadas.

## Publicação
Mudanças em branch isolada e PR próprio, independente do PR #252 V339.
Exigir CI geral, auditoria das 246 cartas, QA Chromium Android/Windows e
compilações de teste para prosseguir à revisão. Sem merge em `main`
ou release sem nova autorização expressa do proprietário.
