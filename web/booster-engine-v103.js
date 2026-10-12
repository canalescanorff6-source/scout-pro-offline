/* Scout PRO V103: booster choices are hypotheses, not claims about equipped slots. */
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
 'Hard Worker':['accel','physical','stamina','aggression']
};
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
const label={awareness:'consciência ofensiva',finish:'finalização',accel:'aceleração',control:'controle de bola',power:'força do chute',physical:'contato físico',speed:'velocidade',pass:'passe rasteiro',loft:'passe alto',tight:'posse apertada',dribble:'drible',balance:'equilíbrio',heading:'cabeceio',jump:'salto',stamina:'resistência',curl:'efeito',defaware:'consciência defensiva',tackle:'desarme',defengage:'dedicação defensiva',aggression:'agressividade',gkaware:'consciência de goleiro',gkparry:'desvio de goleiro',gkreflex:'reflexos de goleiro',gkreach:'alcance de goleiro',gkcatch:'firmeza de goleiro'};
const tactics=['posse','normal','rapido'];
function slotStatus(extra){
 const s=String(extra||'');
 if(/^SLOT SELECIONÁVEL/i.test(s))return 'selecionavel';
 if(/selecion[aá]vel/i.test(s))return 'possivel';
 if(/^(PENDENTE|NENHUM|NÃO|—)/i.test(s))return 'indefinido';
 return 'nome_registrado';
}
function normStyle(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function rank(card,tactic){
 if(!tactics.includes(tactic))throw Error('Tática desconhecida');
 const role=POS[card.posicao];if(!role)throw Error('Posição não mapeada: '+card.posicao);
 const w={...ROLE[role]},st=normStyle(card.estilo_ataque+' '+card.estilo_defesa);
 function bump(k,n){w[k]=(w[k]||0)+n}
 if(/pivo|homem de area|target/.test(st)){bump('physical',5);bump('heading',3);bump('jump',3)}
 if(/infiltra|puxa marcacao|arrastar defesa|matador|oportunista|artilheiro/.test(st)){bump('awareness',3);bump('accel',2)}
 if(/orquestrador|criador de espacos|armador/.test(st)){bump('pass',3);bump('tight',2)}
 if(/destruidor|lateral defensivo|primeiro volante/.test(st)){bump('defaware',2);bump('tackle',2)}
 if(/versatil|todo o terreno/.test(st)){bump('stamina',4);bump('pass',1)}
 if(tactic==='posse')for(const k of ['pass','tight','control','balance'])bump(k,2);
 if(tactic==='normal')for(const k of ['physical','defaware','balance','stamina'])bump(k,2);
 if(tactic==='rapido')for(const k of ['speed','accel','awareness','stamina'])bump(k,2);
 const natural=String(card.impeto_fixo||'').replace(/\s*\+\d+.*/,'').trim().toLowerCase();
 return Object.entries(BOOSTERS)
 .filter(([name])=>role==='GO'?name==='Saving'||name==='Goalkeeping':name!=='Saving'&&name!=='Goalkeeping')
 .map(([name,stats])=>{
  const score=stats.reduce((sum,k)=>sum+(w[k]||0),0)-(natural===name.toLowerCase()?2:0);
  const focused=stats.slice().sort((a,b)=>(w[b]||0)-(w[a]||0));
  return {nome:name,score,atributos:stats.map(k=>label[k]),motivo:'Prioriza '+label[focused[0]]+' e '+label[focused[1]]+' na função '+role+'; hipótese sujeita à conferência dos atributos finais.'};
 }).sort((a,b)=>b.score-a.score||a.nome.localeCompare(b.nome));
}
function audit(cards){
 if(!Array.isArray(cards)||cards.length!==246)throw Error('Acervo incompleto: esperado 246');
 const ids=new Set;const result=cards.map(c=>{
  if(ids.has(c.numero))throw Error('Número duplicado '+c.numero);ids.add(c.numero);
  return {numero:c.numero,nome:c.name,card_id:c.id,posicao:c.posicao,estilo_ataque:c.estilo_ataque,estilo_defesa:c.estilo_defesa,
    impeto_fixo:c.impeto_fixo,impeto_extra:c.impeto_extra,status_slot_fonte:slotStatus(c.impeto_extra),
    base_stats_known:c.base_stats_known,ficha:c.arquivo,
    recomendacoes:Object.fromEntries(tactics.map(t=>[t,rank(c,t).slice(0,3)]))};
 });
 const summary={total:result.length,selecionavel:result.filter(c=>c.status_slot_fonte==='selecionavel').length,
 possivel:result.filter(c=>c.status_slot_fonte==='possivel').length,
 nome_registrado:result.filter(c=>c.status_slot_fonte==='nome_registrado').length,
 indefinido:result.filter(c=>c.status_slot_fonte==='indefinido').length};
 return {version:'V103',method:'hipóteses competitivas por posição, estilos e efeitos do ímpeto; não equivale a slot vazio comprovado, atributos finais ou desempenho validado',summary,cards:result};
}
const api={BOOSTERS,ROLE,POS,tactics,slotStatus,rank,audit};
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_BOOSTERS_V103=api;
})(typeof window!=='undefined'?window:null);
