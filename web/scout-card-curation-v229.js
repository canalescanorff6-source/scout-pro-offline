/* Craque Tático V229 — curadoria da apresentação nas 246 cartas pessoais.
 * Move os nós antigos para um arquivo recolhido; NUNCA deleta dados, eventos,
 * treinos, imagens, ID, habilidades ou chaves do localStorage.
 * Uma única ficha central V220/V218 continua ativa nos 5 estilos táticos.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_CARD_CURATOR_V229=api;
 if(!host?.document||host.document.body?.dataset.page!=='detail')return;
 const doc=host.document;
 const boot=()=>{
  if(api.mount(doc))return;
  if(typeof host.MutationObserver!=='function')return;
  const observer=new host.MutationObserver(()=>{
   if(api.mount(doc))observer.disconnect();
  });
  observer.observe(doc.body,{childList:true,subtree:true});
  doc.addEventListener('scoutpro:profile-ready',()=>{if(api.mount(doc))observer.disconnect()},{once:true});
  doc.addEventListener('scoutpro:recommendations-ready',()=>{if(api.mount(doc))observer.disconnect()},{once:true});
 };
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})(typeof window!=='undefined'?window:null,function(){'use strict';
const SECTION_IDS=['engenharia','foco','pontos','performance','status','jogar'];
const SAFE_TITLE=/\s*(?:\||·)\s*SCOUT PRO V\d+\s*$/i;
function collect(doc){
 const profile=doc.querySelector('.profile-content');
 return SECTION_IDS.map(id=>{
  const item=doc.getElementById(id);
  if(!item)return {id,present:false,insideArchive:false,container:null};
  const advanced=item.closest('.scout-v218-advanced');
  const container=advanced||item;
  return {id,present:true,insideArchive:!!item.closest('#scout-v229-legacy-archive'),
    container,advanced:Boolean(advanced)};
 });
}
function inspect(doc){
 const archive=doc.getElementById('scout-v229-legacy-archive');
 const hero=doc.getElementById('scout-v220-hero');
 const technical=doc.getElementById('scout-v220-technical');
 const legacy=collect(doc);
 const mainTables=doc.querySelectorAll('#scout-v220-training #scout-v208-training');
 const mainProgress=doc.querySelectorAll('#scout-v220-hero .scout-v188-progress');
 const duplicateIds=SECTION_IDS.filter(id=>doc.querySelectorAll('#'+id).length!==1);
 const visibleLegacy=legacy.filter(x=>x.present&&!x.insideArchive).map(x=>x.id);
 const root=doc.querySelector('.profile-content');
 const ownedArchive=Boolean(root&&archive&&root.contains(archive));
 return {total:SECTION_IDS.length,present:legacy.filter(x=>x.present).length,
  archived:legacy.filter(x=>x.insideArchive).length,
  main:hero?1:0,mainTables:mainTables.length,mainProgress:mainProgress.length,
  technical:technical?1:0,archive:archive?1:0,ownedArchive,duplicateIds,visibleLegacy,
  compact:doc.body.classList.contains('scout-v229-unified')};
}
function mount(doc){
 if(!doc||doc.body?.dataset.page!=='detail')return false;
 const panel=doc.getElementById('scout-v188-principal');
 const hero=doc.getElementById('scout-v220-hero');
 const technical=doc.getElementById('scout-v220-technical');
 const content=technical?.querySelector('.scout-v220-technical-body');
 const training=doc.querySelector('#scout-v220-training #scout-v208-training');
 // Nunca esconder o HTML legado se o componente principal não montou.
 if(!panel||!hero||!technical||!content||!training)return false;
 if(doc.getElementById('scout-v229-legacy-archive'))return true;
 const archive=doc.createElement('details');
 archive.id='scout-v229-legacy-archive';
 archive.className='scout-v229-legacy-archive';
 const summary=doc.createElement('summary');
 summary.textContent='Arquivo da carta · engenharia do vídeo, treinos e painéis anteriores';
 const notice=doc.createElement('p');notice.className='scout-v229-archive-note';
 notice.textContent='Documentação preservada para consulta. A ficha acima é a única principal. Comparações históricas não substituem seu treino atual nem comprovam um status final.';
 const holder=doc.createElement('div');holder.className='scout-v229-archive-content';
 archive.append(summary,notice,holder);
 // O arquivo fica no painel técnico opcional, SEM criar outra ficha principal.
 // Ids, conteúdos, funções de edição e eventos das seções originais permanecem intactos.
 const moved=new Set();
 for(const entry of collect(doc)){
  const section=entry.container;
  if(!entry.present||!section||moved.has(section)||section.contains(archive))continue;
  moved.add(section);holder.append(section);
 }
 content.insertBefore(archive,content.firstChild);
 // Preservar links internos do catálogo e da ficha para os painéis transferidos.
 doc.addEventListener('click',event=>{
  const link=event.target?.closest?.('a[href^="#"]');
  if(!link)return;
  const targetId=link.getAttribute('href').slice(1);
  if(!SECTION_IDS.includes(targetId))return;
  const target=doc.getElementById(targetId);
  if(!target||!archive.contains(target))return;
  technical.open=true;archive.open=true;
  const enclosing=target.closest('.scout-v218-advanced');
  if(enclosing)enclosing.open=true;
 },true);
 // A preferência antiga V187 de abrir todas as seções nunca deve vazar entre cartas.
 // Não sobrescrever a chave original nem limpar localStorage: apenas mudar a apresentação.
 doc.body.classList.add('scout-v188-compact','scout-v229-unified');
 const oldSwitch=panel.querySelector('.scout-v188-more');
 if(oldSwitch){
  oldSwitch.setAttribute('hidden','');
  oldSwitch.setAttribute('aria-hidden','true');
  oldSwitch.setAttribute('tabindex','-1');
 }
 const mainTitle=panel.querySelector('.scout-v220-headline h2');
 if(mainTitle)mainTitle.textContent='Minha ficha principal';
 const overline=panel.querySelector('.scout-v220-eyebrow');
 if(overline)overline.textContent='CRAQUE TÁTICO · ANÁLISE INDIVIDUAL';
 const technicalTitle=technical.querySelector(':scope > summary');
 if(technicalTitle)technicalTitle.textContent='Análises e histórico · opcionais';
 const brand=doc.querySelector('.brand-copy small');
 if(brand)brand.textContent='FICHA ÚNICA • CINCO TÁTICAS';
 const edition=doc.querySelector('.topbar .edition');
 if(edition)edition.textContent='eFOOTBALL 2027 · CRAQUE TÁTICO';
 const rawTitle=doc.title||'';
 doc.title=rawTitle.replace(SAFE_TITLE,' · Craque Tático').replace(/SCOUT PRO V\d+/gi,'Craque Tático');
 // Não alterar a data, Card ID, PP, a formação, as fontes nem os textos das fichas antigas.
 const status=inspect(doc);
 doc.dispatchEvent(new CustomEvent('craque:card-curated-v229',{
  detail:{archived:status.archived,card:doc.getElementById('scout-v68-data')?.textContent?.length||0}
 }));
 return true;
}
return Object.freeze({SECTION_IDS,collect,inspect,mount});
});