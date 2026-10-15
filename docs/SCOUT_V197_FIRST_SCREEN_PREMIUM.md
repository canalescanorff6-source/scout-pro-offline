# Scout PRO V197 — acabamento da primeira tela

## Diagnóstico medido antes do ajuste
Referência: screenshots da interface comum Chromium da release V196 (v1.1.192).

| Viewport | Tela | Medição anterior |
|---|---|---|
| Android 390 × 844 | Início da ficha principal | Y=647,6 px; poucos dados essenciais acima da barra de navegação |
| Android 360 × 800 | Início da ficha principal | Y=647,6 px |
| Android 390 × 844 | Início do catálogo | Y=668,0 px |
| Windows 1366 × 768 | Início da ficha principal | Y=511,9 px |
| Windows 1366 × 768 | Início do catálogo | Y=1538,0 px |

A aprovação de CI anterior comprovava **ausência de overflow**, mas não que a primeira tela apresentasse os recursos mais importantes.

## Ajustes V197
- Android: arte original permanece visível e proporcional, usando menos altura para antecipar a ficha principal.
- Navegador de cartas Anterior / Ir para carta / Próxima permanece dentro da ficha, agora compacto, três botões com tamanho de toque e contador.
- Metadados de edição, procedência e campanha são **movidos**, sem copiar, para um controle `<details>` acessível: inicia recolhido no celular e expandido no Windows.
- Nome, raridade, Card ID na arte e KPIs (PP, função, treino) permanecem visíveis.
- Home compacta (texto introdutório reduzido, quatro atalhos mantidos, busca em evidência, ferramentas extras expansíveis).
- Windows: espaçamentos do cabeçalho, painel de navegação e cartões calibrados para mostrar mais informação sem degradar arte e contraste.
- Os 246 HTML, IDs, PP, habilidades, ímpetos, builds e textos originais são preservados integralmente.

## Critérios verificáveis de aceite
`npm run check` inclui `scripts/test-ui-v197.cjs`, que comprova idempotência da reorganização, preservação dos metadados, abertura inicial adequada por plataforma, 246 fichas, acessibilidade e fingerprint comum.

`scripts/qa-visual-v195.py` agora testa 320×700, 360×800, 390×844, 412×915, 1366×768 e 1920×1080; mede posição da ficha e do catálogo, botões de navegação, comportamento do painel expansível, exibição de habilidades V196, ausência de overflow e dock Android.

**Não declarar equivalência pixel a pixel ao mockup premium sem a imagem original aprovada e comparação lado a lado.** As capturas em Chromium simulam dimensões, não comprovam o instalador rodando em aparelho físico. A publicação depende de CI GREEN e assinatura permanente do APK.
