// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V263: função efetiva só após V246 por CAP/Card ID, sincronizada em
 * PP (V251), habilidades/ímpetos (V162) e painel principal (V220).
 * As seleções são temporárias: nenhuma carta/build/save é alterado.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.resolve(__dirname,'..',p),'utf8');
const source=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(source).cards;
const V=require('../web/craque-ficha-individual-v251.js');
const P=require('../web/scout-position-training-v246.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const R=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const styles=['posse','normal','rapido','fora','longo'];
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const before=JSON.stringify(cards);
const memory=new Map();
const store={getItem:key=>memory.has(key)?memory.get(key):null,
 setItem:(key,value)=>memory.set(key,String(value)),
 removeItem:key=>memory.delete(key)};
const martinelli=cards.find(x=>x.numero===191);
assert(martinelli&&martinelli.posicao==='PTE'&&martinelli.max_level===26&&martinelli.pp===50);
const rawText=read('web/'+martinelli.arquivo);
const parsed=(id)=>JSON.parse(rawText.match(new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1]);
const raw=parsed('scout-v68-data'),lab=parsed('lab-data');
const original=V.confirmedRole(martinelli,'PTE',P,store);
assert.deepEqual(original,{position:'PTE',evidence:'original',eligible:true});
assert.deepEqual(V.confirmedRole(martinelli,'CA',P,store),
 {position:'PTE',evidence:'original',eligible:false,rejected:'CA'},
 'OVR alto em CA não confirma posição');
assert.equal(V.confirmedRole(martinelli,'GO',P,store).eligible,false);
assert.equal(V.confirmedRole(martinelli,'CA',null,store).eligible,false);
P.confirm(martinelli,'CA',true,store);
const trained=V.confirmedRole(martinelli,'CA',P,store);
assert.deepEqual(trained,{position:'CA',evidence:'treinada',eligible:true});
for(const tactic of styles){
 const review=V.buildReview(martinelli,raw,lab,cards,tactic,{
  positionTraining:P,targetPosition:trained.position,store
 });
 assert.equal(review.positionUsed,'CA');
 assert.equal(review.positionEvidence,'treinada');
 assert.equal(review.pp,50);
 const data={capture:martinelli.numero,id:martinelli.id,shown_position:trained.position,
  role_used:trained.position,posicao:trained.position,
  native_skills:martinelli.habilidades_nativas,
  attack_style:martinelli.estilo_ataque,
  defence_style:martinelli.estilo_defesa,
  boost1:martinelli.impeto_fixo,boost2:martinelli.impeto_extra,
  recommended_levels:martinelli.niveis};
 assert.equal(R.roleOf(data),'CA');
 assert.equal(T.roleOf(data),'CA');
 const additional=R.evaluate(data,tactic,'');
 assert.equal(additional.role,'CA');
 assert.equal(additional.slotsRemaining,null);
 const booster=R.booster(data,tactic,B);
 assert(booster.primary);
 const same=B.rank({...data,posicao:'CA'},tactic);
 assert.equal(booster.primary.nome,same[0]?.nome);
 const nativeV188=R.evaluate({...data,shown_position:'PTE',role_used:'PTE'},tactic,'');
 assert.equal(nativeV188.role,'ALA');
}
const otherEdition={...martinelli,id:'CARTA_DIFERENTE',numero:191};
assert.equal(V.confirmedRole(otherEdition,'CA',P,store).eligible,false);
const otherCAP={...martinelli,numero:190};
assert.equal(V.confirmedRole(otherCAP,'CA',P,store).eligible,false);
P.confirm(martinelli,'CA',false,store);
assert.equal(V.confirmedRole(martinelli,'CA',P,store).eligible,false,
 'Revogação remove a elegibilidade da função');
P.confirm(martinelli,'SA',true,store,'familiar');
assert.deepEqual(V.confirmedRole(martinelli,'SA',P,store),
 {position:'SA',evidence:'familiar',eligible:true});
P.confirm(martinelli,'SA',false,store,'familiar');
assert.equal(V.confirmedRole(martinelli,'SA',P,store).eligible,false);
let verified=0;
for(const c of cards){
 const sourceRole=V.confirmedRole(c,c.posicao,P,store);
 assert.equal(sourceRole.eligible,true);
 assert.equal(sourceRole.position,P.pos(c.posicao)||String(c.posicao||''));
 for(const tactic of styles){
  assert.equal(R.roleOf({shown_position:sourceRole.position,role_used:sourceRole.position}),
   R.roleOf({shown_position:c.posicao}),'Função original mantida');
  verified++;
 }
}
assert.equal(verified,1230);
const panel=read('web/craque-ficha-individual-v251.js');
const skills=read('web/skills-booster-v162.js');
const main=read('web/scout-card-unified-v220.js');
assert(panel.includes("scoutpro:role-selected-v263"));
assert(panel.includes("host.addEventListener('craque:data-changed'"));
assert(panel.includes("if(!choice.eligible)positionSelected=null"));
assert(skills.includes("host.addEventListener('scoutpro:role-selected-v263'"));
assert(skills.includes('d.shown_position=requested;d.role_used=requested;'));
assert(skills.includes('Função analisada: '));
assert(main.includes("host.addEventListener('scoutpro:role-selected-v263'"));
assert(main.includes('card.shown_position=wanted;card.role_used=wanted;'));
assert(main.includes('updateRecommendations();switchTraining(style);'));
assert(skills.includes('Por Fora</button>')&&skills.includes('Passe Longo</button>'),
 'Português do eFootball deve ser consistente no painel');
assert(read('web/sw.js').includes('v263-confirmed-role'));
assert(read('package.json').includes('test-confirmed-role-v263.cjs'));
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),source);
console.log('V263 PASS: '+verified+' verificações sem misturar cartas; Martinelli PTE → CA apenas com V246; cinco táticas e revogação testadas.');
