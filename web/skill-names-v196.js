/* Scout PRO V196 — nomenclatura visual de habilidades PT-BR.
   Fonte prioritária: imagens do menu de habilidades eFootball enviadas pelo usuário.
   As habilidades de origem (Card ID, nativas, builds, saves e evidências) NUNCA são editadas.
   Itens sem correspondência inequívoca permanecem com o nome original. */
(function(host){
'use strict';
const LABELS=Object.freeze([
 ['Pedalada simples',['Scissors Feint','Pedalada']],
 ['Toque duplo',['Double Touch']],
 ['Elástico',['Flip Flap']],
 ['Giro 360°',['Marseille Turn','360 graus']],
 ['Chapéu',['Sombrero']],
 ['Corte com virada',['Chop Turn']],
 ['Puxada de letra',['Cut Behind & Turn','Cut Behind Turn','Cut Behind And Turn','Corte para trás e giro']],
 ['Finta de letra',['Scotch Move']],
 ['Controle com a sola',['Sole Control','Controle de domínio']],
 ['Cabeçada',['Heading','Cabeceio']],
 ['Efeito de longe',['Long-range Curler','Long Range Curler','Chute colocado de longa distância','Chute de longe']],
 ['Controle da cavadinha',['Chip Shot Control']],
 ['Precisão à distância',['Long-range Shooting','Long Range Shooting','Chute de longa distância','Finalização de longa distância']],
 ['Chute com o peito do pé',['Knuckle Shot']],
 ['Folha seca',['Dipping Shot']],
 ['Chute ascendente',['Rising Shot']],
 ['Finalização acrobática',['Acrobatic Finishing']],
 ['Toque de calcanhar',['Heel Trick','Passe de calcanhar']],
 ['Chute de primeira',['First-time Shot','First Time Shot','Finalização de primeira']],
 ['Passe de primeira',['One-touch Pass','One Touch Pass']],
 ['Passe em profundidade',['Through Passing','Passe a rasgar']],
 ['Passe na medida',['Weighted Pass','Passe ponderado']],
 // Konami v3.6.0, versões EN/PT-BR: Phenomenal Pass / Passador nato.
 // Nomenclatura de nativa especial; não é uma adicional selecionável.
 ['Passador nato',['Phenomenal Pass','Passe fenomenal']],
 ['Cruzamento preciso',['Pinpoint Crossing']],
 ['Curva para fora',['Outside Curler']],
 ['Passe sem olhar',['No Look Pass']],
 ['Passe aéreo baixo',['Low Lofted Pass','Passe meio levantado']],
 ['Arremesso lateral longo',['Long Throw']],
 ['Especialista em pênalti',['Penalty Specialist']],
 ['Malícia',['Gamesmanship']],
 ['Marcação individual',['Man Marking','Marcação ind.']],
 ['Volta para marcar',['Track Back','Track-back','Recuar para marcar']],
 ['Interceptação',['Interception']],
 ['Afastamento acrobático',['Acrobatic Clearance','Corte acrobático']],
 ['Liderança',['Captaincy','Capitão']],
 ['Super substituto',['Super-sub','Super Sub','Super reserva']],
 ['Espírito guerreiro',['Fighting Spirit']],
 ['Superioridade aérea',['Aerial Superiority']],
 ['Bloqueador',['Blocker']],
 ['Carrinho',['Sliding Tackle']],
 // Termos de goleiro abaixo são comprovados pelo catálogo eFHUB PT-BR;
 // não inferir traduções de habilidades especiais sem correspondência clara.
 ['Reposição baixa do GO',['GK Low Punt','Lançamento rasteiro de goleiro','Repos. baixa do GO']],
 ['Arremesso longo do GO',['GK Long Throw','Lançamento longo de goleiro','Arrem. longo do GO']],
 ['Pegador de pênaltis',['GK Penalty Saver','Defesa de pênalti']]
]);
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const map=new Map();
for(const [label,aliases] of LABELS)for(const raw of [label,...aliases]){
 const key=norm(raw),prior=map.get(key);
 if(prior&&prior!==label)throw Error('Conflito de nomes de skills: '+raw);
 map.set(key,label);
}
const display=raw=>map.get(norm(raw))||String(raw??'');
const supported=raw=>map.has(norm(raw));
function list(raw){
 return String(raw??'').split(/\s*[,;]\s*/).map(v=>display(v.trim())).join(', ');
}
function apply(doc){
 if(!doc?.querySelectorAll)return 0;
 let changed=0;
 const rename=(element,asList=false)=>{
  if(!element?.textContent)return;
  const old=element.textContent;
  const text=asList?list(old):display(old.trim());
  if(old===text||(!asList&&!supported(old)))return;
  if(!element.hasAttribute?.('data-scout-original-skill')){
    element.setAttribute?.('data-scout-original-skill',old);
    // Fonte original preservada no título por transparência.
    if(!element.title)element.title='Nome cadastrado: '+old;
  }
  element.textContent=text;
  changed++;
 };
 for(const node of doc.querySelectorAll('.skill-cloud .skill, #scout-v184-evidence ul li'))rename(node);
 for(const node of doc.querySelectorAll('.v68-skill p')){
  if(node.textContent.includes(','))rename(node,true);
 }
 for(const box of doc.querySelectorAll('.soft-panel')){
  const label=box.querySelector('b');
  if(!label||!/habilidades adicionais candidatas/i.test(label.textContent))continue;
  const target=label.nextElementSibling;
  if(target&&target.textContent?.includes(','))rename(target,true);
 }
 return changed;
}
function start(){
 const doc=host?.document;
 if(!doc||doc.body?.dataset.page!=='detail')return;
 apply(doc);
 if(typeof host.MutationObserver!=='function')return;
 let busy=false;
 const observer=new host.MutationObserver(mutations=>{
  if(busy||!mutations.some(m=>m.type==='childList'&&m.addedNodes?.length))return;
  busy=true;
  try{apply(doc)}finally{busy=false}
 });
 observer.observe(doc.querySelector('.profile-content')||doc.body,{childList:true,subtree:true});
}
const api=Object.freeze({LABELS,norm,display,supported,list,apply});
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_SKILL_NAMES_V196=api;
if(!host?.document)return;
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})(typeof window!=='undefined'?window:null);
