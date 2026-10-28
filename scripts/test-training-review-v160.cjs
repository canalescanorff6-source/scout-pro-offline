'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../web');
const engine=require('../web/training-review-v160.js');
const tactic=require('../web/tactical-engine-v98.js');
const perf=require('../web/performance-core-v80.js');
const audit=JSON.parse(fs.readFileSync(path.join(root,'SCOUT_V69_AUDITORIA.json'),'utf8'));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
let older=0,newer=0,distinct=0,zero=0;
for(const card of audit.cards){
 const html=fs.readFileSync(path.join(root,card.arquivo),'utf8');
 const get=id=>JSON.parse(html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>','i'))[1]);
 const d=get('scout-v68-data'),lab=get('lab-data');
 const report=engine.evaluate(d,lab,tactic);
 if(engine.valid(d.recommended_levels)){older++;assert.equal(report,null,'Treino antigo não deve mudar #'+card.numero);continue}
 newer++;assert(report&&report.ok,'Proposta inválida #'+card.numero);
 assert.equal(report.pp,card.pp);assert.equal(report.performanceValidated,false);assert.equal(report.overallTarget,false);
 assert.equal(engine.cost(report.a.levels),card.pp,'PP errados #'+card.numero);
 if(report.b){distinct++;assert.equal(engine.cost(report.b.levels),card.pp);assert(!engine.same(report.a.levels,report.b.levels))}
 const matches=perf.variants(d,lab,null);if([153,196].includes(card.numero))assert.equal(matches.length,0,'Referência pública não é PP confirmado no V80');else assert(matches.some(v=>engine.same(v.levels,report.a.levels)),'V80 não identifica a proposta #'+card.numero);
 const entry=index.match(new RegExp('<a class="player-card"[^>]*data-cap="'+card.numero+'"[^>]*>[\\s\\S]*?<\\/a>'));
 assert(entry);
 if(card.pp===0){zero++;assert.equal(card.numero,211);assert(entry[0].includes('0 PP confirmado'))}
 else assert(entry[0].includes([153,196].includes(card.numero)?'PP de referência · treino a conferir':'PP conferidos · treino por função'),'Status incorreto #'+card.numero);
}
assert.equal(older,160);assert.equal(newer,86);assert.equal(zero,1);assert(distinct>=70,'Poucos planos B alternativos');
assert.equal(fs.readdirSync(path.join(root,'cartas')).filter(x=>/^CAP_\d{3}_.+\.png$/.test(x)).length,246);
const bridge=fs.readFileSync(path.join(root,'app-bridge.js'),'utf8');
assert(bridge.includes('training-review-v160.js')&&bridge.includes('tactical-engine-v98.js'));
const lab=fs.readFileSync(path.join(root,'lab.js'),'utf8');
assert(lab.includes('scoutpro:training-load-v160'));
assert(!index.includes('Treino proposto · não validado'));
console.log('V160 OK: '+older+' anteriores preservados, '+newer+' fichas funcionais, '+distinct+' cenários B, zero PP respeitado, sem Overall ou testes fabricados.');
