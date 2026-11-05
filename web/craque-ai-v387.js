/* Craque Tatico AI V387 — camada consultiva, sem writes em cartas e fichas.
 * Nunca armazenar chave Gemini ou token Worker. Notas manuais sao locais.
 */
(function(){'use strict';
const $=id=>document.getElementById(id);
const KEY_NOTES='scoutpro:ai:v387:corrections';
const KEY_URL='scoutpro:ai:v387:worker-url';
const KEY_ACCOUNTS='scoutpro:v382:accounts';
const styles={posse:'Posse de Bola',normal:'Contra-Ataque Normal',rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Passe Longo'};
let cards=[],formations=[],rawLegacy=[],lastResult=null;
const data={legacy:[],extras:[],primary:[],secondary:[]};
const note=(id,message,isError=false)=>{const el=$(id);el.textContent=String(message);el.dataset.error=String(isError)};
const jsonParse=(raw,fall)=>{try{return raw?JSON.parse(raw):fall}catch(_){return fall}};
const readStore=(key,fall)=>{try{return jsonParse(localStorage.getItem(key),fall)}catch(_){return fall}};
const trunc=(v,max=500)=>String(v??'').slice(0,max);
const textList=(items,n=12)=>Array.isArray(items)?items.slice(0,n).map(x=>trunc(x,140)):[];
const fullName=c=>c.name+(c.edition?' · '+c.edition:'')+(c.cap?' [#'+String(c.cap).padStart(3,'0')+']':'');
function toCard(card,kind,account){
 if(!card||typeof card!=='object')return null;
 const name=trunc(card.name,100);if(!name)return null;
 const cap=kind==='legacy'?Number(card.numero):null;
 const key=kind==='legacy'?'cap:'+cap:(kind==='extra'?trunc(card.key,70):account+':'+trunc(card.id,100));
 return {key,kind,account,cap,name,
   cardId:trunc(kind==='legacy'?card.id:kind==='extra'?card.cardId:(card.cardId||card.id),85),
   edition:trunc(kind==='legacy'?card.versao:card.edition,180),
   position:trunc(kind==='legacy'?card.posicao:card.position,35),
   style:trunc(kind==='legacy'?card.estilo_ataque:card.style,65),
   defenceStyle:trunc(kind==='legacy'?card.estilo_defesa:card.secondaryStyle,65),
   pp:typeof card.pp==='number'?card.pp:null,level:card.maxLevel??card.max_level??card.level??null,
   ppEstimated:card.pp_estimado===true,progress:Array.isArray(card.niveis)?card.niveis.slice(0,10):null,
   nativeSkills:kind==='legacy'?trunc(card.habilidades_nativas,900):kind==='extra'?textList(card.observed?.nativeSkills,12):textList(card.nativeSkills,12),
   extraCandidates:textList(card.adicionais_candidatas,7),boost:trunc(card.impeto_fixo,120),
   extraBoost:trunc(card.impeto_extra,160),pending:textList(card.pendencias,10),
   evidence:kind==='extra'?'Edição/Card ID ainda pendentes na base adicional. Estatísticas podem ser simulação eFHub.':
     kind==='legacy'?'Catálogo V69: conferir edição e prova em jogo antes de homologar.':
     'Cadastro manual desta conta, conferir procedência.',
   record:card};
}
async function loadLocal(){
 const files=await Promise.allSettled([
   fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('catalogo');return r.json()}),
   fetch('ct364-owned-cards.json').then(r=>{if(!r.ok)throw Error('adicionais');return r.json()}),
   fetch('SCOUT_V177_DUAS_FORMACOES.json').then(r=>{if(!r.ok)throw Error('formacoes');return r.json()})
 ]);
 if(files[0].status==='fulfilled')data.legacy=(files[0].value.cards||[]).map(x=>toCard(x,'legacy','primary')).filter(Boolean);
 if(files[1].status==='fulfilled')data.extras=(files[1].value.cards||[]).map(x=>toCard(x,'extra','primary')).filter(Boolean);
 if(files[2].status==='fulfilled')formations=files[2].value.formations||[];
 const doc=readStore(KEY_ACCOUNTS,{});
 for(const account of ['primary','secondary'])data[account]=((doc[account]||{}).cards||[]).map(c=>toCard(c,'manual',account)).filter(Boolean);
 renderCards();
 if(!data.legacy.length)note('ctai-connection-status','Catálogo de cartas indisponível. Verifique a instalação e não limpe dados do app.',true);
}
function available(){
 const account=$('ctai-account').value;
 return account==='primary'?[...data.legacy,...data.extras,...data.primary]:[...data.secondary];
}
function renderCards(){
 const account=$('ctai-account').value;
 const prev=$('ctai-card').value,search=$('ctai-card-search').value.trim().toLocaleLowerCase('pt-BR');
 cards=available().filter(c=>!search||[c.name,c.edition,c.cardId,c.position,c.cap].some(x=>String(x??'').toLocaleLowerCase('pt-BR').includes(search)));
 const select=$('ctai-card');select.replaceChildren();
 for(const c of cards.slice(0,400)){
   const option=document.createElement('option');option.value=c.key;option.textContent=fullName(c);select.append(option);
 }
 if(cards.some(c=>c.key===prev))select.value=prev;
 renderMemory();
}
function selectedCard(){const key=$('ctai-card').value;return cards.find(c=>c.key===key)||null}
function publicCard(c){return {origem:c.kind,conta:c.account,numero:c.cap,nome:c.name,edicao:c.edition,
 cardId:c.cardId||'Pendente',posicao:c.position,estiloAtaque:c.style,estiloDefesa:c.defenceStyle,
 pp:c.pp,ppEstimado:c.ppEstimated,nivel:c.level,progressao:c.progress,
 habilidadesNativas:c.nativeSkills,habilidadesSugeridas:c.extraCandidates,
 impetoFixo:c.boost,impetoExtra:c.extraBoost,pendencias:c.pending,alertaFonte:c.evidence};}
function notes(){const items=readStore(KEY_NOTES,[]);return Array.isArray(items)?items:[]}
function saveNotes(arr) {
 if(arr.length>180)throw Error('Limite local de 180 notas. Exclua notas antigas antes de salvar.');
 localStorage.setItem(KEY_NOTES,JSON.stringify(arr));
 window.dispatchEvent(new CustomEvent('craque:data-changed',{detail:{key:KEY_NOTES}}));
}
function noteId(c){return c.account+':'+c.key}
function renderMemory(){
 const c=selectedCard(),target=$('ctai-memory-target');
 if(!c){target.textContent='Nenhuma carta disponível nesta conta.';$('ctai-memory-note').value='';$('ctai-memory-proof').value='';return}
 target.textContent=fullName(c)+' · '+c.account;
 const record=notes().find(n=>n.card===noteId(c));
 $('ctai-memory-note').value=record?.note||'';
 $('ctai-memory-proof').value=record?.proof||'';
}
function updateMode(){
 const mode=$('ctai-mode').value;
 $('ctai-card-fields').hidden=mode!=='carta';
 $('ctai-formation-fields').hidden=mode!=='formacao';
 $('ctai-code-fields').hidden=mode!=='codigo';
 $('ctai-memory-panel').hidden=mode!=='carta';
 $('ctai-include-memory').disabled=mode==='codigo';
}
function selectedFormation(){
 const form=formations.find(x=>x.id===$('ctai-formation').value);
 if(!form)throw Error('Formação original indisponível.');
 const mode=$('ctai-style').value;
 const base=Object.fromEntries((form.starters||[]).map(x=>[x.slot,Number(x.cap)]));
 const key=mode==='posse'?'scoutpro:v177:minhas-duas-formacoes:'+form.id:
  'scoutpro:v231:formation-lineup:'+form.id+':'+mode;
 const stored=readStore(key,null);
 const valid=stored&&stored.slots&&Object.keys(base).length===11&&
   Object.keys(base).every(slot=>Number.isInteger(Number(stored.slots[slot]))&&Number(stored.slots[slot])>=1&&Number(stored.slots[slot])<=246)&&
   Object.keys(stored.slots).length===11&&new Set(Object.values(stored.slots).map(Number)).size===11;
 const selected=valid?stored.slots:base;
 const byCap=new Map(data.legacy.map(c=>[c.cap,c]));
 const eleven=Object.entries(selected).map(([slot,number])=>{
    const c=byCap.get(Number(number));
    return {funcao:slot,numero:Number(number),nome:c?.name||'Pendente',cardId:c?.cardId||'Pendente',
      edicao:c?.edition||'Pendente',posicaoOriginal:c?.position||'Pendente'};
 });
 const banned=readStore('scoutpro:v219:black-caps',[]);
 const excluded=Array.isArray(banned)?banned.filter(x=>Number.isInteger(Number(x))).map(Number):[];
 return {formacao:form.title,formato:form.id,estilo:styles[mode],situacao:valid?'Escalacao local salva':'PREVIA HISTORICA NAO HOMOLOGADA',
   elenco:eleven,cartasRestritas:excluded,violacoes:eleven.filter(x=>excluded.includes(x.numero)).map(x=>x.numero),
   alerta:'Bloqueios locais nao comprovam identidade de fotos. Nao confundir estilo do tecnico com estado real do jogo.'};
}
function endpoint(){
 const raw=$('ctai-endpoint').value.trim();
 let u;try{u=new URL(raw)}catch(_){throw Error('Informe URL HTTPS valida do seu Worker.')}
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')
   throw Error('Use apenas a raiz HTTPS do seu Worker, sem usuario, caminho ou parametros.');
 return u.origin;
}
function accessToken(){
 const token=$('ctai-token').value.trim();
 if(token.length<32)throw Error('Token pessoal do Worker deve ter ao menos 32 caracteres.');
 return token;
}
async function api(path,method,body){
 const root=endpoint(),token=accessToken();
 if(!navigator.onLine)throw Error('Sem internet. As cartas e notas locais continuam acessiveis.');
 const response=await fetch(root+path,{
   method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(30000)
 });
 let result={};
 try{result=await response.json()}catch(_){throw Error('Resposta nao reconhecida do servidor.')}
 if(!response.ok)throw Error(result.error||'Falha HTTP '+response.status);
 return result;
}
function usageView(u){
 if(!u)return;
 $('ctai-budget').textContent='Reservado no Worker neste mes: US$ '+Number(u.reservedUsd||0).toFixed(4)+
  ' / US$ '+Number(u.capUsd||0).toFixed(2)+' · hoje '+u.dayCalls+'/'+u.dailyLimit+
  ' consultas. Reserva preventiva, nao e valor real faturado.';
}
async function connect(){
 $('ctai-connect').disabled=true;
 try{const u=endpoint();localStorage.setItem(KEY_URL,u);
   const out=await api('/usage','GET');
   usageView(out.usage);note('ctai-connection-status','Worker autenticado e controle de custos ativo. Pronto para consultas.');
 }catch(e){note('ctai-connection-status',e.message,true)}
 finally{$('ctai-connect').disabled=false}
}
function chosenNotes(list){
 if(!$('ctai-include-memory').checked)return [];
 const ids=new Set(list.map(noteId));
 return notes().filter(n=>ids.has(n.card)).slice(0,10).map(n=>({
    carta:n.card,nota:trunc(n.note,700),fonte:trunc(n.proof,250),
    status:'Declaracao do usuario — nao validada automaticamente'}));
}
async function ask(){
 const mode=$('ctai-mode').value,question=$('ctai-question').value.trim();
 if(question.length<4){note('ctai-result-status','Escreva uma pergunta objetiva com pelo menos quatro caracteres.',true);return}
 let context={};let related=[];
 try {
  if(mode==='carta'){const c=selectedCard();if(!c)throw Error('Selecione uma carta.');
    context={carta:publicCard(c)};related=[c];
  }else if(mode==='formacao'){context=selectedFormation();
    const byCap=new Map(data.legacy.map(c=>[c.cap,c]));
    related=context.elenco.map(c=>byCap.get(c.numero)).filter(Boolean);
  }
  if(mode!=='codigo')context.notasDeConferencia=chosenNotes(related);
  const body={mode,question,context};
  if(mode==='codigo'){body.auditPath=$('ctai-audit-file').value;
    body.confirmCodeShare=$('ctai-allow-code').checked;
    if(!body.confirmCodeShare)throw Error('Autorize explicitamente o envio do trecho do GitHub.');
  }
  $('ctai-ask').disabled=true;note('ctai-result-status','Consultando… nenhuma ficha sera alterada.');
  const result=await api('/analyze','POST',body);lastResult=result;
  $('ctai-result').textContent=result.answer||'Sem resposta textual.';
  usageView(result.usage);
  note('ctai-result-status','Parecer consultivo · '+result.model+' · nenhum dado alterado.');
 }catch(e){note('ctai-result-status',e.message,true)}
 finally{$('ctai-ask').disabled=false}
}
function saveMemory(){
 const c=selectedCard();if(!c){note('ctai-memory-status','Selecione uma carta.',true);return}
 const value=$('ctai-memory-note').value.trim(),proof=$('ctai-memory-proof').value.trim();
 if(value.length<8||!proof){note('ctai-memory-status','Escreva uma nota (8+ caracteres) e a fonte conferida.',true);return}
 try{
 const arr=notes().filter(n=>n.card!==noteId(c));
 arr.push({card:noteId(c),note:trunc(value,700),proof:trunc(proof,250),savedAt:new Date().toISOString()});
 saveNotes(arr);note('ctai-memory-status','Nota salva somente neste dispositivo. Nenhum dado canonico foi alterado.');
 }catch(e){note('ctai-memory-status','Armazenamento indisponivel: '+e.message,true)}
}
function removeMemory(){
 const c=selectedCard();if(!c)return;
 try{saveNotes(notes().filter(n=>n.card!==noteId(c)));renderMemory();note('ctai-memory-status','Nota local excluida; demais dados preservados.')}
 catch(e){note('ctai-memory-status',e.message,true)}
}
function init(){
 $('ctai-endpoint').value=readStore(KEY_URL,'')||localStorage.getItem(KEY_URL)||'';
 $('ctai-mode').addEventListener('change',updateMode);
 $('ctai-account').addEventListener('change',()=>{$('ctai-card-search').value='';renderCards()});
 $('ctai-card-search').addEventListener('input',renderCards);
 $('ctai-card').addEventListener('change',renderMemory);
 $('ctai-connect').addEventListener('click',connect);
 $('ctai-clear-token').addEventListener('click',()=>{$('ctai-token').value='';note('ctai-connection-status','Token apagado desta sessao.')});
 $('ctai-ask').addEventListener('click',ask);
 $('ctai-memory-save').addEventListener('click',saveMemory);
 $('ctai-memory-remove').addEventListener('click',removeMemory);
 updateMode();loadLocal().catch(()=>note('ctai-connection-status','Nao foi possivel abrir o catalogo local.',true));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
