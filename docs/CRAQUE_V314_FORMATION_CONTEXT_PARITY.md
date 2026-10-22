# V314 · Integração posição de USO × vaga da formação

## Estado confirmado antes da implementação
- `main`: `51665658f65805b1416658f52779e610e97e9193`
- Última release antes de V314: `v1.1.826`
- Sistema de cenários por posição + estilo + versão de técnico, proteção de snapshots e mapa de familiaridade: **já entregue V311–V313**, não recriado.
- Falha real: formações pessoais V177/V230 calculavam encaixe para a vaga, mas não disponibilizavam ficha PP/skills/ímpetos vinculada à **posição da vaga**.

## O que V314 implementa
- `craque-formation-context-v314.js`: adaptador único de 11 vagas das duas formações existentes (4-3-1-2 e 4-2-1-3) para `CRAQUE_POSITIONAL_V311`, em **Minhas Cartas** e **Outros Elencos**, retornando modelo, função, status posicional e análise contextual sem alterar a carta.
- `craque-formation-ui-v230.js`: ação **Abrir ficha na vaga** disponível para cada titular nas duas formações. A vaga MAT calcula MAT; vaga CA calcula CA. Preserva formação e titulares salvos. Utiliza o orçamento PP real da carta e os mesmos V220/V162/V103 do laboratório.
- `craque-positional-ui-v311.js`: nas fichas de ambos os acervos, seção **Simular vaga da formação**. A posição do seletor principal passa a posição de uso da vaga escolhida e atualiza os painéis. É uma **simulação**, não uma transferência automática de jogador no plano do jogo.
- Scripts offline adicionados no HTML, cache V314 renovado, fingerprints Android/Windows e estilo responsivo.
- `scripts/test-formation-context-v314.cjs`: exige que ambas as formações usem as 11 posições históricas do catálogo, paridade entre acervos em cinco estilos, 68 PP, recomendações de skills e ímpetos, isolamento da carta original e orçamento pendente quando desconhecido.
- `scripts/qa-formation-v314.py`: Android 390×844 e Windows 1366×768; exercício da vaga real MAT/CA na escalação pessoal e da simulação de vaga MAT com Zico SA 35/68 de Bruno, com retorno SA→MAT sem sobrescrita.

## Matriz de paridade — revisão V314

| Função | Minhas Cartas | Outros Elencos | Limite |
|---|---|---|---|
| Seleção de posição de uso | V311–V313 | V311–V313 | Familiaridade só quando documentada |
| PP e habilidades e ímpetos por posição | Motor compartilhado V311 | Mesmo motor V311 | Recomendações não são equipamentos |
| 5 estilos + edição de técnico | V311–V313 | V311–V313 | Bônus não comprovado não altera PP |
| Simulação de vaga nas 2 formações | V314, ação em escalação real | V314, pelo laboratório individual | Não aplica a escolha como titular nos Outros Elencos |
| Ficha original e cenário alternativo | V311–V313 | V311–V313 | Histórico aprovado sempre preservado |
| Plano de 11 titulares e reservas | 2 formações pessoais V177/V231 | **PENDENTE**: ainda não existe editor de 11 titulares por proprietário | Não alegar paridade de escalações completa |
| Pipeline universal de imagem | Parcial | Parcial | Gestão de originais, crops e derivadas requer ciclo próprio |
| Atributos e BIO completos | Conforme evidência da edição | Cadastro externo parcial | Valores ausentes são pendentes |
| QA Android/Windows | CI visual | CI visual | Instalação em aparelhos reais não testada por CI |

## Próximas prioridades concretas
1. **Editor isolado de onze jogadores/coleção em Outros Elencos** reutilizando `CRAQUE_LINEUP_PROFILES_V231` adaptado por `owner_id`; backup sem mistura, 4-3-1-2 e 4-2-1-3; seleção de vaga deve abrir o mesmo painel V314.
2. Catálogo de técnico por formação e papel posicional independente, com versões e contexto documentado; não somar bônus como PP.
3. Importação/restauração com imagens originais, atributos e BIO, QA multi-coleções.
4. Continuar PR/CI/QA/pacotes/distribuição antes de novas features.

**O status 'integrado/publicado' só pode ser registrado após checks do GitHub e existência dos dois instaladores da nova release.**
