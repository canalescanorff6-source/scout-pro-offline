/* Scout PRO V207 — auditoria transparente de treinos repetidos por carta.
 * Nunca sobrescreve níveis, PP ou treino pessoal no dispositivo. */
(function(host){
'use strict';
const GROUPS=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const aliases=Object.freeze({AC:'CA',DC:'ZG',ZC:'ZG',MC:'MLG',MDF:'VOL',GR:'GO',DD:'LD',DE:'LE',MO:'MAT'});
const role=v=>aliases[String(v||'').toUpperCase()]||String(v||'').toUpperCase();
const sameLevels=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===10&&b.length===10&&a.every((n,i)=>n===b[i]);
function inspect(cards,card){
 if(!Array.isArray(cards)||!card)return {peers:[],exactSameEdition:[],signature:false};
 const vec=card.recommended_levels||card.niveis;
 if(!Array.isArray(vec)||vec.length!==10)return {peers:[],exactSameEdition:[],signature:false};
 const number=Number(card.capture??card.numero),pp=Number(card.pp);
 const position=role(card.role_used||card.shown_position||card.posicao);
 const style=normalize(card.attack_style||card.estilo_ataque);
 const peers=cards.filter(c=>
  Number(c.numero)!==number&&Number(c.pp)===pp&&
  role(c.posicao)===position&&normalize(c.estilo_ataque)===style&&sameLevels(vec,c.niveis)
 );
 const exactSameEdition=peers.filter(c=>normalize(c.name)===normalize(card.name)&&normalize(c.versao)===normalize(card.edition));
 return {peers,exactSameEdition,signature:true};
}
function contrast(card,peer){
 const a=normalize(card.boost1||card.impeto_fixo),b=normalize(peer.impeto_fixo);
 const sa=String(card.native_skills||card.habilidades_nativas||'').split(';').map(x=>normalize(x)).filter(Boolean);
 const sb=String(peer.habilidades_nativas||'').split(';').map(x=>normalize(x)).filter(Boolean);
 const absent=sa.filter(x=>!sb.includes(x));
 const present=sb.filter(x=>!sa.includes(x));
 return {boostDifferent:!!a&&!!b&&a!==b,
  uniqueSkills:absent.length,
  peerUniqueSkills:present.length,
  hasSkillEvidence:sa.length>0&&sb.length>0,
  identicalEvidence:!!a&&a===b&&sa.length===sb.length&&absent.length===0};
}
function summarizeLevels(current,trial){
 if(!Array.isArray(trial))return [];
 return GROUPS.map((name,i)=>({name,registered:current?.[i]??null,
  alternative:trial[i],difference:current?.[i]===undefined?null:trial[i]-current[i]}))
  .filter(x=>x.alternative>0||x.registered>0);
}
function block(doc,tag,cls,value){
 const el=doc.createElement(tag);
 if(cls)el.className=cls;
 if(value!==undefined)el.textContent=value;
 return el;
}
function render(doc){
 if(!doc?.body||doc.body.dataset.page!=='detail'||doc.getElementById('scout-v207-identity'))return false;
 const root=doc.getElementById('scout-v188-principal'),target=root?.querySelector('.scout-v188-progress');
 const script=doc.getElementById('scout-v68-data'),engine=host.SCOUT_TRAINING_V207;
 if(!target||!script||!engine)return false;
 let data;try{data=JSON.parse(script.textContent)}catch(e){return false}
 const model=doc.getElementById('lab-data');
 let lab={};try{lab=JSON.parse(model?.textContent||'{}')}catch(e){}
 const section=block(doc,'section','scout-v207-identity');section.id='scout-v207-identity';
 section.setAttribute('aria-label','Auditoria individual da ficha');
 const eyebrow=block(doc,'div','scout-v207-eyebrow','SCOUT PRO · COMPARAÇÃO INDIVIDUAL');
 const heading=block(doc,'h3','','O que diferencia esta carta?');
 const summary=block(doc,'p','scout-v207-copy','Analisamos habilidades nativas e o ímpeto fixo documentado, sem inventar atributos ocultos.');
 const status=block(doc,'div','scout-v207-status');
 status.id='scout-v207-status';
 const boost=block(doc,'p','scout-v207-evidence','Ímpeto fixo registrado: '+String(data.boost1||'pendente')+'.');
 const skills=block(doc,'p','scout-v207-evidence','Habilidades nativas: '+(data.native_skills?String(data.native_skills).split(';').filter(Boolean).length+' listadas na ficha.':'não confirmadas nesta edição.'));
 section.append(eyebrow,heading,summary,status,boost,skills);
 const preview=block(doc,'details','scout-v207-preview');
 const toggle=block(doc,'summary','','Comparar treino registrado × alternativa individual');
 const desc=block(doc,'p','scout-v207-caution','Simulação baseada em habilidades e ímpeto, NÃO treino comprovado por gameplay. Nada é salvo automaticamente.');
 preview.append(toggle,desc);
 let alternative=null;
 if(Number.isInteger(Number(data.pp))&&Number(data.pp)>=0&&Number(data.pp)<=238){
  try{
   alternative=engine.suggestIndividualPreview(Number(data.pp),data.role_used||data.shown_position,data.attack_style,{
    native_skills:data.has_native_skills?data.native_skills:null,boost1:data.boost1
   });
  }catch(e){}
 }
 const current=Array.isArray(data.recommended_levels)?data.recommended_levels:
  Array.isArray(lab.draftA)?lab.draftA:null;
 if(alternative){
  const box=block(doc,'div','scout-v207-grid');
  const origin=block(doc,'div','scout-v207-field');
  origin.append(block(doc,'small','','BASE DA COMPARAÇÃO'),block(doc,'strong','',
   Array.isArray(data.recommended_levels)?'Treino registrado':Array.isArray(lab.draftA)?'Prévia experimental anterior':'Sem treino documentado'));
  const distinct=block(doc,'div','scout-v207-field');
  distinct.append(block(doc,'small','','EVIDÊNCIAS DISPONÍVEIS'),block(doc,'strong','',
   alternative.signals.length?alternative.signals.slice(0,4).join(' · '):'Insuficientes para diferenciar'));
  box.append(origin,distinct);
  const view=block(doc,'div','scout-v207-levels');
  for(const row of summarizeLevels(current,alternative.vec)){
   const entry=block(doc,'div','scout-v207-level');
   entry.append(block(doc,'span','',row.name),
    block(doc,'b','',row.registered===null?'—':String(row.registered)),
    block(doc,'span','scout-v207-arrow','→'),
    block(doc,'b','scout-v207-trial',String(row.alternative)));
   if(row.difference!==null&&row.difference!==0){
    entry.classList.add('scout-v207-different');
    entry.title='Diferença calculada: '+(row.difference>0?'+':'')+row.difference+' nível(is)';
   }
   view.appendChild(entry);
  }
  const deltas=current?.length===10?summarizeLevels(current,alternative.vec).filter(x=>x.difference!==0).length:0;
  const notice=block(doc,'p','scout-v207-note',
   alternative.signals.length===0?'Sem evidência individual suficiente: a alternativa ainda é genérica.':
   !current?'Esta carta não possui distribuição final homologada: apenas uma hipótese individual de PP.':
   deltas?'A simulação difere em '+deltas+' grupo(s), mantendo '+data.pp+' PP como orçamento. Conferir atributos-base antes de trocar.':
   'As evidências disponíveis ainda não justificam mudança de níveis; mantivemos a comparação igual em vez de inventar diferenças.');
  const guide=block(doc,'a','scout-v207-lablink','Abrir Laboratório para testar manualmente');
  guide.href='#performance';
  guide.addEventListener('click',()=>{
   const more=doc.querySelector('#scout-v188-principal .scout-v188-more');
   if(more?.getAttribute('aria-expanded')==='false')more.click();
  });
  preview.append(box,view,notice,guide);
 }else preview.appendChild(block(doc,'p','scout-v207-note','Orçamento PP indisponível nesta carta: simulação suspensa.'));
 section.appendChild(preview);
 const peers=block(doc,'details','scout-v207-peers');
 const peersToggle=block(doc,'summary','','Conferir duplicação da distribuição cadastrada');
 const peersContent=block(doc,'div','scout-v207-peer-content');
 peers.append(peersToggle,peersContent);section.appendChild(peers);
 target.insertAdjacentElement('afterend',section);
 const mark=()=>{
  const match=engine?.previewValid?.(data.recommended_levels)?'registrado':'provisório';
  status.textContent='Treino '+match+' · '+Number(data.pp)+' PP · edição '+String(data.edition||'não confirmada');
 };
 mark();
 // A auditoria fonte já está no service worker offline; arquivos de ficha são imutáveis.
 fetch('../SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('offline');return r.json()}).then(audit=>{
  const result=inspect(audit.cards,data);
  if(!result.signature){
   peersToggle.textContent='Sem build registrada para comparar no catálogo';
   peersContent.textContent='Esta carta requer confirmação dos atributos da edição exata antes de ser considerada validada.';
   return;
  }
  peersToggle.textContent=result.peers.length?'Distribuição igual à de '+result.peers.length+' outra(s) carta(s)':'Sem duplicação no mesmo papel e estilo';
  if(!result.peers.length){
   peersContent.textContent='Não encontramos a mesma sequência de níveis entre cartas com PP, posição e estilo correspondentes.';
   return;
  }
  const intro=block(doc,'p','','Compartilhar os mesmos níveis não comprova rendimento equivalente. Verifique as diferenças registradas antes de alterar a distribuição.');
  peersContent.appendChild(intro);
  if(result.exactSameEdition.length){
   peersContent.appendChild(block(doc,'p','scout-v207-alert','O cadastro contém outra entrada da mesma edição e jogador: conferir duplicidade de registro sem apagar a carta.'));
  }
  for(const other of result.peers.slice(0,6)){
   const contrastData=contrast(data,other);
   const line=block(doc,'div','scout-v207-peer');
   const link=block(doc,'a','',other.name+' · #'+String(other.numero).padStart(3,'0'));
   const file=String(other.arquivo||'');
   if(file.startsWith('fichas/')&&file.endsWith('.html'))link.href='../'+file;
   const detail=block(doc,'small','',[
    contrastData.boostDifferent?'ímpeto fixo diferente':null,
    contrastData.hasSkillEvidence?(contrastData.uniqueSkills+' habilidades exclusivas nesta / '+contrastData.peerUniqueSkills+' na outra'):'habilidades incompletas',
    contrastData.identicalEvidence?'sem diferença nativa documentada':null
   ].filter(Boolean).join(' · '));
   line.append(link,detail);peersContent.appendChild(line);
  }
  if(result.peers.length>6){
   peersContent.appendChild(block(doc,'p','scout-v207-evidence','Mais '+(result.peers.length-6)+' cartas compartilham esta progressão.'));
  }
 }).catch(()=>{
  peersToggle.textContent='Auditoria comparativa indisponível offline';
  peersContent.textContent='A ficha e o seu treino permanecem preservados; o índice local de 246 cartas não foi carregado.';
 });
 return true;
}
if(typeof module==='object'&&module.exports)module.exports=Object.freeze({inspect,contrast,summarizeLevels,role,normalize});
if(!host?.document)return;
function start(){
 if(render(host.document))return;
 const observer=new host.MutationObserver(()=>{if(render(host.document))observer.disconnect()});
 observer.observe(host.document.body,{childList:true,subtree:true});
 host.document.addEventListener('scoutpro:individual-engine-ready',()=>{if(render(host.document))observer.disconnect()},{once:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:null);
