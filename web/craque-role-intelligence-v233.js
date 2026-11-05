/* Craque Tático V233 — leitura interpretativa de TODAS as posições (2027).
 * Modelo heurístico, sem Overall; NÃO calcula atributos finais sem fonte exata.
 * Leituras e propostas são somente consultivas; treino homologado nunca é alterado.
 * Mapa de categorias: Chute, Passe, Drible, Destreza, Pernas, Aéreo,
 * Defesa, GO1 (consciência/salto), GO2 (firmeza/rebote e alcance),
 * GO3 (segurança nas mãos/reflexos). Valores de categoria != status final.
 */
(function(host){
 'use strict';
 const T=host?.SCOUT_TACTICS_V220||
  (typeof module==='object'&&module.exports?require('./scout-multitactic-engine-v220.js'):null);
 const CATEGORY=Object.freeze([
  {name:'Chute',stats:'Finalização, bola parada e curva'},
  {name:'Passe',stats:'Passe rasteiro e passe alto'},
  {name:'Drible',stats:'Controle de bola, drible e posse apertada'},
  {name:'Destreza',stats:'Consciência ofensiva, aceleração e equilíbrio'},
  {name:'Força das pernas',stats:'Velocidade, potência de chute e resistência'},
  {name:'Jogo aéreo',stats:'Salto, contato físico e cabeceio'},
  {name:'Defesa',stats:'Consciência defensiva, engajamento, desarme e agressividade'},
  {name:'Goleiro 1',stats:'Consciência de goleiro e salto'},
  {name:'Goleiro 2',stats:'Rebatida/firmeza do goleiro e alcance'},
  {name:'Goleiro 3',stats:'Segurança de mãos e reflexos de goleiro'}
 ]);
 const ROLES=Object.freeze({
  GO:{name:'Goleiro',job:'Fechar ângulos, reagir perto da meta e controlar rebotes.',weights:[0,0,0,0,0,0,0,27,29,30],
   tests:['1 × 1 e finalizações à queima-roupa','Chutes colocados nos cantos','Rebotes cedidos e saída em cruzamentos']},
  ZG:{name:'Zagueiro',job:'Proteger profundidade, antecipar passes e disputar contato sem abandonar a linha.',weights:[0,5,0,8,24,23,32,0,0,0],
   tests:['Cobertura contra atacante rápido','Interceptações e tempo do bote','Contato, salto e disputa de segunda bola']},
  VOL:{name:'Volante',job:'Proteger a frente da zaga, recuperar e oferecer linha de passe segura.',weights:[1,20,5,7,17,13,29,0,0,0],
   tests:['Cortes entrelinhas e interceptações','Primeiro passe após recuperar','Cobertura quando os laterais avançam']},
  LD:{name:'Lateral direito',job:'Equilibrar cobertura do corredor, recuperação e apoio à construção.',weights:[3,15,9,11,26,8,24,0,0,0],
   tests:['Cobertura às costas do lateral','Tabelas para sair da pressão','Retorno defensivo e desgaste']},
  LE:{name:'Lateral esquerdo',job:'Equilibrar cobertura do corredor, recuperação e apoio à construção.',weights:[3,15,9,11,26,8,24,0,0,0],
   tests:['Cobertura às costas do lateral','Tabelas para sair da pressão','Retorno defensivo e desgaste']},
  MLG:{name:'Meia central',job:'Conectar setores, circular sob pressão e sustentar a recomposição.',weights:[6,25,16,20,19,4,11,0,0,0],
   tests:['Qualidade e tempo do passe curto','Giros e domínio sob pressão','Apoio sem bola e recuperação no meio']},
  MAT:{name:'Meia-atacante',job:'Encontrar o passe decisivo entrelinhas e criar a última ação.',weights:[13,30,23,25,11,1,3,0,0,0],
   tests:['Passes que quebram linhas','Domínio e giro sob marcação','Timing da chegada e finalização']},
  SA:{name:'Segundo atacante',job:'Apoiar os dois centroavantes, tabelar e atacar intervalos.',weights:[23,23,22,28,18,7,1,0,0,0],
   tests:['Tabelas em espaço curto','Desmarque e ataque ao intervalo','Equilíbrio nas finalizações pressionadas']},
  CA:{name:'Centroavante',job:'Oferecer ruptura ou pivô de acordo com o estilo registrado da carta.',weights:[32,10,13,26,23,19,0,0,0,0],
   tests:['Corridas de ruptura no instante do passe','Finalização após domínio ou de primeira','Proteção de costas para a zaga']},
  ALA:{name:'Jogador de lado',job:'Dar amplitude quando a tática pedir e oferecer ruptura ou apoio central.',weights:[17,17,26,23,26,3,5,0,0,0],
   tests:['Condução acelerada','Passe de retorno para o centro','Reposição defensiva após perda']}
 });
 const MODES=Object.freeze({
  posse:{delta:[-1,9,9,4,-2,-1,0,0,0,0],phrase:'Apoio curto, triangulação e segurança ao circular.'},
  normal:{delta:[2,3,0,3,4,3,5,0,1,1],phrase:'Transição controlada e recuperação organizada.'},
  rapido:{delta:[3,-1,2,9,10,0,3,0,3,7],phrase:'Arranque, reação à perda e proteção da profundidade.'},
  fora:{delta:[2,5,8,2,7,3,1,0,0,0],phrase:'Amplitude com opção de passe de retorno pelo meio.'},
  longo:{delta:[3,5,-3,-1,6,10,5,2,5,0],phrase:'Disputa aérea e organização da segunda bola.'}
 });
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const nInt=v=>Number.isInteger(v)&&v>=0&&v<=20;
 const number=v=>Number.isInteger(Number(v))?Number(v):null;
 const vecOk=v=>T?.valid?.(v)===true;
 const ppCost=n=>T.ppCost(n);
 const role=c=>T?.roleOf?.(c)||null;
 // V256: PP matematicamente fechados NÃO comprovam nível/edição.
 // Sem origem confirmada do orçamento, não gerar ficha automática.
 function levelDocumented(card){
  const level=card?.max_level;
  return Number.isInteger(level)&&level>=1&&level<=120&&
   Number.isInteger(Number(card?.pp))&&Number(card.pp)===2*(level-1)&&
   card?.pp_estimated!==true&&card?.pp_estimado!==true&&
   /^informado_pelo_usuario_/.test(String(card?.pp_origem||''));
 }
 // V257: CAP, Card ID e edição podem chegar de duas fontes (catálogo/ficha).
 // Divergência entre aliases NÃO autoriza redistribuir a build.
 // Posições original/treinada são intencionalmente distintas e não conflitam.
 function identityIssues(card){
  if(!card||typeof card!=='object')return ['Carta ausente'];
  const value=v=>String(v??'').trim();
  const issues=[];
  for(const [a,b,label] of [['capture','numero','CAP'],['id','card_id','Card ID'],
    ['edition','versao','Edição']]){
   const left=value(card[a]),right=value(card[b]);
   if(!left||!right)continue;
   if(label==='CAP'){
    const valid=s=>/^\d+$/.test(s)&&Number.isSafeInteger(Number(s))&&Number(s)>0;
    if(!valid(left)||!valid(right)||Number(left)!==Number(right))
     issues.push('CAP divergente entre cadastro e ficha');
   }else if(left!==right)issues.push(label+' divergente entre cadastro e ficha');
  }
  return issues;
 }
 function fingerprints(card){
  return [number(card.capture??card.numero),String(card.id||card.card_id||'').trim(),
   String(card.edition||card.versao||'').trim()];
 }
 function interpretSignals(card,roleId,weights){
  const offense=clean(card.attack_style||card.estilo_ataque);
  const defense=clean(card.defence_style||card.estilo_defesa);
  const native=clean(card.native_skills||card.habilidades_nativas).split(';').map(x=>x.trim()).filter(Boolean);
  const fixed=String(card.boost1||card.impeto_fixo||'').trim();
  const hints=[];
  const tweak=(indexes,points,why)=>{for(const i of indexes)weights[i]+=points;hints.push(why)};
  // O mesmo estilo de jogo NÃO força a mesma ficha: as habilidades e o papel diferenciam as escolhas.
  if(/destruidor/.test(defense+' '+offense)&&['ZG','VOL','LD','LE'].includes(roleId))
   tweak([6,4],5,'Destruidor: tempo de desarme e recuperação física são decisivos.');
  if(/defensor criativo|zagueiro construtor|build up/.test(defense+' '+offense)&&roleId==='ZG')
   tweak([1,6],5,'Defensor criativo: passe seguro na saída, sem perder cobertura.');
  if(/primeiro volante|ancora|anchor man/.test(offense+' '+defense)&&roleId==='VOL')
   tweak([6,5],6,'Primeiro volante: fechar a frente da área e proteger contato.');
  if(/orquestrador/.test(offense+' '+defense)&&['VOL','MLG','MAT'].includes(roleId))
   tweak([1,2],6,'Orquestrador: receber orientado e ditar o ritmo da circulação.');
  if(/meia versatil/.test(offense+' '+defense)&&['VOL','MLG','MAT'].includes(roleId))
   tweak([3,4],5,'Meia versátil: ida e volta e fôlego na recomposição.');
  if(/infiltracao/.test(offense)&&['MLG','MAT','SA'].includes(roleId))
   tweak([3,0],6,'Infiltração: tempo de chegada à área e finalização.');
  if(/armador criativo|classic[o ]*10|classico 10/.test(offense)&&['MAT','SA','MLG'].includes(roleId))
   tweak([1,2],6,'Armador: passe vertical e domínio sob pressão.');
  if(/artilheiro|matador|oportunista/.test(offense)&&['CA','SA'].includes(roleId))
   tweak([0,3],7,'Artilheiro: posição de finalização e desmarque curto.');
  if(/atacante pivo|deep.lying forward/.test(offense)&&['CA','SA'].includes(roleId))
   tweak([1,2],7,'Atacante pivô: recuar para conectar passes e receber entrelinhas; leitura de função, sem bônus numérico oficial.');
  else if(/homem de area|pivo|arrastar defesa|puxa marcacao/.test(offense)&&['CA','SA'].includes(roleId))
   tweak([5,1],7,'Pivô/arrastar marcação: contato, recepção e tabelas.');
  if(/lateral defensivo/.test(offense+' '+defense)&&['LD','LE'].includes(roleId))
   tweak([6,5],7,'Lateral defensivo: cobertura e proteção do corredor.');
  if(/lateral ofensivo|lateral atacante|ala produtivo|lateral movel/.test(offense+' '+defense)&&['LD','LE','ALA'].includes(roleId))
   tweak([4,1,3],4,'Lateral de apoio: progressão e passe sem perder recomposição.');
  const has=re=>native.some(s=>re.test(s));
  if(has(/one.touch pass|passe de primeira|one touch pass|through pass|passe em profundidade|weighted pass|passe na medida/)&&roleId!=='GO')
   tweak([1],4,'Habilidades nativas de passe oferecem recurso comprovado; execução ainda depende de atributos.');
  if(has(/double touch|toque duplo|sole control|controle com a sola|marseille turn|giro de marselha/)&&['CA','SA','MAT','MLG','ALA','LD','LE'].includes(roleId))
   tweak([2],4,'Habilidades nativas de controle: considerar drible e posse apertada.');
  if(has(/heading|aerial superiority|cabec|superioridade aerea/)&&['CA','SA','ZG','VOL','LD','LE'].includes(roleId))
   tweak([5],5,'Recurso aéreo nativo: confrontar salto e contato antes de investir.');
  if(has(/interception|blocker|intercept|bloqueador|acrobatic clear|afastamento acrobatico/)&&['ZG','VOL','LD','LE','MLG'].includes(roleId))
   tweak([6],5,'Recurso defensivo nativo: posicionamento e desarme merecem revisão.');
  if(has(/first.time shot|phenomenal finishing|finalizacao fenomenal|chute de primeira/)&&['CA','SA','MAT'].includes(roleId))
   tweak([0],5,'Finalização nativa: avaliar chance real criada, não só Overall.');
  if(roleId==='GO'&&has(/gk low punt|gk long throw|reposicao|arremesso longo/))
   hints.push('Reposição nativa registrada; não pressupor ganho de alcance ou reflexos.');
  if(fixed)hints.push('Ímpeto fixo declarado: '+fixed+'. Efeitos finais e slot extra não somados sem confirmação.');
  return hints;
 }
 function interpret(card,tactic,lab){
  if(!T||!card||typeof card!=='object'||!Object.hasOwn(MODES,tactic))return null;
  const roleId=role(card),rule=ROLES[roleId];if(!rule)return null;
  const [capture,id,edition]=fingerprints(card);
  const budget=number(card.pp);
  const levels=card.recommended_levels||card.niveis;
  const confirmed=vecOk(levels)&&budget!==null&&T.total(levels)===budget;
  const ppEstimated=card.pp_estimated===true||card.pp_estimado===true;
  const hasLevelEvidence=levelDocumented(card);
  const inconsistentIdentity=identityIssues(card);
  const weights=rule.weights.map((w,i)=>Math.max(0,w+MODES[tactic].delta[i]));
  const hints=interpretSignals(card,roleId,weights);
  if(roleId==='GO'){
   // Efeito tático hipotético para GO: peso muda, mas prioridade sempre GO1/2/3.
   if(tactic==='posse')weights[7]+=5;
   if(tactic==='rapido')weights[9]+=4;
   if(tactic==='longo')weights[8]+=4;
  }
  const indices=roleId==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
  const priorities=indices.map(i=>({
   index:i,name:CATEGORY[i].name,stats:CATEGORY[i].stats,weight:weights[i],
   registered:confirmed?levels[i]:null,
   nextCost:confirmed&&levels[i]<20?ppCost(levels[i]+1)-ppCost(levels[i]):null
  })).sort((a,b)=>b.weight-a.weight||a.index-b.index);
  const knownBase=[];
  if(card.base_stats_known===true && lab?.stats&&typeof lab.stats==='object'){
   for(const [name,entry] of Object.entries(lab.stats)){
    if(entry&&typeof entry==='object'&&Number.isFinite(entry.base)&&entry.base>=0&&entry.base<=120){
     knownBase.push({name,base:entry.base}); // NUNCA somar boost/mgr sem prova.
    }
   }
  }
  const tradeoffs=[];
  if(confirmed){
   const high=priorities.slice(0,3);
   for(const p of high){
    if(p.registered<=2)tradeoffs.push(p.name+': apenas '+p.registered+' nível(is) na ficha atual; revisar a necessidade para este papel, sem presumir atributo fraco.');
   }
   const expensive=priorities.find(p=>p.registered>=13&&p.nextCost>=4);
   if(expensive)tradeoffs.push(expensive.name+': a próxima progressão custaria '+expensive.nextCost+' PP; compare o custo marginal com outra categoria.');
  }else tradeoffs.push('Treino e PP desta edição não coincidem ou ainda não foram confirmados: proposta automática suspensa.');
  if(ppEstimated)tradeoffs.push('Orçamento PP classificado como estimado: validar no jogo antes de qualquer redistribuição.');
  if(!hasLevelEvidence)tradeoffs.push('Nível máximo/PP da edição sem confirmação documental: somente interpretação, sem redistribuição automática.');
  if(!id||!edition||capture===null)tradeoffs.push('Identidade/edição incompleta: conferir número da carta e Card ID antes de comparar.');
  if(inconsistentIdentity.length)tradeoffs.push('DADOS DA EDIÇÃO EM CONFLITO: '+inconsistentIdentity.join('; ')+'. Proposta suspensa até reconciliação.');
  if(roleId==='GO')tradeoffs.push('GO1 = consciência/salto; GO2 = rebatida/alcance; GO3 = segurança de mãos/reflexos. São pares de atributos, não 5 ajustes independentes.');
  if(roleId==='ZG')tradeoffs.push('Defesa, força das pernas e jogo aéreo se complementam; não assumir velocidade final nem alcance de pernas sem dados.');
  const evidence=[
   'Posição registrada: '+rule.name,
   'Estilo de jogo da carta: '+String(card.attack_style||card.estilo_ataque||'não documentado'),
   'Edição: '+(edition||'pendente'),
   String(card.native_skills||card.habilidades_nativas||'').trim()?'Habilidades nativas cadastradas':'Habilidades nativas não confirmadas',
   confirmed?'PP fecham matematicamente (não comprova o nível máximo)':'Treino registrado sem custo integral conferido'
  ];
  const uncertainty=(!confirmed||!hasLevelEvidence||ppEstimated||!id||!edition||capture===null||inconsistentIdentity.length)?'pendente':
   !knownBase.length?'documental':'parcial_com_atributos_base';
  return {
   capture,id,edition,budget,confirmed,levelDocumented:hasLevelEvidence,
   identityIssues:inconsistentIdentity,ppEstimated,role:roleId,position:rule.name,
   job:rule.job,tactic,mode:MODES[tactic].phrase,weights,priorities,signals:hints,
   knownBase,tradeoffs,evidence,uncertainty,
   tests:rule.tests,
   categoryMap:CATEGORY,
   warning:'Interpretação orientada por posição e evidências do cadastro; NÃO comprova meta, animações, atributos finais ou superioridade em partida.'
  };
 }
 const INDIVIDUAL_VERSION='prioridades-por-acao-v390';
 const AXES={
  normal:{0:['finishing'],1:['low_pass','lofted_pass'],2:['ball_control','tight_possession'],
   3:['acceleration','balance'],4:['speed','stamina'],5:['physical_contact','jumping'],
   6:['defensive_awareness','tackling','defensive_engagement']},
  rapido:{0:['finishing'],1:['low_pass','lofted_pass'],2:['ball_control','dribbling'],
   3:['offensive_awareness','acceleration','balance'],4:['speed','stamina'],5:['physical_contact'],
   6:['tackling','defensive_engagement']},
  fora:{0:['finishing'],1:['low_pass','lofted_pass'],2:['ball_control','dribbling','tight_possession'],
   3:['acceleration','balance'],4:['speed','stamina'],5:['heading','jumping'],
   6:['defensive_awareness','defensive_engagement']},
  longo:{0:['finishing'],1:['lofted_pass'],2:['ball_control','tight_possession'],
   3:['offensive_awareness','balance'],4:['speed','stamina'],5:['heading','jumping','physical_contact'],
   6:['defensive_awareness','tackling','defensive_engagement']}
 };
 const KEEPER_AXES={7:['gk_awareness'],8:['gk_parrying','gk_reach'],9:['gk_catching','gk_reflexes']};
 const TASK_LABELS={normal:'transição organizada',rapido:'transição rápida',fora:'progressão pelo corredor',longo:'ligação direta e segunda bola'};
 const STAT_LABELS={finishing:'finalização',low_pass:'passe rasteiro',lofted_pass:'passe alto',
  ball_control:'controle de bola',tight_possession:'condução firme',dribbling:'drible',offensive_awareness:'talento ofensivo',
  acceleration:'aceleração',balance:'equilíbrio',speed:'velocidade',stamina:'resistência',physical_contact:'contato físico',
  jumping:'salto',heading:'cabeceio',defensive_awareness:'talento defensivo',tackling:'desarme',
  defensive_engagement:'dedicação defensiva',gk_awareness:'talento de goleiro',gk_parrying:'rebatida do goleiro',
  gk_reach:'alcance do goleiro',gk_catching:'segurança nas mãos',gk_reflexes:'reflexos do goleiro'};
 const TACTICAL_SOURCE='https://efhub.com/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed';
 const DEFENCE_SOURCE='https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00';
 const ACCURACY_SOURCE='https://efhub.com/articles/261019_3-passing-and-finishing-the-threshold-is-90-for-both';
 const accuracyStats=new Set(['low_pass','lofted_pass','finishing','heading']);
 const ACTIONS={
  depth:{label:'Atacar a profundidade e finalizar',stats:{acceleration:5,offensive_awareness:3,finishing:3,speed:2,ball_control:1},skills:['firstshot','onepass','acrobatic','sole'],source:'https://efhub.com/articles/261017_4-acceleration-thresholds-decoded'},
  outlet:{label:'Girar e dar o primeiro passe após recuperar',stats:{low_pass:3,ball_control:3,tight_possession:2,balance:2,acceleration:1,lofted_pass:1},skills:['onepass','sole','through','heel'],source:TACTICAL_SOURCE},
  vertical:{label:'Receber entre linhas e acelerar o passe vertical',stats:{low_pass:3,tight_possession:3,ball_control:2,balance:2,acceleration:2},skills:['through','onepass','sole','heel'],source:TACTICAL_SOURCE},
  cover:{label:'Acompanhar a ruptura e proteger as costas da linha',stats:{speed:3,acceleration:3,defensive_awareness:3,defensive_engagement:2,tackling:2,stamina:1},skills:['intercept','blocker','mark','fighting'],source:DEFENCE_SOURCE},
  duel:{label:'Sair para o bote e ganhar o duelo',stats:{tackling:3,defensive_engagement:3,physical_contact:3,acceleration:2,defensive_awareness:2},skills:['intercept','blocker','mark','clear'],source:DEFENCE_SOURCE},
  screen:{label:'Cortar a linha de passe e oferecer saída segura',stats:{defensive_engagement:3,defensive_awareness:3,tackling:2,low_pass:3,stamina:2},skills:['intercept','onepass','blocker','fighting'],source:DEFENCE_SOURCE},
  carry:{label:'Avançar pelo corredor e entregar um passe útil',stats:{dribbling:3,ball_control:3,tight_possession:2,acceleration:2,low_pass:2,stamina:1},skills:['double','sole','onepass','cutturn'],source:'https://efhub.com/articles/260909_2-major-changes-to-how-dribbling-feels'},
  cross:{label:'Chegar pelo lado e entregar a bola na área',stats:{lofted_pass:3,ball_control:2,dribbling:2,speed:2,stamina:2},skills:['sole','double','onepass'],source:DEFENCE_SOURCE},
  finish:{label:'Chegar à área para concluir a jogada do corredor',stats:{finishing:3,offensive_awareness:3,heading:2,ball_control:2,balance:1},skills:['firstshot','acrobatic','heading','aerial'],source:TACTICAL_SOURCE},
  launch:{label:'Lançar com precisão e sustentar a segunda bola',stats:{lofted_pass:3,low_pass:2,ball_control:2,tight_possession:2,defensive_engagement:2,stamina:1},skills:['weighted','lowloft','through','onepass'],source:TACTICAL_SOURCE},
  receive:{label:'Dominar de costas e devolver a segunda bola',stats:{ball_control:3,tight_possession:3,physical_contact:3,heading:2,jumping:2,low_pass:1},skills:['onepass','sole','aerial','heading'],source:TACTICAL_SOURCE},
  keeper:{label:'Reagir ao chute e controlar a segunda bola',stats:{gk_awareness:3,gk_reflexes:3,gk_parrying:2,gk_reach:2,gk_catching:1},skills:['gklow','gklong','gkhigh'],source:DEFENCE_SOURCE}
 };
 const attributeGroups=Object.assign({},...Object.values(AXES).concat(KEEPER_AXES).flatMap(groups=>
  Object.entries(groups).map(([index,keys])=>Object.fromEntries(keys.map(key=>[key,Number(index)])))));
 function actionKey(role,tactic,card){
  const style=clean(card.style),defence=clean(card.defenceStyle),fn=card.trainingFunction;
  const pivot=/pivo|homem de area/.test(style);
  const lateral=role==='LD'||role==='LE';
  if(role==='GO')return 'keeper';
  if(card.trainingDefensive)return role==='ZG'||lateral?'cover':role==='VOL'||role==='MLG'?'screen':'outlet';
  if(fn==='anchor')return 'screen';
  if(fn==='cover'||fn==='secure')return 'cover';
  if(fn==='pivot')return 'receive';
  if(fn==='infiltrate'||fn==='finish')return tactic==='fora'?'finish':'depth';
  if(fn==='connect'||fn==='create')return tactic==='longo'?'launch':tactic==='rapido'?'vertical':'outlet';
  if(role==='CA'||role==='SA'){
   if(pivot)return 'receive';
   if(tactic==='fora')return 'finish';
   if(role==='SA'&&!/artilheiro|infiltracao|oportunista/.test(style))return 'vertical';
   return 'depth';
  }
  if(role==='ZG'){
   if(/destruidor/.test(style+' '+defence))return 'duel';
   if(tactic==='longo'&&/construcao|criativo/.test(style))return 'launch';
   return 'cover';
  }
  if(lateral&&/defensivo|destruidor/.test(style+' '+defence))return 'cover';
  if(tactic==='fora'&&(role==='ALA'||lateral))return lateral||/perito em cruzamento/.test(style)?'cross':'carry';
  if(role==='VOL'&&/primeiro volante|trinco|ancora/.test(style+' '+defence))return 'screen';
  if(tactic==='longo')return 'launch';
  if(tactic==='rapido'&&lateral)return 'cover';
  if(tactic==='rapido'&&/infiltracao/.test(style))return 'depth';
  if(tactic==='rapido'&&role==='ALA')return 'carry';
  return tactic==='rapido'?'vertical':'outlet';
 }
 const SPECIAL_SKILLS=[
  [0,'phenomenal finishing','Finalização fenomenal'],[1,'visionary pass','Passe visionário'],
  [2,'magnetic feet','Pés magnéticos'],[5,'aerial superiority','Superioridade aérea'],
  [6,'sliding tackle','Carrinho']
 ];
 const clamp=(x,min,max)=>Math.max(min,Math.min(x,max));
 const round=x=>Math.round(x*100)/100;
 const avg=values=>values.reduce((sum,value)=>sum+value,0)/values.length;
 const canonicalSkill=value=>clean(value).replace(/[^a-z0-9]+/g,' ').trim();
 function individualReference(card,entry){
  const ref=entry?.reference,id=String(card?.cardId??card?.id??card?.card_id??''),edition=String(card?.edition??card?.versao??'');
  if(entry?.identityUsable!==true||!ref||!/^\d{5,20}$/.test(id)||String(ref.cardId)!==id||!edition||
     ![entry.edition,ref.edition].includes(edition)||
     !/^https:\/\/[^/\s]+\/[^\s]+$/.test(String(ref.url||''))||
     !/^[a-f0-9]{64}$/i.test(String(ref.htmlSha256||'')))return null;
  if(entry.cardId&&String(entry.cardId)!==id)return null;
  const capture=Number(card?.capture??card?.numero);
  if(Number.isInteger(capture)&&capture>0&&capture!==entry.capture)return null;
  return ref;
 }
 function evidenceSignature(value){
  const data=JSON.stringify(value);let h=2166136261;
  for(let i=0;i<data.length;i++)h=Math.imul(h^data.charCodeAt(i),16777619)>>>0;
  return INDIVIDUAL_VERSION+':'+data.length+':'+h.toString(16);
 }
 function refineIndividual({weights,role,tactic,card,reference}){
  const refined=weights.slice(),factors=[];
  let utility=null,task=null;
  const priorities=()=>refined.flatMap((weight,index)=>weight>0?[
   {index,name:CATEGORY[index].name,category:CATEGORY[index].name,weight}]:[]).sort((a,b)=>b.weight-a.weight||a.index-b.index);
  const finish=(status,reason,ref=null)=>({weights:refined,utility,analysis:{version:INDIVIDUAL_VERSION,role,tactic,status,reason,factors,task,priorities:priorities(),
   evidenceSignature:ref?evidenceSignature([ref.cardId,ref.edition,ref.url,ref.htmlSha256,role,tactic,factors,task]):null,
   reference:ref?{cardId:ref.cardId,edition:ref.edition,url:ref.url,htmlSha256:ref.htmlSha256}:null}});
  if(tactic==='posse')return finish('preservada','Prioridades da Posse de Bola preservadas.');
  const ref=individualReference(card,reference);
  if(!ref||!Object.hasOwn(AXES,tactic)||!Object.hasOwn(ROLES,role))
   return finish('dados_insuficientes','Atributos-base com origem e vínculo à edição exata ainda pendentes.');
  const axes=role==='GO'?KEEPER_AXES:AXES[tactic];
  const axesForRole=Object.entries(axes).filter(([i])=>ROLES[role].weights[i]>0&&weights[i]>0);
  const groups=axesForRole.map(([i,keys])=>({index:Number(i),attributes:keys.flatMap(key=>{
   const value=ref.baseStats?.[key];
   return Number.isInteger(value)&&value>=0&&value<=120?[{key,label:STAT_LABELS[key],value}]:[];
  })})).filter(g=>g.attributes.length);
  if(groups.length<2)return finish('dados_insuficientes','Base numérica documentada insuficiente para comparar as prioridades da função.',ref);
  const complete=groups.reduce((n,g)=>n+g.attributes.length,0)===axesForRole.reduce((n,[,keys])=>n+keys.length,0);
  const nativeList=reference.candidateSkillsMatch===false?[]:ref.nativeSkills;
  const skills=new Set((Array.isArray(nativeList)?nativeList:[]).map(canonicalSkill));
  const declaredFixed=clean(card.fixedBooster||card.impeto_fixo||card.boost1);
  const fixed=(Array.isArray(ref.fixedBoosters)?ref.fixedBoosters:[]).filter(b=>
   typeof b?.name==='string'&&b.name.trim()&&b.stats&&typeof b.stats==='object'&&
   !Array.isArray(b.stats)&&Object.keys(b.stats).length>0&&
   Object.values(b.stats).every(n=>Number.isInteger(n)&&n>=1&&n<=5)&&
   (!declaredFixed||/pendente|nao confirmado|nao exposto/.test(declaredFixed)||declaredFixed.includes(clean(b.name))));
  const key=actionKey(role,tactic,card),action=ACTIONS[key];
  const stats=Object.entries(action.stats).flatMap(([stat,weight])=>{
   const group=attributeGroups[stat],base=ref.baseStats?.[stat];
   if(!Number.isInteger(base)||base<0||base>120||!Number.isInteger(group)||refined[group]<=0)return [];
   return [{key:stat,label:STAT_LABELS[stat],group,weight,base,trainLimit:Math.max(0,99-base),
    fixed:fixed.reduce((n,b)=>n+(b.stats[stat]||0),0),
    ...(accuracyStats.has(stat)?{study:ACCURACY_SOURCE}:{})}];
  });
  if(stats.length>=2){
   task={key,label:action.label,skills:action.skills,source:action.source,stats};
   utility=Array(10).fill(null);
   for(const stat of stats){
    const curve=utility[stat.group]||(utility[stat.group]=Array(21).fill(0));
    let gain=0;
    for(let n=1;n<=20;n++){
     const projected=stat.base+stat.fixed+n-1;
     // Retorno editorial por ponto no atributo da ação. Não simula a IA,
     // bônus de técnico, condição, nem um limite universal de desempenho.
     const sensitivity=clamp((115-projected)/35,0.25,1.4);
     // Razões aproximadas entre as inclinações do estudo de precisão.
     // A faixa 60–90 é a unidade. Os pesos da ação continuam editoriais.
     const returnFactor=stat.study?(projected<60?0.1875:projected<90?1:5/12):
      stat.key==='acceleration'&&projected>=90?0.4:1;
     if(n<=stat.trainLimit)gain+=1.65*stat.weight*sensitivity*returnFactor;
     curve[n]=round(curve[n]+gain);
    }
   }
  }
  // Editorial comparison within the same card. Compare the documented axes
  // required by the task, rather than assuming a universal gameplay target.
  const centre=avg(groups.map(g=>avg(g.attributes.map(a=>a.value))));
  for(const {index,attributes} of groups){
   const category=CATEGORY[index].name;
   const relevance=Math.min(1,ROLES[role].weights[index]/12);
   const modifiers=[];
   const apply=(kind,delta,reason,details={})=>{
    const adjusted=round(Math.max(0,refined[index]+relevance*delta));
    const applied=round(adjusted-refined[index]);
    if(applied===0)return;
    refined[index]=adjusted;modifiers.push({kind,delta:applied,reason,...details});
   };
   const stats=attributes.map(a=>a.label+' '+a.value).join(', ');
   const baseDelta=clamp((centre-avg(attributes.map(a=>a.value)))/3,-6,6);
   apply('base',baseDelta,stats+' · '+(baseDelta>0?'reforçar uma margem da edição':'preservar uma força da edição')+' para '+TASK_LABELS[tactic]+'.',{attributes});
   for(const booster of fixed){
    const coverage=attributes.filter(a=>Object.hasOwn(booster.stats,a.key));
    if(coverage.length)apply('fixed',-avg(attributes.map(a=>booster.stats[a.key]||0))/3,
     booster.name+' já cobre '+coverage.map(a=>a.label).join(', ')+' na referência da edição.');
   }
   const special=SPECIAL_SKILLS.find(([group,key])=>group===index&&skills.has(key));
   if(special)apply('native',1.25,special[2]+' é nativa documentada e complementa este recurso.');
   // Height has a small supporting role in aerial tasks with documented
   // heading and jumping. No score is derived from height on its own.
   if(index===5&&['fora','longo'].includes(tactic)&&Number.isInteger(ref.height)&&ref.height>=120&&ref.height<=230&&
      attributes.some(a=>a.key==='heading')&&attributes.some(a=>a.key==='jumping'))
    apply('height',clamp((180-ref.height)/12,-1.5,1.5),
     ref.height+' cm considerados junto ao cabeceio e salto na disputa aérea.',{height:ref.height});
   const delta=round(refined[index]-weights[index]);
   if(delta){
    const reason=modifiers.map(item=>item.reason).join(' ');
    factors.push({index,category,delta,reason,text:reason,label:category,attributes,
     modifiers,previousWeight:weights[index],weight:refined[index]});
   }
  }
  if(!factors.length&&!utility)return finish('calculada','A evidência disponível não alterou as prioridades desta função.',ref);
  return finish(complete?'documentada':'calculada',complete?
   'Prioridades refinadas com dados da edição e ganhos por nível na ação escolhida, em simulação de PP.':
   'Prioridades refinadas com os atributos disponíveis. A base desta função está incompleta.',ref);
 }
 function rating(vec,weights,indices){
  return indices.reduce((acc,i)=>{
   const x=vec[i],excess=Math.max(0,x-8);
   return acc+weights[i]*(x-.05*excess*excess);
  },0);
 }
 function compare(card,tactic,lab){
  const analysis=interpret(card,tactic,lab);
  if(analysis?.identityIssues?.length)return {analysis,proposal:null,
   reason:'CAP, Card ID ou edição divergentes entre cadastro e ficha. Concilie os dados da mesma carta antes de comparar PP.'};
  if(!analysis||!analysis.confirmed||!analysis.levelDocumented||
     analysis.ppEstimated||!analysis.id||!analysis.edition||analysis.capture===null)
   return {analysis,proposal:null,
    reason:'Nível máximo, origem documental e PP desta edição ainda não confirmados. Interpretação permitida; redistribuição bloqueada.'};
  const baseline=(card.recommended_levels||card.niveis).slice();
  const allowed=analysis.role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
  const current=baseline.slice();
  let steps=0;
  while(steps++<8){
   let best=null;
   for(const i of allowed){
    if(current[i]===0)continue;
    for(const j of allowed){
     if(j===i||current[j]===20)continue;
     for(let down=1;down<=Math.min(3,current[i]);down++){
      for(let up=1;up<=Math.min(3,20-current[j]);up++){
       const recovered=ppCost(current[i])-ppCost(current[i]-down);
       const invested=ppCost(current[j]+up)-ppCost(current[j]);
       if(recovered!==invested)continue;
       const next=current.slice();next[i]-=down;next[j]+=up;
       const improvement=rating(next,analysis.weights,allowed)-rating(current,analysis.weights,allowed);
       if(improvement>1e-7&&(!best||improvement>best.improvement+1e-7||
         (Math.abs(improvement-best.improvement)<1e-7 && j<best.target)))
        best={next,improvement,target:j};
      }
     }
    }
   }
   if(!best)break;
   current.splice(0,10,...best.next);
  }
  const changes=current.map((level,i)=>({
   name:CATEGORY[i].name,from:baseline[i],to:level,delta:level-baseline[i]
  })).filter(x=>x.delta!==0);
  if(!changes.length)return {analysis,proposal:null,reason:'Nenhuma troca de PP com custo exato melhorou a heurística deste papel; conservar a distribuição atual.'};
  if(T.total(current)!==analysis.budget||!vecOk(current))throw Error('Proposta V233 inválida');
  return {analysis,proposal:{
   levels:current,changes,spent:T.total(current),source:'hipotese_v233',
   note:'Comparação matemática de investimento; não foi testada em partidas e não substitui os treinos aprovados.'
  },reason:'Redistribuição hipotética calculada respeitando os PP da mesma edição; exige comparação em campo.'};
 }
 const api=Object.freeze({CATEGORY,ROLES,MODES,interpret,refineIndividual,compare,levelDocumented,identityIssues,clean});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_INTERPRETATION_V233=api;
})(typeof window!=='undefined'?window:null);
