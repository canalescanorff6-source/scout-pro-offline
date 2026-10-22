/* V311 · motor COMPARTILHADO de cenários por posição, tática e edição do técnico.
 * Resultados experimentais. Nunca altera cartão-base, equipamentos nem fichas aprovadas.
 */
(function(host,factory){'use strict';const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_POSITIONAL_V311=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const KEY='scoutpro:v311:position-scenarios';
const PREF='scoutpro:v311:position-selection:';
const POS=Object.freeze(['CA','SA','MAT','MLG','VOL','ZG','LD','LE','PTE','PTD','MLE','MLD','GO']);
const MAP=Object.freeze({AC:'CA',MO:'MAT',MC:'MLG',MDF:'VOL',ZC:'ZG',DC:'ZG',DD:'LD',DE:'LE',GR:'GO'});
const normalize=v=>MAP[String(v||'').trim().toUpperCase()]||String(v||'').trim().toUpperCase();
const text=v=>String(v??'').trim();
const depsDefault=()=>({
 training:host?.CRAQUE_FRIEND_TRAINING_V228||(typeof module==='object'?require('./craque-friends-training-v228.js'):null),
 tactical:host?.SCOUT_TACTICS_V220||(typeof module==='object'?require('./scout-multitactic-engine-v220.js'):null),
 skills:host?.SCOUT_RECOMMENDATIONS_V162||(typeof module==='object'?require('./skills-booster-v162.js'):null),
 boosters:host?.SCOUT_BOOSTERS_V103||(typeof module==='object'?require('./booster-engine-v103.js'):null),
 positions:host?.SCOUT_POSITION_TRAINING_V246||null
});
const hash=input=>{
 let a=2166136261>>>0;for(const c of String(input)){a=Math.imul(a^c.charCodeAt(0),16777619)>>>0}
 return a.toString(16).padStart(8,'0');
};
const json=x=>JSON.stringify(x);
function fromPersonal(card,raw){
 if(!card||!Number.isInteger(Number(card.numero)))throw Error('Carta pessoal sem número comprovado');
 return {
  collection:'minhas-246',owner:'principal',cardKey:String(card.numero)+'@'+text(card.id),
  name:text(card.name),edition:text(card.versao),cardId:text(card.id),
  position:normalize(card.posicao),level:card.max_level??null,pp:Number.isInteger(card.pp)?card.pp:null,
  style:text(card.estilo_ataque),nativeSkills:text(card.habilidades_nativas||raw?.native_skills),
  skills:'',fixedBooster:text(card.impeto_fixo||raw?.boost1),
  booster:'',boosterSlot:'pendente',
  trainingLevels:Array.isArray(card.niveis)?card.niveis.join(','):'',
  evidenceCard:card
 };
}
function fromExternal(card,owner){
 if(!card||!owner||card.ownerId!==owner.id)throw Error('Proprietário não corresponde à carta');
 return {
  collection:'outros-elencos',owner:text(owner.id),cardKey:text(card.id),
  name:text(card.name),edition:text(card.edition),cardId:text(card.cardId),
  position:normalize(card.position),level:card.level??null,pp:card.pp??null,
  style:text(card.style),nativeSkills:text(card.nativeSkills),
  skills:text(card.skills),fixedBooster:text(card.fixedBooster),
  booster:text(card.booster),boosterSlot:text(card.boosterSlot)||'pendente',
  trainingLevels:text(card.trainingLevels),evidenceCard:null
 };
}
function validate(model){
 if(!model||!POS.includes(model.position)||!model.owner||!model.cardKey)throw Error('Carta ou posição original inválida');
 return model;
}
function baseSignature(m){return hash(json([
 m.collection,m.owner,m.cardKey,m.cardId,m.edition,m.position,m.level,m.pp,
 m.style,m.nativeSkills,m.skills,m.fixedBooster,m.booster,m.boosterSlot,m.trainingLevels
 ]))}
function identity(m,pos,style,manager){
 validate(m);const use=normalize(pos);
 if(!POS.includes(use))throw Error('Posição de uso inválida');
 if(!['posse','normal','rapido','fora','longo'].includes(style))throw Error('Estilo coletivo inválido');
 const mgr=text(manager)||'sem-tecnico';
 if(mgr.length>110)throw Error('Identificação do técnico inválida');
 const components=[m.collection,m.owner,m.cardKey,m.cardId||'sem-card-id',m.edition||'edicao-pendente',use,style,mgr];
 return {id:components.map(v=>encodeURIComponent(v)).join('|'),position:use,style,manager:mgr};
}
function familiarity(m,position,deps){
 const wanted=normalize(position);
 if(wanted===m.position)return {status:'original',eligible:true,text:'Posição original registrada'};
 if(wanted==='GO'||m.position==='GO')return {status:'incompatível',eligible:false,text:'Goleiro/linha: função não suportada para esta carta'};
 if(m.collection==='minhas-246'&&deps.positions?.status&&m.evidenceCard){
  const r=deps.positions.status(m.evidenceCard,wanted);
  return {status:r.status||'pendente',eligible:r.eligible===true,text:r.label||'Não documentada'};
 }
 return {status:'não confirmada',eligible:false,
  text:'Familiaridade, treino posicional e ativação do estilo individual não confirmados para esta edição'};
}
function compute(model,position='MAT',style='posse',manager='',provided){
 const m=validate(model),id=identity(m,position,style,manager),deps=provided||depsDefault();
 if(!deps.training?.evaluate||!deps.tactical?.strategy)throw Error('Motores de treinamento indisponíveis');
 const positionEvidence=familiarity(m,id.position,deps);
 const copy={
  position:id.position,style:m.style,level:m.level,pp:m.pp,cardId:m.cardId,edition:m.edition,
  name:m.name,nativeSkills:m.nativeSkills,skills:m.skills,
  fixedBooster:m.fixedBooster,booster:m.booster,boosterSlot:m.boosterSlot,
  trainingLevels:m.trainingLevels
 };
 const outcome=deps.training.evaluate(copy,id.style,{
  tactical:deps.tactical,skills:deps.skills,boosters:deps.boosters
 });
 // O contexto do técnico é uma dimensão independente. Sem fórmula oficial comprovada,
 // sua edição não muda artificialmente o orçamento ou os atributos reais.
 const focus=outcome.plan.focus||deps.tactical.focus?.({
  shown_position:id.position,posicao:id.position,estilo_ataque:m.style,
  habilidades_nativas:m.nativeSkills
 },id.style)||null;
 const warnings=[...outcome.warnings];
 if(!positionEvidence.eligible)warnings.push(positionEvidence.text+'; somente simulação, não aptidão comprovada.');
 if(id.manager==='sem-tecnico')warnings.push('Técnico não selecionado: proficiência/bônus não validados.');
 else warnings.push('Técnico '+id.manager+': a edição é isolada no cenário, sem bônus numéricos fictícios.');
 return {
  ...id,originalPosition:m.position,base:baseSignature(m),owner:m.owner,cardKey:m.cardKey,
  compatibility:positionEvidence,styleActivation:'não comprovada para esta edição/posição',
  outcome,focus,warnings:[...new Set(warnings)],
  status:outcome.plan.status==='hipotese'?'PROPOSTA NÃO HOMOLOGADA':'PENDENTE'
 };
}
function stored(store){try{
 const raw=store?.getItem(KEY);const parsed=raw?JSON.parse(raw):null;
 return parsed?.schema==='CRAQUE_POSITION_V311'&&parsed.entries&&
  typeof parsed.entries==='object'&&!Array.isArray(parsed.entries)?parsed.entries:{};
}catch(_){return {}}}
function saved(store,scenario){
 const rows=stored(store)[scenario.id];if(!Array.isArray(rows)||!rows.length)return null;
 const last=rows.at(-1);
 return {revision:last,stale:last.base!==scenario.base};
}
function save(store,scenario){
 if(!store?.setItem||!scenario?.id||!scenario?.outcome)throw Error('Cenário indisponível');
 const items=stored(store),previous=Array.isArray(items[scenario.id])?items[scenario.id]:[];
 const p=scenario.outcome.plan;
 const record={
  base:scenario.base,originalPosition:scenario.originalPosition,selectedPosition:scenario.position,
  style:scenario.style,manager:scenario.manager,status:scenario.status,
  pp:p.pp??null,levels:Array.isArray(p.levels)?p.levels.slice():null,
  recommendations:scenario.outcome.suggestedSkills.map(x=>({name:text(x.name),why:text(x.why)})),
  booster:scenario.outcome.booster?.primary?.nome||null,
  compatibility:scenario.compatibility.status,approved:false,
  savedAt:new Date().toISOString(),revision:previous.length+1
 };
 const result={...items,[scenario.id]:[...previous,record]};
 const payload=json({schema:'CRAQUE_POSITION_V311',entries:result});
 if(payload.length>1500000)throw Error('Limite de armazenamento de cenários atingido. Exporte um backup antes de continuar.');
 store.setItem(KEY,payload);
 return record;
}
function prefKey(m){validate(m);return PREF+encodeURIComponent(m.collection)+'|'+encodeURIComponent(m.owner)+'|'+encodeURIComponent(m.cardKey)}
function choose(store,m,pos){
 const p=normalize(pos);if(!POS.includes(p))throw Error('Posição desconhecida');
 store?.setItem?.(prefKey(m),p);return p;
}
function preferred(store,m){
 try{const pos=normalize(store?.getItem(prefKey(m)));return POS.includes(pos)?pos:m.position}
 catch(_){return m.position}
}
function compare(a,b,deps){
 if(!a||!b||a.owner!==b.owner||a.cardKey!==b.cardKey)throw Error('Comparação exige a mesma carta/proprietário');
 const ta=deps?.tactical||depsDefault().tactical;
 const levelsA=a.outcome.plan.levels,levelsB=b.outcome.plan.levels;
 const differences=Array.isArray(levelsA)&&Array.isArray(levelsB)?
  levelsA.flatMap((n,i)=>n!==levelsB[i]?[{
   category:ta.CATEGORIES[i],a:n,b:levelsB[i],costA:ta.ppCost(n),costB:ta.ppCost(levelsB[i])
  }]:[]):[];
 const names=sc=>sc.outcome.suggestedSkills.map(x=>x.name);
 return {differences,skillsA:names(a),skillsB:names(b),
  boosterA:a.outcome.booster?.primary?.nome||null,
  boosterB:b.outcome.booster?.primary?.nome||null,
  focusA:a.focus?.priority?.map(x=>x.name)||[],focusB:b.focus?.priority?.map(x=>x.name)||[]};
}
return Object.freeze({KEY,PREF,POS,normalize,hash,fromPersonal,fromExternal,baseSignature,
 identity,compute,familiarity,saved,save,choose,preferred,compare});
});
