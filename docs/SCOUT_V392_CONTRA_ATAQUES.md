# V392 — Contra-Ataque e Contra-Ataque Rápido: guia de execução por formação

**Escopo:** orientar o jogo manual e expor tarefas por **vaga** nas duas formações já existentes, com a mesma entrada da ficha individual. Não substituir o motor de progressão, não inventar equipamento, não reescrever o catálogo e não redefinir Posse.

## Mecânica e interpretação das fontes

- Em **Contra-Ataque** (`normal`, semelhante a *Long Ball Counter*), a recuperação parte de um bloco mais conservador. A construção tende a ligação mais direta. Passe curto continua viável e pode servir para encontrar o corredor central; a tática não obriga o usuário a cruzar nem a fazer lançamento em toda posse.
- Em **Contra-Ataque Rápido** (`rapido`, *Quick Counter*), a equipe procura pressão mais adiantada e saída vertical rápida, com maior risco de bola nas costas da linha defensiva. Sem linha de passe, não forçar a bola só porque o estilo é rápido.
- O jogo altera parâmetros por versão. Os valores exploratórios de parâmetros internos publicados pelo eFHUB **não são uma configuração editável de linha ou pressão dentro do app** e não devem ser prometidos como resultado garantido no PvP.

Fontes: [Konami — visão geral e proficiência do técnico](https://www.konami.com/efootball/pt-br/page/overview), [Konami — atualização v6.0.0, estilos ofensivos/defensivos e formação fluida](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00), [eFHUB — estudo dos seis estilos, 21/10/2026](https://efhub.com/pt-BR/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed). A leitura do eFHUB é **análise de terceiros** e não valida individualmente qualquer carta.

## 4-3-1-2 estreita · 2 CA + MAT + MLG + 2 VOL

| Fase | Contra-Ataque | Contra-Ataque Rápido |
|---|---|---|
| Saída | ZG/GO -> VOL -> MAT ou MLG; localizar apoio antes do passe de ruptura | Recuperação por VOL/MLG -> MAT em poucos toques -> CA com vantagem |
| Dois CA | Um recebe de costas, outro ataca espaço; alternar segundo edição | Um ameaça a última linha e outro apoia a tabela; inverter quando necessário |
| MAT/MLG | MAT organiza, MLG aproxima para terceiro homem | MAT acelera decisão e MLG pressiona/ataca após recuperar |
| Dois VOL | Um segura área central e outro faz passe vertical seguro | Um cobre a linha alta; outro pode iniciar transição, sem avançar ambos |
| Defesa | Contenção, bloquear passe central, não sair com ZG precipitadamente | Pressão coordenada perto da bola; se falhar, controlar VOL e cobrir profundidade |

## 4-2-1-3 estreita · 2 CA + SA central + MAT + 2 VOL

| Fase | Contra-Ataque | Contra-Ataque Rápido |
|---|---|---|
| Saída | VOL -> MAT ou SA -> um dos CA; passe de segurança quando sem ângulo | Passe vertical curto para MAT/SA; tabela com CA e ruptura pelo centro |
| SA | Aproximar como parede do passe para os dois CA | Encostar imediatamente e criar triângulo MAT-SA-CA |
| MAT | Criar entrelinhas, sem forçar último passe | Acionar atacante em movimento, mas reciclar se o espaço fechar |
| Defesa | SA impede saída central e MAT vigia volante rival | MAT/SA orientam primeira pressão, VOL garante cobertura |
| Risco | Distância entre meio e ataque | Dois CA + SA podem deixar os dois VOL expostos; impedir ruptura adversária |

## Rotina prática de treino no eFootball mobile (comandos manuais)

1. **Antes de atacar:** verifique o posicionamento do CA de apoio, CA de ruptura, MAT/SA e volante. A escolha deve partir da vantagem visível, não de uma sequência fixa.
2. **Primeiro passe após roubar:** passe curto ao volante ou MAT se estiverem livres; passe em profundidade apenas se houver corredor e tempo. Evite receber de costas em pressão dupla.
3. **Se a tabela falhar:** volte a bola para MAT/VOL; não transforme todo erro em corrida contra a defesa adversária.
4. **Defesa no Contra-Ataque:** controle preferencialmente o VOL para cobrir o centro e bloquear a linha de passe; não puxe o ZG para longe da área.
5. **Defesa no Contra-Ataque Rápido:** pressione com o jogador próximo somente se outro fechar o passe; antecipe lançamento nas costas selecionando o defensor de cobertura, sem mover os dois ZG na mesma direção.
6. **Teste em partida:** registre lances de saída, perdas no meio, bolas nas costas, isolamento dos CA e fadiga. Compare pelo menos séries de partidas com adversários/horários semelhantes, sem atribuir toda mudança à ficha.

## Regras de precisão para fichas, cinco adicionais e ímpetos

O PR #315, já integrado à `main`, adicionou distribuição individual por edição/posição/estilo, revisão por ação e reavaliação de habilidades e ímpetos no vetor proposto. A V392 **não refaz ou sobrescreve** essa engenharia, porque mudar uma build sem a prova de identidade, orçamento e atributos da edição exata seria regressão.

- **Ficha:** Card ID + edição + nível/PP + posição de USO + estilo do técnico + treino aprovado + referência antes da otimização. Se faltarem base/nível, apresentar **pendente/hipótese**; não inventar atributos.
- **Habilidades adicionais:** as cinco são o **limite de capacidade**, não cinco vagas livres garantidas. Conferir nativas, equipadas, aliases oficiais e slots restantes. Sem repetição da nativa e sem afirmar equipadas candidatas não confirmadas.
- **Ímpetos:** manter fixos intactos; oferecer ranking por função, estilo e complementaridade ao treino proposto. Slot extra ausente/ocupado/não comprovado **não autoriza equipar**.
- **Comparabilidade:** trocar `normal` e `rapido` não pode regravar Posse, outros elencos, níveis originais ou fichas salvas. Uma recomendação pode coincidir entre duas cartas sem ser prova de cópia; quando for o caso, o painel precisa explicar as evidências ou marcá-las pendentes.
- **Validação PvP:** recomendações são hipóteses; só ensaio controlado com observações de jogo pode sustentá-las como configuração competitiva.

## V392 — seleção completa de titulares e banco por estilo

- A seção **Sugestão para Contra-Ataque / Contra-Ataque Rápido** exibe até 11 titulares e 12 reservas por formação. O cálculo só considera jogadores com posição documentada ou familiaridade/treino já confirmado na edição, sem misturar duas cartas do mesmo atleta. Cartas restringidas na lista local não são sugeridas.
- A ordenação é um **encaixe documental ordinal**, não uma comprovação de quais cartas são melhores no PvP. Usa sinais cadastrados de posição, estilo, habilidades nativas e complementaridade de função (volante de ligação/proteção, CA de apoio/ruptura, zagueiros de cobertura). Só um teste de partida e dados do jogador podem homologar o resultado.
- O usuário pode **Aplicar 11 titulares e 12 reservas nesta tática**, com confirmação explícita. A seleção é validada novamente e salva em chave própria do estilo e formação. A **Posse de Bola** não pode receber essa atualização; as fichas, PP, slots de habilidades e ímpetos não são alterados automaticamente.
- O banco sugerido é aplicado somente pelo botão. Caso o usuário mude os titulares depois, o banco continua protegido contra duplicidade de pessoa e pode ser automaticamente corrigido, com aviso na ficha do reserva.
- `scripts/test-dual-counter-v392.cjs` verifica os quatro contextos (2 formações x 2 estilos), o XI e 12 reservas, a identidade, a elegibilidade e as exclusões.

## Entrega e aceitação

- Guia visível na tela **Minhas duas formações**, ao selecionar Contra-Ataque ou Contra-Ataque Rápido, com ataque, defesa, risco, variação 4-3-1-2/4-2-1-3 e tarefas individuais da **vaga**. Cada vaga continua abrindo a ficha por posição para PP, skills e ímpetos específicos da edição.
- `scripts/test-dual-counter-v392.cjs`: cobre duas formações, 11 vagas e dois estilos, preservação das 246 cartas e não interferência nas outras três táticas.
- `npm run check` + CI/QA de Android/Windows devem passar antes da versão oficial. O teste físico de atualização do APK e do instalador é etapa separada; **uma branch/PR não instala uma versão no dispositivo**.
