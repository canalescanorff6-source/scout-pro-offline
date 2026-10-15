# Scout PRO V186 — Cartas animadas por raridade

Implementação completa de **efeitos CSS originais inspirados na apresentação das cartas do eFootball**, sem incorporar animações oficiais, vídeos ou assets animados proprietários da Konami. Todas as **246 imagens originais do acervo** permanecem idênticas.

## Presets

| Raridade | Cartas do catálogo | Animação CSS |
|---|---:|---|
| SHOW TIME | 36 | energia azul-violeta, raios em arco, varredura e pulsação mais rápidas |
| ÉPICA | 63 | partículas douradas, reflexos lentos, aura lendária |
| BIG TIME | 3 | faixas de velocidade vermelho/âmbar, reflexos e clarões mais rápidos |
| DISTINGUIDO / Highlight | 144 | brilho verde-água/azul discreto e varredura lenta |

Os quatro efeitos são feitos exclusivamente de gradientes, máscaras, transformações e animações locais CSS. **Não é o mesmo fundo animado produzido pelos arquivos originais do jogo**: as 246 imagens em PNG são achatadas; separar corretamente jogador/fundo exigiria material separado ou máscara individual. O efeito atual preserva rostos, nomes, números e identidade visual enquanto adiciona uma camada luminosa sobre as bordas e ao redor da carta.

## Onde funciona

1. **Biblioteca de 246 cartas:** cada `a.player-card[data-rarity]` recebe uma camada CSS independente, sem reconstruir as cartas em JS.
2. **Ficha individual:** imagem lateral no desktop e imagem no quadro mobile recebem o efeito baseado na raridade da própria ficha.
3. **Android Capacitor, Windows Electron e PWA offline:** o carregamento ocorre a partir do `app-bridge.js`, já presente nas 247 páginas; CSS e script entram no pacote offline e no cache do PWA.
4. **Controle:** botão `Cartas animadas: ON/OFF` na biblioteca e na ficha; valor salvo localmente sob `scoutpro:v186:card-motion`. `prefers-reduced-motion` tem precedência e desativa a animação. Em modo economia de dados, o padrão inicial é desativado, mas o usuário pode ativar manualmente.
5. **Eficiência:** IntersectionObserver só ativa as cartas na área visível (mais 110px de margem); `visibilitychange` pausa ao sair do aplicativo. Não há canvas/loop JS, downloads externos, GIFs pesados nem regravação de imagens.
6. **Impressão:** a animação e seus controles são ocultos.

## Arquivos modificados

- `web/card-motion-v186.css`: efeitos individuais dos quatro presets e media queries.
- `web/card-motion-v186.js`: enquadramento da imagem, controle ON/OFF, preferências, visibilidade e recuperação de raridade sem adivinhar Card ID.
- `web/app-bridge.js`: injeta os dois novos assets no catálogo e em todas as fichas, sem editar 246 HTMLs.
- `web/sw.js`: novo cache e assets offline.
- `scripts/test-card-motion-v186.cjs`: verifica classes 4 presets, 246 cartas, interface catálogo/ficha, alternância real, persistência, redução de movimento, offline, sem URL externa.
- `package.json`: inclui teste no `npm run check`.

## Não foi alterado

- Arte PNG, nomes, raridades/edições documentadas, Card ID e Player ID.
- Níveis, PP, treinos A/B, habilidades nativas e adicionais, ímpetos e modelos corporais.
- Formações, estratégia de posse, banco, OCR, atualizador do Windows ou instalador do Android.

## Teste prático

Abrir a biblioteca e observar que cartas Show Time, Épica, Big Time e Distinguido apresentam ritmos e cores diferentes. O botão alterna efeitos ao tocar, inclusive após fechar/reabrir a ficha. Navegar para uma ficha e verificar quadro mobile ou arte lateral desktop. Trocar para outro app/aba e retornar; os efeitos devem pausar/reiniciar. Configurar "Reduzir animações" no sistema deve impedir movimentação sem remover a arte. O mesmo teste precisa ser repetido no aparelho físico; a CI comprova integridade/compilação, não FPS real no telefone.

## Política de validação

Só integrar na `main` após checagens completas e build Android/Windows GREEN. Confirmar os links de instaladores oficiais pela release criada a partir do commit de integração.
