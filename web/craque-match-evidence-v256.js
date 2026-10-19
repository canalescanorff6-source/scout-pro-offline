/* Craque Tático V256 — evidência MANUAL de partidas por edição, função,
 * tática e os dez investimentos exatos de PP. Não comprova meta, Player ID,
 * vídeo assistido ou a aplicação de um treino sem confirmação do usuário.
 * Não altera as 246 cartas, nem builds oficiais/provisórias do catálogo.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_MATCH_EVIDENCE_V256=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const T=host?.SCOUT_TACTICS_V220||
 (typeof module==='object'&&module.exports?require('./scout-multitactic-engine-v220.js'):null);
const SCHEMA='CRAQUE_MATCH_EVIDENCE_V256';
const PREFIX='scoutpro:v256:match-evidence:';
const MODES=Object.freeze(['posse','normal','rapido','fora','longo']);
const ROLES=Object.freeze(['GO','ZG','LD','LE','VOL','MLG','MAT','SA','CA','ALA']);
const GRADES=Object.freeze(['bom','regular','ruim','nao_avaliado']);
const MAX_ENTRIES=40;
const validLevels=x=>T?.valid(x)===true;
const key=card=>{
 const cap=Number(card?.numero),id=String(card?.id??'').trim();
 if(!Number.isInteger(cap)||cap<1||cap>246||!id||id.length>100)throw Error('Edição CAP/Card ID inválida.');
 return PREFIX+cap+'@'+id;
};
const budget=card=>Number(card?.pp);
function build(card,mode,role,levels,source){
 if(!MODES.includes(mode)||!ROLES.includes(role)||!validLevels(levels)||
  !['catalogo','simulacao'].includes(source)||!Number.isInteger(budget(card))||
  T.total(levels)!==budget(card))
  throw Error('Distribuição inválida para esta tática, função ou PP da edição.');
 key(card);
 return Object.freeze({
  mode,role,source,levels:levels.slice(),pp:budget(card),
  fingerprint:[mode,role,budget(card),...levels].join(':')
 });
}
function validDate(d){
 if(typeof d!=='string'||!/^\d{4}-\d\d-\d\d$/.test(d))return false;
 const date=new Date(d+'T12:00:00Z');
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===d;
}
function validEntry(r,card){
 if(!r||typeof r!=='object'||Array.isArray(r)||typeof r.id!=='string'||
  !/^[a-zA-Z0-9_-]{5,100}$/.test(r.id)||!validDate(r.date)||
  !['V','E','D'].includes(r.result)||r.in_game_confirmed!==true||
  typeof r.notes!=='string'||r.notes.length>800||
  typeof r.video_filename!=='string'||r.video_filename.length>120||
  !Array.isArray(r.observations)||r.observations.length!==3||
  !r.observations.every(o=>o&&typeof o.prompt==='string'&&o.prompt.length>0&&
   o.prompt.length<=180&&GRADES.includes(o.grade)))return false;
 try{
  const expected=build(card,r.build?.mode,r.build?.role,
   r.build?.levels,r.build?.source);
  return r.build?.fingerprint===expected.fingerprint&&r.build?.pp===expected.pp;
 }catch(_){return false}
}
function parse(card,store){
 const slot=key(card),raw=store?.getItem?.(slot);
 if(raw===null||raw===undefined)return [];
 let db;
 try{db=JSON.parse(raw)}catch(_){throw Error('Histórico local ilegível; nenhum dado foi alterado.')}
 if(!db||db.schema!==SCHEMA||db.cap!==Number(card.numero)||
  db.card_id!==String(card.id)||db.edition!==String(card.versao)||
  !Array.isArray(db.entries)||db.entries.length>MAX_ENTRIES||
  !db.entries.every(r=>validEntry(r,card))||
  new Set(db.entries.map(r=>r.id)).size!==db.entries.length)
  throw Error('Histórico desta edição incompatível. Faça backup antes de corrigir.');
 return db.entries;
}
function makeId(){
 if(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function')
  return crypto.randomUUID().replace(/-/g,'');
 return 'm'+Date.now().toString(36)+Math.random().toString(36).slice(2,15);
}
function save(card,store,spec){
 if(!store?.setItem)throw Error('Armazenamento local indisponível.');
 if(spec?.in_game_confirmed!==true)
  throw Error('Confirme que esta distribuição foi realmente utilizada no eFootball.');
 const selected=build(card,spec.mode,spec.role,spec.levels,spec.source);
 const record={
  id:spec.id||makeId(),date:spec.date,result:spec.result,
  in_game_confirmed:true,build:selected,
  observations:(spec.observations||[]).map(x=>({
   prompt:String(x.prompt||''),grade:String(x.grade||'nao_avaliado')
  })),
  notes:String(spec.notes??''),video_filename:String(spec.video_filename??'')
 };
 if(!validEntry(record,card))throw Error('Registro incompleto ou com dados inválidos.');
 const entries=parse(card,store);
 if(entries.length>=MAX_ENTRIES)throw Error('Limite de 40 partidas nesta edição. Faça backup antes de registrar mais.');
 if(entries.some(x=>x.id===record.id))throw Error('Identificador de partida duplicado.');
 const next=entries.concat(record);
 store.setItem(key(card),JSON.stringify({
  schema:SCHEMA,cap:Number(card.numero),card_id:String(card.id),
  edition:String(card.versao),entries:next
 }));
 return Object.freeze({record,count:next.length});
}
function remove(card,store,id){
 if(!store?.setItem||!store?.removeItem)throw Error('Armazenamento indisponível.');
 const previous=parse(card,store);
 if(!previous.some(x=>x.id===id))throw Error('Partida não encontrada nesta edição.');
 const next=previous.filter(x=>x.id!==id);
 if(next.length)store.setItem(key(card),JSON.stringify({
  schema:SCHEMA,cap:Number(card.numero),card_id:String(card.id),
  edition:String(card.versao),entries:next
 }));
 else store.removeItem(key(card));
 return next.length;
}
function list(card,store,selected){
 const entries=parse(card,store);
 const current=selected?
  entries.filter(x=>x.build.fingerprint===selected.fingerprint):
  entries;
 return current.slice().reverse();
}
function summary(card,store,selected){
 const observed=list(card,store,selected);
 return Object.freeze({
  total:observed.length,
  wins:observed.filter(x=>x.result==='V').length,
  draws:observed.filter(x=>x.result==='E').length,
  losses:observed.filter(x=>x.result==='D').length,
  recordedByUser:true,validatedByGame:false,
  note:'Relatos do usuário, não validação competitiva nem vídeos verificados.'
 });
}
function render(doc,{card,check,store,notify}={}){
 const mk=(tag,cls,text)=>{
  const e=doc.createElement(tag);if(cls)e.className=cls;
  if(text!==undefined)e.textContent=String(text);
  return e;
 };
 const wrapper=mk('details','ct256-trials');wrapper.id='ct256-trials';
 const heading=mk('summary','','Testar uma ficha em partidas · registro por edição');
 wrapper.append(heading);
 const content=mk('div','ct256-body');wrapper.append(content);
 const tip=mk('p','ct256-tip',
  'Registre somente partidas realmente jogadas. A evidência fica ligada ao Card ID, à tática, à função e aos 10 níveis exatos. O nome de um vídeo NÃO significa vídeo verificado. Nenhum registro aprova uma build automaticamente.');
 content.append(tip);
 const profiles=[];
 try{
  const original=Array.isArray(check?.original)?check.original:null;
  if(original&&T?.valid(original)&&T.total(original)===Number(card.pp)&&
   check.positionEvidence==='original')
   profiles.push({title:'Treino original registrado no catálogo',value:build(card,check.style,check.role,original,'catalogo')});
  const hypothetical=check?.proposal?.levels;
  if(check?.status!=='unsupported'&&hypothetical&&
   T?.valid(hypothetical)&&T.total(hypothetical)===Number(card.pp))
   profiles.push({title:'Simulação da tática — exigir confirmação em jogo',value:build(card,check.style,check.role,hypothetical,'simulacao')});
 }catch(_){}
 if(!profiles.length){
  content.append(mk('p','ct256-warning',
   'A edição ainda não possui uma distribuição completa e elegível com PP exatos para registrar uma partida. Confira primeiro nível, PP e posição.'));
  return wrapper;
 }
 let storageError=false;
 try{parse(card,store)}catch(error){
  storageError=true;
  content.append(mk('p','ct256-warning',error.message));
 }
 const form=mk('form','ct256-form');
 const row=(title,control)=>{
  const label=mk('label','ct256-field');
  label.append(mk('span','',title),control);return label;
 };
 const select=mk('select','');select.name='build';
 for(let i=0;i<profiles.length;i++){
  const op=mk('option','',profiles[i].title);op.value=String(i);select.append(op);
 }
 form.append(row('Distribuição que você realmente utilizou',select));
 const date=mk('input','');date.type='date';date.name='date';
 date.required=true;date.value=new Date().toISOString().slice(0,10);
 form.append(row('Data da partida',date));
 const outcome=mk('select','');outcome.name='result';
 for(const [value,label] of [['','Selecionar resultado'],['V','Vitória'],['E','Empate'],['D','Derrota']]){
  const op=mk('option','',label);op.value=value;outcome.append(op);
 }
 outcome.required=true;
 form.append(row('Resultado',outcome));
 const prompts=Array.isArray(check?.context?.tests)?check.context.tests.slice(0,3):[];
 while(prompts.length<3)prompts.push('Observação tática '+(prompts.length+1));
 const grades=[];
 for(const prompt of prompts){
  const input=mk('select','');grades.push({prompt,input});
  for(const [value,label] of [
   ['nao_avaliado','Não avaliado'],['bom','Funcionou bem'],
   ['regular','Irregular'],['ruim','Não funcionou']]){
   const op=mk('option','',label);op.value=value;input.append(op);
  }
  form.append(row(prompt,input));
 }
 const video=mk('input','');video.type='text';video.maxLength=120;
 video.placeholder='Nome do vídeo MP4 (opcional)';video.name='video_filename';
 form.append(row('Vídeo da partida (somente referência de nome)',video));
 const notes=mk('textarea','');notes.name='notes';notes.maxLength=800;
 notes.rows=3;notes.placeholder='Ex.: demorou para finalizar, recebeu pressionado, perdeu tabelas curtas…';
 form.append(row('O que você observou em campo?',notes));
 const confirmation=mk('input','');confirmation.type='checkbox';confirmation.required=true;
 confirmation.name='in_game_confirmed';
 form.append(row('Confirmo que usei exatamente esta edição, tática, posição e distribuição de pontos no eFootball.',confirmation));
 const saveButton=mk('button','ct256-save','Salvar partida nesta ficha');
 saveButton.type='submit';saveButton.disabled=storageError;
 form.append(saveButton);
 const message=mk('p','ct256-message','');message.setAttribute('role','status');
 message.setAttribute('aria-live','polite');
 content.append(form,message);
 const log=mk('section','ct256-list');
 const report=()=>{
  const chosen=profiles[Number(select.value)]?.value;
  if(!chosen)return;
  let items;
  try{items=list(card,store,chosen)}catch(error){
   log.replaceChildren(mk('p','ct256-warning',error.message));return;
  }
  const stat=summary(card,store,chosen);
  heading.textContent='Testes desta build · '+stat.total+' partida(s) relatada(s)';
  log.replaceChildren(mk('p','ct256-count',
   stat.total+' registro(s) nesta edição/tática/função/build · '+
   stat.wins+'V '+stat.draws+'E '+stat.losses+'D. Relatos pessoais; sem homologação automática.'));
  for(const entry of items.slice(0,12)){
   const article=mk('article','ct256-match');
   article.append(mk('strong','',entry.date+' · '+entry.result+
    ' · '+entry.build.source+' · '+entry.build.pp+' PP'));
   const evaluated=entry.observations.filter(x=>x.grade!=='nao_avaliado');
   for(const obs of evaluated)
    article.append(mk('p','',obs.prompt+' — '+obs.grade));
   if(entry.notes)article.append(mk('p','',entry.notes));
   if(entry.video_filename)article.append(mk('small','',
    'Arquivo citado, ainda não verificado: '+entry.video_filename));
   const undo=mk('button','ct256-delete','Excluir este registro');
   undo.type='button';
   undo.addEventListener('click',()=>{
    if(!host?.confirm?.('Excluir apenas este registro manual? Esta operação não altera builds ou partidas de outras edições.'))return;
    try{remove(card,store,entry.id);report();
     message.textContent='Registro excluído. Builds e demais partidas preservadas.';
     host?.dispatchEvent?.(new host.CustomEvent('craque:data-changed',{detail:{key:key(card)}}));
    }catch(error){message.textContent=error.message}
   });
   article.append(undo);log.append(article);
  }
 };
 content.append(log);
 select.addEventListener('change',report);
 form.addEventListener('submit',event=>{
  event.preventDefault();
  try{
   const chosen=profiles[Number(select.value)]?.value;
   const result=save(card,store,{
    ...chosen,date:date.value,result:outcome.value,
    observations:grades.map(x=>({prompt:x.prompt,grade:x.input.value})),
    video_filename:video.value,notes:notes.value,
    in_game_confirmed:confirmation.checked
   });
   confirmation.checked=false;message.textContent=
    'Partida registrada nesta edição/build ('+result.count+' no total). '+
    'Seu relato não significa homologação competitiva.';
   report();
   host?.dispatchEvent?.(new host.CustomEvent('craque:data-changed',{detail:{key:key(card)}}));
   if(typeof notify==='function')notify(result.record);
  }catch(error){message.textContent=error.message}
 });
 report();
 return wrapper;
}
return Object.freeze({SCHEMA,PREFIX,MODES,ROLES,GRADES,MAX_ENTRIES,key,build,
 validEntry,parse,save,remove,list,summary,render});
});
