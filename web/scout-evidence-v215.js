/* Scout PRO V215 — laudo individual, somente leitura.
 * Coincidencias canonicas EN/PT-BR sao alertas de cadastro, nao provas de jogo/equipamento.
 * As 246 fichas, Card IDs, PP, treinos e habilidades originais permanecem intactos.
 */
(function(host){
'use strict';
const normal=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const asSkills=value=>Array.isArray(value)?value.filter(Boolean):String(value||'').split(/[;\n]+/).map(v=>v.trim()).filter(Boolean);
function skillId(name,keyFor){
 const canonical=typeof keyFor==='function'?keyFor(name):'';
 return canonical||'raw:'+normal(name);
}
function reviewCard(source,record,keyFor,peers){
 if(!source||!record||Number(source.numero)!==Number(record.numero)||String(source.id)!==String(record.card_id))
  return {valid:false,reason:'Card ID ou número incompatível. Evidências não vinculadas.'};
 const native=asSkills(source.habilidades_nativas),additional=asSkills(source.adicionais_candidatas);
 const byKey=new Map();
 for(const value of native){const id=skillId(value,keyFor);if(!byKey.has(id))byKey.set(id,value)}
 const clashes=additional.filter(value=>byKey.has(skillId(value,keyFor))).map(value=>({
  additional:value,native:byKey.get(skillId(value,keyFor)),id:skillId(value,keyFor)
 }));
 const printMatches=Array.isArray(record.habilidades_adicionais_auditoria?.coincidencias_com_print)?
  record.habilidades_adicionais_auditoria.coincidencias_com_print.slice():[];
 const links=Array.isArray(record.repeticao?.peers)?record.repeticao.peers.map(num=>({
  numero:Number(num),nome:peers?.get(Number(num))||'Carta '+num
 })):[];
 return {
  valid:true,numero:Number(source.numero),name:String(source.name),cardId:String(source.id),
  pp:Number(source.pp),hasBuild:Array.isArray(source.niveis)&&source.niveis.length===10,
  nativeCount:native.length,candidateCount:additional.length,clashes,printMatches,
  print:record.print_candidato?.arquivo||null,biotype:record.biotipo||null,
  baseStatsFlag:source.base_stats_known===true,baseAttributesNumericallyCompared:false,
  boosterSlot:record.impeto_extra_auditoria?.estado||'unverified',
  peers:links,decision:'Somente revisão: não alterar habilidades, níveis ou ímpetos sem confirmar a edição.',
  approvedBuildPreserved:true
 };
}
function auditRoster(cards,records,keyFor){
 if(!Array.isArray(cards)||!Array.isArray(records))throw Error('Catálogo ou auditoria ausente');
 const source=new Map(cards.map(c=>[Number(c.numero),c]));
 const evidence=new Map(records.map(c=>[Number(c.numero),c]));
 const names=new Map(cards.map(c=>[Number(c.numero),c.name]));
 return [...source.values()].map(c=>reviewCard(c,evidence.get(Number(c.numero)),keyFor,names));
}
function element(doc,tag,cls,value){
 const node=doc.createElement(tag);if(cls)node.className=cls;
 if(value!==undefined)node.textContent=String(value);return node;
}
function line(doc,parent,strong,value){
 const row=element(doc,'p','scout-v215-line');
 row.append(element(doc,'strong','',strong+' '),doc.createTextNode(value));
 parent.append(row);
}
function display(doc,review){
 if(!doc?.body||doc.body.dataset.page!=='detail'||!review?.valid||
    doc.getElementById('scout-v215-evidence'))return false;
 const target=doc.getElementById('scout-v207-identity')||doc.querySelector('.profile-content');
 if(!target)return false;
 const panel=element(doc,'details','scout-v215-card');panel.id='scout-v215-evidence';
 panel.dataset.nativeOverlaps=String(review.clashes.length);
 panel.dataset.catalogCardIdMatch='true';
 panel.append(element(doc,'summary','','SCOUT PRO · Verificação individual V215'));
 const content=element(doc,'div','scout-v215-content');
 content.append(element(doc,'h3','',review.name+' · Carta #'+String(review.numero).padStart(3,'0')));
 line(doc,content,'Card ID:',review.cardId+' · '+review.pp+' PP registrados');
 line(doc,content,'Treino:',review.hasBuild?'Distribuição no catálogo preservada':'Distribuição não registrada; nenhuma build gerada automaticamente');
 line(doc,content,'Atributos:',review.baseAttributesNumericallyCompared?'Comparação numérica disponível':'Atributos-base finais NÃO comparados para aprovar novo treino');
 if(review.peers.length)line(doc,content,'Ficha repetida:',review.peers.map(p=>'#'+p.numero+' '+p.nome).join(' · ')+' — sem conclusão automática de inferioridade');
 else line(doc,content,'Ficha repetida:','Nenhuma repetição sinalizada entre função, PP e estilo iguais');
 content.append(element(doc,'h4','','Habilidades adicionais × nativas'));
 if(review.clashes.length){
  const warning=element(doc,'p','scout-v215-warning',review.clashes.length+' sugestão(ões) possivelmente já existentes entre as habilidades nativas cadastradas. Revisar antes de gastar tokens.');
  content.append(warning);
  const list=element(doc,'ul','scout-v215-overlaps');
  for(const hit of review.clashes)list.append(element(doc,'li','',hit.additional+' → '+hit.native+' (mesma habilidade, nomes PT-BR/EN)'));
  content.append(list);
 }else{
  content.append(element(doc,'p','scout-v215-clear','Nenhuma correspondência conhecida entre as '+review.candidateCount+' sugestão(ões) e '+review.nativeCount+' habilidades nativas registradas. Isso NÃO valida a edição ou os slots.'));
 }
 if(review.printMatches.length){
  content.append(element(doc,'p','scout-v215-muted','No print candidato, '+review.printMatches.join(', ')+' também requer(em) conferência. O print não mostra Card ID verificável.'));
 }
 if(review.print)line(doc,content,'Print:',review.print+' — nome correspondente, edição não autenticada');
 if(review.biotype)line(doc,content,'Biotipo:','medidas vinculadas por Card ID a fonte externa; não comprovam Player ID nem vantagem em campo');
 const states={
  selectable_unconfirmed:'Catálogo indica slot selecionável; falta conferir no jogo.',
  registered:'Ímpeto nominal registrado; não presumir slot livre.',
  unverified:'Disponibilidade do segundo ímpeto não documentada.'
 };
 line(doc,content,'Segundo ímpeto:',states[review.boosterSlot]||states.unverified);
 content.append(element(doc,'p','scout-v215-footer',review.decision));
 panel.append(content);
 if(target.id==='scout-v207-identity')target.insertAdjacentElement('afterend',panel);
 else target.append(panel);
 return true;
}
const api=Object.freeze({normal,asSkills,skillId,reviewCard,auditRoster,display});
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_EVIDENCE_V215=api;
if(!host?.document)return;
function start(){
 const doc=host.document;if(doc.body?.dataset.page!=='detail')return;
 const node=doc.getElementById('scout-v68-data');if(!node)return;
 let identity;try{identity=JSON.parse(node.textContent)}catch(e){return}
 const cap=Number(identity.capture);
 Promise.all(['../SCOUT_V69_AUDITORIA.json','../SCOUT_V213_AUDITORIA_INDIVIDUAL.json'].map(url=>
  fetch(url).then(resp=>{if(!resp.ok)throw Error('offline '+url);return resp.json()})))
 .then(([catalog,audit])=>{
  const source=catalog.cards.find(c=>Number(c.numero)===cap);
  const record=audit.cards.find(c=>Number(c.numero)===cap);
  const names=new Map(catalog.cards.map(c=>[Number(c.numero),c.name]));
  if(!source||!record||String(identity.id)!==String(source.id))return;
  let observer=null;
  const render=()=>{
   const mapper=host.SCOUT_RECOMMENDATIONS_V162?.keyFor;
   if(typeof mapper!=='function')return false;
   const review=reviewCard(source,record,mapper,names);
   const mounted=display(doc,review);
   if(mounted&&observer)observer.disconnect();
   return mounted;
  };
  if(render())return;
  doc.addEventListener('scoutpro:recommendations-ready',render,{once:true});
  if(host.MutationObserver&&doc.body){
   observer=new host.MutationObserver(()=>render());
   observer.observe(doc.body,{childList:true,subtree:true});
  }
 }).catch(()=>{});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})(typeof window!=='undefined'?window:null);
