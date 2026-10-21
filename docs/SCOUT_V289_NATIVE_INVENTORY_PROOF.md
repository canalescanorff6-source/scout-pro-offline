# V289 — Inventário nativo obrigatório antes da confirmação de adicionais

**Base:** V288, commit `bd9c6226bd8475eb0c55b6cc3562ff94450351d8`, release `v1.1.710`.

## Diagnóstico real (catálogo V69 da branch main)

- 246 cartas e 246 identidades compostas distintas (CAP + Card ID + edição).
- 3 cartas têm `habilidades_nativas` ausentes: **CAP 050 Messi**, **CAP 151 Willian Pacho**, **CAP 181 Serhou Guirassy**.
- 161 cartas não possuem campo `max_level` preenchido, embora o campo de PP apareça no catálogo; não interpretar isso como nível conhecido.
- 22 cartas têm texto de pendência no Card ID; não substituir esses dados por versões parecidas.
- **Martinelli CAP 191:** Card ID `105850811319718`, nível máximo informado 26, PP 50; treino proposto continua não validado.

## Bug e correção

O comprovante local V254 era aceito mesmo quando a lista de nativas estava ausente. Um comprovante com fingerprint vazio de nativas poderia permitir ao motor declarar cinco vagas como elegíveis — sem saber quais habilidades já são nativas.

A V289 adiciona proteção **não destrutiva** em três níveis: (1) `checkedEquipment` não considera válida uma confirmação com inventário de nativas ausente ou marcado provisório; (2) `evaluate` não respeita `equippedConfirmed:true` com esse inventário insuficiente, independentemente do chamador; (3) `verifiedRecommendationContextV288` mantém `occupied` e `remaining` como `null` quando não existe documentação nativa utilizável, com justificativa específica. Os registros salvos no dispositivo não são excluídos, apenas não autorizam vagas enquanto permanecerem sem conciliação. A tela de salvamento explica as condições de bloqueio.

A ficha V251 deixa de converter `pp: null` em `0` ao montar a entrada de análise de sensibilidade. A correção não altera os 246 registros com PP cadastrado.

## Testes e integridade

- Novo `scripts/test-native-inventory-guard-v289.cjs` integrado ao `npm run check`, percorrendo 246 cartas × cinco táticas, com provas locais sintéticas, estados sem comprovante e recusa de inventário ausente ou marcador PENDENTE.
- Regressões: comprovantes válidos com inventário presente continuam aceitos; mudanças de Card ID e inventário nativo invalidam comprovantes; Martinelli conserva 26/50 e a marca de treino experimental.
- Relatório gerado: `build/v289-native-inventory-proof-246x5.json`, publicado como artifact do job de validação.
- Cache offline atualizado para carregar o motor corrigido em instalações web/PWA; nenhuma alteração de pacote ou atualizador Android/Windows.
- Verificação direta no ambiente de engenharia executou **1.230 chamadas por estilo** nos módulos reais, com **15 cenários bloqueados sem nativas**, **1.095 comprovações de lista nativa com identidade utilizável aceitas**, nenhum erro. Isso não representa `npm run check`, QA visual, compilação ou ensaio de jogo.

## Limitações e próxima coleta

O inventário estar preenchido não garante que esteja completo no jogo. A confirmação permanece **declaração do usuário**, não prova oficial, e o mecanismo ainda depende de revisar as fontes da mesma edição para nativas e elegibilidade. Não homologamos builds, skills, ímpetos nem gameplay apenas com a passagem de testes.

Nenhum Card ID, imagem, raridade, PP, vetor aprovado, habilidade original ou ímpeto foi alterado. Não há instalação automática, consumo de tokens, merge ou release nesta branch.
