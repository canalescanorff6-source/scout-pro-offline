# Contas e plano do time — V382

Implementação aprovada em 01/11/2026, sobre 505421e, sem publicação ou alteração da instalação pessoal. Continuação do trabalho de níveis/PP e ficha única da PR 310.

## Entrega

- Principal e Secundária independentes. Importação privada idempotente, editor de cartas/técnicos, histórico e backup completo. Os 246 originais e 15 acréscimos da Principal não são regravados pelo novo fluxo.
- Plano de onze jogadores: técnico/edição, seis estilos, fases, familiaridade, instruções individuais e distribuição inteira dos PP. As escolhas fixadas limitam a sugestão de escalação.
- Treino cadastrado comparado com proposta, adicionais sem repetir nativas/equipadas conhecidas, ímpeto fixo separado do selecionável e pendências por decisão. Atributos finais só estimados com base exata e bônus documentados.
- GO1 físico disponível mediante contexto funcional. Ímpetos de mesmo nome só combinados em dois slots distintos com prova vinculada à identidade registrada; edição nova exige reconferência.
- 500 desenhos adicionais, dez famílias, grade 10 e distância mínima 10; comparação com a geometria publicada anterior, equivalência até 5 e espelhos contados uma vez. Posse sem PTE/PTD/MLE/MLD nas duas fases.
- Tela `plano-do-time-v382.html` no shell existente, grafite/vinho; cache e manifesto comuns Android/Windows. Exportação nativa reutiliza o contrato V225; fichas textuais em ambiente nativo usam JSON com o texto integral.

Os dados privados do vídeo, miniaturas e 23 cartas importáveis ficam fora do Git. O vídeo apresenta menus, não partidas. A indicação 76 no acervo não autoriza inventar as 53 cartas ausentes.

## Verificação executada

- `npm run check:sequential`: **296 comandos PASS**. Mesmo conteúdo do `npm run check`, executado separadamente para evitar o limite de linha do Windows.
- Testes V382: contas/rollback/restauração antiga, contexto e regras físicas, 500 geometrias e geração determinística, plano/exportação, contrato de UI, seis regressões da revisão independente.
- Playwright 320/390/1366: importação 23, escalação/instruções, troca de geometria e estilo mantendo escolhas compatíveis, salvar/reabrir, histórico obsoleto consultável, exportação, backup/restauração, isolamento e offline.
- Regressões visuais: V378 ficha principal (três telas); V362/V380 shell (17 rotas em dois tamanhos); backup offline com catálogo 261.

Nenhum teste físico de instalação Android/Windows foi feito nesta etapa. Nenhum merge, release, assinatura ou instalador foi alterado/publicado.

## Revisão independente

Um revisor sem o histórico da implementação inspecionou a mudança em modo somente leitura. Zero achados críticos; seis importantes reproduzidos com testes inicialmente falhando e corrigidos:

1. Capacidade de adicionais, confirmação de identidade e referência pública agora invalidam recomendações anteriores.
2. Progressão fixa de Trending é respeitada nos seis estilos, inclusive Sobreposição.
3. Evidência de ímpetos não é transferida silenciosamente para uma nova edição/ID.
4. Troca de desenho/estilo mantém jogadores, fixações e instruções compatíveis, avisando sobre vagas incompatíveis.
5. Alvo de contra-ataque e marcações alteram a função defensiva exibida e os alertas de cobertura.
6. Revisões antigas continuam consultáveis/exportáveis; precisam de recálculo para adoção como plano atual.

Também foi reproduzida e corrigida a troca de conta que podia ser revertida por uma URL antiga após recarregar.

## Decisões e limitação menor

- Rendimento online permanece hipótese editorial: faltam partidas comparáveis. Custo se a hipótese estiver errada: investir recursos sem a melhora esperada.
- A precisão do inventário privado foi conferida separadamente nas capturas e no importador; campos sem prova ficam pendentes. Custo de um erro: conferir novamente a edição/valor antes de investir.
- Instalação/publicação nativa fica para uma etapa autorizada de distribuição; testes web não comprovam comportamento físico em todos os aparelhos. Custo: defeitos específicos podem aparecer somente nessa validação posterior.
- Menor adiada: desenhos diferentes podem compartilhar o rótulo curto da lista. O campo e o identificador exportado distinguem o desenho; descrições mais específicas facilitariam encontrá-lo novamente.

## Ajuste após a primeira rodada do GitHub

CI e validação de Player ID passaram. A QA visual encontrou uma faixa de contas que retirava a primeira carta da abertura em 320px. A medição confirmou cerca de 75px extras; o acesso foi incorporado ao menu existente. O teste novo de entrada das contas falhou antes da correção e passou depois, nos três tamanhos; V364 também passou com 246+15 cartas, busca e edição. A nova rodada do GitHub acompanha a PR 311.
