# Revisão V395 — uma ficha global por edição (06/11/2026)

A V394 era um **consenso entre seis treinos** e poderia continuar repetindo PP entre dois CA com a mesma função. Isso **não atendia** ao requisito. A V395 substitui essa escolha por uma **otimização única calculada sobre a edição exata**.

**Contrato implementado**

- Uma única ficha de PP para cada edição + posição de uso: o vetor **não muda** ao clicar em Posse, Contra-Ataque, Contra-Ataque Rápido, Por Fora, Bola Longa ou Sobreposição.
- As seis prioridades táticas participam do cálculo em conjunto, com a mesma importância; nenhuma seleção sozinha determina o treino. A tela mantém a leitura de movimentação por estilo.
- O cálculo utiliza atributos-base vinculados a **CAP + Card ID + edição**, estilo individual ofensivo e defensivo, habilidades nativas, ímpeto fixo e orçamento de PP, sem maximizar Overall. Só entrega ficha numérica quando o vínculo documental e os atributos de referência são suficientes; caso contrário marca **PENDENTE**, sem distribuir pontos genéricos.
- Dados corporais externos de **15 edições** podem fornecer apenas pequenos ajustes editoriais de disputa; são vinculados por CAP e Card ID em `craque-physical-v395.js`, sem supor braços, pernas ou pescoço diferentes entre Big Time e Epic. O arquivo `SCOUT_V189_CORPO_EXTRAS.json` não possui Card ID confirmado e **não pode** ser convertido em evidência dessa edição.
- Não há diferenciação forçada por nome, raridade ou hash: **cartas diferentes podem legitimamente ter ficha igual** se forem equivalentes nos dados verificáveis e nos objetivos de função. Diferenciação é consequência da base técnica, não regra estética.
- `scripts/test-card-individual-global-v395.cjs` compara seis estilos por carta, mesmo PP/função/estilo com cartas de Cristiano Ronaldo e Drogba, Cristiano Big Time/Épico, Suárez, dados ausentes, ID errado e medidas corporais não disponíveis.
- **Metodologia experimental:** a função de utilidade considera prioridades editoriais, atributos-base, bônus fixos, talentos nativos e retornos decrescentes aproximados. Os alvos numéricos **não são limiares comprovados da IA da KONAMI**. Nem atributos individuais nem modelo físico são confirmação de desempenho competitivo; validação com replay e partidas controladas permanece necessária.
- Nenhum treino/equipamento aplicado no jogo, atualização dos binários nem mudança automática dos treinos aprovados. O PR permanece de revisão até testes e QA.

---

# Craque Tático V394 — ficha global de gameplay e guia de movimentação

**Data:** 06/11/2026 · **Branch:** `feat/ficha-global-multiestilo-v394` · **Estado:** PR de revisão, sem instalação/publicação

## Objetivo e diferença para a V393

Uma carta não muda seus PP, habilidades ou ímpetos equipados quando o jogador troca o estilo coletivo no eFootball. A V393 apresentava uma proposta de distribuição para cada estilo; a V394 adiciona **uma proposta global não vinculante por edição, posição de uso e orçamento PP**, mantendo os seis seletores táticos e a explicação específica de movimentação.

O cálculo **não** é treinamento automático de Overall. Não presume mesma eficácia nos seis estilos nem implementa a IA interna do eFootball.

## Como funciona

- Fonte de dados: mesmo catálogo e motores individuais `V251`, `V233`, `V162`, `V103`; preserva Card ID, edição, PP, níveis, equipamento e evidências de origem.
- Para uma carta, gerar seis **hipóteses válidas** pelo motor anterior (Posse, Contra-Ataque, Contra-Ataque Rápido, Por Fora, Bola Longa e Sobreposição). Se alguma estiver pendente, **não** inventar a ficha global.
- Escolher uma das propostas por critério de **consenso minimax**: minimizar a maior distância de investimento em PP aos demais cinco vetores, com desempate pela distância média. Prioridades de contexto acrescentam pesos de comparação. É um critério editorial transparente e reversível, não a prova de melhor gameplay.
- O mesmo vetor global é reutilizado ao visualizar as seis táticas. Movimentação, função, estado de ativação e contexto são interpretados **por estilo/posição**.
- Habilidades adicionais são candidatas obtidas das seis análises da **mesma distribuição** e ordenadas por presença e posição no ranking; validação de nativas, aliases, equipadas e cinco vagas continua no V162. Cinco sugestões não significam cinco espaços livres.
- Ímpetos recebem ranking consultivo entre os seis estilos. Ímpeto fixo e slot realmente disponível não são alterados; qualquer sugestão é **não autorizada para aplicação** até comprovação da edição e do inventário. Um slot ausente impede a proposta de equipamento; ausência de prova nunca autoriza gastos.
- Fichas de treino, revisões e equipamentos **já salvos** conservam precedência; o consenso não modifica registros no `localStorage`, backups, cartas originais, cartas de outros elencos, nível ou PP canônicos.
- O guia `guia-movimentacao-v394.html` mostra **261 registros públicos**: os 246 da home do catálogo e as 15 adições `ct364-owned-cards`; inclui filtros por estilo de equipe, nome, número, posição e duas formações estreitas, além de 4-2-3-1 e 4-4-2. As 23 cartas privadas aguardando importação não foram reproduzidas nem presumidas.

## O que o guia significa (e o que não significa)

O guia apresenta **tarefas prováveis por posição e estilo cadastrado**, incluindo com e sem bola, apoio, profundidade, cobertura, primeiro passe e risco tático. A trajetória real depende de posição de uso, familiaridade, ativação do estilo individual, instruções, companheiros, condição, input do usuário, versão e conexão. Não atribuir à KONAMI números internos não confirmados nem prometer que um defensor sempre antecipa, que um atacante sempre corre ou que um estilo garante vitórias.

Contra-Ataque normal corresponde à família Long Ball Counter, em bloco mais conservador que o Contra-Ataque Rápido; este tende à pressão alta e corridas verticais. Posse privilegia apoio curto e triangulação; Por Fora ocupação de corredores; Bola Longa ligação direta; Sobreposição concentração no lado forte. **Passe curto é permitido em todos.**

## Segurança e testes

- `npm run check` incorpora `scripts/test-global-v394.cjs`: PP exato, mesmo vetor em seis estilos, ordem determinística, pendências, ranking de cinco habilidades e ausência de autorização de booster.
- Foram feitas verificações pontuais em ambiente de script: análise JavaScript e cenário sintético de um CA com 62 PP, onde as seis táticas retornaram o mesmo vetor e equipamento consultivo. **Não** é build aprovada, ficha real de Cristiano Ronaldo ou teste físico.
- Antes do merge, rodar suíte completa no CI, conferir backup/restore de perfil descartável, plano de equipe, estilos individuais ativos, consulta de todas as 261 cartas, navegação no Android e Windows e desempenho offline.
- **Não publicar** release, assinar APK/EXE, instalar em dispositivos pessoais, converter hipóteses em dados comprovados ou substituir builds aprovadas sem autorização e evidências.

## Referências

- KONAMI: [notas da versão 6.0.0](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00)
- Amadeusz / eFHUB: [parâmetros dos seis estilos coletivos, 21/10/2026](https://efhub.com/pt-BR/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed)
- Metodologia já embarcada: `docs/SCOUT_V389_FICHAS_INDIVIDUAIS.md`, `docs/SCOUT_V392_CONTRA_ATAQUES.md` e `docs/CHECKPOINT-FICHAS-FUNCAO-V383.md`
