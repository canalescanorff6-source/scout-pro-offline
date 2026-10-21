# V299 — unificar bloqueio dos laboratórios de PP divergentes

**Base:** PR #206 V298, aprovado nos cinco checks. Esta branch é cumulativa desde V289; não aplicar merges duplicados.

## Problema real

V298 passou a bloquear o parecer principal de ímpetos quando o comprovante local V248/V296 da **mesma edição** indica PP divergentes do catálogo. Porém, dentro da própria ficha V251, os laboratórios secundários V283, V284, V285, V286 e V287 ainda executavam independentemente e podiam exibir pontuações de ímpeto/treinamento com os PP antigos. A interface, portanto, contradizia o bloqueio principal.

## Alterações

- Preservar `progressConflict` do parecer V298 como fonte única do alerta de orçamento.
- Também bloquear o item `budget` do checklist V252 enquanto o comprovante local da mesma edição indicar PP diferentes, inclusive quando um nível documentado já exista no catálogo; restaurar DOCUMENTADO após reconciliação.
- Quando o conflito é válido, exibir o aviso `ct299-pp-gate` na ficha principal e suspender a renderização dos laboratórios comparativos V283–V287. O usuário poderá reconfirmar os PP e reabrir esses módulos.
- Continuar exibindo fichas, identidade da carta e habilidade nativa/adicional previamente cadastrada. Uma conferência V254 do inventário de habilidades **não é apagada** pelo conflito de nível/PP.
- Habilidades funcionais permanecem apenas **consultivas** e recebem nota explícita de que não provam investimento enquanto os PP divergirem.
- Recibos V248 legados sem edição são preservados, mas não acionam bloqueio falsamente confirmado.
- Nenhum dado original, CAP, Card ID, raridade, nível, PP, distribuição, equipamento, imagem, estilo ou ímpeto foi modificado.

## Validação

- `scripts/test-unified-pp-lab-guard-v299.cjs`: 246 cartas × cinco estilos, 1.230 divergências e 1.230 comprovantes legados, mais inventário V254 preservado em Martinelli CAP191 26/50.
- `scripts/qa-visual-v195.py`: no cenário de PP52 vs catálogo PP50 deve mostrar aviso e não renderizar V283–V287; após desfazer a divergência, aviso desaparece e V284 volta.
- `npm run check`, auditoria física, QA visual em oito resoluções, compilações Android debug/Windows de teste, com resultados reais a conferir no PR.
- Artefato `build/v299-unified-pp-lab-guard.json` de execução automatizada.

## Continuidade

Aprovação automática dos testes **não equivale** a validação em partidas nem a instalação física. O PR V299 contém cumulativamente o trabalho V289–V299; manter os precedentes sem merge duplicado. Não fazer merge/publicação até comprovar assinatura Android oficial, paridade dos instaladores, integridade do atualizador e requisitos do Prompt Mestre.
