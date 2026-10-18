# V247 — Auditoria de PP e correção documentada #191

## Evidência
O usuário informou que a **carta #191 Gabriel Martinelli**, Card ID `105850811319718`, possui **nível máximo 26**. Pela regra `PP = 2 × (nível máximo − 1)`, o orçamento correto é **50 PP**. O histórico do projeto tinha 66 PP indevidos. Isto **não confirma** que essa edição pode atuar como CA, nem que o treino proposto já foi aplicado.

## Auditoria inicial do catálogo
- 246 cartas preservadas; IDs mantidos.
- 84 registros com `max_level` já documentado: zero divergência `PP != 2*(max_level-1)` antes da correção.
- 162 cartas sem campo `max_level` no catálogo naquele momento: não é possível validar o teto apenas com o número de PP.
- V69/V98: zero inconsistências de PP, Card ID e vetor de nível entre os dois arquivos; consistência **interna** não é prova de nível máximo correto.
- Todos os vetores existentes auditados tinham custo progressivo igual ao PP cadastrado; orçamento incorreto pode passar nesse teste, como no #191.
- Só o #191 foi alterado, porque houve confirmação do nível pelo usuário.

## Histórico preservado (não reutilizar como build aplicável)
```json
{
  "cap": 191,
  "card_id": "105850811319718",
  "niveis_anteriores_66_pp": [4,6,10,12,8,0,0,0,0,0],
  "cenario_B_anterior_66_pp": [6,4,8,12,10,0,0,0,0,0],
  "nivel_maximo_confirmado_pelo_usuario": 26,
  "pp_corrigido": 50,
  "proposta_A_50_pp": [4,4,8,10,8,0,0,0,0,0],
  "proposta_B_50_pp": [6,5,8,8,8,0,0,0,0,0],
  "status": "proposta_nao_validada"
}
```

As propostas A/B são redistribuições aritmeticamente válidas do orçamento, não treinamentos aprovados, otimizados por prova de atributos, ou aplicados na conta. Os registros pessoais locais/backups existentes não são sobrescritos por esta correção. Se uma build salva usar 66 PP, deve ser tratada como rascunho histórico incompatível e jamais carregada como treino utilizável de 50 PP sem revisão explícita.

## Cuidados
Não gerar PP novos para os demais 162 cartões sem nível máximo documentado. Para cada divergência futura, exigir captura do nível e Card ID da edição exata; auditar catálogo, V98, ficha HTML/JSON, comparativos e editor de treinos. Não tocar na assinatura do APK, imagens, posições treinadas V246 nem no PR V241.
