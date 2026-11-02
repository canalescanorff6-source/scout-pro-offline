'use strict';
const a=require('node:assert/strict'),A=require('../web/craque-accounts-v382.js'),C=require('../web/craque-team-context-v382.js');
const deps={tactical:require('../web/scout-multitactic-engine-v220.js'),training:require('../web/craque-friends-training-v228.js'),individual:require('../web/craque-ficha-individual-v251.js'),interpretation:require('../web/craque-role-intelligence-v233.js'),skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
const formation=require('../web/ct382-formations.json').formations[0];
const cards=formation.slots.map((s,i)=>({...A.normalCard({id:'p'+i,name:'Jogador '+i,position:s.position,maxLevel:31,pp:60,edition:'A',skillCapacity:5,skillsVerified:true}),accountId:'secondary'}));
const opts={accountId:'secondary',style:'rapido',formation,lineup:Object.fromEntries(formation.slots.map((s,i)=>[s.id,cards[i].id])),instructions:[]};
const failures=[];function test(name,f){try{f();console.log('PASS '+name);}catch(e){failures.push(name+': '+e.message);console.log('FAIL '+name);}}
test('capacity identity reference invalidation',()=>{
 const ctx=C.compile(opts,cards),changed=cards.map(c=>({...c,skillCapacity:0}));a.notEqual(C.compile(opts,changed).signature,ctx.signature);
 a.notEqual(C.compile(opts,cards.map(c=>({...c,identityVerified:true}))).signature,ctx.signature);
 a.notEqual(C.compile(opts,cards.map(c=>({...c,reference:{identityUsable:true,reference:{maxPP:60}}}))).signature,ctx.signature);
});
test('fixed progression on sixth style',()=>{
 const raw=require('../web/SCOUT_V69_AUDITORIA.json').cards.find(c=>c.numero===126),ref=require('../web/ct376-card-references.json').cards.find(c=>c.capture===126);
 const c=A.roster('primary',{originals:[raw],references:[ref],positional:require('../web/craque-positional-v311.js')},null)[0];
 const primary=cards.map(x=>({...x,accountId:'primary'})),at=formation.slots.findIndex(s=>s.position===c.position);primary[at]=c;
 const opt={...opts,accountId:'primary',style:'overload',lineup:Object.fromEntries(formation.slots.map((s,i)=>[s.id,primary[i].id]))};
 const r=C.recommend(C.compile(opt,primary),deps).cards.find(x=>x.memberId===c.id).review;
 a.equal(r.fixedProgression,true);a.equal(r.canSave,false);a.equal(r.skills.length,0);a.equal(r.boosters.length,0);
});
test('booster observations cannot rebind identity',()=>{
 const first=A.normalCard({id:'keeper',name:'Goleiro',edition:'A',cardId:'12345678',position:'GO',fixedBoosters:[{name:'Goleiro',value:4,verified:true,source:'Edition A'}],extraBooster:{name:'Goleiro',value:1,verified:true,source:'Edition A'},boosterSlotSupported:true});
 const changed=A.normalCard({...first,edition:'B',cardId:'12345679'});
 a.equal(C.boosterProof({...changed,accountId:'secondary'}).confirmedDistinctSlots,false);
 a.equal(changed.fixedBoosters[0].verified,false);a.equal(changed.extraBooster.verified,false);
});
test('compatible formation transitions preserve team locks and instructions',()=>{
 const ins=[{phase:'attack',type:'defensive',instanceId:cards[4].id}],out=C.transitionFormation({...opts,locks:{ld:cards[4].id},instructions:ins},{...formation,id:'next'},cards);
 a.deepEqual(out.lineup,opts.lineup);a.deepEqual(out.instructions,ins);a.equal(out.locks.ld,cards[4].id);
});
test('defensive instructions inform functions and coverage',()=>{
 const target=cards[9].id;
 const counter=C.compile({...opts,instructions:[{phase:'defence',type:'counter_target',instanceId:target}]},cards);
 a.match(counter.members.find(m=>m.card.id===target).role.defence,/frente|recomposi|contra-ataque/i);
 const marked=C.compile({...opts,instructions:[{phase:'defence',type:'man_marking',instanceId:target,target:'Atacante adversário'}]},cards);
 a.match(marked.members.find(m=>m.card.id===target).role.defence,/Atacante adversário/);
 a(C.recommend(counter,deps).balance.warnings.some(s=>/alvo|recomposi/i.test(s)));
});
test('stale history remains readable and exportable',()=>{
 const ctx=C.compile(opts,cards),plan=C.recommend(ctx,deps),state=C.historyState({...plan,stale:true},ctx);
 a.equal(state.readOnly,true);a.equal(state.canExport,true);a.equal(C.historyState(plan,ctx).readOnly,false);
 a.equal(C.historyState(plan,C.compile({...opts,style:'normal'},cards)).readOnly,true);
 a(C.exportText({...plan,historicalReadOnly:true}).includes('Histórico'));
});
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('V382 REVIEW REGRESSIONS PASS: seis achados reproduzidos e protegidos.');
