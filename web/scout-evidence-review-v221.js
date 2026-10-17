/* Scout PRO V221 — revisão visível de evidências para cada carta do catálogo.
 * Crucial: conferências locais são anotações do usuário, NÃO homologação eFootball.
 * Busca exclusivamente por (número + Card ID). Nunca agrupar por nome isolado.
 */
(function(host){
'use strict';
const $=(root,selector)=>root.querySelector(selector);
const el=(doc,tag,cls,value)=>{
 const node=doc.createElement(tag);
 if(cls)node.className=cls;
 if(value!==undefined)node.textContent=String(value);
 return node;
};
const parse=v=>{try{return JSON.parse(String(v))}catch(_e){return null}};
const localGet=key=>{try{return host?.localStorage?.getItem(key)||''}catch(_e){return ''}};
const localSet=(key,value)=>{try{host?.localStorage?.setItem(key,value);return true}catch(_e){return false}};
const VALUES=['id','skills','slot','gameplay'];
const STEP_NAMES={
 id:'Conferi o número, a edição e o Card ID na minha carta',
 skills:'Conferi as habilidades nativas e as adicionais na carta exata',
 slot:'Conferi os ímpetos e a situação real do segundo slot',
 gameplay:'Testei este jogador em partidas com a função e o estilo escolhidos'
};
function validate(index,detail){
 if(!index||index.resumo?.total!==246||!Array.isArray(index.cards)||index.cards.length!==246)
  return {ok:false,error:'Índice de 246 cartas indisponível ou inconsistente. Dados originais preservados.'};
 const cap=Number(detail?.capture),id=String(detail?.id||'');
 const record=index.cards.find(c=>Number(c.numero)===cap);
 if(!record||String(record.card_id)!==id||!Number.isInteger(cap))
  return {ok:false,error:'Identidade não coincide com número e Card ID; auditoria não vinculada à carta.'};
 if(Number(record.pp)!==Number(detail.pp))
  return {ok:false,error:'PP da página divergente do índice; não confiar no diagnóstico até atualizar.'};
 const issues=[];
 const push=(code,title,why,priority)=>issues.push({code,title,why,priority});
 if(record.id_status==='sem_card_id')
  push('id','Card ID ausente','Identifique a edição exata antes de associar vídeos, biotipo, versões ou comparações de atributos.',0);
 if(record.id_status==='card_id_compartilhado')
  push('id_partilhado','Card ID compartilhado','Este ID também aparece nas entradas #'+record.card_id_compartilhado_com.join(', #')+'. Não unir as fichas automaticamente.',0);
 if(record.treino==='treino_sem_validacao')
  push('treino','Treino ainda não validado','Os '+record.pp+' PP constam no cadastro, mas nenhuma build registrada validada foi vinculada a esta carta. As simulações permanecem provisórias.',0);
 if(record.nativas_documentadas===0)
  push('skills','Habilidades nativas não documentadas','Não tratar sugestões de habilidades como confirmadas nesta edição.',0);
 if(!record.base_stats_confirmados)
  push('status','Atributos-base finais pendentes','Verificar os valores da edição exata antes de homologar uma redistribuição de PP ou alegar ganho de desempenho.',1);
 if(record.pares_repetidos.length)
  push('repeticao','Build compartilhada por '+(record.pares_repetidos.length+1)+' cartas','Igualdade de níveis não significa igualdade de gameplay. Compare habilidade, função, bônus e status antes de propor qualquer alteração.',1);
 if(record.segundo_impeto!=='registered')
  push('slot','Segundo ímpeto não confirmado na conta','O texto de slot no catálogo não garante que há um espaço livre ou que uma opção possa ser equipada.',1);
 if(record.print_candidato&&!record.print_edicao_confirmada)
  push('print','Print candidato sem vínculo por Card ID','O print encontrado por nome serve somente como referência até confirmar a mesma edição.',2);
 if(record.modelo_corporal_documentado)
  push('biotipo','Biotipo documentado em fonte externa','As medidas são contexto e não provam animação, Player ID nem superioridade de gameplay.',2);
 const stage=record.treino==='treino_sem_validacao'?'PENDENTE':record.id_status!=='card_id_no_catalogo'?'IDENTIDADE A REVER':
  record.pares_repetidos.length?'REVISÃO DE REPETIÇÃO':'REGISTRO PRESERVADO';
 const peers=record.pares_repetidos.map(n=>index.cards.find(c=>Number(c.numero)===Number(n)))
  .filter(Boolean).map(c=>({numero:c.numero,nome:c.nome,arquivo:c.arquivo,edicao:c.edicao,pp:c.pp}));
 return {ok:true,record,stage,issues:issues.sort((a,b)=>a.priority-b.priority||a.code.localeCompare(b.code)),
  peers,registered:record.treino==='treino_registrado',confidence:'evidencia_documental_incompleta',
  conclusion:'A ficha não pode ser homologada apenas por pontuação, nomes coincidentes ou rascunhos locais.',
  matchedOn:'numero + Card ID + PP',total:index.resumo.total};
}
function storageKey(card){return 'scoutpro:v221:evidence:'+Number(card.capture)+':'+String(card.id||'')}
function readChecks(record){
 const raw=parse(localGet(storageKey({capture:record.numero,id:record.card_id})))||{};
 if(String(raw.card_id)!==String(record.card_id)||Number(raw.capture)!==Number(record.numero))return {steps:{},notes:''};
 const steps={};
 for(const s of VALUES)steps[s]=raw.steps?.[s]===true;
 return {steps,notes:String(raw.notes||'').slice(0,850)};
}
function saveChecks(record,steps,notes){
 const safe={};
 for(const s of VALUES)safe[s]=steps?.[s]===true;
 return localSet(storageKey({capture:record.numero,id:record.card_id}),
  JSON.stringify({capture:record.numero,card_id:record.card_id,steps:safe,
   notes:String(notes||'').slice(0,850),updated:new Date().toISOString(),
   scope:'conferencia_pessoal_local_nao_homologada'}));
}
function mount(doc,index){
 const place=doc?.getElementById('scout-v220-training'),
  hero=doc?.getElementById('scout-v220-hero'),
  raw=doc?.getElementById('scout-v68-data');
 if(!place||!hero||!raw||doc.getElementById('scout-v221-review'))return false;
 let card;try{card=JSON.parse(raw.textContent)}catch(_e){return false}
 const state=validate(index,card);
 const box=el(doc,'section','scout-v221-box');
 box.id='scout-v221-review';box.setAttribute('aria-label','Revisão de evidências da carta');
 const header=el(doc,'div','scout-v221-heading');
 const heading=el(doc,'div','','03 · CONFERÊNCIA DA CARTA');
 const badge=el(doc,'span','scout-v221-stage',state.ok?state.stage:'BASE INCONSISTENTE');
 badge.dataset.state=state.ok?(state.registered?'registered':'pending'):'invalid';
 header.append(heading,badge);box.append(header);
 if(!state.ok){
  box.append(el(doc,'p','scout-v221-warning',state.error));
  place.insertAdjacentElement('afterend',box);
  return true;
 }
 const c=state.record;
 const note=el(doc,'p','scout-v221-intro','Acervo: '+index.resumo.registrados+' treinos registrados · '+index.resumo.pendentes+' sem validação · '+index.resumo.repetidos+' cartas com repetição. A sua carta é #'+String(c.numero).padStart(3,'0')+'.');
 box.append(note);
 const summary=el(doc,'div','scout-v221-summary');
 const status=(name,value,kind)=>{
  const tag=el(doc,'div','scout-v221-status');
  tag.dataset.kind=kind;tag.append(el(doc,'small','',name),el(doc,'strong','',value));
  return tag;
 };
 summary.append(
  status('PP CADASTRADOS',String(c.pp)+' PP',state.registered?'ok':'warn'),
  status('BUILD',state.registered?'Registrada':'Sem validação',state.registered?'ok':'warn'),
  status('CARD ID',c.id_status==='sem_card_id'?'Pendente':c.id_status==='card_id_compartilhado'?'Compartilhado':'Cadastrado',c.id_status==='card_id_no_catalogo'?'ok':'warn'),
  status('HABILIDADES NATIVAS',String(c.nativas_documentadas)+' cadastradas',c.nativas_documentadas?'ok':'warn'));
 box.append(summary);
 const disclaimer=el(doc,'p','scout-v221-disclaimer',state.registered?
  'Treino cadastrado não equivale a atributos finais comprovados ou melhor rendimento em partidas.' :
  'SEM TREINO VALIDADO: o Scout PRO não substituirá esta ficha por uma distribuição deduzida. Alternativas são apenas simulações.');
 box.append(disclaimer);
 const details=el(doc,'details','scout-v221-details');
 const disclosure=el(doc,'summary','',state.issues.length+' verificações documentais para esta carta');
 details.append(disclosure);
 const list=el(doc,'ol','scout-v221-issues');
 for(const item of state.issues){
  const li=el(doc,'li','scout-v221-issue');
  li.append(el(doc,'strong','',item.title),el(doc,'p','',item.why));
  list.append(li);
 }
 if(!list.children.length)list.append(el(doc,'li','','Sem pendências apontadas pelas fontes atuais; validar a edição e o jogo antes de afirmar otimização.'));
 details.append(list);
 if(state.peers.length){
  const similar=el(doc,'div','scout-v221-peers');
  similar.append(el(doc,'h4','','Distribuição idêntica em '+state.peers.length+' outra(s) carta(s)'));
  for(const peer of state.peers){
   const link=el(doc,'a','scout-v221-peer', '#'+String(peer.numero).padStart(3,'0')+' '+peer.nome+' · '+peer.pp+' PP');
   if(/^fichas\/[a-zA-Z0-9_\-.]+\.html$/.test(peer.arquivo)){
    link.href='../'+peer.arquivo;
    link.title='Abrir ficha desta carta para comparação';
   }else{link.removeAttribute('href')}
   similar.append(link);
  }
  similar.append(el(doc,'p','scout-v221-note','Comparação apenas documental. Nenhuma build foi trocada automaticamente.'));
  details.append(similar);
 }
 const evidence=el(doc,'div','scout-v221-evidence');
 evidence.append(el(doc,'h4','','Referências disponíveis e limitações'));
 const e=el(doc,'ul','scout-v221-evidence-list');
 for(const line of [
  'Edição cadastrada: '+c.edicao,
  'Card ID: '+c.card_id+' · conferência por número + ID + PP',
  'Atributos-base desta edição: '+(c.base_stats_confirmados?'registrados no acervo':'não documentados'),
  'Biotipo: '+(c.modelo_corporal_documentado?'transcrição de fonte externa (sem prova de gameplay)':'sem medição vinculada por Card ID'),
  'Print de habilidades: '+(c.print_candidato?'candidato '+c.print_candidato+' (edição não homologada)':'sem candidato vinculado'),
  'Segundo ímpeto: '+(c.segundo_impeto==='registered'?'nome registrado no acervo, sem confirmar conta':'a disponibilidade/equipamento precisa de confirmação no jogo')
 ])e.append(el(doc,'li','',line));
 evidence.append(e);details.append(evidence);
 const reviewer=el(doc,'div','scout-v221-personal');
 reviewer.append(el(doc,'h4','','Minha conferência no eFootball'));
 reviewer.append(el(doc,'p','scout-v221-note','Marque somente o que você realmente verificou. Estes registros ficam neste dispositivo e NÃO aprovam automaticamente build, skills, slot ou Card ID.'));
 const stored=readChecks(c),steps={...stored.steps};
 const count=el(doc,'div','scout-v221-personal-progress');
 const countUpdate=()=>{count.textContent=VALUES.filter(k=>steps[k]).length+' / 4 conferências pessoais';};
 const save=()=>{
  const ok=saveChecks(c,steps,textarea.value);
  feedback.textContent=ok?'Conferência pessoal salva neste dispositivo, sem alterar nenhuma carta.':'Não foi possível salvar no armazenamento local.';
  countUpdate();
 };
 for(const k of VALUES){
  const label=el(doc,'label','scout-v221-check');
  const check=doc.createElement('input');check.type='checkbox';check.checked=Boolean(steps[k]);
  check.addEventListener('change',()=>{steps[k]=check.checked;save()});
  label.append(check,el(doc,'span','',STEP_NAMES[k]));reviewer.append(label);
 }
 const textarea=el(doc,'textarea','scout-v221-note-input');
 textarea.rows=3;textarea.maxLength=850;textarea.value=stored.notes;
 textarea.placeholder='Anote sua evidência: edição, print, atributos conferidos, diferença de movimentação ou dúvida para revisão.';
 textarea.setAttribute('aria-label','Notas pessoais de conferência desta carta');
 reviewer.append(count,textarea);
 const saveButton=el(doc,'button','scout-v221-save','Salvar observações de conferência');
 saveButton.type='button';saveButton.addEventListener('click',save);
 const feedback=el(doc,'p','scout-v221-feedback');feedback.setAttribute('aria-live','polite');
 reviewer.append(saveButton,feedback);details.append(reviewer);
 countUpdate();
 box.append(details);
 place.insertAdjacentElement('afterend',box);
 const nav=doc.querySelector('.side-nav');
 if(nav&&!nav.querySelector('a[href="#scout-v221-review"]')){
  const link=el(doc,'a','','Conferência de evidências');
  link.href='#scout-v221-review';nav.append(link);
 }
 // Identidade verificada estritamente; apenas o aviso é exibido na ficha.
 return true;
}
const api=Object.freeze({validate,storageKey,readChecks,saveChecks,mount,VALUES,STEP_NAMES});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
let loading=false;
async function init(){
 if(host.document.getElementById('scout-v221-review')||loading)return;
 const raw=host.document.getElementById('scout-v68-data');
 if(!raw||!host.document.getElementById('scout-v220-training'))return;
 loading=true;
 try{
  const r=await host.fetch('../SCOUT_V221_EVIDENCE_INDEX.json',{cache:'no-store'});
  if(!r.ok)throw Error('Índice offline indisponível');
  const index=await r.json();
  mount(host.document,index);
 }catch(_e){
  const fallback=el(host.document,'p','scout-v221-warning','Não foi possível consultar a revisão documental nesta instalação. Os treinos, cartas e informações originais permanecem intactos.');
  fallback.id='scout-v221-review';host.document.getElementById('scout-v220-training')?.insertAdjacentElement('afterend',fallback);
 }finally{loading=false}
}
function boot(){
 if(!host.document.body||host.document.body.dataset.page!=='detail')return;
 init();
 if(typeof host.MutationObserver!=='function')return;
 const observer=new host.MutationObserver(()=>{if(host.document.getElementById('scout-v221-review'))observer.disconnect();else init()});
 observer.observe(host.document.body,{subtree:true,childList:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})(typeof window!=='undefined'?window:null);
