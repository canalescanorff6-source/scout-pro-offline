# V346 — Validação de habilidades e ímpetos na fronteira de gravação

## Falha corrigida
O editor V311 já auditava nativas, adicionais, aliases V162 e slot de ímpeto
antes de salvar. Entretanto a função V324.save, compartilhada pelos dois acervos,
não recebia estas evidências: outro caminho de gravação poderia registrar uma
nova ficha contrária ao cadastro da mesma edição.

## Proteção implementada
- V324.save aceita `native`, `equipped`, `fixedBooster` e `boosterSlot`
  **opcionais**, além de `skillKeyFor`.
- Havendo evidência fornecida, a rotina executa `reviewDraftReadiness`
  no último limite antes da gravação. Rejeita novas revisões que coincidam
  com habilidades nativas/adicionais informadas (inclusive aliases PT-BR/EN
  documentados em V162) ou tentem registrar ímpeto com slot cadastrado
  explicitamente como `ausente`.
- A UI passa as evidências da **carta e edição em foco** ao V324.save.
  Outros chamadores legados sem evidência seguem compatíveis; não se
  presume que listas vazias comprovem ausências ou que slot pendente esteja livre.
- Nenhuma revisão anterior é corrigida, descartada, aprovada, equipada ou
  migrada automaticamente. Autorização humana continua obrigatória.
- `scripts/test-persistence-evidence-guard-v346.cjs` verifica rejeição
  sem escrita, históricos intactos, aliases, isolamento Minhas Cartas /
  Outros Elencos, 246 cartas e gravação consistente após remover candidato.
  Incluído em `npm run check`; testes V345 mantidos e cache offline revisto.

## Limites da evidência
As comparações são documentais; não constituem prova de gameplay, slot
realmente livre nem de equipamento no jogo. Testes Android/Windows e QA
visual devem ser aprovados no SHA final antes de cogitar qualquer publicação.
V346 é cumulativa sobre V339–V345, sem merge na `main` e sem release.
