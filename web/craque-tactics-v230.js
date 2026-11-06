/* Craque Tático V230 — comparação documental de estilos nas DUAS formações.
 * 6 estratégias + qualquer um dos 246 jogadores, sem inventar atributos ou Overall.
 * Pontuação ordinal de encaixe tático, NÃO avaliação de qualidade/meta em partidas.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_TACTICS_V230=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const MODES=Object.freeze({
 posse:{label:'Posse de Bola',hint:'Apoios, tabelas, domínio e saída curta. Meias orquestradores e atacantes que conectam linhas ganham relevância.'},
 normal:{label:'Contra-Ataque Normal',hint:'Bloco equilibrado, transição controlada e apoio defensivo. A mesma formação pode ser usada com funções complementares.'},
 rapido:{label:'Contra-Ataque Rápido',hint:'Ataque à profundidade, pressão após perda e movimentos de ruptura. Preferir características de velocidade sem supor atributos desconhecidos.'},
 fora:{label:'Por Fora',hint:'Criar amplitude a partir de laterais/meias sem obrigar pontas nem cruzamentos. Seu desenho estreito continua possível.'},
 longo:{label:'Bola Longa',hint:'Primeira ligação vertical, disputa aérea e segunda bola. Considerar um atacante de referência e meias que recolham rebotes.'},
 overload:{label:'Sobreposição',hint:'Aproximar apoios no setor da bola, oferecer linhas curtas e cobrir deslocamentos. Hipótese editorial de encaixe; validar a movimentação no jogo.'}
});
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const POS=Object.freeze({AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DC:'ZG',ZC:'ZG',ZG:'ZG',DD:'LD',LD:'LD',DE:'LE',LE:'LE',GR:'GO',GO:'GO',PTE:'PTE',PTD:'PTD',MLE:'MLE',MLD:'MLD'});
function slotRole(slot){
 if(['zge','zgd'].includes(slot))return 'ZG';
 if(['cae','cad'].includes(slot))return 'CA';
 if(['vole','vold'].includes(slot))return 'VOL';
 return ({go:'GO',le:'LE',ld:'LD',vol:'VOL',mlg:'MLG',mlge:'MLG',mlgd:'MLG',mat:'MAT',sa:'SA',ca:'CA'})[slot]||null;
}
const NEAR={
 CA:['SA','MAT'],SA:['CA','MAT'],MAT:['SA','MLG','VOL'],MLG:['MAT','VOL'],
 VOL:['MLG','ZG','MAT'],ZG:['VOL','LD','LE'],LD:['LE','ZG','MLD'],LE:['LD','ZG','MLE']
};
function position(card){return POS[String(card?.posicao||card?.shown_position||'').toUpperCase()]||null;}
function fit(card,slot){
 const want=slotRole(slot),have=position(card);
 if(!want||!have)return {match:false,score:-100,label:'Posição não documentada'};
 if(want==='GO'||have==='GO')return have===want?
   {match:true,score:55,label:'Posição original'}:{match:false,score:-100,label:'Goleiro incompatível'};
 if(want===have)return {match:true,score:55,label:'Posição original'};
 const trained=(typeof window!=='undefined'?window.SCOUT_POSITION_TRAINING_V246:null)||
  (typeof module==='object'&&module.exports?require('./scout-position-training-v246.js'):null);
 const confirmed=trained?.status(card,want);
 if(confirmed?.status==='treinada'||confirmed?.status==='familiar')
  return {match:true,score:49,label:confirmed.label};
 if(NEAR[want]?.includes(have))return {match:false,score:15,label:'Adaptação sem familiaridade confirmada'};
 return {match:false,score:-100,label:'Posição incompatível'};
}
/* V392: guia de execução MANUAL para duas táticas. São tarefas por VAGA,
 * nunca equipamento, build validada ou comportamento garantido da carta.
 * A ficha individual, seu PP e seus slots seguem nos motores V251/V228/V311.
 */
const COUNTER_GUIDES=Object.freeze({
 normal:Object.freeze({
  label:'Contra-Ataque',
  attack:'Recupere, confirme a primeira linha de passe e procure MAT/SA entre as linhas. Combine passe curto e vertical; lance ao espaço só quando o CA tiver vantagem. Um CA apoia, o outro ataca a profundidade.',
  defence:'Defenda primeiro pelo centro controlando o VOL. Feche o passe para o atacante, use contenção e intercepte; não tire o ZG da cobertura sem necessidade. Reagrupe antes de tentar recuperar alto.',
  risk:'Bloco recuado pode isolar os atacantes. Se o MAT/SA não acompanhar, segure a bola no VOL e reaproxime em vez de forçar lançamento.',
  formations:Object.freeze({
   '4312':Object.freeze({attack:'4-3-1-2: VOL de proteção + VOL de ligação; MLG se aproxima do MAT para formar o apoio do primeiro CA. Segundo CA procura ruptura.',defence:'4-3-1-2: dois VOL vedam o meio; MLG recompõe e MAT corta a linha de passe ao volante rival.'}),
   '4213':Object.freeze({attack:'4-2-1-3 estreita: VOL encontra MAT ou SA central; SA devolve a um dos dois CA. Alterne passe de apoio e profundidade.',defence:'4-2-1-3 estreita: o SA fecha a saída central e o MAT recua sobre o primeiro volante rival; os dois VOL não devem subir juntos.'})
  }),
  roles:Object.freeze({
   GO:Object.freeze(['Distribuir com segurança para ZG/VOL; ligação direta só se receptor e segunda bola estiverem cobertos.','Proteger a meta e não sair sem ângulo claro.']),
   LE:Object.freeze(['Dar apoio simples por fora ou por dentro sem cruzamento obrigatório.','Segurar o lado esquerdo e não abandonar o corredor em transição.']),
   LD:Object.freeze(['Dar passe de apoio, ficando como cobertura da perda.','Segurar o lado direito e fechar o espaço entre lateral e ZG.']),
   ZG:Object.freeze(['Iniciar com passe limpo e não conduzir para zona congestionada.','Conservar linha, acompanhar a profundidade e cobrir o colega que confronta.']),
   VOL:Object.freeze(['Um sustenta o time; outro oferece passe vertical ao MAT/SA conforme a jogada.','Proteger zona central, bloquear passe de ruptura e não pressionar com os dois ao mesmo tempo.']),
   MLG:Object.freeze(['Ser terceiro homem: recuperar, apoiar o MAT e chegar de trás.','Recompor o meio e fechar opções de passe ao redor do VOL.']),
   MAT:Object.freeze(['Receber entre linhas, devolver de primeira quando possível e servir o CA desmarcado.','Fechar o passe central de saída e voltar ao espaço dos VOL.']),
   SA:Object.freeze(['Aproximar dos dois CA e preparar tabela curta para ruptura.','Atrapalhar a distribuição pelo centro sem perder a linha do meio.']),
   CA:Object.freeze(['Alternar apoio de costas e desmarque nas costas; finalizar quando houver ângulo real.','Fechar o passe simples ao meio; não gastar corrida perseguindo os dois ZG.'])
  })
 }),
 rapido:Object.freeze({
  label:'Contra-Ataque Rápido',
  attack:'Após o desarme, procure rapidamente uma linha curta e vertical para VOL, MAT ou SA. Acione um CA em profundidade e use o outro como apoio; se o caminho estiver fechado, recicle o passe sem acelerar às cegas.',
  defence:'A pressão é mais adiantada: pressione com o jogador próximo e cubra a linha de passe com o VOL. Troque o cursor para proteger a profundidade antes do lançamento rival. Evite puxar os dois ZG e pressionar sem cobertura.',
  risk:'Linha alta expõe bolas nas costas. Quando o adversário prepara lançamento, abandone a perseguição e priorize o ZG de cobertura; se necessário, desacelere a pressão.',
  formations:Object.freeze({
   '4312':Object.freeze({attack:'4-3-1-2: recuperar no VOL/MLG, MAT recebe em um ou dois toques, CA de apoio combina com o CA de ruptura.',defence:'4-3-1-2: MLG pressiona o portador próximo; um VOL cobre a frente da zaga e o outro vigia o passe de retorno.'}),
   '4213':Object.freeze({attack:'4-2-1-3 estreita: MAT liga o primeiro passe e SA central encosta nos dois CA para tabela e ruptura por dentro.',defence:'4-2-1-3 estreita: MAT/SA perturbam a saída central; um VOL guarda a zona da bola nas costas do MAT e o outro protege os ZG.'})
  }),
  roles:Object.freeze({
   GO:Object.freeze(['Saída rápida, mas com passe seguro para iniciar a transição.','Ficar atento à profundidade sem sair automaticamente em toda bola.']),
   LE:Object.freeze(['Apoiar curto sem subir ao mesmo tempo que o outro lateral.','Recompor imediatamente; proteger o corredor na linha alta.']),
   LD:Object.freeze(['Ser linha de passe de retorno sem romper a cobertura.','Recompor e não abrir o espaço lateral do ZG.']),
   ZG:Object.freeze(['Primeiro passe vertical apenas quando houver receptor livre; caso contrário, apoiar o VOL.','Um confronta, o outro cobre a profundidade; antecipar lançamentos, não perseguir os dois CA.']),
   VOL:Object.freeze(['Um progride com passe vertical; outro permanece preparado para a perda.','Controlar a zona à frente dos ZG e cortar a bola nas costas do MAT.']),
   MLG:Object.freeze(['Pressionar, recuperar e atacar como terceiro homem em apoio ao MAT.','Pressionar apenas com cobertura do VOL; retornar se a primeira pressão falhar.']),
   MAT:Object.freeze(['Receber de frente e acelerar a tabela; decidir rapidamente entre CA de apoio e CA de ruptura.','Fechar passe ao meio e iniciar pressão coordenada, sem perseguir lateral fora de sua zona.']),
   SA:Object.freeze(['Aproximar dos dois CA, combinar passe de primeira e infiltração central.','Pressionar saída por dentro e recompor para não abrir a frente dos VOL.']),
   CA:Object.freeze(['Um ataca a última linha, o outro encosta para tabela; alternar funções conforme as cartas reais.','Orientar a pressão para o corredor escolhido, não correr sem direção.'])
  })
 })
});
// V394: consultoria por vaga real. As condições são decisões para o usuário;
// nenhuma instrução é aplicada ao eFootball ou ao armazenamento do elenco.
const COUNTER_SLOTS=Object.freeze({
 '4312':Object.freeze(['go','le','zge','zgd','ld','vole','vold','mlg','mat','cae','cad']),
 '4213':Object.freeze(['go','le','zge','zgd','ld','vole','vold','mat','sa','cae','cad'])
});
function counterDecisions(mode,formation){
 const fast=mode==='rapido',diamond=formation==='4312';
 const bridge=diamond?'MLG':'SA central';
 const rows=[
  ['recovery','Primeiro passe após recuperar',
   fast?'Você recuperou e MAT ou '+bridge+' oferece apoio de frente.':'Você recuperou no bloco e o VOL de ligação está livre.',
   fast?(diamond?'VOL/MLG → MAT → CA: use Passe para tirar a bola da pressão; só acelere o segundo passe se o CA já abriu vantagem.':'VOL → MAT ou SA central → CA: use Passe no apoio livre e deixe o SA devolver antes de buscar a ruptura.'):
    (diamond?'ZG → VOL de ligação → MLG/MAT: use Passe e reaproxime o meio antes da bola no CA.':'ZG → VOL → MAT; procure o SA central de frente para conectar um dos CA. Use Passe e espere o apoio se o SA estiver cercado.'),
   'Passe vertical de costas sob pressão dupla; Lançam. automático só porque recuperou a bola.'],
  ['central-block','Rival bloqueia o corredor central',
   'O volante rival cobre MAT e a linha direta para o CA está fechada.',
   diamond?'Devolva com Passe ao VOL, aproxime o MLG e use o lateral como apoio; retorne por dentro quando o marcador sair. Se não sair, conserve a bola.':
    'Use o SA como parede somente se a devolução estiver livre. Caso contrário, Passe ao VOL/lateral, mude o ângulo e reencontre MAT-SA pelo centro.',
   'Forçar Lançam. entre dois defensores, correr para dentro do marcador ou depender de cruzamento.'],
  ['sprint','Quando usar Acelerar',
   fast?'O CA de ruptura passou do marcador e existe espaço para o próximo toque.':'O passe de apoio tirou o primeiro marcador e há corredor livre.',
   'Oriente o direcional para o espaço e use Acelerar depois do domínio. Solte Acelerar antes de virar, tabelar ou preparar Chute; se o corredor fechar, volte com Passe.',
   'Manter Acelerar ao receber de costas ou durante toda a tabela; o toque longo pode entregar a bola.'],
  ['pass-shot','Tempo de passe e chute',
   'O defensor sai no portador e o outro CA começa a corrida, ou o portador já tem ângulo de gol.',
   'Use Passe no apoio antes do bote; escolha Lançam. apenas com corredor e atacante em movimento. Se há linha de gol livre, reduza Acelerar, alinhe o corpo e use Chute. Sem ângulo, devolva a '+(diamond?'MAT/MLG.':'MAT/SA.'),
   'Soltar profundidade tarde contra a cobertura, chutar bloqueado ou esperar uma sequência fixa de toques.'],
  ['failed-press','A primeira pressão falhou',
   fast?'O rival passou por MAT/'+bridge+' e pode atacar os dois VOL.':'O rival superou o jogador que tentou recuperar e avança pelo centro.',
   fast?'Pare de perseguir com o atacante. Use Trocar para o VOL de proteção, recue entre bola e gol e use Marcar de perto para fechar o passe. O outro VOL cobre; só retome Pressão com apoio.':
    'Use Trocar para o VOL e recomponha o bloco. Feche o passe central com Marcar de perto; espere o apoio do '+bridge+' para tentar Pressão sem abrir a frente dos ZG.',
   'Segurar Pressão com todos; chamar um ZG para o meio e deixar o CA adversário nas costas.'],
  ['through-ball','Adversário prepara bola nas costas',
   'O passador levanta a cabeça e o atacante dispara além do seu VOL.',
   fast?'Antecipe com Trocar para o ZG que cobre a corrida; recue para ficar entre atacante e gol. Use Acelerar para acompanhar a profundidade e solte ao ajustar a posição. O outro ZG conserva a cobertura.':
    'Se o VOL ainda fecha a linha, intercepte por ele. Se a corrida já ameaça a zaga, use Trocar para o ZG de cobertura e acompanhe rumo ao gol; use Acelerar só para recuperar distância.',
   'Esperar a bola sair para trocar, avançar os dois ZG ou usar Marcar de perto para perseguir um rival que já passou.']
 ];
 return Object.freeze(rows.map(([id,title,when,action,avoid])=>Object.freeze({id,title,when,action,avoid})));
}
function counterInstructions(mode,formation,context){
 const fast=mode==='rapido',diamond=formation==='4312';
 const entry=(slot,type,when,cost,leaveUnused,extra={})=>Object.freeze({slot,type,when,cost,leaveUnused,...extra});
 const target=typeof context?.opponentTarget==='string'?context.opponentTarget.trim().slice(0,80):'';
 const attack=[entry('vole','Defensivo',
  'Se o VOL de proteção abandona a frente dos ZG durante seus ataques.',
  'Restringe a chegada deste VOL e reduz uma opção de apoio à frente.',
  'Se a carta já guarda a zona e a cobertura funciona; não gaste uma vaga só para repetir o comportamento.')];
 attack.push(fast?entry('ld','Defensivo',
  diamond?'Se o MLG avança e o lado direito fica sem cobertura na perda.':'Se MAT e SA atacam juntos e a perda expõe o lado direito dos dois VOL.',
  'Perde a subida do LD e uma saída por fora quando o centro está fechado.',
  'Se o perigo vem pela esquerda, reavalie o lateral em vez de prender os dois; se não há exposição, deixe Ataque 2 livre.'):
  entry(diamond?'cad':'sa','Ancoragem',
   diamond?'Se o CA de ruptura abre demais e falta uma referência central para a ligação.':'Se o SA central deriva para a lateral e rompe o triângulo MAT-SA-CA.',
   diamond?'Reduz a liberdade lateral do CA; o CA de apoio deve oferecer outro ângulo.':'Limita o deslocamento lateral do SA e pode congestionar o mesmo corredor dos dois CA.',
   'Se o jogador já ocupa o centro ou a mobilidade dele abre a tabela, deixe Ataque 2 livre. Ancoragem não é ordem para recuar.'));
 const defence=[fast&&diamond?entry(null,null,
  'Prioridade inicial: manter os dois CA participando da primeira pressão.',
  'Sem Alvo de contra-ataque, o CA participa mais da defesa e pode chegar menos descansado à transição.',
  'Deixe Defesa 1 livre enquanto a pressão funciona; só considere Alvo de contra-ataque em CAD se ele ficar isolado e você aceitar perder sua recomposição.'):
  entry('cad','Alvo de contra-ataque',
   fast?'Se o CA de ruptura fica sem saída após recuperar e você aceita pressionar com um atacante a menos.':
    'Se o CA de ruptura recua tanto que não existe receptor quando o bloco recupera.',
   diamond?'Menos recomposição do CAD; o CAE e o MAT precisam fechar a saída central.':
    'Menos recomposição do CAD; SA e MAT terão mais trabalho e os dois VOL podem ficar expostos.',
   'Se precisa defender com todos ou os dois CA já oferecem saída, deixe Defesa 1 livre. Não retire os dois CA da recomposição por padrão.')];
 defence.push(target?entry('vold','Marcação individual',
  'Somente se '+target+' recebe livre repetidamente na zona do VOL de ligação; confirme o alvo no Plano de jogo.',
  'Pode arrastar o VOLD para fora da zona e abrir o centro; VOLE fica na cobertura. Retire se o alvo trocar de setor.',
  'Sem alvo rival identificado, com rotações frequentes ou se fechar a linha manualmente resolve, deixe Defesa 2 livre.',{target}):
  entry(null,null,'Ainda não há um alvo adversário identificado.',
   'Marcar por hábito pode retirar o VOL da cobertura e gastar uma vaga defensiva.',
   'Deixe Defesa 2 livre. Só considere Marcação individual em VOLD quando houver um receptor rival concreto e cobertura do VOLE.'));
 return Object.freeze({attack:Object.freeze(attack),defence:Object.freeze(defence),
  rule:'Até duas instruções de ataque e duas de defesa no Plano de jogo. São opções condicionais para configurar manualmente; comece sem instrução quando não houver um problema observado.',
  removed:'Konami v6.0.0: Ofensiva e Defesa recuada foram removidas também no iOS/Android. Não há ajuste numérico de altura da linha ou pressão neste guia.'});
}
function counterSlotTasks(mode,formation,slot,task){
 const fast=mode==='rapido',diamond=formation==='4312';
 const special={
  vole:['VOL de proteção: ofereça retorno atrás da bola; só avance com cobertura confirmada.',
   'Guarde a frente dos ZG e acompanhe o receptor central; não persiga o portador até a lateral.'],
  vold:['VOL de ligação: receba de frente e encontre '+(diamond?'MLG/MAT':'MAT/SA')+(fast?' sem atrasar o passe livre.':'; recicle se a ligação estiver fechada.'),
   'Feche a segunda linha de passe e volte ao lado do VOLE se a pressão falhar.'],
  cae:['CA de apoio: venha no passe de '+(diamond?'MAT/MLG':'MAT/SA')+' e devolva para a corrida do CAD; gire só sem pressão nas costas.',
   'Feche o passe do ZG ao volante rival; avance para pressionar apenas com cobertura.'],
  cad:['CA de ruptura: observe o apoio do CAE e ataque o intervalo entre lateral e ZG; espere vantagem antes de pedir Lançam.',
   fast?'Oriente a pressão sem perseguir os dois ZG; se falhar, preserve a posição para a próxima saída.':'Feche a saída central sem gastar corrida contra os dois ZG; esteja disponível quando o bloco recuperar.'],
  mat:[diamond?'MAT: conecte MLG e CAE e procure CAD quando a cobertura sair.':'MAT: encontre SA central de frente; não ocupe a mesma linha do SA e dos dois CA.',
   diamond?'Cubra o volante rival com o MLG próximo; recomponha por dentro.':'Feche o passe ao volante rival com ajuda do SA; recue para não abandonar os dois VOL.'],
  mlg:['MLG: seja terceiro homem entre VOLD e MAT; chegue depois da tabela sem avançar junto do VOLE.',
   fast?'Inicie Pressão só se o VOL cobre; se o rival escapar, volte ao meio.':'Volte pelo meio para unir MAT aos dois VOL e diminuir a distância ao recuperar.'],
  sa:['SA central: seja a parede entre MAT e os dois CA; devolva de frente e libere o corredor do CAD.',
   fast?'Oriente a primeira pressão com MAT; se ela falhar, recomponha por dentro antes de perseguir ZG.':'Feche o apoio central da saída rival; ajude MAT sem recuar sobre a posição dos dois VOL.']
 };
 return special[slot]||task;
}
function counterGuide(mode,formation,slot,context={}){
 const cfg=COUNTER_GUIDES[mode];
 if(!cfg||!Object.hasOwn(cfg.formations,formation))return null;
 if(slot!==undefined&&slot!==null&&!COUNTER_SLOTS[formation].includes(slot))return null;
 const role=slot===undefined||slot===null?null:slotRole(slot);
 if(slot!==undefined&&slot!==null&&!role)return null;
 const task=role?cfg.roles[role]:null;
 if(role&&!task)return null;
 const slotTasks=task?counterSlotTasks(mode,formation,slot,task):null;
 return Object.freeze({
  mode,formation,label:cfg.label,attack:cfg.attack,defence:cfg.defence,risk:cfg.risk,
  formationAttack:cfg.formations[formation].attack,
  formationDefence:cfg.formations[formation].defence,
  ...(task?{role,slot,roleAttack:task[0],roleDefence:task[1],
   slotAttack:slotTasks[0],slotDefence:slotTasks[1]}:{}),
  decisions:counterDecisions(mode,formation),instructions:counterInstructions(mode,formation,context),
  slotMap:'Mapa de referência: VOLE (VOL esquerdo) protege, VOLD (VOL direito) liga; CAE (CA esquerdo) apoia e CAD (CA direito) rompe. Inverta os pares se as cartas e a movimentação pedirem, revendo também os alvos das instruções. É uma proposta por vaga, sem mudar sua escalação.',
  controls:'Mobile STANDARD (padrão, botões visíveis): Passe, Lançam., Acelerar, Chute; na defesa, Trocar, Pressão e Marcar de perto. Confira a Lista de comandos instalada: defesa Normal e Estilo de pressão usam acionamentos diferentes. Aqui os nomes indicam botões, não gestos universais.',
  validation:'Teste uma alteração por vez em séries de partidas semelhantes. Conte perdas no primeiro passe, chances limpas e bolas nas costas. A orientação é editorial; não há validação PvP desta combinação, nem promessa de meta.',
  officialSource:'https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00',
  evidence:'Guia tático de controle manual por formação e vaga. Não é ficha individual, nem prova de habilidade, ímpeto ou rendimento da carta.',
  source:'https://efhub.com/pt-BR/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed'
 });
}

const clauses={
 posse:[
 [/orquestrador|armador criativo|classico|meia versatil|primeiro volante/,17,'Apoio e controle pelo centro'],
 [/pivo|puxa marcacao|homem de area|infiltracao/,11,'Conexão ofensiva entre linhas'],
 [/lateral defensivo|defensor criativo/,9,'Segurança para saída curta']
 ],
 normal:[
 [/primeiro volante|meia versatil|lateral defensivo|defensor criativo/,15,'Equilíbrio defensivo na transição'],
 [/artilheiro|puxa marcacao|infiltracao|destruidor/,10,'Respostas ao recuperar a bola']
 ],
 rapido:[
 [/artilheiro|infiltracao|puxa marcacao|ala produtivo|lateral ofensivo/,17,'Ataque aos espaços'],
 [/meia versatil|destruidor|lateral defensivo/,10,'Recuperação e cobertura'],
 [/orquestrador|armador criativo/,5,'Passe de ligação']
 ],
 fora:[
 [/lateral ofensivo|lateral atacante|lateral movel|ala produtivo|perito em cruzamento/,16,'Amplitude funcional'],
 [/meia versatil|orquestrador|armador criativo/,10,'Mudança de corredor'],
 [/lateral defensivo/,6,'Equilíbrio sem subir o lateral']
 ],
 longo:[
 [/pivo|homem de area|artilheiro/,17,'Recepção e presença ofensiva'],
 [/destruidor|primeiro volante|meia versatil/,10,'Segunda bola e cobertura'],
 [/defensor criativo|orquestrador/,8,'Primeira distribuição']
 ],
 overload:[
 [/orquestrador|armador criativo|pivo/,14,'Apoios próximos para combinar no setor da bola'],
 [/meia versatil|lateral ofensivo|lateral movel/,12,'Deslocamentos para oferecer linhas de passe'],
 [/primeiro volante|defensor criativo|lateral defensivo/,8,'Cobertura dos espaços deixados pelos apoios']
 ]
};
const SKILL={
 posse:[/one.touch pass|passe de primeira|through passing|passe em profundidade/,9,'Habilidade de ligação curta'],
 normal:[/interception|interceptacao|one.touch pass|passe de primeira/,7,'Leitura da transição'],
 rapido:[/through passing|passe em profundidade|first.time shot|chute de primeira/,8,'Passe ou finalização rápida'],
 fora:[/weighted pass|passe na medida|low lofted pass|passe aereo baixo/,8,'Circulação lateral'],
 longo:[/heading|cabecada|aerial superiority|superioridade aerea|low lofted pass/,8,'Jogo aéreo ou lançamento'],
 overload:[/one.touch pass|passe de primeira|through passing|passe em profundidade/,9,'Combinação curta entre apoios próximos']
};
function score(card,slot,mode='posse'){
 if(!Object.hasOwn(MODES,mode))throw Error('Estilo de técnico não reconhecido');
 const placement=fit(card,slot);
 if(placement.score<0)return {score:-100,role:slotRole(slot),position:position(card),
  placement:placement.label,signals:[],confidence:'pendente',mode};
 const styles=norm([card?.estilo_ataque,card?.estilo_defesa,card?.attack_style,card?.defence_style].filter(Boolean).join(';'));
 const skill=norm(card?.habilidades_nativas||card?.native_skills||'');
 let result=placement.score,signals=[];
 for(const [rx,bonus,text] of clauses[mode])if(rx.test(styles)){result+=bonus;signals.push(text)}
 const [rx,bonus,text]=SKILL[mode];
 if(rx.test(skill)){result+=bonus;signals.push(text)}
 if(!styles){signals.push('Estilo da edição ainda não documentado')}
 if(!skill){signals.push('Habilidades nativas ainda não documentadas')}
 if(!placement.match)signals.push('Validar familiaridade real com a posição no jogo');
 if(!signals.length)signals.push('Posição cadastrada, sem prova suficiente sobre movimentação');
 return {
  score:Math.min(100,result),role:slotRole(slot),position:position(card),
  placement:placement.label,signals,
  confidence:placement.match&&styles&&skill?'comparativo_documental':'provisorio',
  mode,why:'Encaixe por posição/estilo/habilidade documentados, sem Overall, atributos ocultos ou testes inventados.'+
   (mode==='overload'?' Sobreposição: hipótese editorial, sem validação de rendimento em partidas.':'')
 };
}
function rank(cards,slot,mode,exclude=[],used=[]){
 if(!Array.isArray(cards))throw Error('Lista de cartas indisponível');
 const banned=new Set([...exclude,...used].map(Number));
 const identity=(typeof window!=='undefined'?window.SCOUT_PLAYER_IDENTITY_V245:null)||
  (typeof module==='object'&&module.exports?require('./scout-player-identity-v245.js'):null);
 const busyNames=new Set(cards.filter(c=>used.some(n=>Number(n)===Number(c.numero)))
  .map(c=>identity?.key(c)).filter(Boolean));
 return cards.filter(c=>!banned.has(Number(c.numero))&&
  (!identity||!busyNames.has(identity.key(c))))
 .map(c=>({card:c,...score(c,slot,mode)}))
 // V374: a positive comparison score is not proof of a usable secondary role.
 // fit/score remain available for conditional previews; recommendations require proof.
 .filter(x=>x.score>=0&&fit(x.card,slot).match)
 .sort((a,b)=>b.score-a.score||Number(a.card.numero)-Number(b.card.numero));
}

/* V392: 11 + 12 para as duas formações existentes. Este é um ranking
 * DOCUMENTAL de encaixe, não uma simulação de vitória, status final ou meta.
 * Usa apenas posição comprovada, identidade e sinais reais cadastrados.
 * Nunca escreve no banco de dados nem substitui plano salvo.
 */
function recommendSquad(cards,formation,mode,exclude=[]){
 if(!['normal','rapido'].includes(mode)||!Array.isArray(cards)||!formation||
   !['4312','4213'].includes(formation.id)||formation.starters?.length!==11)
  return null;
 const identity=(typeof window!=='undefined'?window.SCOUT_PLAYER_IDENTITY_V245:null)||
  (typeof module==='object'&&module.exports?require('./scout-player-identity-v245.js'):null);
 if(!identity?.key)throw Error('Identidade por pessoa indisponível: recomendação bloqueada');
 const excluded=new Set((Array.isArray(exclude)?exclude:[]).map(Number));
 const pool=cards.filter(c=>Number.isInteger(Number(c.numero))&&!excluded.has(Number(c.numero)));
 const names=new Set(),caps=new Set();
 const normStyle=c=>norm([c?.estilo_ataque,c?.estilo_defesa].filter(Boolean).join(' '));
 const bonus=(card,slot)=>{
  const t=normStyle(card);
  if(slot==='vole'&&/orquestrador|defensor criativo/.test(t))return 7;
  if(slot==='vold'&&/primeiro volante|destruidor/.test(t))return 7;
  if(slot==='zge'&&/destruidor/.test(t))return 6;
  if(slot==='zgd'&&/defensor criativo|construcao de jogo/.test(t))return 6;
  if(slot==='cae'&&/artilheiro|infiltracao/.test(t))return mode==='rapido'?8:5;
  if(slot==='cad'&&/pivo|homem de area|puxa marcacao|arrastar defesa/.test(t))return 7;
  if(slot==='mat'&&/armador criativo|jogador de infiltracao/.test(t))return 5;
  if(slot==='sa'&&/atacante pivo|infiltracao|puxa marcacao/.test(t))return 5;
  if(['le','ld'].includes(slot)&&/lateral defensivo/.test(t))return 7;
  return 0;
 };
 const optionCache=new Map();
 function options(slot){
  if(optionCache.has(slot))return optionCache.get(slot);
  const ordered=pool.flatMap(card=>{
   if(!fit(card,slot).match)return [];
   const info=score(card,slot,mode);
   if(info.score<0)return [];
   return [{card,slot,role:slotRole(slot),fit:info.placement,
    score:info.score,priority:info.score+bonus(card,slot),
    confidence:info.confidence,signals:info.signals.slice(0,3),
    source:'Ranking documental por posição, função e estilo: testar no jogo.'}];
  }).sort((a,b)=>b.priority-a.priority||b.score-a.score||
   Number(a.card.numero)-Number(b.card.numero));
  optionCache.set(slot,ordered);
  return ordered;
 }
 function pick(slot){
  const next=options(slot).find(item=>!caps.has(Number(item.card.numero))&&
   !names.has(identity.key(item.card)));
  if(!next)return null;
  caps.add(Number(next.card.numero));names.add(identity.key(next.card));
  return Object.freeze({slot,role:next.role,cap:Number(next.card.numero),
   name:next.card.name,fit:next.fit,score:next.score,
   confidence:next.confidence,signals:Object.freeze(next.signals),
   source:next.source});
 }
 const order=formation.starters.map(x=>x.slot).sort((a,b)=>{
  const aDemand=formation.starters.filter(x=>slotRole(x.slot)===slotRole(a)).length;
  const bDemand=formation.starters.filter(x=>slotRole(x.slot)===slotRole(b)).length;
  return options(a).length/aDemand-options(b).length/bDemand||
   a.localeCompare(b);
 });
 const starterMap=new Map();
 for(const slot of order){const choice=pick(slot);if(choice)starterMap.set(slot,choice);}
 const starters=formation.starters.map(x=>starterMap.get(x.slot)).filter(Boolean);
 // Banco funcional por vaga, sem permitir duas cartas da mesma pessoa.
 const needs=['go','zge','zgd','le','ld','vole','vold','mlg','mat','sa','cae','cad'];
 const bench=[];
 for(const slot of needs){
  const choice=pick(slot);
  if(choice)bench.push(choice);
 }
 const slots=Object.fromEntries(starters.map(s=>[s.slot,s.cap]));
 const ready=starters.length===11&&bench.length===12;
 const pending=starters.filter(s=>s.confidence!=='comparativo_documental').length+
  bench.filter(s=>s.confidence!=='comparativo_documental').length;
 return Object.freeze({formation:formation.id,mode,starters:Object.freeze(starters),
  bench:Object.freeze(bench),slots:Object.freeze(slots),ready,pending,
  excluded:excluded.size,method:'encaixe documental e complementaridade por função; não é prova de melhor rendimento',
  warnings:Object.freeze([
   ...(starters.length!==11?['Não há 11 posições elegíveis confirmadas. Não aplicar escalação incompleta.']:[]),
   ...(bench.length!==12?['Banco incompleto: faltam reservas comprovadamente elegíveis para algumas funções.']:[]),
   ...(pending?['Algumas edições não têm todos os sinais documentados: conferir fichas antes de investir PP, habilidades ou ímpetos.']:[])
  ])});
}

return Object.freeze({MODES,POS,position,slotRole,fit,score,rank,counterGuide,recommendSquad});
});
