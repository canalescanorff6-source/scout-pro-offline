(()=>{'use strict';
const positions=[['CA','Centroavantes'],['SA','Segundos atacantes'],['PTD','Pontas direitas'],['PTE','Pontas esquerdas'],['MAT','Meias atacantes'],['MLD','Meias direitas'],['MLE','Meias esquerdas'],['MLG','Meias centrais'],['VOL','Volantes'],['LD','Laterais direitos'],['LE','Laterais esquerdos'],['ZG','Zagueiros'],['GO','Goleiros']];
const accepted=new Set(positions.map(([id])=>id));
const aliases={AC:'CA',MC:'MLG',MDF:'VOL',DE:'LE',DD:'LD',DC:'ZG',ZC:'ZG',GR:'GO',MO:'MAT',ME:'MLE'};
const rank=Object.fromEntries(positions.map(([p],i)=>[p,i]));
window.SCOUT_POSITION_ORDER=rank;
const catalog=document.getElementById('cards'),roles=document.getElementById('roles'),sort=document.getElementById('sort');
if(!catalog||!roles||!sort)return;
const items=Array.from(catalog.querySelectorAll('.player-card')),count=Object.fromEntries(positions.map(([p])=>[p,0]));
for(const el of items){
 const matches=[...(el.dataset.search||'').matchAll(/\b(AC|CA|SA|PTD|PTE|MAT|MLD|MLE|MLG|VOL|LD|LE|ZC|ZG|GO|MC|MDF|DE|DD|DC|GR|MO|ME)\s*\/\s*(?:CA|SA|PONTA|ALA|MAT|MLD|MLE|MLG|VOL|LD|LE|ZC|ZG|GO|OUTRA)\b/g)];
 const raw=matches.length?matches[matches.length-1][1]:(el.dataset.role||'');
 const value=aliases[raw]||raw;
 const actual=accepted.has(value)?value:(el.dataset.role==='PONTA'?'PTE':el.dataset.role==='ALA'?'MLE':el.dataset.role);
 el.dataset.position=actual;el.dataset.role=actual;count[actual]=(count[actual]||0)+1;
 const role=el.querySelector('.player-role');if(role)role.textContent=role.textContent.replace(/^[A-ZÁÀ]{2,5}(?=\s*·)/,actual);
}
roles.replaceChildren();
for(const [id,label] of [['TODOS','Todas as posições'],...positions]){
 const button=document.createElement('button');button.className='filter'+(id==='TODOS'?' active':'');button.type='button';
 button.dataset.value=id;button.setAttribute('aria-pressed',id==='TODOS'?'true':'false');
 button.title=label;button.textContent=id==='TODOS'?'Todos · '+items.length:id+' · '+(count[id]||0);roles.appendChild(button);
}
roles.setAttribute('aria-label','Filtrar pela posição original da carta, na ordem personalizada');
const option=document.createElement('option');option.value='position';option.textContent='Posição • CA até GO';
sort.insertBefore(option,sort.firstElementChild);sort.value='position';
// Filtro por estilo de jogo real das fichas V76, sem atribuições por posição.
const tools=document.querySelector('.tools');
if(tools&&!document.getElementById('style-filter')){
 // V326: as 246 cartas do HTML têm CAP/ID, mas a fonte dos estilos é
 // o cadastro V69, carregado separadamente. Não lançar erro antes de ter a
 // fonte nem inventar estilo a partir de posição/Overall.
 const counts=new Map();
 // O build V76 já distribui data-style e data-style-defense validados.
 // Preservar esses atributos sempre. Fallback apenas para HTML não carimbado.
 for(const el of items){
  const primary=el.dataset.style;
  if(!primary)continue;
  const unique=new Set([primary,el.dataset.styleDefense].filter(Boolean));
  for(const style of unique)counts.set(style,(counts.get(style)||0)+1);
 }
 const container=document.createElement('div');container.className='scout-style-picker';
 const caption=document.createElement('label');caption.htmlFor='style-filter';caption.textContent='Estilo de jogo';
 const select=document.createElement('select');select.id='style-filter';select.className='select scout-style-select';
 select.setAttribute('aria-label','Filtrar jogadores por estilo de jogo');
 const initial=document.createElement('option');initial.value='TODOS';
 initial.textContent='Carregando estilos confirmados…';select.appendChild(initial);
 container.appendChild(caption);container.appendChild(select);
 tools.insertBefore(container,sort);
 const token=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 fetch('SCOUT_V69_AUDITORIA.json').then(r=>{
  if(!r.ok)throw Error('Catálogo de estilos indisponível');return r.json();
 }).then(data=>{
  if(!Array.isArray(data.cards)||data.cards.length!==246)
   throw Error('A lista de estilos não corresponde às 246 cartas');
  const byCap=new Map(data.cards.map(card=>[String(card.numero),card]));
  counts.clear();
  for(const el of items){
   const card=byCap.get(el.dataset.cap);
   // Confirmar a identidade (número + nome); conflito não dá direito a inferir.
   if(!card||token(card.name)!==token(el.dataset.name)){el.dataset.styleStatus='pendente';continue}
   // Nunca sobrepor estilos já confirmados e carimbados pelo build V76.
   if(el.dataset.style){el.dataset.styleStatus='catalogado';continue}
   // Quando faltar o atributo no HTML bruto, mostrar somente o estilo
   // explicitamente disponível no cadastro (sem criar dupla função).
   const atk=String(card.playing_style||card.estilo_ataque||'').trim();
   const def=card.dual_playing_style===true?String(card.defence_style||card.estilo_defesa||'').trim():'';
   if(!atk){el.dataset.styleStatus='pendente';continue}
   el.dataset.style=atk;
   if(def)el.dataset.styleDefense=def;
   el.dataset.styleStatus='catalogado';
   for(const style of new Set([atk,def].filter(Boolean)))
    counts.set(style,(counts.get(style)||0)+1);
  }
  const remembered=select.value;
  select.replaceChildren();
  const every=document.createElement('option');every.value='TODOS';
  every.textContent='Todos os estilos · '+items.length;select.append(every);
  for(const [style,total] of [...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0],'pt-BR'))){
   const opt=document.createElement('option');opt.value=style;
   opt.textContent=style+' · '+total;select.append(opt);
  }
  const hash=new URLSearchParams(location.search).get('style');
  const chosen=[...select.options].some(o=>o.value===hash)?hash:remembered;
  if(chosen&&[...select.options].some(o=>o.value===chosen)){
   select.value=chosen;if(chosen!=='TODOS')select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  container.dataset.ready='true';
 }).catch(()=>{
  initial.textContent='Estilos indisponíveis · veja todas as cartas';
  container.dataset.ready='pending';
  // Falha na fonte não trava busca, posição ou visualização de cartas.
 });
}
const summary=document.createElement('div');summary.className='scout-role-overview';
summary.textContent='Ordem personalizada por posição original da carta · use os filtros para acessar cada grupo.';
roles.insertAdjacentElement('afterend',summary);
})();