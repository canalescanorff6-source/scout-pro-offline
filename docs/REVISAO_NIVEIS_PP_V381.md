# Revisão integral de níveis e PP — V381

Solicitação e autorização explícita do proprietário em 31/10/2026: pesquisar todas as suas cartas, corrigir níveis/PP errados e refazer fichas com os orçamentos corretos. Base de produto instalada: v1.1.1188. Inclui o lote editorial V380 ainda não publicado; não reinicia sua pesquisa.

## Cobertura real

- **261 cartas conferidas:** 246 originais e 15 próprias.
- **261 níveis com referência utilizável:** 252 páginas eFHUB, quatro complementos públicos PESDB, uma captura eFHUB explicitamente confirmada pelo proprietário, três relatos novos do proprietário e a declaração anterior de Kubo 1/0 preservada. Os relatos não equivalem a verificação pública ou confirmação no jogo.
- 239 URLs eFHUB dos IDs já vinculados consultadas sem erro. Mais 21 edições CAP226–246 comparadas visualmente com suas artes originais; seus níveis/PP já estavam corretos. Os IDs candidatos ficam no relatório de evidência, sem inventar ou substituir IDs no catálogo.
- **34 originais com metadados revisados**, incluindo 30 orçamentos de PP; **15 próprias com nível/PP preenchidos** a partir da edição já vinculada. Imagens, nomes, edições, IDs, nativas, equipamentos e formações permanecem preservados.
- Quatro distribuições canônicas do orçamento anterior (CAP041/185/191/198) foram arquivadas e retiradas da condição de treino atual. Exemplos antigos de laboratório também foram arquivados; propostas recalculadas não são aplicação automática no jogo.
- Exportação atual: **1.305 contextos**, 261 × cinco estilos, usando a mesma ficha unificada do app. Todos usam níveis com fonte/relato identificado. Os cinco contextos do Messi continuam marcados com identidade pendente. Não há homologação de desempenho competitivo online.

## Casos importantes

**Havertz #041 — ID105837389528906.** A captura do proprietário mostra 32 níveis e 62 PP. Perguntado se o valor foi digitado, respondeu: **“Apareceu automaticamente no eFHUB”**. A página pública limpa e a tela limpa dessa mesma ID retornaram 26/50. Foi priorizada a referência expressamente fornecida pelo proprietário: 32/62. Ambas as evidências constam no registro; `confirmedInGame=false`. Não declarar que 32 foi verificado dentro do jogo ou que o site público retornou 32.

**Beckham #004.** eFHUB público confirma 33/64, igual ao catálogo. A conferência local mostrada na imagem registra 34/66. Ela não foi apagada ou transformada em prova pública; quando presente no dispositivo, continua sinalizada como divergência.

**Daniel Muñoz #126 e Xavi Simons #204.** São edições Trending/POTW com progressão fixa: corrigidas para 1/0. Não recomendar distribuição de PP, novas habilidades ou ímpeto selecionável nessas fichas. [Tabela oficial de desenvolvimento por tipo](https://www.konami.com/efootball/pt-br/page/overview). Não aplicar essa regra a toda carta Highlight cujo banco mostre 0/1: isso pode significar dado ausente.

**Upamecano #016:** 27/52 → 29/56. **Henderson #177:** 29/56 → 24/46. **Martinelli #191:** 26/50 → 34/66. Demais diferenças e URLs estão em `web/ct381-level-audit.json`, com antes/depois, origem e hashes.

## Resposta do proprietário em 01/11/2026

1. **Aubameyang #183:** nível32/62PP. Orçamento mantido e origem registrada como relato explícito do proprietário sobre o eFHUB.
2. **Savinho #196:** nível34/66PP. Orçamento anterior42/82 corrigido; ID105754711432614 e edição preservados. Novas propostas usam66PP, sem reutilizar o treino do orçamento anterior.
3. **Messi #050:** nível29/56PP. Orçamento mantido e relato registrado. **Edição/ID exatos continuam pendentes.** O proprietário não forneceu um novo link; quatro candidatos foram rejeitados pela arte. Não restaurar o ID anteriormente invalidado. Saber o nível não identifica a edição nem autoriza atributos/equipamento de outra carta.

Os três relatos ficam vinculados a CAP, nome, edição e identificador atual; não vazam para outra carta. Nenhum foi marcado como confirmação no jogo ou exibição automática (a confirmação de exibição automática foi dada apenas para Havertz). Restam zero níveis sem referência, mas uma identidade exata pendente.

## Implementação e preservação

- Fontes e decisões: `ct381-level-audit.json`; histórico reversível de campos: `ct381-level-corrections.json`. Relatório não contém dados privados de armazenamento do Windows.
- Catálogo, metadados das 34 fichas, laboratório, referências V376 e etiquetas do índice conciliados. Mesma imagem e mesma identidade são exigidas; os hashes das 21 artes vinculam a revisão às imagens efetivamente comparadas.
- Motor V381 distingue fonte pública, dado ausente, edição fixa, captura e relato do proprietário. V248 separa referência revisada de confirmação da conta. As próprias mostram nível de referência sem fingir confirmação manual.
- Ficha principal/cópia indicam mudança de PP. Os treinos e atributos das seções antigas aparecem como histórico do orçamento anterior. Novos contextos de técnico usam o orçamento corrigido; registros privados anteriores não foram reescritos nem apagados.
- Arquivo reversível reconstrói exatamente o catálogo anterior, dados das próprias e índice. Preservação de IDs/edições/imagens/nativas é verificada. Nada foi aplicado ao programa instalado ou a um aparelho Android nesta etapa.

## Testes e fixtures históricas

Os testes das versões V74–V364 que fixavam dados antigos (por exemplo Martinelli26/50) continuam executando as mesmas assertivas sobre a fixture anterior **reconstruída estritamente pelos campos do arquivo reversível**. Não há alteração global de `fs`, supressão de assertivas ou mudança do app para devolver dados antigos. O helper é exclusivo de testes. A auditoria operacional V289 valida sua trava antiga com a fixture e continua processando o catálogo/HTML atuais.

A integração nova testa os dados reais: 261 linhas, 261 níveis, 30 PP alterados, metadados/laboratório/índice, edições fixas, 21 hashes de artes, 15 próprias, 1.230 cenários originais e exportação de 1.305 fichas. A referência pública não se torna confirmação da conta. A auditoria documental antiga distingue suas travas históricas: 190 cálculos de fronteira, 110 bloqueios de identidade e 930 de nível; o relato novo de Savinho habilita cinco desses cálculos, sem validar gameplay.

Verificação local: `npm run check:sequential` **289 comandos PASS**; política e integração V381 observadas RED antes e GREEN após a correção; QA V381 inicial **27 aberturas de originais × cinco estilos, três próprias e conferência em 320/390/1366**, histórico local preservado/zero erros; QA de todas as **261 fichas: zero falhas**. QA V378 e V364 repetidos após os ajustes das próprias, ambos PASS. Bundle compartilhado: 181 fontes. CI e revisão independente devem ser consultados antes de qualquer publicação.

Atualização dos três relatos concluída em 01/11/2026: nova rodada completa **289/289 PASS**; integração e política V381 PASS; QA V381 **30 aberturas originais × cinco estilos**, três próprias, relatos do eFHUB, identidade pendente do Messi e histórico local em320/390/1366px PASS. O aviso anterior de Savinho42/82 foi recolhido como histórico e o aviso/KPI vigente mostra34/66. Revisão independente identificou essa contradição e a falta de nova chave do cache offline; ambos corrigidos e revalidados pelo revisor, sem novos achados confirmados. Exportação regenerada com1.305 contextos. Sem publicação/instalação nesta etapa.
