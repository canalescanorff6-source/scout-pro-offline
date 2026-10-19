# Craque Tático V264 — auditoria competitiva de 246 cartas × 5 táticas

## Objetivo

O usuário exige **melhores fichas, cinco habilidades adicionais e ímpetos para todas as 246 cartas originais**, seguindo o método de triagem competitiva que referencia Blackjhon e Rentão. A aplicação **não pode** apresentar heurística como build homologada, adivinhar Card ID ou trocar builds aprovadas. A meta é o melhor resultado **sustentado por evidências**, não uma lista inventada de 246 treinamentos supostamente profissionais.

## Diagnóstico inicial no catálogo (não significa o estado instalado na conta)

- 246 cartas originais preservadas;
- 84 sem vetor de treino registrado em `SCOUT_V69_AUDITORIA.json`;
- 25 com descrição da edição pendente ou por confirmar;
- 3 sem lista de nativas no catálogo principal;
- 161 sem nível máximo numérico no catálogo principal.
- Não confundir identificadores numéricos curtos do eFHUB/Player ID com ausência de identificação. A conferência da **edição/Card ID exatos** prevalece; marcador literal PENDENTE impede recomendação como confirmada.

## Motor V264

`web/craque-competitive-readiness-v264.js` implementa `assess(card,proof,style,advice)`. O resultado sempre é consultivo e separa nove verificações: **identidade da edição, PP/nível, vetor de treino, habilidades nativas, cinco adicionais efetivamente equipadas, slot do ímpeto, atributos-base, vídeo/print da versão exata e gameplay comparável**.

Estados na única ficha principal:
- `blocked`: edição/Card ID pendente; o parecer principal não exibe lista de cinco como validada nem seleciona ímpeto específico;
- `review`: edição identificada, mas sem vetor original;
- `registered`: build cadastrada, sem garantia de rendimento competitivo;
- `gameplay`: existe sinal documental suficiente para **revisão humana**, não aprovação automática.

`allowedToReplaceApprovedBuild`, `canSpendTokensAutomatically` e `competitivelyHomologated` permanecem **false** em todos os estados. A avaliação não grava nada no banco, não substitui cartas, nem cria habilidades/atributos.

A tela mostra prioridade por edição, com lacunas específicas e indicação de uso consultivo. A seleção temporária de função V263 continua valendo e exige V246 por CAP + Card ID. Cinco estilos: Posse, Contra-Ataque Normal, Contra-Ataque Rápido, Por Fora e Passe Longo.

## Referências oficiais Konami (28/09 e 08/10/2026)

- [Anúncio oficial v6.1.0 — novos tokens](https://www.konami.com/efootball/pt-br/topic/news/5888): **100 Tokens de Habilidade Selecionada** para escolher habilidade; **100 Tokens de Posição Selecionada** para escolher proficiência. Tokens Avançados convertidos em 20 Tokens de Habilidade Selecionada por unidade conforme o anúncio.
- [Campanha de 08/10/2026](https://www.konami.com/efootball/pt-br/topic/promotion/campaign/904/): itens disponibilizados em eventos.
- [Desenvolver jogadores](https://www.konami.com/efootball/pt-br/page/dreamteam): até **cinco** habilidades adicionais; PP via evolução, treino de posição e ímpetos disponíveis conforme carta.

**Essas regras não provam que a habilidade ou o slot exista em uma carta específica; os dados da edição ainda precisam ser conferidos dentro do jogo.** Não calcular economia nem inventar o saldo da conta.

## Critério profissional Blackjhon/Rentão

Usar as referências como método de avaliação: estilo de jogo, versão exata, corpo, nativas, relação atributos/PP, função ofensiva/defensiva, complementaridade com os parceiros e observação em campo. Jamais atribuir a eles uma build, habilidade ou ímpeto sem vídeo de **mesmo Card ID/edição** com timestamp e fonte registrada.

## Validação

`scripts/test-competitive-readiness-v264.cjs` executa **1.230 avaliações** com as 246 cartas × cinco estilos, mantendo as edições originais intactas. Testa bloqueio do Messi #050 pendente, Martinelli #191 (nível 26/50 PP) sem falsa homologação, evidências incompletas e identificador curto numericamente válido.

A auditoria é o **primeiro estágio da homologação total**. As 84 builds sem vetor e quaisquer nativas/status incompletos continuam pendentes até confirmação pelo usuário ou fonte da edição exata. Não anunciar “246 melhores fichas validadas” até esse processo estar realmente concluído.

## Preservação e publicação

Não houve alteração em `web/fichas/*.html`, `SCOUT_V69_AUDITORIA.json`, `SCOUT_V221_EVIDENCE_INDEX.json`, imagens, PP, níveis, skills nativas, adicionais confirmadas, boosters, saves ou formações. As melhorias ficam em branch isolada até CI, QA visual e builds de teste Android/Windows passarem. Release oficial apenas após integração e pipeline assinada.

## Entrega consultiva completa para todas as 246 cartas

O script `scripts/build-competitive-report-v264.cjs`, executado no `npm run check`, percorre as 246 edições e exporta **1.230 cenários**, em JSON e CSV, nos arquivos:

- `build/v264-competitive-246x5.json`
- `build/v264-competitive-246x5.csv`

A pipeline disponibiliza ambos no artefato **craque-tatico-v264-dossie-246-cartas-5-estilos**, retido por 30 dias. Para cada edição e tática, registra o vetor original sem modificar, possível distribuição matemática não homologada, até cinco habilidades propostas com justificativa, ímpeto comparativo e lacunas. **Nenhum dos campos significa instalação ou aprovação automática**, e cartas sem identidade comprovada ficam sem recomendação específica.

Isso viabiliza revisar todas, com trilha de evidências e sem travar na primeira carta pendente. Os arquivos de relatório ficam fora do catálogo instalado; não são builds aplicadas no Android ou Windows.
