// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V281: comparação cruzada HONESTA, sem forçar diversidade ou atribuir criador. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>historicalRead(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const initial=JSON.stringify(cards);
const roles=Object.keys(S.ROLE_TACTIC_SKILLS);
assert.equal(roles.length,10,'Dez funções devem receber lente tática própria');
for(const role of roles)for(const tactic of B.tactics){
 const keys=S.ROLE_TACTIC_SKILLS[role][tactic];
 assert(Array.isArray(keys)&&keys.length>=2&&keys.length<=4);
 assert.equal(new Set(keys).size,keys.length);
 assert(keys.every(x=>Boolean(S.SKILLS[x])),'Skill inexistente na função '+role+' / '+tactic);
}
assert.equal(cards.length,246);assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
const grouped=new Map(),files=[];
let scenarios=0,pairs=0,identicalPairs=0,highOverlapPairs=0,
 noSkillPairCount=0,uniformTopSkill=0,uniformTopBooster=0,missingBase=0,provisional=0;
for(const c of cards){
 const before=JSON.stringify(c);
 const d={capture:c.numero,id:c.id,edition:c.versao,shown_position:c.posicao,
  original_position:c.posicao,role_used:c.posicao,
  attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
  native_skills:c.habilidades_nativas,pp:c.pp,recommended_levels:c.niveis,
  training_provisional:c.treino_proposto_nao_validado===true,
  boost1:c.impeto_fixo,boost2:c.impeto_extra};
 const dossier=S.evidenceDossier(d,'posse',B);
 const matrix=dossier.decisionMatrix;
 assert.equal(matrix.schema,'CRAQUE_V281_CROSS_TACTIC_DIAGNOSTIC');
 assert.equal(matrix.tactics,5);assert.equal(matrix.pairCount,10);
 assert.equal(matrix.rows.length,5);assert.equal(matrix.pairs.length,10);
 assert.deepEqual(matrix.rows.map(x=>x.tactic),B.tactics);
 assert.equal(matrix.canModifyBuild,false);assert.equal(matrix.canEquipSkills,false);
 assert.equal(matrix.canEquipBooster,false);
 assert.equal(dossier.creatorVerified,false);assert.equal(dossier.competitivelyApproved,false);
 assert.equal(dossier.maySpendTokensAutomatically,false);
 assert.equal(matrix.uniqueFirstSkills,new Set(matrix.rows.map(x=>x.topSkill).filter(Boolean)).size);
 assert.equal(matrix.uniqueFirstBoosters,new Set(matrix.rows.map(x=>x.topBooster).filter(Boolean)).size);
 for(const row of matrix.rows){
  const result=S.evaluate(d,row.tactic),booster=S.booster(d,row.tactic,B);
  assert.deepEqual(result.tacticalRolePriorities,S.ROLE_TACTIC_SKILLS[result.role][row.tactic]);
  assert.equal(result.tacticalReason,S.TACTIC_REASON[row.tactic]);
  assert.deepEqual(row.skills,result.recommendations.map(x=>x.key));
  assert.deepEqual(row.balancedSkills,result.balancedPortfolio.candidates.map(x=>x.key));
  assert.equal(row.topSkill,result.recommendations[0]?.name||null);
  assert.equal(row.topBooster,booster.primary?.nome||null);
  assert.equal(row.canEquip,false);
  assert(row.skills.length<=5);
  assert(new Set(row.skills).size===row.skills.length);
  const nativeKeys=new Set(String(c.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
  assert(row.skills.every(x=>!nativeKeys.has(x)), 'Repetição da nativa no Card ID '+c.id);
  const sig=[row.tactic,c.posicao,c.estilo_ataque,c.estilo_defesa,row.skills.join(','),
   row.topBooster||'pendente'].join('|');
  if(!grouped.has(sig))grouped.set(sig,[]);
  grouped.get(sig).push({cap:c.numero,cardId:c.id,edition:c.versao,
   nativeFingerprint:S.fingerprint(c.habilidades_nativas)});
  scenarios++;
 }
 for(const p of matrix.pairs){
  assert(B.tactics.includes(p.first)&&B.tactics.includes(p.second));
  const a=matrix.rows.find(x=>x.tactic===p.first),b=matrix.rows.find(x=>x.tactic===p.second);
  const union=new Set([...a.skills,...b.skills]),common=a.skills.filter(x=>b.skills.includes(x)).length;
  const expected=union.size?Math.round(common/union.size*100):null;
  assert.equal(p.overlapPercent,expected);
  assert.equal(p.sharedSkills,common);
  assert.equal(p.totalDistinctSkills,union.size);
  assert.equal(p.topSkillSame,Boolean(a.topSkill&&b.topSkill&&a.topSkill===b.topSkill));
  assert.equal(p.boosterSame,Boolean(a.topBooster&&b.topBooster&&a.topBooster===b.topBooster));
  if(p.verdict==='LISTAS_IDENTICAS')assert(common===union.size&&union.size>0);
  if(p.verdict==='SEM_CANDIDATOS_CONFERIDOS')assert.equal(union.size,0);
  pairs++;if(p.verdict==='LISTAS_IDENTICAS')identicalPairs++;
  if(p.overlapPercent!==null&&p.overlapPercent>=80)highOverlapPairs++;
  if(p.overlapPercent===null)noSkillPairCount++;
 }
 if(matrix.uniqueFirstSkills===1)uniformTopSkill++;
 if(matrix.uniqueFirstBoosters===1)uniformTopBooster++;
 if(!dossier.evidenceChecklist.find(x=>x.key==='atributos').ok)missingBase++;
 if(!dossier.evidenceChecklist.find(x=>x.key==='pp').ok)provisional++;
 assert.equal(JSON.stringify(c),before,'Carta alterada #'+c.numero);
 files.push({cap:c.numero,cardId:c.id,edition:c.versao,role:dossier.role,
  evidence:dossier.documentedIndicators,training:dossier.trainingStatus,
  native:dossier.nativeCoverage,matrix,allowedToApply:false});
}
assert.equal(scenarios,1230);assert.equal(pairs,2460);
assert.equal(JSON.stringify(cards),initial);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
// Igualdade de fórmula não equivale a duas builds idênticas comprovadas.
const warnings=[...grouped.entries()].filter(([,rows])=>rows.length>=2&&
 new Set(rows.map(x=>x.nativeFingerprint)).size>1).map(([signature,rows])=>({
 signature,players:rows,distinctNativeProfiles:new Set(rows.map(x=>x.nativeFingerprint)).size
})).sort((a,b)=>b.players.length-a.players.length);
for(const group of warnings){
 assert(group.players.length>=2);
 assert(group.distinctNativeProfiles>=2);
 // O catálogo possui IDs ainda pendentes e alguns ID repetidos entre
 // edições distintas. Não inventar unicidade de Card ID nem de Player ID.
 assert.equal(new Set(group.players.map(x=>x.cap)).size,group.players.length);
}
const simple=tactic=>( {style:tactic,skillKeys:['onepass','through'],
 balancedKeys:['onepass','through'],firstSkill:'Passe de primeira',technicalName:'Technique',
 skillMargin:0,margin:1} );
const identical=S.decisionMatrixFromScenarios(B.tactics.map(simple));
assert.equal(identical.pairCount,10);
assert.equal(identical.repeatedPairs,10);
assert.equal(identical.similarPairs80,10);
assert.equal(identical.uniqueFirstSkills,1);
assert.equal(identical.uniqueFirstBoosters,1);
assert(identical.warnings.length>=3);
const empty=S.decisionMatrixFromScenarios(B.tactics.map(tactic=>({
 style:tactic,skillKeys:[],balancedKeys:[],firstSkill:null,technicalName:null
})));
assert.equal(empty.repeatedPairs,0);
assert.equal(empty.similarPairs80,0);
assert(empty.pairs.every(p=>p.overlapPercent===null&&p.verdict==='SEM_CANDIDATOS_CONFERIDOS'));
assert.throws(()=>S.decisionMatrixFromScenarios([]),/exatamente cinco/);
const noProof={...cards.find(x=>x.numero===191)};
assert.equal(noProof.pp,50);assert.equal(noProof.max_level,26);
const placeholderCards=cards.filter(x=>/pendente|não inferido|nao inferido/i.test(String(x.id)));
const byCardId=new Map();
for(const c of cards){
 const group=byCardId.get(String(c.id))||[];
 group.push({cap:c.numero,edition:c.versao});
 byCardId.set(String(c.id),group);
}
const reusedIdentifiers=[...byCardId.entries()]
 .filter(([id,group])=>group.length>1&&!/pendente|não inferido|nao inferido/i.test(id))
 .map(([id,group])=>({cardId:id,editions:group}));
const result={schema:'CRAQUE_V281_COMPARADOR_COMPETITIVO',cards:246,scenarios,pairs,
 pendingIdentityCards:placeholderCards.map(x=>({cap:x.numero,id:x.id,edition:x.versao})),
 reusedIdentityGroups:reusedIdentifiers,
 identicalPairs,highOverlapPairs,noSkillPairCount,
 uniformTopSkill,uniformTopBooster,missingBase,provisional,
 differentNativeProfilesWithSameRecommendations:warnings.length,
 warning:'Pares iguais são sinais de revisão, não erro automático e não justificam alterar PP ou builds.',
 cloneReview:warnings.slice(0,100),records:files};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v281-matrix-246x5.json'),JSON.stringify(result,null,2)+'\n');
assert(read('web/sw.js').includes('v281-cross-tactic'));
assert(read('package.json').includes('test-cross-tactic-matrix-v281.cjs'));
console.log('V281 PASS: '+scenarios+' cenários, '+pairs+' pares táticos, '+
 identicalPairs+' pares idênticos, '+warnings.length+
 ' agrupamentos potencialmente genéricos com nativas diferentes; 246 cartas intactas.');
