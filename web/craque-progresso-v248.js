/* Craque Tático V248 — auditoria local de níveis, sem inventar PP.
 * Uma carta pode ter PP no catálogo sem nível máximo DOCUMENTADO.
 * Registros revisados são armazenados separadamente e entram no backup
 * padrão (prefixo scoutpro:). Divergências não reescrevem builds originais.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_PROGRESS_REVIEW_V248=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const SCHEMA='CRAQUE_PROGRESS_REVIEW_V248';
const PREFIX='scoutpro:v248:level-review:';
const budget=level=>Number.isInteger(level)&&level>=1&&level<=120?2*(level-1):null;
const key=card=>PREFIX+Number(card.numero)+'@'+String(card.id);
function validate(card,record){
 if(!card||!record||record.schema!==SCHEMA||
  Number(record.numero)!==Number(card.numero)||
  String(record.card_id)!==String(card.id)||
  String(record.name)!==String(card.name)||
  record.confirmed_in_game!==true||
  budget(record.level)===null||record.pp!==budget(record.level))return null;
 return record;
}
function readSaved(card,store){
 try{return validate(card,JSON.parse(store.getItem(key(card))||'null'))}catch(_){return null}
}
function state(card,saved){
 const verified=validate(card,saved);
 if(verified&&verified.pp!==card.pp)return 'divergente';
 if(verified)return 'confirmado_localmente';
 if(Number.isInteger(card.max_level)&&card.pp_origem)return 'registrado';
 return 'pendente';
}
function summary(cards,store){
 const counts={total:cards.length,pendente:0,registrado:0,confirmado_localmente:0,divergente:0};
 for(const card of cards)counts[state(card,readSaved(card,store))]++;
 return counts;
}
const api=Object.freeze({SCHEMA,PREFIX,budget,key,validate,readSaved,state,summary});
if(!host?.document)return api;
const doc=host.document;
const $=id=>doc.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>
 ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cards=[],images=new Map(),filter='pendente',query='',limit=24;
const storage=()=>host.localStorage;
function note(message,problem=false){
 const e=$('v248-feedback');
 if(!e)return;
 e.textContent=message;
 e.dataset.error=problem?'true':'false';
}
function status(card){
 return state(card,readSaved(card,storage()));
}
function render(){
 const counts=summary(cards,storage());
 $('v248-stats').textContent=counts.registrado+' níveis documentados no catálogo · '+
  counts.confirmado_localmente+' conferidos neste dispositivo · '+
  counts.pendente+' sem nível comprovado · '+counts.divergente+' divergências a revisar.';
 const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const result=cards.filter(c=>{
  const s=status(c);
  const passes=filter==='all'||(filter==='pendente'&&(s==='pendente'||s==='divergente'))||s===filter;
  if(!passes)return false;
  const phrase=('#'+c.numero+' '+c.name+' '+c.versao+' '+c.id).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return !q||phrase.includes(q);
 });
 $('v248-count').textContent=result.length+' cartas no filtro · exibindo '+Math.min(limit,result.length);
 $('v248-more').hidden=result.length<=limit;
 $('v248-cards').innerHTML=result.slice(0,limit).map(c=>{
  const saved=readSaved(c,storage()),s=status(c);
  const art=images.get(c.numero)||'';
  const label={pendente:'Nível máximo a conferir',registrado:'Nível documentado',confirmado_localmente:'Conferido por você',divergente:'PP divergentes'}[s];
  const level=saved?.level??(Number.isInteger(c.max_level)?c.max_level:null);
  const pp=saved?.pp??c.pp;
  const explanation=s==='divergente'?
   'Sua confirmação indica '+saved.pp+' PP, mas o catálogo contém '+c.pp+' PP. Exporte o registro para revisão; a build original NÃO foi substituída.':
   s==='pendente'?'O catálogo registra '+c.pp+' PP, mas ainda não há comprovação do nível máximo desta edição.':
   s==='registrado'?'Nível/PP da fonte documentada; é possível conferir novamente na conta.':
   'Informação registrada por você neste dispositivo; a versão original segue preservada.';
  return '<article class="ct248-card" data-cap="'+c.numero+'">'+
   '<div class="ct248-art">'+(art?'<img loading="lazy" src="'+esc(art)+'" alt="Arte original de '+esc(c.name)+'">':'<span>Arte indisponível</span>')+'</div>'+
   '<div class="ct248-content">'+
    '<div class="ct248-top"><span class="ct248-number">#'+String(c.numero).padStart(3,'0')+'</span>'+
     '<span class="ct248-status" data-status="'+s+'">'+esc(label)+'</span></div>'+
    '<h3>'+esc(c.name)+'</h3><p class="ct248-edition">'+esc(c.versao)+'</p>'+
    '<p class="ct248-meta">'+esc(c.posicao)+' · '+esc(c.estilo_ataque)+
     ' · Card ID '+esc(c.id)+'</p>'+
    '<p class="ct248-budget">Catálogo: <strong>'+c.pp+' PP</strong> · Nível: <strong>'+
     (Number.isInteger(c.max_level)?c.max_level:'não confirmado')+'</strong>'+
     (saved?' · Sua conferência: <strong>Nível '+saved.level+' / '+pp+' PP</strong>':'')+'</p>'+
    '<p class="ct248-explanation">'+esc(explanation)+'</p>'+
    '<details class="ct248-details"><summary>Conferir nível no jogo</summary>'+
     '<form data-review="'+c.numero+'">'+
      '<label>Nível MÁXIMO (não Overall)<input name="level" type="number" min="1" max="120" step="1" required '+
        'value="'+(level??'')+'" placeholder="Ex.: 26"></label>'+
      '<label class="ct248-checkbox"><input type="checkbox" name="confirmed" required> '+
        'Conferi a edição e o nível máximo desta carta no eFootball.</label>'+
      '<button type="submit">Guardar minha conferência</button>'+
      '<p>Fórmula: 2 × (nível máximo − 1). A alteração é local, não substitui o treino do projeto.</p>'+
     '</form></details>'+
    '<a class="ct248-open" href="'+esc(c.arquivo)+'">Ver ficha desta edição ↗</a>'+
   '</div></article>';
 }).join('')||'<p class="ct248-empty">Nenhuma carta nesse filtro. Você pode limpar a pesquisa ou trocar o status.</p>';
}
function save(e){
 const form=e.target.closest('form[data-review]');
 if(!form)return;
 e.preventDefault();
 const numero=Number(form.dataset.review),card=cards.find(c=>c.numero===numero);
 if(!card)return note('Carta não encontrada no acervo. Nenhum dado foi salvo.',true);
 const input=Number(form.elements.level.value),pp=budget(input);
 if(pp===null||!form.elements.confirmed.checked)return note('Informe e confirme o nível máximo exibido no jogo.',true);
 const record={
  schema:SCHEMA,numero:card.numero,card_id:String(card.id),name:card.name,
  level:input,pp,confirmed_in_game:true,source:'conferência manual no eFootball',
  confirmed_at:new Date().toISOString()
 };
 if(!validate(card,record))return note('Não foi possível validar a edição. Nenhum dado foi salvo.',true);
 try{storage().setItem(key(card),JSON.stringify(record))}
 catch(_){return note('Falha ao salvar neste dispositivo. Confira o armazenamento local.',true)}
 const difference=pp!==card.pp;
 note(difference?'DIVERGÊNCIA: nível '+input+' equivale a '+pp+' PP, mas o catálogo registra '+card.pp+
  '. Exporte a revisão para corrigirmos a ficha original.':
  'Nível '+input+' confirmado localmente para #'+card.numero+' '+card.name+'.',difference);
 render();
}
async function exportReviewed(){
 const reviewed=cards.map(c=>readSaved(c,storage())).filter(Boolean);
 if(!reviewed.length)return note('Não há níveis conferidos para exportar.',true);
 const output={schema:SCHEMA,source:'conferência manual eFootball',total:reviewed.length,
  divergent:reviewed.filter(c=>cards.find(x=>x.numero===c.numero)?.pp!==c.pp).length,
  records:reviewed};
 const file='craque-tatico-niveis-confirmados-v248.json';
 try{
  if(typeof host.SCOUT_FILE_EXPORT?.saveJson==='function'){
   const result=await host.SCOUT_FILE_EXPORT.saveJson(output,file);
   note(result.status==='saved'?'Arquivo de conferências salvo.':
    result.status==='cancelled'?'Exportação cancelada.':
    'Solicitação de exportação enviada; confira o arquivo.');
   return;
  }
  const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  try{
   const link=doc.createElement('a');link.href=url;link.download=file;doc.body.appendChild(link);
   link.click();link.remove();
  }finally{host.setTimeout(()=>URL.revokeObjectURL(url),10000)}
  note('Download solicitado. Confira o arquivo antes de compartilhar.');
 }catch(error){note('Não foi possível exportar: '+String(error?.message||error),true)}
}
async function init(){
 if(doc.body?.dataset.page!=='progress-audit')return;
 try{
  const [r1,r2]=await Promise.all([
   fetch('SCOUT_V69_AUDITORIA.json'),fetch('SCOUT_V98_AUDITORIA_TATICA.json')
  ]);
  if(!r1.ok||!r2.ok)throw Error('Dados offline indisponíveis');
  const [catalog,art]=await Promise.all([r1.json(),r2.json()]);
  if(!Array.isArray(catalog.cards)||catalog.cards.length!==246||
   !Array.isArray(art.cartas)||art.cartas.length!==246)
   throw Error('Acervo incompleto: conferência bloqueada para preservar a integridade');
  cards=catalog.cards;
  images=new Map(art.cartas.map(c=>[Number(c.numero),String(c.imagem||'')]));
  if(summary(cards,storage()).registrado!==85&&summary(cards,storage()).pendente!==161)
   note('Há registros locais ou alterações no catálogo; confira os valores antes de exportar.');
  $('v248-search').addEventListener('input',e=>{query=e.target.value.trim();limit=24;render()});
  $('v248-filter').addEventListener('change',e=>{filter=e.target.value;limit=24;render()});
  $('v248-more').addEventListener('click',()=>{limit+=24;render()});
  $('v248-cards').addEventListener('submit',save);
  $('v248-export').addEventListener('click',exportReviewed);
  render();
 }catch(e){note('Não foi possível carregar a auditoria: '+String(e.message||e),true)}
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
else init();
return api;
});
