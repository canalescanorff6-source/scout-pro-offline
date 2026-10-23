# Craque Tático V329 — Premium Fase 4: técnicos sem poluição visual

**Base auditada:** release oficial v1.1.925, commit `087263b`.  
**Alvos:** `Minhas Cartas` (246 cartas pessoais), `Outros Elencos` (seletor V328 preservado), `Central de Técnicos`, Android e Windows.

## Problema confirmado pelo código anterior
A V328 forneceu busca por edição, favoritos, técnicos próprios e filtros em `Outros Elencos`. No entanto:
- `craque-managers-v302.js`, usado pelas 246 fichas pessoais, ainda apresentava a lista completa de 71 técnicos no seletor e mostrava as seis proficiências, bônus e Link-Ups sem a mesma hierarquia.
- `craque-manager-hub-v307.js` listava as seis proficiências e até seis botões de ação em **todos** os cartões simultaneamente, dificultando localizar a informação relevante.

## O que muda (sem alterar os motores)
**Minhas Cartas:** reutiliza `CRAQUE_MANAGER_SELECTOR_V328` já implementado na V328. Pesquisa offline por técnico/edição/ID, alternância Destaques/Favoritos/Meus técnicos/Todas as versões, lista inicial limitada aos 23 destaques, favorito sincronizado no mesmo armazenamento **local** da Central e Outros Elencos. O técnico selecionado continua visível mesmo que o filtro ou a busca o exclua. A troca de filtros não dispara `scoutpro:manager-selected-v302` nem grava uma nova ficha.

**Ficha pessoal:** mostra inicialmente identidade e proficiência do estilo atual. As outras cinco proficiências, bônus, condições de Link-Up e origem do cadastro ficam num elemento acessível `details`, com abertura preservada ao trocar o estilo. O ID da edição e a separação por Card ID permanecem os mesmos. Versões indisponíveis ou não documentadas não são inventadas.

**Central de Técnicos:** exibe **uma** proficiência principal por cartão (estilo do filtro ou Posse quando o filtro está "Todos os estilos" — somente referência visual), mais um `details` com as outras cinco. Os controles secundários de retrato passam ao painel de detalhes. Mantém o comparador de duas edições, todas as seis proficiências, favoritos, técnicos próprios e a ação "Usar como padrão". A abertura de proficiências adicionais é preservada quando o cartão é renderizado novamente.

**Android/Windows:** `app-bridge.js` carrega o seletor compartilhado antes do motor pessoal V302, com fallback seguro ao menu antigo caso a importação falhe. `sw.js` invalida o cache offline anterior; o fingerprint existente do bundle já cobre todos os arquivos editados. Nenhuma atualização exige servidor, API externa ou migração de dados.

## Evidências e limites
- Os nomes, versões e proficiências vêm exclusivamente do catálogo V302 (70 edições históricas) + V323 (Kovač), sem atribuir bônus em PP.
- Todos os perfis e builds originais, as 246 cartas, slots e cinco habilidades continuam intactos; o catálogo de outros elencos mantém seu próprio armazenamento de fichas.
- Os favoritos são **locais**, não há sincronização automática entre dispositivos.
- Os testes Chromium em resolução mobile e Windows validam o comportamento de filtros, status e seis proficiências, mas não substituem QA em aparelhos físicos reais.
- A Central mantém a comparação completa quando solicitada: a mudança é **progressive disclosure**, e não perda funcional.

## Critérios obrigatórios
1. 23 opções em Destaques e 71 em Todas as versões (ficha pessoal), incluindo duas edições distintas de Klopp e Kovač 90/67 exatamente como registrado.
2. Buscar `Kovac` encontra `Kovač`; filtro diferente preserva o `CT-MGR` selecionado, sem mutar sua ficha.
3. Favorito da ficha pessoal aparece na Central e em Outros Elencos, sem mesclar owners/cartas.
4. Central exibe uma proficiência por padrão + cinco secundárias recolhidas, e as seis continuam acessíveis.
5. Trocar de tática altera apenas o contexto de exibição permitido pela lógica já existente; nunca usa proficiência como PP ou homologa novo ímpeto.
6. `npm run check` com `test-manager-premium-v329.cjs` e QA Chromium `qa-manager-premium-v329.py` sem erro de console ou overflow, além das regressões V302–V328 e audit de 246 cartas.
7. PR com CI, QA visual e builds de teste ambos verdes antes do merge. Release oficial somente quando APK **assinado** e EXE **NSIS** estiverem publicados em conjunto.

## Inventário próximo ciclo (V330+)
- Padronizar escalação e laboratório ao layout de decisão rápida, mostrando montagem do time e ação primária sem excesso de cartões técnicos simultâneos.
- Reavaliar densidade e consistência da tela inicial mobile com gravações reais dos usuários.
- Vincular bônus de técnicos à evidência da edição exata de forma **consultiva**, deixando pendências visíveis; não transformar proficiência em atributo/PP automaticamente.
- Melhorar comunicação de seleção de técnico aplicada versus prévia, com botões claros e status de backup.
