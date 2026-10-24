# V355 — Atualização segura da interface PWA e identidade Premium

## Diagnóstico após publicação v1.1.1004 (24/10/2026)
A versão oficial V349–V354 já corrigiu a primeira pintura do catálogo e das
fichas e consolidou as telas internas. Restava um risco particular da versão
web instalada (PWA): `web/sw.js` usa cache offline versionado, ativa a
revisão nova com `skipWaiting()` e assume os clientes com `clients.claim()`,
mas `web/pwa.js` não comunicava às páginas já abertas que o controlador do
cache havia mudado. Uma página podia continuar com DOM/CSS antigo até a
próxima navegação, enquanto os recursos subsequentes vinham da nova versão.
O manifesto também apresentava barra/tela inicial em verde antigo.

## Solução
- `web/pwa.js` passa a observar `serviceWorker.controllerchange` **só no
  navegador/PWA**, e apenas quando já existia controlador anterior.
- Mostra um aviso acessível, que oferece **Recarregar versão nova** ou
  **Depois**. **Jamais executa recarga automática**.
- Se houve entrada em formulário, solicita confirmação para recarregar; ao
  cancelar, mantém a página e os campos existentes. Busca sem formulário
  não gera confirmação desnecessária.
- Não realiza limpeza de caches manual, localStorage, IndexedDB ou backups.
  No Android Capacitor, o mecanismo continua separado, com a desativação
  de SW anterior preservada. Electron não registra novo service worker.
- `web/app-bridge.css` acrescenta painel compacto azul-noite/ouro, sem
  cobrir as ações no rodapé, acessível via teclado e `aria-live`.
- `web/manifest.webmanifest` atualiza barra e splash para o azul-noite
  da identidade atual; `web/sw.js` incrementa a revisão do cache e
  inclui o manifesto no pré-cache offline.
- `scripts/stamp-bundle-v189.cjs` já carimba `pwa.js`, `app-bridge.css`,
  `sw.js` e `manifest.webmanifest`; não alterar formato do fingerprint.

## Testes
- `scripts/test-pwa-safe-update-v355.cjs`, incorporado a `npm run check`.
  Casos: atualização real vs primeira instalação; clique voluntário;
  formulário alterado (confirmação recusada ou aceita); adiamento;
  escopo nativo Android isolado; protocolo não HTTPS; cores PWA e 246 cartas.
- `scripts/qa-pwa-safe-update-v355.py`, adicionado ao QA Chromium:
  simula troca do controlador em Android 390×844 e Windows 1366×768;
  verifica `role=status`, aviso visível, controles acessíveis, formulário
  protegido, botão Depois, nenhum overflow ou sobreposição ao rodapé.
- Continuam obrigatórios CI principal, auditoria física de 246 cartas,
  compilação Android debug/Windows de teste e QA visual completo.

## Limitações
O aviso exige que a página tenha carregado o código V355 previamente;
páginas ainda executando o script anterior V354 não recebem o aviso de
forma retroativa. Após a primeira atualização para V355, revisões PWA
subsequentes poderão acionar o banner normalmente. Essa função web não
é um instalador APK/EXE e não substitui o diálogo de permissão Android.
Sem teste físico da instalação em aparelho, não afirmar que todo problema
visual foi solucionado.

## Publicação
A versão oficial ao abrir esta etapa é v1.1.1004. O PR de V355 é
uma melhoria incremental, não deve ser mesclado à `main` nem criar
release sem uma autorização explícita futura.
