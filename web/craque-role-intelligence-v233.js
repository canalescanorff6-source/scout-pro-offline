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
 const api=Object.freeze({CATEGORY,ROLES,MODES,interpret,compare,levelDocumented,identityIssues,clean});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_INTERPRETATION_V233=api;
})(typeof window!=='undefined'?window:null);
