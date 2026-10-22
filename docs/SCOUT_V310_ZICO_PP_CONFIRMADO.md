# V310 — Zico 106 SA (Bruno Santos CD) · nível máximo 35 e 68 PP

## Fonte da correção
O proprietário confirmou no chat: **Zico dessa coleção tem nível máximo 35 e 68 pontos de progresso**. A matemática corresponde a `2 × (35 - 1) = 68 PP`. Essa confirmação do usuário NÃO confirma o Card ID ou a edição oficial da carta, nem os atributos de fim de treino.

## Código entregue
- `web/craque-bruno-v304.js`: a nova inclusão dessa edição do Zico recebe 35/68 e, com os motores carregados, armazena cinco fichas por estilo. A versão pré-existente recebe migração idempotente mesmo com a marca `scoutpro:v304:bruno-santos-cd-initialized=ok`.
- Migração restrita à coleção Bruno Santos CD e ao registro exato `bruno-santos-cd:zico:106-sa:print-20261021` ou à identificação equivalente do próprio print V304; não altera outras edições de Zico.
- Não sobrescrever PP/nível divergentes, Card ID informado manualmente, builds com níveis de treinamento distribuídos, fotos, ou cartas excluídas. Migração falha de forma segura, sem reintroduzir exclusões.
- Preserva imagem original do usuário e nota documentando fonte do nível e PP. Ímpetos, habilidades nativas e Card ID continuam com confirmação pendente.
- `web/craque-friends-page-v227.js`: invoca a migração após carregar os dados locais, antes de exibir a lista de cartas. As cinco fichas ficam visíveis sem cadastrar outra carta.
- Cache offline V310 atualizado. Android e Windows compartilham a mesma lógica.

## QA e publicação
- `scripts/test-bruno-santos-v304.cjs`: amplia testes para caso inicial 35/68, cinco fichas, migração de dados locais existentes, persistência, idempotência, proteção de PP manuais, outra edição e exclusão.
- `scripts/qa-visual-v195.py`: verifica a carta Zico já cadastrada, nível 35, PP 68 e distribuição 68/68 na ficha em múltiplas resoluções.
- Executar CI, QA visual, compilação Android debug e Windows, assinatura persistente e publicação conjunta; nenhum status de release deve ser inventado.

**Regra geral V309 não mudou:** outras cartas continuam usando a regra universal `PP = 2 × (nível máximo - 1)` mediante nível confirmado. Não alterar as 246 cartas originais.
