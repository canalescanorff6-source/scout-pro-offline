# Scout PRO V198 — UX de catálogo e toolbar desktop sem sobreposição

## Diagnóstico baseado em V197 (capturas reais do Chromium comum)
- Em **1366×768**, o dock global do Windows aparecia como uma faixa fixa de **980×74 px**, de Y=682 até 756, por cima do painel principal e de outros conteúdos da ficha.
- O catálogo Windows começava em **Y≈1436 px**: quatro indicadores, texto metodológico e laboratório explicativo ficavam obrigatoriamente antes das primeiras cartas.
- No celular a barra inferior estava compacta com aprox. 60 px de altura; **essa navegação Android deve permanecer inalterada**.

## Alterações V198
- Em viewports de **960 px ou mais**, o próprio `#scout-app-bar` existente vai para um menu `Ferramentas` dentro do cabeçalho superior. Botões originais **Voltar, Elenco, Topo, Atualizar e Backup** mantêm os mesmos nós e listeners.
- O menu fica fechado por padrão e fecha ao clicar fora ou pressionar Esc. No Windows, itens de backup ficam acessíveis em `Ferramentas > Mais`.
- Em 959 px ou menos, o dock original retorna ao `body`; redimensionar entre os dois layouts não duplica botões.
- Indicadores, introdução laboratorial e metodologia passam a ficar recolhidos por padrão no **desktop**, sem apagar conteúdo. `Como funciona a análise` abre e fecha essas seções usando a lógica original V189.
- Desktop: leve redução de alturas e espaçamentos do hero e controles, para antecipar as cartas. A identidade azul-petróleo/grafite e as artes originais permanecem.
- Na busca de jogadores, pressionar **Enter** com uma pesquisa válida desloca a tela ao primeiro resultado filtrado, reaproveitando o campo e os filtros originais.
- A alteração não altera HTML das 246 cartas, IDs, PP, builds, estilo de jogo, habilidades, ímpetos, imagens, dados de usuário, assinatura nem motor competitivo.

## Testes e critérios
- `scripts/test-ui-v198.cjs`: mover e restaurar barra real, preservar eventos, evitar duplicação, proteger 246 cartas, verificar CSS, JS, cache e fingerprint comuns.
- `scripts/qa-visual-v195.py`: 320, 360, 390, 412, 1366 e 1920 px. Valida dock Android original, ausência de dock fixo desktop, acesso a Atualizar/Backup, método expansível e início do catálogo mais cedo.
- CI GitHub: integridade, auditoria física, builds de validação Android/Windows, captura visual; merge **apenas GREEN**. Em main, release oficial com APK assinado e instalador Windows.
- A captura web Chromium não é teste físico de APK/EXE. Fidelidade pixel a pixel depende do mockup premium exato, ainda ausente neste contexto.

## Aceite desejado
No Windows, a primeira tela mostra a identidade premium, busca, quatro atalhos e **acesso ao elenco sem atravessar longos blocos técnicos**. Nenhuma barra cobre as informações do jogador. No Android, os mesmos recursos continuam acessíveis sem sacrificar a barra inferior.
