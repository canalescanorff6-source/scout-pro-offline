# V288 — Provas de equipamentos sincronizadas entre as fichas e motores

**Continuidade oficial:** V287, tag `v1.1.708`; base do código `8601f0ad23a79f141e35d66d0589ddb2b3a7304f`.

## Problemas realmente identificados

1. A interface V287 construía um objeto de verificação V254 com CAP/Card ID/edição **sem passar as habilidades nativas**. O fingerprint das nativas ficava diferente do fingerprint salvo no jogo, e uma confirmação válida da mesma edição podia aparecer como não confirmada.
2. A V286 na ficha principal calculava o portfólio **sem ler as habilidades adicionais já confirmadas na conta**. Podia apresentar cinco sugestões quando restava apenas uma vaga informada, ou nenhuma.
3. A V284 e a V285 exibiam recomendações com contexto diferente da V287; as várias partes da mesma ficha não partilhavam um único estado de prova.
4. A V287 declarava “nenhuma skill autorizada por dados suficientes” quando, na realidade, os **cinco slots podiam estar ocupados**. Isso agora recebe uma explicação correta.
5. Uma confirmação salva para Card ID ou edição textualmente **PENDENTE** não deve habilitar slots mesmo se um registro local tiver as mesmas strings provisórias.

## Melhorias implementadas

- **API pura `verifiedRecommendationContextV288`**: utiliza CAP, Card ID, edição, habilidades nativas canônicas, lista completa das adicionais e registro V254; valida o estado V283 do ímpeto sem confundir catálogo com conta.
- Não promove registros legados para confirmação vigente; não apaga seus dados, permitindo reconciliação manual.
- Uma confirmação com lista ou nativas alteradas deixa de provar vagas, sem aproveitar o fingerprint antigo.
- Rejeita edição diferente, Card ID trocado, registro inativo ou incompleto, fingerprint adulterado e documentos com identidade “pendente”.
- Produz os indicadores `occupied` e `remaining` **somente quando a lista completa foi conferida no dispositivo**. Sem prova, o número de vagas é desconhecido — não zero e não cinco.
- Estado do segundo ímpeto distingue `vazio`, `ocupado`, `ausente` e `não conferido` apenas quando o registro está vinculado à carta exata.
- A ficha principal V284 mostra agora uma faixa concisa e responsiva com o estado verdadeiro da conta: adicionais ocupados, vagas restantes e situação do ímpeto.
- A V284, a V285, a V286 e o conselho V287 recebem **o mesmo comprovante verificado** e respeitam o mesmo limite de slots. Não há cálculo paralelo com cinco vagas presumidas para uma carta já conferida.
- Se há quatro adicionais confirmadas, o portfólio consultivo pode propor **no máximo uma**; com cinco ocupadas, nenhuma.
- A comparação V286 explica explicitamente o limite de vagas e não inventa adicionais para completar cinco.
- O conselho V287 distingue ausência de habilidades disponíveis de indisponibilidade de vagas.
- A origem canônica dos dados continua protegida: nenhum Card ID, imagem, raridade, habilidade nativa, progressão/PP ou build aprovada foi substituído.
- O bloco de interface é recolhível e reutiliza a identidade premium existente; evita ocupar a tela inicial mobile.

## Integridade e QA

- `scripts/test-verified-account-context-v288.cjs`: **246 cartas × 5 estilos (1.230 cenários)**; sem prova, slots ficam desconhecidos. Testa seis quantidades de habilidades ocupadas (0 até 5) e o efeito coerente sobre V284/V285/V286/V287.
- Casos negativos: edição adulterada, Card ID trocado, nativa/fingerprint alterado, registro sem confirmação, registro legado e carta #050 com Card ID pendente; sem autorização de equipamento.
- Comprovação V283 do ímpeto: `vazio`, `ocupado`, `ausente`, registro de outra edição e identidade ainda pendente.
- Relatório `build/v288-account-proof-246x5.json`, anexado à execução da CI, sem expor o armazenamento local da conta.
- QA Chromium em oito resoluções; validação visual da barra de prova em 390 px e 1151 px, inclusive estado **vagas desconhecidas** e ausência de overflow.
- O mesmo JavaScript e cache offline são compartilhados pelo Android e Windows.

## Metodologia competitiva

A intenção é aproximar as decisões da disciplina de análise individual de Rentão e Blackjhon, **não** atribuir a esses criadores as fichas nem copiar suas recomendações sem fontes da mesma edição e Card ID. Continuidade de arquivos e testes NÃO prova gameplay, melhora numérica, cartas meta, skills equipadas no jogo ou ímpetos disponíveis. Não usamos Overall como prova.

**Gate:** somente integrar após os cinco checks de PR verdes; publicar APK assinado, Windows EXE, SHA256, blockmap e `latest.yml` somente após novo pipeline de `main` e revisão da SHA de origem.
