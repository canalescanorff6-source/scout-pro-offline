# Retirada progressiva da interface antiga — Craque Tático

## Objetivo
Nenhuma tela ativa do Android ou Windows deve mostrar simultaneamente as interfaces legadas Scout PRO V68/V72 e a ficha Premium aprovada em **grafite suave e vinho**. A transição não autoriza apagar cartas, imagens, Card IDs, treinos, habilidades, ímpetos, histórico, backup ou atualizadores.

## Regra permanente — UMA interface ativa por versão
- O ponto de entrada da apresentação é o App Shell, não uma pilha de páginas visuais. A versão oficial deste pacote é `V362`, com cores definidas pelos tokens de `web/craque-app-shell-v362.css`.
- O registro em `web/craque-app-shell-v362.js` expõe `window.CRAQUE_UI_RELEASES.activate({version,ready,themeElement,dispose})` e `current`.
- Ao desenvolver e validar uma próxima versão da UI, monte seus novos controles e sua nova folha oficial. **Somente depois de confirmar que a montagem funcionou**, registre a próxima versão como `ready:true`. O gerenciador remove os elementos marcados `data-craque-ui-release` e as folhas marcadas `data-craque-ui-theme` de versões anteriores. Com `ready:false`, a interface anterior permanece como fallback.
- Nunca carregue duas folhas oficiais de tema em paralelo. As CSS históricas que contêm geometria/funcionalidade só podem ser retiradas quando seus estilos estruturais forem migrados e os testes aprovados. Aposentar **o visual** não significa deletar scripts de cálculo, funções de navegação ou dados.
- Em toda versão aprovada: atualizar o ponto de entrada, fingerprint/caches offline do PWA e os empacotamentos Android/Windows; rodar QA de catálogo, fichas, diálogos e atualizadores. Não é possível apagar automaticamente código-fonte morto com segurança sem análise e testes de dependência.
- Regra de evolução: nova release substitui a anterior; sem novos menus, modais, cabeçalhos ou CSS visuais empilhados. Acessibilidade, offline e reversão têm prioridade.

## Fase 1 — PR da ficha individual
- **246 fichas HTML originais mantidas**: os arquivos históricos ainda são fontes offline e preservam IDs e evidências.
- O cabeçalho Premium `ct361-player-glance` também aparece no desktop; a sidebar antiga só sai quando a ficha moderna e seu layout V378 estiverem prontos.
- O cabeçalho consolidado mostra o Card ID extraído do dado original.
- Seções históricas `#engenharia`, `#foco`, `#pontos` e `#jogar` são movidas, **não eliminadas**, para um acordeão dentro das ferramentas avançadas V378. Deep links `#id` devem abrir o ancestral recolhido.
- O rótulo estático `V72` não aparece como se fosse a versão atual.
- Substituição das cores legadas azul/ouro no bloco de estilos da ficha pela paleta grafite/vinho do shell V362.
- Todo HTML canônico, JSON de cartas e mecanismo de persistência permanece intacto.

## Rotas e funcionalidades que ainda precisam de auditoria visual integral
- Catálogo, filtros, editores de cartas, ímpetos, backups, atualização, técnicos, formações, Outros Elencos e diálogos de cadastramento.
- Ferramentas históricas mantidas para operação: `conferir-progresso-v248.html`, `raridade-cadastro-v91.html`, `revisao-impetos-v103.html`, `revisao-tatica-v98.html`, `meu-time-testes-v219.html`, `player-model-v101.html`, lotes de cartas e vídeos.
- As rotas existentes já recebem o shell editorial V362, mas exigem conferência de menus duplicados, cores internas, legibilidade e recursos exclusivos de cada página antes de descartar qualquer estrutura antiga.

## Critérios antes de publicar
1. Testes existentes `npm run check:sequential` / GitHub Actions aprovados.
2. QA visual em 320, 390 e 1366 px: a ficha principal deve estar única; sidebar e blocos V68/V72 não aparecem como segunda tela.
3. `#engenharia` e outros links históricos continuam consultáveis via detalhes, sem perder controles.
4. Navegação, PP, habilidades, ímpetos, cinco estilos e editor de nível funcionam. Builds não são redistribuídas silenciosamente.
5. Verificar atualização real do APK e Electron, preservação dos dados, cache offline, assinatura e instalação física em dispositivo quando possível.
6. Não executar merge em `main` nem publicar release sem autorização do mantenedor.

## Estado
Esta primeira fase é proposta para revisão; **não equivale à remoção integral já homologada em Android e Windows**.
