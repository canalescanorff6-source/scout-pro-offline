# Scout PRO V200 — ímpetos individuais para Posse de Bola (sem mexer nas fichas)

## Problema identificado na auditoria publicada V103
A recomendação da Posse era quase sempre igual para cartas da mesma posição: 27/27 CA recebiam `Striker's Instinct`; 102 das 246 cartas recebiam `Technique`. A auditoria V103 podia inclusive apontar como prioridade um booster **já embutido** (Cristiano Ronaldo #024, `Striker's Instinct +4` + `Physicality +3`).

## O que mudou
- Motor V200 dentro da API compatível `booster-engine-v103.js`, sem mudar IDs ou contratos de Token.
- Rank combina **pesos funcionais por posição**, **estilo da carta**, **tática**, **habilidades nativas documentadas** e, quando disponíveis, **os 10 níveis da distribuição da ficha**.
- Na Posse, o modelo valoriza passe, domínio, posse apertada, equilíbrio e decisão ofensiva; pivôs enfatizam apoio de costas, proteção e tabela; artilheiros valorizam execução e presença ofensiva; volantes priorizam cobertura e saída curta.
- Os níveis de treino são apenas a quantidade de PP investida por categoria. **Não equivalem a atributos finais ou falta comprovada de velocidade/chute.** Um possível complemento por treinamento é deliberadamente limitado para não levar a extremos.
- Ímpetos nativos e segundos ímpetos com nome registrado deixam de aparecer na lista de novos candidatos; **são mantidos e nunca substituídos**.
- Se o slot da carta estiver ocupado, ausente ou sem evidência, a recomendação é **comparação teórica**, não instrução para aplicar. Só o usuário confirma o slot no eFootball.
- A ficha principal agora mostra até duas alternativas, um aviso explícito contra gasto prematuro e acesso direto à revisão do slot. A seção completa explica a composição relativa do ranking (função, complemento por investimento e estilo/skills) e identifica confiança como `comparativa_limitada` ou `baixa`, sem percentual de acerto inventado.
- As builds, PP, Card IDs, artes, habilidades, ímpetos fixos, e dados salvos das 246 cartas **não foram modificados**. Continua valendo a escolha final do usuário.

## Fontes e integridade
- `web/SCOUT_V69_AUDITORIA.json`: funções, estilos, habilidades e níveis registrados, nem sempre validados no jogo.
- `web/SCOUT_V188_EFHUB_BOOSTERS_241.json`: print com até dois boosters visíveis, porém **não atesta instalação no jogo nem identidade do Card ID do print**.
- `web/SCOUT_V182_SKILLS_BOOSTERS_EVIDENCE.json`: 95 slots selecionáveis indicados, 3 possíveis, 4 com segundo ímpeto registrado e 144 indefinidos; **nenhum status de slot livre homologado em todas as cartas**.
- Lista preservada de 28 tipos craftáveis de acordo com a documentação da Konami v5.2.0.

## Testes
`scripts/test-boosters-v200.cjs`: 246 cartas × 3 táticas, booster registrado não duplicado, variedade real entre atacantes, confiança proporcional à evidência, sem alterar fichas, troca de técnico apenas virtual, espelho entre auditoria e ficha. `npm run check` incorpora essa suíte.
`scripts/qa-visual-v195.py`: seis resoluções Android/Windows, exige explicação, até duas alternativas e ausência de booster fixo duplicado no Massaro #001.

## Limites para decidir antes de gastar pedras
Não foram medidos os valores de atributos finais (pré/pós-boost), tempos de animação, efeito real da habilidade ou desempenho de A/B controlado por carta. Os números do ranking são **critérios internos de comparação, não Overall nem percentuais de vitória**. Uma recomendação teórica não justifica sacrificar cartas ou pedras de ímpeto sem conferir slot, valores finais e função usada. Se não há treino individual documentado, exibir hipótese de confiança baixa.

## Visual premium
Esta rodada melhora a hierarquia de escolha do ímpeto na ficha Android/Windows. **Ainda não é possível declarar identidade pixel a pixel** com o mockup premium anterior porque a imagem final exata não está acessível nesta conversa. Teste da app instalado fisicamente e comparação com mockup continuam pendentes.
