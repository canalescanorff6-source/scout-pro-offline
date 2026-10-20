# Craque Tático V270 — interpretação de função e paridade de nativas PT-BR / EN

## Origem
- Branch da V270 criada da `main` `88dfbc30b2ea27804d930866f4a62181737ba5e8` (PR #174, release v1.1.631).
- Catálogo imutável: 246 cartas, edição e Card ID individuais, imagens, PP e treinos preservados.
- Critérios de Blackjhon e Rentão usados como **metodologia de conferência**; nenhuma autoria de builds é atribuída sem fonte da edição exata.

## Defeito documental confirmado
O motor tratava `Construção de Jogo` (Rio Ferdinand #008 e David Alaba #023) como um zagueiro genérico, embora o acervo diferencie esse papel de um Destruidor. O mesmo ocorria com parte dos laterais ofensivos/móveis e com `Criador de Espaços` no módulo de habilidades. No motor de ímpetos, `Finalização de primeira` e `Chute de longa distância` em PT-BR não ativavam os mesmos sinais heurísticos de suas equivalências em inglês, observável na lista nativa de Modrić #220. Isso gerava rankings diferentes por idioma para habilidades equivalentes.

## Correções implementadas
- `web/booster-engine-v103.js`: zagueiro construtor/defensor criativo ou participativo ganha **peso consultivo** de passe, controle curto e cobertura; Destruidor continua valorizando recuperação; laterais ofensivos/atacantes/móveis recebem prioridades coerentes com apoio e circulação. Os ajustes são limitados a papéis e estilos registrados na mesma carta, sem inferir OVR ou atributos.
- `web/booster-engine-v103.js`: aliases nativos em PT-BR (`Finalização de primeira`, `Chute de primeira`, `Chute de longa distância`, `Finalização de longa distância`) recebem o mesmo tratamento heurístico de `First-time Shot` e `Long-range Shooting`, inclusive no critério de finalização de CA/SA.
- `web/skills-booster-v162.js`: harmoniza `Criador de Espaços`; oferece prioridades de passe e apoio a defensores construtores e laterais ofensivos, preservando a checagem de habilidades nativas, slots e confirmação de equipamento.
- `scripts/test-role-evidence-v270.cjs`: verifica 246×5 = 1.230 cenários, 10 categorias de PP sem alteração, ausência de duplicação de nativa nas adicionais, ímpetos sem slot confirmado, integridade do catálogo, estilos sintéticos contrastados e paridade de habilidades PT-BR/EN.
- `build/v270-role-evidence-246x5.json`: relatório consultivo gerado pela CI, com concentração das sugestões por tática/função e dados pendentes. Repetição é hipótese de revisão, não erro automático.
- `web/sw.js` versionado para nova versão offline.

## Limites inegociáveis
- Não regravar PP, nível, build homologada, cinco skills equipadas, ímpetos fixos, cards, fotos, Card ID, saves, posicionamento treinado ou escalações.
- Os ajustes de pontuação **não são atributos finais**, gameplay observado ou aprovação de Blackjhon/Rentão.
- Não preencher 84 treinos ausentes e 1 provisório apenas para parecer completo.
- A concentração em Técnica é um indicador descritivo, não uma meta artificial de redução.

## Gate de publicação
1. CI completa `npm run check` e integridade das 246 cartas GREEN.
2. Auditoria V101 e compilações Android debug e Windows NSIS GREEN.
3. QA visual de 8 viewports e inspeção dos dados de overflow/colisão GREEN.
4. PR aprovado, merge protegido pelo SHA do head; workflows da `main` novamente GREEN.
5. Release Android assinada e Windows publicada, com APK, SHA256, EXE, blockmap e latest.yml presentes. Teste físico de instalação é etapa separada.
