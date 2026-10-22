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
// Fingerprint da edição e do estado de equipamento: INDEPENDENTE do ID local
// e do proprietário, para validar a migração sem certificar conteúdo diferente.
function contentSignature(m){
 validate(m);
 return hash(json([m.name,m.cardId,m.edition,m.position,m.level,m.pp,m.style,
  m.nativeSkills,m.skills,m.fixedBooster,m.booster,m.boosterSlot,m.trainingLevels]));
}
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
function positionMap(m,provided){
 validate(m);const deps=provided||depsDefault();
 return POS.map(position=>({position,...familiarity(m,position,deps)}));
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
// Responsabilidades da FUNÇÃO escolhida, não movimentos oficialmente comprovados
// para cada edição; nunca afirmar ativação de estilo ou proficiência por associação.
const RESPONSIBILITIES=Object.freeze({
 MAT:['Articular entrelinhas, receber orientado e apoiar a finalização','Fechar a faixa central e apoiar pressão após perda'],
 SA:['Conectar meio e ataque, atacar espaços curtos e finalizar quando houver oportunidade','Pressionar a primeira saída e impedir passes fáceis ao volante adversário'],
 CA:['Dar profundidade, criar opções de finalização e proteção da bola','Iniciar pressão sobre os zagueiros com cobertura coordenada'],
 PTE:['Oferecer progressão pela esquerda e movimentos para dentro quando viáveis','Retornar pela faixa esquerda para reduzir superioridade adversária'],
 PTD:['Oferecer progressão pela direita e movimentos para dentro quando viáveis','Retornar pela faixa direita para reduzir superioridade adversária'],
 MLG:['Circular em apoio, oferecer linhas de passe e conduzir a progressão','Recompor o meio-campo e bloquear linhas de passe centrais'],
 MLE:['Apoiar a saída e progredir pela esquerda com passes e coberturas','Recompor e proteger a faixa esquerda'],
 MLD:['Apoiar a saída e progredir pela direita com passes e coberturas','Recompor e proteger a faixa direita'],
 VOL:['Proteger a saída curta, circular a bola e controlar a zona central','Cobrir a entrada da área e interceptar passes nas transições'],
 ZG:['Iniciar a saída sob controle e manter distância adequada entre setores','Proteger profundidade, antecipar quando viável e vencer duelos'],
 LD:['Apoiar a construção pelo corredor direito de acordo com a instrução tática','Proteger o lado direito e controlar coberturas internas'],
 LE:['Apoiar a construção pelo corredor esquerdo de acordo com a instrução tática','Proteger o lado esquerdo e controlar coberturas internas'],
 GO:['Distribuir a bola com segurança conforme as características documentadas','Proteger gol e área e posicionar-se com cobertura dos defensores']
});
function responsibilities(position){
 const [offense,defense]=RESPONSIBILITIES[normalize(position)]||[];
 return {offense:offense||'Função ofensiva pendente',defense:defense||'Função defensiva pendente',
  confidence:'hipótese funcional; não prova movimentação individual desta edição'};
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
  ...id,originalPosition:m.position,base:baseSignature(m),
  contentSignature:contentSignature(m),owner:m.owner,cardKey:m.cardKey,
  compatibility:positionEvidence,managerProfile,responsibilities:responsibilities(id.position),styleActivation:'não comprovada para esta edição/posição',
  outcome,focus,warnings:[...new Set(warnings)],
  status:outcome.plan.status==='hipotese'?'PROPOSTA NÃO HOMOLOGADA':'PENDENTE'
 };
}
// Leitura com falha segura: dados corrompidos ou de esquema inesperado
// NUNCA devem ser tratados como histórico vazio antes de uma gravação.
function stored(store){
 const raw=store?.getItem(KEY);
 if(raw===null||raw===undefined||raw==='')return {};
 let parsed;
 try{parsed=JSON.parse(raw)}
 catch(_){throw Error('Histórico posicional ilegível. Os dados existentes foram preservados; faça uma cópia antes de corrigir o armazenamento.')}
 if(parsed?.schema!=='CRAQUE_POSITION_V311'||!parsed.entries||
    typeof parsed.entries!=='object'||Array.isArray(parsed.entries))
  throw Error('Formato do histórico posicional não reconhecido. A gravação foi bloqueada para evitar perda de dados.');
 for(const rows of Object.values(parsed.entries)){
  if(!Array.isArray(rows)||rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)))
   throw Error('Histórico posicional contém revisões inválidas. Gravação bloqueada para preservar os dados.');
 }
 return parsed.entries;
}
function storageHealth(store){
 try{stored(store);return {ok:true,reason:null}}
 catch(e){return {ok:false,reason:String(e.message||e)}}
}
function revisions(store,scenario){
 if(!scenario?.id)throw Error('Cenário sem identificação');
 const rows=stored(store)[scenario.id];
 if(rows===undefined)return [];
 if(!Array.isArray(rows))throw Error('Revisões deste cenário estão ilegíveis: gravação bloqueada.');
 return rows.map((revision,index)=>({
  revision,number:Number.isInteger(revision?.revision)?revision.revision:index+1,
  stale:revision?.base!==scenario.base
 }));
}
function saved(store,scenario){
 const entries=revisions(store,scenario);
 return entries.length?entries.at(-1):null;
}
function snapshot(scenario){
 const o=scenario.outcome,p=o.plan;
 const booster=o.booster||{};
 return {
  base:scenario.base,contentSignature:scenario.contentSignature,
  originalPosition:scenario.originalPosition,selectedPosition:scenario.position,
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
  responsibilities:scenario.responsibilities,
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
// Adaptador ÚNICO de leitura para fichas salvas: a revisão histórica usa
// prioridades como strings; o motor calculado usa objetos {name}.
function withSaved(scenario,revision){
 if(!scenario?.outcome||!revision||revision.base!==scenario.base||
    revision.originalPosition!==scenario.originalPosition||
    revision.selectedPosition!==scenario.position||
    revision.style!==scenario.style||revision.manager!==scenario.manager)
  return scenario;
 const normalizePriority=x=>typeof x==='string'?{name:x}:x&&typeof x.name==='string'?{name:x.name}:null;
 const recorded=revision.focus&&typeof revision.focus==='object'?{
  ...revision.focus,
  priority:Array.isArray(revision.focus.priority)?
   revision.focus.priority.map(normalizePriority).filter(Boolean):[]
 }:scenario.focus;
 const currentPlan=scenario.outcome.plan;
 return {
  ...scenario,
  focus:recorded,
  outcome:{
   ...scenario.outcome,
   plan:{
    ...currentPlan,
    levels:Array.isArray(revision.levels)?revision.levels.slice():currentPlan.levels,
    pp:Number.isInteger(revision.pp)?revision.pp:currentPlan.pp
   },
   suggestedSkills:Array.isArray(revision.recommendations)?
    revision.recommendations.map(x=>({...x})):scenario.outcome.suggestedSkills,
   booster:revision.boosterRanking?{
    primary:revision.boosterRanking.primary?
     {nome:revision.boosterRanking.primary.name}:null,
    alternatives:Array.isArray(revision.boosterRanking.alternatives)?
     revision.boosterRanking.alternatives.map(x=>({nome:x.name})):[],
   }:scenario.outcome.booster
  }
 };
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
  focusA:a.focus?.priority?.map(x=>typeof x==='string'?x:x?.name).filter(Boolean)||[],
  focusB:b.focus?.priority?.map(x=>typeof x==='string'?x:x?.name).filter(Boolean)||[]};
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
  const key=identity(model,pos,style,mgr).id,base=baseSignature(model),
   content=contentSignature(model);
  const safe=[];
  for(const record of item.revisions){
   if(!record||record.selectedPosition!==pos||record.style!==style||
      record.manager!==mgr||record.levels!==null&&
      (!Array.isArray(record.levels)||record.levels.length!==10||
       !record.levels.every(x=>Number.isInteger(x)&&x>=0&&x<=20)))
     throw Error('Revisão de cenário inconsistente');
   // Revalidar a edição e o estado de equipamento: NÃO homologar registros
   // V311/V312 sem assinatura de conteúdo ou cartas alteradas na importação.
   // Aprovações históricas permanecem como registros, mas ficam DESATUALIZADAS.
   const matches=Boolean(record.contentSignature&&record.contentSignature===content);
   safe.push({...record,
    base:matches?base:record.base||'identidade_documental_pendente',
    contentSignature:record.contentSignature||null,
    approved:record.approved===true,evidenceImported:true,
    provenanceStatus:matches?'dados_conciliados':'revisao_legada_ou_edicao_divergente'});
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
 identity,contentSignature,compute,positionMap,managerEvidence,responsibilities,snapshot,familiarity,storageHealth,revisions,saved,save,choose,preferred,withSaved,compare,exportOwnerScenarios,importOwnerScenarios});
});
