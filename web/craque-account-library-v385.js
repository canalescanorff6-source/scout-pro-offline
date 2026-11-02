/* Bibliotecas privadas e fichas individuais; nenhuma alteração no catálogo canônico. */
(function(w,f){const api=f(w);if(typeof module==='object'&&module.exports)module.exports=api;if(w)w.CRAQUE_ACCOUNT_LIBRARY_V385=api;})(typeof window!=='undefined'?window:null,function(w){'use strict';
const A=w?.CRAQUE_ACCOUNTS_V382||(typeof require==='function'?require('./craque-accounts-v382.js'):null);
const M=w?.CRAQUE_FUNCTION_METHOD_V383||(typeof require==='function'?require('./craque-function-method-v383.js'):null);
const C=w?.CRAQUE_TEAM_CONTEXT_V382||(typeof require==='function'?require('./craque-team-context-v382.js'):null);
const IMPORT_SCHEMA='CRAQUE_ACCOUNT_CARD_IMPORT_V385',SHEET_SCHEMA='CRAQUE_ACCOUNT_SHEET_V385',SHEET_PREFIX='scoutpro:v385:sheets:';
const clone=x=>JSON.parse(JSON.stringify(x)),account=id=>{if(!['primary','secondary'].includes(id))throw Error('Conta inválida.');return id;},label=id=>account(id)==='primary'?'Principal':'Secundária';
const fingerprint=c=>C.signature(A.normalCard(c));
function saveCard(store,id,raw){account(id);const c=A.normalCard(raw),doc=A.read(store);if(id==='primary'&&/^(?:cap:|ct364-)/.test(c.id))throw Error('Identificador reservado ao acervo legado.');
 const at=doc[id].cards.findIndex(x=>x.id===c.id);if(at<0)doc[id].cards.push(c);else doc[id].cards[at]=c;A.save(store,doc);return c;}
function previewImport(store,id,data){account(id);const legacy=data?.schema===A.DRAFT;
 if(!data||(!legacy&&data.schema!==IMPORT_SCHEMA))throw Error('Arquivo de cartas inválido.');
 const target=legacy?'secondary':data.accountId;if(target!==id)throw Error('Arquivo pertence à conta '+(target==='primary'?'Principal':target==='secondary'?'Secundária':'desconhecida')+'. Escolha essa conta antes de importar.');
 if(!Array.isArray(data.cards)||data.cards.length>1200||data.managers!==undefined&&!Array.isArray(data.managers))throw Error('Acervo inválido.');
 const doc=A.read(store),cards=data.cards.map(A.normalCard),managers=(data.managers||[]).map(A.normalManager);
 if(new Set(cards.map(c=>c.id)).size!==cards.length||new Set(managers.map(m=>m.id)).size!==managers.length)throw Error('Identificadores repetidos no arquivo.');
 let added=0;for(const c of cards){if(id==='primary'&&/^(?:cap:|ct364-)/.test(c.id))throw Error('Identificador reservado ao acervo legado.');const old=doc[id].cards.find(x=>x.id===c.id);
  if(old&&JSON.stringify(old)!==JSON.stringify(c))throw Error('Conflito de carta: '+c.name+'. Dados atuais preservados.');if(!old){doc[id].cards.push(c);added++;}}
 for(const m of managers){const old=doc[id].managers.find(x=>x.id===m.id);if(old&&JSON.stringify(old)!==JSON.stringify(m))throw Error('Conflito de técnico.');if(!old)doc[id].managers.push(m);}
 if(id==='secondary'&&legacy){doc.secondary.name=String(data.account?.name||doc.secondary.name).slice(0,80);doc.secondary.evidence=clone(data.evidence??doc.secondary.evidence);}
 A.validate(doc);return {accountId:id,accountLabel:label(id),added,total:doc[id].cards.length,cards:cards.map(c=>({name:c.name,edition:c.edition})),document:doc};}
function importCards(store,id,data){const p=previewImport(store,id,data);A.save(store,p.document);return {added:p.added,total:p.total,accountId:id};}
function individualContext(card,options={}){const id=account(card.accountId),position=options.position||card.position,style=options.style||'posse';if(!A.POS.includes(position)||!Object.hasOwn(C.MODES,style))throw Error('Posição ou estilo inválido.');
 if((position==='GO')!==(card.position==='GO'))throw Error('Goleiro e jogador de linha não podem trocar de função.');
 const manager=options.manager||null,instructions=(options.instructions||[]).map(type=>{if(!['defensive','anchoring','counter_target'].includes(type))throw Error('Instrução individual inválida.');return {type,phase:C.INSTRUCTIONS[type].phase,instanceId:card.id};});
 const member={slot:{id:'individual',position,x:50,y:50},offBall:{id:'individual',position,x:50,y:50},card,eligible:(card.positions||[card.position]).includes(position),offenseStyle:card.offenseStyle||'Não informado',defenceStyle:card.defenceStyle||'Não informado',instructions};
 member.activation=M.activation(member);member.functionPlan=M.contract(member,options.functionKey);member.role={attack:member.functionPlan.attack,defence:member.functionPlan.defence};member.styleActivation=member.activation.attack.label+'; '+member.activation.defence.label;
 const sig=C.signature({accountId:id,card:fingerprint(card),position,style,manager,instructions,functionKey:member.functionPlan.key,method:M.VERSION});
 return {schema:'CRAQUE_INDIVIDUAL_CONTEXT_V385',accountId:id,style,formation:null,manager,proficiency:manager?.proficiency?.[style]??null,lineup:{individual:card.id},instructions,functions:{[card.id]:member.functionPlan.key},members:[member],warnings:[...(!member.eligible?['Familiaridade nesta posição a conferir.']:[]),...(!manager?['Técnico não selecionado.']:[])],signature:sig,ready:false,cardFingerprint:fingerprint(card)};}
const sheetKey=(id,cardId)=>SHEET_PREFIX+account(id)+':'+encodeURIComponent(cardId);
function sheets(store,id,card){const raw=store.getItem(sheetKey(id,card.id));if(!raw)return [];let doc;try{doc=JSON.parse(raw);}catch(_){throw Error('Histórico de fichas ilegível; registros preservados.');}
 if(doc.schema!==SHEET_SCHEMA||doc.accountId!==id||doc.cardId!==card.id||!Array.isArray(doc.revisions)||doc.revisions.length>30)throw Error('Histórico de fichas inválido.');
 return doc.revisions.map(r=>({...clone(r),stale:r.cardFingerprint!==fingerprint(card)}));}
function saveSheet(store,id,card,context,review){account(id);const current=A.read(store)[id].cards.find(c=>c.id===card.id);
 if(!current||card.accountId!==id||context.accountId!==id||context.cardFingerprint!==fingerprint(current)||context.members[0]?.card.id!==card.id||review.identity?.cardId!==String(card.cardId||'')||review.identity?.edition!==(card.edition||''))throw Error('Ficha não corresponde à conta, edição ou contexto atual.');
 const budget=card.pp??(Number.isInteger(card.maxLevel)?2*(card.maxLevel-1):null);
 if(!Array.isArray(review.proposed)||review.proposed.length!==10||review.proposed.some(n=>!Number.isInteger(n)||n<0||n>20)||!Number.isInteger(budget)||A.cost(review.proposed)!==budget||review.pp!==budget||!context.members[0].eligible)throw Error('Treino sem PP válidos ou familiaridade pendente.');
 const key=sheetKey(id,card.id),revisions=sheets(store,id,card).map(({stale,...r})=>r),revision={id:'sheet-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),savedAt:new Date().toISOString(),cardFingerprint:fingerprint(card),contextSignature:context.signature,
  options:{style:context.style,position:context.members[0].slot.position,functionKey:context.members[0].functionPlan.key,manager:context.manager,instructions:context.instructions.map(i=>i.type)},review:clone(review)};
 if(revisions.length>=30)throw Error('Limite de30revisões desta carta atingido. Exporte o backup; o histórico anterior foi preservado.');
 const serial=JSON.stringify({schema:SHEET_SCHEMA,accountId:id,cardId:card.id,revisions:[revision,...revisions]}),before=store.getItem(key);let total=new TextEncoder().encode(serial).length;
 for(let i=0;i<store.length;i++){const k=store.key(i);if(k?.startsWith('scoutpro:')&&k!==key)total+=new TextEncoder().encode(k+(store.getItem(k)||'')).length;}
 if(total>8*1024*1024-4096)throw Error('Histórico excederia o limite do backup.');
 try{store.setItem(key,serial);if(store.getItem(key)!==serial)throw Error('Gravação não confirmada.');}catch(e){try{if(before===null)store.removeItem(key);else store.setItem(key,before);}catch(_){}throw Error('Não foi possível salvar a ficha: '+e.message);}return revision;}
return Object.freeze({IMPORT_SCHEMA,SHEET_SCHEMA,SHEET_PREFIX,label,saveCard,previewImport,importCards,individualContext,saveSheet,sheets,fingerprint});
});
