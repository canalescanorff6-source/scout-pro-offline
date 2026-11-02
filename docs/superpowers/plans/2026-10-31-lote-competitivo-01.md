# Lote competitivo 01 — plano de implementação

> Executar com superpowers:executing-plans, no contexto atual. Revisão do conjunto ao final.

**Objetivo:** entregar fichas consultivas por edição para 13 cartas na Posse central, incluindo treino, adicionais e ímpeto, sem substituir dados aprovados.

**Arquitetura:** registro pequeno de propostas editoriais com CAP, ID, edição, PP e impressão da referência pública. A ficha unificada usa a proposta somente quando não há seleção ou revisão salva e a referência exata é compatível. Habilidades e ímpeto passam pelos inventários e limites existentes. Os demais estilos continuam independentes.

**Tecnologia:** JavaScript sem dependências; motores V162/V103/V228/V376/V378 existentes.

**Spec:** solicitação do proprietário no prompt e regras de integridade de `AGENTS.md`; revisão por lotes de 10–15 cartas, desempenho além do Overall, nomes PT-BR e evidência explícita.

## Restrições

- CAPs 1, 2, 4, 5, 6, 8, 9, 10, 11, 14, 24, 47, 208; posição original; somente Posse.
- Catálogo, imagens, PP, identidades, treinos aprovados, equipamentos e armazenamento permanecem preservados.
- PP calculados não comprovam superioridade em partidas. Propostas são ESTIMADAS, nunca homologadas como fichas de criadores.
- Evidência pública não comprova o slot/equipamento da conta. Até cinco candidatas, sem preencher vagas artificialmente.
- Publicação requer aprovação explícita conforme `AGENTS.md`, após PR concreto.

## Foco da revisão

1. Edição/ID/PP/referência divergentes: manter motor anterior.
2. Treino parcial ou escolhas vazias salvas: preservar exatamente.
3. Nativas, adicionais equipadas e capacidade confirmada: excluir duplicações e respeitar limite.
4. Ímpeto fixo, extra ocupado e slot ausente: não sobrescrever/equipar.
5. Outros estilos, posições e cartas fora do lote: manter comportamento anterior.

## Tarefas

- [x] Escrever teste comportamental e observar falha: 13 propostas exatas, preservação de contexto, filtros e exportação.
- [x] Implementar registro e resolução; integrar à ficha e ao cache offline; mostrar motivo, origem e limitação.
- [x] Exportar relatório das 13 fichas com comparação estimada sem técnico/extra, fontes e lacunas de pesquisa.
- [x] Rodar testes focados, `npm run check` e conferência visual móvel/Windows; corrigir regressões. Windows usa o executor sequencial existente: 287 comandos PASS; QA V380/V378 PASS. Após revisão independente, repetir testes afetados e dois QA (PASS).
- [x] Revisar alterações, registrar IDs concluídos e abrir PR sem publicar: [PR #301](https://github.com/canalescanorff6-source/scout-pro-offline/pull/301). Revisão independente final confirmou os dois ajustes, sem novo achado. CI remoto em acompanhamento; não é publicação.

## Decisões

- Reusar referências V376 e apresentação V378; sem novo otimizador ou recálculo do catálogo.
- Propostas manuais explicadas por atributos-base/estilo; sem perseguir Overall ou inventar limites oficiais.
- Manter treinos de Gerrard/Neuer neste lote; nem toda carta precisa mudar.
- Pesquisas públicas de vídeos são pistas até verificar edição e números. Rentão/Blackjhon não recebem atribuição sem conteúdo verificado.
