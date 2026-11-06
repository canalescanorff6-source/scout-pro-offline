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
- As categorias GO2 usam defesa/alcance e GO3 firmeza/reflexos, em concordância com o simulador de atributos. O cache invalida a proposta quando a referência, sua validade ou os atributos mudam. Cadastro incompleto retorna pendência sem interromper a tela.
- Os rankings globais de adicionais e ímpetos usam o mesmo perfil com ativação válida na posição em todas as abas; não herdam o estilo da aba aberta. PP, candidatas e ímpeto mantêm-se iguais nas seis seleções.
- Nenhum treino/equipamento é aplicado no jogo nem há mudança automática dos treinos aprovados. A publicação Android/Windows foi autorizada pelo mantenedor, condicionada à suíte, revisão e QA aprovados. Instalação física e validação PvP são etapas independentes.

---

# Craque Tático V395 — ficha global de gameplay e guia de movimentação

**Data:** 06/11/2026 · **Branch:** `feat/ficha-global-multiestilo-v394` · **Entrega:** aplicativo Craque Tático, sem alterar o site externo de formações.

## Objetivo e diferença para a V393

Uma carta não muda seus PP, habilidades ou ímpetos equipados quando o jogador troca o estilo coletivo no eFootball. A V393 apresentava uma proposta de distribuição para cada estilo; a V395 entrega **uma proposta global não vinculante por edição, posição de uso e orçamento PP**, mantendo os seis seletores táticos e a explicação específica de movimentação.

O cálculo **não** é treinamento automático de Overall. Não presume mesma eficácia nos seis estilos nem implementa a IA interna do eFootball.

## Como funciona

- Fonte de dados: mesmo catálogo e motores individuais `V251`, `V233`, `V162`, `V103`; preserva Card ID, edição, PP, níveis, equipamento e evidências de origem.
- Para uma carta, interpretar os seis contextos (Posse, Contra-Ataque, Contra-Ataque Rápido, Por Fora, Bola Longa e Sobreposição). Se algum estiver pendente, **não** inventar a ficha global.
- Calcular uma distribuição única por atributos-base documentados, PP e função, agregando as prioridades dos seis contextos. O consenso minimax da V394 permanece apenas como auxiliar legado testado; **não escolhe a ficha V395**.
- O mesmo vetor global é reutilizado ao visualizar as seis táticas. Movimentação, função, estado de ativação e contexto são interpretados **por estilo/posição**.
- Habilidades adicionais são candidatas obtidas das seis análises da **mesma distribuição** e ordenadas por presença e posição no ranking; validação de nativas, aliases, equipadas e cinco vagas continua no V162. Cinco sugestões não significam cinco espaços livres.
- Ímpetos recebem ranking consultivo entre os seis estilos. Ímpeto fixo e slot realmente disponível não são alterados; qualquer sugestão é **não autorizada para aplicação** até comprovação da edição e do inventário. Um slot ausente impede a proposta de equipamento; ausência de prova nunca autoriza gastos.
- Fichas de treino, revisões e equipamentos **já salvos** conservam precedência; a proposta global não modifica registros no `localStorage`, backups, cartas originais, cartas de outros elencos, nível ou PP canônicos. Para compará-la com uma ficha preservada, usar a proposta atualizada; a consulta não aplica a revisão.
- O guia `guia-movimentacao-v394.html` mostra **261 registros públicos**: os 246 da home do catálogo e as 15 adições `ct364-owned-cards`; inclui filtros por estilo de equipe, nome, número, posição e duas formações estreitas, além de 4-2-3-1 e 4-4-2. As 23 cartas privadas aguardando importação não foram reproduzidas nem presumidas.

## O que o guia significa (e o que não significa)

O guia apresenta **tarefas prováveis por posição e estilo cadastrado**, incluindo com e sem bola, apoio, profundidade, cobertura, primeiro passe e risco tático. A trajetória real depende de posição de uso, familiaridade, ativação do estilo individual, instruções, companheiros, condição, input do usuário, versão e conexão. Não atribuir à KONAMI números internos não confirmados nem prometer que um defensor sempre antecipa, que um atacante sempre corre ou que um estilo garante vitórias.

Contra-Ataque normal corresponde à família Long Ball Counter, em bloco mais conservador que o Contra-Ataque Rápido; este tende à pressão alta e corridas verticais. Posse privilegia apoio curto e triangulação; Por Fora ocupação de corredores; Bola Longa ligação direta; Sobreposição concentração no lado forte. **Passe curto é permitido em todos.**

## Segurança e testes

- `npm run check` incorpora `scripts/test-global-v394.cjs`: PP exato, mesmo vetor em seis estilos, ordem determinística, pendências, ranking de cinco habilidades e ausência de autorização de booster.
- Os testes V395 usam edições públicas reais para PP, goleiros, igualdade nas seis táticas, adicionais/ímpetos com estilo inativo, revogação de evidência, dados atualizados e pendências. O guia e os motores globais participam da impressão digital comum Android/Windows.
- Antes do merge, rodar suíte completa no CI, conferir backup/restore de perfil descartável, plano de equipe, estilos individuais ativos, consulta de todas as 261 cartas, navegação no Android e Windows e desempenho offline.
- **Não publicar** release, assinar APK/EXE, instalar em dispositivos pessoais, converter hipóteses em dados comprovados ou substituir builds aprovadas sem autorização e evidências.

## Referências

- KONAMI: [notas da versão 6.0.0](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00)
- Amadeusz / eFHUB: [parâmetros dos seis estilos coletivos, 21/10/2026](https://efhub.com/pt-BR/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed)
- Metodologia já embarcada: `docs/SCOUT_V389_FICHAS_INDIVIDUAIS.md`, `docs/SCOUT_V392_CONTRA_ATAQUES.md` e `docs/CHECKPOINT-FICHAS-FUNCAO-V383.md`
