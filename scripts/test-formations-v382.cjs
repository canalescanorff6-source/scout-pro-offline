'use strict';
const a=require('node:assert/strict'),F=require('../web/craque-formations-v382.js'),data=require('../web/ct382-formations.json'),base=require('../web/ct382-formation-baseline.json');
a.equal(data.formations.length,500);a.equal(new Set(data.formations.map(f=>f.id)).size,500);
const signatures=new Set();for(const p of data.formations){a.deepEqual(F.validate(p),[]);a(F.eligible(p,'posse'));a(!signatures.has(F.signature({slots:p.slots})));signatures.add(F.signature({slots:p.slots}));
 for(const old of base.geometries)a(!F.equivalent({slots:p.slots},{slots:old.slots}),'Novo desenho não pode ser repetição de uma geometria anterior');}
const p=data.formations[0],mirror={...p,slots:p.slots.map(s=>({...s,x:100-s.x})),offBallSlots:p.offBallSlots.map(s=>({...s,x:100-s.x}))};
a.equal(F.signature(p),F.signature(mirror));a(F.equivalent(p,mirror));
const small={...p,slots:p.slots.map(s=>({...s,x:s.x+1,y:s.y+1})),offBallSlots:p.offBallSlots.map(s=>({...s,x:s.x+1,y:s.y+1}))};a(F.equivalent(p,small));
a(F.validate({...p,slots:p.slots.slice(1)}).length);a(F.validate({...p,slots:p.slots.map((s,i)=>i===1?{...s,x:p.slots[2].x,y:p.slots[2].y}:s)}).length);
a(!F.eligible({...p,slots:p.slots.map((s,i)=>i===1?{...s,position:'PTE'}:s)},'posse'));
a.deepEqual(new Set(data.formations.map(p=>p.family)),new Set(['4-3-1-2','4-2-2-2','4-3-2-1','4-2-3-1','4-3-3','4-4-2','3-5-2','5-3-2','3-4-2-1','5-2-1-2']));
a.equal(data.gameplayValidated,false);a.equal(data.baseline.productionCommit,'0f1c419534382b43ab18d4965f3360f735797498');
console.log('V382 FORMATIONS PASS: 500 desenhos adicionais, dez famílias, sem espelhos/repetições, fases legais e Posse central.');
