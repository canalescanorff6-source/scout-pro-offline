# V294 — Cinco vagas só com comprovante da mesma edição

## Falha reproduzida

O motor de habilidades V162 ainda tratava `{equippedConfirmed: true}` como autorização suficiente para informar cinco vagas livres quando a lista manual estava vazia e as nativas eram conhecidas. Isso ocorria **sem `equipmentRecord` V254**, mesmo que a complementaridade de habilidades já exigisse recibo validado. CAP 001 reproduziu `equippedConfirmed: true` e `slotsRemaining: 5` antes da correção.

Essa divergência podia fazer consumidores de `evaluate` e `strategicPortfolioV286` aparentarem cinco slots disponíveis sem conferência da conta.

## Implementação

- `evaluate` exige simultaneamente identidade utilizável, inventário nativo, cinco habilidades sem duplicação/conflito, `equippedConfirmed: true` explícito e **`checkedEquipment(card, manual, equipmentRecord)` verdadeiro**.
- Um booleano isolado gera `equippedConfirmed: false`, `slotsRemaining: null` e uma mensagem explicando as provas ausentes. As sugestões permanecem **consultivas**, sem confirmação de vagas.
- As APIs integradas que passam o comprovante verdadeiro, incluindo `verifiedRecommendationContextV288`, continuam capazes de informar de 0 a 5 vagas conforme a lista real declarada.
- Testes V254/V276/V277/V286 usam fixtures com recibos sintéticos completos. Nenhum teste foi excluído.
- Novo `scripts/test-equipment-proof-required-v294.cjs` testa 246 cartas × cinco estilos: rejeição de flags isoladas, rejeição de comprovantes de outra edição, manutenção de recibos completos, não mutação e privacidade do estado da conta.
- Resultado exportado em `build/v294-five-slot-proof-246x5.json` e anexado à CI.

## Limitações

Comprovante é declaração local do usuário, não fonte oficial do jogo. O motor não afirma disponibilidade do menu real de habilidades, não concede tokens e não equipa habilidades automaticamente. A conferência das 246 cartas em cinco estilos é **automática**, não homologação de 246 builds por gameplay.

Nenhum Card ID, treino aprovado, nível/PP, imagem, nativa, ímpeto, HTML individual ou versão atualizada do app foi sobrescrito. A branch V294 depende das alterações V289–V293, sem merge ou release.
