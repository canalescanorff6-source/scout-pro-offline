'use strict';
/* V267 — 246 cartas x cinco estilos; nunca usar vetor fora do orçamento
 * como evidência de investimento individual. Sem inventar atributos-base.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(original).cards;
const B=require('../web/booster-engine-v103.js');
const S=require('../web/skills-booster-v162.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(x=>x.numero+'@'+x.id)).size,246);
let total=0,recorded=0,absent=0;
for(const c of cards){
 const snapshot=JSON.stringify(c), audit=B.trainingAudit(c);
 if(c.niveis){recorded++;assert.equal(audit.status,'custo_pp_conferido');
  assert.equal(audit.pp,c.pp);assert.equal(audit.spent,c.pp);
  assert.deepEqual(audit.levels,c.niveis);
 }else{absent++;assert.equal(audit.status,'vetor_ausente');
  assert.equal(audit.levels,null);
 }
 const d={capture:c.numero,id:c.id,shown_position:c.posicao,role_used:c.posicao,
  native_skills:c.habilidades_nativas,boost1:c.impeto_fixo,
  boost2:c.impeto_extra,attack_style:c.estilo_ataque,
  defence_style:c.estilo_defesa,recommended_levels:c.niveis,pp:c.pp};
 for(const style of B.tactics){
  const choices=B.rank(c,style),adapted=S.booster(d,style,B);
  assert.equal(adapted.primary?.nome,choices[0]?.nome);
  assert(choices.every(x=>x.evidencias.pp_status===audit.status));
  assert(choices.every(x=>x.evidencias.pp_investidos===audit.spent));
  assert(choices.every(x=>x.evidencias.pp_orcamento===audit.pp));
  assert(choices.every(x=>x.confianca===(audit.levels?'comparativa_limitada':'baixa')));
  assert(choices.every(x=>x.evidencias.limite.includes('Sem atributos finais')));
  total++;
 }
 assert.equal(JSON.stringify(c),snapshot,'Carta alterada #'+c.numero);
}
assert.equal(total,1230);assert.equal(recorded+absent,246);
assert.equal(recorded,162);assert.equal(absent,84);
const massaro=cards.find(x=>x.numero===1),martinelli=cards.find(x=>x.numero===191);
assert(massaro&&martinelli&&martinelli.pp===50&&martinelli.max_level===26);
const exact=B.rank(martinelli,'posse')[0];
assert.equal(exact.evidencias.pp_status,'custo_pp_conferido');
const missingPP={...martinelli,pp:null};
assert.equal(B.trainingAudit(missingPP).status,'pp_nao_documentados');
assert.equal(B.rank(missingPP,'posse')[0].confianca,'baixa');
const mismatch={...martinelli,pp:66};
assert.equal(B.trainingAudit(mismatch).status,'pp_divergentes');
assert.equal(B.rank(mismatch,'posse')[0].confianca,'baixa');
assert.equal(B.rank(mismatch,'posse')[0].evidencias.pp_investidos,50);
assert.equal(B.rank(mismatch,'posse')[0].evidencias.pp_orcamento,66);
const unrelated={...martinelli,niveis:null};
const mismatchNames=B.rank(mismatch,'posse').map(x=>[x.nome,x.score]);
const noTrainingNames=B.rank(unrelated,'posse').map(x=>[x.nome,x.score]);
assert.deepEqual(mismatchNames,noTrainingNames,
 'Vetor PP divergente não pode influenciar pontuação por função/tática');
assert.equal(B.trainingAudit({...martinelli,niveis:[20,20,20,20,20,20,20,20,20,20]}).status,'pp_divergentes');
assert.equal(B.trainingAudit({...martinelli,niveis:[1,2,3]}).status,'vetor_invalido');
assert.equal(B.trainingAudit({...martinelli,niveis:[1,2,3,4,5,6,7,8,9,'0']}).status,'vetor_invalido');
assert.equal(B.trainingAudit({...martinelli,niveis:[21,0,0,0,0,0,0,0,0,0]}).status,'vetor_invalido');
const provisional={...martinelli,training_provisional:true};
assert.equal(B.trainingAudit(provisional).status,'treino_proposto_nao_validado');
assert.equal(B.rank(provisional,'posse')[0].confianca,'baixa');
assert.deepEqual(B.rank(provisional,'posse').map(x=>[x.nome,x.score]),
 B.rank(unrelated,'posse').map(x=>[x.nome,x.score]));
assert.equal(B.progressCost(martinelli.niveis),50);
assert.equal(B.progressCost(massaro.niveis),62);
const code=read('web/skills-booster-v162.js');
assert(code.includes('pp:d.pp,training_provisional:d.training_provisional===true'));
assert(code.includes('ALERTA: custo calculado '));
const sw=read('web/sw.js');
assert(sw.includes('v267-pp-cost-audit'));
assert(read('package.json').includes('test-booster-pp-v267.cjs'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
console.log('V267 PASS: '+total+' avaliações; '+recorded+' vetores coerentes, '+absent+
 ' ausentes; PP divergente, proposta, dados malformados ignorados; 246 cartas preservadas.');
