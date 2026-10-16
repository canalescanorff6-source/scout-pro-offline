# Scout PRO V206 — ícones de treino premium e acabamento responsivo

## Pedido e escopo
O usuário pediu para trocar os ícones da V201 (chute, passe, drible e demais) considerados pouco premium, e aproximar a ficha do visual aprovado. Esta V206 implementa o redesenho original e um acabamento nas superfícies de treino de Android e Windows. Sem a imagem original do mockup, não é possível medir equivalência pixel a pixel; nenhum resultado de identidade perfeita é alegado.

## Sistema visual
- Geometria constante em 64 × 64 pixels, canto arredondado, painel de grafite/petróleo, traço técnico leve, luz discreta e três famílias de cores coerentes (turquesa, dourado e azul).
- Chute: chuteira em finalização e bola.
- Passe: distribuição entre alvos com trajetória direcional.
- Drible: trajetória de bola e cones.
- Destreza: aceleração com geometria angular e movimento.
- Força das pernas: perna, chuteira e linhas de força.
- Jogo aéreo: jogador cabeceando em direção à bola.
- Defesa: escudo e marca de interceptação.
- Goleiro 1: luva aberta para defesa.
- Goleiro 2: defesa em mergulho e bola.
- Goleiro 3: estrutura de gol e defesa central.

Todos os símbolos são SVGs originais e gerados localmente em JavaScript; não contêm arte oficial, fontes, ícones nem serviços de terceiros.

## Preservação
- A V201 continua com seus SVGs de fallback e monitoramento. A V206 substitui SOMENTE o SVG do span decorativo dentro do elemento com data-scout-training-icon.
- Nada foi alterado em Card IDs, 246 fichas, PP, limites de progressão, ímpetos, habilidades adicionais, fonte das cartas, controles +/−, bancos e backups.
- O monitoramento da V206 só redecora ícones adicionados pelo fluxo preexistente do Laboratório.
- As novas folhas/arquivos entram pelo web/app-bridge.js comum a Android/Windows, entram no service worker offline e no fingerprint do bundle.

## Homologação automatizada
- Checar 10 SVGs distintos e 10 rótulos sem dependências externas.
- QA Chromium com viewports 320, 360, 390, 412, 1366 e 1920 px para o plano e o Laboratório.
- Verificar leitura e ausência de overflow nas linhas, botões de pelo menos 40 px, nomes, acentos e números preservados.
- Revalidar incremento e restauração do nível com + e −, e capturar o Laboratório atualizado.
- Merge e release apenas após CI GREEN, assinatura persistente e artefatos confirmados.

Limitações: capturas Chromium não são testes físicos. A comparação fiel com o mockup exige o arquivo de referência, que não está disponível aqui.
