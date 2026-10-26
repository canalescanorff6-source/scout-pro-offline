# Formações Premium em página independente

O catálogo oferece **Formações Premium ↗**, logo abaixo dos quatro atalhos. Abre uma página online separada, sem embutir o caderno no aplicativo:

https://craque-tatico-formacoes-premium.vocalclock33.chatgpt.site/

- Web: nova aba com `noopener noreferrer`.
- Windows: navegador do sistema; o novo destino aceito é exclusivamente a origem HTTPS acima, na raiz, sem consulta, credenciais ou porta alternativa. Fragmentos de planos são permitidos.
- Android: Browser do Capacitor já instalado, aberto somente após o toque. Uma falha exibe mensagem e mantém o app aberto.
- A página é privada do proprietário no Sites e pode pedir a mesma conta utilizada para criá-la. Não tornar pública sem autorização.
- A conexão é necessária; os favoritos da página ficam no navegador e são independentes dos dados offline do app.

O caderno contém 100 planos, 20 desenhos, 11 titulares e 12 reservas por plano, cobrindo as 261 cartas consultadas em 26/10/2026, com artes originais e identificação por edição. Não é sincronização automática: novas cartas exigem atualizar o caderno. Os indicadores de linkup expressam compatibilidade documental; precisam ser conferidos no jogo.

## Integridade e validação

Esta alteração não modifica cartas, imagens, Card IDs, PP, habilidades, treinos, escalações existentes, armazenamento, assinatura nem atualizadores. Os únicos arquivos de execução alterados são o shell visual existente, seu CSS e a lista de navegação externa do Electron.

`node scripts/test-external-formacoes-premium.cjs` verifica idempotência, destino fixo, abertura apenas por interação, erro do navegador Android, páginas onde não há botão, preservação dos destinos Windows anteriores e rejeição de destinos indevidos. Integra a sequência `npm run check`.

Os testes Android/Electron usam simulações; não equivalem a instalar APK/EXE nem validar o aparelho físico. A publicação de uma nova versão do app continua sujeita à aprovação explícita do mantenedor, conforme AGENTS.md.
