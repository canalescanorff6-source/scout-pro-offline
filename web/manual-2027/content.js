(function(w){const data={
  "feints": {
    "title": "Finta avançada, gesto por gesto.",
    "setup": "Extras > Configurações do jogo > Config. jogabilidade > Tipo de comando de finta > Avançado. Mantenha o controle por toque com botões visíveis.",
    "intro": "Dez famílias de fintas, duas ações de recepção e Tap Trick quando a carta possui a habilidade. Os gestos abaixo são para o botão Acelerar e o direcional da tela. As setas acompanham a direção do corpo, não necessariamente o gol.",
    "legend": "No exemplo inicial, o jogador está voltado para a direita: frente →, trás ←, um lado ↑ e o outro ↓. Troque a orientação para girar os desenhos. D é o dedo direito em Acelerar; E é o dedo esquerdo no direcional. Os desenhos indicam gestos, não a trajetória da bola.",
    "scope": "Dez famílias do modo Avançado e três fichas adicionais. As fontes identificam demonstrações independentes e capturas da Lista/tutorial. Os sete primeiros comandos-base seguem as demonstrações visuais consultadas; não foram testados na sua conta. Se a sua Lista instalada mostrar um gesto diferente, siga a versão instalada.",
    "items": [
      {
        "id": "marseille",
        "name": "Giro 360°",
        "aliases": "Marseille Turn, Roulette, roleta",
        "group": "Base",
        "steps": [
          "D: deslize Acelerar para a frente →.",
          "E: em seguida, deslize o direcional para um lado ↑ ou ↓."
        ],
        "right": "front",
        "left": "side",
        "requirement": "O gesto seleciona a família do giro. A habilidade Giro 360° e o contexto podem alterar a animação; não confunda seleção do comando com garantia de execução idêntica.",
        "use": "Mudar o ângulo quando o primeiro rival já se comprometeu e existe uma saída lateral.",
        "avoid": "Girar contra uma segunda cobertura ou tentar uma mudança extrema depois de uma corrida longa.",
        "drill": "Faça cinco giros para cada lado em baixa velocidade. Depois acrescente um adversário e termine com um passe para o espaço aberto.",
        "variants": "A velocidade de entrada pode limitar o ângulo do giro. Giro de três toques e Bolasie não são tratados aqui como combinações universais separadas.",
        "sources": [
          "finta-touch",
          "fintas"
        ]
      },
      {
        "id": "double-touch",
        "name": "Toque duplo",
        "aliases": "Double Touch, duplo toque, double tap, Tess",
        "group": "Base",
        "steps": [
          "D: deslize Acelerar para um lado ↑ ou ↓, a 90° da frente do jogador.",
          "E: em seguida, deslize o direcional para a frente →."
        ],
        "right": "side",
        "left": "front",
        "requirement": "O modo Avançado seleciona o movimento. A habilidade Toque duplo pode mudar sua execução; não presuma que todas as cartas usem a mesma animação.",
        "use": "Sair da linha de um bote e preparar passe ou chute quando o corredor ao lado está livre.",
        "avoid": "Fazer o primeiro deslize em uma diagonal por engano ou continuar correndo para dentro da cobertura.",
        "drill": "Alterne cinco saídas para cada lado. Pare após o movimento para conferir se foi Toque duplo; depois acrescente o passe seguinte.",
        "variants": "Toque duplo especial, Tess e cancelamentos não são botões extras. Não acrescentamos uma sequência universal para uma animação que depende da edição e das habilidades.",
        "sources": [
          "finta-touch"
        ]
      },
      {
        "id": "draw-open",
        "name": "Puxada e toque por fora",
        "aliases": "Draw and Open, L Feint, finta em L",
        "group": "Base",
        "steps": [
          "D: deslize Acelerar para trás ←.",
          "E: em seguida, deslize o direcional para um lado ↑ ou ↓."
        ],
        "right": "back",
        "left": "side",
        "requirement": "A família é selecionada por puxar e sair para o lado. Variações em L dependem da carta, pé de execução e habilidades; não são prometidas para qualquer jogador.",
        "use": "Puxar a bola para longe de um bote frontal e abrir um ângulo lateral.",
        "avoid": "Confundir trás com a direção do gol ou puxar para um rival que se aproxima pelas costas.",
        "drill": "Comece parado, puxe e saia para um lado. Repita do outro lado e verifique se você deixou espaço para o segundo toque.",
        "variants": "Finta em L é uma variação associada a esta família. Confira Finta de letra e virada/Cut Behind & Turn na descrição da carta; a nomenclatura pode variar entre localizações.",
        "sources": [
          "finta-touch"
        ]
      },
      {
        "id": "draw-close",
        "name": "Puxada e toque por dentro",
        "aliases": "Draw and Close, Scotch Move, Inside Bounce, corte para dentro, finta de letra",
        "group": "Base",
        "steps": [
          "D: deslize Acelerar para trás ←.",
          "E: em seguida, deslize o direcional para a frente →."
        ],
        "right": "back",
        "left": "front",
        "requirement": "A puxada e a saída frontal formam o comando-base. A variação Inside Bounce/Finta de letra depende do recurso presente na carta; não trate todas as animações como iguais.",
        "use": "Recuar a bola brevemente e mudar a relação com o marcador que avança.",
        "avoid": "Acionar o direcional para o lado quando pretendia sair para a frente ou usar sem espaço para completar a puxada.",
        "drill": "Alterne esta puxada com a saída por fora. Identifique a diferença apenas pela direção final do dedo esquerdo.",
        "variants": "O comando de seleção e a habilidade da carta são coisas diferentes. O nome popular Scotch Move não acrescenta um terceiro toque obrigatório.",
        "sources": [
          "finta-touch",
          "fintas"
        ]
      },
      {
        "id": "flip-flap",
        "name": "Elástico",
        "aliases": "Flip Flap, Out and In, fora para dentro",
        "group": "Base",
        "steps": [
          "D: dê um toque em Acelerar e solte.",
          "E: logo depois, dê um deslize rápido na diagonal à frente ↗ ou ↘, cerca de 45°."
        ],
        "right": "tap",
        "left": "diagonal",
        "requirement": "A habilidade Elástico pode alterar a animação disponível. Direção, pé da bola e carta importam; o guia não garante Elástico reverso em qualquer contexto.",
        "use": "Mudar o lado de saída em um duelo quando o adversário já respondeu ao primeiro movimento.",
        "avoid": "Segurar Acelerar como numa corrida ou confundir a diagonal de 45° com a lateral de 90° do corte.",
        "drill": "Compare cinco diagonais com cinco laterais, parado ou lento. Identifique qual animação surgiu antes de acelerar o treino.",
        "variants": "Elástico reverso e Hocus Pocus são nomes de variações; não receberam aqui um comando separado sem confirmação atual no toque.",
        "sources": [
          "finta-touch"
        ]
      },
      {
        "id": "scissors",
        "name": "Pedaladas",
        "aliases": "Scissors Feint, pedalada simples, tesoura",
        "group": "Base",
        "steps": [
          "D: comece de um lado ↑ e deslize em arco pela frente → até o lado oposto ↓, acompanhando o contorno de Acelerar.",
          "E: direcione a saída desejada após o gesto. Para o lado espelhado, faça o arco inverso, também pela frente."
        ],
        "right": "front-arc",
        "left": "exit",
        "requirement": "A habilidade Pedaladas/Scissors Feint pode mudar a execução. O desenho mostra o arco, não um círculo completo nem um toque repetido.",
        "use": "Sugerir um lado e observar a reação antes de escolher uma saída.",
        "avoid": "Desenhar o arco por trás, que corresponde a outro gesto, ou repetir pedaladas sem conseguir progredir.",
        "drill": "Treine o arco lentamente para os dois lados. Acrescente somente uma saída curta; observe se ela ocorre longe do defensor.",
        "variants": "A pedalada pode variar com o momento da saída. Não existe aqui uma quantidade fixa de repetições que garanta vencer o duelo.",
        "sources": [
          "finta-touch"
        ]
      },
      {
        "id": "body-feint",
        "name": "Drible de corpo",
        "aliases": "Body Feint, finta corporal, body fake",
        "group": "Base",
        "steps": [
          "D: comece de um lado ↑ e deslize em arco por trás ← até o lado oposto ↓, no contorno de Acelerar.",
          "E: escolha a direção de continuidade. O arco espelhado também passa por trás."
        ],
        "right": "back-arc",
        "left": "exit",
        "requirement": "O arco pela parte de trás diferencia esta seleção da pedalada pela frente. A resposta da animação depende do jogador e do contexto.",
        "use": "Fingir uma mudança de peso e observar se o adversário abriu uma rota de passagem.",
        "avoid": "Fazer o arco pela frente ou acrescentar uma arrancada sem olhar para onde o rival se moveu.",
        "drill": "Alterne um arco pela frente e outro por trás. Diga o nome do gesto que pretende fazer antes de executá-lo.",
        "variants": "Drible de corpo é uma finta; conduzir apenas com o direcional para mudar o ritmo continua sendo outra ferramenta, sem esse arco obrigatório.",
        "sources": [
          "finta-touch"
        ]
      },
      {
        "id": "step-over",
        "name": "Pedalada única",
        "aliases": "Step Over, step-over",
        "group": "Base",
        "steps": [
          "D: deslize Acelerar para a frente →.",
          "E: depois, deslize o direcional na diagonal para trás ↖ ou ↙, cerca de 135° em relação à frente."
        ],
        "right": "front",
        "left": "back-diagonal",
        "requirement": "É a família Step Over da Lista consultada. Não confunda com o arco frontal das Pedaladas; os gestos são distintos.",
        "use": "Mudar a saída para uma diagonal posterior quando isso afasta a bola do marcador.",
        "avoid": "Usar uma diagonal frontal de 45° ou sair para trás sem conferir o espaço e os apoios.",
        "drill": "Marque mentalmente uma frente e duas diagonais posteriores. Faça cinco seleções de cada lado em baixa velocidade.",
        "variants": "O nome pode aparecer em inglês. Use o desenho e o ângulo, além do nome traduzido, para distinguir esta família.",
        "sources": [
          "finta-lista",
          "finta-touch"
        ]
      },
      {
        "id": "chop-turn",
        "name": "Corte com virada",
        "aliases": "Chop Turn, edge turn, corte seco, Ronaldo chop",
        "group": "Base",
        "steps": [
          "D: dê um toque em Acelerar e solte.",
          "E: logo depois, dê um deslize rápido para um lado ↑ ou ↓, a 90° da frente do jogador."
        ],
        "right": "tap",
        "left": "side",
        "requirement": "A carta pode usar uma variação de corte conforme suas habilidades. Se possui Tap Trick, confira a ficha específica desse movimento.",
        "use": "Abandonar a direção anterior quando o corredor lateral ficou mais favorável.",
        "avoid": "Tentar o gesto segurando Acelerar ou cortar diretamente para o segundo defensor.",
        "drill": "Compare a lateral de 90° deste corte com a diagonal de 45° do Elástico. Finalize cada repetição com um toque simples.",
        "variants": "Corte com virada e Toque incisivo não têm o mesmo acionamento. Não substitua um pelo outro por causa do nome popular corte seco.",
        "sources": [
          "finta-lista",
          "finta-touch"
        ]
      },
      {
        "id": "rainbow",
        "name": "Chaleira",
        "aliases": "Rainbow Flick, rainbow, carretilha, chapéu em condução",
        "group": "Base",
        "steps": [
          "D: dê três toques rápidos no botão Acelerar enquanto está com a bola.",
          "E: depois do movimento, direcione a continuidade para o espaço disponível."
        ],
        "right": "triple-tap",
        "left": "exit",
        "requirement": "Três toques são o comando de condução na Lista touchscreen consultada. Chapéu na recepção é outro comando e tem uma ficha própria.",
        "use": "Explorar uma bola levantada quando o duelo e a saída aérea permitem, preferencialmente após aprender o gesto no treino.",
        "avoid": "Usar a contagem de toques de um controle físico ou repetir a chaleira diante de uma cobertura que já domina a bola aérea.",
        "drill": "Faça cinco tentativas sem pressão e confirme três toques separados. Depois avalie onde a bola cai e se você consegue continuar a jogada.",
        "variants": "Não confunda Chaleira/Rainbow em condução com o toque seguido de deslize usado para levantar a bola na recepção.",
        "sources": [
          "finta-lista",
          "finta-touch"
        ]
      },
      {
        "id": "tap-trick",
        "name": "Tap Trick",
        "aliases": "tap trick, habilidade de corte",
        "group": "Habilidade",
        "steps": [
          "D: dê um toque em Acelerar e solte.",
          "E: depois, dê um deslize rápido para um lado ↑ ou ↓, perpendicular à direção do jogador."
        ],
        "right": "tap",
        "left": "side",
        "requirement": "A carta precisa possuir Tap Trick. O mesmo gesto pode produzir um corte comum em uma carta sem essa habilidade; não promete a animação especial para todo jogador.",
        "use": "Comparar a saída lateral específica da carta com o corte comum e decidir qual contexto permite completar a ação.",
        "avoid": "Deduzir que a habilidade está em todas as edições do jogador ou que o movimento impede automaticamente o bote.",
        "drill": "Confira a habilidade na carta. Teste o corte lateral com essa edição e com uma sem Tap Trick, nas mesmas condições, observando espaço e recuperação.",
        "variants": "Demonstração independente, não um teste realizado na sua conta. Não assumimos que a habilidade possa ser adicionada ou transferida.",
        "sources": [
          "tap-demo"
        ]
      },
      {
        "id": "trap-lift",
        "name": "Chapéu e levantamento na recepção",
        "aliases": "Sombrero, Flick, lift trap, levantamento",
        "group": "Recepção",
        "steps": [
          "D: diante de uma bola aérea, ou antes de dominar, toque Acelerar e depois continue deslizando na direção desejada.",
          "E: após a recepção, assuma a direção da próxima ação. O gesto de levantar é no botão Acelerar."
        ],
        "right": "tap-slide",
        "left": "exit",
        "requirement": "Depende da bola recebida, do momento do gesto e das animações da carta. O tutorial consultado não determina uma habilidade obrigatória para todo levantamento.",
        "use": "Escolher uma recepção elevada quando o adversário e o espaço de queda tornam essa alternativa útil.",
        "avoid": "Fazer os três toques da Chaleira em condução ou acionar somente depois de já terminar o domínio.",
        "drill": "Receba cinco bolas sem pressão e comece o gesto antes do domínio. Observe a direção da bola levantada e a possibilidade de continuar.",
        "variants": "A habilidade Chapéu pode afetar recursos da carta. A atualização v5.4 informa que jogadores com essa habilidade deixaram de executar o Chapéu automaticamente.",
        "sources": [
          "finta-recepcao",
          "fintas"
        ]
      },
      {
        "id": "trap-through",
        "name": "Deixar a bola passar na recepção",
        "aliases": "Trap Through, domínio falso, trap feint, corta-luz",
        "group": "Recepção",
        "steps": [
          "D: antes de dominar, continue deslizando Acelerar na direção em que a bola está rolando.",
          "E: retome a condução quando a bola passar. Aqui a referência do gesto é o movimento da bola, não a frente do corpo."
        ],
        "right": "ball-slide",
        "left": "exit",
        "requirement": "A bola precisa estar chegando e o comando precisa anteceder o domínio. A captura consultada não apresenta uma habilidade obrigatória.",
        "use": "Deixar um marcador atacar o ponto do domínio enquanto a bola continua para uma área que você consegue alcançar.",
        "avoid": "Usar automaticamente a seta de frente do jogador quando a bola vem de outro ângulo ou deixar passar para um adversário.",
        "drill": "Comece com passe rasteiro e espaço atrás do recebedor. Siga o sentido real da bola; só acrescente marcação após reconhecer o momento de entrada.",
        "variants": "O desenho usa uma bola rolando para → apenas como exemplo. Mude o gesto para acompanhar a bola real, mesmo se o corpo estiver apontado para outro lado.",
        "sources": [
          "finta-recepcao"
        ]
      }
    ]
  },
  "title": "Jogue com intenção.",
  "subtitle": "Manual de campo · eFootball 2027",
  "edition": "Mobile · botões visíveis",
  "checked": "01/11/2026",
  "schema": "CT_GUIDE_CONTENT_V1",
  "chapters": [
    {
      "id": "olhar",
      "group": "Fundamentos",
      "title": "Antes do toque, leia a jogada",
      "dek": "Sua primeira vantagem nasce antes de apertar um botão.",
      "intro": [
        "Jogar melhor começa por organizar a atenção. Quando a bola viaja para seu jogador, procure três informações: de onde vem a pressão, qual apoio tem uma linha de passe realmente livre e que espaço ficará descoberto se você perder a posse. Não é preciso enxergar o campo inteiro ao mesmo tempo. Escolha uma saída principal e uma alternativa curta. Acelerar, passar ou girar ficam mais simples quando a decisão já começou antes do domínio.",
        "A câmera mostra uma parte da ação; o radar ajuda a localizar o restante. Use-o em momentos de menor pressão, como um passe recuado ou uma cobrança parada, e volte os olhos à bola antes do contato. Um companheiro aparentemente livre pode estar atrás de um marcador que interceptará o caminho. O que importa não é só o destino: é o corredor entre a bola e o destino. Estas são pistas de leitura propostas neste manual, não comandos que obrigam a inteligência artificial a se movimentar."
      ],
      "windows": [
        {
          "signal": "O recebedor ainda vai dominar e há um rival chegando pelo lado direito.",
          "action": "Prepare um apoio à esquerda ou atrás e receba sem pedir uma corrida longa.",
          "avoid": "Escolher o passe somente depois de ficar cercado.",
          "why": "Antecipar uma alternativa reduz a necessidade de um giro desesperado."
        },
        {
          "signal": "Um atacante aparece livre, mas existe um volante no caminho.",
          "action": "Circule por outro apoio e procure mudar o ângulo do passe.",
          "avoid": "Confundir jogador livre com linha de passe livre.",
          "why": "O interceptador ocupa a trajetória, mesmo sem estar colado no atacante."
        },
        {
          "signal": "Você está pressionado e não consegue consultar o radar.",
          "action": "Use a informação visível e um apoio seguro; leia o restante após sair da pressão.",
          "avoid": "Tirar os olhos do lance por tempo demais.",
          "why": "A leitura precisa caber no tempo disponível, não virar outra distração."
        }
      ],
      "sequence": "Antes de receber, localize o rival mais próximo. Identifique um apoio visível. Depois do domínio, confirme se a linha continua aberta; a primeira ideia pode precisar mudar.",
      "mistakes": [
        "Olhar apenas para quem está com a bola: acrescente a observação do próximo recebedor.",
        "Tentar decorar todas as posições: comece pelo triângulo mais próximo e amplie a leitura aos poucos."
      ],
      "exercise": {
        "title": "Duas saídas antes do domínio",
        "setup": "No treino livre ou contra uma IA confortável, use o mesmo time.",
        "steps": [
          "Faça dez recepções sem buscar o gol imediatamente.",
          "Antes de cada uma, diga mentalmente “principal” e “apoio” para duas opções.",
          "Ao receber, confira se o rival fechou a primeira e escolha a segunda quando necessário."
        ],
        "measure": "Conte quantas recepções terminaram sem uma saída pensada.",
        "advance": "Repita com mais pressão quando conseguir localizar as duas opções sem parar de acompanhar a bola."
      },
      "summary": [
        "Leia pressão, apoio e risco.",
        "Uma trajetória aberta vale mais que um nome livre.",
        "Mudar de ideia faz parte da boa decisão."
      ],
      "sources": [
        "mobile",
        "v6"
      ],
      "diagram": "support"
    },
    {
      "id": "controle",
      "group": "Fundamentos",
      "title": "Prepare seus comandos",
      "dek": "Controle padrão, defesa e fintas precisam falar a mesma língua.",
      "intro": [
        "Este guia é para celular por toque, com botões visíveis. Antes de treinar, abra a Lista de comandos da versão instalada e confira o tipo de controle, a configuração de defesa e o tipo de comando de finta. São escolhas diferentes. O modo defensivo Normal introduziu um botão próprio para Marcar de perto; o antigo Estilo de pressão utiliza outros acionamentos. Um tutorial que manda deslizar Pressão pode estar descrevendo uma configuração diferente da sua.",
        "Guarde uma referência dos comandos que você realmente utiliza. Comece com passe normal, profundidade normal, chute normal, acelerar, trocar jogador e marcar. Só acrescente um gesto especial quando conseguir executá-lo deliberadamente no treino. A KONAMI também alterou as fintas no Mobile: Fácil, Inteligente e Avançado selecionam ou diferenciam movimentos de maneiras próprias. Não misture os gestos de um tipo com a expectativa de outro. Ajuste tamanho e posição dos botões se essa opção estiver disponível, buscando conforto e precisão no seu aparelho."
      ],
      "windows": [
        {
          "signal": "Um gesto de vídeo produz outra ação no seu jogo.",
          "action": "Confira o tipo de controle e a Lista de comandos antes de repetir.",
          "avoid": "Aumentar a velocidade do dedo para tentar corrigir uma configuração diferente.",
          "why": "O problema pode estar no mapa de comandos, não na sua habilidade."
        },
        {
          "signal": "Seu dedo encosta no botão vizinho com frequência.",
          "action": "Revise o layout disponível e pratique toques isolados em ambiente sem pressão.",
          "avoid": "Trocar todas as configurações antes de identificar qual toque falha.",
          "why": "Uma mudança pequena fica mais fácil de avaliar."
        },
        {
          "signal": "Você executa o comando simples, mas erra o especial em partida.",
          "action": "Volte ao treino e compare direção, início e fim do gesto.",
          "avoid": "Encadear vários comandos para compensar o primeiro erro.",
          "why": "A sequência precisa de um começo reconhecível para você aprender o que aconteceu."
        }
      ],
      "sequence": "Confira as três configurações. Faça uma execução lenta de cada comando básico. Teste a mesma ação em movimento. Depois acrescente um adversário ou uma partida de treino.",
      "mistakes": [
        "Tratar o manual de controle Bluetooth como instrução de toque: ele descreve outro dispositivo.",
        "Copiar o duplo toque de Toque incisivo de console: a alteração histórica citada excluía iOS e Android."
      ],
      "exercise": {
        "title": "Seu mapa pessoal de comandos",
        "setup": "Use a Lista de comandos do próprio jogo.",
        "steps": [
          "Anote como aciona seis ações básicas na sua configuração.",
          "Execute cada ação cinco vezes sem adversário pressionando.",
          "Marque as falhas como erro de gesto ou erro de decisão; não junte os dois."
        ],
        "measure": "Número de ações que você consegue acionar quando pretende, sem apertar o botão vizinho.",
        "advance": "Passe às fintas especiais somente após estabilizar os comandos simples."
      },
      "summary": [
        "Confira a configuração, não só o nome do controle.",
        "Um botão de cada vez.",
        "A Lista instalada prevalece sobre um tutorial antigo."
      ],
      "sources": [
        "mobile",
        "defesa",
        "fintas",
        "incisivo"
      ],
      "diagram": "control"
    },
    {
      "id": "receber",
      "group": "Fundamentos",
      "title": "Receba para a próxima ação",
      "dek": "O primeiro contato pode abrir ou fechar o seu tempo.",
      "intro": [
        "Receber não é uma pausa entre dois passes: já é parte da jogada. Se o marcador chega por trás e existe apoio à frente, uma devolução simples pode ser mais útil que tentar girar. Se o rival protege o passe frontal, uma recepção orientada para um lado livre pode mudar o ângulo. Evite pedir aceleração longa para dentro de uma zona ocupada. Observe para onde o corpo e a bola estão indo antes de decidir o segundo toque.",
        "Passe de primeira é um recurso, não uma obrigação. Uma bola difícil, um corpo desequilibrado ou um recebedor sob marcação podem tornar um domínio curto a melhor escolha. A habilidade nativa da carta ajuda a caracterizar seus recursos, mas não torna toda tentativa segura. A proteção da bola passou a ser contextual no jogo; não dependa de uma antiga combinação manual de proteção. Aproxime o corpo do lado que protege a bola e mantenha uma saída de apoio possível, sem esperar que o contato seja sempre vencido."
      ],
      "windows": [
        {
          "signal": "Há um rival encostando nas suas costas e um apoio livre de frente.",
          "action": "Considere devolver sem tentar virar para o marcador.",
          "avoid": "Girar por hábito contra o contato.",
          "why": "Você conserva a opção de jogar novamente após mudar o ângulo."
        },
        {
          "signal": "O passe chega forte ou fora do eixo do corpo.",
          "action": "Priorize controlar e reorganizar o próximo passe.",
          "avoid": "Exigir uma devolução de primeira difícil em qualquer posição.",
          "why": "O tempo gasto dominando pode evitar uma perda central perigosa."
        },
        {
          "signal": "Existe espaço lateral e o marcador está avançando em linha reta.",
          "action": "Oriente a recepção para sair dessa linha e confirme o passe seguinte.",
          "avoid": "Transformar o domínio em corrida longa sem olhar a cobertura.",
          "why": "Superar o primeiro rival não garante espaço depois dele."
        }
      ],
      "sequence": "Veja a pressão durante o passe. Escolha devolução ou domínio. Após o contato, confirme a situação: a chegada do segundo rival pode mudar sua decisão.",
      "mistakes": [
        "Acelerar toda vez que recebe: compare uma recepção sem esse comando.",
        "Usar o nome da carta como garantia de proteção: observe a disputa e mantenha uma saída curta."
      ],
      "exercise": {
        "title": "Dominar ou devolver",
        "setup": "Use um volante, um meia e um atacante em trocas curtas.",
        "steps": [
          "Alterne uma devolução de primeira e uma recepção com domínio.",
          "Repare em quais bolas chegam fora do corpo e pedem controle.",
          "Em partida, conte as perdas causadas por tentar girar de costas."
        ],
        "measure": "Perdas por giro pressionado e devoluções que encontram o apoio.",
        "advance": "Aumente a velocidade da circulação preservando a escolha consciente."
      },
      "summary": [
        "Receba pensando no passe seguinte.",
        "Primeira opção não significa passe de primeira.",
        "Proteção contextual não elimina a pressão."
      ],
      "sources": [
        "protecao",
        "mobile"
      ],
      "diagram": "receive"
    },
    {
      "id": "passe",
      "group": "Com a bola",
      "title": "O momento de tocar",
      "dek": "Passe para uma vantagem que ainda existe.",
      "intro": [
        "O passe normal é a base para circular, atrair um adversário e preparar a próxima ação. O momento costuma surgir quando o marcador se compromete com o portador e a linha para o apoio continua aberta. Tocar cedo demais pode entregar a bola a um colega ainda marcado; esperar demais pode fechar a janela. Repare no deslocamento do defensor e no corpo de quem vai receber, em vez de olhar apenas para a distância entre seus jogadores.",
        "O caminho de volta também é passe de ataque. Ao devolver para um volante ou zagueiro livre, você pode obrigar a marcação a reorganizar sua direção e criar outro ângulo para avançar. Isso exige circulação com intenção: identifique o próximo setor a explorar, sem recuar automaticamente até o goleiro. No toque na tela, escolha a direção com cuidado e use o comando que a sua Lista apresenta para o passe normal. Ajuste a força no treino conforme a distância; este manual não prescreve uma barra universal para todos os jogadores, bolas e situações."
      ],
      "windows": [
        {
          "signal": "O rival abandona o apoio para pressionar seu portador.",
          "action": "Toque para o apoio antes de a linha fechar e acompanhe a próxima recepção.",
          "avoid": "Conduzir até encostar no rival quando a saída já apareceu.",
          "why": "A movimentação do adversário abriu uma janela que pode ser breve."
        },
        {
          "signal": "O colega está livre, mas de costas para um marcador muito próximo.",
          "action": "Avalie uma devolução combinada ou escolha um apoio menos pressionado.",
          "avoid": "Contar apenas o espaço entre o colega e o rival.",
          "why": "A posição corporal muda a qualidade da próxima ação."
        },
        {
          "signal": "Todos os passes para a frente estão interceptáveis.",
          "action": "Recicle por um apoio seguro e procure um ângulo diferente.",
          "avoid": "Repetir a mesma tentativa vertical fechada.",
          "why": "Conservar a bola permite construir uma vantagem nova."
        }
      ],
      "sequence": "Atraia um marcador sem perder o controle. Toque para o apoio que ele liberou. Procure o terceiro jogador após a devolução; não repita a mesma linha se ela foi fechada.",
      "mistakes": [
        "Usar força alta por ansiedade: teste distâncias diferentes no treino.",
        "Passar para a posição antiga do companheiro: acompanhe seu deslocamento durante a preparação."
      ],
      "exercise": {
        "title": "Passar depois de atrair",
        "setup": "Jogue uma sessão curta sem obrigação de atacar rapidamente.",
        "steps": [
          "Antes de passar, observe qual rival se moveu em direção à bola.",
          "Use o espaço que esse movimento liberou.",
          "Quando não houver vantagem, recicle e recomece em outro ângulo."
        ],
        "measure": "Conte passes centrais interceptados e quantos tinham uma alternativa simples.",
        "advance": "Acrescente passes mais longos quando a circulação curta deixar de ser apressada."
      },
      "summary": [
        "Toque enquanto a linha está aberta.",
        "A força depende do contexto.",
        "Recuar pode preparar o avanço."
      ],
      "sources": [
        "mobile"
      ],
      "diagram": "pass"
    },
    {
      "id": "profundidade",
      "group": "Com a bola",
      "title": "Passe no espaço, no tempo certo",
      "dek": "Encontre a corrida; não procure um botão salvador.",
      "intro": [
        "O passe em profundidade busca o espaço para a corrida do companheiro. Leia três elementos juntos: o começo da corrida, a posição da última linha e a trajetória livre até a zona de recepção. Um atacante veloz não atravessa automaticamente um defensor bem posicionado. Se a cobertura já ocupa o espaço, um passe nos pés ou uma tabela pode ser o caminho para deslocá-la antes de tentar a ruptura.",
        "Procure executar a ação antes de o corredor desaparecer, respeitando o impedimento e a orientação do passador. Não existe um instante fixo que sirva para toda corrida. Uma bola aérea também não resolve qualquer defesa: ela dá outro trajeto à jogada, mas exige leitura do goleiro, espaço de queda e disputa na chegada. A versão fenomenal exige preparação adicional e pode ser inadequada sob pressão. Pratique a leitura com o comando normal antes de comparar variações."
      ],
      "windows": [
        {
          "signal": "O atacante começa a corrida e há um corredor livre atrás da linha.",
          "action": "Considere o passe no espaço enquanto ele ainda pode alcançar a zona de recepção.",
          "avoid": "Esperar até o atacante estar escondido atrás do zagueiro ou impedido.",
          "why": "O destino precisa continuar jogável quando a bola chegar."
        },
        {
          "signal": "O zagueiro recua e já protege a profundidade.",
          "action": "Passe nos pés ou combine com o meia para fazê-lo decidir novamente.",
          "avoid": "Insistir no lançamento contra a cobertura preparada.",
          "why": "O passe curto pode criar a corrida que ainda não existe."
        },
        {
          "signal": "Seu passador está sendo pressionado e sem tempo para preparar.",
          "action": "Use uma ação simples compatível com a linha disponível.",
          "avoid": "Carregar um passe fenomenal enquanto o rival encurta.",
          "why": "Um comando mais demorado pode perder a janela da jogada."
        }
      ],
      "sequence": "Identifique a corrida. Confira impedimento e cobertura. Escolha chão ou ar conforme a trajetória e confirme se o recebedor tem vantagem na chegada.",
      "mistakes": [
        "Apertar profundidade sempre que recupera: observe primeiro quem está disponível.",
        "Tentar compensar impedimento com mais força: o passe precisa respeitar a posição do atacante."
      ],
      "exercise": {
        "title": "Pés ou espaço",
        "setup": "Mantenha o mesmo atacante para aprender seu padrão de deslocamento.",
        "steps": [
          "Faça uma jogada com passe nos pés e outra esperando uma corrida.",
          "Anote se a tentativa falhou por impedimento, cobertura ou execução.",
          "Procure a devolução do meia antes de repetir a ruptura."
        ],
        "measure": "Tentativas que realmente criaram recepção vantajosa, e não apenas bolas lançadas.",
        "advance": "Compare a versão aérea depois de reconhecer as janelas rasteiras."
      },
      "summary": [
        "Corrida e corredor precisam coincidir.",
        "Um zagueiro recuando pede outra pergunta.",
        "A versão especial não substitui a leitura."
      ],
      "sources": [
        "mobile",
        "v6"
      ],
      "diagram": "through"
    },
    {
      "id": "triangulos",
      "group": "Com a bola",
      "title": "Crie pelo centro",
      "dek": "Use três jogadores para mudar a pergunta da defesa.",
      "intro": [
        "Um triângulo é uma relação de apoios, não uma figura que fica parada. Um volante, um meia e um atacante podem se aproximar em distâncias diferentes para oferecer devolução e passe vertical. O importante é não colocar todos na mesma linha de marcação. Quando o rival fecha o passe direto, a bola pode chegar ao destino por um terceiro jogador. Isso é especialmente útil para quem prefere construir pelo centro.",
        "Jogar pelo meio não significa recusar todo apoio de lateral. Um lateral pode servir como saída temporária e devolver para dentro, ajudando a mudar o ângulo sem transformar o plano em cruzamentos. Observe também quem fica atrás da bola. Se todos avançam ao mesmo tempo, uma perda pode deixar o adversário de frente para sua defesa. Crie apoio perto do portador, opção na frente e uma referência de segurança, adaptando as distâncias ao posicionamento do adversário."
      ],
      "windows": [
        {
          "signal": "O passe do volante para o atacante está fechado, mas o meia tem linha livre.",
          "action": "Use o meia como terceiro homem para mudar o ângulo de entrada.",
          "avoid": "Forçar a bola por dentro do interceptador.",
          "why": "O segundo passe pode abrir uma trajetória que o primeiro não tinha."
        },
        {
          "signal": "Seu atacante recebe de costas e o meia acompanha a jogada.",
          "action": "Considere devolver e procurar o espaço aberto pela movimentação da zaga.",
          "avoid": "Tentar girar entre dois defensores em toda recepção.",
          "why": "A devolução pode colocar outro jogador de frente para a área."
        },
        {
          "signal": "A pressão central está muito apertada e o lateral está livre.",
          "action": "Use o apoio lateral como ponte para voltar por dentro.",
          "avoid": "Tratar qualquer passe ao lado como abandono do seu estilo.",
          "why": "Amplitude temporária pode reabrir o corredor central."
        }
      ],
      "sequence": "Volante encontra o meia. Meia serve o atacante. Atacante devolve para quem vem de frente. Se a defesa fechar esse caminho, recicle e reconstrua o triângulo em outro ângulo.",
      "mistakes": [
        "Confundir tabela com correr para a frente em toda jogada: observe a cobertura.",
        "Aproximar todos da bola: preserve uma referência de proteção e alguém oferecendo profundidade."
      ],
      "exercise": {
        "title": "O terceiro homem",
        "setup": "Treine em uma formação central já conhecida.",
        "steps": [
          "Procure três jogadores em alturas diferentes.",
          "Faça uma devolução e encontre um recebedor diferente do passador inicial.",
          "Após cada perda, confira quem ficou protegendo o centro."
        ],
        "measure": "Jogadas em que o terceiro passe encontra alguém de frente para a defesa.",
        "advance": "Adicione a infiltração somente quando a circulação estiver controlada."
      },
      "summary": [
        "Três apoios, alturas diferentes.",
        "O lateral pode ser uma ponte.",
        "Quem protege também participa do ataque."
      ],
      "sources": [
        "v6",
        "mobile"
      ],
      "diagram": "triangle"
    },
    {
      "id": "ritmo",
      "group": "Com a bola",
      "title": "Acelere para ocupar espaço",
      "dek": "Velocidade útil é velocidade com destino.",
      "intro": [
        "Acelerar é uma decisão sobre o espaço que você vai ocupar. Vale comparar três situações: correr para uma zona realmente livre, conduzir em ritmo menor perto de um marcador e desacelerar para receber ou mudar de direção. Pedir velocidade sem espaço pode aproximar a bola da cobertura adversária e reduzir suas opções de correção. Não se trata de jogar sempre devagar; trata-se de mudar o ritmo quando a jogada pede.",
        "Depois de superar um marcador, olhe o próximo. Uma aceleração curta pode bastar para abrir o passe ou o chute, sem exigir que você percorra todo o corredor. O Toque incisivo adianta a bola e precisa de espaço para ser perseguido. Confira seu acionamento no Mobile: uma mudança de comando publicada para outras plataformas excluía iOS e Android. Não acrescente um gesto de console ao seu treino por semelhança de nome. Desacelerar antes de uma decisão difícil é uma proposta de treino deste manual, não uma regra que torna toda ação mais precisa automaticamente."
      ],
      "windows": [
        {
          "signal": "Você superou o primeiro rival e não há cobertura perto do destino.",
          "action": "Use a aceleração para ocupar a vantagem e volte a ler o campo.",
          "avoid": "Continuar no mesmo ritmo até entrar em outra disputa sem perceber.",
          "why": "A primeira vantagem pode desaparecer com a chegada do segundo defensor."
        },
        {
          "signal": "O recebedor vai dominar entre dois adversários.",
          "action": "Reduza a pressa do comando e procure controle ou devolução.",
          "avoid": "Pedir corrida longa antes de saber onde está a saída.",
          "why": "O espaço disponível é menor que uma condução de ruptura."
        },
        {
          "signal": "O rival se aproxima em linha reta e você tem uma saída lateral.",
          "action": "Compare uma mudança de direção curta antes de acelerar na nova linha.",
          "avoid": "Usar Toque incisivo em direção a um defensor que já espera a bola.",
          "why": "Adiantar a bola só ajuda quando você pode chegar ao espaço antes da cobertura."
        }
      ],
      "sequence": "Conduza para observar. Mude o ritmo quando aparecer espaço. Desacelere para reorganizar a próxima ação se a cobertura fechar o caminho.",
      "mistakes": [
        "Confundir rapidez de decisão com segurar Acelerar: uma decisão rápida também pode ser um passe simples.",
        "Usar a mesma força de direção em toda recepção: treine saídas curtas e corridas separadamente."
      ],
      "exercise": {
        "title": "Três ritmos",
        "setup": "Escolha um portador conhecido e um corredor lateral ou central no treino.",
        "steps": [
          "Conduza em ritmo controlado até um ponto de referência.",
          "Acelere por um trecho livre e interrompa antes da zona congestionada.",
          "Faça um passe simples após desacelerar e repita do outro lado."
        ],
        "measure": "Perdas que ocorreram depois de ocupar um espaço que já tinha cobertura.",
        "advance": "Leve o exercício para partidas mantendo a leitura do segundo marcador."
      },
      "summary": [
        "Acelere para um espaço.",
        "Olhe a segunda cobertura.",
        "Ritmo é uma ferramenta de decisão."
      ],
      "sources": [
        "mobile",
        "incisivo"
      ],
      "diagram": "dash"
    },
    {
      "id": "drible",
      "group": "Com a bola",
      "title": "Drible para sair de um problema",
      "dek": "Uma mudança útil vale mais que uma sequência decorada.",
      "intro": [
        "O drible tem finalidade: escapar de uma pressão, mudar o ângulo do passe ou abrir uma finalização. Antes de tentar a finta, identifique para onde sairá se ela funcionar. Se o primeiro defensor for superado e o segundo já estiver naquele destino, talvez um passe seja melhor. Um movimento simples de direção ou uma pausa pode resolver uma situação sem exigir um recurso especial.",
        "As fintas dependem do tipo de comando ativo e dos recursos da carta. No Mobile, Fácil, Inteligente e Avançado não devem ser tratados como mapas idênticos. Use a Lista instalada para aprender o gesto e repita o mesmo movimento em condições reconhecíveis. Não copie a execução de um criador que usa outro controle. Sob pressão nas proximidades da própria área, o custo de uma perda cresce; isso muda a escolha mesmo quando você sabe executar a finta. A proteção automática contextual não transforma um giro contra vários rivais em ação segura."
      ],
      "windows": [
        {
          "signal": "Um rival avança sem cobertura e há uma saída livre ao lado.",
          "action": "Compare uma mudança curta de direção ou uma finta conhecida para sair dessa linha.",
          "avoid": "Adicionar outro drible depois de abrir o passe.",
          "why": "A finalidade já pode ter sido alcançada após o primeiro movimento."
        },
        {
          "signal": "Dois rivais fecham o portador e existe um apoio livre.",
          "action": "Use o apoio para sair da zona de pressão.",
          "avoid": "Tratar a presença de dois marcadores como convite obrigatório para driblar.",
          "why": "O espaço liberado por eles pode ser melhor explorado pelo passe."
        },
        {
          "signal": "Você vai tentar uma finta perto da sua área.",
          "action": "Avalie a linha de passe e a consequência da perda antes de executar.",
          "avoid": "Usar a mesma escolha que faria perto da área adversária.",
          "why": "A posição da bola muda o risco que vale assumir."
        }
      ],
      "sequence": "Veja o rival. Escolha a saída. Execute um movimento conhecido. Assim que abrir a vantagem, passe, chute ou acelere para um destino livre.",
      "mistakes": [
        "Treinar várias fintas ao mesmo tempo: estabilize uma e aprenda quando ela é útil.",
        "Avaliar o drible só pela animação: observe se a próxima ação ficou realmente melhor."
      ],
      "exercise": {
        "title": "Uma finta, uma finalidade",
        "setup": "Escolha uma finta disponível na sua configuração e na carta.",
        "steps": [
          "Repita o gesto no treino para reconhecer a execução.",
          "Defina uma saída e faça um passe logo após a finta.",
          "Em partida, use a finta somente quando conseguir nomear o problema que ela resolve."
        ],
        "measure": "Dribles que criaram passe, chute ou espaço útil; registre também as perdas.",
        "advance": "Acrescente outra finta quando a primeira tiver uso claro e execução consistente."
      },
      "summary": [
        "Tenha uma saída antes da finta.",
        "Não confunda tipo de finta com assistência.",
        "A vantagem precisa continuar depois do drible."
      ],
      "sources": [
        "fintas",
        "protecao"
      ],
      "diagram": "dribble"
    },
    {
      "id": "chute",
      "group": "Com a bola",
      "title": "Chute quando a janela existe",
      "dek": "Leia corpo, bloqueio e goleiro antes da força.",
      "intro": [
        "A oportunidade de chutar depende do espaço até o gol, da orientação do corpo, da bola disponível para o contato e da posição do defensor que pode bloquear. Um chute simples dentro de uma janela aberta pode ser mais útil que preparar uma finalização especial com o rival chegando. Também pode ser melhor fazer um passe curto se ele deixar o companheiro com uma oportunidade claramente superior. Isso não significa procurar um gol perfeito em toda jogada: a janela atual pode ser a melhor que você terá.",
        "Não existe uma porcentagem de barra universal para marcar. Distância, tipo de chute, jogador, pé usado, pressão e situação da bola mudam a ação. O chute de primeira também exige leitura da trajetória e do corpo; não deve ser solicitado só porque a carta possui a habilidade. No treino, comece com chute normal de posições semelhantes, compare o resultado e só depois varie o tipo. Procure compreender por que um arremate foi bloqueado ou saiu ruim antes de concluir que falta trocar a carta."
      ],
      "windows": [
        {
          "signal": "O atacante recebe de frente, com caminho aberto e o defensor se aproximando.",
          "action": "Considere finalizar enquanto a janela existe, usando uma ação que caiba nesse tempo.",
          "avoid": "Atrasar para preparar um comando especial sem espaço.",
          "why": "O tempo de preparação pode permitir o bloqueio."
        },
        {
          "signal": "O zagueiro cobre o chute, mas seu companheiro tem uma linha livre ao lado.",
          "action": "Compare o passe curto que melhora o ângulo da finalização.",
          "avoid": "Bater repetidamente no mesmo bloqueio visível.",
          "why": "Mudar o portador pode deslocar a linha que estava fechada."
        },
        {
          "signal": "O corpo está girando e a bola ainda não chegou ao contato desejado.",
          "action": "Avalie dominar, ajustar ou devolver conforme a pressão.",
          "avoid": "Exigir uma finalização limpa de qualquer postura.",
          "why": "A escolha precisa considerar a condição real do recebedor."
        }
      ],
      "sequence": "Confira a linha até o gol. Observe corpo e marcador. Escolha finalizar agora ou melhorar a oportunidade com um passe. Depois analise a qualidade da chance, além do placar.",
      "mistakes": [
        "Chutar forte para compensar ângulo fechado: procure comparar outras decisões no mesmo local.",
        "Julgar uma chance só por ter virado gol: um acerto difícil não torna a escolha sempre repetível."
      ],
      "exercise": {
        "title": "Uma posição, decisões diferentes",
        "setup": "Use o mesmo atacante em uma zona próxima da área.",
        "steps": [
          "Faça finalizações normais de posições semelhantes.",
          "Compare o resultado com e sem um ajuste curto de corpo.",
          "Em partida, conte bloqueios visíveis antes do chute e passes que melhoraram a chance."
        ],
        "measure": "Chances limpas criadas e chutes bloqueados que poderiam ter sido evitados.",
        "advance": "Acrescente variações quando conseguir reconhecer a janela do chute normal."
      },
      "summary": [
        "A janela vem antes da força.",
        "Não há barra mágica.",
        "A carta participa; a situação também."
      ],
      "sources": [
        "mobile",
        "v6"
      ],
      "diagram": "shoot"
    },
    {
      "id": "especiais",
      "group": "Com a bola",
      "title": "Use o especial com propósito",
      "dek": "Fenomenal, controlado, cavadinha e finta de chute são escolhas.",
      "intro": [
        "O comando fenomenal pede preparação. Use-o para comparar um passe ou chute com tempo e trajetória favoráveis, não como substituto automático da versão normal. Sob pressão próxima, a preparação pode entregar a bola ao marcador. Um chute controlado pode ser uma alternativa quando você pretende privilegiar uma trajetória e um ângulo de finalização; a execução disponível deve ser conferida na Lista de comandos do seu Mobile. Este guia não inventa um gesto atual para preencher uma lacuna documental.",
        "A cavadinha exige leitura do goleiro e do tempo de chegada da defesa. Um goleiro um pouco adiantado não significa que qualquer cobertura passará por cima dele. A finta de chute pode provocar uma reação e mudar o ângulo, mas o rival pode esperar ou a cobertura pode chegar. Escolha um recurso especial por vez para o treino, anote a configuração e compare com a ação normal da mesma situação. O nome do comando fenomenal também não é o nome de toda habilidade especial da carta: executar o gesto não equipa uma habilidade que ela não possui."
      ],
      "windows": [
        {
          "signal": "Você tem espaço e tempo para preparar uma ação mais demorada.",
          "action": "Compare o fenomenal com o normal e observe se a preparação cabe na jogada.",
          "avoid": "Usar o especial por hábito quando o rival já pode chegar.",
          "why": "Uma ação mais potente pode ter um custo de tempo."
        },
        {
          "signal": "O goleiro sai e há uma oportunidade de cobertura com trajetória livre.",
          "action": "Considere a cavadinha se souber executar e houver espaço para a bola passar.",
          "avoid": "Escolher cobertura apenas porque viu o goleiro longe da linha.",
          "why": "Distância, postura e cobertura dos defensores continuam importando."
        },
        {
          "signal": "O defensor se prepara para bloquear e existe saída depois de uma finta.",
          "action": "Compare uma finta de chute conhecida e conclua a jogada assim que abrir o ângulo.",
          "avoid": "Repetir fintas sem uma ação seguinte.",
          "why": "O movimento precisa criar uma vantagem aproveitável."
        }
      ],
      "sequence": "Reconheça a situação. Confira se há tempo de execução. Escolha um recurso que você já praticou. Se a janela fechar, uma ação simples continua disponível.",
      "mistakes": [
        "Copiar gestos de controle físico: confirme a versão de toque na Lista instalada.",
        "Usar habilidade da carta e comando com o mesmo nome como se fossem a mesma coisa: confira os dois separadamente."
      ],
      "exercise": {
        "title": "Comparação do especial",
        "setup": "Escolha um único comando especial confirmado no seu jogo.",
        "steps": [
          "Registre seu tipo de controle e configuração relevante.",
          "Compare cinco execuções normais e cinco especiais de posição semelhante.",
          "Depois acrescente pressão e observe se ainda existe tempo para preparar."
        ],
        "measure": "Identifique em quais situações o especial ajudou e em quais custou a posse.",
        "advance": "Leve para partidas somente a variação que você consegue escolher conscientemente."
      },
      "summary": [
        "Especial precisa de contexto.",
        "Preparação custa tempo.",
        "Comando e habilidade são informações distintas."
      ],
      "sources": [
        "mobile",
        "fintas",
        "v6"
      ],
      "diagram": "special"
    },
    {
      "id": "perda",
      "group": "Sem a bola",
      "title": "Os primeiros instantes após perder",
      "dek": "Proteja o perigo antes de perseguir a bola.",
      "intro": [
        "Na perda, faça uma leitura rápida: o adversário pode progredir imediatamente pelo centro? Quem está oferecendo a corrida mais perigosa? Seu jogador mais próximo tem condição de pressionar sem liberar um passe ainda mais fácil? Não existe uma resposta única para toda perda. Quando o rival já está de frente e seus apoios estão atrás da bola, recuar para fechar o caminho pode ser mais útil que tentar um bote atrasado.",
        "Trocar o cursor é escolher qual tarefa você assumirá manualmente. Muitas vezes, um meia ou volante pode fechar o passe enquanto os zagueiros conservam a linha. Se a ruptura já ameaça a última linha, pode ser necessário assumir o defensor que acompanha a corrida. Não transforme a orientação de preservar a zaga em regra de nunca controlar um zagueiro. O objetivo é evitar uma saída desnecessária e, ao mesmo tempo, responder ao perigo real que a inteligência artificial talvez não cubra como você precisa."
      ],
      "windows": [
        {
          "signal": "O rival recupera de costas, perto de dois jogadores seus, com saídas fechadas.",
          "action": "Compare uma pressão curta e coordenada, acompanhando o passe de escape.",
          "avoid": "Continuar pressionando depois de ele superar a primeira barreira.",
          "why": "A vantagem inicial pode acabar assim que ele vira ou encontra o apoio."
        },
        {
          "signal": "O adversário recupera de frente e seu time está aberto.",
          "action": "Recupere uma posição que feche a progressão mais perigosa.",
          "avoid": "Puxar o zagueiro para longe da linha apenas para perseguir o portador.",
          "why": "Ganhar tempo permite que os companheiros voltem à organização."
        },
        {
          "signal": "Um atacante rompe atrás da zaga e o passador tem tempo.",
          "action": "Assuma a tarefa de acompanhar a corrida com o defensor adequado.",
          "avoid": "Ficar preso a um volante que não pode mais alcançar esse perigo.",
          "why": "A prioridade passou a ser proteger a profundidade."
        }
      ],
      "sequence": "Perdeu: veja direção do rival. Escolha pressão possível ou proteção do corredor. Troque o cursor para a tarefa mais urgente e reveja a decisão após o primeiro passe adversário.",
      "mistakes": [
        "Pressionar por frustração após perder: identifique a rota perigosa antes do comando.",
        "Confiar que a mesma cobertura funcionará sempre: confira o posicionamento real a cada transição."
      ],
      "exercise": {
        "title": "Pressionar ou proteger",
        "setup": "Nas próximas partidas, observe uma única perda de cada vez.",
        "steps": [
          "Após perder, pergunte se o portador está de frente ou de costas.",
          "Escolha uma tarefa e evite trocar o cursor várias vezes sem propósito.",
          "Reveja as transições em que a zaga ficou exposta."
        ],
        "measure": "Gols e chances sofridos logo após a perda; anote qual espaço ficou aberto.",
        "advance": "Acrescente pressão de companheiro somente quando sua própria cobertura estiver definida."
      },
      "summary": [
        "Perder pede uma nova leitura.",
        "A prioridade pode ser ganhar tempo.",
        "Cursor escolhe a tarefa manual."
      ],
      "sources": [
        "defesa",
        "v6"
      ],
      "diagram": "transition"
    },
    {
      "id": "defender",
      "group": "Sem a bola",
      "title": "Defenda o caminho até o gol",
      "dek": "Distância, orientação e momento do confronto.",
      "intro": [
        "Defender exige alternar aproximação, contenção e recuperação. Marcar de perto ajuda a se posicionar para bloqueios, mas não substitui perseguir uma corrida quando o adversário já passou. Pressão aproxima o defensor do portador; use-a considerando o espaço que você deixará e a opção de passe que o rival quer liberar. Se você controla um jogador entre a bola e o gol, tente reduzir a vantagem do ataque sem oferecer um lado fácil por uma investida precipitada.",
        "A configuração defensiva precisa estar clara. No Mobile com defesa Normal existe um botão dedicado de Marcar de perto; o antigo Estilo de pressão possui outro mapa de acionamentos. Este manual usa os nomes das ações para explicar a decisão e reserva o gesto à sua Lista de comandos. O jogo também recebe ajustes de bloqueio e reação: uma orientação editorial não assegura uma interceptação. Corpo, distância, recursos da carta, direção do passe e sua escolha de cursor continuam fazendo parte da situação."
      ],
      "windows": [
        {
          "signal": "O rival conduz de frente para você, com opções de passe próximas.",
          "action": "Controle a distância e tente ficar entre a bola e a opção mais perigosa.",
          "avoid": "Avançar em linha reta sem observar o passe que ficará livre.",
          "why": "A ameaça pode estar no companheiro do portador, não no drible."
        },
        {
          "signal": "Você está de frente para o possível chute ou passe e pode bloquear.",
          "action": "Considere Marcar de perto enquanto ajusta sua posição.",
          "avoid": "Esperar que o comando corrija sozinho um posicionamento distante.",
          "why": "O comando serve à posição que você constrói."
        },
        {
          "signal": "O atacante já passou e vai ocupar um espaço atrás de você.",
          "action": "Recupere a corrida ou troque para o jogador capaz de cobrir.",
          "avoid": "Permanecer contendo um jogador que já está fora do seu alcance.",
          "why": "A tarefa mudou de bloquear para recuperar o espaço."
        }
      ],
      "sequence": "Aproxime com controle. Proteja o caminho mais perigoso. Confronte quando o rival expuser a bola ou ficar sem uma saída melhor; se for superado, mude a tarefa para recuperação.",
      "mistakes": [
        "Segurar um único comando durante toda a defesa: alterne conforme a posição da jogada.",
        "Trocar para o jogador mais próximo sem pensar na rota: escolha quem pode executar a tarefa necessária."
      ],
      "exercise": {
        "title": "Uma linha de passe",
        "setup": "Em treino contra IA, concentre a observação no passe central.",
        "steps": [
          "Escolha um marcador e tente fechar uma trajetória sem dar o bote imediatamente.",
          "Acompanhe como o adversário busca outra saída.",
          "Compare quando conter preservou a linha e quando era preciso recuperar em corrida."
        ],
        "measure": "Passes centrais cedidos enquanto você perseguia outra ação.",
        "advance": "Aumente a pressão adversária quando conseguir alternar contenção e recuperação."
      },
      "summary": [
        "Comando acompanha a tarefa.",
        "Feche o perigo, não só a bola.",
        "Recupere a corrida quando a contenção terminar."
      ],
      "sources": [
        "defesa",
        "mobile",
        "v6"
      ],
      "diagram": "defend"
    },
    {
      "id": "cobertura",
      "group": "Sem a bola",
      "title": "Pressão e cobertura trabalham juntas",
      "dek": "Chamar ajuda também movimenta uma peça do seu time.",
      "intro": [
        "Pedir para pressionar pode aproximar um companheiro do portador. A pergunta seguinte é quem protege o espaço de onde ele saiu. Use a ajuda quando você consegue assumir uma linha de passe ou manter uma cobertura relevante. O comando não deve ser um reflexo para qualquer situação difícil. Se o rival atrai dois jogadores e encontra um terceiro livre, sua pressão pode ter criado a solução para ele.",
        "Uma bola nas costas costuma começar antes do passe final. Observe o momento em que um lateral avança, um volante sai para confrontar ou um zagueiro acompanha alguém longe da linha. Às vezes o problema será sua intervenção; em outras, a organização escolhida deixa uma cobertura difícil. Separe os dois casos. A correção pode ser trocar o cursor no momento certo, ajustar uma instrução ou escolher um jogador com outra tarefa, sem reformular o time inteiro após cada gol sofrido."
      ],
      "windows": [
        {
          "signal": "Um companheiro pode pressionar e você controla a linha de passe de escape.",
          "action": "Compare chamar a ajuda mantendo essa cobertura.",
          "avoid": "Correr também para a bola e abandonar a linha que você protegia.",
          "why": "A utilidade da pressão depende de não liberar uma saída ainda melhor."
        },
        {
          "signal": "O lateral está adiantado e um adversário começa uma corrida naquele corredor.",
          "action": "Proteja o espaço e confira quem pode acompanhar a ruptura.",
          "avoid": "Esperar o lançamento acontecer para procurar o corredor.",
          "why": "A preparação da defesa começa durante o deslocamento."
        },
        {
          "signal": "O rival já superou a pressão de dois jogadores.",
          "action": "Pare de insistir no mesmo cerco e reorganize a proteção.",
          "avoid": "Chamar outra peça sem uma cobertura definida.",
          "why": "Cada ajuda pode abrir mais um espaço no bloco."
        }
      ],
      "sequence": "Veja quem sairá para pressionar. Assuma uma cobertura concreta. Observe o passe de escape. Se o cerco perder vantagem, mude para recuperação e organização.",
      "mistakes": [
        "Dois jogadores na bola por hábito: use a segunda peça para proteger uma opção.",
        "Culpar a carta por toda bola nas costas: confira a movimentação anterior ao passe."
      ],
      "exercise": {
        "title": "O espaço de quem saiu",
        "setup": "Analise as transições de uma sessão curta.",
        "steps": [
          "Escolha uma jogada em que chamou pressão de companheiro.",
          "Identifique o espaço que ele deixou e quem deveria protegê-lo.",
          "Na próxima situação semelhante, compare uma cobertura antes de chamar ajuda."
        ],
        "measure": "Chances sofridas pelo espaço liberado pela própria pressão.",
        "advance": "Acrescente novas instruções só depois de reconhecer esse padrão."
      },
      "summary": [
        "Ajuda move uma peça.",
        "Cobertura precisa de um responsável.",
        "O perigo começa antes do lançamento."
      ],
      "sources": [
        "mobile",
        "defesa",
        "v6"
      ],
      "diagram": "cover"
    },
    {
      "id": "recuar",
      "group": "Fundamentos",
      "title": "Voltar sem entregar o controle",
      "dek": "Recuar pode reorganizar o ataque ou proteger a defesa.",
      "intro": [
        "Há dois recuos diferentes. Com a bola, você pode devolver a um apoio para escapar da pressão e criar outro ângulo. Sem a bola, pode recuperar uma posição entre o rival e o gol. Em ambos, o recuo deve resolver um problema identificável. Repetir passes para trás sem procurar saída permite que a pressão se aproxime; correr para o próprio gol sem observar o portador pode deixar um chute ou passe simples livre.",
        "Ao recuar com a posse, confira a trajetória e a posição de quem recebe. Um passe para o goleiro sob pressão também tem risco. Se não houver uma saída curta confiável perto da sua área, uma ação de segurança pode ser mais adequada que insistir numa construção apertada. Ao defender, observe bola e corrida alternadamente: sua direção de recuperação deve responder ao perigo, não apenas à distância até o gol. Não use recuos repetitivos como promessa de controlar qualquer adversário nem como estratégia de impedir que a partida aconteça."
      ],
      "windows": [
        {
          "signal": "A linha para a frente está fechada e existe um apoio atrás sem pressão imediata.",
          "action": "Recicle para ele e prepare um ângulo diferente de progressão.",
          "avoid": "Voltar a bola e ficar parado, sem oferecer a próxima opção.",
          "why": "O recuo só reorganiza quando a equipe continua participando."
        },
        {
          "signal": "Você está na própria área e o passe curto está arriscado.",
          "action": "Compare uma ação de segurança para tirar a bola da zona de maior perigo.",
          "avoid": "Forçar uma saída curta apenas para manter a posse.",
          "why": "O custo da perda pode superar o valor daquela construção."
        },
        {
          "signal": "Seu defensor precisa recuperar, mas o portador também ameaça finalizar.",
          "action": "Escolha uma rota que proteja a ameaça mais imediata e troque a tarefa se necessário.",
          "avoid": "Recuar automaticamente até a linha do gol.",
          "why": "Ganhar posição exige continuar lendo bola e adversários."
        }
      ],
      "sequence": "Identifique por que está voltando. Confira o apoio ou a ameaça. Recue para uma posição útil e prepare a ação seguinte; segurança não significa encerrar a leitura.",
      "mistakes": [
        "Achar que todo passe para trás é erro: avalie o que a devolução abriu.",
        "Achar que todo passe para trás é seguro: confira pressão e trajetória."
      ],
      "exercise": {
        "title": "Recuo com propósito",
        "setup": "Mantenha um plano central conhecido.",
        "steps": [
          "Quando devolver, diga qual linha você pretende abrir em seguida.",
          "Observe se você oferece apoio após o passe.",
          "Sem a bola, revise um lance em que recuar evitou uma ruptura e outro em que deixou o rival livre."
        ],
        "measure": "Recuos que abriram uma saída e recuos que apenas transferiram a pressão.",
        "advance": "Misture circulação e progressão quando a devolução tiver uma intenção reconhecível."
      },
      "summary": [
        "Recuar também é decidir.",
        "Confira o risco perto do seu gol.",
        "Uma posição útil prepara a próxima ação."
      ],
      "sources": [
        "mobile",
        "v6"
      ],
      "diagram": "recycle"
    },
    {
      "id": "time",
      "group": "Time e treino",
      "title": "Monte funções que se completam",
      "dek": "Seu onze precisa resolver problemas diferentes.",
      "intro": [
        "Comece pelas tarefas: quem protege a frente da zaga, quem aproxima para circular, quem oferece profundidade e quem acompanha a perda? Uma formação central pode usar jogadores com estilos individuais diferentes, desde que as posições e funções sejam conferidas. Familiaridade com a posição, ativação do estilo ofensivo e ativação do defensivo são informações separadas. Ter um Overall calculado em uma posição não é, por si, comprovação de familiaridade completa.",
        "A versão 2027 permite organizar ataque e defesa em desenhos diferentes e separa estilos individuais por fase. Isso aumenta as possibilidades, mas também exige conferir quem volta para onde. Primeiro aprenda um desenho simples e reconhecível. Depois compare uma mudança de cada vez. Instruções precisam corresponder ao jogo atual: Ofensiva e Defesa recuada foram removidas na atualização v6. Não procure essas opções em um plano atual só porque um vídeo antigo as ensinou. Ancoragem limita deslocamentos laterais; não deve ser confundida com uma ordem universal de ficar parado."
      ],
      "windows": [
        {
          "signal": "Seu meio chega bem à área, mas fica sem ninguém na proteção.",
          "action": "Reveja a distribuição de tarefas e preserve uma referência atrás da jogada.",
          "avoid": "Trocar todos os meias sem verificar as instruções e o desenho.",
          "why": "O problema pode ser a combinação de avanços, não uma carta isolada."
        },
        {
          "signal": "Um jogador tem outro estilo do que você esperava para a posição.",
          "action": "Confira familiaridade e ativação de cada fase antes de descartá-lo.",
          "avoid": "Concluir que todo uso fora do rótulo habitual é errado.",
          "why": "Posição, estilo e tarefa precisam ser avaliados em separado."
        },
        {
          "signal": "A troca de técnico muda proficiência e bônus documentados.",
          "action": "Compare o plano com a edição exata e o estilo que realmente utilizará.",
          "avoid": "Presumir que todos os técnicos entregam os mesmos efeitos.",
          "why": "A identidade do cenário importa para a comparação."
        }
      ],
      "sequence": "Escolha o estilo coletivo e um desenho central. Defina proteção, apoio, criação e profundidade. Confira as duas fases e aplique somente instruções disponíveis no seu jogo.",
      "mistakes": [
        "Confundir carta homônima com a mesma edição: confira identidade, recursos e progressão.",
        "Mudar técnico, onze, formação e treino após uma derrota: você perde a referência da comparação."
      ],
      "exercise": {
        "title": "Desenhe suas tarefas",
        "setup": "Anote seu onze sem depender do número de Overall.",
        "steps": [
          "Marque quem protege, aproxima, cria e ataca espaço.",
          "Confira a posição de retorno na fase defensiva.",
          "Teste uma única mudança onde faltar uma tarefa clara."
        ],
        "measure": "Espaços sem responsável e jogadores ocupando repetidamente a mesma função.",
        "advance": "Experimente desenho fluido quando reconhecer a organização nas duas fases."
      },
      "summary": [
        "Comece pela tarefa.",
        "Familiaridade e estilo não são sinônimos.",
        "Ataque e defesa precisam se conectar."
      ],
      "sources": [
        "v6",
        "time"
      ],
      "diagram": "formation"
    },
    {
      "id": "cartas",
      "group": "Time e treino",
      "title": "Fichas, habilidades e ímpetos",
      "dek": "Desenvolva a carta para uma tarefa verificável.",
      "intro": [
        "A edição exata vem antes da ficha. Confira nível máximo, PP, posições, habilidades nativas e equipamento atual. Cartas com o mesmo nome podem ter estilos e recursos diferentes. Distribuição matemática que fecha o orçamento não comprova rendimento: ela apenas respeita a quantidade de pontos disponível. Escolha o que pretende melhorar na função e registre o que está cedendo para investir nisso. Um ganho de mobilidade pode custar outro recurso; não existe progresso gratuito em toda categoria.",
        "Adicionais devem complementar recursos ausentes e caber nas vagas daquela carta. Não recomende novamente algo que já é nativo ou está equipado. Ímpeto fixo e selecionável são slots diferentes: confira a edição, o que existe e o que já foi aplicado, sem presumir uma vaga adicional para qualquer carta. Antes de gastar recursos, identifique uma dificuldade observável em partida. Este manual propõe um método de comparação, não fichas numéricas universais. Cartas de progressão fixa, opções indisponíveis e evidências pendentes precisam ser respeitadas."
      ],
      "windows": [
        {
          "signal": "A carta parece lenta para a tarefa, mas você não conferiu edição e treino.",
          "action": "Verifique identidade, progressão e função antes de redistribuir.",
          "avoid": "Copiar a ficha de outra versão ou de outro jogador parecido.",
          "why": "O mesmo vetor pode produzir efeitos diferentes em bases e orçamentos distintos."
        },
        {
          "signal": "Você quer adicionar uma habilidade que aparece nas nativas.",
          "action": "Retire essa candidata e procure uma necessidade real ainda não atendida.",
          "avoid": "Gastar um recurso só para completar uma lista de cinco.",
          "why": "Quantidade de adicionais não é medida de qualidade do plano."
        },
        {
          "signal": "Um vídeo usa dois ímpetos com o mesmo nome.",
          "action": "Confira se são slots distintos e legais naquela edição e conta.",
          "avoid": "Somar bônus ou presumir equipamento apenas pelo nome mostrado.",
          "why": "A condição precisa ser documentada antes de entrar na comparação."
        }
      ],
      "sequence": "Confira a carta. Defina a tarefa e uma dificuldade. Compare uma alteração coerente com o orçamento. Teste em condições semelhantes e preserve um registro anterior.",
      "mistakes": [
        "Usar Overall como único objetivo: verifique se a mudança ajuda a tarefa desejada.",
        "Dispensar uma carta antes de conferir adicionais e valor de uso: a ação não é reversível."
      ],
      "exercise": {
        "title": "Uma hipótese por ficha",
        "setup": "Escolha apenas uma carta para a comparação.",
        "steps": [
          "Escreva a dificuldade em uma frase observável.",
          "Registre edição, treino, habilidades, ímpetos e contexto do time.",
          "Mude um elemento e compare apoio, perdas ou recuperação em várias situações."
        ],
        "measure": "Comportamentos ligados à hipótese, incluindo o que piorou.",
        "advance": "Mantenha a proposta somente se a comparação fizer sentido para seu uso."
      },
      "summary": [
        "Orçamento correto não comprova rendimento.",
        "Complemente recursos ausentes.",
        "Registre o custo da mudança."
      ],
      "sources": [
        "time",
        "bloqueio",
        "v6"
      ],
      "diagram": "training"
    },
    {
      "id": "online",
      "group": "Time e treino",
      "title": "Separe decisão, comando e conexão",
      "dek": "Nem toda falha tem a mesma causa.",
      "intro": [
        "Uma ação pode falhar porque a decisão era ruim, o gesto saiu diferente, o jogador estava em condição difícil ou a resposta online foi instável. Tente separar esses fatores antes de trocar a ficha. O Gráfico da Rede e os indicadores disponíveis ajudam a observar a conexão, mas não explicam sozinhos toda animação. A arquitetura também varia por modo: a documentação oficial diferencia liga com cliente-servidor e certos confrontos de amigo em conexão entre usuários. Não atribua qualquer partida ruim ao adversário.",
        "No celular, procure uma configuração gráfica que rode de modo estável no seu aparelho. O aviso oficial orienta revisar gráficos e taxa de quadros quando há problemas, sem fixar uma configuração universal para todos. Compare mudanças com calma e evite grande tráfego simultâneo na rede. Permanecer próximo ao ponto de acesso Wi-Fi e fechar atividades de fundo são medidas documentadas que podem ajudar, sem garantia. Se a partida está instável, reduzir ações de execução longa é uma adaptação de jogo a experimentar, não uma cura para a conexão."
      ],
      "windows": [
        {
          "signal": "O gesto funciona no treino, mas a resposta varia muito online.",
          "action": "Observe os indicadores de rede e compare com outra sessão antes de refazer o time.",
          "avoid": "Concluir imediatamente que a carta perdeu qualidade.",
          "why": "É preciso separar execução local e condições da partida."
        },
        {
          "signal": "O aparelho apresenta problemas de processamento nas partidas.",
          "action": "Revise as opções de gráficos disponíveis e teste estabilidade.",
          "avoid": "Copiar um valor de FPS como se fosse obrigatório em qualquer celular.",
          "why": "A configuração precisa caber no aparelho utilizado."
        },
        {
          "signal": "Você está frustrado e começa a trocar tudo durante uma sequência ruim.",
          "action": "Faça uma pausa e registre a dificuldade principal para avaliar depois.",
          "avoid": "Usar a próxima partida para testar várias mudanças ao mesmo tempo.",
          "why": "Uma comparação fica menos clara quando a referência muda continuamente."
        }
      ],
      "sequence": "Classifique a falha: leitura, gesto, condição ou resposta instável. Observe os indicadores disponíveis. Faça uma comparação pequena e registre o contexto da sessão.",
      "mistakes": [
        "Chamar qualquer erro de script: descreva primeiro o que é observável.",
        "Usar um indicador bom como prova de ausência de atraso: ele é uma informação, não uma explicação completa."
      ],
      "exercise": {
        "title": "Diagnóstico da sessão",
        "setup": "Separe uma sessão de treino local e outra de partida online.",
        "steps": [
          "Execute o mesmo comando simples nas duas condições.",
          "Registre o tipo de partida e sinais de instabilidade, se houver.",
          "Escolha uma mudança de configuração ou hábito por comparação."
        ],
        "measure": "Falhas de gesto e de decisão separadas dos sinais de resposta irregular.",
        "advance": "Retome comandos mais exigentes quando sua referência de execução estiver estável."
      },
      "summary": [
        "Classifique antes de corrigir.",
        "Estabilidade não tem número universal.",
        "Pausa também protege a qualidade da decisão."
      ],
      "sources": [
        "rede",
        "graficos"
      ],
      "diagram": "network"
    },
    {
      "id": "aprender",
      "group": "Time e treino",
      "title": "Treine para reconhecer situações",
      "dek": "Avalie a decisão e a próxima ação, além do placar.",
      "intro": [
        "Um treino útil tem um foco pequeno, uma situação reconhecível e uma observação simples. Você não precisa corrigir defesa, saída e finalização em cada jogada da mesma partida. Escolha uma dificuldade principal, mantenha uma referência de time e compare várias ocorrências. O placar importa para a competição, mas não diz sozinho se você está lendo melhor as transições ou deixando de entregar a bola sob pressão.",
        "Assista também às jogadas que deram certo. Um passe arriscado pode ter funcionado por um erro adversário; uma boa chance pode não virar gol. Registre fatos como perda na saída, passe central cedido, cobertura que chegou atrasada e chance limpa criada. Em vídeo, volte alguns instantes antes do erro: a decisão que abriu o problema pode ter acontecido antes do último toque. O plano de sete dias deste manual é uma organização editorial da prática, não uma promessa de subir divisão nesse prazo. Repita uma etapa quando ainda não reconhecer a situação."
      ],
      "windows": [
        {
          "signal": "Você sofre sempre o mesmo tipo de bola nas costas.",
          "action": "Reveja o deslocamento anterior ao passe e escolha um ajuste específico.",
          "avoid": "Trocar toda a defesa sem localizar o padrão.",
          "why": "A repetição do problema fornece uma hipótese para testar."
        },
        {
          "signal": "Você criou uma boa chance e errou a finalização.",
          "action": "Separe a qualidade da criação da execução do chute.",
          "avoid": "Abandonar a sequência de ataque por causa de um único desfecho.",
          "why": "É possível ter melhorado uma etapa e ainda precisar treinar outra."
        },
        {
          "signal": "Um exercício continua difícil depois da sessão prevista.",
          "action": "Repita a etapa com um objetivo menor e pressão adequada.",
          "avoid": "Acelerar o cronograma só para marcar o dia como concluído.",
          "why": "A compreensão da situação vale mais que completar uma lista."
        }
      ],
      "sequence": "Escolha um foco. Jogue uma amostra que você consiga revisar. Separe decisão e execução. Compare um ajuste e repita o processo sem exigir uma explicação única para toda derrota.",
      "mistakes": [
        "Medir melhora só por vitórias: acompanhe comportamentos ligados ao foco.",
        "Guardar apenas lances bonitos: os erros e as tentativas abandonadas ajudam a entender o processo."
      ],
      "exercise": {
        "title": "Revisão de três lances",
        "setup": "Use uma gravação curta de uma partida própria.",
        "steps": [
          "Escolha um erro, um acerto e uma situação em que ficou em dúvida.",
          "Pause antes da decisão e liste duas opções possíveis.",
          "Compare a ação escolhida e seu custo para a jogada seguinte."
        ],
        "measure": "Uma mudança clara para a próxima sessão, sem transformar cada lance em uma regra absoluta.",
        "advance": "Faça comparações mais difíceis quando conseguir explicar sua escolha antes de ver o resultado."
      },
      "summary": [
        "Um foco por sessão.",
        "Reveja antes do erro.",
        "Treino é comparação, não promessa."
      ],
      "sources": [
        "mobile",
        "v6",
        "rede"
      ],
      "diagram": "review"
    }
  ],
  "scenarios": [
    {
      "id": "q1",
      "chapter": "olhar",
      "title": "Livre, mas atrás da linha",
      "situation": "Seu CA parece livre. Um volante adversário está entre ele e a bola. Um MLG ao lado tem trajetória aberta.",
      "choices": [
        "Forçar direto no CA",
        "Usar o MLG para mudar o ângulo",
        "Acelerar de frente para o volante"
      ],
      "correct": 1,
      "reason": "Nesta situação descrita, o apoio lateral oferece outra trajetória. A aparência de liberdade do CA não elimina o interceptador que ocupa o caminho. A decisão deve ser revista se esse apoio também fechar.",
      "diagram": "support"
    },
    {
      "id": "q2",
      "chapter": "controle",
      "title": "O gesto do vídeo falha",
      "situation": "O vídeo usa um deslize em Pressão. Seu jogo mostra defesa Normal e um botão próprio de Marcar de perto.",
      "choices": [
        "Conferir o comando da sua configuração",
        "Repetir mais rápido o gesto antigo",
        "Trocar os jogadores"
      ],
      "correct": 0,
      "reason": "Os mapas defensivos não são intercambiáveis. Verifique a Lista instalada para a configuração escolhida antes de atribuir o erro à execução ou à carta.",
      "diagram": "control"
    },
    {
      "id": "q3",
      "chapter": "receber",
      "title": "De costas para o contato",
      "situation": "O atacante recebe de costas. Há um marcador chegando e um meia livre de frente para ele.",
      "choices": [
        "Girar sempre para o gol",
        "Acelerar em direção ao marcador",
        "Comparar a devolução ao meia"
      ],
      "correct": 2,
      "reason": "A devolução conserva uma opção de frente e pode criar uma nova participação do atacante. O giro pode ser útil em outras condições, mas aqui existe pressão nas costas e apoio livre.",
      "diagram": "receive"
    },
    {
      "id": "q4",
      "chapter": "passe",
      "title": "O marcador se comprometeu",
      "situation": "Um rival abandona o meia para correr até seu volante com a bola. A trajetória até o meia continua aberta.",
      "choices": [
        "Esperar o choque antes de passar",
        "Tocar enquanto a linha está aberta",
        "Pedir o chute do volante"
      ],
      "correct": 1,
      "reason": "O deslocamento liberou o apoio. Usar essa janela pode permitir que o próximo recebedor jogue de frente; esperar o contato pode fechar a oportunidade.",
      "diagram": "pass"
    },
    {
      "id": "q5",
      "chapter": "profundidade",
      "title": "Corrida sem corredor",
      "situation": "Seu CA corre. O zagueiro recua junto e o goleiro protege a profundidade. Há passe seguro nos pés de outro atacante.",
      "choices": [
        "Lançar porque o CA é rápido",
        "Escolher o passe nos pés e reconstruir",
        "Usar mais força no mesmo lançamento"
      ],
      "correct": 1,
      "reason": "Existe uma corrida, mas não uma vantagem clara na chegada. O apoio permite tentar deslocar a cobertura antes de repetir o passe no espaço. Velocidade não elimina a leitura da defesa.",
      "diagram": "through"
    },
    {
      "id": "q6",
      "chapter": "triangulos",
      "title": "O terceiro homem",
      "situation": "O VOL não tem passe direto para o CA. O MAT pode receber e servir o CA por outro ângulo.",
      "choices": [
        "Usar o MAT como apoio",
        "Forçar pelo mesmo corredor fechado",
        "Recuar até o goleiro obrigatoriamente"
      ],
      "correct": 0,
      "reason": "O terceiro jogador muda o ângulo da trajetória. A solução não depende de decorar passes: é preciso confirmar que a segunda linha também continua aberta.",
      "diagram": "triangle"
    },
    {
      "id": "q7",
      "chapter": "ritmo",
      "title": "Você já passou do primeiro",
      "situation": "O primeiro marcador ficou para trás. Um segundo está parado no fim da sua corrida e um companheiro abre ao lado.",
      "choices": [
        "Continuar acelerando até ele",
        "Adiantar ainda mais a bola",
        "Reavaliar e usar a saída disponível"
      ],
      "correct": 2,
      "reason": "Superar o primeiro não garante uma segunda vantagem. O apoio pode aproveitar o espaço antes de a cobertura encurtar; a aceleração deve ter destino jogável.",
      "diagram": "dash"
    },
    {
      "id": "q8",
      "chapter": "drible",
      "title": "Dois cercam, um fica livre",
      "situation": "Dois adversários fecham seu portador perto da própria área. Um volante está livre para devolver.",
      "choices": [
        "Usar o apoio livre",
        "Encadear três fintas",
        "Tentar girar contra os dois"
      ],
      "correct": 0,
      "reason": "O passe explora o espaço que os marcadores deixaram. Nesta zona, a perda tem custo alto; a finta deve resolver um problema concreto, não ser uma obrigação.",
      "diagram": "dribble"
    },
    {
      "id": "q9",
      "chapter": "chute",
      "title": "A janela é curta",
      "situation": "Você recebe de frente na área. Há espaço para uma finalização imediata e um rival se aproxima rapidamente.",
      "choices": [
        "Preparar uma longa sequência",
        "Comparar o chute simples agora",
        "Esperar o marcador encostar"
      ],
      "correct": 1,
      "reason": "O chute que cabe no tempo disponível pode aproveitar a janela atual. Preparar demais permite que o bloqueio chegue. Não há garantia de gol, apenas uma oportunidade a avaliar.",
      "diagram": "shoot"
    },
    {
      "id": "q10",
      "chapter": "especiais",
      "title": "Preparação sem espaço",
      "situation": "Você pretende usar um passe fenomenal, mas o marcador já está encurtando e há devolução normal livre.",
      "choices": [
        "Carregar o especial sempre",
        "Usar Toque incisivo para dentro dele",
        "Comparar a devolução simples"
      ],
      "correct": 2,
      "reason": "O fenomenal pede preparação e não substitui a leitura do tempo. Um passe normal para o apoio pode preservar a posse quando a ação mais longa está ameaçada.",
      "diagram": "special"
    },
    {
      "id": "q11",
      "chapter": "perda",
      "title": "Ele recuperou de frente",
      "situation": "Você perde no meio, o adversário fica de frente e sua zaga está distante. Seu volante pode fechar a trajetória central.",
      "choices": [
        "Puxar imediatamente o zagueiro",
        "Proteger o corredor com o volante",
        "Chamar todos para a bola"
      ],
      "correct": 1,
      "reason": "Proteger a progressão pode ganhar tempo para o retorno dos companheiros. Se uma ruptura alcançar a última linha, a prioridade e o cursor precisarão mudar.",
      "diagram": "transition"
    },
    {
      "id": "q12",
      "chapter": "defender",
      "title": "O atacante já passou",
      "situation": "Você continha o portador, mas ele rompeu e agora corre para um espaço atrás de você.",
      "choices": [
        "Continuar a mesma contenção",
        "Tentar um passe sem ter a bola",
        "Recuperar a corrida ou assumir cobertura"
      ],
      "correct": 2,
      "reason": "A tarefa mudou. Um comando de contenção voltado a bloquear de frente não substitui a necessidade de alcançar a corrida ou selecionar quem consegue proteger o espaço.",
      "diagram": "defend"
    },
    {
      "id": "q13",
      "chapter": "cobertura",
      "title": "Seu companheiro vai pressionar",
      "situation": "Você chama um companheiro até a bola. Isso libera uma linha de passe que seu jogador pode cobrir.",
      "choices": [
        "Cobrir a saída enquanto ele pressiona",
        "Levar também seu jogador à bola",
        "Ignorar o recebedor livre"
      ],
      "correct": 0,
      "reason": "A pressão precisa de cobertura. Usar dois jogadores no mesmo ponto pode oferecer ao adversário exatamente a saída que ele procurava.",
      "diagram": "cover"
    },
    {
      "id": "q14",
      "chapter": "recuar",
      "title": "Voltar para abrir",
      "situation": "Todos os passes frontais estão fechados. Seu zagueiro atrás está livre e pode receber com segurança.",
      "choices": [
        "Forçar a vertical",
        "Devolver e oferecer o próximo apoio",
        "Prender o botão de aceleração"
      ],
      "correct": 1,
      "reason": "O recuo pode reorganizar o ângulo do ataque. Ele precisa continuar com participação e nova leitura, sem presumir que qualquer passe para trás é seguro.",
      "diagram": "recycle"
    },
    {
      "id": "q15",
      "chapter": "time",
      "title": "Um nome, duas edições",
      "situation": "Você viu um Iniesta de infiltração. A sua edição é Armador criativo.",
      "choices": [
        "Copiar a ficha e esperar movimentos idênticos",
        "Conferir estilo, familiaridade e tarefa da sua edição",
        "Concluir que todo Iniesta é igual"
      ],
      "correct": 1,
      "reason": "Nome e posição não garantem os mesmos recursos. O planejamento deve partir da edição exata e de como seu estilo funciona na posição escolhida.",
      "diagram": "formation"
    },
    {
      "id": "q16",
      "chapter": "cartas",
      "title": "A quinta adicional",
      "situation": "Você quer preencher uma vaga com uma habilidade já presente nas nativas.",
      "choices": [
        "Repetir para fortalecer o mesmo nome",
        "Completar cinco a qualquer custo",
        "Escolher uma necessidade ainda não atendida"
      ],
      "correct": 2,
      "reason": "O objetivo é complementar recursos e respeitar as vagas da carta. Uma lista cheia não comprova uma ficha melhor; conferir nativas evita investimento sem finalidade.",
      "diagram": "training"
    },
    {
      "id": "q17",
      "chapter": "online",
      "title": "Tudo mudou de uma vez",
      "situation": "Depois de uma partida instável, você pensa em trocar técnico, time, treino e formação ao mesmo tempo.",
      "choices": [
        "Classificar a falha e comparar um ajuste",
        "Trocar tudo imediatamente",
        "Presumir que é sempre culpa do adversário"
      ],
      "correct": 0,
      "reason": "Sem uma referência fica difícil saber o que ajudou. Observe decisão, gesto e sinais de conexão, preservando um contexto que permita uma comparação pequena.",
      "diagram": "network"
    },
    {
      "id": "q18",
      "chapter": "aprender",
      "title": "O chute não entrou",
      "situation": "Uma combinação criou chance limpa, mas a finalização saiu ruim.",
      "choices": [
        "Separar criação da execução do chute",
        "Abandonar toda a combinação",
        "Usar só o resultado como diagnóstico"
      ],
      "correct": 0,
      "reason": "Você pode ter criado melhor e ainda precisar treinar a execução. O vídeo deve ser revisto antes da decisão, sem transformar um único desfecho em regra absoluta.",
      "diagram": "review"
    }
  ],
  "days": [
    {
      "id": "d1",
      "title": "Ver e receber",
      "time": "15 min",
      "focus": "Leitura antes do domínio",
      "chapter": "receber",
      "warm": "5 min: escolha duas saídas antes de cada recepção.",
      "practice": "10 min: compare devolução e domínio sem forçar giros de costas.",
      "note": "Anote perdas por giro pressionado e uma alternativa que você enxergou tarde."
    },
    {
      "id": "d2",
      "title": "Fechar o centro",
      "time": "15 min",
      "focus": "Contenção e cursor",
      "chapter": "defender",
      "warm": "5 min: confira defesa Normal/Estilo de pressão e os comandos da sua Lista.",
      "practice": "10 min: proteja uma trajetória central e mude para recuperação quando for superado.",
      "note": "Anote passes centrais cedidos e saídas desnecessárias do zagueiro."
    },
    {
      "id": "d3",
      "title": "Sair da pressão",
      "time": "15 min",
      "focus": "Passe de apoio",
      "chapter": "passe",
      "warm": "5 min: trocas curtas sem exigir corrida longa do recebedor.",
      "practice": "10 min: atraia um marcador, toque para o apoio e procure o terceiro homem.",
      "note": "Registre perdas na saída; separe linha fechada e gesto errado."
    },
    {
      "id": "d4",
      "title": "Mudar o ritmo",
      "time": "15 min",
      "focus": "Aceleração com destino",
      "chapter": "ritmo",
      "warm": "5 min: condução controlada, corrida e desaceleração em sequência.",
      "practice": "10 min: depois de passar pelo primeiro rival, procure a cobertura antes de acelerar de novo.",
      "note": "Marque perdas por continuar correndo para uma zona já ocupada."
    },
    {
      "id": "d5",
      "title": "Criar a chance",
      "time": "15 min",
      "focus": "Tabela e corrida",
      "chapter": "triangulos",
      "warm": "5 min: volante, meia e atacante em alturas diferentes.",
      "practice": "10 min: compare passe nos pés e passe no espaço, observando corrida e cobertura.",
      "note": "Registre recepções de frente e tentativas de profundidade sem vantagem."
    },
    {
      "id": "d6",
      "title": "Finalizar a janela",
      "time": "15 min",
      "focus": "Chute e posição corporal",
      "chapter": "chute",
      "warm": "5 min: finalização normal de posições semelhantes.",
      "practice": "10 min: escolha entre chute imediato, ajuste curto e passe que melhora o ângulo.",
      "note": "Anote chances limpas e chutes bloqueados que já eram previsíveis."
    },
    {
      "id": "d7",
      "title": "Rever e repetir",
      "time": "20 min",
      "focus": "Uma mudança para a próxima semana",
      "chapter": "aprender",
      "warm": "5 min: reveja um erro, um acerto e uma dúvida.",
      "practice": "10 min: mantenha o mesmo contexto e teste um único ajuste.",
      "note": "5 min: escolha qual etapa repetir. O calendário organiza a prática, não certifica domínio."
    }
  ],
  "commands": [
    {
      "name": "Passe e chute normais",
      "how": "Use a ação normal do botão correspondente na sua Lista. Confira direção, força e assistência no seu layout.",
      "status": "Conferir no jogo",
      "when": "Circulação, devolução ou finalização que caiba no tempo da jogada.",
      "avoid": "Não importar botões ou níveis de força de controle físico."
    },
    {
      "name": "Marcar de perto",
      "how": "Na configuração defensiva Normal, há botão dedicado. No Estilo de pressão, o acionamento é diferente; confira a Lista.",
      "status": "Configuração importa",
      "when": "Posicionar-se para conter e bloquear de frente.",
      "avoid": "Não manter a mesma contenção quando já é preciso correr atrás do atacante."
    },
    {
      "name": "Fenomenais",
      "how": "O guia Clássico histórico documenta deslizes horizontais em Passe/Lançam./Chute; confirme direção e tipo na Lista atual.",
      "status": "Gesto histórico",
      "when": "Comparar execução quando houver tempo para preparar.",
      "avoid": "Não usar o tempo de preparação como se fosse instantâneo."
    },
    {
      "name": "Toque incisivo",
      "how": "O guia Mobile histórico descreve deslize rápido com Acelerar. Confira a Lista; não assumir o duplo toque de console.",
      "status": "Gesto histórico",
      "when": "Adiantar a bola para um espaço que você pode alcançar.",
      "avoid": "Não direcionar a bola para uma cobertura que já está preparada."
    },
    {
      "name": "Fintas avançadas",
      "how": "Use a consulta Fintas: dez famílias, gestos dos dois dedos, variações condicionais e recepções. Selecione Avançado e mantenha botões visíveis.",
      "status": "Configuração importa",
      "when": "Escapar, mudar ângulo ou abrir a próxima ação.",
      "avoid": "Não misturar tipos de finta ou confundi-los com a assistência geral."
    },
    {
      "name": "Controlado, cavadinha e finta de chute",
      "how": "Confira os acionamentos touchscreen na Lista instalada. Não atribuímos um deslize atual sem verificação suficiente.",
      "status": "Conferir no jogo",
      "when": "Usar conforme ângulo, goleiro, reação defensiva e saída após o movimento.",
      "avoid": "Não usar um recurso especial sem saber qual problema ele resolve."
    },
    {
      "name": "Proteção da bola",
      "how": "A proteção manual antiga foi removida; a tentativa é contextual e automática.",
      "status": "Mudança documentada",
      "when": "Avaliar corpo, pressão e apoio em disputas e recepções.",
      "avoid": "Não ensinar a antiga combinação de proteção como comando atual."
    },
    {
      "name": "Instruções individuais",
      "how": "Use apenas opções disponíveis na edição instalada. Ofensiva e Defesa recuada foram removidas na v6.",
      "status": "Mudança documentada",
      "when": "Distribuir tarefas entre as fases e compensar movimentos.",
      "avoid": "Não tratar Ancoragem como ordem universal de imobilidade."
    }
  ],
  "glossary": [
    {
      "term": "Linha de passe",
      "meaning": "Trajetória entre a bola e o recebedor. O destino pode parecer livre e a trajetória estar bloqueada."
    },
    {
      "term": "Terceiro homem",
      "meaning": "Jogador que recebe após uma combinação intermediária, mudando o ângulo que estava fechado."
    },
    {
      "term": "Profundidade",
      "meaning": "Espaço atrás de uma linha adversária, que precisa estar alcançável e respeitar o impedimento."
    },
    {
      "term": "Apoio",
      "meaning": "Opção que permite conservar, devolver ou mudar a direção da jogada."
    },
    {
      "term": "Contenção",
      "meaning": "Ajuste de posição e distância para limitar as opções do portador."
    },
    {
      "term": "Cobertura",
      "meaning": "Proteção do espaço que outro jogador pode deixar ao pressionar ou avançar."
    },
    {
      "term": "Transição",
      "meaning": "Mudança de tarefa após ganhar ou perder a bola; pede uma leitura nova."
    },
    {
      "term": "Familiaridade",
      "meaning": "Proficiência da edição na posição de uso; diferente de Overall calculado naquela posição."
    },
    {
      "term": "Ativação de estilo",
      "meaning": "Aplicação do padrão individual na fase e posição compatíveis; não é sinônimo de familiaridade."
    },
    {
      "term": "Janela",
      "meaning": "Tempo e espaço úteis para executar uma ação antes de o cenário mudar."
    },
    {
      "term": "PP",
      "meaning": "Orçamento de progressão da carta. Fechar o custo não comprova desempenho em partida."
    },
    {
      "term": "Diário de treino",
      "meaning": "Registro manual de situações observáveis. Não mede sozinho habilidade nem desempenho futuro."
    }
  ],
  "sources": [
    {
      "id": "mobile",
      "title": "Comandos Mobile: guia histórico do Clássico",
      "url": "https://www.konami.com/efootball/pt-br/page/new_controls",
      "note": "2022. Gestos históricos; conferir a Lista de comandos instalada. Não substitui mudanças posteriores.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "defesa",
      "title": "Defesa Normal e Estilo de pressão",
      "url": "https://www.konami.com/efootball/pt-br/page/2022/season2_patch-notes_v1-1-4",
      "note": "Distingue as configurações defensivas do Mobile e o botão dedicado de Marcar de perto.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "protecao",
      "title": "v4.0: proteção contextual da bola",
      "url": "https://www.konami.com/efootball/pt-br/page/v4/versioninfo_v4-00",
      "note": "A proteção manual antiga foi removida; não ensinar aquele gesto como comando atual.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "fintas",
      "title": "v5.4: tipos de comando de finta",
      "url": "https://www.konami.com/efootball/pt-br/page/v5/versioninfo_v5-40",
      "note": "Mobile: Fácil, Inteligente e Avançado. Tipo de finta não é sinônimo de Assistência inteligente.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "v6",
      "title": "eFootball 2027: v6.0",
      "url": "https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00",
      "note": "Plano fluido, estilos ofensivos/defensivos e mudanças de instruções. Ofensiva e Defesa recuada foram removidas.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "incisivo",
      "title": "v3.0: atenção à exceção Mobile",
      "url": "https://www.konami.com/efootball/pt-br/page/2024/versioninfo_v3-00",
      "note": "A mudança de Toque incisivo por duplo toque excluía iOS/Android; não transplantar comando de console.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "rede",
      "title": "Como o PvP online se conecta",
      "url": "https://www.konami.com/efootball/pt-br/page/online_match",
      "note": "Modos usam arquiteturas distintas; antena, Gráfico da Rede e recomendações de conexão.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "graficos",
      "title": "Aviso de desempenho e gráficos",
      "url": "https://www.konami.com/efootball/pt-br/topic/news/5550",
      "note": "08/09/2026. Orienta revisar gráficos/taxa de quadros quando houver problemas; não fixa FPS universal.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "time",
      "title": "Time ideal: jogadores e desenvolvimento",
      "url": "https://www.konami.com/efootball/pt-br/page/dreamteam",
      "note": "Visão geral do desenvolvimento. Conferir no jogo a edição, a progressão e as opções disponíveis.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "bloqueio",
      "title": "Cuidado ao dispensar jogadores",
      "url": "https://www.konami.com/efootball/pt-br/topic/news/5477",
      "note": "Bloqueio protege contra dispensa acidental; jogadores dispensados não são recuperáveis.",
      "checked": "01/11/2026",
      "publisher": "KONAMI"
    },
    {
      "id": "finta-touch",
      "title": "Finta avançada: demonstrações de gestos touchscreen",
      "url": "https://game8.jp/efootball/576587",
      "note": "Demonstrações independentes do Game8. Diagramas comparados visualmente; não são documentação oficial. Sete famílias dependem desta demonstração, sem confirmação por texto integral da Lista.",
      "checked": "01/11/2026",
      "publisher": "Demonstração independente"
    },
    {
      "id": "finta-lista",
      "title": "Lista touchscreen: Step-over, Chop Turn e Rainbow",
      "url": "https://pbs.twimg.com/media/HFcHqM7WEAA6fXz.jpg",
      "note": "Captura primária da Lista de comandos, publicada em x.com/IloseFootball/status/2042109383853629872. Exibe deslize frontal+diagonal135°, toque+flick90° e três toques em Dash. Não é o manual Bluetooth.",
      "checked": "01/11/2026",
      "publisher": "Captura do jogo"
    },
    {
      "id": "finta-recepcao",
      "title": "Tutorial touchscreen: levantar e deixar passar",
      "url": "https://boooost.jp/wp-content/uploads/2026/07/efootball-control-trap-2.jpg",
      "note": "Captura primária do tutorial do jogo, hospedada em boooost.jp/efootball-controls/. Distingue toque+deslize para levantar e deslize no sentido da bola antes do domínio. Não declara habilidade obrigatória.",
      "checked": "01/11/2026",
      "publisher": "Captura do jogo"
    },
    {
      "id": "tap-demo",
      "title": "Tap Trick: demonstração do gesto lateral",
      "url": "https://www.reddit.com/r/pesmobile/comments/1vampqm/new_tap_trick_skill/",
      "note": "Publicação original de demonstração do movimento: toque à direita e comando perpendicular à esquerda. Evidência independente; exige conferir Tap Trick na carta. Não comprova que a habilidade seja adicionável.",
      "checked": "01/11/2026",
      "publisher": "Demonstração independente"
    }
  ]
};if(typeof module==='object'&&module.exports)module.exports=data;if(w)w.CT_GUIDE=data;})(typeof window!=='undefined'?window:null);