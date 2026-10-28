# Scout PRO V204 — cartões de jogador legíveis e alinhados

## Diagnóstico da V203
A biblioteca e os filtros estão antecipados na primeira tela (PR #108). Porém, a folha `web/premium.css` ainda impõe `white-space:nowrap` e reticências aos nomes e às edições. No catálogo de 246 cartas, há nomes como **Ruud van Nistelrooij** e **Dominik Szoboszlai**, além de **44 descrições de edição com mais de 60 caracteres**. Duas cartas distintas podem parecer iguais quando sua edição é cortada.

Os rodapés misturam PP, estado de auditoria e indicador de treinamento, comprimindo cartões estreitos. Isso é um problema de apresentação, não dos dados registrados.

## Alteração V204
- Cartões passam a distribuir verticalmente arte original, identificação, versão e rodapé sem alterar ordem ou links.
- Nome ocupa até duas linhas; edição ocupa até duas linhas no desktop e três no Android, com o texto original ainda presente no DOM e na ficha aberta.
- Rodapé com quebra responsiva: PP, estado e tipo de treino ficam legíveis mesmo em 320 px.
- Cores petróleo/grafite/turquesa mantidas, com bordas suaves e destaque discreto no desktop, sem hover deslocado em tela sensível ao toque.
- Nenhuma mudança em `index.html`, `premium.js`, banco de cartas, fichas, ímpetos, habilidades, builds, atualizador ou assinatura.
- Novo CSS é carregado pela ponte comum Electron/Capacitor, cache offline e fingerprint.

## Critérios de QA
1. 246 nomes, versões, Card IDs e links preservados.
2. Verificar cartões com `getComputedStyle` no Chromium em 320/360/390/412 e 1366/1920 px.
3. Não apresentar overflow horizontal nos rodapés; as edições mobile usam até três linhas.
4. A primeira carta permanece dentro da primeira dobra, conservando o ganho da V203.
5. Capturar a grade após rolar ao primeiro cartão, além das capturas da home e dos filtros V203.
6. Integrar apenas após verificações obrigatórias GREEN e publicação dos instaladores na release.

**Limites:** texto pode permanecer resumido após duas/três linhas (a ficha conserva a descrição completa). Capturas Chromium não substituem teste no aparelho físico. O mockup aprovado não foi disponibilizado para comparação pixel a pixel.
