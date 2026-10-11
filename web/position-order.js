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
const summary=document.createElement('div');summary.className='scout-role-overview';
summary.textContent='Ordem personalizada por posição original da carta · use os filtros para acessar cada grupo.';
roles.insertAdjacentElement('afterend',summary);
})();