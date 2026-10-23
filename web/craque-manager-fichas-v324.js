/* Craque Tático V324 — ficha pessoal CONSULTIVA por edição de técnico e posição.
 * Compartilhada por Minhas Cartas / Outros Elencos, sem afetar o catálogo.
 * Revisões imutáveis por contexto; armazenamento no backup scoutpro:*.
 */
(function(host,factory){'use strict';
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_MANAGER_FICHAS_V324=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const PREFIX='scoutpro:v324:manager-profile:';
const SCHEMA='CRAQUE_MANAGER_FICHA_V324';
const STYLES=Object.freeze(['posse','rapido','normal','fora','longo']);
const POSITIONS=Object.freeze(['CA','SA','MAT','MLG','VOL','ZG','LE','LD','GO','PTE','PTD','MLE','MLD']);
const normalize=v=>String(v??'').trim();
const safeParts=parts=>parts.map(x=>encodeURIComponent(normalize(x))).join('|');
function validateContext(c){
 if(!c||!['minhas-246','outros-elencos'].includes(c.collection)||!c.owner||
  !c.cardKey||!c.cardId||!c.edition||!POSITIONS.includes(c.position)||
  !STYLES.includes(c.style)||!/^CT-MGR-\d{3}$/.test(c.manager||'')||
  !Number.isInteger(c.budget)||c.budget<0||c.budget>250||
  !c.sourceSignature)throw Error('Ficha exige carta, edição, técnico, função, estilo e PP comprovados');
 return Object.freeze({...c});
}
function fromScenario(s,model){
 if(!s||!model||!s.outcome)throw Error('Cenário da carta ausente');
 const plan=s.outcome.plan||{};
 let budget=model.pp;
 // V325: a ficha externa guarda nível máximo, mas PP manual pode ser
 // null. O motor V228/V309 já calcula 2*(nível máximo-1). Aceitar
 // SOMENTE se nível, custo e hipótese do cenário forem coerentes.
 if(!Number.isInteger(budget)&&model.collection==='outros-elencos'){
  const level=model.level;
  const expected=Number.isInteger(level)&&level>=1&&level<=120?2*(level-1):null;
  if(plan.status==='hipotese'&&Number.isInteger(plan.pp)&&plan.pp===expected)
   budget=expected;
 }
 if(Number.isInteger(budget)&&Number.isInteger(plan.pp)&&budget!==plan.pp)
  throw Error('Divergência entre PP da carta e da ficha contextual; gravação bloqueada');
 return validateContext({
  collection:model.collection,owner:model.owner,cardKey:model.cardKey,
  cardId:model.cardId,edition:model.edition||'edicao-pendente',
  position:s.position,style:s.style,manager:s.manager,
  budget,sourceSignature:s.contentSignature
 });
}
function withStyle(c,style){
 return validateContext({...c,style});
}
function withManager(c,manager){
 return validateContext({...c,manager});
}
function withPosition(c,position){
 return validateContext({...c,position});
}
function key(c){
 validateContext(c);
 return PREFIX+safeParts([c.collection,c.owner,c.cardKey,c.cardId,c.edition,c.manager,c.position,c.style,c.sourceSignature]);
}
function ppCost(n){
 if(!Number.isInteger(n)||n<0||n>20)throw Error('Progressão inválida');
 let cost=0;for(let i=0;i<n;i++)cost+=1+Math.floor(i/4);
 return cost;
}
function validTraining(value,budget){
 return Array.isArray(value)&&value.length===10&&
  value.every(n=>Number.isInteger(n)&&n>=0&&n<=20)&&
  value.reduce((n,x)=>n+ppCost(x),0)<=budget;
}
function cleanSkills(values){
 if(!Array.isArray(values)||values.length>5)throw Error('Máximo de cinco candidatas');
 const list=values.map(normalize);
 if(list.some(v=>!v||v.length>100)||new Set(list.map(x=>x.toLocaleLowerCase('pt-BR'))).size!==list.length)
  throw Error('Habilidade vazia, duplicada ou inválida');
 return list;
}
// V325: propostas antigas continuam visíveis mesmo quando o motor evolui.
// Normalizar acentos apenas para deduplicação e alertas — sem traduzir/inventar skills.
function skillName(value){
 return normalize(typeof value==='string'?value:(value?.name||value?.nome||''));
}
function skillToken(value){
 return skillName(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/\s+/g,' ').trim();
}
function skillList(value){
 if(Array.isArray(value))return value.map(skillName).filter(Boolean);
 if(typeof value==='string')return value.split(/[;,]/).map(normalize).filter(Boolean);
 return [];
}
function reviewSkillCandidates(saved=[],suggested=[],native=[],equipped=[]){
 const previous=cleanSkills(saved);
 const nativeSet=new Set(skillList(native).map(skillToken));
 const equippedSet=new Set(skillList(equipped).map(skillToken));
 const selected=new Set(),rows=[];
 function append(name,wasSaved){
  const clean=skillName(name),token=skillToken(clean);
  if(!clean||selected.has(token))return;
  // Não exibir novas candidatas que já sejam habilidades nativas/equipadas.
  if(!wasSaved&&(nativeSet.has(token)||equippedSet.has(token)))return;
  selected.add(token);
  rows.push(Object.freeze({name:clean,saved:wasSaved,
   conflict:nativeSet.has(token)?'nativa':equippedSet.has(token)?'já equipada':null}));
 }
 previous.forEach(n=>append(n,true));
 if(!Array.isArray(suggested))throw Error('Recomendações de habilidade inválidas');
 suggested.slice(0,30).forEach(n=>{if(rows.length<previous.length+5)append(n,false)});
 return rows;
}
// V340: auditoria documental da MESMA carta; não valida equipamento real.
// O histórico imutável nunca é alterado ou apagado por esta função.
function auditEquipmentSelection(skills=[],booster='',native=[],equipped=[],fixedBooster='',boosterSlot='pendente'){
 const selected=cleanSkills(skills);
 const nativeSet=new Set(skillList(native).map(skillToken));
 const equippedSet=new Set(skillList(equipped).map(skillToken));
 const conflicts=selected.flatMap(name=>{
  const token=skillToken(name),sources=[];
  if(nativeSet.has(token))sources.push('nativa_cadastrada');
  if(equippedSet.has(token))sources.push('adicional_informada');
  return sources.length?[Object.freeze({name,sources:Object.freeze(sources)})]:[];
 });
 const boosterSelected=normalize(booster),fixed=normalize(fixedBooster);
 const fixedBoosterSame=Boolean(boosterSelected&&fixed&&
  skillToken(boosterSelected)===skillToken(fixed));
 return Object.freeze({
  conflicts:Object.freeze(conflicts),hasSkillConflict:conflicts.length>0,
  fixedBoosterSame,fixedBoosterDeclared:fixed||null,
  slotEvidence:normalize(boosterSlot)||'pendente',
  status:conflicts.length?'revisar_habilidades':
   fixedBoosterSame?'revisar_impeto_fixo':'sem_colisao_documental',
  warning:'Conferência apenas contra listas cadastradas nesta carta. Não comprova '+ 
   'vagas livres, habilidades equipadas, ímpeto adicional ou desempenho em partida.'
 });
}
// V343: o slot declarado é uma evidência de cadastro, NÃO licença de ativação.
 // A ausência explícita de slot impede gravar um NOVO candidato incoerente.
 // Os rascunhos históricos permanecem legíveis e não são reescritos.
function reviewBoosterSlot(booster='',boosterSlot='pendente'){
 const value=normalize(booster),slot=normalize(boosterSlot).toLocaleLowerCase('pt-BR')||'pendente';
 const selected=Boolean(value);
 let status='sem_candidato',blocking=false,reason='';
 if(selected&&slot==='ausente'){
  status='slot_ausente';blocking=true;
  reason='A carta está cadastrada como SEM slot adicional. Remova o ímpeto candidato '+
   'ou confira e corrija o cadastro da edição antes de salvar outra revisão.';
 }else if(selected&&slot==='ocupado'){
  status='slot_ocupado';
  reason='O slot adicional está cadastrado como ocupado. A nova candidata é apenas '+
   'uma hipótese; confirme o que está equipado antes de tentar substituir.';
 }else if(selected&&slot==='vazio'){
  status='slot_vazio_declarado';
  reason='Slot relatado como vazio, mas a existência na edição e o equipamento '+
   'ainda precisam de confirmação no jogo.';
 }else if(selected){
  status='slot_nao_comprovado';
  reason='Não existe prova de slot adicional disponível para esta edição. '+
   'Ímpeto permanece candidato, não equipado.';
 }
 return Object.freeze({status,slot,selected,blocking,reason,
  gameplayValidated:false,mayEquip:false});
}
// V342: pré-verificação PURA para o estado atual do editor.
 // Nenhuma aprovação/equipamento é inferida da presença de uma candidata.
function reviewDraftReadiness({train,budget,skills=[],booster='',native=[],
 equipped=[],fixedBooster='',boosterSlot='pendente'}={}){
 const spent=Array.isArray(train)&&train.length===10&&
  train.every(x=>Number.isInteger(x)&&x>=0&&x<=20)?
   train.reduce((n,x)=>n+ppCost(x),0):null;
 const budgetOk=Number.isInteger(budget)&&budget>=0&&budget<=250;
 const ppReady=budgetOk&&validTraining(train,budget);
 const issues=[];
 if(!ppReady)issues.push('PP da ficha inválidos ou incompatíveis com o orçamento comprovado.');
 let audit=null,skillCount=0;
 try{
  const selected=cleanSkills(skills);
  skillCount=selected.length;
  if(new Set(selected.map(skillToken)).size!==selected.length)
   issues.push('Há habilidades com nomes equivalentes após normalizar acentos e espaços.');
  audit=auditEquipmentSelection(selected,booster,native,equipped,fixedBooster,boosterSlot);
  if(audit.hasSkillConflict)issues.push('Habilidade já consta nas listas cadastradas: '+
   audit.conflicts.map(x=>x.name).join(' · ')+'. Desmarque para registrar nova revisão.');
 }catch(e){issues.push('Seleção de habilidades inválida: '+String(e.message||e));}
 const slotReview=reviewBoosterSlot(booster,boosterSlot);
 if(slotReview.blocking)issues.push(slotReview.reason);
 const advisories=[];
 if(slotReview.reason&&!slotReview.blocking)advisories.push(slotReview.reason);
 if(audit?.fixedBoosterSame)advisories.push(
  'O ímpeto candidato coincide com o fixo informado. Verifique os slots no jogo.');
 advisories.push('Nenhuma habilidade, ímpeto ou treino é equipado por este salvamento.');
 return Object.freeze({
  canSave:issues.length===0,
  status:!ppReady?'pp_pendente':slotReview.blocking?'revisar_impeto_slot':
   issues.length?'revisar_habilidades':'pronto_para_rascunho',
  budget:budgetOk?budget:null,spent,remainingPP:spent!==null&&budgetOk?budget-spent:null,
  skillCount,issues:Object.freeze(issues),advisories:Object.freeze(advisories),
  audit,slotReview,source:'listas_informadas_na_mesma_carta_sem_confirmacao_de_gameplay'
 });
}
function validateRecord(row,c){
 if(!row||typeof row!=='object'||row.schema!==SCHEMA||
  row.key!==key(c)||row.sourceSignature!==c.sourceSignature||
  row.budget!==c.budget||!validTraining(row.train,c.budget)||
  !Array.isArray(row.skills)||row.skills.length>5||
  typeof row.booster!=='string'||row.booster.length>100||
  row.status!=='proposta_consultiva')return false;
 try{cleanSkills(row.skills)}catch(_){return false}
 return true;
}
function readAll(store,c){
 if(!store?.getItem)throw Error('Armazenamento local não disponível');
 const raw=store.getItem(key(c));
 if(raw===null||raw===undefined||raw==='')return [];
 let obj;try{obj=JSON.parse(raw)}catch(_){throw Error('Ficha do técnico ilegível; gravação bloqueada para preservar dados')}
 if(obj?.schema!==SCHEMA||!Array.isArray(obj.revisions)||obj.revisions.length>50||
  obj.revisions.some(r=>!validateRecord(r,c)))
  throw Error('Ficha do técnico incompatível ou desatualizada; histórico preservado, gravação bloqueada');
 return obj.revisions;
}
function read(store,c){
 const versions=readAll(store,c);
 const row=versions.at(-1);
 return row?JSON.parse(JSON.stringify(row)):null;
}
function save(store,c,{train,skills=[],booster='',source='Edição manual de cenário'}={}){
 validateContext(c);
 if(!validTraining(train,c.budget))throw Error('Distribuição excede PP ou contém níveis inválidos');
 const names=cleanSkills(skills),boost=normalize(booster);
 // V342: bloquear novas revisões com nomes equivalentes (acentos/espaços),
 // sem invalidar o formato ou apagar revisões legadas previamente salvas.
 if(new Set(names.map(skillToken)).size!==names.length)
  throw Error('Habilidades com nomes equivalentes; revise a seleção antes de salvar.');
 if(boost.length>100)throw Error('Ímpeto candidato inválido');
 if(typeof source!=='string'||source.length>120)throw Error('Fonte da proposta inválida');
 const versions=readAll(store,c); // erro em dado corrompido proíbe sobrescrita
 // Cada clique de +/- no editor é um auto-rascunho (coalescido).
 // Revisões salvas explicitamente pela ficha V311 continuam imutáveis.
 const auto=source.startsWith('V324 · Rascunho PP de ');
 const previous=versions.at(-1),coalesce=auto&&
  previous?.source?.startsWith('V324 · Rascunho PP de ');
 const row={
  schema:SCHEMA,key:key(c),sourceSignature:c.sourceSignature,budget:c.budget,
  train:train.slice(),skills:names,booster:boost,status:'proposta_consultiva',
  source,revision:coalesce?previous.revision:versions.length+1,
  // Nunca usar campos "equipped"/"approved": recomendar não é equipar.
  savedAt:new Date().toISOString()
 };
 const next=coalesce?[...versions.slice(0,-1),row]:[...versions,row];
 // A versão anterior aceitava gravar a 51ª revisão, mas readAll proibia
 // ler mais de 50. Rejeitar ANTES da gravação, preservando as 50 anteriores.
 if(next.length>50)throw Error('Limite de 50 revisões atingido: histórico preservado; exporte backup antes de novo salvamento');
 const serialized=JSON.stringify({schema:SCHEMA,revisions:next});
 if(serialized.length>85000)throw Error('Limite do histórico atingido; exporte backup');
 if(!store?.setItem)throw Error('Armazenamento indisponível');
 store.setItem(key(c),serialized);
 return JSON.parse(JSON.stringify(row));
}
function deleteDraft(store,c){
 readAll(store,c); // valida antes de remover, sem apagar histórico corrompido
 // Nunca apagar revisões: restaurar consiste em registrar nova revisão
 // ou manter o histórico existente; cancelamento usa confirmação na UI.
 return false;
}
return Object.freeze({PREFIX,SCHEMA,STYLES,POSITIONS,validateContext,
 fromScenario,withStyle,withManager,withPosition,key,ppCost,validTraining,
 cleanSkills,skillName,skillToken,reviewSkillCandidates,auditEquipmentSelection,reviewBoosterSlot,reviewDraftReadiness,readAll,read,save,deleteDraft});
});
