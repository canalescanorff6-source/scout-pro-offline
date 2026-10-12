/* Scout PRO V101 — morphology evidence, not a hidden Player ID score. UMD for offline Android/Windows tests. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.SCOUT_MODELO_V101=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const fields=['altura_cm','peso_kg','pe_dominante','uso_perna_ruim','precisao_perna_ruim'];
 const body=['comprimento_perna','alcance_perna_cm','colisao_tronco_cm'];
 const minmax={altura_cm:[120,230],peso_kg:[35,180],comprimento_perna:[0,20],alcance_perna_cm:[110,240],colisao_tronco_cm:[25,90]};
 const picks={pe_dominante:['direito','esquerdo'],uso_perna_ruim:['raramente','ocasionalmente','regularmente','frequentemente'],precisao_perna_ruim:['baixa','média','alta','muito alta']};
 const match=(card,e)=>!!card&&!!e&&Number(card.numero)===Number(e.numero)&&String(card.card_id||'').match(/^\d+$/)&&String(card.card_id)===String(e.card_id);
 const key=card=>'scoutpro:v101:body:'+String(card.numero)+':'+String(card.card_id||'PENDENTE');
 function validPatch(data){
  if(!data||typeof data!=='object'||Array.isArray(data))return null;
  const out={};
  for(const field of fields){
   if(data[field]===undefined||data[field]===null||data[field]==='')continue;
   const val=data[field];
   if(minmax[field]){const num=Number(val);if(!Number.isFinite(num)||num<minmax[field][0]||num>minmax[field][1])return null;out[field]=num}
   else if(!picks[field].includes(val))return null;
  }
  const source=data.modelo_corporal;
  if(source!==undefined&&source!==null){
   if(typeof source!=='object'||Array.isArray(source))return null;
   out.modelo_corporal={};
   for(const field of body){
    if(source[field]===undefined||source[field]===null||source[field]==='')continue;
    const num=Number(source[field]);if(!Number.isFinite(num)||num<minmax[field][0]||num>minmax[field][1])return null;
    out.modelo_corporal[field]=num;
   }
  }
  if(data.nota!==undefined){
   if(typeof data.nota!=='string'||data.nota.length>1500)return null;
   out.nota=data.nota;
  }
  if(data.fonte_usuario!==undefined){
   if(typeof data.fonte_usuario!=='string'||data.fonte_usuario.length>250)return null;
   out.fonte_usuario=data.fonte_usuario;
  }
  return out;
 }
 function combine(card,evidence,local){
  const confirmed=match(card,evidence)?evidence:null;
  const localSafe=validPatch(local);
  const merged={...confirmed,...(localSafe||{}),modelo_corporal:{...(confirmed?.modelo_corporal||{}),...(localSafe?.modelo_corporal||{})}};
  // A local overwrite is NOT third-party verification.
  const overridden=!!localSafe&&fields.concat(['modelo_corporal']).some(k=>localSafe[k]!==undefined);
  return {fields:merged,verified:!!confirmed,overridden,source:confirmed?.url||null,
   editionMatched:!!confirmed,playerIDVerified:false,
   morphologyComplete:Number.isFinite(merged.altura_cm)&&Number.isFinite(merged.peso_kg)&&!!merged.pe_dominante,
   bodyModelComplete:Number.isFinite(merged.modelo_corporal?.comprimento_perna)&&Number.isFinite(merged.modelo_corporal?.alcance_perna_cm),
   gameplayStatus:'não comprovado por medidas corporais'};
 }
 function validObservation(o){
  if(!o||typeof o!=='object'||Array.isArray(o))return null;
  const form=['posse','normal','rapido'];const dims=['giro','primeiro_toque','aceleracao','protecao','cobertura'];
  if(!form.includes(o.tatica)||typeof o.formacao!=='string'||!/^\d-\d-\d-\d|^\d-\d-\d$/.test(o.formacao)||o.formacao.length>24)return null;
  const result={tatica:o.tatica,formacao:o.formacao};
  for(const k of dims){if(!Number.isInteger(o[k])||o[k]<1||o[k]>5)return null;result[k]=o[k]}
  if(typeof o.nota!=='string'||o.nota.length>500)return null;
  result.nota=o.nota;return result;
 }
 function state(cards,evidence,overrides){
  const source=new Map((evidence||[]).map(e=>[String(e.numero),e]));
  const result={total:cards.length,verified:0,manual:0,pending:0,withGameplay:0};
  for(const c of cards){const v=combine(c,source.get(String(c.numero)),overrides?.[key(c)]);if(v.verified)result.verified++;if(v.overridden)result.manual++;if(!v.morphologyComplete)result.pending++}
  return result;
 }
 return {match,key,validPatch,combine,validObservation,state};
});
