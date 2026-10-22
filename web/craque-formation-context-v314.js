/* V314 · vaga da formação determina a POSIÇÃO DE USO da análise; não modifica o elenco. */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_FORMATION_CONTEXT_V314=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const PLANS=Object.freeze({
 '4312':Object.freeze([['go','GO'],['le','LE'],['zge','ZG'],['zgd','ZG'],['ld','LD'],
  ['vole','VOL'],['vold','VOL'],['mlg','MLG'],['mat','MAT'],['cae','CA'],['cad','CA']]),
 '4213':Object.freeze([['go','GO'],['le','LE'],['zge','ZG'],['zgd','ZG'],['ld','LD'],
  ['vole','VOL'],['vold','VOL'],['mat','MAT'],['sa','SA'],['cae','CA'],['cad','CA']])
});
const LABELS=Object.freeze({go:'Goleiro',le:'Lateral esquerdo',ld:'Lateral direito',
 zge:'Zagueiro esquerdo',zgd:'Zagueiro direito',vole:'Volante esquerdo',
 vold:'Volante direito',mlg:'Meio-campista',mat:'Meia-atacante',sa:'Segundo atacante',
 cae:'Centroavante esquerdo',cad:'Centroavante direito'});
const modes=Object.freeze(['posse','normal','rapido','fora','longo']);
function slotPosition(id,slot){
 return PLANS[id]?.find(x=>x[0]===slot)?.[1]||null;
}
function slots(id){
 if(!PLANS[id])throw Error('Formação não cadastrada');
 return PLANS[id].map(([slot,position])=>({slot,position,label:LABELS[slot]}));
}
function context(options,api){
 const eng=api||host?.CRAQUE_POSITIONAL_V311;
 const {collection,card,owner,formation,slot,style,manager}=options||{};
 if(!eng?.compute||!card)throw Error('Carta ou motor posicional indisponível');
 const position=slotPosition(formation,slot);
 if(!position||!modes.includes(style))throw Error('Vaga ou estilo inválido');
 // Adapter único evita alterar as 246 cartas e isola as fichas de terceiros.
 const model=collection==='minhas-cartas'?eng.fromPersonal(card):collection==='outros-elencos'?
  eng.fromExternal(card,owner):null;
 if(!model)throw Error('Tipo de acervo desconhecido');
 const scenario=eng.compute(model,position,style,manager||'');
 return {model,scenario,slot,formation,position,originalPosition:model.position,
  eligible:scenario.compatibility.eligible,
  disclaimer:scenario.compatibility.eligible?
   'Posição documentada; consulte também o estilo e os requisitos da edição.':
   'SIMULAÇÃO: posição alternativa sem familiaridade comprovada nesta edição. Não altera a carta nem o elenco.'};
}
function ui(target,options){
 if(!target||!host?.document)throw Error('Interface indisponível');
 const optionsFor=slots(options.formation);
 const element=host.document.createElement('label');
 element.className='ct314-slot-label';element.textContent='Analisar nesta vaga: ';
 const select=host.document.createElement('select');
 select.className='ct314-slot-select';select.setAttribute('aria-label','Posição efetiva na formação');
 for(const option of optionsFor){
  const o=host.document.createElement('option');
  o.value=option.slot;o.textContent=option.label+' · '+option.position;
  select.append(o);
 }
 element.append(select);target.append(element);
 const change=()=>{const pos=slotPosition(options.formation,select.value);if(pos)options.onSelect?.(pos,select.value)};
 select.addEventListener('change',change);
 return {select,setSlot(slot){if(slotPosition(options.formation,slot)){select.value=slot;change()}},
  destroy(){element.remove()}};
}
return Object.freeze({PLANS,LABELS,modes,slotPosition,slots,context,ui});
});
