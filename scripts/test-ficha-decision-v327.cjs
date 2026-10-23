'use strict';
/* V327 — não inventar "melhor" treinamento por estilo, sem alterar 246 cartas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const guide=require('../web/craque-ficha-decision-v327.js');
const tactical=require('../web/scout-multitactic-engine-v220.js');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const original=JSON.stringify(roster);
assert.equal(roster.length,246);
assert.equal(guide.MODES.length,5);
assert.deepEqual(Array.from(guide.MODES),['posse','normal','rapido','fora','longo']);
const levels=[10,5,5,8,8,6,0,0,0,0],pp=tactical.total(levels);
assert.equal(pp,62);
const card={collection:'outros-elencos',cardKey:'ficha-id-1',cardId:'105297',owner:'bruno-santos'};
function scenario(style='posse',opts={}){
 return {
  position:'MAT',style,manager:'CT-MGR-071',
  managerProfile:{name:'Niko Kovač'},
  compatibility:{eligible:true},
  outcome:{plan:{status:'hipotese',pp,levels:levels.slice(),categories:tactical.CATEGORIES}},
  ...opts
 };
}
const current=guide.resolve(scenario(),card,tactical);
assert.equal(current.kind,'proposta_calculada');
assert.equal(current.source,'simulacao');
assert.equal(current.calculated,true);
assert.equal(current.pp,62);
assert.match(current.title,/Proposta/);
assert(current.what.some(x=>x.includes('não comprovad')));
assert(!current.what.some(x=>/pro player confirmou|melhor do mundo/i.test(x)));
const saved={revision:{approved:false,levels:levels.slice()},stale:false};
const draft={train:levels.slice(),skills:['Passe de primeira']};
assert.equal(guide.resolve(scenario(),card,tactical,saved,null).kind,'revisao_salva');
assert.equal(guide.resolve(scenario(),card,tactical,saved,draft).kind,'rascunho_salvo');
const approved={revision:{approved:true,levels:levels.slice()},stale:false};
assert.equal(guide.resolve(scenario(),card,tactical,approved,draft).kind,'aprovacao_registrada');
const alteredDraft={train:[5,10,5,8,8,6,0,0,0,0],skills:[]};
assert.equal(guide.resolve(scenario(),card,tactical,approved,alteredDraft).kind,'rascunho_salvo',
 'Rascunho novo não pode herdar aprovação da revisão antiga com PP diferentes');
assert.equal(guide.resolve(scenario(),card,tactical,approved,alteredDraft).approved,false);
assert.equal(guide.resolve(scenario(),card,tactical,{...approved,stale:true},draft).kind,'rascunho_salvo');
const broken=guide.resolve(scenario('posse',{outcome:{plan:{status:'pendente',pp:null,levels:null}}}),card,tactical);
assert.equal(broken.kind,'pendente');
assert.equal(broken.pp,null);
assert.equal(broken.levels,null);
assert.equal(guide.resolve(scenario('posse',{compatibility:{eligible:false}}),card,tactical).compatible,false);
assert.equal(guide.resolve(scenario('posse',{manager:'sem-tecnico',managerProfile:{name:null}}),card,tactical).hasManager,false);
assert.equal(guide.validateLevels([20,20,20,20,20,20,0,0,0,0],scenario().outcome.plan,tactical),false);
const choices=guide.MODES.map(style=>{
 const vec=style==='rapido'?[5,10,5,8,8,6,0,0,0,0]:levels.slice();
 const s=scenario(style,{outcome:{plan:{status:'hipotese',pp,levels:vec,categories:tactical.CATEGORIES}}});
 return guide.resolve(s,card,tactical);
});
const cmp=guide.compare(current,choices,tactical.CATEGORIES);
assert.equal(cmp.rows.length,5);
assert.deepEqual(cmp.rows.map(x=>x.label),guide.MODES.map(x=>guide.LABEL[x]));
assert.equal(cmp.rows.filter(x=>x.selected).length,1);
assert.equal(cmp.rows[0].selected,true);
assert.equal(cmp.rows[1].sameTraining,true);
assert.equal(cmp.rows[2].sameTraining,false);
assert.equal(cmp.rows[2].changes.length,2);
assert.deepEqual(cmp.rows[2].changes.map(x=>x.delta),[-5,5]);
assert.equal(cmp.rows[2].pp,62);
assert.match(cmp.statement,/não existe evidência/i);
assert(!/ranking.*melhor/i.test(cmp.statement));
assert.throws(()=>guide.compare(current,choices.slice(0,4),tactical.CATEGORIES),/cinco/);
assert.throws(()=>guide.compare(current,[...choices.slice(0,4),choices[0]],tactical.CATEGORIES),/repetidas/);
assert.throws(()=>guide.compare(current,choices.map((x,i)=>i===0?{...x,position:'SA'}:x),tactical.CATEGORIES),/mesma carta/);
assert.throws(()=>guide.compare(current,choices.map((x,i)=>i===0?{...x,owner:'outro-proprietario'}:x),tactical.CATEGORIES),/mesma carta/);
assert.throws(()=>guide.compare(current,choices.map((x,i)=>i===0?{...x,cardId:'9876543'}:x),tactical.CATEGORIES),/mesma carta/);
assert.throws(()=>guide.compare(current,choices.map((x,i)=>i===0?{...x,edition:'Outra versão'}:x),tactical.CATEGORIES),/mesma carta/);
assert(Object.isFrozen(current)&&Object.isFrozen(cmp)&&Object.isFrozen(cmp.rows));
const ui=read('web/craque-positional-ui-v311.js');
const external=read('web/craque-friends-training-ui-v228.js');
const bridge=read('web/app-bridge.js'),other=read('web/outros-elencos-v227.html');
const css=read('web/craque-positional-v311.css');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
assert(ui.includes('guide.resolve(scenario,model'));
assert(ui.includes('guide.compare(decision||modes.find'));
assert(ui.includes('opts.onStyleSelect'));
assert(ui.includes('Por que esta ficha está em foco?'));
assert(ui.includes('Comparar 5 estilos de jogo'));
assert(ui.includes('styles')===false || ui.includes('guide.MODES'), 'Comparação precisa do motor compartilhado');
assert(external.includes('onStyleSelect:chosen=>')&&external.includes('display()'));
assert(bridge.includes("load('craque-ficha-decision-v327.js'"));
assert(other.includes('<script defer src="craque-ficha-decision-v327.js"></script>'));
assert(css.includes('.ct327-style-panel[hidden]'));
assert(css.includes('.ct327-style-activate:focus-visible'));
assert(sw.includes("'./craque-ficha-decision-v327.js'")&&sw.includes('v327-ficha-decisao'));
assert(stamp.includes("'craque-ficha-decision-v327.js'"));
assert.equal(JSON.stringify(roster),original);
console.log('V327 PASS: cinco estilos seguros, PP exatos, rascunhos/aprovação separados, MAT e acervo intactos, zero ranking fictício.');
