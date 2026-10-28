# V353 — Continuidade da consolidação Premium em dez áreas internas

## Auditoria de 24/10/2026
A V351 protege a abertura da home contra estilos intermediários e a V352
unifica Outros Elencos, Minhas Formações V177 e Central de Técnicos.
Restavam páginas internas não abrangidas:
- `conferir-progresso-v248.html` (nível/PP);
- `meu-time-testes-v219.html` (laboratório de elencos);
- `pesquisa-videos-v106.html` (provas de vídeo);
- `player-model-v101.html` (Player ID e biotipo);
- `revisao-impetos-v103.html` (propostas de ímpeto);
- `revisao-tatica-v98.html` (análise tática);
- `lote-8-conferencia.html`, `lote-9-cadastro.html`,
  `raridade-cadastro-v91.html` (documentação antiga);
- `meu-time-posse-4312.html` (formação alternativa).

Essas dez páginas carregavam estilos próprios, inclusive três com CSS
totalmente inline. A camada global V234, adicionada dinamicamente em parte
das páginas, podia prevalecer depois do HTML inicial.

## Alterações implementadas
1. `web/craque-premium-workspaces-v353.css`: novo tema visual
   compartilhado por nove ferramentas, estritamente isolado por
   `data-page`. Aplica cores azul-noite/ouro/marfim, cartões, campos,
   foco e botões sem ocultar componentes. Preserva cores semânticas dos
   alertas, imagens e gramado.
2. Cada uma das nove páginas passa a carregar a folha estaticamente no
   HTML. As três telas históricas recebem `data-page` apenas para a
   seleção visual, sem modificar o JavaScript de cadastro.
3. `meu-time-posse-4312.html` recebe a camada V352 já aprovada para
   a formação principal, preservando paridade entre as duas.
4. `web/app-bridge.js` reposiciona a mesma folha V353 ao fim dos estilos
   dinâmicos, quando presente. Isso impede a reversão de aparência e não
   duplica CSS.
5. Pré-cache `web/sw.js` e fingerprint Android/Windows incluem a folha
   nova e as três páginas históricas antes ausentes do pré-cache.

## Validação
- `scripts/test-premium-workspaces-v353.cjs` integrado a `npm run check`.
  Auditoria de seletor por página, controles, precedência, cache offline,
  bundle único e 246 cartas originais.
- `scripts/qa-premium-workspaces-v353.py` no workflow Chromium:
  nove ferramentas em 390×844 e 1366×768; formação alternativa;
  estilo computado, uma única folha, prioridade sobre V234, ausência
  de overflow e preservação de controles fundamentais.
- Continuam obrigatórios os testes V349–V352, QA visual completo,
  auditoria física e builds de validação Android/Windows.

## Limitações verificáveis
Não é possível demonstrar que todos os aparelhos instalados já têm o
design, porque o PR não foi mesclado na `main` ou publicado.
A V353 amplia a modernização de dez páginas adicionais; não substitui
o código de motores, não reescreve as 246 fichas e não cria uma nova UI
do zero. Testes em Chromium não equivalem a uma instalação física.

## Produção
Base cumulativa V349–V353; publicação oficial atual: v1.1.988.
Sem autorização explícita para merge/publicação, manter apenas PR
validado. Preservar imagens, Card IDs, PP, habilidades, ímpetos,
formações, backup e certificados sem qualquer alteração.
