# Craque Tático — V262 | Ímpetos pendentes e justificativa das cinco habilidades

## Diagnóstico medido no catálogo original

Na V261, o motor V103 diferenciava:
- `selecionavel`: prefixo explícito `SLOT SELECIONÁVEL`;
- `possivel`: texto com a palavra `selecionável` em qualquer outra posição, inclusive `PENDENTE / selecionável`;
- `indefinido`: sem comprovação;
- `nome_registrado`: segundo ímpeto já identificado.

O adaptador V162 aceitou `possivel` junto com a confirmação local `vazio` como indicação equipável. A auditoria da V262 identifica **três** cartas nessa situação:

| CAP | Carta | Card ID | Valor original de impeto_extra |
|---|---|---|---|
| 097 | Sandro Tonali | 106764565597595 | PENDENTE / selecionável |
| 099 | Joelinton | 106761612796044 | PENDENTE / selecionável |
| 217 | Vitinha | 88040118816667 | PENDENTE / selecionável |

Essas identidades são **apenas leitura do acervo**, não nova confirmação do slot no eFootball. Nenhuma das três é autorizada a equipar novo ímpeto com essa evidência.

## Regras implementadas

1. `S.booster`: `slotSupported=true` **somente** quando o catálogo registra explicitamente `status='selecionavel'`; a conta deve confirmar `verifiedSlot='vazio'` na edição exata. `possivel` é ambíguo, retorna `slot_pendente_no_catalogo` e permite somente ranking informativo, ainda que o usuário tenha marcado vazio no dispositivo.
2. O status `slotEvidence` diferencia `slot_documentado`, `slot_pendente` e `sem_slot_documentado`. Segundo ímpeto fixo, ocupado, ausente e não documentado permanecem bloqueados.
3. O motor V103 e as 28 opções de ímpetos originais continuam intactos; o ranking por quatro atributos, função, estilo e investimento é uma **hipótese comparativa**, não uma recomendação de gastar token.
4. A seção recolhível de parecer na ficha V251 apresenta até **cinco** habilidades adicionais por tática (não apenas três), com justificativa individual e complementaridade com nativas quando documentadas. A lista **não confirma disponibilidade de cinco slots**.
5. Ao comparar ímpetos, a seção exibe os **quatro atributos afetados** calculados pelo motor V103. Se nativas não estiverem documentadas, mostra a ausência de evidências explicitamente.
6. Nunca afirmar que uma build ou skill foi testada ou recomendada por Blackjhon/Rentão sem vídeo da edição exata e conferência de Card ID. Posse de Bola central é a prioridade, sem eliminar os outros quatro estilos.

## Garantias

Não modificar `web/SCOUT_V69_AUDITORIA.json`, cartas, nível, PP, builds, raridades, imagens, nativas, ímpetos fixos, habilidades equipadas, saves ou formações. Não presumir atributos finais por Overall. Não substituir recomendações aprovadas por igualdades artificiais.

## Validação

- `scripts/test-pending-boosters-v262.cjs` percorre 246 cartas × cinco estilos = **1.230 pareceres**, detecta as três edições `possivel`, prova que não ficam equipáveis, exige justificativa em até cinco habilidades e protege a não mutação dos dados.
- `scripts/test-competitive-method-v261.cjs` mantém a auditoria anterior com cinco candidatos consultivos.
- `npm run check`, auditoria das 246 cartas, QA visual Windows/Android e compilações de teste são obrigatórios antes do merge.
- A release só poderá ser publicada após execução completa dos jobs oficiais na `main`; a instalação física ainda requer teste no aparelho.

Referência permanente de aceite: Issue #165.
