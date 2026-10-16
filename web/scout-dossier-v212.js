/* Scout PRO V212: dossiê de posse por edição repetida.
 * Hipóteses de PP são geradas no motor V207 e SEMPRE comparadas com o treino registrado.
 * Nenhuma escrita, jogo simulado, prova de atributo-base ou substituição automática.
 */
(function(host){
'use strict';
const CATEGORY=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
const POS={AC:'CA',ZC:'ZG',DC:'ZG',MC:'MLG',MDF:'VOL',GR:'GO',DD:'LD',DE:'LE',MO:'MAT'};
const RANK={VOL:0,MLG:1,MAT:2,SA:3,CA:4,ZG:5,LD:6,LE:6,GO:7,MLD:9,MLE:9,PTD:10,PTE:10};
function position(p){const v=String(p||'').toUpperCase();return POS[v]||v}
function roleNote(pos){
 const p=position(pos);
 const notes={
  VOL:'Primeiro passe, cobertura pelo centro e apoio à saída curta.',
  MLG:'Triangulações centrais, passe de primeira e ida e volta sem abandonar a cobertura.',
  MAT:'Entrelinhas, domínio orientado e associação curta com os dois atacantes.',
  CA:'Finalização e apoio ao jogo central, sem depender de cruzamentos.',
  SA:'Tabela curta e mobilidade próxima ao CA.',
  ZG:'Antecipação, cobertura e saída curta por dentro.',
  LD:'Conexão curta com o meio e recuperação defensiva; cruzamento não é prioridade.',
  LE:'Conexão curta com o meio e recuperação defensiva; cruzamento não é prioridade.',
  GO:'Posicionamento, defesas e reposição segura no início da posse.',
  PTD:'Posição lateral não é prioritária na 4-3-1-2 estreita; não presumir adaptação central.',
  PTE:'Posição lateral não é prioritária na 4-3-1-2 estreita; não presumir adaptação central.',
  MLD:'Função aberta exige revisão antes de uso por dentro na 4-3-1-2.',
  MLE:'Função aberta exige revisão antes de uso por dentro na 4-3-1-2.'
 };
 return notes[p]||'Revisar função tática específica para Posse de Bola.';
}
function rosterRole(number,formation){
 const id=Number(number);
 if(formation?.starter_slots?.some(x=>Number(x.cap)===id))return 'Titular em proposta 4-3-1-2 V176 — não homologada';
 if(formation?.bench?.some(x=>Number(x.cap)===id))return 'Reserva em proposta 4-3-1-2 V176 — não homologada';
 if(formation?.alternatives?.some(x=>Number(x.cap)===id))return 'Alternativa em proposta V176 — não homologada';
 return 'Sem escalação confirmada na proposta V176';
}
function ppCost(vec){
 if(!Array.isArray(vec)||vec.length!==10||!vec.every(n=>Number.isInteger(n)&&n>=0&&n<=20))return null;
 let pp=0;for(const n of vec)for(let i=0;i<n;i++)pp+=1+Math.floor(i/4);
 return pp;
}
function individualCase(card,group,engine,formation){
 if(!card||!group||!group.ids.includes(Number(card.numero)))return null;
 const current=card.niveis;
 const normalizedRole=position(card.posicao),budget=Number(card.pp);
 if(!Array.isArray(current)||ppCost(current)!==budget)
  return {numero:card.numero,stage:'treino_nao_verificado',reason:'Vetor cadastrado sem PP fechando a conta; não gerar alternativa.',pp:budget};
 const native=String(card.habilidades_nativas||'');
 const confirmedBooster=(host?.SCOUT_BUILD_AUDIT_V211?.confirmedBooster ||
   (typeof require==='function'?require('./scout-build-audit-v211.js').confirmedBooster:null));
 const fixed=typeof confirmedBooster==='function'?confirmedBooster(card.impeto_fixo):null;
 const evidence={native_skills:native,boost1:fixed||null};
 let proposal=null;
 try{proposal=engine?.suggestIndividualPreview?.(budget,normalizedRole,card.estilo_ataque,evidence)}catch(e){}
 const valid=proposal&&Array.isArray(proposal.vec)&&ppCost(proposal.vec)===budget&&Number(proposal.remaining)===0;
 const signals=valid?proposal.signals.slice():[];
 const changes=valid?CATEGORY.map((name,i)=>({name,index:i,before:current[i],after:proposal.vec[i],
  delta:proposal.vec[i]-current[i]})).filter(x=>x.delta!==0):[];
 // Dados base numéricos não existem no índice dessas 56 edições; conservar a build.
 const stage=!valid?'sem_proposta_pp_valida':!signals.length?'sem_sinal_documental_para_personalizar':
  changes.length?'hipotese_individual_para_testar':'treino_registrado_coincide_com_hipotese';
 return {
  numero:card.numero,name:card.name,edition:card.versao,card_id:String(card.id),
  position:normalizedRole,style:card.estilo_ataque,pp:budget,registered:current.slice(),
  alternative:valid?proposal.vec.slice():null,alternativePP:valid?ppCost(proposal.vec):null,
  changes,signals,nativeSkillsCount:native.split(';').filter(s=>s.trim()).length,
  fixedBoosterConfirmed:!!fixed,knownBaseStats:card.base_stats_known===true,
  numericBaseCompared:false,editionsExactGameVerified:false,approval:'NÃO HOMOLOGADO',
  stage,groupSize:group.size,rolePriority:Object.prototype.hasOwnProperty.call(RANK,normalizedRole)?RANK[normalizedRole]:8,
  roleFocus:roleNote(normalizedRole),formationUse:rosterRole(card.numero,formation),
  cardPage:card.arquivo,
  explanation:signals.length?'Sugestão com base em habilidades nativas e ímpeto fixo confirmado quando existente; sem comparação numérica de atributos finais.':
   'Não foi identificado sinal individual suficiente no motor experimental para propor diferença comprovável.',
  nextEvidence:'Conferir atributos-base na edição exata, custo PP, status finais e validar o desempenho na função. Não trocar a build apenas por ser repetida.'
 };
}
function reviewCases(cards,groups,engine,formation){
 if(!Array.isArray(cards)||!Array.isArray(groups))return [];
 const byId=new Map(cards.map(c=>[Number(c.numero),c]));
 const out=[];
 for(const group of groups)for(const id of group.ids){
  const c=byId.get(Number(id));if(!c)continue;
  const entry=individualCase(c,group,engine,formation);
  if(entry)out.push(entry);
 }
 return out.sort((a,b)=>a.rolePriority-b.rolePriority||a.numero-b.numero);
}
function display(doc,item){
 if(!doc?.body||doc.body.dataset.page!=='detail'||doc.getElementById('scout-v212-dossier'))return false;
 const container=doc.getElementById('scout-v211-audit');if(!container||!item)return false;
 const panel=doc.createElement('details');panel.id='scout-v212-dossier';panel.className='scout-v212-dossier';
 panel.dataset.stage=item.stage;
 const heading=doc.createElement('summary');heading.textContent='V212 · Revisão individual para Posse de Bola';panel.append(heading);
 const meta=doc.createElement('p');meta.className='scout-v212-stage';
 meta.textContent='Build registrada preservada · '+item.pp+' PP · '+item.approval;
 const use=doc.createElement('p');use.className='scout-v212-use';use.textContent=item.formationUse;
 const focus=doc.createElement('p');focus.className='scout-v212-focus';focus.textContent=item.roleFocus;
 const note=doc.createElement('p');note.className='scout-v212-explanation';note.textContent=item.explanation;
 panel.append(meta,use,focus,note);
 if(item.alternative){
  const table=doc.createElement('table');table.className='scout-v212-table';
  table.setAttribute('aria-label','Comparação de níveis registrados com simulação experimental');
  const head=doc.createElement('thead');head.innerHTML='<tr><th scope="col">Categoria</th><th scope="col">Registrado</th><th scope="col">Simulação</th></tr>';
  table.append(head);
  const body=doc.createElement('tbody');
  for(let i=0;i<10;i++){
   const tr=doc.createElement('tr');if(item.registered[i]!==item.alternative[i])tr.className='scout-v212-changed';
   const h=doc.createElement('th');h.scope='row';h.textContent=CATEGORY[i];
   const current=doc.createElement('td');current.textContent=String(item.registered[i]);
   const trial=doc.createElement('td');trial.textContent=String(item.alternative[i]);
   tr.append(h,current,trial);body.append(tr);
  }
  table.append(body);panel.append(table);
  const budget=doc.createElement('p');budget.className='scout-v212-budget';
  budget.textContent='PP: '+item.pp+' registrados / '+item.alternativePP+' na simulação · '+item.changes.length+' categorias diferentes';
  panel.append(budget);
 }
 const signals=doc.createElement('p');signals.className='scout-v212-signals';
 signals.textContent=item.signals?.length?'Sinais usados: '+item.signals.join(' · '):'Sinais individualizados insuficientes.';
 const warn=doc.createElement('p');warn.className='scout-v212-warning';warn.textContent=item.nextEvidence;
 const noswap=doc.createElement('strong');noswap.className='scout-v212-readonly';noswap.textContent='Somente comparação: nenhuma ficha foi alterada.';
 panel.append(signals,warn,noswap);container.append(panel);
 return true;
}
const api=Object.freeze({CATEGORY,RANK,position,roleNote,rosterRole,ppCost,individualCase,reviewCases,display});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function start(){
 const d=host.document;
 if(d.body?.dataset.page!=='detail')return;
 let id;try{id=Number(JSON.parse(d.getElementById('scout-v68-data')?.textContent||'{}').capture)}catch(e){return}
 if(!id)return;
 Promise.all(['../SCOUT_V69_AUDITORIA.json','../SCOUT_V211_REPETICOES_REVIEW.json','../SCOUT_V176_POSSE_4312.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error(url);return r.json()})))
 .then(([source,report,formation])=>{
  const card=source.cards.find(x=>Number(x.numero)===id),group=report.groups.find(x=>x.ids.includes(id));
  if(!card||!group)return;
  const begin=()=>{
   const engine=host.SCOUT_TRAINING_V207;
   if(!engine?.suggestIndividualPreview)return false;
   const item=individualCase(card,group,engine,formation);
   if(display(d,item))return true;
   const observer=new host.MutationObserver(()=>{if(display(d,item))observer.disconnect()});
   observer.observe(d.body,{childList:true,subtree:true});return true;
  };
  if(!begin())d.addEventListener('scoutpro:individual-engine-ready',begin,{once:true});
 }).catch(()=>{});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:null);
