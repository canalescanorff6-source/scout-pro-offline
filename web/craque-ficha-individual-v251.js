/* Craque Tático V251 — engenharia INDIVIDUAL, documental e conservadora.
 * Nenhuma build é homologada por OVR, custo PP fechado ou heurística.
 * Rentão/Blackjhon são referências de CRITÉRIOS, não fonte de uma build sem vídeo.
 * Mantém 246 cartas, hashes, treinos, boosters e habilidades de origem intactos.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_FICHA_INDIVIDUAL_V251=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const moduleGet=p=>{if(typeof module!=='object'||!module.exports)return null;try{return require(p)}catch(_){return null}};
const T=host?.SCOUT_TACTICS_V220||moduleGet('./scout-multitactic-engine-v220.js');
const I=host?.CRAQUE_INTERPRETATION_V233||moduleGet('./craque-role-intelligence-v233.js');
const STATES=Object.freeze({
 complete:'PP e treino cadastrados · sem validação competitiva',
 no_build:'PP confirmado · distribuição ainda pendente',
 no_level:'Treino cadastrado · nível máximo sem comprovação',
 unsupported:'Edição ou PP divergente · revisão obrigatória'
});
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const nativeNames=s=>String(s??'').split(';').map(x=>norm(x)).filter(Boolean);
const exact=(source,raw)=>Boolean(source&&raw&&Number(source.numero)===Number(raw.capture)&&
 String(source.id)===String(raw.id)&&norm(source.name)===norm(raw.name)&&
 norm(source.versao)===norm(raw.edition));
const roleOf=c=>T?.roleOf?.({shown_position:c?.posicao||c?.shown_position})||null;
const confirmedLevel=c=>Number.isInteger(c?.max_level)&&c.max_level>=1&&
 typeof c.pp_origem==='string'&&c.pp_origem.startsWith('informado_pelo_usuario_')&&
 Number(c.pp)===2*(c.max_level-1)&&c.pp_estimado!==true;
const hasValidBuild=c=>T?.valid(c?.niveis)===true&&T.total(c.niveis)===Number(c.pp);
// Para confrontar a V211, não agrupar PTE e PTD artificialmente.
const comparisonPosition=c=>{
 const position=String(c?.posicao||'').toUpperCase();
 return ({AC:'CA',ZC:'ZG',DC:'ZG',MC:'MLG',GR:'GO',MDF:'VOL'})[position]||position;
};
const signature=c=>hasValidBuild(c)?[
  comparisonPosition(c),norm(c.estilo_ataque),Number(c.pp),c.niveis.join(',')
].join('|'):null;
function related(card,cards){
 const sig=signature(card);
 if(!sig||!Array.isArray(cards))return [];
 return cards.filter(c=>Number(c.numero)!==Number(card.numero)&&signature(c)===sig)
   .map(c=>({
    numero:c.numero,name:c.name,id:String(c.id),
    differentSkills:nativeNames(c.habilidades_nativas).join('|')!==nativeNames(card.habilidades_nativas).join('|'),
    differentBooster:norm(c.impeto_fixo)!==norm(card.impeto_fixo),
    details:'Mesmo PP, posição, estilo e níveis; não significa mesma performance.'
   }));
}
function sourceFor(card,raw){
 if(!exact(card,raw)||Number(card.pp)!==Number(raw.pp))return null;
 // Catálogo confirmado por CAP + Card ID + edição. Não copiar para outras cartas.
 return {
  capture:Number(card.numero),id:String(card.id),name:card.name,edition:card.versao,
  shown_position:card.posicao,role_used:raw.role_used,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,
  native_skills:card.habilidades_nativas,
  pp:Number(card.pp),pp_estimated:card.pp_estimado===true,
  recommended_levels:hasValidBuild(card)?card.niveis.slice():null,
  base_stats_known:card.base_stats_known===true,
  training_provisional:card.treino_proposto_nao_validado===true,
  max_level:card.max_level,pp_origem:card.pp_origem,
  confirmacao_no_jogo:card.habilidades_nativas_origem?.confirmacao_no_jogo===true,
  habilidades_nativas_origem:card.habilidades_nativas_origem||null
 };
}
const recognizedStyles=new Set(['posse','normal','rapido','fora','longo']);
/* Otimização limitada de INVESTIMENTO em categorias: mochila inteira,
 * custo progressivo e função convexamente penalizada. Não simula status final.
 * Não introduz diferenças por nome, número da carta ou Card ID.
 */
function allocate(weights,role,pp,baseline){
 if(!T||!Number.isInteger(pp)||pp<0||pp>300||!Array.isArray(weights)||weights.length!==10)return null;
 const allowed=role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
 let dp=Array(pp+1).fill(null);dp[0]={utility:0,levels:Array(10).fill(0)};
 for(const i of allowed){
  const next=Array(pp+1).fill(null);
  const w=Math.max(0,Number(weights[i])||0);
  for(let spent=0;spent<=pp;spent++){
   const before=dp[spent];if(!before)continue;
   for(let n=0;n<=20;n++){
    const price=T.ppCost(n),newCost=spent+price;
    if(newCost>pp)break;
    const preserve=Array.isArray(baseline)&&T.valid(baseline)?
      Math.abs(n-baseline[i])*0.15:0;
    const utility=before.utility+w*(n-0.047*n*n)-preserve;
    const existing=next[newCost];
    if(!existing||utility>existing.utility+1e-9){
     const levels=before.levels.slice();levels[i]=n;
     next[newCost]={utility,levels};
    }
   }
  }
  dp=next;
 }
 return dp[pp]&&T.total(dp[pp].levels)===pp?dp[pp].levels:null;
}
function buildReview(card,raw,lab,all,style){
 if(!recognizedStyles.has(style))throw Error('Estilo de técnico inválido');
 if(!T||!I)return {status:'unsupported',reason:'Motor de revisão indisponível.',proposal:null};
 const aligned=sourceFor(card,raw),rawIdentity=exact(card,raw);
 if(!aligned)return {
  status:'unsupported',canDraft:false,proposal:null,
  reason:rawIdentity?'PP da ficha e do catálogo divergem. Não calcular a ficha até reconciliar ambos.':
   'CAP, Card ID, nome ou edição não coincidem. Proposta bloqueada.',
  sourceCompatible:false,related:[],differences:[]
 };
 const levelKnown=confirmedLevel(card),buildKnown=hasValidBuild(card);
 const status=levelKnown?(buildKnown?'complete':'no_build'):'no_level';
 const nativeMismatch=norm(card.habilidades_nativas)!==norm(raw.native_skills);
 const boostMismatch=norm(card.impeto_fixo)!==norm(raw.boost1);
 const context=I.interpret(aligned,style,lab)||null;
 const shared=related(card,all);
 const differences=[];
 if(nativeMismatch)differences.push('As habilidades nativas do catálogo são diferentes das da ficha antiga; análise usa a edição identificada no catálogo.');
 if(boostMismatch)differences.push('Ímpeto fixo da ficha antiga diverge do catálogo; confirmar antes de equipar qualquer ímpeto.');
 if(!card.habilidades_nativas||card.habilidades_nativas_origem?.confirmacao_no_jogo===false)
  differences.push('Habilidades nativas ainda não confirmadas dentro do jogo; consultar a edição exata.');
 if(!card.base_stats_known||!Object.keys(lab?.stats||{}).length)
  differences.push('Atributos-base numéricos finais indisponíveis; não otimizar por limite de atributo/Overall.');
 if(!levelKnown)
  differences.push('Nível máximo desta edição não comprovado; não recalcular o treino apenas com PP do catálogo.');
 if(!buildKnown)
  differences.push('Sem distribuição de treino documentada; proposta matemática não equivale a ficha aprovada.');
 if(shared.length)differences.push('Distribuição repetida em '+shared.length+' outra(s) carta(s); comparar habilidades, corpo e gameplay, sem forçar diferenciação.');
 const canDraft=levelKnown&&context&&Number.isInteger(aligned.pp);
 let proposal=null,changed=null;
 if(canDraft){
  const levels=allocate(context.weights,context.role,aligned.pp,buildKnown?card.niveis:null);
  if(levels&&T.total(levels)===aligned.pp){
   const diffs=buildKnown?levels.map((n,i)=>({
    name:T.CATEGORIES[i],before:card.niveis[i],after:n,delta:n-card.niveis[i]
   })).filter(x=>x.delta):[];
   proposal={
    levels,spent:aligned.pp,style,role:context.role,
    source:'hipotese_matematica_v251_sem_status_finais',
    note:'Distribuição consultiva por função, estilo e habilidades documentais. NÃO validada por Rentão, Blackjhon ou partidas.',
    differsFromRegistered:buildKnown?diffs.length>0:null
   };
   changed=diffs;
  }
 }
 return {
  status,description:STATES[status],canDraft:!!proposal,proposal,
  changes:changed,sourceCompatible:true,related:shared,differences,
  capture:aligned.capture,card_id:aligned.id,style,role:context?.role||roleOf(card),
  pp:aligned.pp,level:levelKnown?card.max_level:null,
  original:buildKnown?card.niveis.slice():null,
  tacticLabel:T.styleFor(style)?.label,context,
  nativeSkills:String(card.habilidades_nativas||'').split(';').map(s=>s.trim()).filter(Boolean),
  boosterFixed:card.impeto_fixo,boosterExtra:card.impeto_extra,
  originNative:card.habilidades_nativas_origem||null,
  evidenceLevel:levelKnown?'documental_usuario':'pendente',
  trainingProof:'sem_teste_independente_de_partida',
  method:'Revisão de investimento de PP, não engenharia comprovada de atributos finais.'
 };
}
function catalogAudit(cards){
 if(!Array.isArray(cards)||cards.length!==246)throw Error('O acervo precisa manter 246 cartas.');
 const seen=new Set(),counts={
  total:246,withLevelAndBuild:0,withLevelNoBuild:0,withBuildNoLevel:0,
  withoutLevelAndBuild:0,duplicateGroups:0,duplicatedCards:0,
  nativeDocumented:0,baseFlag:0,confirmedBuildsByGameplay:0
 };
 const groups=new Map();
 for(const card of cards){
  const number=Number(card.numero);
  if(!Number.isInteger(number)||seen.has(number))throw Error('CAP inválido ou duplicado: '+card.numero);
  seen.add(number);
  const lvl=confirmedLevel(card),has=hasValidBuild(card);
  if(lvl&&has)counts.withLevelAndBuild++;
  else if(lvl)counts.withLevelNoBuild++;
  else if(has)counts.withBuildNoLevel++;
  else counts.withoutLevelAndBuild++;
  if(card.habilidades_nativas)counts.nativeDocumented++;
  if(card.base_stats_known===true)counts.baseFlag++;
  const sig=signature(card);
  if(sig){if(!groups.has(sig))groups.set(sig,[]);groups.get(sig).push(number)}
 }
 const duplicates=[...groups.values()].filter(v=>v.length>1);
 counts.duplicateGroups=duplicates.length;
 counts.duplicatedCards=duplicates.reduce((n,v)=>n+v.length,0);
 counts.proposalsAreVerified=false;
 return counts;
}
const api=Object.freeze({STATES,norm,roleOf,confirmedLevel,hasValidBuild,signature,
  exact,sourceFor,related,allocate,buildReview,catalogAudit});
if(!host?.document)return api;
const doc=host.document;
const mk=(tag,cls,value)=>{
 const e=doc.createElement(tag);if(cls)e.className=cls;
 if(value!==undefined)e.textContent=String(value);
 return e;
};
let card=null,raw=null,lab=null,all=null,active='posse',block=null;
function display(){
 if(!card||!raw||!block)return;
 const check=buildReview(card,raw,lab,all,active);
 block.replaceChildren();
 block.dataset.review=check.status;
 const heading=mk('div','ct251-heading');
 heading.append(mk('strong','ct251-title','Engenharia individual · '+(check.tacticLabel||'Posse de Bola')),
  mk('span','ct251-status',check.description||'Evidências a revisar'));
 block.append(heading);
 if(check.status==='unsupported'){
  block.append(mk('p','ct251-warning',check.reason));
  return;
 }
 const info=mk('p','ct251-intro',
  '#'+String(card.numero).padStart(3,'0')+' · '+card.versao+' · '+
  (check.level?'Nível '+check.level+' confirmado documentalmente':'Nível máximo não comprovado')+
  ' · '+card.pp+' PP do catálogo. Função: '+check.role+'.');
 block.append(info);
 const chips=mk('div','ct251-evidence');
 chips.append(mk('span','','Sem Overall como critério'),
  mk('span','',check.nativeSkills.length+' habilidades nativas no catálogo'),
  mk('span','',check.related.length+' fichas semelhantes'),
  mk('span','',check.evidenceLevel==='documental_usuario'?'PP/nivel documentado':'PP sem nível comprovado'));
 block.append(chips);
 if(check.related.length){
  const similar=mk('p','ct251-duplicates',
   'Revisão obrigatória de treinos repetidos: '+
    check.related.slice(0,5).map(x=>'#'+x.numero+' '+x.name+
     (x.differentSkills?' (nativas diferentes)':'')+
     (x.differentBooster?' (ímpeto diferente)':'')).join(' · ')+
    '. Repetição não é prova de erro nem de acerto.');
  block.append(similar);
 }
 const detail=mk('details','ct251-evidence-details');
 detail.append(mk('summary','','O que esta carta confirma e o que ainda falta'));
 const ul=mk('ul','');
 for(const line of check.differences){
  ul.append(mk('li','',line));
 }
 detail.append(ul);block.append(detail);
 const comp=mk('section','ct251-preview');
 comp.append(mk('h4','','Treino individual por '+(check.tacticLabel||active)));
 if(!check.proposal){
  comp.append(mk('p','ct251-warning',
   check.status==='no_level'?
   'Esta edição tem treino registrado, mas o nível máximo não está comprovado. Não vou gerar outra build até validar os PP no eFootball.':
   'Edição sem dados suficientes para gerar uma distribuição segura.'));
 }else{
  const grid=mk('div','ct251-grid');
  const weights=check.context?.priorities||[];
  for(let i=0;i<10;i++){
   const v=check.proposal.levels[i];
   if((check.role==='GO'?i<7:i>=7))continue;
   const item=mk('div','ct251-point');
   item.append(mk('span','',T.CATEGORIES[i]),
    mk('strong','',v+' níveis'),
    mk('small','',T.ppCost(v)+' PP'));
   if(weights.some(w=>w.index===i&&weights.indexOf(w)<3))item.classList.add('ct251-priority');
   grid.append(item);
  }
  comp.append(grid);
  comp.append(mk('p','ct251-pp',check.proposal.spent+' / '+check.pp+
   ' PP · Hipótese exata de custo, NÃO validada em partidas.'));
  if(check.changes?.length)
   comp.append(mk('p','ct251-changes',
    'Diferenças em relação ao treino registrado: '+check.changes.map(d=>d.name+
     ' '+(d.delta>0?'+':'')+d.delta).join(' · ')+'.'));
  const apply=mk('button','ct251-use','Usar apenas como rascunho nesta tática');
  apply.type='button';
  apply.addEventListener('click',()=>{
   if(!host.confirm?.('Carregar esta distribuição TEÓRICA como rascunho local de '+
     (check.tacticLabel||active)+'? Não altera a carta no eFootball.'))return;
   host.dispatchEvent(new host.CustomEvent('scoutpro:v251:apply-proposal',{detail:{
    cap:Number(card.numero),card_id:String(card.id),tactic:active,
    levels:check.proposal.levels.slice(),source:'Hipótese individual V251'
   }}));
  });
  comp.append(apply);
 }
 block.append(comp);
 const principles=mk('p','ct251-caution',
 'A decisão competitiva exige atributos-base exatos, vídeo da mesma edição, '+
 'biotipo/Player ID comprovados e testes comparáveis em partidas. '+ 
 'Habilidades adicionais e ímpetos são consultivos; slots/equipados não são presumidos.');
 block.append(principles);
}
async function begin(){
 if(doc.body?.dataset.page!=='detail')return;
 const rawScript=doc.getElementById('scout-v68-data'),labScript=doc.getElementById('lab-data');
 if(!rawScript||!labScript)return;
 try{raw=JSON.parse(rawScript.textContent);lab=JSON.parse(labScript.textContent)}catch(_){return}
 if(!Number.isInteger(Number(raw.capture)))return;
 try{
  const response=await host.fetch('../SCOUT_V69_AUDITORIA.json');
  if(!response.ok)throw Error('Catálogo indisponível.');
  all=(await response.json()).cards;
  if(!Array.isArray(all)||all.length!==246)return;
 }catch(_){return}
 card=all.find(c=>Number(c.numero)===Number(raw.capture));
 const root=doc.getElementById('scout-v220-hero');
 if(!root||!card)return;
 const training=root.querySelector('#scout-v220-training');
 if(!training)return;
 block=mk('section','ct251-shell');block.id='ct251-individual-ficha';
 block.setAttribute('aria-label','Auditoria e proposta individual por edição da carta');
 training.insertAdjacentElement('afterend',block);
 const initial=root.querySelector('.scout-v220-tab[aria-pressed="true"]');
 active=initial?.dataset.tactic||'posse';
 // Corrigir o catálogo informativo da interface APENAS para a edição exata.
 const canonical=sourceFor(card,raw);
 if(canonical){
  host.dispatchEvent(new host.CustomEvent('scoutpro:v251:canonical-data',{
   detail:canonical
  }));
 }
 display();
 doc.addEventListener('scoutpro:tactic-selected-v220',event=>{
  if(event.detail&&recognizedStyles.has(event.detail.tactic)){
   active=event.detail.tactic;display();
  }
 });
 host.addEventListener('scoutpro:v251:review-updated',display);
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',()=>{
 const observer=new host.MutationObserver(()=>{
  if(doc.getElementById('scout-v220-training')){observer.disconnect();begin()}
 });
 observer.observe(doc.body,{childList:true,subtree:true});
 if(doc.getElementById('scout-v220-training')){observer.disconnect();begin()}
},{once:true});
else if(doc.getElementById('scout-v220-training'))begin();
else if(host.MutationObserver){
 const obs=new host.MutationObserver(()=>{
  if(doc.getElementById('scout-v220-training')){obs.disconnect();begin()}
 });
 obs.observe(doc.body,{childList:true,subtree:true});
}
return api;
});
