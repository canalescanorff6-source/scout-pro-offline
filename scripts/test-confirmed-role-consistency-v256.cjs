'use strict';
/* V256 — uma mesma FUNÇÃO de jogo confirmada para build, habilidades,
 * ímpeto e interpretação. Nenhuma mutação de carta ou inferência por OVR. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cSource=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(cSource).cards;
const V=require('../web/craque-ficha-individual-v251.js');
const P=require('../web/scout-position-training-v246.js');
const R=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const T=require('../web/scout-multitactic-engine-v220.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>String(c.numero)+'@'+String(c.id))).size,246);
const copy=JSON.stringify(cards);
const martinelli=cards.find(c=>c.numero===191);
assert(martinelli);
assert.equal(martinelli.id,'105850811319718');
assert.equal(martinelli.posicao,'PTE');
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
const storeMap=new Map();
const store={
 getItem:key=>storeMap.has(key)?storeMap.get(key):null,
 setItem:(key,value)=>storeMap.set(key,String(value)),
 removeItem:key=>storeMap.delete(key)
};
const initial=V.activeRole(martinelli,P,store);
assert.deepEqual(initial,{role:'PTE',status:'original',confirmed:true});
assert.throws(()=>V.setActiveRole(martinelli,'CA',P,store),
 /Posição não confirmada/,'OVR de CA não comprova posição habilitada');
assert.equal(V.activeRole(martinelli,P,store).role,'PTE');
const unsupported=V.activeRole({...martinelli,id:''},P,store);
assert.equal(unsupported.confirmed,false);
P.confirm(martinelli,'CA',true,store);
const selected=V.setActiveRole(martinelli,'CA',P,store);
assert.deepEqual(selected,{role:'CA',status:'treinada',confirmed:true});
assert.deepEqual(V.activeRole(martinelli,P,store),selected);
const rawCard={capture:191,id:martinelli.id,shown_position:'PTE'};
assert.deepEqual(V.activeRole(rawCard,P,store),selected,
 'Painéis usam a mesma edição, mesmo quando raw mostra PTE');
const altered={...rawCard,id:'versao-outra-do-martinelli'};
assert.equal(V.activeRole(altered,P,store).role,'PTE',
 'Não transferir confirmação nem função selecionada a outra edição');
const html=read('web/'+martinelli.arquivo);
const raw=JSON.parse(html.match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const lab=JSON.parse(html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const review=V.buildReview(martinelli,raw,lab,cards,'posse',{
 targetPosition:selected.role,positionTraining:P,store
});
assert.equal(review.status,'complete');
assert.equal(review.role,'CA');
assert.equal(review.positionEvidence,'treinada');
assert.equal(review.positionUsed,'CA');
assert.equal(review.pp,50);
assert(review.proposal&&T.total(review.proposal.levels)===50);
assert.equal(review.proposal.source,'hipotese_matematica_v251_sem_status_finais');
const d={
 capture:191,id:martinelli.id,shown_position:'PTE',
 attack_style:martinelli.estilo_ataque,defence_style:martinelli.estilo_defesa,
 native_skills:martinelli.habilidades_nativas,
 boost1:martinelli.impeto_fixo,boost2:martinelli.impeto_extra,
 recommended_levels:martinelli.niveis
};
const effective={...d,shown_position:selected.role,role_used:selected.role};
assert.equal(R.roleOf(d),'ALA');
assert.equal(R.roleOf(effective),'CA');
for(const mode of ['posse','normal','rapido','fora','longo']){
 const skills=R.evaluate(effective,mode,'');
 assert.equal(skills.role,'CA');
 assert.equal(skills.equippedConfirmed,false);
 assert.equal(skills.slotsRemaining,null);
 const boost=R.booster(effective,mode,B);
 assert(boost.primary);
 const exact=B.rank({...d,posicao:'CA'},mode);
 assert.equal(boost.primary.nome,exact.filter(x=>x.nome!==d.boost1)[0]?.nome,
  'Ímpeto deve ser ranqueado para a função CA, não ponta');
}
assert.deepEqual(V.setActiveRole(martinelli,'PTE',P,store),
 {role:'PTE',status:'original',confirmed:true});
assert.equal(V.activeRole(martinelli,P,store).role,'PTE');
V.setActiveRole(martinelli,'CA',P,store);
P.confirm(martinelli,'CA',false,store);
assert.deepEqual(V.activeRole(martinelli,P,store),
 {role:'PTE',status:'original',confirmed:true},
 'Revogação no V246 invalida função selecionada automaticamente');
assert.equal(V.activeRole(rawCard,P,store).role,'PTE');
assert.equal(JSON.stringify(cards),copy);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),cSource);
const page=read('web/craque-ficha-individual-v251.js');
const skillsUi=read('web/skills-booster-v162.js');
const one=read('web/scout-card-unified-v220.js');
const sw=read('web/sw.js');
assert(page.includes('scoutpro:role-selected-v256'));
assert(page.includes('setActiveRole(card,select.value,posApi,host.localStorage)'));
assert(one.includes("doc.addEventListener('scoutpro:role-selected-v256'"));
assert(one.includes('nativeDetails(tacticalCard,style)'));
assert(one.includes('interpret(tacticalCard,style,lab)'));
assert(skillsUi.includes("document.addEventListener('scoutpro:role-selected-v256'"));
assert(skillsUi.includes('result=evaluate(effective,tactic,extra'));
assert(skillsUi.includes('booster(effective,tactic'));
assert(skillsUi.includes('data-tactic="fora" aria-pressed="false">Por Fora'));
assert(skillsUi.includes('data-tactic="longo" aria-pressed="false">Passe Longo'));
assert(sw.includes('v256-confirmed-role-consistency'));
assert(read('package.json').includes('test-confirmed-role-consistency-v256.cjs'));
console.log('V256 OK: 246 cartas preservadas, Martinelli PTE→CA somente após V246, 50 PP e cinco estilos.');
console.log('V256 OK: skills e ímpeto seguem a função CA; revogação/edição distinta volta a PTE sem alterar carta.');
