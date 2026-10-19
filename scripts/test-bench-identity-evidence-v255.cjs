'use strict';
/* V255 — substituições sem duplicação da PESSOA (mesmo em outra edição).
 * Encaixe posicional documentado não vira prova artificial de meta/OVR.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(original).cards;
const formation=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const bench=require('../web/craque-bench-advisor-v247.js');
const training=require('../web/scout-position-training-v246.js');
const tactics=require('../web/craque-tactics-v230.js');
const identity=require('../web/scout-player-identity-v245.js');
const legacy=JSON.parse(read('web/SCOUT_V176_POSSE_4312.json'));
formation.push({id:'v176',starters:legacy.starter_slots.map(x=>({slot:x.slot,cap:x.cap,role:tactics.slotRole(x.slot)})),bench:legacy.bench});
assert.equal(cards.length,246);
const byCap=new Map(cards.map(c=>[Number(c.numero),c]));
const call=(candidate,starters,extra={})=>bench.recommend({
 card:candidate,starters,
 selections:Object.fromEntries(starters.map(x=>[x.slot,x.cap])),
 byCap,mode:'posse',training,tactics,identity,...extra
});
const messi50=byCap.get(50),messi53=byCap.get(53);
assert(messi50&&messi53&&identity.key(messi50)===identity.key(messi53),
 'Fixture da mesma pessoa em edições diferentes');
const already=call(messi53,[{slot:'cae',cap:50,role:'CA'}]);
assert.equal(already.eligible,false);
assert.equal(already.status,'já escalado');
assert.equal(already.incumbent,null);
assert(already.reason.includes('outra edição'));
const capAlready=call(messi50,[{slot:'cae',cap:50,role:'CA'}]);
assert.equal(capAlready.eligible,false);
const martinelli=byCap.get(191),yorke=byCap.get(40);
assert.equal(martinelli.pp,50);
assert.equal(martinelli.max_level,26);
assert.equal(training.status(martinelli,'CA').eligible,false);
const repair=call(yorke,[{slot:'cae',cap:191,role:'CA'}]);
assert.equal(repair.eligible,true);
assert.equal(repair.position,'CA');
assert.equal(repair.decision,'corrigir_posicao_titular');
assert.equal(repair.incumbent.numero,191);
assert.equal(repair.incumbentPositionConfirmed,false);
assert.equal(repair.gain,null);
assert.equal(repair.incumbentScore,null);
assert(repair.reason.includes('não tem familiaridade confirmada'));
assert(repair.reason.includes('NÃO é prova de qualidade superior'));
assert(repair.text.includes('Jogar como CA · Substituir #191'));
const stub={...tactics,score:c=>({
 score:Number(c.numero)===40?25:85,
 role:'CA',signals:['Estilo original consultivo'],confidence:'provisorio'
})};
const downgrade=call(yorke,[{slot:'cae',cap:12,role:'CA'}],{tactics:stub});
assert.equal(downgrade.eligible,true);
assert.equal(downgrade.decision,'alternativa_sem_vantagem_comprovada');
assert.equal(downgrade.incumbentPositionConfirmed,true);
assert(downgrade.gain<0);
assert(downgrade.reason.includes('Sem ganho de encaixe documental'));
assert(!downgrade.reason.includes('titular atual não tem familiaridade'));
const favorable=call(yorke,[{slot:'cae',cap:12,role:'CA'}],{
 tactics:{...stub,score:c=>({
  score:Number(c.numero)===40?95:45,role:'CA',signals:[],confidence:'provisorio'
 })}
});
assert.equal(favorable.decision,'encaixe_documental_favoravel');
assert(favorable.gain>0);
assert(favorable.reason.includes('não desempenho superior comprovado'));
const fake={
 getItem:k=>fake.k.get(k)||null,
 setItem:(k,v)=>fake.k.set(k,v),
 removeItem:k=>fake.k.delete(k),k:new Map()
};
// Status treinado CA por CAP + ID da edição, nunca pela outra versão.
training.confirm(martinelli,'CA',true,fake);
const approved=call(martinelli,[{slot:'cae',cap:12,role:'CA'}],{
 training:{...training,status:(c,role)=>training.status(c,role,fake)}
});
assert.equal(approved.eligible,true);
assert.equal(approved.position,'CA');
assert.equal(approved.status,'treinada');
training.confirm(martinelli,'CA',false,fake);
let analyses=0;
for(const f of formation)for(const mode of Object.keys(tactics.MODES)){
 const starters=f.starters.map(x=>({slot:x.slot,cap:x.cap,role:x.role}));
 const selections=Object.fromEntries(starters.map(x=>[x.slot,x.cap]));
 for(const b of f.bench){
  const c=byCap.get(b.cap),r=bench.recommend({
   card:c,starters,selections,byCap,mode,identity,training,tactics
  });
  assert(c,'Reserva CAP '+b.cap+' inexistente');
  if(r.eligible){
   assert(training.status(c,r.position).eligible);
   assert(r.text.includes('Jogar como '+r.position+' · Substituir #'));
   assert(identity.key(c)!==identity.key(byCap.get(r.incumbent.numero)));
   assert(['corrigir_posicao_titular','encaixe_documental_favoravel',
    'alternativa_sem_vantagem_comprovada'].includes(r.decision));
   assert(r.reason.includes('Não usa Overall'));
   if(!r.incumbentPositionConfirmed){
    assert.equal(r.gain,null,'Posição irregular não é ganho numérico de qualidade');
   }
  }else assert.equal(r.incumbent,null);
  analyses++;
 }
}
assert.equal(analyses,3*5*12);
for(const file of ['web/meu-time-duas-formacoes-v177.js',
 'web/meu-time-posse-4312.js','web/scout-rotation-lab-v219.js'])
 assert(read(file).includes('benchAdvisor.recommend('),
  'Motor deve ser comum a todas as formações e ao rodízio: '+file);
assert(read('web/sw.js').includes('v255-bench-person-clarity'),
 'Cache novo garante a mesma lógica no Windows e Android');
assert(read('package.json').includes('test-bench-identity-evidence-v255.cjs'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
console.log('V255 OK: 246 cartas intactas, 120 opções das duas formações/5 táticas, sem duplicar pessoa.');
console.log('V255 OK: outra edição não substitui a si mesma; encaixe irregular não gera falso ganho; posição treinada CA exige confirmação.');
