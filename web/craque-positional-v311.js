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
 positions:host?.SCOUT_POSITION_TRAINING_V246||null,
 managers:host?.CRAQUE_MANAGERS_V302||null
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
function managerEvidence(id,style,deps){
 const source=deps.managers;
 if(!id||id==='sem-tecnico')return {status:'não selecionado',name:null,version:null,
  proficiency:null,bonuses:[],linkups:[],confidence:'pendente'};
 const m=source?.find?.(id)||null;
 if(!m)return {status:'edição não encontrada',name:null,version:null,proficiency:null,
  bonuses:[],linkups:[],confidence:'pendente'};
 const score=source.proficiency?.(m,style);
 const bonuses=Array.isArray(m.boosters_EN)?m.boosters_EN.filter(x=>typeof x==='string'&&x.trim()).slice(0,4):[];
 const linkups=Array.isArray(m.link_ups_EN)?m.link_ups_EN.filter(x=>typeof x==='string'&&x.trim()).slice(0,5):[];
 return {status:'catálogo informativo',name:text(m.nome),version:text(m.versao_lancamento),
  proficiency:Number.isInteger(score)?score:null,bonuses,linkups,
  confidence:'catálogo sem prova de aquisição/ativação na conta'};
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
 const managerProfile=managerEvidence(id.manager,id.style,deps);
 const warnings=[...outcome.warnings];
 if(managerProfile.proficiency!==null&&managerProfile.proficiency<85)
  warnings.push('Proficiência '+managerProfile.proficiency+' em '+id.style+
   ': confira o impacto competitivo da versão escolhida.');
 if(managerProfile.proficiency===null&&id.manager!=='sem-tecnico')
  warnings.push('Proficiência desta edição/tática não documentada: nenhum bônus aplicado.');
 if(!positionEvidence.eligible)warnings.push(positionEvidence.text+'; somente simulação, não aptidão comprovada.');
 if(id.manager==='sem-tecnico')warnings.push('Técnico não selecionado: proficiência/bônus não validados.');
 else warnings.push('Técnico '+id.manager+': a edição é isolada no cenário, sem bônus numéricos fictícios.');
 return {
  ...id,originalPosition:m.position,base:baseSignature(m),owner:m.owner,cardKey:m.cardKey,
  compatibility:positionEvidence,managerProfile,styleActivation:'não comprovada para esta edição/posição',
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
function snapshot(scenario){
 const o=scenario.outcome,p=o.plan;
 const booster=o.booster||{};
 return {
  base:scenario.base,originalPosition:scenario.originalPosition,selectedPosition:scenario.position,
  style:scenario.style,manager:scenario.manager,status:scenario.status,
  pp:p.pp??null,levels:Array.isArray(p.levels)?p.levels.slice():null,
  recommendations:(o.suggestedSkills||[]).slice(0,5).map(x=>({
   name:text(x.name),why:text(x.why),
   synergies:Array.isArray(x.synergies)?x.synergies.map(text).slice(0,5):[]
  })),
  booster:booster.primary?.nome||null,
  boosterRanking:{
   primary:booster.primary?{name:text(booster.primary.nome),reason:text(booster.primary.motivo)}:null,
   alternatives:Array.isArray(booster.alternatives)?booster.alternatives.slice(0,5)
    .map(x=>({name:text(x.nome),reason:text(x.motivo)})):[]
  },
  focus:{
   headline:text(scenario.focus?.headline),
   priority:(scenario.focus?.priority||[]).slice(0,4).map(x=>text(x.name))
  },
  warnings:scenario.warnings.map(text).slice(0,16),
  managerProfile:scenario.managerProfile,
  compatibility:scenario.compatibility.status,styleActivation:scenario.styleActivation,
  approved:false,savedAt:new Date().toISOString()
 };
}
function save(store,scenario){
 if(!store?.setItem||!scenario?.id||!scenario?.outcome)throw Error('Cenário indisponível');
 const items=stored(store),previous=Array.isArray(items[scenario.id])?items[scenario.id]:[];
 const record={...snapshot(scenario),revision:previous.length+1};
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
// Exportação de um proprietário sem misturar snapshots de outras coleções.
function exportOwnerScenarios(store,ownerId,cards){
 const ids=new Set((cards||[]).map(c=>text(c.id)));
 const entries=[];
 for(const [key,revisions] of Object.entries(stored(store))){
  let parts;try{parts=key.split('|').map(decodeURIComponent)}catch(_){continue}
  if(parts.length!==8||parts[0]!=='outros-elencos'||parts[1]!==ownerId||!ids.has(parts[2]))continue;
  if(!Array.isArray(revisions))continue;
  entries.push({key,revisions:JSON.parse(JSON.stringify(revisions))});
 }
 return {schema:'CRAQUE_POSITION_OWNER_EXPORT_V311',sourceOwner:ownerId,
  cardIds:(cards||[]).map(c=>text(c.id)),entries};
}
// Reassocia as fichas da exportação aos novos IDs criados pela importação isolada.
function importOwnerScenarios(store,backup,newOwner,cards){
 if(!backup)return 0; // exportações antigas não contêm cenários
 if(backup.schema!=='CRAQUE_POSITION_OWNER_EXPORT_V311'||
    !Array.isArray(backup.cardIds)||!Array.isArray(backup.entries)||
    backup.entries.length>2500||backup.cardIds.length!==(cards||[]).length)
  throw Error('Arquivo de cenários da coleção inválido');
 const map=new Map(backup.cardIds.map((id,i)=>[text(id),cards[i]]));
 const entries={...stored(store)};let count=0;
 for(const item of backup.entries){
  if(!item||typeof item.key!=='string'||!Array.isArray(item.revisions)||
     item.revisions.length>40)throw Error('Revisões posicionais inválidas');
  const parts=item.key.split('|').map(decodeURIComponent);
  if(parts.length!==8||parts[0]!=='outros-elencos'||parts[1]!==backup.sourceOwner)
   throw Error('Cenário posicional pertence a outra coleção');
  const card=map.get(parts[2]);if(!card)throw Error('Carta ausente na coleção importada');
  const model=fromExternal(card,newOwner),pos=normalize(parts[5]),style=parts[6],mgr=parts[7];
  if(parts[3]!== (model.cardId||'sem-card-id')||
     parts[4]!== (model.edition||'edicao-pendente'))
    throw Error('Identidade da edição do cenário não corresponde à carta importada');
  const key=identity(model,pos,style,mgr).id,base=baseSignature(model);
  const safe=[];
  for(const record of item.revisions){
   if(!record||record.selectedPosition!==pos||record.style!==style||
      record.manager!==mgr||record.levels!==null&&
      (!Array.isArray(record.levels)||record.levels.length!==10||
       !record.levels.every(x=>Number.isInteger(x)&&x>=0&&x<=20)))
     throw Error('Revisão de cenário inconsistente');
   // O ID interno mudou na importação, mas os atributos da carta permanecem.
   safe.push({...record,base,approved:record.approved===true,
    evidenceImported:true});
  }
  if(!entries[key])entries[key]=safe;
  else entries[key]=entries[key].concat(safe).slice(-40);
  count+=safe.length;
 }
 const content=JSON.stringify({schema:'CRAQUE_POSITION_V311',entries});
 if(content.length>1500000)throw Error('Arquivo de cenários ultrapassa o limite local');
 if(count)store.setItem(KEY,content);
 return count;
}
return Object.freeze({KEY,PREF,POS,normalize,hash,fromPersonal,fromExternal,baseSignature,
 identity,compute,managerEvidence,snapshot,familiarity,saved,save,choose,preferred,compare,exportOwnerScenarios,importOwnerScenarios});
});
