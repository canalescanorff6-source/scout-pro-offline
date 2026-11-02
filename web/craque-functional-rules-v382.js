/* Regras funcionais opt-in por instância/contexto. Não migra comprovantes legados. */
(function(w,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;if(w)w.CRAQUE_FUNCTIONAL_RULES_V382=a;})(typeof window!=='undefined'?window:null,function(){'use strict';
function bound(card,p,schema){return p?.schema===schema&&['primary','secondary'].includes(card.accountId)&&p.accountId===card.accountId&&
 p.localKey===card.localKey&&p.cardId===String(card.cardId||'')&&p.edition===String(card.edition||'');}
function allowed(role,card,legacy){
 const old=legacy||(role==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6]);
 if(!bound(card,card.functionalTrainingProof,'CRAQUE_FUNCTIONAL_GROUPS_V382'))return old.slice();
 return role==='GO'?[1,2,3,4,5,7,8,9]:[0,1,2,3,4,5,6,7];
}
function stackingAllowed(card,name,normalize=x=>String(x).trim().toLowerCase()){
 const p=card.boosterSlotsProof;if(!bound(card,p,'CRAQUE_DISTINCT_BOOSTER_SLOTS_V382')||p.confirmedDistinctSlots!==true)return false;
 const slots=p.slots;if(!Array.isArray(slots)||slots.length!==2||slots[0].slot!=='fixed'||slots[1].slot!=='selectable')return false;
 return slots.every(s=>s.verified===true&&Number.isInteger(s.value)&&s.value>=1&&s.value<=5)&&
  normalize(slots[0].name)===normalize(card.fixedBooster)&&normalize(slots[1].name)===normalize(name);
}
return Object.freeze({bound,allowed,stackingAllowed});});
