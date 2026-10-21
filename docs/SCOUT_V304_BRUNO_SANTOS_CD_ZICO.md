# V304 — Coleção Bruno Santos CD em Outros Elencos

## Escopo
Coleção de outra pessoa **independente** do catálogo oficial de 246 cartas. Interface em `web/outros-elencos-v227.html`, dados locais em `scoutpro:v227:friends-collections`, integrados aos backups existentes. Não é um novo catálogo de jogadores do proprietário.

## Primeira carta recebida (21/10/2026)
**Zico, print 106, posição SA.** Estilo individual visível: `Armador criativo`. Campo secundário `Básico` e **362 partidas** aparecem na primeira foto; esses dois detalhes foram preservados nas observações, mas não são usados para gerar status de treino. A miniatura JPEG é um recorte fiel da primeira foto enviada, reduzido para 80×104, 1731 bytes, SHA256 `0bbd8bcae90283b4646885667764561277027e7c7b8601c91c73584ab90675e9`.

O segundo print apresenta outra representação de **Zico 108 MAT** em uma postagem de Instagram de 17/10/2025. Isso **não confirma** que seja a mesma edição 106 SA, nem comprova outro Card ID ou propriedade da carta. Não foi incluído como segunda carta, apenas registrado como referência conflitante.

**PENDENTES**: Card ID, nome oficial da edição, raridade, nível máximo, PP, habilidades nativas, adicionais, ímpetos e slots. O campo de overall visto na imagem não deve ser usado como fonte de treino nem como Card ID. Atribuição ao acervo Bruno Santos CD foi solicitada pelo proprietário do aplicativo; titularidade na conta do terceiro não foi verificada.

## Comportamento
- Na primeira abertura de Outros Elencos, criar coleção `Bruno Santos CD` e a carta Zico apenas se ainda não existir equivalência no cadastro e a migração não tiver sido concluída.
- A coleção tem um bloco próprio, com botão de acesso e contagem de cartas. Novas cartas enviadas depois poderão ser cadastradas pelo botão **+ Nova carta**, sem limite artificial de uma carta.
- Se existir `Bruno Santos CD` previamente, aproveitar o acervo sem duplicar nem substituir campos já preenchidos; se o Zico já estiver cadastrado como 106 SA, preservá-lo.
- Nunca sobrescrever, eliminar ou misturar acervos anteriores; tratar erros de armazenamento sem apagar registros. A exclusão manual de Zico não é desfeita por reinicialização.
- O motor V228 mantém cinco fichas como `pendente` enquanto PP e nível máximo não forem informados. Não inventar builds de Rentão, Blackjhon, habilidades adicionais ou ímpetos.

## Gates
`node scripts/test-bruno-santos-v304.cjs`: miniatura SHA, Card ID/nivel/PP não inventados, cinco táticas pendentes, preservação e idempotência, backup/coleção separada, 246 cartas intactas. `npm run check`, QA visual oito resoluções, compilações Android/Windows e release conjunta apenas com CI GREEN. Teste físico ainda pendente.
