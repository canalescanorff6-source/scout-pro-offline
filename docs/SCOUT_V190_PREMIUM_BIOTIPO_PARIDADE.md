# Scout PRO V190 — acabamento premium consistente em Android e Windows

## Estado anterior
A proposta de interface já estava implementada na **V189** (release **v1.1.173**): página inicial compacta no mobile, atalhos às seções essenciais, grade das 246 cartas, menu de ferramentas, ficha V188, extra corporal de Massaro, estilo responsivo e CI com prova de fingerprint comum Windows/Android. Não refazer essa interface do zero.

## Correções V190

### Defeito funcional de biotipo corrigido
O app insere a ficha principal `scout-profile-v188.js` via script dinâmico. O módulo `scout-ui-v189.js` buscava o elemento `#scout-v188-principal` apenas durante o primeiro `DOMContentLoaded`. Quando a ficha ainda não tinha sido criada, a análise de biotipo jamais aparecia — apesar de os dados estarem nos arquivos. Agora a ficha dispara `scoutpro:profile-ready`, e a V189 escuta o evento e tenta novamente. Inserção idempotente: o mesmo evento repetido não duplica o biotipo. Comportamento idêntico em Android e Windows.

### Não bloquear ímpetos por falha física
A tela V188 usava `Promise.all()` para abrir a base de dois boosters dos 241 prints e a base de 15 registros físicos. Se qualquer arquivo falhasse, **ambos** os painéis entravam em erro. Agora são fetches independentes, com fallback específico. Assim o ímpeto de Massaro mostrado no eFHUB (Fisicalidade +3 / Instinto artilheiro +1) não é ocultado por um erro de carregamento de medidas físicas. O motor de ranking por Posse continua independente, sem exigir cadastro de slot ou alegar booster equipado.

### Refinamento de acabamento
`scout-polish-v190.css` trabalha por cima da **mesma V189**:
- Android: contraste, espaçamento, busca/filtros legíveis, cards com superfícies limpas, pequenos dispositivos a partir de 360px, dock com fundo translúcido e foco visível.
- Windows: tipografia, cards, painéis de ficha e grade de biotipo com acabamento mais consistente em telas grandes.
- Acessibilidade: estados de foco teclado e preferência `prefers-reduced-motion`. Não remove conteúdos, não transforma UI em uma imagem, não depende de rede.

### Paridade de versão e compilação
- Tanto Android/Capacitor quanto Windows/Electron importam `web/app-bridge.js` e carregam `scout-polish-v190.css`.
- `scripts/stamp-bundle-v189.cjs` passou a incluir esse CSS nas 17 fontes monitoradas, gerando o mesmo fingerprint nos dois pacotes. O workflow já bloqueia divergência de versão, SHA e fingerprint entre Android/Windows antes da publicação.
- `web/sw.js` recebe nova chave de cache e inclui os assets necessários para uso offline.
- `scripts/test-ui-v190.cjs` verifica, inclusive por simulação, os dois ordenamentos possíveis de inicialização e a não duplicação do painel; inspeciona 246 páginas, imagens, fontes, cache e workflow.
- `scripts/test-premium-v189.cjs` considera as 17 fontes.

## O que preservamos
Sem tocar nas **246 cartas, PNGs, Card IDs, PP, builds, níveis, habilidades nativas, ímpetos observados, raridades ou dados de backup**. O projeto continua offline-first; dados salvos localmente no Windows e no Android **não se sincronizam pela atualização do app**. Ambos recebem as mesmas mudanças de código, mas precisam instalar a mesma release.

## Player ID e anatomia: limites reais
**15** perfis por Card ID (fonte externa) e **15** observações profundas eFHUB continuam disponíveis; o extra Massaro com ombros, pescoço, braços, pernas, cintura, coxa e panturrilha permanece. Os outros prints ainda não têm essa segunda transcrição corporal aprofundada e conferida para a edição específica. Não podemos deduzir Player ID oculto, slots nativos ou comportamento exato do jogo dessas medidas. A correção V190 faz aparecer o que já está documentado, não reivindica ter extraído o que ainda não foi verificado.

## Teste após instalar
Abrir #001 Massaro, conferir treino + dois ímpetos de fonte eFHUB + o bloco “Modelo corporal · dados com fonte”, incluindo ombros/pescoço. Repetir em Windows com **mesma versão e hash** no menu Mais. Conferir outro jogador sem dado físico completo — deve aparecer aviso correto, mas nunca apagar seus ímpetos/treino. Repetir com dados offline e conexão desligada. Homologação de FPS/usabilidade física requer o aparelho do usuário; CI verde confirma software e empacotamento, não toque e desempenho no dispositivo.
