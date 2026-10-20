# V276 — Pacote de habilidades complementares e ímpetos com sobreposição controlada

## Continuidade e escopo
Base original V275, commit `2479071560e0b2f4e910cb61c11e3f19bcbda5f2`, release `v1.1.657`. É o MESMO Craque Tático — Laboratório de Futebol, antigo Scout PRO Offline.

As 246 cartas (Card ID, imagens, edições, PP, vetores aprovados, estilo, habilidades nativas, ímpetos fixos e equipamentos existentes) ficam intocadas. Não converter sugestão em build aprovada. Não atribuir ficha a Rentão/Blackjhon sem vídeo/print da MESMA edição.

## Intervenções V276

### Habilidades e fichas
1. Preservar o ranking competitivo anterior com todas as nativas e a validação dos cinco slots.
2. Acrescentar **portfólio complementar alternativo** de até cinco habilidades, sem substituir nem equipar o ranking original.
3. Classificar habilidades em famílias: apoio curto, criação, domínio, finalização, jogo aéreo, cobertura, intensidade, reposição e defesa de goleiro.
4. Identificar famílias de suporte prioritárias **por função** (CA, SA, MAT, MLG, VOL, ZG, LD, LE, ALA, GO).
5. Identificar demandas complementares pelos cinco estilos do técnico (Posse, Contra-Ataque Normal, Rápido, Por Fora e Passe Longo).
6. Priorizar primeira representação da família funcional sem forçar diversidade fictícia.
7. Penalizar moderadamente excesso de indicações da mesma família; não substituir skill comprovada por nome inventado.
8. Continuar excluindo nativas já registradas, adicionais já equipadas e aliases oficiais reconhecidos.
9. Garantir que **0 vagas confirmadas gerem 0 candidatos aplicáveis**, e que nenhuma carta tenha mais de cinco candidatos.
10. Lista não conferida: até cinco candidatos teóricos, explicitamente **não** cinco slots livres.
11. Mostrar em cada candidato a família, os critérios de complemento e o caráter consultivo.
12. Preservar o painel anterior do ranking para comparação direta com a alternativa diversificada.
13. Preservar a ficha V275 com checklist de 7 evidências, posição original separada de posição treinada e guia prático.
14. Manter o layout premium azul-noite e dourado, com cards de habilidades responsivos sem dependência de cruzamentos.

### Ímpetos
15. Reconhecer o ímpeto fixo da edição por código de booster, aliases e nomes PT-BR documentados.
16. Comparar os **quatro atributos** do fixo com os quatro do primeiro e de até dois ímpetos alternativos.
17. Informar quantos atributos coincidem, sem afirmar que a coincidência significa desperdício de +1 ou inferioridade.
18. Identificar uma opção de menor sobreposição **somente dentro de oito pontos relativos** do topo, sem reordenar a indicação principal.
19. No caso de três ou quatro atributos em comum, mostrar alerta para examinar a build da mesma carta.
20. Sem ímpeto fixo identificado ou sem eixos verificáveis, deixar overlap **indeterminado**, não zero por suposição.
21. Não equipar boosters automaticamente nem presumir que a carta possua segundo slot.
22. Segundo slot ocupado, fixo, pendente ou sem confirmação continua bloqueando ação; a comparação é apenas informativa.
23. O dossiê da carta lista as alternativas pelo nome registrado, diferença de atributos e cautelas.
24. Preservar tipos oficiais, sem inventar traduzir ímpetos sem nome comprovado.

### Engenharia, testes e publicação
25. Cobrir **246 × 5 = 1.230 cenários** por meio de `scripts/test-portfolio-v276.cjs`.
26. Contar diferenças entre top cinco original e portfólio complementar, com proteção contra clones artificiais.
27. Validar ímpetos em todas as cartas: no máximo 4 eixos, interseção correta e alternativa complementar válida.
28. Testar separadamente zero slots, um slot, cinco vagas desconhecidas e habilidades nativas já existentes.
29. Gerar `build/v276-portfolio-boosters-246x5.json` com Card ID e cinco táticas, anexado na CI.
30. Atualizar service worker do Android/Windows e submeter merge só com CI, Android debug, Windows NSIS e QA visual de oito viewports GREEN.

## Critério de qualidade competitivo
Os modelos usados por criadores experientes como Rentão e Blackjhon servem de referência metodológica (edição exata, função, treinamento, habilidades, ímpetos, teste competitivo). **Não** há validação ou autoria externa dessas recomendações. A fórmula não prova status finais, Overall, rendimento ou meta.

Toda integração depende da aprovação dos testes, do merge por SHA e da verificação da release Android assinada (APK + SHA256) e Windows (EXE, blockmap, latest.yml). Testar instalação física e partidas é etapa distinta e não deve ser declarada concluída pelos checks.
