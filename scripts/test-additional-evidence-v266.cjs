'use strict';
/* V266: 246 cartas × cinco táticas, habilidades com rastreabilidade,
 * conflitos nativa/adicional e assinatura documental das nativas.
 * Nunca modifica treinos ou declara builds aprovadas por creators.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const S=require('../web/skills-booster-v162.js');
const src=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(src).cards,styles=['posse','normal','rapido','fora','longo'];
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const baseline=JSON.stringify(cards);
let checks=0,mappedNativePartial=0;
for(const c of cards){
 const snapshot=JSON.stringify(c);
 const d={capture:c.numero,id:c.id,shown_position:c.posicao,
  native_skills:c.habilidades_nativas,attack_style:c.estilo_ataque,
  defence_style:c.estilo_defesa};
 for(const t of styles){
  const r=S.evaluate(d,t,'');
  assert(r.recommendations.length<=5);
  assert.equal(r.slotsRemaining,null);
  assert.equal(r.equippedConfirmed,false);
  assert.equal(r.requiresReconciliation,false);
  if(r.unmappedNativeSkills.length)mappedNativePartial++;
  const nativeIds=new Set(String(c.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
  for(const skill of r.recommendations.concat(r.alternatives)){
   assert(!nativeIds.has(skill.key),'Não repetir nativa #'+c.numero);
   const p=skill.criterios;
   assert(p&&Object.keys(p).sort().join(',')==='estilo,funcao,investimento,nativas,tatica');
   assert(Object.values(p).every(Number.isFinite));
   assert.equal(skill.score,p.funcao+p.tatica+p.estilo+p.nativas+p.investimento);
   assert(Array.isArray(skill.synergies));
  }
  checks++;
 }
 assert.equal(JSON.stringify(c),snapshot,'Carta original alterada');
}
assert.equal(checks,1230);
const d={capture:991,id:'CARTA_991',shown_position:'MAT',
 native_skills:'Passe de primeira; Phenomenal Pass; One-touch Pass; Skill fora do vocabulário'};
const r=S.evaluate(d,'posse','Phenomenal Pass; Toque duplo',{equippedConfirmed:true});
assert.equal(r.requiresReconciliation,true,
 'Mesmo uma nativa fora do vocabulário não pode contar como adicional');
assert.equal(r.nativeManualConflicts.length,1);
assert.equal(r.alreadyEquippedProvided,1);
// V272: native duplicada mesmo quando nome original é desconhecido
// invalida o certificado de vagas; recomendações permanecem consultivas.
assert.equal(r.equippedConfirmed,false);
assert.equal(r.slotsRemaining,null);
assert(r.missing.some(x=>x.includes('fora do vocabulário')));
assert(r.unmappedNativeSkills.includes('Skill fora do vocabulário'));
// A nativa conhecida não apaga a entrada verdadeiramente desconhecida.
assert(r.contextualNativeSkills.some(x=>x.name==='Phenomenal Pass'&&x.group==='distribuicao'));
assert(!r.unmappedNativeSkills.includes('Phenomenal Pass'));
assert.equal(r.nativeCoverage,'parcial');
assert(!r.recommendations.some(x=>x.key==='onepass'));
const six=S.evaluate(d,'posse',
 'Toque duplo; Controle com a sola; Toque de calcanhar; Interceptação; Bloqueador; Marcação individual',
 {equippedConfirmed:true});
assert.equal(six.manualOverLimit,true);
assert.equal(six.requiresReconciliation,true);
assert.equal(six.recommendations.length,0);
const selected='Toque duplo; Controle com a sola';
const proof={
 schema:'CRAQUE_ADDITIONAL_V254',capture:991,card_id:'CARTA_991',
 confirmed:true,fingerprint:S.fingerprint(selected),
 nativeFingerprint:S.fingerprint(d.native_skills)
};
assert(S.checkedEquipment(d,selected,proof));
assert.equal(S.checkedEquipment({...d,native_skills:d.native_skills+'; Bloqueador'},
 selected,proof),false,'Nativas modificadas devem invalidar prova V266');
assert.equal(S.checkedEquipment({...d,id:'OUTRA_CARTA'},selected,proof),false);
assert.equal(S.checkedEquipment(d,selected+'; Bloqueador',proof),false);
assert.equal(S.checkedEquipment(d,selected,{...proof,nativeFingerprint:'corrompido'}),false);
// Confirmações legadas V254 continuam legíveis; novas edições exigem
// assinatura das nativas. Não invalidar indiscriminadamente dados antigos.
const legacy={...proof};delete legacy.nativeFingerprint;
assert(S.checkedEquipment(d,selected,legacy));
const ui=read('web/skills-booster-v162.js');
assert(ui.includes('nativeFingerprint:fingerprint(d.native_skills||d.habilidades_nativas'));
assert(ui.includes('if(requested&&precheck.requiresReconciliation)'));
assert(ui.includes('Critérios: função '));
const unified=read('web/scout-card-unified-v220.js');
assert(unified.includes('R.checkedEquipment?.({...card,capture:cap,id},manual,manualProof)'),
 'V266: painel unificado tem de conferir nativeFingerprint com as nativas da edição');
assert(read('web/sw.js').includes('v266-additional-evidence'));
assert(read('package.json').includes('test-additional-evidence-v266.cjs'));
assert.equal(JSON.stringify(cards),baseline);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),src);
console.log('V266 PASS: '+checks+' análises, nativas parciais sinalizadas em '+
 mappedNativePartial+' cenários; provas vinculadas à edição/lista/nativas; 246 cartas intactas.');
