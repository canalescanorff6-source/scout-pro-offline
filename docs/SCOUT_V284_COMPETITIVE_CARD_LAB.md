# V284 — Laboratório competitivo individual de fichas, cinco habilidades e ímpetos

**Projeto existente:** Craque Tático — Laboratório de Futebol.  
**Base:** `main` integrada pelo PR #189, release `v1.1.691` (V283).  
**Escopo de cada teste:** 246 cartas originais × cinco estilos = 1.230 decisões.  
**Integridade:** nenhum catálogo, Card ID, edição, imagem ou vetor de build aprovado é alterado.

## Erros corrigidos na implementação existente

1. **Alerta incorreto de PP em V283**: o motor de habilidades usa a marca de coerência `investimento_matematico`, mas a sensibilidade verificava `custo_pp_conferido`, outra marca do motor de ímpetos. O alerta era indevidamente disparado mesmo com vetor matematicamente coerente. Isso foi corrigido sem elevar coerência matemática a aprovação documental.
2. **PP ausente aparecia como zero**: o perfil convertia `null` por `Number(null)`, convertendo ausência em 0. Agora preserva ausência como `null`.
3. **PP estimado influenciava ranking de ímpetos**: `booster-engine-v103.js` permitia que orçamento `pp_estimado` com custo matematicamente fechado fosse usado no sinal de investimento. Agora `pp_estimado` e `pp_estimated` são bloqueios explícitos.
4. **Perda do bloqueio no encadeamento**: `skills-booster-v162.js` passa a informação `pp_estimado` para `engine.rank`, evitando que o wrapper reintroduza o vetor.
5. **Duas nomenclaturas de status não comparáveis**: o novo parecer distingue `investimento_matematico` no motor de skills de `custo_pp_conferido` no motor de booster, sem tratar qualquer um como homologação de jogo.

## Laboratório V284 (mesma ficha, uma única análise recolhível)

6. CAP, Card ID, edição, função nativa e função utilizada aparecem como contexto verificável.
7. Mudança de posição alternativa continua **pendente** sem confirmação explícita.
8. Identifica arquétipo ofensivo/defensivo descrito a partir da edição cadastrada, nunca do Overall.
9. Seleciona até cinco habilidades adicionais candidatas; nenhuma habilidade é equipada pelo aplicativo.
10. Cada habilidade tem posição de prioridade, nome, família e contribuição relativa de função/tática/estilo/nativas/PP.
11. Cada decomposição de fatores é conferida contra o score calculado.
12. Expõe complementaridade com habilidades nativas cadastradas e alerta que mesma família não é duplicata nem sinergia provada.
13. A diferença entre habilidades próximas gera aviso para comparação real, não troca automática de ordem.
14. Até três alternativas são apresentadas com distância heurística ao primeiro colocado.
15. O portfólio de até cinco habilidades complementares segue separado do principal como **comparação**, não segunda build definitiva.
16. Mostra interseção entre os dois portfólios e não inventa diversidade quando forem iguais.
17. O verificador dos cinco slots respeita a confirmação de edição; slots desconhecidos continuam desconhecidos.
18. O ranking de ímpetos mostra as três primeiras opções existentes, com nomes traduzidos apenas quando cadastrados.
19. Cada ímpeto lista **quatro atributos** e os quatro componentes de pontuação relativa.
20. Calcula a quantidade dos quatro atributos que coincidem com o ímpeto fixo somente se este estiver identificado.
21. Sobreposição não é tratada como desperdício nem vantagem automática.
22. Os estados de ímpeto são separados em catálogo, conta e elegibilidade.
23. O painel exibe a maior pendência documental antes de homologar treino, habilidades ou segundo slot.
24. Sem atribuir parecer a Blackjhon/Rentão sem fonte específica da edição.
25. Sinaliza obrigatoriamente a ausência de teste controlado de gameplay; scores não representam superioridade verificada.
26. A interface usa seção `<details>` fechada por padrão dentro da **ficha principal**.
27. Não cria versão separada da ficha, não altera rascunhos, não recalcula atributos finais.
28. Mantém execução offline, mesmo JS e mesmo catálogo em Android/Windows.
29. QA Chromium cobre oito resoluções e abre a seção V284 em 390 px e 1151 px para verificar skills, ímpetos e pendências.
30. `scripts/test-competitive-decision-v284.cjs` audita toda a base, identidade, imutabilidade, campos da ficha, cinco skills, quatro eixos de booster, PP estimados e Martinelli #191.
31. Relatório detalhado `build/v284-competitive-decisions-246x5.json` anexado ao job de validação da CI.

## Regras que não mudam

- Preservação das **246 edições e builds aprovadas**.
- Não inventar Player ID, habilidades nativas, números de pontos ou atributos finais.
- Não atribuir homologação por score, coincidência de rank ou orçamento matematicamente fechado.
- Não transformar status do catálogo em prova de slot realmente vazio na conta.
- Não equipar habilidades/ímpetos nem consumir tokens automaticamente.
- Não atribuir sugestões aos criadores sem vídeo exato e verificação do Card ID.
- Não publicar APK/EXE até CI, QA visual e integrações autorizadas concluídos.

## Gates

`npm run check` com regressões históricas, teste V284 246×5, QA visual Chromium em 8 resoluções, validação Android e Windows, revisão de commit/PR e publicação da release assinada somente após CI verde. **Compilação no GitHub não equivale a teste em aparelho físico.**

## Próxima coleta de evidências

Priorizar as cartas com bases parciais, divergência HTML/índice, vetores PP ausentes ou slots não conferidos. Usar vídeo da edição exata antes de transformar recomendações em fichas competitivamente homologadas; não completar dados artificiais para aumentar os números de aprovação.
