/* Scout PRO V104: use the 28 selectable boosters supported since Konami v5.2.0; slot eligibility remains edition-specific. */
(function(host){
'use strict';
const BOOSTERS={
 'Agility':['speed','accel','balance','stamina'],
 'Technique':['control','dribble','tight','pass'],
 'Passing':['pass','loft','curl','power'],
 'Ball Protection':['control','tight','physical','balance'],
 'Ball-carrying':['dribble','tight','speed','balance'],
 "Striker's Instinct":['awareness','control','finish','accel'],
 'Off the Ball':['awareness','speed','accel','stamina'],
 'Offence Creator':['awareness','control','pass','power'],
 'Shooting':['control','finish','power','physical'],
 'Aerial':['finish','heading','jump','physical'],
 'Physicality':['jump','physical','balance','stamina'],
 'Accuracy':['pass','loft','finish','power'],
 'Regista':['tight','pass','defaware','tackle'],
 'Rebuilding':['pass','defaware','defengage','aggression'],
 'Shutdown':['speed','defaware','tackle','defengage'],
 'Defending':['accel','jump','defaware','tackle'],
 'Duelling':['speed','stamina','defaware','tackle'],
 'Stealing':['accel','physical','tackle','aggression'],
 'Saving':['gkaware','gkparry','gkreflex','gkreach'],
 'Goalkeeping':['gkaware','gkcatch','gkparry','gkreflex'],
 'Balancer':['awareness','accel','stamina','defaware'],
 'Breakthrough':['dribble','speed','power','physical'],
 'Strength':['speed','power','jump','physical'],
 'Fantasista':['control','dribble','finish','balance'],
 'Hard Worker':['accel','physical','stamina','aggression'],
 'Counter':['pass','physical','tackle','defengage'],
 'Crossing':['loft','curl','speed','stamina'],
 'Free-kick Taking':['finish','placekick','curl','power']
};
// Konami v5.2.0: Select Booster Tokens can craft all 28 types, including Accuracy and Strength.
// Natural booster values remain immutable; availability of the second slot is checked per card.
const CRAFTABLE=Object.freeze(Object.keys(BOOSTERS));
const ROLE={CA:{awareness:6,finish:7,accel:5,control:4,power:3,physical:2,speed:3,pass:2,balance:2,heading:1,jump:1,stamina:1},
SA:{awareness:5,finish:4,accel:5,control:5,pass:5,dribble:4,tight:4,balance:4,speed:2,physical:2,stamina:2},
MAT:{control:6,tight:5,dribble:5,pass:7,awareness:4,accel:4,balance:5,finish:3,stamina:2,power:2},
MLG:{control:5,tight:5,dribble:3,pass:7,defaware:4,tackle:2,stamina:4,balance:4,accel:3,physical:2},
VOL:{pass:6,tight:3,defaware:7,tackle:6,defengage:6,physical:4,stamina:4,accel:3,speed:3,balance:2},
ZG:{defaware:7,tackle:7,defengage:7,speed:4,accel:5,physical:5,jump:4,heading:3,pass:2,stamina:2},
LD:{speed:5,accel:5,stamina:5,defaware:7,tackle:6,defengage:5,pass:4,physical:3,tight:2,balance:2},
ALA:{speed:5,accel:6,dribble:6,tight:5,balance:5,control:5,pass:4,finish:3,stamina:3},
GO:{gkaware:9,gkreflex:9,gkreach:9,gkparry:8,gkcatch:6}};
const POS={AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DD:'LD',LD:'LD',DE:'LD',LE:'LD',DC:'ZG',ZC:'ZG',GR:'GO',GO:'GO',PTD:'ALA',PTE:'ALA',MLD:'ALA',MLE:'ALA'};
const label={awareness:'consciência ofensiva',finish:'finalização',accel:'aceleração',control:'controle de bola',power:'força do chute',physical:'contato físico',speed:'velocidade',pass:'passe rasteiro',loft:'passe alto',tight:'posse apertada',dribble:'drible',balance:'equilíbrio',heading:'cabeceio',jump:'salto',stamina:'resistência',curl:'efeito',placekick:'bola parada',defaware:'consciência defensiva',tackle:'desarme',defengage:'dedicação defensiva',aggression:'agressividade',gkaware:'consciência de goleiro',gkparry:'desvio de goleiro',gkreflex:'reflexos de goleiro',gkreach:'alcance de goleiro',gkcatch:'firmeza de goleiro'};
const tactics=['posse','normal','rapido','fora','longo'];
function slotStatus(extra){
 const s=String(extra||'');
 if(/^SLOT SELECIONÁVEL/i.test(s))return 'selecionavel';
 if(/selecion[aá]vel/i.test(s))return 'possivel';
 if(/^(PENDENTE|NENHUM|NÃO|—)/i.test(s))return 'indefinido';
 return 'nome_registrado';
}
function normStyle(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
/* V200: complementaridade da build para Posse, sem inventar atributos finais.
 * Os níveis são INVESTIMENTO por categoria (não valores reais de velocidade/chute).
 * A recomendação nunca equipa boosters nem aprova gasto de Tokens automaticamente. */
const TRAINING_GROUP={
 awareness:3,finish:0,accel:3,control:2,power:4,physical:5,speed:4,
 pass:1,loft:1,tight:2,dribble:2,balance:3,heading:5,jump:5,stamina:4,
 curl:0,placekick:0,defaware:6,tackle:6,defengage:6,aggression:6
};
const ROLE_TRAINING={
 CA:[0,1,2,3,4,5],SA:[0,1,2,3,4,5],MAT:[0,1,2,3,4],
 MLG:[1,2,3,4,6],VOL:[1,2,3,4,5,6],ZG:[1,3,4,5,6],
 LD:[1,2,3,4,5,6],ALA:[0,1,2,3,4],GO:[7,8,9]
};
const CANONICAL={
 'fisicalidade':'Physicality','instinto artilheiro':"Striker's Instinct",
 'fora da bola':'Off the Ball','sem bola':'Off the Ball','conducao de bola':'Ball-carrying',
 'agilidade':'Agility','tecnica':'Technique','passe':'Passing',
 'proteção de posse':'Ball Protection','protecao de posse':'Ball Protection',
 'chute':'Shooting','finalizacao':'Shooting','criador ofensivo':'Offence Creator',
 'disputa aerea':'Aerial','precisao':'Accuracy','defesa':'Defending',
 'duelo':'Duelling','roubo de bola':'Stealing','reconstrucao':'Rebuilding',
 'goleiro':'Goalkeeping','forca':'Strength','cruzamento':'Crossing',
 'rompe barreira':'Breakthrough','equilibrio':'Balancer'
};
const plain=s=>normStyle(s).replace(/[^a-z0-9]+/g,' ').trim();
function boosterName(value){
 const cleaned=String(value??'').replace(/\s*\+\s*\d+(?:\s.*)?$/,'').trim();
 const matched=Object.keys(BOOSTERS).find(k=>plain(k)===plain(cleaned));
 return matched||CANONICAL[plain(cleaned)]||null;
}
function levelsOf(card){
 const values=card.niveis??card.recommended_levels??card.treino_anterior;
 if(!Array.isArray(values)||values.length!==10)return null;
 return values.every(v=>Number.isFinite(Number(v))&&Number(v)>=0)?values.map(Number):null;
}
function addStat(w,key,value){w[key]=(w[key]||0)+value;}
function addStats(w,keys,value){for(const k of keys)addStat(w,k,value);}
function playingStyle(w,role,style){
 const rule=(pattern,mods)=>{if(pattern.test(style))for(const [k,n] of Object.entries(mods))addStat(w,k,n)};
 rule(/pivo|homem de area|target|avancado pivo/,{physical:6,heading:3,jump:3,control:5,pass:5,tight:3,balance:3});
 rule(/infiltra|puxa marcacao|arrastar defesa/,{awareness:2,accel:2,control:4,pass:5,tight:4,balance:3});
 rule(/matador|oportunista|artilheiro/,{awareness:3,finish:3,accel:1,power:1});
 rule(/orquestrador|criador de espacos|armador|classico.{0,5}10/,{control:5,tight:5,pass:7,balance:3});
 rule(/versatil|todo o terreno/,{stamina:3,pass:3,defaware:2,control:2});
 rule(/destruidor|lateral defensivo|primeiro volante|trinco/,{defaware:3,tackle:3,defengage:2,physical:1});
 rule(/ala produtivo|ala rapido|driblador|ala movel/,{dribble:3,tight:3,speed:2,accel:3});
 if(role==='CA'&&/pivo/.test(style)){addStat(w,'awareness',-1);addStat(w,'finish',-1)}
}
function nativeSkillContext(w,raw,role){
 const skills=normStyle(raw).toLowerCase();
 const has=s=>s.test(skills);
 const findings=[];
 if(has(/one.touch pass|one touch pass|passe de primeira|through passing|passe em profundidade/)){
  addStats(w,['pass','control'],2);addStat(w,'tight',1);
  findings.push('tabelas e passes de apoio');
 }
 if(has(/double touch|sole control|toque duplo|controle com a sola/)){
  addStats(w,['tight','control','dribble'],2);
  findings.push('domínio e giro curto');
 }
 if(has(/long.range shooting|long.range curler|first.time shot|phenomenal finishing|low screamer|precisao a distancia|efeito de longe/)){
  addStat(w,'power',2);addStat(w,'finish',1);
  findings.push('finalização já prevista nas habilidades');
 }
 if((role==='CA'||role==='ZG')&&has(/heading|bullet header|aerial superiority|cabeceio|cabecada/)){
  addStat(w,'heading',1);addStat(w,'jump',1);
  findings.push('jogo aéreo');
 }
 return findings;
}
function rank(card,tactic){
 if(!tactics.includes(tactic))throw Error('Tática desconhecida');
 const role=POS[card.posicao||card.shown_position||card.role_used];
 if(!role)throw Error('Posição não mapeada: '+(card.posicao||card.shown_position||card.role_used));
 const weights={...ROLE[role]};
 const style=normStyle([card.estilo_ataque||card.attack_style||'',card.estilo_defesa||card.defence_style||''].join(' '));
 playingStyle(weights,role,style);
 if(tactic==='posse'){
  addStats(weights,['pass','tight','control','balance'],3);
  addStats(weights,['awareness','defaware'],1);
 }else if(tactic==='normal'){
  addStats(weights,['physical','defaware','balance','stamina'],2);
 }else if(tactic==='rapido'){
  addStats(weights,['speed','accel','awareness','stamina'],2);
 }else if(tactic==='fora'){
  addStats(weights,['pass','loft','curl','dribble','stamina'],3);
  addStats(weights,['speed','tight','balance'],1);
 }else if(tactic==='longo'){
  addStats(weights,['loft','heading','jump','physical','stamina'],3);
  addStats(weights,['defaware','awareness','power'],1);
 }
 const nativeFindings=nativeSkillContext(weights,card.habilidades_nativas||card.native_skills||'',role);
 const levels=levelsOf(card);
 const trainingIndices=ROLE_TRAINING[role];
 const mean=levels?trainingIndices.reduce((sum,i)=>sum+levels[i],0)/trainingIndices.length:null;
 // As categorias apenas sinalizam para onde foram direcionados os níveis:
 // não são conversões, não provam que um atributo ficou abaixo de algum limiar.
 const trainingEvidence=levels?'investimento_da_build_sem_atributos_finais':'treino_individual_nao_documentado';
 const fixed=boosterName(card.impeto_fixo||card.boost1);
 const extraStatus=slotStatus(card.impeto_extra||card.boost2);
 const extra=extraStatus==='nome_registrado'?boosterName(card.impeto_extra||card.boost2):null;
 const excluded=new Set([fixed,extra].filter(Boolean));
 return Object.entries(BOOSTERS)
 .filter(([name])=>CRAFTABLE.includes(name)&&!excluded.has(name)&&
  (role==='GO'?(name==='Saving'||name==='Goalkeeping'):(name!=='Saving'&&name!=='Goalkeeping')))
 .map(([name,stats])=>{
  const functionScore=stats.reduce((sum,k)=>sum+Math.max(0,weights[k]||0),0);
  let trainingScore=0;
  if(levels&&role!=='GO'){
   for(const stat of stats){
    const i=TRAINING_GROUP[stat];
    if(i===undefined||!trainingIndices.includes(i))continue;
    // Diferença limitada: investiu menos numa categoria => pedir comparação,
    // nunca deduzir velocidade, chute, ou qualquer atributo numérico final.
    const delta=Math.max(-1.6,Math.min(2.25,(mean-levels[i])/2.6));
    const relevance=Math.max(0.45,Math.min(1.25,(weights[stat]||0)/7));
    trainingScore+=delta*relevance*0.85;
   }
  }
  // Evita uma recomendação baseada exclusivamente em "corrigir" nível baixo.
  trainingScore=Math.max(-4,Math.min(4,trainingScore));
  let contextScore=0;
  if(role==='CA'||role==='SA'){
   const pivot=/pivo|homem de area|target/.test(style);
   const runner=/infiltra|matador|oportunista|artilheiro/.test(style);
   // A função de apoio em Posse tem prioridades distintas do finalizador puro.
   const linkForward=/puxa marcacao|infiltra/.test(style);
   if(tactic==='posse'&&linkForward&&['Passing','Technique','Offence Creator','Ball Protection'].includes(name))contextScore+=4;
   if(tactic==='posse'&&pivot&&name==='Passing')contextScore+=3;
   if(tactic==='posse'&&runner&&!pivot&&name==='Off the Ball')contextScore+=2;
   if(pivot&&['Offence Creator','Ball Protection','Technique','Aerial'].includes(name))contextScore+=4.5;
   if(runner&&name==='Shooting')contextScore+=3;
   // Chute de primeira e finalizações especiais tornam Shooting uma alternativa real.
   if(/first.time shot|phenomenal finishing|low screamer|long.range shooting/i.test(card.habilidades_nativas||card.native_skills||'')&&name==='Shooting')contextScore+=3;
   if(levels&&levels[4]<=5&&name==='Off the Ball')contextScore+=2;
  }
  if((role==='MAT'||role==='MLG')&&name==='Passing'&&/orquestrador|armador|classico/.test(style))contextScore+=2;
  const score=Math.round((functionScore+trainingScore+contextScore)*100)/100;
  const ordered=stats.slice().sort((a,b)=>(weights[b]||0)-(weights[a]||0));
  const axes=[label[ordered[0]],label[ordered[1]]];
  const info=[
   'Função '+role+' em '+(tactic==='posse'?'Posse de Bola':tactic==='normal'?'Contra-Ataque Normal':'Contra-Ataque Rápido'),
   'prioriza '+axes.join(' e '),
   levels?'níveis de treino servem apenas como sinal de investimento, sem atributos finais medidos':'níveis individuais indisponíveis; recomendação provisória'
  ];
  if(nativeFindings.length)info.push('habilidades nativas indicam '+nativeFindings.slice(0,2).join(' e '));
  return {
   nome:name,score,atributos:stats.map(k=>label[k]),
   motivo:info.join('; ')+'.',
   confianca:levels?'comparativa_limitada':'baixa',
   evidencias:{treino:trainingEvidence,impeto_fixo:fixed||null,impeto_extra_registrado:extra||null,
    score_funcao:Number(functionScore.toFixed(2)),score_complemento:Number(trainingScore.toFixed(2)),
    score_contexto:Number(contextScore.toFixed(2)),
    limite:'Sem atributos finais comparados nem teste controlado de partida. Não aplicar automaticamente.'}
  };
 }).sort((a,b)=>b.score-a.score||a.nome.localeCompare(b.nome));
}

function audit(cards){
 if(!Array.isArray(cards)||cards.length!==246)throw Error('Acervo incompleto: esperado 246');
 const ids=new Set;const result=cards.map(c=>{
  if(ids.has(c.numero))throw Error('Número duplicado '+c.numero);ids.add(c.numero);
  return {numero:c.numero,nome:c.name,card_id:c.id,posicao:c.posicao,estilo_ataque:c.estilo_ataque,estilo_defesa:c.estilo_defesa,
    impeto_fixo:c.impeto_fixo,impeto_extra:c.impeto_extra,status_slot_fonte:slotStatus(c.impeto_extra),
    base_stats_known:c.base_stats_known,treino_individual_documentado:!!levelsOf(c),ficha:c.arquivo,
    recomendacoes:Object.fromEntries(tactics.map(t=>[t,rank(c,t).slice(0,3)]))};
 });
 const summary={total:result.length,selecionavel:result.filter(c=>c.status_slot_fonte==='selecionavel').length,
 possivel:result.filter(c=>c.status_slot_fonte==='possivel').length,
 nome_registrado:result.filter(c=>c.status_slot_fonte==='nome_registrado').length,
 indefinido:result.filter(c=>c.status_slot_fonte==='indefinido').length};
 return {version:'V104',method:'V200: função, tática, estilo, habilidades nativas e investimento por categoria; sem inferir atributos finais ou slot livre, sem prova de desempenho em partidas',summary,cards:result};
}
const api={BOOSTERS,CRAFTABLE,ROLE,POS,tactics,slotStatus,boosterName,levelsOf,rank,audit};
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_BOOSTERS_V103=api;
})(typeof window!=='undefined'?window:null);
