# Craque Tático V260 — auditoria de atributos-base por edição

## Diagnóstico real

O checklist V251/V252 marcava o critério de atributos-base como DOCUMENTADO quando `row.base_stats_confirmados` era verdadeiro e havia **um único valor-base válido** em `lab.stats`. Isso confundia snapshots parciais com dados suficientes para engenharia de progressão. Exemplo: Raúl #002 possui **nove** estatísticas-base no laboratório, mas não comprovação completa de todos os atributos da edição. Prints apenas candidatos também não comprovam o Card ID.

## Correção no motor existente

Foi criada a função pura `baseEvidence(card,row,lab)`, disponível no mesmo módulo V251, sem duplicar tela, criar ficha nova ou persistir dados.

1. Valida identidade do laboratório por Card ID, nome e PP da edição.
2. Conta apenas campos-base com nome não vazio e valor inteiro entre 0 e 120. Ignora estatísticas inválidas.
3. Uma flag do índice com valores numéricos válidos fica marcada como **PARCIAL** enquanto não existir fonte completa da edição comprovada.
4. Uma fonte declarada como completa exige adicionalmente print confirmado no índice para a edição, ao menos 20 campos-base numéricos (salvaguarda **estrutural**, não parâmetro Konami), ausência de valores inválidos e `lab.stats_proof` com schema `CRAQUE_BASE_PROOF_V260`, Card ID e descrição da edição idênticos, confirmação no jogo, contagem e referência da fonte preenchidas.
5. Mesmo com uma fonte numérica completa, **nenhum treino se torna validado competitivamente por isso**. O requisito de gameplay permanece independente.
6. A visualização passa a mostrar claramente DOCUMENTADO, PARCIAL ou PENDENTE dentro da única ficha V220/V251. Informações parciais contam como pendentes para homologação e não liberam builds.

O campo `stats_proof` é um contrato de evidência para futuras verificações, não um dado preenchido artificialmente. Nenhuma das 246 cartas originais recebe esse campo nesta versão. Um usuário não deve tomar o preenchimento manual da referência como comprovação independente da Konami; continua necessária a inspeção real da fonte.

## Regressões

`scripts/test-base-evidence-v260.cjs` verifica o catálogo inteiro, os laboratórios das 246 edições, a identidade dos arquivos, a classificação parcial, o exemplo de Raúl #002 com nove valores numéricos e casos sintéticos com 1 ou 20 atributos, Card IDs divergentes, edição divergente, PP divergentes, valores inválidos e falta de referência.

`npm run check` inclui a nova regressão. Cache offline do Android/Capacitor e Windows/Electron é renovado. QA visual valida 360 px, 390 px e 1366 px.

## Preservação

Não alteramos **nenhum** arquivo `fichas/*.html`, `SCOUT_V69_AUDITORIA.json`, `SCOUT_V221_EVIDENCE_INDEX.json`, Card ID, PP, nível, raridade, habilidade, ímpeto, build, save ou formação. A mudança é na interpretação e apresentação do estado da evidência, não na engenharia final de atributos.

A V260 não poderá ser integrada ou publicada até CI, auditoria, QA visual e compilação de teste Windows/Android aprovados.
