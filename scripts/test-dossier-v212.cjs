'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const engine=require('../web/lab.js'),module212=require('../web/scout-dossier-v212.js'),audit=require('../web/scout-build-audit-v211.js');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const groups=JSON.parse(read('web/SCOUT_V211_REPETICOES_REVIEW.json')).groups;
const formation=JSON.parse(read('web/SCOUT_V176_POSSE_4312.json'));
const all=module212.reviewCases(roster,groups,engine,formation);
assert.equal(roster.length,246);assert.equal(all.length,54);
assert.equal(new Set(all.map(x=>x.numero)).size,54);
let changed=0,signalled=0;
for(const c of all){
 const original=roster.find(x=>x.numero===c.numero);
 assert.deepEqual(c.registered,original.niveis,'Build preservada '+c.numero);
 assert.equal(module212.ppCost(c.registered),c.pp,'PP original '+c.numero);
 assert.equal(c.approval,'NÃO HOMOLOGADO');
 assert.equal(c.numericBaseCompared,false);assert.equal(c.knownBaseStats,false);
 if(c.signals.length){
  assert(c.alternative&&c.alternative.length===10,'Simulação individualizada válida '+c.numero);
  assert.equal(module212.ppCost(c.alternative),c.pp,'PP alternativo exato '+c.numero);
  assert.equal(c.alternativePP,c.pp);
  assert(c.alternative.every(n=>Number.isInteger(n)&&n>=0&&n<=20));
  const restricted=c.position==='GO'?c.alternative.slice(0,4).concat(c.alternative[6]):c.alternative.slice(7);
  assert(restricted.every(x=>x===0),'Treinamento compatível com função '+c.numero);
 }else{
  assert.equal(c.stage,'sem_sinal_documental_para_personalizar');
  assert.equal(c.alternative,null,'Nunca exibir alternativa genérica sem sinais da carta '+c.numero);
  assert.equal(c.alternativePP,null);
 }
 assert(c.roleFocus.length>0&&c.formationUse.length>0);
 assert.equal(c.fixedBoosterConfirmed,!!audit.confirmedBooster(original.impeto_fixo),'Ímpeto fixo '+c.numero);
 if(c.changes.length){changed++;assert.equal(c.stage,'hipotese_individual_para_testar')}
 if(c.signals.length)signalled++;
 else assert.notEqual(c.stage,'hipotese_individual_para_testar');
}
assert(changed>=10,'Alternativas individuais fundamentadas');
assert(signalled>=30,'Sinais documentais usados em mais da metade do grupo');
assert(all.every((x,i)=>i===0||all[i-1].rolePriority<=x.rolePriority),'Ordem do centro para pontas');
assert(all.filter(x=>['PTD','PTE'].includes(x.position)).every(x=>x.rolePriority===10));
assert(all.find(x=>x.numero===95).formationUse.includes('Reserva'));
assert.deepEqual(all.find(x=>x.numero===1).registered,all.find(x=>x.numero===32).registered);
const sample=roster.find(x=>x.numero===1),sampleGroup=groups.find(g=>g.ids.includes(1));
const generic={suggestIndividualPreview(){return {vec:sample.niveis.slice(),remaining:0,signals:[]};}};
const withoutSignals=module212.individualCase(sample,sampleGroup,generic,formation);
assert.equal(withoutSignals.stage,'sem_sinal_documental_para_personalizar');
assert.equal(withoutSignals.alternative,null,'Sem habilidades/ímpeto úteis: não mostrar prévia genérica como individual');
assert.equal(withoutSignals.approval,'NÃO HOMOLOGADO');
assert.equal(module212.position('AC'),'CA');
assert.equal(module212.ppCost(Array(10).fill(0)),0);
assert.equal(module212.ppCost([21,0,0,0,0,0,0,0,0,0]),null);
assert.equal(module212.individualCase(roster[11],groups[0],engine,formation),null);
const js=read('web/scout-dossier-v212.js'),css=read('web/scout-dossier-v212.css');
assert(js.includes('Somente comparação: nenhuma ficha foi alterada.'));
assert(css.includes('.scout-v212-dossier')&&css.includes('.scout-v212-table'));
assert(!js.includes('localStorage.setItem')&&!js.includes('localStorage.removeItem')&&!js.includes('updateBuild('));
for(const f of ['scout-dossier-v212.js','scout-dossier-v212.css']){
 assert(read('web/app-bridge.js').includes("v189Root+'"+f+"'"));
 assert(read('web/sw.js').includes("'./"+f+"'"));
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+f+"'"));
}
assert(read('web/sw.js').includes('v212-posse-dossiers'));
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(f=>f.endsWith('.html')).length,246);
console.log('V212 OK: '+all.length+' dossiês, '+signalled+' sinais, '+changed+' builds simuladas diferentes; zero treinos oficiais modificados.');
