'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../web');
const audit=JSON.parse(fs.readFileSync(path.join(root,'SCOUT_V69_AUDITORIA.json'),'utf8'));
const m=JSON.parse(fs.readFileSync(path.join(root,'SCOUT_V98_AUDITORIA_TATICA.json'),'utf8'));
const eng=require(path.join(root,'tactical-engine-v98.js'));
assert.equal(m.version,'V98');assert.equal(m.total,246);assert.equal(m.cartas.length,246);
assert.equal(audit.cards.length,246);
let earlier=0,missing=0,bases=0;
for(const c of m.cartas){
 const source=audit.cards.find(a=>a.numero===c.numero);assert(source,'Missing card '+c.numero);
 assert.equal(c.nome,source.name);assert.equal(c.card_id,source.id);
 assert.equal(c.pp,source.pp);assert.equal(c.posicao,source.posicao);
 assert.equal(c.base_stats_known,source.base_stats_known);
 if(c.base_stats_known)bases++;
 assert(c.pendencias.includes('Partidas comparativas nas três táticas'),'No field validation #'+c.numero);
 if(!c.base_stats_known){missing++;assert(c.pendencias.includes('Atributos-base da edição'))}
 assert.equal(c.referencia,Array.isArray(source.niveis)?'anterior':'experimental-v95');
 assert.deepEqual(c.treino_anterior,source.niveis);
 if(source.niveis){earlier++;assert.equal(eng.cost(source.niveis),source.pp,'Old budget changed #'+c.numero)}
 assert(fs.existsSync(path.join(root,c.imagem)),'Original art missing '+c.numero);
 assert(fs.existsSync(path.join(root,c.ficha)),'Profile missing '+c.numero);
 const plans=eng.comparison(c);
 assert.equal(plans.proposals.length,3);
 for(const {plan,key} of plans.proposals){
  assert(plan.ok,'Impossible proposal #'+c.numero+' '+key+' '+plan.reason);
  assert(eng.valid(plan.levels));
  assert.equal(plan.used,c.pp);assert.equal(plan.remaining,0);
  assert.equal(eng.cost(plan.levels),c.pp,'Bad progression cost');
  if(!['GO','GR'].includes(c.posicao))assert(plan.levels.slice(7).every(x=>x===0),'Goalkeeper points on field player #'+c.numero);
 }
}
assert.equal(earlier,162);assert.equal(missing,232);assert.equal(bases,14);
assert.equal(eng.cost([12,4,4,12,7,0,0,0,0,0]),66);
const kubo=m.cartas.find(c=>c.numero===211);assert.equal(kubo.pp,0);
assert(eng.tactics.every(t=>eng.proposal(kubo,t.key).levels.every(n=>n===0)));
const eto=m.cartas.find(c=>c.numero===236);assert.equal(eto.pp,66);
assert.equal(m.cartas.filter(c=>!c.treino_anterior).length,84);
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const html=fs.readFileSync(path.join(root,'revisao-tatica-v98.html'),'utf8');
const ui=fs.readFileSync(path.join(root,'revisao-tatica-v98.js'),'utf8');
assert(index.includes('href="revisao-tatica-v98.html"'));
assert(html.includes('id="art"'));assert(html.includes('id="tactics"'));
assert(ui.includes('Guardar hipótese para teste'));assert(html.includes('src="revisao-tatica-v98.js"'));
assert(!ui.includes('localStorage.setItem('+'scoutpro:v67'));
assert.equal(fs.readdirSync(path.join(root,'cartas')).filter(n=>/^CAP_\d{3}_.+\.png$/.test(n)).length,246);
assert.equal(fs.readdirSync(path.join(root,'fichas')).filter(n=>/^\d{3}_.+\.html$/.test(n)).length,246);
console.log('V98 OK: 246 cartas auditadas, 738 hipóteses com PP exatos, 162 treinos anteriores preservados, 84 V95, 232 sem base; nenhuma validação automática.');
