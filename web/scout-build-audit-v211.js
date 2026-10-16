/* Scout PRO V211 — revisão documentada das progressões repetidas.
 * Read-only. Sem heurística "uma ficha única por ID"; mantém treino oficial intacto.
 */
(function(host){
'use strict';
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const pos=v=>({AC:'CA',ZC:'ZG',DC:'ZG',MC:'MLG',GR:'GO',MDF:'VOL'}[String(v||'').toUpperCase()]||String(v||'').toUpperCase());
const skills=v=>[...new Set(String(v||'').split(';').map(normalize).filter(Boolean))].sort();
function confirmedBooster(v){
 const b=normalize(v);
 if(!b||/pendente|nao confirmado|nenhum|slot selecionavel|nao informad|ausente/.test(b))return null;
 return b;
}
function signature(c){
 if(!c||!Array.isArray(c.niveis)||c.niveis.length!==10||!c.niveis.every(n=>Number.isInteger(n)&&n>=0&&n<=20))return null;
 return [pos(c.posicao),normalize(c.estilo_ataque),Number(c.pp),c.niveis.join(',')].join('|');
}
function compare(a,b){
 const A=skills(a?.habilidades_nativas),B=skills(b?.habilidades_nativas);
 const onlyA=A.filter(s=>!B.includes(s)),onlyB=B.filter(s=>!A.includes(s));
 const boostA=confirmedBooster(a?.impeto_fixo),boostB=confirmedBooster(b?.impeto_fixo);
 const distinctSkills=A.length>0&&B.length>0&&(onlyA.length>0||onlyB.length>0);
 const distinctBoost=!!boostA&&!!boostB&&boostA!==boostB;
 const missingEvidence=!A.length||!B.length||!boostA||!boostB;
 return {distinctSkills,distinctBoost,missingEvidence,onlyA,onlyB,
  boosterA:boostA,boosterB:boostB,needsReview:distinctSkills||distinctBoost,
  basis:'Habilidades nativas e ímpeto FIXO documentados; atributos-base numéricos da edição não comparados.'};
}
function audit(cards){
 if(!Array.isArray(cards))return {total:0,registered:0,pending:0,groups:[],duplicatedCards:0};
 const m=new Map();
 for(const c of cards){
  const sig=signature(c);if(!sig)continue;
  if(!m.has(sig))m.set(sig,[]);
  m.get(sig).push(c);
 }
 const groups=[];
 for(const [sig,list] of m){
  if(list.length<2)continue;
  const ordered=list.slice().sort((a,b)=>a.numero-b.numero);
  const comparisons=[];
  for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length;j++){
   const evidence=compare(ordered[i],ordered[j]);
   comparisons.push({a:ordered[i].numero,b:ordered[j].numero,
    distinctSkills:evidence.distinctSkills,distinctBoost:evidence.distinctBoost,
    missingEvidence:evidence.missingEvidence,needsReview:evidence.needsReview});
  }
  const divergent=comparisons.filter(x=>x.needsReview).length;
  const hasNumericAttributes=ordered.every(x=>x.base_stats_known===true);
  // Mesmo com flag, o índice NÃO contém valores base: nenhuma homologação automática.
  groups.push({
   signature:sig,position:pos(ordered[0].posicao),style:ordered[0].estilo_ataque,pp:ordered[0].pp,
   levels:ordered[0].niveis.slice(),size:ordered.length,
   ids:ordered.map(x=>x.numero),
   players:ordered.map(x=>({numero:x.numero,name:x.name,versao:x.versao,base_stats_known:x.base_stats_known})),
   divergentPairs:divergent,comparedPairs:comparisons.length,unconfirmedPairs:comparisons.filter(x=>x.missingEvidence).length,
   numericAttributesCompared:false,
   reviewStatus:divergent?'revisao_documental_prioritaria':'revisao_por_falta_de_evidencia',
   note:hasNumericAttributes?'Atributos-base marcados como conhecidos, mas o índice não fornece os números comparáveis.':'Atributos-base não documentados para todas as edições neste grupo.',
   comparisons
  });
 }
 groups.sort((a,b)=>b.divergentPairs-a.divergentPairs||b.size-a.size||a.ids[0]-b.ids[0]);
 return {total:cards.length,registered:cards.filter(c=>!!signature(c)).length,
  pending:cards.filter(c=>!signature(c)).length,groups,
  duplicatedCards:groups.reduce((n,g)=>n+g.size,0),
  priorityGroups:groups.filter(g=>g.reviewStatus==='revisao_documental_prioritaria').length,
  policy:'Não alterar PP, níveis ou habilidade de nenhuma carta sem atributos-base da edição e revisão individual.'};
}
function cardReview(report,number){
 if(!report||!Array.isArray(report.groups))return null;
 const g=report.groups.find(g=>g.ids.includes(Number(number)));
 return g||null;
}
function mount(doc,report,number){
 const body=doc?.body,target=doc?.getElementById('scout-v207-identity');
 if(!body||body.dataset.page!=='detail'||!target||doc.getElementById('scout-v211-audit'))return false;
 const block=doc.createElement('aside');block.id='scout-v211-audit';block.className='scout-v211-audit';
 block.setAttribute('aria-label','Situação da revisão de treinos semelhantes');
 const h=doc.createElement('strong');h.className='scout-v211-heading';h.textContent='AUDITORIA DE TREINOS · V211';
 const info=doc.createElement('p');info.className='scout-v211-description';
 const item=cardReview(report,number);
 if(item){
  block.setAttribute('data-review-status',item.reviewStatus);
  info.textContent='Esta distribuição está registrada em '+item.size+' cartas da mesma função/estilo/PP. '+
  (item.divergentPairs?'Há '+item.divergentPairs+' comparação(ões) com diferenças documentadas nas habilidades/ímpetos.':'Ainda não há diferenças individuais suficientes para recomendar outra distribuição.')+
  ' Exige atributos-base da edição exata antes de substituir a build.';
  const meta=doc.createElement('p');meta.className='scout-v211-meta';
  meta.textContent='Prioridade: '+(item.divergentPairs?'revisar individualmente':'completar evidências')+' · Sem troca automática de PP';
  block.append(h,info,meta);
 }else{
  block.setAttribute('data-review-status','sem_repeticao_mesmo_contexto');
  info.textContent='Não foi encontrada a mesma distribuição registrada entre outras cartas com PP, posição e estilo iguais. Isso não prova otimização superior.';
  block.append(h,info);
 }
 const peers=target.querySelector('.scout-v207-peers');
 if(peers)peers.insertAdjacentElement('beforebegin',block);else target.appendChild(block);
 return true;
}
const api=Object.freeze({normalize,pos,skills,confirmedBooster,signature,compare,audit,cardReview,mount});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function start(){
 const d=host.document;if(d.body?.dataset.page!=='detail')return;
 const source=d.getElementById('scout-v68-data');if(!source)return;
 let number;try{number=JSON.parse(source.textContent).capture}catch(e){return}
 fetch('../SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('auditoria indisponível');return r.json()}).then(data=>{
  const report=audit(data.cards);
  if(mount(d,report,number))return;
  const observer=new host.MutationObserver(()=>{if(mount(d,report,number))observer.disconnect()});
  observer.observe(d.body,{childList:true,subtree:true});
 }).catch(()=>{});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:null);
