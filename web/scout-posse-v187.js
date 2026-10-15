/* Scout PRO V187 — uma ficha principal, detalhes sob demanda e biotipo de fonte identificada. */
(function(host){
'use strict';
const KEY='scoutpro:v187:full-analysis';
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function matchPhysical(capture,archive){
 const list=Array.isArray(archive?.visual_observations)?archive.visual_observations:[];
 return list.filter(x=>Number(x.candidate_cap)===Number(capture));
}
function compactModel(entry){
 if(!entry)return null;
 const m=entry.model_measures||{};
 return {
  height:entry.height_cm??null,weight:entry.weight_kg??null,
  weakFoot:entry.weak_foot_usage||null,weakAccuracy:entry.weak_foot_accuracy||null,
  form:entry.form||null,injury:entry.injury_resistance||null,
  leg:m.leg_coverage_radius??null,arm:m.arm_coverage_radius??null,
  jump:m.jump_height??null,collision:m.trunk_collision??null,
  source:entry.filename||null,cardIdSeen:false
 };
}
if(typeof module!=='undefined'&&module.exports)module.exports={KEY,normalize,matchPhysical,compactModel};
const document=host?.document;if(!document||document.body?.dataset.page!=='detail')return;
function setup(){
 if(document.getElementById('scout-posse-main'))return;
 const container=document.querySelector('.profile-content');
 const el=document.getElementById('scout-v68-data');if(!el||!container)return;
 let d;try{d=JSON.parse(el.textContent)}catch(e){return}
 const panel=document.createElement('section');panel.id='scout-posse-main';panel.setAttribute('aria-label','Minha ficha principal de Posse de Bola');
 panel.style.cssText='border:1px solid #3a857f;border-radius:17px;background:linear-gradient(145deg,#123743,#0a1a2c);padding:17px;margin:0 0 15px;color:#f0fbff';
 const title=document.createElement('h2');title.textContent='Minha ficha principal · Posse de Bola';title.style.cssText='font-size:19px;margin:0 0 8px';
 const intro=document.createElement('p');intro.textContent='Esta é a ficha para consultar primeiro. Os relatórios antigos continuam disponíveis, mas não substituem os níveis e PP já registrados.';
 intro.style.cssText='font-size:12px;color:#c4dbe5;line-height:1.5;margin:0 0 12px';
 const grid=document.createElement('div');grid.className='scout-posse-facts';
 const fact=(label,value)=>{const box=document.createElement('div');box.className='scout-posse-fact';const small=document.createElement('small');small.textContent=label;const big=document.createElement('strong');big.textContent=value;box.append(small,big);grid.appendChild(box)};
 const original=d.role_used||d.shown_position||'Ver ficha';
 fact('Uso prioritário',original+' · Posse central');
 fact('Treinamento usado','Cenário '+String(d.recommended_scenario||'A')+' · '+d.pp+' PP registrados');
 fact('Habilidades e ímpeto','Recomendações logo abaixo ↓');
 const notice=document.createElement('p');notice.style.cssText='font-size:11px;color:#b1cdda;line-height:1.6;margin:10px 0';
 notice.textContent='Não estamos otimizando Overall. Habilidades e ímpetos são recomendações condicionadas à edição e aos espaços realmente disponíveis.';
 const morphology=document.createElement('div');morphology.className='scout-posse-body';
 const h=document.createElement('strong');h.textContent='Biotipo e características da carta';
 const info=document.createElement('p');info.textContent='Conferindo evidências do seu eFHUB…';info.style.cssText='font-size:12px;line-height:1.6;color:#cfdfeb';
 morphology.append(h,info);
 const controls=document.createElement('div');controls.className='scout-posse-actions';
 const skillsLink=document.createElement('a');skillsLink.href='#scout-v162';skillsLink.textContent='Ver 5 habilidades + melhor ímpeto ↓';
 const full=document.createElement('button');full.type='button';full.className='scout-posse-all';
 let expanded=false;try{expanded=host.localStorage.getItem(KEY)==='1'}catch(e){}
 function toggle(next){expanded=next;document.body.classList.toggle('scout-posse-compact',!expanded);
 full.setAttribute('aria-expanded',String(expanded));
 full.textContent=expanded?'Ocultar relatórios antigos':'Ver análises detalhadas (opcional)';
 try{host.localStorage.setItem(KEY,expanded?'1':'0')}catch(e){}}
 full.addEventListener('click',()=>toggle(!expanded));
 controls.append(skillsLink,full);
 panel.append(title,intro,grid,notice,morphology,controls);
 container.prepend(panel);toggle(expanded);
 const link=document.createElement('a');link.href='../player-model-v101.html?c='+Number(d.capture);link.textContent='Abrir laboratório físico / Player ID (dados documentais) ↗';link.style.cssText='display:block;margin-top:8px;color:#9ae3d0;font-size:12px';
 morphology.appendChild(link);
 const get=(value,unit='')=>value!==null&&value!==undefined?String(value)+unit:'não transcrito';
 fetch('../SCOUT_V184_EFHUB_241_COMPLETE.json').then(res=>{if(!res.ok)throw Error('base local indisponível');return res.json()}).then(archive=>{
  const matches=matchPhysical(d.capture,archive);
  info.replaceChildren();
  if(matches.length!==1){
   info.textContent='Este CAP possui '+matches.length+' observação(ões) físicas candidatas no acervo. Sem ligação segura de edição não vou misturar peso, braço, ombro ou pé fraco de outra carta. Consulte o laboratório físico e os prints originais.';
   return;
  }
  const x=compactModel(matches[0]);
  const para=document.createElement('p');
  para.textContent='Print: '+x.source+' · Estatura '+get(x.height,' cm')+' · Peso '+get(x.weight,' kg')+'. Pé fraco: uso '+get(x.weakFoot)+', precisão '+get(x.weakAccuracy)+'. Forma física: '+get(x.form)+' · Lesões: '+get(x.injury)+'.';
  info.appendChild(para);
  const measures=document.createElement('p');
  measures.textContent='Modelo no eFHUB — alcance das pernas '+get(x.leg,' cm')+' · braços '+get(x.arm,' cm')+' · salto '+get(x.jump,' cm')+' · colisão do tronco '+get(x.collision,' cm')+'.';
  info.appendChild(measures);
  const caution=document.createElement('p');caution.textContent='Esses valores foram observados no simulador e não autenticam Player ID oculto, animação em partida ou os slots da sua conta.';
  caution.style.color='#f2d5a7';info.appendChild(caution);
 }).catch(()=>{info.textContent='Dados físicos não disponíveis nesta instalação. Os níveis, PP e artes originais permanecem intactos.'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
else setup();
})(typeof window!=='undefined'?window:null);
