# Contas independentes e recomendações pelo contexto do time

Estado: aprovado explicitamente pelo proprietário em 01/11/2026: “Aprovo; pode implementar”. Execução sobre o app existente; publicação/instalação ficam na barreira de produção.

## Pedido e resultado esperado

O proprietário quer que o Craque Tático entregue um conjunto utilizável de formação, funções, instruções individuais, progressão, habilidades e ímpetos ao escolher a conta, o técnico e o estilo. O exemplo é sua conta secundária: relatou melhor rendimento em partidas online, inclusive ao mudar a formação mantendo os jogadores. Quer explorar posições e estilos individuais que se complementam, sem restringir todo lateral aos rótulos de lateral ofensivo/defensivo.

A Principal mantém as 261 cartas já cadastradas e todos os registros anteriores. A Secundária terá uma aba própria, com seu acervo e seus técnicos, sem transportar automaticamente fichas ou equipamento da Principal. A preferência anterior por Posse sem PTE/PTD/MLE/MLD continua vigente; o pedido atual não a revogou. As demais táticas podem oferecer amplitude conforme o contexto.

Não existe fundamento para garantir o mesmo rendimento com qualquer técnico, formação, adversário ou conexão. O resultado verificável do software é um plano coerente e rastreável, acompanhado das diferenças e riscos; sucesso online permanece algo a observar em partidas.

## O que foi conferido

- Vídeo local de 11min05s: menus, escalação e fichas; não há partida filmada. O relato de melhor desempenho online foi confirmado pelo proprietário no chat.
- Plano mostrado: 4-3-1-2, Contra-ataque rápido, Antonio Conte selecionado. A lista contém Conte, Gasperini e Klopp. Gasperini mostra 57 em Posse, 88 no rápido e 88 em Contra-ataque. Conte e Klopp mostram 90 no rápido. A preferência por Gasperini é relato de uso, não um teste comparável visível no vídeo.
- Cannavaro em LD: Básico no ataque e O destruidor na defesa, com LD e ZC destacados no mapa de posições. Não presumir a ativação de todos os estilos em qualquer posição.
- Defensivo em Cannavaro e Ancoragem em Iniesta foram informados pelo proprietário; a tela dessas instruções não foi aberta na gravação.
- Forlán mostra o vetor [9,0,4,12,8,4,0,1,0,0], que fecha 60 PP. A ficha V378 rejeita o índice 7 para jogadores de linha. Entretanto, o modelo de atributos V376 já mapeia Goleiro 1 para Salto e Talento de GO. Isso exige uma regra por atributo/benefício, e não uma proibição pelo nome do grupo. A observação não prova por si que investir em GO1 é ideal para esse Forlán.
- Van der Sar mostra Goleiro +4 no Ímpeto1 e Goleiro +1 no Ímpeto2 (05:29–05:31). A regra atual V378 recusa a escolha selecionável com o mesmo nome do fixo e impede salvar. A nova validação deve distinguir dois slots legais de uma duplicação inválida; não proibir apenas por igualdade do nome exibido.
- O vídeo contém 23 jogadores do plano, mas a tela inicial informa 76/900 jogadores no acervo. Não tratar os 23 como inventário completo.
- As edições da Secundária diferem das homônimas da Principal: por exemplo, Iniesta Barcelona versus Espanha, Drogba Chelsea versus Galatasaray, Rijkaard Milan versus Ajax. O Messi do vídeo não identifica o Messi #050 da Principal.

Dados detalhados e imagens da conta ficam apenas nos artefatos locais da tarefa, sem inserir vídeo, inventário privado ou equipamento no repositório público.

## Base existente e escolha de abordagem

Já existem matemática progressiva V220, avaliação de habilidades/ímpetos V162/V103, contextos por proprietário/posição/técnico V311, perfis de escalação V231, ficha unificada V378 e backup V226. O motor por posição usa principalmente pesos por função/tática e alguns sinais da carta. O técnico participa da identidade do cenário e de avisos; isso não equivale a otimizar a ficha com seus bônus ativos. O contexto V314 contém duas formações fixas. Instruções individuais, desenho completo e vizinhos não participam juntos da avaliação.

Reescrever cada motor e armazenamento de uma vez amplia o risco de regressão e perda de compatibilidade. Criar um segundo aplicativo ou uma nova pilha de interface contrariaria a continuidade pedida e a base offline existente. A abordagem proposta é um coordenador de contexto sobre os motores atuais, com adaptadores e migração reversível. A entrega automática com edição manual corresponde ao fluxo solicitado pelo proprietário; detalhes de organização dos módulos ficam a cargo da implementação.

## 1. Principal e Secundária

- Seletor persistente Principal / Secundária no catálogo, ficha e time. A conta ativa permanece visível também no editor, exportação e confirmação de gravação.
- O catálogo original e as 15 próprias continuam sendo a fonte da Principal. Dados públicos da edição podem ser compartilhados por leitura; treino aplicado, adicionais, ímpeto selecionado, familiaridade e técnicos pertencem à instância da carta naquela conta.
- A Secundária tem instâncias locais próprias e inventário separado. Identificador local é obrigatório; Card ID e edição podem ficar pendentes. Nome, arte ou nível iguais não autorizam compartilhar equipamento/prova de outra conta.
- O acervo secundário será criado a partir dos 23 jogadores visíveis como rascunho de observação. Não inventar as outras cartas nem declarar seus Card IDs reconhecidos. Campos legíveis podem ser registrados com marcação de tempo; campos não vistos ficam pendentes.
- Primeira abertura permanece na Principal, mostrando o mesmo conteúdo. Não duplicar, apagar ou regravar todas as chaves existentes. Valores legados de técnico padrão, nível ou equipamento só podem ser usados no adaptador da Principal.
- Novos dados usam prefixos scoutpro: versionados, para continuar no backup atual. Escritas são validadas antes de persistir, com rollback e limite de tamanho. Quota insuficiente preserva os dados anteriores e orienta exportação. Backup antigo continua restaurável.
- O armazenamento da Secundária será próprio, reutilizando validadores e componentes do V227, sem transformá-la em acervo de outra pessoa nem impor retroativamente novos campos ao serializador antigo. Campos defensivos e provas por posição não podem ser descartados ao salvar.
- Decisão proposta pelo implementador: os 23 rascunhos chegam por um arquivo privado importável, com prévia e validação, preparado fora do repositório. Não criar um APK/EXE privado diferente nem embutir inventário no código público. A Secundária vazia é criada pelo app; importar o arquivo preenche só essa conta, mantendo os status de observação/pendência.
- Decisão proposta pelo implementador para backup antigo: manter a mescla V226 das chaves presentes, sem apagar chaves ausentes. Se o arquivo antecede o modelo de contas, selecionar Principal após restaurar e voltar à leitura legada restaurada; nenhuma seleção nova pode esconder esses valores. Invalidar caches e seleção corrente dos novos contextos da Principal quando dependências mudarem, preservando seu histórico. A Secundária não é regravada. A prévia de restauração informa explicitamente esse alcance. Backups novos restauram conta/contexto descritos no arquivo, com a mesma validação de dependências.

## 2. Um contexto completo, uma recomendação

A identidade de cada recomendação inclui conta, instância/edição da carta, posição de uso por fase, edição do técnico, estilo coletivo, desenho da formação, instruções, escalação/vizinhos e versão das regras. Orçamento, nativas, equipamento, familiaridade e atributos conhecidos entram na assinatura de validade.

Trocar a conta, um companheiro relevante ou uma instrução deve atualizar o contexto e explicar o efeito. Isso não obriga a inventar uma progressão diferente quando a mesma distribuição continua apropriada. Fichas salvas ficam no histórico do contexto original; adotar uma proposta cria uma nova revisão.

O coordenador mantém três camadas distintas:

1. **Fatos:** edição, orçamento, atributos-base, posições e estilos ofensivo/defensivo, nativas, slots, equipamento e técnico documentados.
2. **Cálculo:** custo progressivo, atributos com fórmulas documentadas, limites e comparação das alternativas avaliadas.
3. **Hipótese de jogo:** função no conjunto, cobertura, instrução sugerida, movimento esperado e teste em partidas. Não atribuir uma porcentagem fictícia de vitória ou desempenho.

Ausência de uma fórmula não será preenchida com bônus inventado. A ficha continua mostrando o que é possível calcular e qual parte depende de informação. Somar bônus de técnico, ímpeto fixo e selecionável exige origem, regra de ativação e contexto compatíveis. Valores observados no jogo não são atributos-base nem prova isolada da fórmula de cada bônus.

## 3. Estilos, posições e instruções

- Posição registrada, familiaridade, estilo ofensivo, estilo defensivo e instrução são campos independentes. O cadastro mostra como foram confirmados. Familiaridade insuficiente gera simulação; estilo inativo não significa automaticamente jogador proibido na posição.
- Regras de ativação serão versionadas e associadas a fonte/edição. Um mapa genérico de futebol não confirma aptidão da carta. Tratar um defensor com estilo Destruidor em LD como um caso analisável, sem forçá-lo a virar um lateral ofensivo.
- Instruções são persistidas por jogador/contexto/fase. Importar os dois relatos do proprietário como relatos, sem fingir tela verificada. O catálogo de opções e suas quantidades segue a versão do jogo; falta de prova limita a sugestão e não cria slots extras.
- Não preencher todas as instruções só para apresentar uma ficha completa. Marcação de adversário exige um alvo conhecido; não inventar esse alvo. Conflitos e redundâncias devem ser explicados.
- A nota oficial v6.0 confirma estilos ofensivo/defensivo separados, Formação fluída e Sobreposição; remove Ofensiva e Defesa recuada das instruções. Não oferecer essas opções removidas como atuais.
- Preservar os cinco estilos já existentes e acrescentar Sobreposição como sexta opção versionada. Não traduzir Sobreposição para Por Fora, nem reutilizar silenciosamente suas fórmulas. Os perfis antigos continuam legíveis; o sexto estilo usa extensão nova. Quando faltarem regras numéricas, elas aparecem pendentes, sem bloquear os fatos/funcionalidades que já são conhecidos.

Fonte de regras: https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00

## 4. Fichas, adicionais e ímpetos no conjunto

- Calcular alternativas com orçamento real, papel e prioridades do time. Para linha, GO1 pode ser candidato quando houver ganho relevante em Salto e custo coerente; GO2/GO3 não recebem utilidade de linha inventada. Para goleiro, considerar também benefícios físicos/aéreos documentados.
- A fronteira de alternativas compara grupos/atributos relevantes, custo, saldo e trocas. Não otimizar apenas Overall nem prometer ótimo global quando a busca for limitada. Limites e teto da busca devem aparecer nos dados de avaliação.
- Não aplicar corte universal em 99: separar investimento de progressão e bônus, respeitando os limites documentados da versão. Um atributo final maior que 99 não é automaticamente desperdício.
- Preservar adicionais já equipadas; sugerir só opções elegíveis que não sejam nativas ou duplicadas, até a capacidade real restante. Não preencher cinco recomendações quando não existirem cinco vagas. Trending e outras restrições de edição continuam respeitadas.
- Ímpeto fixo não é substituível pela sugestão. Selecionável exige slot compatível. Comparar o ganho no contexto e o custo de oportunidade dos PP; não sugerir o mesmo ímpeto por falta de análise.
- Dois slots independentes podem exibir o mesmo nome quando a edição/jogo assim permitir, como o exemplo Goleiro +4 e +1. Preservar origem, slot, magnitude e condição separadamente; a prova desses dois slots permite avaliá-los juntos. Igualdade de rótulo não basta para proibir nem para autorizar empilhamento em qualquer carta. Duplicar uma seleção no mesmo slot continua inválido.
- O conjunto considera cobertura dos laterais, proteção central, saída, aproximação e profundidade. Duas funções agressivas próximas podem gerar alerta de cobertura; não criar proibição universal de dois Destruidores.
- O método deve funcionar também para cartas normais; raridade não serve como prova de maior adequação ao papel. Um conjunto menor de atributos bem atendidos pode ser mais útil para a tarefa proposta, sem garantir resultado.

## 5. Formações e os 500 novos desenhos solicitados

- Generalizar o contexto de vagas, que hoje só cobre duas bases locais, mantendo intactas as escalações salvas.
- Primeiro lote de referência inclui 4-3-1-2 do vídeo e as famílias relatadas 4-2-2-2, 4-3-2-1, 4-2-3-1, 4-3-3 e 4-4-2, com posições efetivas explícitas e versões centrais para Posse.
- Formações possuem desenho com bola e sem bola quando aplicável, função das vagas, instruções sugeridas, riscos e requisitos de jogadores. Desenho, plano de instruções e escalação são entidades distintas.
- As 500 adicionais continuam no escopo, com inventário e deduplicação anteriores à geração. Coordenadas normalizadas e posições/fases definem a assinatura geométrica. Renomear, mudar cores, deslocar um ponto de forma irrelevante ou trocar somente uma instrução não cria nova formação.
- Cada desenho novo deve ter 11 vagas legais, um goleiro, espaçamento mínimo, zonas válidas, ausência de sobreposição, estrutura de cobertura e variante central onde a preferência de Posse exigir. Nenhuma pessoa ocupa duas vagas, mesmo em edições diferentes.
- Critério operacional proposto pelo implementador: coordenadas em porcentagem do campo; gerar sobre grade de 10 pontos percentuais e exigir distância mínima de 10 entre vagas. Normalizar orientação do ataque. Espelhamentos laterais equivalentes contam uma vez (inclusive troca LE/LD e alas). No inventário anterior, considerar duplicados desenhos cujas vagas correspondentes, com mesmas posições/fases, estejam a até 5 pontos percentuais; deslocamentos de fronteira não bastam. Para contar como novo, exigir mudança de posição/zona/linha ou separação de ao menos 10 pontos com função tática distinta explicitada. Planos de instrução que usem a mesma geometria não aumentam a contagem de desenhos. Registrar algoritmo e versão para reproduzir a deduplicação.
- O app deve mostrar separadamente quantos desenhos, planos de instrução e elencos existem. Não chamar 500 combinações de instruções de 500 novas geometrias.
- O catálogo externo já ligado no app foi localizado em Sites, mas seu conteúdo/contagem não pôde ser inventariado nesta leitura. Concluir essa comparação antes de afirmar que as 500 são adicionais ao catálogo. Não editar/publicar o site nessa etapa sem incluir sua fonte/estado no plano aprovado.

## 6. Interface e fluxo

Manter grafite/vinho aprovado e componentes compartilhados Android/Windows. Fluxo principal: escolher conta → selecionar técnico/estilo → escolher formação ou pedir sugestão → receber plano do time → abrir ficha de uma vaga. A ficha reúne função com/sem bola, instruções, progressão, adicionais, ímpeto, diferenças e motivo da recomendação.

Campos técnicos, hashes e rastreabilidade detalhada ficam em consulta expandida/exportação. Pendências que afetam uma decisão ficam junto da decisão. Opções avançadas permitem fixar jogador, instrução ou treino para comparar o restante; não sobrescrevem escolhas automaticamente.

Exportar conjunto em texto e JSON, contendo conta/contexto e dados necessários para continuar em outro chat, sem exigir API paga. Exportação nunca transforma rascunho em equipamento aplicado.

## 7. Validação e ordem de entrega

Este é um projeto em etapas, com uma experiência final integrada:

1. Contas independentes, inventário secundário observado, backup, isolamento e chave de contexto.
2. Posição/estilos por fase, instruções e benefício real dos grupos; cálculo e ficha conjunta com a formação.
3. Avaliação dos onze, comparação de técnicos, seis estilos e exportação do plano.
4. Catálogo de formações ampliado e 500 desenhos adicionais validados/deduplicados, com limites e status documental claros.

Cada etapa é implementada sobre a anterior e fica revisável. Não declarar a remodelação inteira pronta por terminar só a aba Secundária.

Critérios de aceitação essenciais:

- Uma mesma edição nas duas contas pode ter treinos/adicionais/ímpetos diferentes sem vazamento. Trocar conta não altera nenhum registro da outra; Principal mantém o conteúdo anterior na primeira abertura.
- Salvar/reabrir/restaurar o conjunto preserva conta, técnico, formação, instruções, fases e equipamento. Backup anterior mantém compatibilidade e migração interrompida preserva a versão anterior.
- Cannavaro em LD continua com estilos ofensivo e defensivo separados; Defensivo e Ancoragem não são confundidos com o estilo da carta.
- Vetor observado de Forlán fecha60PP e pode ser analisado como treino existente, com Salto de GO1 explicado. Uma alternativa é avaliada pelo benefício, não imposta como aplicação no jogo.
- Van der Sar pode manter Goleiro nos dois slots documentados (+4/+1), sem o aviso genérico de mesmo ímpeto fixo. Isso não habilita slots desconhecidos ou empilhamento sem prova em outra edição.
- Orçamento, adicionais e ímpetos são iguais na tela, cópia, exportação, comparação e salvamento. Identidade pendente não recebe atributos de outra edição.
- Trocar formações mantendo jogadores, ou alterar instruções, reavalia cobertura/posições e contexto. Não exige mudar todas as distribuições só para produzir diferença visual.
- Posse não entrega PTE/PTD/MLE/MLD. Outros estilos não herdam essa proibição sem pedido. Sobreposição não cai silenciosamente no motor Por Fora.
- 500 novos desenhos têm assinaturas realmente distintas, são adicionais ao inventário encontrado e passam validações de geometria/contexto. Não há alegação de 500 esquemas testados online.
- Testes de regressão, QA de celular/Windows, offline, histórico e exportação precedem PR. Instalação/release são uma etapa de produção separada.

Os testes de novas regras devem verificar os novos comportamentos, preservando a evidência histórica. Não apagar assertivas antigas para ocultar regressões.

## Decisões deixadas à implementação

Organização dos módulos, estrutura detalhada de busca/cache, componentes de seleção e limites de desempenho ficam com o implementador. Usar processamento limitado/cache quando necessário para não congelar o celular; medir antes de prometer latência. O resultado da pesquisa deve informar se o cálculo é exato ou uma busca limitada.

Pendente de informação externa: restante do acervo secundário, Card IDs não mostrados no vídeo, telas de instruções, fonte da fórmula de bônus que não estiver documentada, conteúdo do catálogo externo e amostras comparáveis de partidas. Essas lacunas não impedem contas independentes, registro dos fatos ou hipóteses explicitamente identificadas.

Desenho aprovado. Produzir o plano de implementação e começar pelo isolamento das contas e pelo contexto conjunto.
