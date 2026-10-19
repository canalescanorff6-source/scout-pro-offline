# Craque Tático — V259 | Prova V254 das habilidades adicionais na auditoria V251

## Inconsistência diagnosticada

O painel dos dez critérios V252 tratava a presença de uma lista digitada em `scoutpro:v162:equipped:CAP:CardID` como documentação suficiente de habilidades adicionais. Isso contradizia a V254, que exige confirmação explícita da lista completa, vinculada a CAP + Card ID e à impressão digital da lista. Na V251 uma lista parcial poderia exibir **DOCUMENTADO** mesmo que o app de habilidades a classificasse como **LISTA NÃO CONFERIDA**.

## Correção no motor existente

A função `proofChecklist(card,index,lab,store)` agora consulta o mesmo motor oficial `SCOUT_RECOMMENDATIONS_V162` usado pela ficha principal.

Para o critério `additional` receber DOCUMENTADO, exigimos:
1. Registro V254 com `CRAQUE_ADDITIONAL_V254`, `confirmed:true`, CAP e Card ID da edição exata.
2. `fingerprint` do registro igual à lista salva atual. Edição/corte/adição invalida o indicador.
3. Cada habilidade informada precisa ser identificável no catálogo de nomes da V162.
4. Não contar habilidade nativa como adicional nem aceitar mais de cinco habilidades adicionais distintas.

Uma confirmação explícita de **zero habilidades equipadas** pode documentar a lista vazia, mas texto vazio sem confirmação continua PENDENTE. Isso NÃO significa que cinco slots estão livres sem aquela confirmação.

A mudança é **apenas na sinalização documental**, não equipa skills, não libera automaticamente slots, não escolhe ímpetos e não altera qualquer build. A V254 permanece como fonte da confirmação da conta/dispositivo. Não diz que as habilidades foram comprovadas por vídeo ou pela Konami.

## QA e regressão

- `scripts/test-additional-proof-v259.cjs` percorre 246 cartas × cinco estilos = 1.230 avaliações sem presunção de slots.
- Casos de Martinelli #191 (nível 26/50 PP): lista digitada mas não confirmada; confirmação exata; troca de Card ID/CAP; alteração de lista; revogação; habilidade desconhecida, nativa, seis adicionais; zero habilidades confirmadas.
- `scripts/test-evidence-matrix-v252.cjs` também verifica a V254 em vez de aceitar habilidades digitadas.
- `npm run check` integra os testes, com novo cache offline para Windows/Electron e Android/Capacitor.
- Nenhuma alteração em `web/SCOUT_V69_AUDITORIA.json` ou dados privados de saves. Confirmações antigas permanecem intactas no armazenamento; apenas o status exibido é reconciliado.

Integrar e publicar **apenas após** CI, auditoria das 246 cartas, QA visual Android/Windows e compilações testadas.
