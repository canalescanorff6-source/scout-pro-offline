# Scout PRO V182 — Auditoria rastreável de habilidades e ímpetos

**Estado de referência:** V181, `main` em `582be44d57802272c15707c58b477d1a35cefb78` (14/10/2026).

## Sem alterar as cartas

Esta auditoria acrescenta documentação de proveniência. **Não altera** habilidades nativas, Card ID, artes, PP, treinamento, ímpeto embutido, slot ou habilidades equipadas. Uma lista cadastrada NÃO significa que foi vista na conta do usuário. Não copiar dados de outras versões da mesma pessoa.

## Habilidades nativas

| Proveniência | Cartas | Interpretação |
|---|---:|---|
| Legado sem evidência individual anexada | 130 | Cadastradas anteriormente; exigem nova verificação de edição e habilidades antes de homologar |
| PESDB com Card ID, nome e edição compatíveis | 89 | Correspondência de base externa; falta confirmar diretamente na carta do usuário |
| Correspondência multifatorial, sem Card ID confirmado na conta | 21 | Evidência comparativa: NÃO equivale a comprovação inequívoca |
| Lista bloqueada por conflito de identidade/raridade | 6 | Sem habilidades nativas importadas |
| **Total** | **246** | **240 documentadas / 6 sem lista** |

### Pendências de identidade não resolvidas

- **#050 Messi:** os candidatos `106784966581591` (56 PP, Offence Creator +4) e `106803488628055` (58 PP, Accuracy +4) possuem habilidades iguais no PESDB, mas não são a mesma carta. Precisamos da identificação da carta original.
- **#075 Luis Díaz, #151 Willian Pacho, #170 Jan Oblak, #181 Serhou Guirassy:** ID cadastrado aparece como **Show Time** no PESDB, enquanto a edição do catálogo está registrada como **Highlight**. Não transferir habilidades entre raridades.
- **#225 Rodri:** ID `106780940205246` retorna **Nico O'Reilly**; ID `105779675902175` é somente um **candidato** a Rodri Highlight Back in the Game. Não substituir ID sem confirmação.

As referências e critérios específicos estão em `web/SCOUT_V182_SKILLS_BOOSTERS_EVIDENCE.json`.

## Ímpetos por carta

A Konami informa que, desde v5.2.0, o Select Booster Token permite escolher entre **28 tipos de booster**. Isso **não demonstra** que cada carta possui slot selecionável nem que o slot está vazio.

| Estado **registrado** na base | Cartas | Significado |
|---|---:|---|
| Selecionável indicado, sem homologação da conta | 95 | Não declarar livre/equipado |
| Possível, sem comprovação | 3 | Não declarar elegibilidade |
| Segundo nome de ímpeto registrado | 4 | Não tratar como slot livre |
| Indefinido | 144 | Não recomendar uso de token sem verificar |
| **Total** | **246** | **Nenhum slot comprovado diretamente por esta auditoria** |

**Exceções preservadas:** Cristiano Ronaldo #024 tem dois ímpetos embutidos no registro (Striker's Instinct +4 e Physicality +3); Rivaldo #081 é relatado como um único fixo sem slot selecionável (nome ainda pendente); Rivaldo #077 é outra edição; Courtois #172 e Eto'o #236 possuem relatos de slots selecionáveis que ainda exigem identificação documental; Aubameyang #029 tem fixo e slot indicado.

## Regras de promoção

1. Habilidades nativas só passam a **homologadas** com evidência inequívoca de identidade, edição e lista, preferencialmente tela do jogo mostrando o Card ID e skills.
2. Booster fixo, segundo booster embutido e slot selecionável são estados distintos. Um nome listado no catálogo não basta para provar equipamento; a seleção local do usuário não altera os dados oficiais da carta.
3. Boosters mostrados em **candidatos externos** servem apenas para diferenciar versões; não serão aplicados às cartas do elenco.
4. As até cinco habilidades **adicionais** são recomendações, não habilidades nativas, não duplicam as já conhecidas e não devem aparecer como equipadas.
5. Recomendações de ímpeto são condicionais à elegibilidade e devem priorizar função e desempenho, não Overall.

## Fontes

- [Konami — v5.2.0, Select Booster Token e 28 tipos](https://www.konami.com/efootball/en-us/page/v5/versioninfo_v5-20)
- [PESDB — Messi 56 PP](https://pesdb.net/efootball/players/lionel-messi-106784966581591)
- [PESDB — Messi 58 PP](https://pesdb.net/efootball/players/lionel-messi-106803488628055)
- [PESDB — Luis Díaz](https://pesdb.net/efootball/players/luis-diaz-106780671726691)
- [PESDB — Pacho](https://pesdb.net/efootball/players/willian-pacho-106776376791946)
- [PESDB — Oblak](https://pesdb.net/efootball/players/jan-oblak-106766444571720)
- [PESDB — Guirassy](https://pesdb.net/efootball/players/serhou-guirassy-106769397419872)
- [PESDB — candidato Rodri](https://pesdb.net/efootball/players/rodri-105779675902175)
- [PESDB — Card ID conflitante Nico O'Reilly](https://pesdb.net/efootball/players/nico-o-reilly-106780940205246)

**Nota de integração:** não integrar PRs antigos de documentação com contagens anteriores sem rebase/atualização da cobertura atual de 240/246.
