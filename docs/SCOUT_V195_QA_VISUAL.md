# Scout PRO V195 — inspeção visual automatizada

Este fluxo **não prova** que Android e Windows são pixel a pixel idênticos ao mockup. Ele gera evidência visual da web compartilhada, renderizada por Chromium em condições equivalentes aos tamanhos de tela: 360 × 800, 390 × 844 e 1366 × 768.

## Como funciona
- Usa servidor HTTP local, sem dependência de site externo ou dados sensíveis.
- Carrega o catálogo real com busca e quatro atalhos; carrega a ficha #001 Daniele Massaro.
- Verifica elementos visíveis da ficha principal: treinamento, foco, habilidades, ímpetos, biotipo e Como jogar.
- Salva 9 screenshots (catálogo, cabeçalho e seção Como jogar nos três viewports) e um JSON com coordenadas, dimensões e possível overflow horizontal.
- Falha se um guia ou o painel único de habilidades estiver ausente ou se houver overflow horizontal superior a 8 px.
- O job funciona em PR, push main e execução manual (Actions > QA visual).
- As imagens são anexadas como artefato de GitHub Actions **por 14 dias**, não incorporadas a APK/EXE nem publicadas como ilustração.

## Limites
Chromium simulando viewport não é captura do Capacitor instalado nem do Electron em Windows físico. Comparação de pixel depende de recuperar a imagem exata aprovada anteriormente, usar tamanho de referência igual, e revisar os screenshots. Este workflow facilita o diagnóstico sem alterar cartas ou funções.
