# V289 — decisões de treino, habilidades e ímpetos

Base oficial: `bd9c6226bd8475eb0c55b6cc3562ff94450351d8` (V288, release `v1.1.710`). Alterações propostas em branch própria; nenhuma integração em `main` ou publicação de APK/EXE autorizada nesta etapa.

## Resultado por lote

| Lote | Implementação efetiva | Arquivos principais |
|---|---|---|
| A — Integridade | Auditoria computacional por edição/HTML; trava SHA-256 do catálogo, 246 imagens e índice; fila CSV com pendências reais. | `scripts/audit-competitive-v289.cjs`, `docs/SCOUT_V289_INITIAL_DIAGNOSIS.md` |
| B — Treinamento | Candidatos inteiros com custo exato; comparação de quatro eixos de investimento (três para GO); fronteira de Pareto limitada aos candidatos gerados; custos das trocas por categoria; cache limitado com cópias de saída. | `web/craque-ficha-individual-v251.js`, `scripts/test-training-frontier-v289.cjs` |
| C — Habilidades | Bloqueio funcional de recurso de GO em linha; separação de Comandante da defesa GO e Liderança; complementaridade de adicionais comprovadas; motivo, situação, relação com investimento, prioridade, alternativa e confiança. | `web/skills-booster-v162.js`, `scripts/test-equipment-context-v289.cjs` |
| D — Ímpetos | Ranking recebe a prova real das adicionais; aliases canônicos geram o mesmo cálculo; contribuição limitada e separada de nativas/base; ímpeto já ocupado também é excluído da simulação. | `web/booster-engine-v103.js`, `web/skills-booster-v162.js` |
| E — Tática | Mesma função e cinco estilos existentes no comparador; trocar tática reinicia a comparação; nenhuma doutrinação ou proficiência é concedida pelo simulador. | `web/scout-card-unified-v220.js`, ficha V251 |
| F — Interface | Comparador recolhível, calculado ao abrir, dentro da ficha existente; tabela de níveis/PP e custo de oportunidade; complementos experimentais recalculados; combinação alternativa de skills recolhida. | ficha V251 e seu CSS, painel V162, `web/sw.js` |
| G — Verificação | Regressões de evidência/equipamento, orçamento e função; auditoria 246 × 5; interação/offline/persistência em Chromium; artefatos de auditoria anexados ao CI do PR. | novos testes V289, `scripts/qa_competitive_v289.py`, QA visual existente, `package.json`, workflow de validação |

## O que os números significam

- **246 edições auditadas automaticamente**, em 1.230 cenários de carta × estilo. **Zero validações individuais de gameplay** nesta sessão.
- 85 cartas têm nível/PP documentados pelo usuário; 161 continuam sem comprovação do nível máximo.
- 25 identidades ainda são pendentes no catálogo; três listas de nativas estão ausentes.
- 112 HTMLs legados têm nativas diferentes do catálogo. A conciliação por edição já existente continua sendo usada; não sobrescrevemos esses dados antigos.
- O teste puramente matemático cobre 425 cenários com nível documentado e encontra 2.358 candidatos exatos. **110 desses cenários têm identidade pendente e não liberam o novo comparador da edição.**
- A auditoria do fluxo utilizável resulta em **315 cenários** com identidade cadastrada e nível documentado, somando **1.740 candidatos experimentais**. Os demais 915 cenários ficam pendentes para a nova comparação (805 por nível e 110 por identidade).
- Sem os registros do dispositivo do usuário, a auditoria mantém os slots da conta desconhecidos. As provas usadas em testes são fixtures, não equipamentos reais da conta.
- Nenhuma carta, imagem, Card ID, nível, PP, build, habilidade nativa, ímpeto fixo ou formação foi modificada.

## Problemas reproduzidos e corrigidos

1. Confirmação de uma skill exclusiva de GO em CA passava pela validação de fingerprints: agora exige compatibilidade funcional.
2. Alias de nativa especial de GO era confundido com Liderança: agora permanece contextual e não selecionável como skill comum.
3. Adicionais conferidas só ocupavam vagas: agora podem influenciar complementaridade, com contribuição limitada e explicável.
4. A ficha principal usava contexto diferente dos painéis recentes: agora habilidades e ímpetos compartilham a prova V288.
5. A revisão independente reproduziu uma flag/cópia de contexto desatualizada liberando o bônus novo: o bônus revalida CAP, Card ID, edição, lista e fingerprint das nativas no momento do cálculo.
6. “Passe a rasgar” e “Through Passing”, com a mesma prova canônica, produziam scores diferentes no ímpeto: agora a entrada é canonicalizada antes de pontuar.
7. O cenário experimental reintroduzia o ímpeto já instalado: agora usa as mesmas exclusões do ranking principal.
8. A API experimental aceitava um vetor de GO em jogador de linha: agora respeita as categorias do modelo de função utilizado pelo comparador.

Os quatro achados da revisão receberam reproduções que falharam antes da correção e passaram depois. As expectativas estáticas V254/V266/V283 foram atualizadas para a API unificada, mantendo as verificações de identidade, nativas e slots; nenhuma regressão foi removida.

## Verificação e evidências

- `npm run check`: executado integralmente na base e após as correções da revisão; saída 0.
- Novo teste de equipamentos: 11 casos comportamentais, incluindo prova isolada/adulterada, aliases, slots e ficha principal real em VM.
- Novo teste de treinamento: custo exato, PP inválidos/desconhecidos, zero PP, GO/linha, não mutação, isolamento do cache, determinismo, dominância entre candidatos e cenário separado do cadastro.
- QA Chromium: oito resoluções existentes (320, 360, 390, 412, 1024, 1151, 1366 e 1920 px). Fluxo V289 adicional em 320, 390, 1151 e 1920 px: comparação sem gravação, troca de estilo, offline, bloqueio de skill incompatível e persistência da conferência. Os resultados finais e compilações de validação Android/Windows ficam nos checks do PR.
- Relatórios reproduzíveis pelo CI: `build/v289-competitive-audit-246.json` e `build/v289-evidence-queue-246.csv`.
- Instalação física, desempenho competitivo e novos prints da edição não foram validados.

### Preservação da base

| Acervo | SHA-256 |
|---|---|
| Catálogo V69 completo | `143a8eb4a53857c8a7a1501b50c1d523aa6bd1475b0fe2b5eb17da7ef9f89d51` |
| Corpus ordenado das 246 imagens, incluindo nomes de arquivo | `fd764548717caf9e929a3486a32adb6bcb3714a1c6addbc62a38343f94f6dbcd` |
| Índice de evidências V221 | `1b430bf07be8dd332e145018bdf287ca0a4ab4023b3321c3ecc74d14e8210322` |

O `npm run check` existente normaliza HTML e carimbo como parte da verificação. Esses arquivos gerados foram restaurados antes dos commits; as 246 fichas originais não entram no diff desta entrega.

## Limites e continuidade

O comparador usa investimento em categorias, não atributos finais inventados. A fronteira não é exaustiva e não comprova superioridade em partidas. O overlay experimental é transitório, seus resultados são remarcados como simulação e nunca são devolvidos como cadastro aprovado. Conferir equipamento não prova a disponibilidade do menu de habilidades de uma edição nem cria um slot de ímpeto.

Permanecem necessárias as fontes das identidades pendentes, os níveis ausentes, as três listas nativas, atributos-base completos, biotipo/Player ID e testes comparáveis da mesma versão. Os critérios de Rentão/Blackjhon são referência de rigor; nenhuma build desta entrega foi atribuída a eles.

A [visão oficial da Konami](https://www.konami.com/efootball/pt-br/page/overview) foi consultada para a descrição geral de treinamento de habilidades/ímpetos; ela não fornece os dados específicos que faltam nessas 246 edições. As fontes internas e as conferências vinculadas à edição permanecem separadas de hipóteses.
