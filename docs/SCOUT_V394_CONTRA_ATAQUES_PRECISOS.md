# V394 — Contra-Ataque e Contra-Ataque Rápido por função

## Entrega no aplicativo

A revisão estende o motor compartilhado de fichas da Principal, Secundária e Outros Elencos. Treino, candidatas adicionais e ranking de ímpetos usam a mesma distribuição e a referência da edição. A ficha mostra tarefas com/sem bola, risco da função e ativação conhecida ou pendente dos estilos individuais. As distribuições de Posse registradas na linha de base permanecem preservadas.

No Contra-Ataque, o perfil equilibra proteção central, mobilidade, recepção e primeiro passe. No Rápido, acrescenta prioridade relativa à recuperação da linha mais alta e à carga de recomposição/pressão. Não há uma receita de velocidade igual para todos. Atacantes de referência conservam finalização e devolução; meias recebem tarefas de conexão e retorno; volantes e defensores combinam leitura defensiva, cobertura e saída; goleiros continuam nas categorias próprias.

Os coeficientes são prioridades editoriais, não multiplicadores oficiais de desempenho. Só atributos-base documentados da edição alimentam as curvas numéricas. Pontos de mudança de retorno em 60/90 não viram tetos universais; bônus de habilidades situacionais não são somados como valores permanentes. A instrução Alvo de contra-ataque reduz a prioridade editorial da recomposição para a carta indicada e explicita a compensação dos companheiros, sem prometer economia fixa de energia.

## Precisão e histórico

- A ficha unificada não reaproveita resultado antigo quando mudam função, estilo, instruções, inventário, referência ou proposta. O vínculo de cálculo fica em memória e não certifica históricos importados.
- Estilos inativos ou sem regra documentada não recebem efeitos mecânicos presumidos. Aliases PT-BR já documentados no projeto são reconhecidos por posição. Rótulos ambíguos, como Matador, permanecem em conferência.
- As cinco adicionais são o limite de capacidade. Nativas, equipadas, vagas e disponibilidade de ímpeto continuam sujeitos às provas da edição e da conta.
- Relatos de partidas do método 383 continuam legíveis. Os relatos do método 394 só são aceitos na revisão correspondente; não transferem uma observação antiga para um método novo.
- Fichas salvas continuam históricas. A nova proposta é comparável, e sua adoção exige guardar uma revisão. Não há aplicação de treino no jogo.

## Formações existentes e treino manual

O guia das duas formações centrais 4-3-1-2 / 4-2-1-3 tem seis situações de decisão por estilo: recuperação, passe bloqueado, corrida, finalização, perda após pressão e bola nas costas. Cada situação apresenta quando agir, o que fazer e o que evitar nos comandos padrão do celular. As instruções são sugeridas por vaga e contexto, até dois espaços de ataque e dois de defesa, sem repetir nomes fixos de outra conta nem alterar a escalação. Marcação depende de informar o alvo rival; deixar uma vaga vazia é uma opção explícita.

Ofensiva e Defesa recuada, removidas na v6.0 também no mobile, não são configurações recomendadas. Não foram criados controles fictícios de altura da linha ou intensidade de pressão. As 23 edições bloqueadas continuam fora da seleção automática. O site externo Formações Premium não foi alterado.

## Comparação com a v1.1.1318

A auditoria reproduzível compara261 cartas e seis estilos (1.566 cenários). Com a revisão das duas fases e a correção de ativação,470 distribuições mudaram:226 no Contra-Ataque,223 no Rápido e21 nos demais estilos alternativos devido à correção compartilhada de ativação. As 261 distribuições de Posse não mudaram. Os orçamentos e os catálogos canônicos mantiveram os mesmos valores e hashes. Coincidência de vetor não é prova de cópia: o app registra os dados e cálculos individuais que a sustentam.

Há 260 referências públicas no catálogo embarcado. Messi #050 conserva o relato 29/56 PP e a identidade pendente. Referências públicas não comprovam aquisição, familiaridade em outra posição nem o equipamento presente na conta.

## Fontes e limites

- [Konami v6.0](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00): estilos por fase, instruções removidas, resistência e reações defensivas.
- [Konami v6.1](https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-10): treino selecionável por tokens, sem reversão anunciada das remoções anteriores.
- [Amadeusz: seis estilos](https://efhub.com/pt-BR/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed): parâmetros internos relatados pelo pesquisador; base qualitativa da distinção entre as táticas.
- [Amadeusz: aceleração](https://efhub.com/pt-BR/articles/261017_4-acceleration-thresholds-decoded) e [precisão](https://efhub.com/articles/261019_3-passing-and-finishing-the-threshold-is-90-for-both): pontos de mudança de retorno, não promessa de resultado.
- [Amadeusz: resistência](https://efhub.com/articles/261019_2-stamina-changes-these-cards-stand-to-benefit) e [revisão LBC](https://efhub.com/articles/261102_4-long-ball-counter-a-stamina-nerf): justificam considerar carga e banco; números exploratórios não foram codificados como bônus garantidos.

As fichas e os conselhos são hipóteses fundamentadas para comparação em partidas, não validação independente de meta ou de superioridade online. Compare apoio, perdas, rupturas recebidas, bolas nas costas e fadiga mantendo posição, técnico, instruções e equipamento constantes.

## Verificação reproduzível

- `npm run check:sequential` — lista completa de313 comandos.
- `scripts/test-counter-precision-v394.cjs` —490 fichas originais documentadas nos dois contra-ataques,26 perfis de fase, custo PP, nativas, ativação e preservação da origem.
- `scripts/test-counter-context-v394.cjs` — invalidação de resultados antigos e preservação de fichas salvas/Posse.
- `scripts/test-counter-coaching-v394.cjs` — decisões e instruções nos quatro contextos de formação/estilo.
- `scripts/qa-counter-fichas-v394.py` —18 casos: três acervos, dois estilos e três larguras.
- `scripts/qa-counter-coaching-v394.py` —12 casos: duas formações, dois estilos e três larguras, sem gravações ou alteração do XI.
- QA visual ampliado e compilação Android/Windows no GitHub antes da publicação conjunta. Instalação física e rendimento em partidas são verificações separadas.
