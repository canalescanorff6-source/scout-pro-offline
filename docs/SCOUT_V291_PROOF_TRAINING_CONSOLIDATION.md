# V291 — Reconciliação competitiva das provas V289 e da otimização experimental

**Base técnica:** PR #197 (`engineering/v289-training-equipment-lab`), sem alterar a branch `main` ou os acervos originais.

## Defeitos corrigidos

1. **Confirmação de cinco vagas sem inventário nativo.** Um recibo de equipamento V254 com impressão digital das nativas vazia podia ser aceito para cartas com nativas ainda não cadastradas. A V291 exige nativas presentes e sem marcadores provisórios na API `checkedEquipment`, em `evaluate` e no contexto V288. As vagas seguem `null`, mesmo que o chamador envie `equippedConfirmed: true`. A declaração salva não é apagada, mas sua prova deixa de liberar vagas até revisão.
2. **Viés de uma build experimental.** O otimizador V251 penalizava o afastamento de uma distribuição com `treino_proposto_nao_validado: true`, tratando-a como baseline, inclusive em comparação com pares.
3. **Referência experimental no comparador multiobjetivo.** A nova fronteira V289 mostrava a proposta ainda experimental como `treino_registrado` e usava sua distribuição como âncora. A V291 adiciona `baselineProvisional` ao contrato do comparador. O PP e a build de origem continuam acessíveis para comparação histórica, mas o otimizador usa a proposta contextual como referência do cenário.

## Cobertura

- Auditoria de 246 cartas × cinco estilos, sem alterar os registros; casos CAP 050, 151 e 181 bloqueados para confirmação de habilidades na ausência de nativas.
- Martinelli CAP 191: nível máximo 26, 50 PP, build experimental preservada. Cinco estilos testados sem baseline experimental, incluindo consistência com `allocate`, regras de custo e modo alternativo de fixture não provisória.
- Regressões históricas V266, V276 e V277 adaptadas às regras de confiança mais estritas, sem eliminar afirmações de unicidade, duplicidade e limite de slots.
- Interface única V251 exibe alerta sobre referência experimental; cache offline invalidado para Android/Windows.
- `scripts/test-proof-training-consolidation-v291.cjs` integra `npm run check`; relatório `build/v291-proof-training-246x5.json` no job de validação.

## Limites metodológicos

Uma lista nativa preenchida não é automaticamente confirmada pela Konami e a declaração local não prova elegibilidade real no menu. A fronteira de Pareto é limitada às opções geradas, não exaustiva. Sem estatísticas-base, validação em partida e edição documental confirmadas, a recomendação continua consultiva. Processar 1.230 cenários não significa homologar 246 cartas individualmente.

**Preservação:** nenhum arquivo do catálogo V69, imagem, HTML original, Card ID, nível, PP, habilidade nativa, ímpeto ou build foi modificado. Nenhum PR foi integrado à `main`; nenhuma release foi criada.
