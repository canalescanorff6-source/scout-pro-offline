# Fichas completas V375

Pedido: novas fichas, habilidades adicionais e ímpetos no app. O catálogo externo de formações não é alterado nesta revisão.

## Entrega

A revisão compartilhada de cada carta mostra identidade/edição, função escolhida, estilo, a distribuição proposta por categoria e o custo progressivo de PP. A comparação com o treino cadastrado continua disponível. Todas as candidatas adicionais disponíveis (até cinco) aparecem com motivo, situação e relação com as nativas. O ímpeto principal e duas alternativas apresentam os atributos relacionados e os motivos calculados. Nativas, adicionais já informadas, ímpeto fixo e extra informado permanecem distintos.

**Copiar ficha completa** exporta a mesma consulta, sem salvar treinamento ou equipar habilidades. Se a área de transferência não estiver disponível, aparece um campo selecionável com o texto. Adoção continua sendo uma ação separada que cria revisão com histórico.

Aplica-se às 246 cartas originais, às 15 adições e às cartas cadastradas em Outros Elencos. Identidade exata permanece na cópia. Nenhuma carta original, imagem, equipamento ou formação é regravada.

## Propostas concretas e limites

O pacote reproduzível contém 1.305 fichas (261 × cinco estilos), mais dez consultas adaptadas de Neymar #090 em SA e Maldini #010 em ZG. Das fichas nativas, 1.230 fecham o orçamento de PP cadastrado; as 75 consultas das 15 adições mantêm PP pendentes. Estes orçamentos não são comprovação de nível máximo no jogo. Outras adaptações podem ser consultadas pelo seletor existente no app.

Exemplo calculado para Neymar #090 em SA/posse: sete grupos de linha `8/8/8/8/7/4/0`, custo de 62 PP cadastrados. A familiaridade secundária continua pendente; a ficha não habilita a posição no jogo. Não copiar para outra edição do Neymar.

Esta revisão torna utilizáveis e exportáveis as propostas dos motores V251/V233/V162/V103 já existentes. **Não implementa uma nova fórmula de atributos finais nem comprova melhora do desempenho online.** Sem atributos-base completos da edição, não é possível assegurar ausência de desperdício acima de 99 ou superioridade competitiva. Os nomes cadastrados não comprovam vagas adicionais ou slot de ímpeto. As recomendações são candidatas para teste.

Sobreposição permanece explicitamente sem perfil numérico: não recebe indevidamente a ficha de posse. Os cinco estilos matemáticos existentes continuam independentes.

## Fontes

- [Konami v6.0](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00): separação de estilos ofensivos/defensivos e regras de posição. Não é fonte de uma build numérica para cada carta.
- [Konami v6.1](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-10): seleção entre habilidades e posições elegíveis. Não comprova elegibilidade de uma edição específica.
- [Rentão, vídeo original](https://www.youtube.com/watch?v=T6RSqfhl3Ck): transcrição anteriormente lida para critérios gerais; nenhuma build numérica das 261 cartas atribuída a ele.
- [Blackjhon, perfil fornecido](https://www.tiktok.com/@blackjhontiktok96): acesso bloqueado/login; não atribuir recomendações desta revisão a um método dele não consultado.

## Verificação

`node scripts/test-function-sheet-v375.cjs`: identidade das 261 edições, 1.305 consultas, custo progressivo, inventário nativo, motivos, até cinco candidatas, 75 orçamentos pendentes, exemplos SA/ZG, renderizador real em memória e sucesso/falha da cópia sem gravação.

`npm run fichas:export -- <pasta>`: gera JSON e Markdown locais usando os mesmos motores. O pacote usa o catálogo do repositório, sem ler os equipamentos salvos na sessão do usuário. As pendências dessa conta continuam sendo conferidas no app.

Computer Use permanece interrompido; não houve inspeção física/instalação nesta revisão. CI visual e compilações serão informados no PR. Merge e publicação exigem a autorização prevista em AGENTS.md.

Revisão independente identificou nomes brutos em inglês na cópia. O caso real #001 falhou em teste antes da correção e passou após reutilizar os catálogos PT-BR V162/V230 também no texto exportado. Nomes técnicos sem correspondência documental não recebem tradução inventada. As listas e IDs originais continuam preservados.

Nota de revisão: o retorno de sucesso do botão de adoção já podia ficar em um nó removido pelo redesenho V374. Classificado como menor e registrado; não afeta o salvamento/histórico, nem a cópia nova, e não foi alterado nesta revisão.
