'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const core=require('../web/performance-core-v80.js');
const web=path.join(__dirname,'../web'),files=fs.readdirSync(path.join(web,'fichas')).filter(x=>/^\d{3}_.*\.html$/.test(x));
assert.equal(files.length,246);
let withPP=0,withoutPP=0,hasBase=0,candidate=0,insufficient=0,duplicate=0;
for(const file of files){
 const s=fs.readFileSync(path.join(web,'fichas',file),'utf8');
 const get=id=>JSON.parse(s.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>','i'))?.[1]||'null');
 const d=get('scout-v68-data'),l=get('lab-data');assert(d&&l&&d.capture===Number(file.slice(0,3)),file);
 const v=core.review(d,l,[],null);
 if(v.hasPP){withPP++;
   assert.equal(v.status,v.candidate?'Build competitiva candidata':v.opts.length?'Build calculada':'PP confirmados · treino pendente');
   if(d.recommended_levels===null)assert.equal(v.opts.length,0,'Não atribuir build fictícia '+file);
 }
 else{withoutPP++;assert.equal(v.status,'Dados pendentes');assert.equal(v.opts.length,0)}
 if(v.baseStats)hasBase++;
 if(v.candidate){candidate++;assert(v.baseStats>0&&v.nativeSkills&&v.opts.length>=2)}
 else if(v.hasPP&&v.opts.length<2)duplicate++;
 if(v.status==='Dados pendentes')insufficient++;
 assert(!v.observed.length,'Ficha começa validada sem jogos: '+file);
}
assert.equal(withPP,212);assert.equal(withoutPP,34);assert.equal(hasBase,14);assert.equal(insufficient,34);
assert(candidate>0&&candidate<=14,'Candidatas precisam ter atributos-base reais');
const d={pp:8,pp_estimated:false,recommended_levels:[4,4,0,0,0,0,0,0,0,0],recommended_scenario:'A',
 alternate_scenarios:{A:[4,4,0,0,0,0,0,0,0,0],B:[4,4,0,0,0,0,0,0,0,0],C:[0,4,4,0,0,0,0,0,0,0]},base_stats_known:true,
 has_native_skills:true,native_skills:'Interception',role_used:'VOL',boost2:'PENDENTE'};
const l={A:d.alternate_scenarios.A,B:d.alternate_scenarios.B,C:d.alternate_scenarios.C,stats:{Desarme:{base:70,boost:0,mgr:0}}};
const opts=core.variants(d,l);assert.equal(opts.length,2,'Builds com níveis iguais não são comparações independentes');
const record=(hash,manager='Treinador 1')=>({hash,build:hash,manager,formation:'4-3-1-2',tactic:'Posse de Bola',opponent:'Semelhante',result:'Vitória',metricA:5,metricB:6});
let records=[...Array(5)].map(()=>record(opts[0].hash)).concat([...Array(4)].map(()=>record(opts[1].hash)));
assert.equal(core.review(d,l,records).status,'Build competitiva candidata','4 jogos por build não validam');
records.push(record(opts[1].hash,'Treinador diferente'));
assert.equal(core.review(d,l,records).status,'Build competitiva candidata','Técnico alterado invalida amostra comparável');
records.push(record(opts[1].hash));
const good=core.review(d,l,records);assert.equal(good.status,'Build validada em campo');
assert.equal(good.observed.length,1);assert.deepEqual(good.observed[0].builds.map(x=>x.count),[5,5]);
assert.equal(core.cost(d.recommended_levels),8);
assert(core.safeMatches([{...record(opts[0].hash),metricA:-1}],opts).length===0);
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
assert(bridge.includes("core.onload=")&&bridge.includes('performance-review-v80.js')&&bridge.includes('performance-review-v80.css'));
const ui=fs.readFileSync(path.join(web,'performance-review-v80.js'),'utf8');
assert(ui.includes("scoutpro:v80:matches:")&&ui.includes('localStorage.setItem(storageKey')&&ui.includes("render()"));
console.log('V80 OK: 246 fichas; '+withPP+' PP conferidos; '+withoutPP+' sem PP; '+hasBase+' bases parciais; '+candidate+' candidatas informadas; '+duplicate+' com builds indistintas. Teste 5+5, mesmo contexto, backup e pendências OK.');
