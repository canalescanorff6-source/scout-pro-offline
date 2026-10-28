# Scout PRO V196 — nomenclatura de habilidades em PT-BR

## Solicitação e evidências
O usuário forneceu **14 fotografias** do menu de habilidades em português no eFootball, incluindo telas para dribles, finalizações, passes e defesa. A implementação privilegia a nomenclatura **visível nesses prints**, em vez de traduções livres. O catálogo eFootballHub PT-BR foi consultado como referência complementar em termos não visíveis no lote.

Fontes externas auxiliares:
- https://www.efootballhub.net/br/efootball23/player/89064200084194
- https://www.konami.com/efootball/pt-br/page/2024/versioninfo_v3-00

**Não declarar** que a Konami publicou uma lista oficial completa de equivalências inglês/português. As fotografias mostram os nomes em português, mas não necessariamente os IDs internos em inglês. Para cada par, houve associação com a terminologia convencional documentada do jogo; termos ambíguos ficam inalterados até fonte inequívoca.

## Correções prioritárias nas recomendações
| Antes (nome traduzido livremente) | PT-BR adotado |
|---|---|
| Passe ponderado | Passe na medida |
| Finalização de primeira | Chute de primeira |
| Chute de longa distância | Precisão à distância |
| Chute colocado de longa distância | Efeito de longe |
| Cabeceio (nome da habilidade) | Cabeçada |
| Recuar para marcar | Volta para marcar |
| Corte acrobático | Afastamento acrobático |
| Corte para trás e giro | Puxada de letra |
| Capitão | Liderança |
| Super reserva | Super substituto |
| Passe de calcanhar | Toque de calcanhar |

Os termos de goleiro que possuem tradução sustentada no catálogo PT-BR receberam equivalência (Reposição baixa do GO, Arremesso longo do GO, Pegador de pênaltis). **GK High Punt** e novos skills exclusivos sem evidências suficientes continuam sem tradução automática.

## Como opera sem adulterar os dados
- `web/skill-names-v196.js` padroniza apenas os rótulos exibidos na tela: chips de habilidades nativas, resumo da análise e lista das candidatas que já existem nas fichas.
- As 246 páginas HTML, cartas, Card IDs, arrays das nativas, metadados, PP, ímpetos, vídeos, builds e saves locais **não foram reescritos**.
- `web/skills-booster-v162.js` exibe o mesmo rótulo padronizado ao recomendar uma skill; o ID técnico continua igual. Grafias antigas e nomes em inglês permanecem aceitos pelo motor, prevenindo repetir habilidade nativa como adicional.
- O tradutor **não** aplica substituição global a atributos, textos explicativos, HTML de código ou conteúdo de jogo. A habilidade `Heading` é exibida como **Cabeçada**; o atributo de estatística `Cabeceio` não é alterado.
- Traduções não comprovadas, especialmente `Phenomenal Finishing`, `Low Screamer`, `Blitz Curler`, `GK High Punt`, `Aerial Fort` e novos skills exclusivos, são preservadas com o nome bruto e marcadas aqui como **pendentes**, sem fingir equivalência.

## Critérios de aceite
- `npm run check` inclui `scripts/test-skill-names-v196.cjs` e avalia aliases históricos em 246 cartas × 3 estilos.
- `scripts/qa-visual-v195.py` verifica nomes de habilidades visíveis em resoluções de 360/390/1366 px.
- GitHub Actions deve apresentar CI geral, Android debug, Windows preview, auditoria de cartas e QA visual **GREEN** antes da integração.
- Pós-merge, CI oficial precisa publicar Android assinado e Windows em **uma mesma release**, com os arquivos compartilhados no cache e fingerprint.
- Capturas simuladas não provam pixel-perfect do mockup nem funcionamento físico. Verificações no celular e PC continuam necessárias.

## Pendências
1. Testar o visual atualizado em telas reais do Android e Windows.
2. Capturar e validar nomes das habilidades especiais mais recentes diretamente no eFootball 2027; só então acrescentar as equivalências exatas.
3. Comparar a interface ao mockup premium final, não anexado neste PR.
