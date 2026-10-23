# Craque Tático V326 — Fase 1 da experiência Premium

## Problema observado
O usuário relatou que o aplicativo apresenta opções, fichas e informações em excesso, sem uma indicação clara de por onde começar e de como distinguir proposta, histórico e equipamento real.

### Antes
- A home oferecia quatro atalhos, mas "Outros Elencos" estava escondido nas ferramentas avançadas; "Biotipo" ocupava um dos quatro atalhos.
- A ficha posicional V311 apresentava na abertura a distribuição integral de PP, rankings de habilidades, ímpetos, mapa de posições, justificativas, histórico e comparadores. Era preciso percorrer essa informação para entender o contexto.
- A interface não destacava imediatamente que uma alocação calculada sem comprovação da edição não representa uma build homologada.

### Depois da V326 (fase 1)
1. **Home:** quatro atalhos prioritários únicos — Minhas Cartas, Outros Elencos, Escalação e Laboratório. As demais ferramentas, inclusive Biotipo, Ímpetos e a Central de Técnicos, continuam acessíveis no menu já existente.
2. **Ficha em foco:** painel visual compartilhado no topo do motor V311 com contexto de técnico/posição/estilo, resumo do orçamento PP, número de habilidades *candidatas* e estado da sugestão de ímpeto.
3. **Precisão:** a interface diz "Proposta para avaliar" quando há níveis matematicamente válidos, **nunca** "Melhor treino comprovado"; informa posição não documentada e técnico ausente; registra "aprovação no histórico" somente quando a revisão explicitamente tem o indicador de aprovação, sem inferir equipamento.
4. **Análise completa:** agora fica num elemento `details` acessível pelo teclado, fechado inicialmente; preserva integralmente tabelas, fichas independentes do técnico, 5 habilidades, ímpetos, mapas, comparações, avisos, histórico e ações anteriores. O usuário pode expandir, mudar MAT→SA→MAT e continuar aberto durante a navegação.
5. **Comparar alternativas:** o botão abre análise e seção de comparação, sem alterar posições, treinos aprovados ou seleção de jogadores.
6. **Aparência:** refinamento consistente azul-noite/marfim/ouro da própria marca, cartões mais claros e alvos grandes no mobile. Sem alteração de imagens ou Card IDs.
7. **Compatibilidade:** os mesmos `web/craque-positional-ui-v311.js`, `web/craque-positional-v311.css`, `web/scout-ui-v189.js` e `web/craque-design-v230.css` alimentam Android e Windows; mesma ficha posicional usada por Minhas Cartas e Outros Elencos.
8. **Offline:** versão do service worker incrementada para invalidar CSS/JS antigo; o fingerprint de bundle existente já abrange estes arquivos.

## Limites explícitos
Esta é a **primeira fase real** da reformulação Premium, não uma remodelação completa de todas as telas. Técnicos, outras páginas de escalação, laboratório completo, backup, telas de evidência e identidade visual legada ainda merecem novos ciclos de refino. A V326 altera **apresentação**, não certifica novas builds competitivas nem escolhe arbitrariamente um "melhor" entre propostas não homologadas.

Os 246 arquivos originais, dados de nível/PP, ímpetos fixos, habilidades equipadas e revisões armazenadas não são reescritos. Não há sincronização de dados pessoais entre instalações.

## Aceitação
- 4 atalhos únicos e visíveis na home, funcionais e sem perda de ferramentas avançadas.
- Primeira visão da ficha tem 3 blocos: treinamento, habilidades e ímpetos; análise avançada inicia recolhida; accessible summary e botões funcionais.
- Expansão revela tabela com custo progressivo, habilidades, ímpetos, histórico e comparador antigos.
- Alternância MAT→SA→MAT respeita histórico contextual. Abrir comparação não aplica a proposta.
- Sem overflow horizontal móvel e sem erros JS novos.
- Testes `node scripts/test-premium-first-view-v326.cjs` no `npm run check`; `python scripts/qa-premium-first-view-v326.py` na CI visual, além da regressão original V311/V314/V325 e dos testes de 246 cartas.
- Merge e release Android/Windows somente após CI, QA e ambas as builds oficiais concluírem com sucesso.

## Próximos ciclos candidatos (pelo impacto real)
- V327: unificar a visualização de *uma escolha principal* nas cinco fichas coletivas sem apagar a comparação; justificar a decisão com a edição exata e dados comprovados, sempre consultiva quando incerta.
- V328: seleção de técnico com favoritos, proficiências essenciais primeiro, detalhes das 71 versões sob demanda, em ambos os acervos.
- V329: padronizar escalação, laboratório e páginas de evidência com a mesma arquitetura de navegação, acessibilidade e acabamento móvel.
- V330: validação física Android/Windows, densidade informacional, hierarquia, vídeo de uso real e acessibilidade; correções de regressões observadas.
