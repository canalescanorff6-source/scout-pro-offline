// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V278 — anti-stale equipment/booster proof, per-card documentary roadmap. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>historicalRead(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const pristine=JSON.stringify(cards);assert.equal(cards.length,246);
assert.equal(new Set(cards.map(x=>x.numero+'@'+x.id)).size,246);
let count=0,missing=0,validVectors=0,boosterUnverified=0,skillsUnverified=0;
const profile=[];
for(const c of cards){
 const previous=JSON.stringify(c),record={cap:c.numero,id:c.id,edition:c.versao,styles:{}};
 const d={capture:c.numero,id:c.id,edition:c.versao,shown_position:c.posicao,
  original_position:c.posicao,role_used:c.posicao,attack_style:c.estilo_ataque,
  defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,pp:c.pp,
  recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true,
  boost1:c.impeto_fixo,boost2:c.impeto_extra};
 for(const tactic of B.tactics){
  const item=S.evidenceDossier(d,tactic,B),roadmap=item.roadmap;
  const proof=S.boosterRecordEvidence(d,null);
  assert.equal(roadmap.total,7);
  assert.equal(roadmap.checked,item.documentedIndicators);
  assert.deepEqual(roadmap.missing.map(x=>x.key),
   item.evidenceChecklist.filter(x=>!x.ok).map(x=>x.key));
  assert.equal(roadmap.missing.length,7-item.documentedIndicators);
  assert.equal(roadmap.competitiveApproval,false);
  assert.equal(roadmap.creatorAttributionAllowed,false);
  assert.equal(roadmap.mayWriteTraining,false);
  assert.equal(roadmap.maySpendTokens,false);
  assert.equal(roadmap.sourceStatus,'VIDEO_EXATO_AINDA_NAO_DOCUMENTADO');
  assert.equal(item.creatorVerified,false);
  assert.equal(item.maySpendTokensAutomatically,false);
  assert.equal(proof.valid,false);
  assert.equal(proof.status,null);
  assert.equal(S.checkedEquipment(d,'',null),false);
  if(!item.evidenceChecklist.find(x=>x.key==='pp').ok)missing++;
  else validVectors++;
  if(!item.evidenceChecklist.find(x=>x.key==='impeto').ok)boosterUnverified++;
  if(!item.evidenceChecklist.find(x=>x.key==='adicionais').ok)skillsUnverified++;
  record.styles[tactic]={
   checklist:item.evidenceChecklist.map(x=>({key:x.key,ok:x.ok})),
   firstAction:roadmap.firstAction,missing:roadmap.missing,
   notes:item.evidencePending,creatorVerified:false};
  count++;
 }
 assert.equal(JSON.stringify(c),previous);
 profile.push(record);
}
assert.equal(count,1230);assert.equal(JSON.stringify(cards),pristine);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
const source=cards.find(x=>x.numero===1),native=source.habilidades_nativas;
const d={capture:source.numero,id:source.id,edition:source.versao,
 native_skills:native,shown_position:source.posicao,boost1:source.impeto_fixo};
const manual='Passe de primeira; Toque duplo';
const proof={schema:'CRAQUE_ADDITIONAL_V254',capture:d.capture,card_id:d.id,
 edition:d.edition,confirmed:true,fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(native)};
assert.equal(S.checkedEquipment(d,manual,proof),true);
assert.equal(S.checkedEquipment(d,manual,{...proof,edition:undefined}),false);
assert.equal(S.checkedEquipment(d,manual,{...proof,edition:'versao diferente'}),false);
assert.equal(S.checkedEquipment(d,manual,{...proof,nativeFingerprint:undefined}),false);
assert.equal(S.checkedEquipment(d,manual,{...proof,nativeFingerprint:'original antigo'}),false);
assert.equal(S.checkedEquipment(d,manual,{...proof,confirmed:false}),false);
assert.equal(S.checkedEquipment({...d,id:'outra'},manual,proof),false);
assert.equal(S.checkedEquipment({...d,native_skills:native+'; Bloqueador'},manual,proof),false);
assert.equal(S.checkedEquipment(d,'Passe de primeira; One-touch Pass',{
 ...proof,fingerprint:S.fingerprint('Passe de primeira; One-touch Pass')}),false);
assert.equal(S.checkedEquipment(d,'Passe de primeira; Habilidade desconhecida',{
 ...proof,fingerprint:S.fingerprint('Passe de primeira; Habilidade desconhecida')}),false);
const many='Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Bloqueador; Interceptação';
assert.equal(S.checkedEquipment(d,many,{...proof,fingerprint:S.fingerprint(many)}),false);
const legacy={...proof};delete legacy.edition;delete legacy.nativeFingerprint;
assert.equal(S.checkedEquipment(d,manual,legacy),false);
assert.equal(S.checkedEquipment(d,'',{...proof,fingerprint:S.fingerprint('')}),true);
const confirmedBoost={schema:'CRAQUE_BOOST_SLOT_V283',capture:d.capture,
 card_id:d.id,edition:d.edition,status:'vazio',equipped:''};
assert.equal(S.boosterRecordEvidence(d,confirmedBoost).valid,true);
assert.equal(S.boosterRecordEvidence(d,confirmedBoost).status,'vazio');
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,capture:d.capture+1}).valid,false);
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,schema:undefined}).valid,false);
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,equipped:'Agility'}).valid,false);
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,edition:null}).valid,false);
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,card_id:'outra'}).valid,false);
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,status:'indefinido'}).valid,false);
assert.equal(S.boosterRecordEvidence(d,{...confirmedBoost,edition:undefined}).legacy,true);
assert.equal(S.boosterRecordEvidence(d,null).legacy,false);
const allOk=[{key:'identidade',ok:true},{key:'posicao',ok:true},
 {key:'nativas',ok:true},{key:'pp',ok:true},{key:'adicionais',ok:true},
 {key:'impeto',ok:true},{key:'atributos',ok:true}];
const candidateRoadmap=S.evidenceRoadmap(allOk,{creatorSource:{url:'https://youtube.com/watch?v=example'}});
assert.equal(candidateRoadmap.videoSourceCandidate,true);
assert.equal(candidateRoadmap.creatorAttributionAllowed,false);
assert.equal(candidateRoadmap.competitiveApproval,false);
assert.equal(candidateRoadmap.sourceStatus,'VIDEO_CANDIDATO_NAO_VERIFICADO');
assert(candidateRoadmap.firstAction.includes('Rever a edição'));
const martin=cards.find(x=>x.numero===191);
assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
const moved=S.evidenceDossier({capture:191,id:martin.id,edition:martin.versao,
 original_position:'PTE',shown_position:'CA',role_used:'CA',
 native_skills:martin.habilidades_nativas,attack_style:martin.estilo_ataque,
 pp:martin.pp,recommended_levels:martin.niveis,
 training_provisional:true},'posse',B);
assert.equal(moved.originalPosition,'PTE');
assert.equal(moved.roleApproved,false);
assert(moved.roadmap.missing.some(x=>x.key==='posicao'));
assert(moved.roadmap.missing.some(x=>x.key==='pp'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
const output={schema:'CRAQUE_V278_AUDITORIA_DOCUMENTAL_246X5',
 cards:246,scenarios:count,missingTrainingScenarios:missing,
 confirmedMathVectors:validVectors,unverifiedAdditionalScenarios:skillsUnverified,
 unverifiedBoosterScenarios:boosterUnverified,
 warning:'Não modificar builds aprovadas, não importar prova legada, não atribuir fichas sem vídeo da edição exata.',
 profiles:profile};
fs.writeFileSync(path.join(root,'build/v278-evidence-readiness-246x5.json'),JSON.stringify(output,null,2)+'\n');
assert(read('package.json').includes('test-proof-readiness-v278.cjs'));
assert(read('web/sw.js').includes('v278-proof-ready'));
console.log('V278 PASS: '+count+' cenários, '+validVectors+
 ' vetores matemáticos, '+skillsUnverified+' verificações de habilidades pendentes, '+
 boosterUnverified+' ímpetos sem slot confirmado. 246 cartas intactas; legacy invalidado sem apagar dados.');
