# Craque Tático V287 — Conselho profissional das 246 fichas

**Origem:** release V286 `v1.1.701`, commit `1299ea830fee9407d251c6c1d669118fc16c23ec`. Continua o aplicativo já existente; sem recriar acervo.

## Pacote implementado de uma vez

1. Conselho de evidências para cada carta e cada um dos cinco estilos, **246 × 5 = 1.230 avaliações**.
2. Confronto exato entre CAP, Card ID, edição no catálogo central e índice documental V221, sem aceitar confirmação por nome igual.
3. Checklist operacional de **12 provas**: identidade, índice vinculado, nativas, print da edição, vetor de PP, atributos-base, adicionais, slot no catálogo, slot na conta, biotipo, vídeo e gameplay.
4. Classificação de bloqueio documental separada de qualidade competitiva: não atribui placar meta ou nota de jogador a ausência de print.
5. Sem Converter `print_candidato` em `print_edicao_confirmada` nem `base_stats_confirmados` em estatísticas finais.
6. Bloqueia equipamentos declarados somente por booleanos: skills adicionais precisam de fingerprint da lista **e das nativas**, CAP, Card ID e edição conforme confirmação V254.
7. O segundo ímpeto só é considerado declarado vazio quando existe um registro V283 válido com CAP, Card ID e edição; status isolado fornecido a APIs é ignorado.
8. As habilidades do portfólio otimizado V286 são acompanhadas de razão, família, prioridade, confronto com o top cinco individual e frequência nos cinco estilos.
9. Expõe substituições apenas como decisão heurística consultiva: não altera builds já aprovadas, não equipa slots e não altera PP.
10. Ímpetos apresentam quatro eixos documentados, sobreposição quando o fixo é reconhecido e **pesos da função como critério explicativo**, não atributos finais.
11. Cada um dos três testes de sensibilidade (sem nativas, sem PP, sem estilo) registra se houve troca do ímpeto líder; evita consumo de tokens baseado em uma ordenação frágil.
12. Bloqueios de identidade, fonte e slot aparecem em destaque. Pendências de vídeo e gameplay continuam abertas até prova de mesma edição.
13. Em cartas com menos de cinco habilidades elegíveis, informa corretamente a quantidade restante sem inventar nativas ou habilidades adicionais.
14. Painel V287 integrado à ficha única, recolhido por padrão, responsivo para Android e Windows; não substitui V284/V285/V286.
15. Nova auditoria `scripts/test-professional-council-v287.cjs` valida as 246 cartas por cinco estilos, preserva corpus e índice intactos, reproduz casos negativos de identidade, equipamento e slot forjados.
16. Publica relatório `build/v287-evidence-council-246x5.json` com pendências por edição, tática, habilidades e ímpetos.
17. Publica **fila de revisão de todas as 246 cartas em CSV** (`build/v287-evidence-queue-246.csv`), ordenada pelo número e gravidade das pendências documentais. A pontuação organiza trabalho, não classifica força do jogador.
18. QA visual em oito viewports, abre a seção em 390 px e 1151 px, verifica quatro indicadores, lista de habilidades, ímpetos e pendências sem overflow.
19. Usa a mesma base de código, os mesmos arquivos originais e o mesmo cache offline nas plataformas Android e Windows.
20. Nenhum campo tem aval de Rentão ou Blackjhon sem vídeo ou fonte verificável que corresponda à **edição e ao Card ID exatos**. Seus critérios de análise são referência de rigor, não prova ou atribuição.

## Evidências e limites atuais

O índice documental atual não confirma capturas da edição exata em todos os registros. As fichas continuam **hipóteses competitivas** onde faltam fontes, mesmo quando a matemática dos PP fecha. A interface nunca declara todas as 246 homologadas. Não usa Overall como fonte de superioridade e não cria nomes oficiais ou slots inexistentes.

## Gates de publicação

`npm run check` abrangendo V278–V287, validação do inventário de 246 cartas, QA visual nas oito resoluções, compilação de validação de Android e Windows e aprovação de todos os checks do PR. Depois do merge, exigir APK assinado, SHA256, EXE, blockmap, `latest.yml`, mesma SHA/tag/release e cinco jobs verdes. Um runner sem acesso temporário a Google Maven/Maven Central **não equivale a falha no código**; não publicar APK antigo como novo.
