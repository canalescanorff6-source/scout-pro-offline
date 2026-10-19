'use strict';
/* V262: slots "PENDENTE / selecionável" nunca podem ser equipáveis.
 * Cinquenta hipóteses iguais não são prova de desempenho: cinco skills
 * devem declarar origem e permanecer consultivas nas 246 cartas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const index=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const V=require('../web/craque-ficha-individual-v251.js');
const rows=new Map(index.map(row=>[row.numero,row]));
const original=JSON.stringify(cards);
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const styles=['posse','normal','rapido','fora','longo'];
const pending=cards.filter(c=>B.slotStatus(c.impeto_extra)==='possivel');
assert.deepEqual(pending.map(c=>c.numero),[97,99,217],
 'A auditoria só pode nomear edições realmente presentes no acervo');
let scenarios=0;
for(const c of cards){
 const d={capture:c.numero,id:c.id,shown_position:c.posicao,
  attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
  native_skills:c.habilidades_nativas,boost1:c.impeto_fixo,
  boost2:c.impeto_extra,niveis:c.niveis};
 const proof=V.proofChecklist(c,rows.get(c.numero),{},null);
 const before=JSON.stringify(c);
 for(const style of styles){
  const ranked=S.booster(d,style,B,'vazio');
  const report=V.methodologyGate(c,proof,style,null);
  assert.equal(report.capture,c.numero);assert.equal(report.card_id,c.id);
  assert.equal(report.style,style);assert.equal(report.competitivelyHomologated,false);
  assert(report.skills.candidates.length<=5);
  for(const item of report.skills.candidates){
   assert(item.name);assert(item.reason,'Toda habilidade deve ter justificativa de função');
   assert(Array.isArray(item.synergy));
  }
  assert(report.skills.nativeEvidence==='catalogo_documental'||
   report.skills.nativeEvidence==='habilidades_nativas_pendentes');
  assert.equal(report.booster.attributes.length,ranked.primary?.atributos.length||0);
  if(B.slotStatus(c.impeto_extra)==='possivel'){
   assert.equal(ranked.status,'possivel');
   assert.equal(ranked.slotEvidence,'slot_pendente');
   assert.equal(ranked.slotSupported,false);
   assert.equal(ranked.able,false,'PENDENTE não se transforma em slot equipável');
   assert.equal(ranked.equipStatus,'slot_pendente_no_catalogo');
   assert.match(ranked.note,/SLOT PENDENTE/);
   assert.equal(report.booster.status,'nao_autorizado_para_equipar');
  }
  scenarios++;
 }
 assert.equal(JSON.stringify(c),before,'Nenhuma carta pode ser modificada');
}
assert.equal(scenarios,1230);
// Confirmação estritamente documental, não um passe livre para outras edições.
const fake={shown_position:'CA',boost1:'Physicality +3',
 boost2:'SLOT SELECIONÁVEL +1'};
assert.equal(S.booster(fake,'posse',B,'vazio').able,true);
assert.equal(S.booster({...fake,boost2:'PENDENTE / selecionável'},
 'posse',B,'vazio').able,false);
assert.equal(S.booster({...fake,boost2:'PENDENTE / selecionável'},
 'posse',B,'vazio').equipStatus,'slot_pendente_no_catalogo');
assert.equal(S.booster({...fake,boost2:'PENDENTE / selecionável'},
 'posse',B,'ocupado').able,false);
assert.equal(S.booster({...fake,boost2:'PENDENTE / selecionável'},
 'posse',B,'ausente').able,false);
assert.equal(S.booster({...fake,boost2:'Shooting +1'},'posse',B,'vazio').able,false);
const page=read('web/craque-ficha-individual-v251.js');
assert(page.includes("add('Habilidade adicional '+(index+1)+' · '+candidate.name"));
assert(page.includes('Quatro atributos afetados: '));
assert(page.includes('method.skills.nativeEvidence'));
assert(read('web/skills-booster-v162.js').includes("slotSupported=status==='selecionavel'"));
assert(read('web/sw.js').includes('v262-pending-slot-proof'));
assert(read('package.json').includes('test-pending-boosters-v262.cjs'));
assert.equal(JSON.stringify(cards),original);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
console.log('V262 PASS: '+scenarios+
 ' pareceres; 3 edições pendentes isoladas em 5 táticas; 246 cartas e builds preservadas.');
