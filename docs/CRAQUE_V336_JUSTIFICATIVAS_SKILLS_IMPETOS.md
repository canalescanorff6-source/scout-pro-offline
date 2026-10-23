# Craque Tático — V336 · Justificativas individuais de habilidades e ímpetos

## Contexto
Continuidade do candidato cumulativo V335, que depende do PR #247 (V334) e da
integração ainda pendente de V332/V333. A V335 passou a preservar rascunhos
independentes vazios, sem substituí-los por sugestões do motor.

## Problema resolvido
Embora a análise técnica V311 listasse motivos gerais `why` e alguns campos
`synergies`, o painel Premium `FICHA EM FOCO` resumia apenas quantas habilidades
e qual ímpeto estavam em análise ou tinham sido escolhidos. A pessoa precisava
abrir todo o detalhamento para consultar essas justificativas; faltava também
indicação explícita quando o rascunho preservado não correspondia à proposta
atual e, portanto, não possuía motivo contextual registrado.

## Mudanças reais
- `web/craque-ficha-decision-v327.js` ganhou `explainEquipment`, uma
  função pura e sem escrita no armazenamento que cruza os nomes selecionados
  com a lista de `suggestedSkills` ou da revisão vigente da MESMA ficha.
- A função retorna o nome, `why`/`motivo`, sinergias registradas e
  `status` de cada habilidade, ou declara razão individual pendente se
  a seleção preservada não possui justificativa no cenário atual.
- O ímpeto selecionado procura a motivação somente na opção principal ou nas
  alternativas do ranking vigente; um ímpeto salvo de fora da lista mantém a
  seleção, mas seu motivo é sinalizado como **pendente**.
- `web/craque-positional-ui-v311.js` acrescenta **Por que estas habilidades e
  ímpeto?**, seção recolhível junto à ficha principal, tanto em Minhas Cartas
  quanto em Outros Elencos. Sem seleção, o painel informa explicitamente.
- Cada justificativa é etiquetada como proposta de análise, não evidência
  de rendimento competitivo, slot liberado, habilidade nativa confirmada ou
  item realmente equipado.
- `web/craque-positional-v311.css`: apresentação responsiva e acessível.
- `scripts/test-equipment-reasons-v336.cjs`: casos de seleção salva, nomes
  diferentes, razões ausentes, sinergias e ímpetos alternativos. Incluído em
  `npm run check`.
- `scripts/qa-ficha-decision-v327.py`: abre/fecha a seção em Chromium
  Android e Windows nos dois acervos, sem gravação automática.
- `web/sw.js` invalida o cache PWA para o novo bundle das fichas.

## Integridade, evidência e limitações
1. Todas as 246 cartas, Card IDs, imagens, PP, níveis, builds e históricos
   preservados: nenhum registro é alterado por esta interface.
2. `why`, `motivo` e `synergies` são JUSTIFICATIVAS CONSULTIVAS geradas
   por regras do projeto. Não são referências de vídeo do mesmo Card ID,
   observações verificadas de partida ou aprovação de Rentão/Blackjhon.
3. Nunca presumir skill nativa, slot disponível, ímpeto equipado ou fórmula
   oficial de bônus; ausência de fonte significa pendência, não confirmação.
4. A publicação requer CI, QA visual, builds Android/Windows, revisão do
   proprietário e, para homologar atualização, testes físicos do instalador.
5. Os PRs cumulativos #247, #248 e este PR devem ser reconciliados: não
   integrar commits duplicados nem publicar releases parciais.
