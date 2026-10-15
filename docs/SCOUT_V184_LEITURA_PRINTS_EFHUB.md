# SCOUT PRO V184 — evidências dos prints eFHUB

## Origem e alcance

O usuário enviou `Screenshots.rar`, com **241 imagens JPEG do eFHUB**, em 15 de outubro de 2026. Foram feitas a extração e leitura visual das 241 listas de habilidades em português. A planilha `Scout_PRO_V184_eFHUB_241_Cartas.xlsx` e o JSON `Scout_PRO_V184_eFHUB_auditoria_241.json` foram entregues como arquivos anexos no chat. **O JSON completo de 241 imagens, 2.243 habilidades, 15 observações físicas e associações candidatas também foi integrado ao repositório em `web/SCOUT_V184_EFHUB_241_COMPLETE.json`.** A planilha XLSX continua disponível como anexo no chat.

**No GitHub:** `web/SCOUT_V184_EFHUB_241_COMPLETE.json` reúne as **241 listas**, por print e hash; `web/SCOUT_V184_EFHUB_SCREENSHOT_EVIDENCE.json` complementa com **15 observações prioritárias** para exibição na ficha (incluindo dados do modelo de jogador quando legíveis). São evidências visuais do eFHUB, e não Card IDs autenticados da conta.

### Contagem da coleta

- 241 imagens; 210 nomes distintos nos nomes de arquivo.
- 241 listas de habilidades transcritas: 2.243 ocorrências, 60 nomes distintos.
- 190 listas com 10 itens, 51 com 2 a 9 itens.
- 185 capturas têm candidato único por nome no Scout PRO; associação de nome **não valida raridade, edição nem Card ID**.
- 55 capturas envolvem jogadores repetidos, versões distintas ou um único arquivo para várias cartas de mesmo nome; uma exige revisão de grafia para vínculo.
- As imagens de eFHUB **não exibem Card ID numérico**. Além disso, as pontuações de treino/atributos/Overall e ímpetos exibidos podem refletir simulação de treinador e progressão.

## Regras de integridade

1. Não tocar nos 246 níveis máximos, PP, treinamento, artes, builds, Card IDs e ímpetos de conta já cadastrados.
2. Exibir habilidades do eFHUB como **candidatas por print**, sem promovê-las automaticamente a habilidades nativas de edição autenticada.
3. Nunca assumir que `Sem Impulso` significa que uma carta no jogo não possui booster; a tela do eFHUB não certifica nenhum slot/equipamento da conta.
4. Não transferir skills entre cartas homônimas de edições diferentes.
5. Autenticar o Card ID antes de atualizar fichas principais ou liberar recomendação de cinco habilidades sem duplicatas.

## Observações prioritárias para o Scout PRO

| CAP | Jogador | Habilidades do print | Observação |
|---|---|---:|---|
| 075 | Luis Díaz | 10 | Show Time confirmada pelo usuário, Card ID numérico ausente da captura |
| 151 | Willian Pacho | 7 | **Distinguido**, lista de 7 habilidades diferente da versão Show Time do ID conflitante |
| 170 | Jan Oblak | 5 | Show Time confirmada, dois boosters visíveis na **simulação** |
| 181 | Serhou Guirassy | 10 | **Distinguido**, lista própria; não importar a lista Show Time do ID conflitante |
| 020, 225 | Rodri | 10 + 10 | Duas versões distintas; #225 ainda tem ID principal que externamente pertence a Nico O'Reilly |
| 024, 027 | Cristiano Ronaldo | 10 + 10 | Duas versões; #024 tem dois boosters exibidos no simulador |
| 236 | Samuel Eto'o | 10 | Habilidades especiais documentadas visualmente; booster extra somente simulação |
| 172 | Thibaut Courtois | 2 | Sem ímpeto no primeiro indicador e goleiro +1 no outro; não implica slot de conta |
| sem CAP | Messi ×3, Rivaldo ×2 | 10 por print | Edições múltiplas; associação individual pendente |

### Habilidades do print do Pacho #151

Marcação individual; Interceptação; Afastamento acrobático; Espírito guerreiro; Bloqueador; Superioridade aérea; Carrinho.

### Habilidades do print do Guirassy #181

Controle com a sola; Cabeçada; Controle da cavadinha; Chute ascendente; Finalização acrobática; Chute de primeira; Especialista em pênalti; Malícia; Espírito guerreiro; Superioridade aérea.

As duas listas permanecem **evidência do print** até validar o Card ID da versão Distinguido. O catálogo mestre não recebe dados do Show Time por engano.

## Implementação

O `web/app-bridge.js` carrega tanto `SCOUT_V184_EFHUB_241_COMPLETE.json` quanto `SCOUT_V184_EFHUB_SCREENSHOT_EVIDENCE.json` e acrescenta um painel de evidência separado em cada ficha com captura candidata. O painel lista habilidades das 241 capturas e, quando a observação detalhada existe, também boosters e modelo físico, com alertas sobre não homologação no jogo. Quando há várias edições possíveis, exige seleção explícita do print pelo usuário; não altera `scout-v68-data`, distribuição de PP ou dados de equipamento. `web/sw.js` inclui o JSON no cache e troca a versão, para os dispositivos receberem os textos atualizados. O teste `scripts/test-efhub-v184.cjs` verifica as 15 observações, as raridades, a proteção dos bloqueios #151/#181 e a manutenção do ID principal #225 até prova segura.

**Status:** CI/release apenas se for aprovada no GitHub. Sem afirmar instalação concluída no dispositivo.
