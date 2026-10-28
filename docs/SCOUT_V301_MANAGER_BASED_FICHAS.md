# V301 — Fichas por técnico e estilo, sem falsos zeros

## Falha reproduzida no código
Ao selecionar outro estilo, `scout-training-unified-v218.js` substituía o vetor de progressão por `Array(10).fill(0)` quando a ficha não possuía hipótese salva e a referência não passava pelas exigências de comprovação V252. O usuário via dez zeros, confundindo ausência de proposta com distribuição de zero PP.

## Correção V301
- Se existir treino original compatível em PP, mostrar **referência cadastrada, não recalculada para a tática** em vez de zeros.
- Se não existir vetor, mostrar **— (pendente)**; nunca inventar valores.
- Quando a auditoria V251 confirmar CAP, Card ID numérico, edição e nível/PP, enviar proposta matemática exata da tática ao editor apenas como **prévia não homologada**.
- Não gravar a prévia automaticamente nem alterar imagens, Card IDs, níveis, PP, builds, skills ou ímpetos do acervo.
- Se houver rascunho local, ele tem prioridade; a prévia não o sobrescreve.
- Manter Posse e laboratório legado independentes; impedir que treino provisório vire baseline.
- Invalidar cache offline no Android e Windows.

## Próxima etapa dependente de comprovantes dos técnicos
Cadastrar cada técnico **por versão exata**, sem presumir que edições de um mesmo técnico compartilhem números. Campos por edição: identificador inequívoco, nome, carta/edição, estilo(s) e proficiências comprovadas, bônus específicos, Link-Up Play/habilidade de técnico e condições de ativação. Cada ficha deverá vincular (carta CAP/Card ID + posição comprovada + estilo + técnico e edição + PP de origem + bônus confirmados); bônus do técnico NÃO são PP de treinamento. Sem atributos-base comprovados, mostrar investimento em PP, não inventar status finais. Usuário enviará os prints para preencher o catálogo.

## QA
`node scripts/test-zero-styles-v301.cjs` e `npm run check`, auditoria de 246 cartas, QA visual se aplicável, Android debug, instalador Windows e publicação oficial conjunta após CI GREEN. Não marcar testes físicos como concluídos sem dispositivos reais.
