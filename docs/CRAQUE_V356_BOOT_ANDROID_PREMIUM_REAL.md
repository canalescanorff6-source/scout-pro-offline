# V356 — Corrigir inicialização Premium que volta ao visual antigo no Android

## Relato que motivou a correção
O proprietário confirmou que instalou e atualizou o APK de várias maneiras,
mas a interface continuou mostrando o layout antigo. Não há prova de que a
versão realmente instalada corresponda à v1.1.1004: anteriormente o número
da versão e a revisão do pacote ficavam ocultos no rodapé Android.

## Causa estrutural confirmada no código
A home original em `web/index.html` contém as 246 cartas e uma hero legada.
A navegação nova só era criada por `web/scout-ui-v189.js`, inserido
**dinamicamente** por `web/app-bridge.js`. Quatro estilos essenciais V189,
V230, V232 e V234 também eram inseridos tarde. O bootstrap V351 aguardava
o evento `window.load` (inclusive imagens das 246 cartas) e liberava
a tela antiga após um timeout de 10s, caso a home Premium não estivesse
pronta. No Android WebView, renderização mais lenta, dependências ausentes ou
falhas no carregamento podiam acionar esse fallback para o HTML antigo.

Isso é um caminho estrutural plausível e reproduzível; sem acesso ao APK
instalado no telefone, NÃO afirmar que foi necessariamente a única causa.

## Correção V356
1. `web/index.html` agora **declara diretamente** as quatro folhas Premium
   e o script de entrada V189, antes da renderização normal. A entrada não
   depende mais de a ponte adicionar esses recursos assincronamente.
2. `web/app-bridge.js` reutiliza essas folhas quando estão presentes e
   **não** adiciona uma segunda instância da navegação V189. A V234 é
   reposicionada ao final da cascata para vencer o CSS herdado.
3. Quatro links Premium, renderizados em HTML com CSS crítico, permanecem
   funcionais **se o script falhar**. `scout-ui-v189.js` esconde apenas esse
   backup quando a navegação completa estiver realmente montada.
   Os recursos antigos continuam no DOM para preservar funcionalidades,
   mas a grade antiga de links permanece oculta mesmo em fallback.
4. `craque-ui-bootstrap-v351.js` libera o Premium após `DOMContentLoaded`
   e CSS pronto, sem esperar pelo fim do download de 246 imagens.
5. O usuário vê `Premium ativo` ou `Premium em recuperação` junto
   com a versão e um prefixo do commit de `scout-build-info.json` EMBARCADO.
   Isso ajuda a distinguir **APK antigo ainda instalado** de **renderização
   falha em um APK novo**. A versão não é inventada quando o arquivo está
   inacessível; no repositório sem build, é marcada como não verificada.
6. Novo cache PWA V356 e fingerprint compartilhado Android/Windows
   preservados. Nenhuma mudança no mecanismo de assinatura do APK,
   instalação nativa, armazenamento, PP, carta, skills ou ímpetos.

## Testes de aceitação
- `scripts/test-native-premium-entry-v356.cjs` em `npm run check`:
  recursos únicos/declarativos; navegação segura; 246 cartas; revisão
  embarcada e fingerprint.
- `scripts/qa-native-premium-entry-v356.py` em Chromium: simulador Android
  (390×844) e Windows (1366×768); atrasar a imagem CAP_001 por 12 segundos
  e conferir que o Premium abre **antes de window.load**; nenhum JS/CSS
  central duplicado; 246 imagens/documentos preservados; sem overflow.
  Com JS V189 explicitamente indisponível, exige quatro links funcionais
  e indicação de recuperação, em vez do menu legado.
- Rodar toda a CI, auditoria de dados físicos e compilações de validação
  Android e Windows antes de qualquer integração.

## Diagnóstico no aparelho
Depois da publicação futura, abrir a home e observar o selo na abertura:
- `Premium ativo · vX.Y.Z · COMMIT`: pacote novo e controlador funcionando;
- `Premium em recuperação`: pacote novo, mas alguma dependência falhou;
- selo V356 inexistente: APK anterior ainda instalado OU outra rota/build;
  verificar versão nos Ajustes do Android e screenshot da home antes de
  atribuir uma única causa.

## Limites e publicação
Não é possível afirmar que um telefone específico passou no QA sem
instalação e teste físico. Estas correções estão em PR cumulativo V355–V356,
separado da versão oficial v1.1.1004 até autorização EXPRESSA de merge e
publicação. A V355 trata atualização em PWA e não substitui o atualizador
Android nativo.
