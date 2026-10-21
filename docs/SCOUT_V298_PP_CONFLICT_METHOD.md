# V298 — parecer competitivo bloqueado por PP divergentes da mesma edição

Base V297/PR #205 (corrige publicação conjunta); branch cumulativa V289–V298.

## Falha
`buildReview` da ficha V251 já bloqueava a otimização quando uma conferência válida de nível no dispositivo indicava PP diferentes do catálogo. Contudo `methodologyGate` ignorava essa mesma conferência, podendo mostrar o treino registrado como utilizável e listar ímpetos com score/confiança derivados do orçamento antigo.

## Correção
- Ler a mesma declaração local V248, validada por CAP + Card ID + nome + **edição** conforme V296.
- Quando a conta registra nível matematicamente correspondente a PP diferentes do catálogo:
  - manter todos os dados originais, e proibir o uso desse PP no cálculo consultivo da ficha/ímpetos;
  - mostrar `pp_divergentes_bloqueado` com ambos os valores e não afirmar build homologada;
  - ocultar candidato primário, alternativas, margens e atributos do ranking de ímpetos naquele parecer;
  - expor `progressConflict` com os valores conflitantes, `PENDENTE_PP_DIVERGENTES` e `bloqueado_pp_divergentes`;
  - não declarar `budgetOriginConfirmed` nem elegibilidade para equipar.
- Recibos antigos sem `edition` seguem preservados, mas **não** acionam uma divergência considerada comprovada; primeiro precisam da reconfirmação no jogo.

## Validações
- `scripts/test-methodology-pp-conflict-v298.cjs` ensaia 246 cartas × cinco estilos com divergência confirmada no dispositivo e recibo legado; exige ausência de recomendação de ímpeto e preservação integral do catálogo.
- `npm run check`, QA visual, Android debug e Windows de teste no PR. Registros de gameplay ou prova externa **não** são inventados.
- JSON `build/v298-pp-conflict-gate-246x5.json` no GitHub Actions.

## Continuidade
Se os cinco checks concluírem GREEN, V298 fica pronta para revisão da cadeia acumulada. O bloqueio de release oficial até comprovar assinatura, artefatos e atualização em dispositivo real permanece. Nada é integrado/publicado sem completar os critérios condicionais do Prompt Mestre.
