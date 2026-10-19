'use strict';
/* V259 — prova local V254 deve ser consistente com a matriz V251/V252.
 * Nenhum registro escrito isoladamente comprova slots nem habilidades usadas.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const S=require('../web/skills-booster-v162.js');
const source=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(source).cards;
const index=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
assert.equal(cards.length,246);
assert.equal(index.length,246);
const before=JSON.stringify(cards);
const lookup=new Map(index.map(row=>[row.numero,row]));
const styles=['posse','normal','rapido','fora','longo'];
let reviewed=0;
for(const c of cards){
 const record=lookup.get(c.numero);
 for(const style of styles){
  const result=V.proofChecklist(c,record,{},null);
  const additional=result.checks.find(x=>x.id==='additional');
  assert(additional);
  assert.equal(additional.documented,false,'Não há confirmação de skills nesta conta #'+c.numero);
  assert.equal(result.checks.length,10);
  const assessed=S.evaluate({
   capture:c.numero,id:c.id,shown_position:c.posicao,
   native_skills:c.habilidades_nativas,attack_style:c.estilo_ataque
  },style,'');
  assert.equal(assessed.equippedConfirmed,false);
  assert.equal(assessed.slotsRemaining,null);
  reviewed++;
 }
}
assert.equal(reviewed,1230);
const m=cards.find(c=>c.numero===191),row=lookup.get(191);
assert(m&&row);assert.equal(m.max_level,26);assert.equal(m.pp,50);
const storageMap=new Map();
const store={getItem:k=>storageMap.has(k)?storageMap.get(k):null,
 setItem:(k,v)=>storageMap.set(k,String(v)),removeItem:k=>storageMap.delete(k)};
const manualKey='scoutpro:v162:equipped:'+m.numero+':'+m.id;
const proofKey=S.confirmationKey(m.numero,m.id);
const skills='Passe de primeira; Toque duplo';
const report=()=>V.proofChecklist(m,row,{},store).checks.find(x=>x.id==='additional');
const confirm=manual=>({
 schema:'CRAQUE_ADDITIONAL_V254',capture:m.numero,card_id:m.id,
 confirmed:true,fingerprint:S.fingerprint(manual)
});
store.setItem(manualKey,skills);
assert.equal(report().documented,false,'Texto parcial não equivale a lista validada');
store.setItem(proofKey,JSON.stringify(confirm(skills)));
assert.equal(report().documented,true,'Confirmação da edição exata e lista atual é legítima');
assert.match(report().note,/V254/);
store.setItem(manualKey,skills+'; Bloqueador');
assert.equal(report().documented,false,'Editar a lista invalida a confirmação');
store.setItem(manualKey,skills);
assert.equal(report().documented,true,'Restaurar lista igual mantém fingerprint coerente');
store.setItem(proofKey,JSON.stringify({...confirm(skills),card_id:'edicao-diferente'}));
assert.equal(report().documented,false,'Não migrar confirmação entre Card IDs');
store.setItem(proofKey,JSON.stringify({...confirm(skills),capture:190}));
assert.equal(report().documented,false,'Não migrar confirmação entre CAPs');
store.setItem(proofKey,JSON.stringify({...confirm(skills),confirmed:false}));
assert.equal(report().documented,false,'Confirmação revogada não autoriza slots');
store.setItem(proofKey,JSON.stringify(confirm(skills)));
store.setItem(manualKey,'Passe de primeira; habilidade sem mapeamento oficial');
store.setItem(proofKey,JSON.stringify(confirm(store.getItem(manualKey))));
assert.equal(report().documented,false,'Skill sem identificação oficial não é prova completa');
store.setItem(manualKey,'Marseille Turn');
store.setItem(proofKey,JSON.stringify(confirm(store.getItem(manualKey))));
assert.equal(report().documented,false,'Habilidade nativa não conta como adicional');
store.setItem(manualKey,'Passe de primeira; Toque duplo; Passe em profundidade; Bloqueador; Interceptação; Espírito guerreiro');
store.setItem(proofKey,JSON.stringify(confirm(store.getItem(manualKey))));
assert.equal(report().documented,false,'Mais de cinco adicionais não devem ser validados');
store.setItem(manualKey,'');
store.setItem(proofKey,JSON.stringify(confirm('')));
assert.equal(report().documented,true,'Confirmação explícita de zero adicionais é válida');
store.removeItem(proofKey);
assert.equal(report().documented,false,'Sem confirmação, zero adicionais é desconhecido');
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),source);
assert(read('web/craque-ficha-individual-v251.js').includes(
 "doc.addEventListener('scoutpro:skills-updated'"),
 'Auditoria deve reagir à confirmação V254 sem reabrir a ficha');
assert(read('package.json').includes('test-additional-proof-v259.cjs'));
assert(read('web/sw.js').includes('v259-v254-skill-proof'));
console.log('V259 PASS: 1.230 análises sem prova indevida, 246 cartas preservadas, confirmação V254 e invalidações testadas.');
