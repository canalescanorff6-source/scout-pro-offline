# V303 — Técnico visível e ficha independente para cinco estilos

## Falha identificada
- Seletor V302 ficava recolhido e a montagem dependia de um evento `scoutpro:card-shell-ready-v302` que podia chegar antes de carregar o módulo.
- A V301 substituía o zero falso pelo vetor cadastrado de Posse em várias táticas quando o nível máximo ainda não havia sido confirmado, provocando visualização de cinco fichas iguais.
- Recomendações V220 já utilizavam `R.evaluate(card,tactic)` e `R.booster(...,tactic)`, mas o contexto do técnico e da tática não era suficientemente visível; fichas idênticas não deveriam ser apresentadas como personalizadas.

## Alteração V303
- Seletor por versão **aberto desde a primeira visita** à ficha e montagem tolerante a eventos perdidos/ordem de carregamento; perfil salvo por número CAP + Card ID, com leitura de compatibilidade da chave anterior.
- Novo motor `craque-style-planner-v303.js`: programação dinâmica inteira, PP exatos, pesos separados para Posse, Contra-Ataque, Contra-Ataque Rápido, Por Fora e Passe Longo, com comportamento e nativas cadastrados na MESMA edição. Nenhum atributo final é fabricado nem se usa Overall como entrada.
- Posse conserva o treino existente quando válido. Outros estilos geram **simulação alternativa** e podem coincidir apenas quando o orçamento/função e os custos não permitem diferenças justificadas; não forçar diversidade inventada.
- Sem comprovação do nível, o PP do catálogo funciona como **orçamento hipotético condicional**, não como evidência de nível máximo ou build pronta para aplicar. Divergências locais V248 seguem bloqueadas. Os dados oficiais nunca são gravados pela proposta.
- Sem treino existente, Posse também pode receber proposta calculada e claramente provisória.
- Recomendações existentes de cinco habilidades e ímpetos recalculadas por tática, com os comprovantes V254, status do slot e habilidades nativas; indicação de técnico/edição/proficiência; **não equipar sem evidência**.
- O sexto estilo Sobreposição permanece indisponível no motor de PP: mostrar aviso explícito e não reutilizar a tática anterior como se fosse sua ficha.
- Os técnicos mantêm proficiência, bônus e Link-Up do ZIP importado na V302 como informação; bônus não equivalem a PP nem são somados a atributos finais sem base comprovada.
- Critérios competitivos inspirados na disciplina de análise de **Rentão e Blackjhon**: edição exata, função, custo de oportunidade, nativas, PP, tática e teste real. **Nenhuma build ou aprovação é atribuída aos criadores sem material verificável da mesma edição.**

## Escopo imutável
246 cartas originais, identidade, Card IDs, imagens, treinamentos homologados, PP, habilidades equipadas, ímpetos fixos e perfil físico não são alterados.

## Verificações
- `node scripts/test-manager-style-v303.cjs`: cinco planos PP por carta, matemática inteira, preservação de Posse registrada, posição, ranks de habilidades/ímpetos, separação condicional/documental, 246 cartas imutáveis, seletor por carta e cache offline.
- `npm run check`, auditoria, QA visual 8 viewports, validações Android/Windows, CI release e assinatura permanente antes da distribuição.
- Teste de atualização e persistência dos dados em aparelhos físicos: **pendente** enquanto não realizado.
