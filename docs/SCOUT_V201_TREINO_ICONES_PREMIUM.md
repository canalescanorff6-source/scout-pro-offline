# Scout PRO V201 — pictogramas premium dos 10 grupos de treino

## Referência e proposta
Seguir a direção já aprovada no projeto: azul-petróleo/grafite, detalhes verde-água e dourado, Android compacto e Windows amplo, preservando as 246 cartas e a função principal de Posse de Bola.

O usuário pediu “figurinhas iguais às da Konami” para Chute, Passe, Drible etc. Foram criados **10 pictogramas SVG originais**, estilizados com medalhão, bola, chuteira, trajetória, seta, escudo e luvas, inspirados na linguagem visual do eFootball — **não são imagens oficiais da Konami nem cópias extraídas do jogo**.

| Índice da progressão | Nome da ficha / jogo | Ilustração original |
|---|---|---|
| 0 | Chute | Pé na bola com linhas de chute |
| 1 | Passe | Trajetória da bola e passe |
| 2 | Drible | Bola passando por obstáculos |
| 3 | Destreza | Raio e chuteira em movimento |
| 4 | Força das pernas | Perna e movimento de impulsão |
| 5 | Jogo aéreo | Cabeceio e bola no alto |
| 6 | Defesa | Escudo e bloqueio |
| 7 | Goleiro 1 | Luva aberta |
| 8 | Goleiro 2 | Reflexo/defesa em mergulho |
| 9 | Goleiro 3 | Segurança e domínio da bola |

## Onde os ícones aparecem
- **Ficha individual V188**: cards dos níveis registrados com pictograma 42 px e rótulo numérico intacto, em duas colunas responsivas.
- **Laboratório PRO**: ao lado do nome dos dez grupos; os botões `+`, `−` e campo numérico ficam com os listeners originais.
- **Distribuição analítica V68**: rótulo dos dez grupos, junto à barra de progressão.
- **Treino alternativo V160**: primeira coluna das duas tabelas de cenários, caso o painel exista.
- Em mudanças de cenário e ajustes de PP, um observador leve detecta novas linhas e reinsere apenas os ícones decorativos. Nenhum texto/nível/PP é apagado ou reescrito.

## Integridade
- Não altera `web/lab.js`, `web/SCOUT_V69_AUDITORIA.json`, as 246 fichas HTML ou a distribuição de PP.
- As figuras possuem `aria-hidden=true`; o rótulo verdadeiro do controle continua acessível, com identidade e nome inalterados.
- Não faz requisições externas de imagens. CSS/JS compartilhados para o Android Capacitor, Windows Electron e PWA offline.
- Cache offline e fingerprint de release foram atualizados para 26 fontes monitoradas.
- Testes `scripts/test-training-icons-v201.cjs` e inspeção visual nas seis resoluções 320/360/390/412/1366/1920 px. A QA confirma os dez símbolos no Laboratório, os chips da ficha e reinserção depois de aumentar/reduzir um nível.
- Sem alteração do motor competitivo, habilidades nativas, ímpetos ou status de validação das builds.

## Limites
Esses são **pictogramas originais inspirados no universo do eFootball**, não reproduções exatas dos ícones proprietários da Konami. A igualdade visual pixel a pixel com o modelo premium antigo ainda depende de ter a imagem original lado a lado para auditoria final. Capturas de Chromium não substituem homologação física em Android/Windows.
