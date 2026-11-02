/* Conferência de nível por edição: dado público não é recibo do jogo. */
(function(w,f){'use strict';const api=f(w);if(typeof module==='object'&&module.exports)module.exports=api;
 if(w)w.CRAQUE_LEVEL_REVIEW_V381=api;})(typeof window!=='undefined'?window:null,function(host){'use strict';
const valid=n=>Number.isInteger(n)&&n>=1&&n<=120;
function decide(card,source,options={}){
 const pending=reason=>({status:'pending',maxLevel:null,pp:null,reason,confirmedInGame:false});
 const id=String(card?.id||''),data=source?.data;
 const report=options.ownerReport;
 if(report?.reportedByOwner===true&&Number.isInteger(card.numero)&&report.capture===card.numero&&
  report.catalogueId===id&&report.name===card.name&&report.edition===card.versao&&
  valid(report.level)&&report.pp===2*(report.level-1)&&typeof report.source==='string'&&report.source.trim()){
  const identityPending=options.identityUsable!==true||!/^\d{5,20}$/.test(id);
  return {status:'reviewed',cardId:identityPending?null:id,maxLevel:report.level,pp:report.pp,fixed:false,
   sourceKind:'owner_efhub_report',url:null,sha256:null,publicLevel:null,conflict:false,
   ownerSource:report.source,identityPending,confirmedInGame:false};
 }
 if(!/^\d{5,20}$/.test(id)||!data||source.error||String(data.cardId)!==id||String(source.id)!==id)
  return pending('Card ID exato não vinculado à fonte pública.');
 let level=null,sourceKind='efhub_public',url=source.url,hash=source.sha256,fixed=false;
 const capture=options.capture,supplement=options.supplement;
 const captured=Boolean(capture&&Number.isInteger(card.numero)&&capture.capture===card.numero&&String(capture.cardId)===id&&
  capture.automaticallyDisplayed===true&&valid(capture.level)&&typeof capture.source==='string');
 if(captured){level=capture.level;sourceKind='owner_efhub_capture';}
 else if(valid(data.levelCap)&&data.levelCap>1)level=data.levelCap;
 else if(data.levelCap===1&&data.playerType===3){level=1;fixed=true;}
 else if(String(supplement?.id)===id&&valid(supplement.maxLevel)&&supplement.maxLevel>1){
  level=supplement.maxLevel;sourceKind='public_supplement';url=supplement.url;hash=supplement.sha256;
 }else if(data.levelCap===1&&card.max_level===1&&card.pp===0&&/^informado_pelo_usuario_/.test(String(card.pp_origem||''))){
  level=1;sourceKind='owner_registered_zero';
 }else return pending('A fonte não informa nível máximo utilizável; 0/1 de edição treinável não comprova 0 PP.');
 return {status:'reviewed',cardId:id,maxLevel:level,pp:2*(level-1),fixed,sourceKind,url,sha256:hash,
  publicLevel:Number.isInteger(data.levelCap)?data.levelCap:null,
  conflict:Boolean(captured&&data.levelCap!==level),ownerSource:captured?capture.source:null,
  confirmedInGame:false};
}
function rowFor(card,audit){return audit?.cards?.find(r=>r.capture===card.numero&&r.catalogueId===String(card.id)&&r.name===card.name&&r.edition===card.versao)||null;}
function verified(card,audit){const r=rowFor(card,audit);return r?.decision?.status==='reviewed'&&
 r.decision.maxLevel===card.max_level&&r.decision.pp===card.pp?r:null;}
if(host?.document){const mark=()=>{const doc=host.document;let raw;try{raw=JSON.parse(doc.getElementById('scout-v68-data')?.textContent||'null');}catch(_){return;}
 const proof=raw?.nivel_referencia;if(proof?.kind!=='revisao_nivel_v381')return;
 for(const kpi of doc.querySelectorAll('.detail-header .hero-kpi')){
  const label=kpi.querySelector('small'),value=kpi.querySelector('strong');
  if(label&&value&&/\bPP\b/.test(label.textContent)){
   label.textContent=proof.source_kind==='owner_efhub_report'?'PP · informado por você':'PP · referência revisada';value.textContent=raw.pp+' PP';}
 }
 if(proof.previous_pp===raw.pp)return;
 const notice=doc.querySelector('.ct377-notice'),paragraph=notice?.querySelector('p');
 if(paragraph&&!notice.querySelector('.ct381-previous-notice')){
  const previous=doc.createElement('details'),summary=doc.createElement('summary'),text=doc.createElement('p');
  previous.className='ct381-previous-notice';summary.textContent='Aviso anterior · somente histórico';text.textContent=paragraph.textContent;
  previous.append(summary,text);notice.append(previous);
  paragraph.textContent='Edição vinculada à sua imagem. Nível máximo '+raw.max_level+' e '+raw.pp+' PP '+
   (proof.source_kind==='owner_efhub_report'?'informados por você no eFHUB':'conferidos na referência da edição')+
   ', sem confirmação do treino no jogo. O treino do orçamento anterior permanece arquivado.';
 }
 for(const id of ['pontos','treino','status']){const section=doc.getElementById(id);if(!section||section.querySelector('.ct381-history-note'))continue;
  const note=doc.createElement('p');note.className='warn ct381-history-note';note.setAttribute('role','note');
  note.textContent='Histórico do orçamento anterior ('+proof.previous_pp+' PP). Para o orçamento corrigido de '+raw.pp+' PP, use a ficha recalculada acima. Estes valores históricos não confirmam o treino atual.';
  section.prepend(note);}
 };if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();}
return Object.freeze({decide,rowFor,verified});
});
