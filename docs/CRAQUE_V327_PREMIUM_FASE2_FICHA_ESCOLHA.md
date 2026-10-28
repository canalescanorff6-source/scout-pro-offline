# V327 · Premium Fase 2 — escolha explicável entre cinco fichas de estilo

**Base:** `main` v1.1.905 (V326), 246 cartas preservadas, Android e Windows compartilham a pasta `web`.

## Dor corrigida

No aplicativo existiam fichas por diferentes estilos, técnicos, posições e revisões. Ao olhar uma carta, o proprietário não conseguia diferenciar prontamente **o estilo escolhido**, **a proposta matemática**, **um rascunho contextual salvo** e **uma revisão explicitamente aprovada**. A UI V326 ainda fazia “Comparar alternativas” abrir uma comparação posicional MAT→SA, em vez de oferecer uma comparação direta das cinco táticas do mesmo jogador.

## Entrega de engenharia

1. Novo motor puro `web/craque-ficha-decision-v327.js`, que recebe o cenário V311 do próprio acervo. Estados rigorosos:
   - **pendente**: sem distribuição PP exata utilizável;
   - **proposta_calculada**: PP matematicamente fechados, sem validação competitiva;
   - **revisao_salva**: revisão V311 válida na mesma carta/posição/estilo/técnico;
   - **rascunho_salvo**: ficha independente V324/V325 válida, sem substituição de builds;
   - **aprovacao_registrada**: somente revisão efetivamente sinalizada `approved:true`, íntegra, e jamais comprovação automática de equipamento no eFootball.
2. Na **Ficha em foco** (componente único V311 para ambos os acervos), título acompanha a origem e painel recolhível **“Por que esta ficha está em foco?”** explica quatro fatos: estilo escolhido, familiaridade da posição, técnico/edição e custo PP; distingue status de salvamento/aprovação.
3. **“Comparar 5 estilos de jogo”** abre cinco cartões na mesma carta, posição e técnico, incluindo o estilo ativo. Mostra quais níveis de categoria mudam versus a seleção atual com PP iguais, sem inventar ganho de atributos base ou Overall.
4. **“Visualizar este estilo”** seleciona o estilo na aba original **de Minhas Cartas ou Outros Elencos**. Não grava PP, ímpeto, habilidades, revisão ou configuração homologada, nem força o proprietário a aplicar uma opção.
5. Retém a comparação posicional original na análise avançada e a navegação **MAT→SA→MAT**. Comparar táticas e comparar posições são duas perguntas diferentes e, a partir desta fase, têm interfaces distintas.
6. UI Premium azul-noite/dourado com títulos simples, botões acessíveis e informação secundária sob demanda.

## Por que não existe um “melhor absoluto”?

Dados de nível, PP e pesos heurísticos do motor **não provam** movimentação específica nem resultado competitivo em partidas. O algoritmo não promove a proposta calculada a “melhor de todas” por ter maior Overall ou por esgotar PP. A ficha em foco segue o estilo que **o usuário escolheu** e privilegia um histórico exato salvo como fonte; quando faltam evidências, o aplicativo informa isso.

## Segurança e testes

- Nenhuma linha do cadastro das 246 cartas e nenhum JSON de habilidade/ímpteto original é modificado nesta fase.
- Os três estados (revisão do usuário, rascunho e proposta calculada) são somente leitura na decisão.
- A comparação recusa candidatos de técnicos ou posições divergentes e estilos repetidos.
- Testes `scripts/test-ficha-decision-v327.cjs`: cinco estilos, status, prevenção de homologação falsa, 62 PP exatos, diferenças reais de categoria, proteção do histórico, integridade das cartas e fingerprint Android/Windows.
- QA `scripts/qa-ficha-decision-v327.py`: na tela real, muda o estilo por botão; MAT→SA→MAT; confirma que somente a PRÉVIA mudou, sem novos itens V311/V324; roda em emulação de viewport Android e Windows e em ambos os acervos.
- Testes antigos da V326 continuam garantindo acesso à análise avançada e à comparação MAT×SA.
- Integrar e publicar **somente após** CI geral, auditoria das 246 cartas, QA visual, Android assinado e Windows aprovados.

## Próximas oportunidades

- V328: seletor de técnicos visual e pesquisável, com versões/edições resumidas, favoritos locais e proficiências relevantes primeiro.
- V329: harmonizar o visual e a hierarquia de escalações, laboratório e paineis de evidências.
- Continuidade de base competitiva: cartas sem habilidade nativa comprovada, slots de ímpetos pendentes, PP com origem insuficiente e validação individual por edição exigem fonte humana e não permitem um “melhor treino” conclusivo.
