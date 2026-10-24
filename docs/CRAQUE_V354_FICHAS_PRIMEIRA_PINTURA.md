# V354 — Primeira pintura e cabeçalho das 246 fichas originais

## Problema confirmado na auditoria
Todas as fichas HTML possuem um cabeçalho estático legado semelhante a
"SCOUT PRO / BUILD ENGINE V72" e carregam estilos antigos antes de o
`app-bridge.js` instalar os estilos Premium V189–V234. Mesmo com a V351
protegendo a abertura da home e a V352/V353 consolidando laboratórios,
o primeiro quadro de cada ficha individual ainda podia mostrar o tema antigo.

## Solução compartilhada, sem alterar as cartas
- `web/app-bridge.css` já é carregada **estaticamente** por todas as 246
  fichas (antes do JavaScript dinâmico). Recebe regras V354 estritamente
  para `body[data-page="detail"]`, usando a mesma paleta azul-noite,
  ouro e marfim da V234. Uniformiza barra, superfícies, foto, foco e
  controles sem alterar layout funcional e sem esconder módulos.
- A representação antiga da letra "S" já usa o SVG oficial como fallback
  de CSS desde o primeiro estilo estático.
- `web/app-bridge.js`, na execução `defer`, substitui apenas o ícone
  de cabeçalho pelo escudo original com alt adequado, e o título
  "SCOUT PRO" por "CRAQUE TÁTICO". Não altera informações de jogador,
  títulos documentais dos registros, nome dos arquivos nem armazenamentos.
- Ícones das cartas, Card IDs, PP, slots, evolução, edições, boosts,
  vídeos, imagens originais, histórico e backup são preservados.
- O cache `web/sw.js` é versionado normalmente para atualizar o CSS
  estático em instalações PWA; arquivos Android e Windows usam o mesmo
  bundle. Não há qualquer modificação na assinatura do APK.

## Testes
- `scripts/test-detail-first-paint-v354.cjs` em `npm run check`:
  verificar todas as 246 páginas HTML originais, folha estática,
  cabeçalho compartilhado, integridade do catálogo e ausência de
  regras de ocultação de funcionalidades.
- `scripts/qa-detail-first-paint-v354.py` no Chromium:
  amostras #001 Massaro, #050 Messi, #120 Bentancur e #246 Cantona,
  Android e Windows, CSS final V234 atrasado artificialmente,
  cabeçalho original do projeto, imagens de carta preservadas,
  nenhuma duplicação e ausência de overflow.
- Rodar também os testes V349–V353 e auditorias já existentes.

## Limites
QA em navegador, mesmo cobrindo quatro cartas e validando a presença da
folha em todas as 246, não substitui inspeção física após instalação
do APK e EXE; alterações não estão ainda na versão oficial.
Um redesign de componentes internos avançados exigiria validação por
contexto, e não deve substituir fichas ou dados aprovados.

## Publicação
Base cumulativa V349–V354, última release oficial v1.1.988.
Manter PR e testes até que o mantenedor autorize separadamente o merge
e a geração de instaladores oficiais.
