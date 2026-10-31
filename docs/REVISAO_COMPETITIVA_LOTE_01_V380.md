# Revisão competitiva — lote 01, Posse central

Data: 31/10/2026. Base: v1.1.1188 / main `a40e9dc`. Solicitação: fichas, adicionais e ímpetos por edição, com desempenho além do Overall e construção pelo centro.

## Entrega e limites

Treze propostas editoriais na ficha unificada, com treino, prioridades de adicionais, ímpeto quando selecionável, motivo, troca de atributos e fonte da edição. Os treinos de Gerrard e Neuer são mantidos. Para fichas já salvas, a comparação é explícita e reversível; adotar cria nova revisão independente.

Não é homologação de desempenho em partidas, fórmula oficial Konami, ficha comprovada de criador ou revisão das 261 cartas. Os cinco estilos continuam independentes; este lote cobre apenas Posse na posição original. Restam **248 cartas** fora deste lote e as revisões competitivas dos outros quatro estilos. Não altera as formações.

## Registro para continuação

| CAP | Card ID | Carta / posição | PP | Treino | Novo ímpeto para comparar |
|---:|---|---|---:|---|---|
| 1 | 88040387251729 | Massaro / CA | 62 | Revisado | Criador ofensivo |
| 2 | 88036360649078 | Raúl / SA | 64 | Revisado | Técnica |
| 4 | 88035555413425 | Beckham / MLG | 64 | Revisado | Proteção de bola |
| 5 | 88044145348020 | Gerrard / MLG | 62 | Mantido | Regista |
| 6 | 105781823393179 | Tonali / VOL | 68 | Revisado | Sem selecionável documentado |
| 8 | 88044145214260 | Ferdinand / ZG | 56 | Revisado | Defesa |
| 9 | 88033407804051 | Chiellini / ZG | 56 | Revisado | Duelo |
| 10 | 88039045074370 | Maldini / LD | 64 | Revisado | Defesa |
| 11 | 106788187832737 | Neuer / GO | 54 | Mantido | Sem selecionável documentado |
| 14 | 106787651039542 | Dani Olmo / MAT | 62 | Revisado | Sem selecionável documentado |
| 24 | 89138556572074 | Cristiano Ronaldo / CA | 62 | Revisado | Sem selecionável documentado |
| 47 | 88029918174624 | Neymar Santos / CA | 70 | Revisado | Sem selecionável documentado |
| 208 | 106788724799833 | Olise / MAT | 62 | Revisado | Sem selecionável documentado |

Edição textual, impressão da referência, PP, nativas e distribuição completa estão fixados em `web/craque-competitive-batch-v380.js`. Nunca transferir por nome para outra edição. A assinatura do técnico continua separando os rascunhos. As propostas deste lote não incorporam bônus numéricos de técnico nem comprovam sinergia de treinador; isso precisa ser comparado no contexto da conta.

## Evidência e pesquisa

- **CONFIRMADO na referência pública:** correspondência das edições e atributos/nativas do conjunto V376, com reabertura das 13 páginas públicas pesdb em 31/10/2026. Não é confirmação de equipamento da conta.
- **CALCULADO:** custo progressivo exato das 13 propostas dentro dos PP cadastrados; categorias compatíveis; nenhuma distribuição por Overall.
- **ESTIMADO:** escolhas editoriais por função, atributos-base e preferências de jogo; ganhos/trocas calculados pelo modelo existente são condicionais. Não representam testes online.
- **PENDENTE:** superioridade em partidas, configuração real do técnico, vagas e equipamentos da conta; ficha numérica de criador com a edição exata verificada. Nenhuma identidade/PP pendente de carta fora do lote foi resolvida por suposição.

Fontes de regra: [evolução oficial Konami](https://www.konami.com/efootball/pt-br/page/overview) e [v6.1](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-10). O limite de cinco adicionais e os itens de seleção não comprovam que existam cinco vagas livres na conta ou que toda habilidade especial seja aprendível.

Referências públicas de edição incluem [Massaro](https://pesdb.net/efootball/players/daniele-massaro-88040387251729), [Neymar Santos](https://pesdb.net/efootball/players/neymar-jr-88029918174624), [Ronaldo](https://pesdb.net/efootball/players/cristiano-ronaldo-89138556572074) e os links individuais preservados em cada ficha. O relatório exportado contém as 13 URLs.

Cobertura de criadores: reaproveitadas as evidências históricas de critérios gerais; buscas públicas em português/inglês/italiano e comunidades trouxeram pistas como [As Efootball Zone — Massaro](https://www.youtube.com/watch?v=2rgAVc47Dbc) e [Lo Strano Nerd — Massaro](https://www.youtube.com/watch?v=C7xsYUXlWpw). Título/descrição não forneceram comprovação de edição e números suficientes: nenhuma distribuição foi copiada ou atribuída a esses canais. Vídeos de Massaro de outros lançamentos não são equivalentes por nome.

[Rentão](https://www.youtube.com/@rentao-efootball): conteúdo previamente registrado permanece referência geral; abertura do vídeo histórico sofreu limitação de acesso. [Blackjhon](https://www.tiktok.com/@blackjhontiktok96): perfil restrito neste acesso; não foi contornado login. Instagram e outras regiões/plataformas continuam pendentes. Não houve revisão exaustiva mundial nem consumo de créditos pagos de vídeo/transcrição. Não apresentar essas pendências como pesquisa de cartas concluída.

## Preservação e reprodução

Nenhum catálogo canônico, Card ID, PP, imagem, treino aprovado, equipamento ou dado da conta é alterado. Mudança de identidade, nativas, ímpeto fixo, PP, posição ou impressão da referência suspende esta proposta e mantém o motor anterior. Campos salvos, inclusive vetor parcial e escolhas vazias, vencem a proposta até comparação explícita.

- `node scripts/test-competitive-batch-v380.cjs`: guardas e contextos.
- `npm run check:sequential`: mesmos comandos de `check`, sem o limite de linha do Windows.
- `python scripts/qa-competitive-batch-v380.py`: perfis descartáveis, 13 edições e três telas.
- `python scripts/qa-main-sheet-v378.py`: regressão da ficha, cópia e histórico.
- `node scripts/export-competitive-batch-v380.cjs --out <pasta absoluta>`: 13 fichas, relatório e comparação estimada sem técnico/extra. Não escreve no catálogo.

Publicação e instalação deste lote não foram realizadas. APK/EXE e homologação física continuam condicionados à etapa de publicação aprovada.
