# V351 — Primeira pintura Premium sem troca para visual legado

## Evidência do problema
Em 24/10/2026, o proprietário enviou vídeo de 46,95 s do APK
Android v1.1.988. A abertura exibe a home, biblioteca, cartas e
laboratórios, com elementos antigos e Premium convivendo.
A análise estática confirmou que `web/index.html` ainda contém a
estrutura antiga completa, enquanto `app-bridge.js` injeta folhas CSS
V189–V234 e `scout-ui-v189.js` cria a navegação Premium só no runtime.
Isso permite a exposição de estilos intermediários durante o carregamento
(em rede lenta, cache atrasado ou atualização da interface).
O vídeo sozinho não comprova qual arquivo demorou ou que houve erro
de cache, portanto a correção ataca o ciclo de inicialização.

## Correção mínima e verificável
- `index.html` inclui um estado visual de inicialização com o escudo
  original e uma tela de carregamento acessível ANTES do CSS/JS dinâmico.
- `craque-ui-bootstrap-v351.js` aguarda `window.load`, a marcação
  Premium `scout-v189-home` e a presença real das folhas V189, V230,
  V232 e V234. Remove a cobertura só depois de duas pinturas.
- `scout-ui-v189.js` sinaliza quando a navegação Premium foi montada.
- Se qualquer recurso falhar, o carregamento não é infinito:
  após 10 s, libera o app em modo `fallback` e registra
  `document.body.dataset.ctUiBoot` para diagnóstico. Nenhuma
  informação do usuário é alterada, apagada ou enviada.
- O script é incluído no shell PWA e no fingerprint de bundle conjunto
  Android/Windows. O cache é versionado normalmente; não alteramos
  a assinatura ou a política existente de instalação do APK/EXE.

## Testes obrigatórios
- `scripts/test-atomic-premium-boot-v351.cjs`: bloqueio de flash do
  markup legado, exigência de DOM e CSS final, espera das duas pinturas,
  fallback sem travamento, nenhuma mutação após conclusão, 246 cartas.
- `scripts/qa-atomic-premium-boot-v351.py`: Playwright Chromium com
  CSS V234 atrasado intencionalmente, tela de preparação visível,
  liberação Premium e ausência de conteúdo legado visível,
  verificação em Android 390×844 e Windows 1366×768.
- `npm run check`, QA visual completo e builds de teste Android/Windows
  devem estar verdes no HEAD antes de revisar.

## Limite honesto
Esta V351 evita o efeito de **troca de interface na inicialização**.
Ela não significa que todas as páginas antigas já foram redesenhadas:
o projeto ainda contém módulos e HTML legados. Modernizações de telas
e migração arquitetural devem ser planejadas por etapas verificáveis,
sem apagar as fichas ou reescrever as 246 cartas.

## Segurança de publicação
Base cumulativa V349/V350, último APK oficial v1.1.988.
Não integrar em `main`, gerar release oficial ou substituir assinatura
Android sem nova autorização explícita do proprietário.
