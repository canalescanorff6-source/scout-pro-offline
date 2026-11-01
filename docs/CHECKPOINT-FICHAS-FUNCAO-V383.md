# Fichas por função — continuação da PR 311

Método aprovado pelo proprietário em 01/11/2026. Baseline 7f0aab2; implementação incremental na mesma branch. Sem recriar o aplicativo, publicar versão ou alterar a instalação pessoal.

## Uso

No menu Mais, abra Plano da Principal ou Conta Secundária. Escolha técnico/edição, estilo, desenho e onze. Cada vaga permite escolher uma função ou usar a sugestão pela posição/estilo ativo, além das instruções existentes. Monte o plano e confira treino, habilidades e ímpetos antes de investir no jogo.

A ficha apresenta tarefa com/sem bola, prioridades que realmente participam da distribuição inteira dos PP, colegas próximos no desenho e referências de proteção. Estilo ofensivo inativo/desconhecido não entra no motor como se estivesse ativo. A defesa usa a posição da fase sem bola. Familiaridade permanece uma informação independente da ativação.

As candidatas de adicionais seguem a função e excluem nativas/adicionais conhecidas, respeitando a capacidade informada. Ímpetos candidatos mostram a finalidade; o equipamento atual permanece separado. Dados ausentes de edição, PP, habilidades, vagas ou regras de estilo continuam pendentes. Não existem números finais inventados ou promessa de desempenho.

Salve uma revisão para registrar observações de partidas online, contra amigos ou IA: quantidade, jogador/time, apoio, infiltração, recomposição, cobertura e comparação em texto. São relatos manuais por conta/revisão/contexto; nunca alteram automaticamente a ficha ou validam rendimento. Uma nova revisão começa sem relatos; a anterior continua consultável. Troca de dados invalida o uso corrente e preserva histórico/exportação. Backup completo inclui esses registros.

## Regras e proveniência

Módulo `craque-function-method-v383.js`, versão de regras `function-383-20261101`. Fontes/data ficam na ficha e no JSON. Fonte técnica independente é distinguida da identidade comprovada de uma carta e da observação em jogo.

- [Konami v6](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00): separação das fases/estilos e desenho fluido.
- [Resumo defensivo eFHUB](https://efhub.com/articles/260816_1-four-new-playing-styles-found-in-the-game-files): utilizar somente o resumo de estilos existentes, excluindo os quatro especulativos apresentados no começo do artigo. Destruidor inclui LD/LE.
- [eFootball Explained](https://efootballexplained.com/playing-styles/): páginas individuais de posições compatíveis; versão 11.1.1, consulta 01/11/2026. O próprio levantamento informa verificação em andamento. Infiltração em MLG e ala produtivo inativo em MAT têm páginas específicas vinculadas na ficha. Não importar números internos de IA ou porcentagens deste levantamento.
- Rótulos antigos/ambíguos sem equivalência documentada, por exemplo Matador, Oportunista, Avançado Pivô, Lateral móvel, Lateral atacante e Pressão elevada, permanecem pendentes. A tarefa da posição ainda permite uma proposta funcional, sem presumir a ativação desses rótulos.

## Verificação

- `npm run check:sequential`: 299 comandos PASS; preservação das 246 cartas e das fontes existentes.
- Testes V383 inicialmente falhando e depois passando: fases/posições/familiaridade independentes, rótulos pendentes, função alterando PP, orçamento exato, vínculo/validação/limites de observações, revisão nova sem transferir relatos, exportação e dependências offline/bundle.
- Playwright 320/390/1366: escolha de função, 22 estados de fase, registro de relato, histórico, exportação, backup/restauração, isolamento e offline; plano funcional da Principal também exercitado. Perfis descartáveis, sem escrever na instalação pessoal.
- Regressão da tela V382 em três tamanhos e QA ampla em oito resoluções: zero problemas.
- Um revisor independente, somente leitura, sem o histórico da implementação: zero achados críticos/importantes. Dois menores corrigidos com reprodução RED/GREEN: alvo da observação preservado ao salvar e identificação completa da revisão na exportação textual. Ao mudar revisão, o formulário começa de forma consistente.

Código web compartilhado por Windows/Android, sem mudanças de assinatura ou atualizador. Compilação no GitHub pode gerar artefatos de teste; isso não equivale a instalação física nem publicação. O estado remoto do novo HEAD deve ser conferido na PR 311.

## Limites

Pesos são prioridades editoriais por tarefa, não fórmula oficial de vitória ou otimização comprovada em partidas. Colegas próximos são referências geométricas do desenho, não trajetórias simuladas. O vídeo fornecido contém menus; resultados online continuam sendo relato do usuário. A aba individual antiga mantém suas fichas/históricos; o método conjunto é acessado pelo Plano do time. Nenhuma carta canônica, edição, nível/PP ou imagem foi alterada por esta continuação.
