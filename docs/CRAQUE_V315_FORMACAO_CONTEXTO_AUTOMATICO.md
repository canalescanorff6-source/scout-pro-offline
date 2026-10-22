# Craque Tático — V315: integração automática entre troca de titular e ficha posicional

## Baseline verificada
- Repositório `canalescanorff6-source/scout-pro-offline` em `main@687826dfd53703347e61ea856193cebe69a3155b`
- Release oficial antes do lote: `v1.1.830`
- V311–V314 já oferecem seletor contextual, snapshots independentes por posição/estilo/técnico e simulação da vaga das formações 4-3-1-2 e 4-2-1-3 estreita em ambos acervos. Esta versão não recria seus motores.

## Lacuna real identificada
No planejamento pessoal V177, substituir o titular em uma vaga atualizava o campo e salvava a escalação, mas **não abria automaticamente a ficha contextual do novo titular**. Era necessário procurar o painel e clicar em “Abrir ficha na vaga”. A posição de uso não era aplicada à análise ativa pela operação normal de troca.

## Ajuste
- `web/meu-time-duas-formacoes-v177.js`: somente após verificar elegibilidade da escalação, identidade única, salvar e renderizar, emite `craque:lineup-assigned-v315` com formação, estilo, vaga e número da carta que foi efetivamente escalada. Nenhum evento é emitido em tentativas rejeitadas.
- `web/craque-formation-ui-v230.js`: reutiliza `openPositionScenario()` da V314 e os mesmos motores `CRAQUE_POSITIONAL_V311` / `CRAQUE_FORMATION_CONTEXT_V314`. O evento abre automaticamente o laboratório contextual do jogador e da vaga, exibindo PP, habilidades, ímpetos e familiaridade que correspondem à função selecionada. Abre o painel avançado para ficar visível sem procurar outro botão.
- Eventos assíncronos de trocas rápidas são confrontados com o snapshot da escalação no momento do processamento. Eventos obsoletos não atualizam fichas indevidas.
- Com o painel aberto, mudar o estilo ou a formação atualiza a análise com a carta que ocupa a vaga nesse perfil, sem reescrever a ficha original nem misturar onze titulares de estilos diferentes.
- Fora do planejamento pessoal, continua disponível em Outros Elencos o seletor de vaga V314, com o mesmo motor V311. **Não foram criadas funções de escalação de onze jogadores externos neste lote.**

## Aceitação
- Trocar titular validamente em MAT: mostrar automaticamente o **novo jogador** no laboratório de MAT, sem clique adicional em “Abrir ficha”.
- Ao passar para CA Rápido, o mesmo painel analisa o jogador efetivamente selecionado para MAT naquele estilo.
- O comparador MAT → SA continua usando V311, sem aplicar treinos/equipamentos na conta.
- Não alterar `web/SCOUT_V69_AUDITORIA.json`, imagens, Card IDs, PP, níveis, builds, slots reais ou assinatura Android.
- Teste Node V315: integridade dos eventos/guardas, 246 cartas e motor posicional do V314.
- QA Chromium V315 em Android/Windows: troca de jogador no campo, atualização automática e tática, consulta de cartão externo Bruno Santos CD e restauração contextual.
- CI, QA, release/assinatura são gates; não alegar instalação física no aparelho.

## Dívidas abertas
- Paridade integral de módulos como bio corporal, comparador de cartas, pipelines avançados de imagens e formações próprias para cada coleção externa requer auditoria de módulo e implementação própria; um seletor de vaga não demonstra paridade completa.
- Familiaridade alternativa e ativação do estilo individual não são inferidas do Overall; dados pendentes continuam pendentes.
- Android ↔ Windows compartilham código offline mas não há sincronização em tempo real de dados do usuário sem um mecanismo explícito.
