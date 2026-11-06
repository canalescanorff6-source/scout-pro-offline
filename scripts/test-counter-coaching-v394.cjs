'use strict';
/* Regression: guidance must follow real formation slots and never spend instruction
 * capacity on a removed command or mark a rival whose target is unknown. */
const assert=require('node:assert/strict');
const tactics=require('../web/craque-tactics-v230.js');
const forms=require('../web/SCOUT_V177_DUAS_FORMACOES.json').formations;
const snapshots=new Set();
for(const f of forms)for(const mode of ['normal','rapido']){
 const before=JSON.stringify(f);
 const guide=tactics.counterGuide(mode,f.id);
 assert(Array.isArray(guide.decisions),'V394 must return actionable recovery/attack/defence decisions');
 assert.deepEqual(guide.decisions.map(d=>d.id),['recovery','central-block','sprint','pass-shot','failed-press','through-ball']);
 for(const d of guide.decisions){
  assert(d.when&&d.action&&d.avoid,'Every decision exposes a condition, action and mistake');
  assert(Object.isFrozen(d));
 }
 assert.equal(guide.instructions.attack.length,2);
 assert.equal(guide.instructions.defence.length,2);
 const actualSlots=f.starters.map(p=>p.slot);
 for(const item of [...guide.instructions.attack,...guide.instructions.defence]){
  assert(item.when&&item.cost&&item.leaveUnused,'Opportunity cost and unused-slot condition required');
  assert(item.slot===null||actualSlots.includes(item.slot),'Recommendations address this formation only');
  assert([null,'Defensivo','Ancoragem','Alvo de contra-ataque','Marcação individual'].includes(item.type));
  assert(!item.type?.includes('Marcação'),'Without a rival target no marking instruction can be proposed');
 }
 const targetGuide=tactics.counterGuide(mode,f.id,null,{opponentTarget:'MAT rival'});
 const mark=targetGuide.instructions.defence.find(i=>i.type==='Marcação individual');
 assert(mark&&mark.target==='MAT rival','Marking becomes available only with an explicit opponent target');
 assert(actualSlots.includes(mark.slot));
 assert.equal(tactics.counterGuide(mode,f.id,null,{opponentTarget:'  '}).instructions.defence[1].type,null);
 assert(Object.isFrozen(guide.instructions.attack));
 assert.equal(JSON.stringify(f),before,'Coaching never edits lineup input');
 snapshots.add(guide.decisions[0].action+'|'+guide.instructions.attack[1].slot+'|'+guide.instructions.attack[1].type);
 for(const {slot} of f.starters){
  const roleGuide=tactics.counterGuide(mode,f.id,slot);
  assert.equal(roleGuide.slot,slot);
  assert(roleGuide.slotAttack&&roleGuide.slotDefence);
 }
}
assert.equal(snapshots.size,4,'Four formation/style contexts have distinct plans');
assert.equal(tactics.counterGuide('rapido','4312','sa'),null,'No phantom SA in 4-3-1-2');
assert.equal(tactics.counterGuide('normal','4213','mlg'),null,'No phantom MLG in central 4-2-1-3');
assert.notEqual(tactics.counterGuide('normal','4312','vole').slotAttack,tactics.counterGuide('normal','4312','vold').slotAttack,'Protection and linking pivots have different tasks');
assert.notEqual(tactics.counterGuide('rapido','4213','cae').slotAttack,tactics.counterGuide('rapido','4213','cad').slotAttack,'Support and runner have different tasks');
assert.equal(tactics.counterGuide('posse','4312'),null);
console.log('V394 coaching PASS: 4 contexts, 44 slots, decisions and conditional instruction capacity.');
