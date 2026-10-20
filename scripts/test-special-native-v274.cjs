'use strict';
/* V274 — evidência de nomes NATIVOS especiais, não SKILLs selecionáveis.
 * Auditar 246 × 5 sem alterar dados, builds nem slots.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const original=JSON.stringify(cards),tactics=['posse','normal','rapido','fora','longo'];
assert.equal(cards.length,246);
const contextual=new Map(),unresolved=new Map(),byGroup=new Map(),record=[];
let scenarios=0,contextScenarios=0,nativeCount=0,recognized=0,unmatched=0;
for(const card of cards){
 const snapshot=JSON.stringify(card);
 const rawSkills=String(card.habilidades_nativas||'').split(';').map(s=>s.trim()).filter(Boolean);
 const profile=S.contextNativeProfile(rawSkills);
 const n=rawSkills.filter(name=>S.keyFor(name)).length;
 assert.equal(rawSkills.length,n+profile.known.length+profile.unknown.length,
  'Duplicação/alias em native parser #'+card.numero);
 for(const known of profile.known){
  assert.equal(S.contextForNative(known.name),known.group);
  assert(!S.keyFor(known.name),'Nativa especial não pode virar adicional genérico: '+known.name);
  const item=contextual.get(known.name)||{name:known.name,group:known.group,instances:0,cards:[]};
  item.instances++;item.cards.push(card.numero);contextual.set(known.name,item);
  byGroup.set(known.group,(byGroup.get(known.group)||0)+1);
 }
 for(const name of profile.unknown){
  const item=unresolved.get(name)||{name,instances:0,cards:[]};
  item.instances++;item.cards.push(card.numero);unresolved.set(name,item);
 }
 nativeCount+=rawSkills.length;recognized+=profile.known.length;unmatched+=profile.unknown.length;
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,pp:card.pp,
  recommended_levels:card.niveis,training_provisional:card.treino_proposto_nao_validado===true,
  boost1:card.impeto_fixo,boost2:card.impeto_extra};
 const profileRow={cap:card.numero,card_id:card.id,edition:card.versao,
  natives_contextual:profile.known,natives_unresolved:profile.unknown,styles:{}};
 for(const tactic of tactics){
  const skills=S.evaluate(d,tactic),dossier=S.evidenceDossier(d,tactic,B);
  const boosted=B.rank(card,tactic);
  assert.equal(skills.contextualNativeSkills.length,profile.known.length);
  assert.equal(skills.unmappedNativeSkills.length,profile.unknown.length);
  assert.deepEqual(Object.keys(skills.contextualNativeGroups).sort(),
   Object.keys(profile.groups).sort());
  assert.equal(dossier.contextualNatives.length,profile.known.length);
  assert.equal(skills.nativeCoverage,rawSkills.length?
   profile.unknown.length?'parcial':profile.known.length?
    'contextual_sem_efeito_validado':'lista_reconhecida':'nativas_ausentes');
  assert(skills.recommendations.length<=5);
  assert.equal(skills.slotsRemaining,null,'Sem prova de slots não inferir vagas');
  assert.equal(dossier.competitivelyApproved,false);
  assert.equal(dossier.maySpendTokensAutomatically,false);
  for(const item of skills.recommendations){
   assert(!rawSkills.map(S.keyFor).includes(item.key));
   assert(item.criterios.nativas>=0);
  }
  assert(boosted.every(x=>x.recomendacao_condicional===true));
  assert(boosted.every(x=>x.evidencias.atributos_finais_comprovados===false));
  assert(boosted.every(x=>Array.isArray(x.evidencias.nativas_contextuais_registradas)));
  if(profile.known.length)contextScenarios++;
  profileRow.styles[tactic]={firstSkill:skills.recommendations[0]?.name||null,
   booster:boosted[0]?.nome_pt||null,pp_status:boosted[0]?.evidencias.pp_status||null,
   contextualCoverage:skills.nativeCoverage,slotVerified:false};
  scenarios++;
 }
 assert.equal(JSON.stringify(card),snapshot);
 record.push(profileRow);
}
assert.equal(scenarios,1230);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
assert.equal(JSON.stringify(cards),original);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert.equal(unmatched,0,'Vocabulário especial do catálogo ainda tem nomes sem contexto: '+[...unresolved.keys()].join(', '));
assert.equal(contextual.size,47,'Lista contextual catalogada precisa preservar 47 nomes originais');
assert(contextScenarios>0);
// Mesmo perfil, somente a diferença DOCUMENTADA nas nativas especiais.
const synth={shown_position:'MO',attack_style:'Armador criativo',
 native_skills:'',pp:null,recommended_levels:null};
const score=(d,key)=>S.evaluate(d,'posse').recommendations
 .concat(S.evaluate(d,'posse').alternatives).find(x=>x.key===key)?.score||0;
assert(score({...synth,native_skills:'Phenomenal Pass'},'through')>
 score(synth,'through'),'Passe fenomenal especial deve afetar desempate de passe');
assert.equal(score({...synth,native_skills:'Gamesmanship'},'through'),
 score(synth,'through'),'Grupo especial sem evidência tática não pode ganhar pontos');
assert.equal(S.keyFor('Phenomenal Pass'),'');
assert.equal(S.keyFor('Marseille Turn'),'');
assert.equal(S.contextForNative('Passe sem olhar'),'distribuicao');
assert.equal(S.contextForNative('Cruzamento preciso'),'amplitude');
assert.equal(S.contextForNative('Aerial Fort'),'defesa');
const stopper={posicao:'DC',estilo_ataque:'Destruidor',habilidades_nativas:''};
const rank=d=>B.rank(d,'posse').find(b=>b.nome==='Shutdown').score;
assert(rank({...stopper,habilidades_nativas:'Aerial Fort'})>rank(stopper),
 'Defensor com recurso especial deve ter sinal apenas consultivo em defesa');
const provisional=cards.find(x=>x.numero===191);
assert.equal(S.investmentAudit({recommended_levels:provisional.niveis,pp:provisional.pp,
 training_provisional:true}).levels,null);
assert.equal(S.evaluate({shown_position:'PTE',attack_style:provisional.estilo_ataque,
 native_skills:provisional.habilidades_nativas,recommended_levels:provisional.niveis,
 pp:provisional.pp,training_provisional:true},'posse').investmentApplied,false);
const report={
 schema:'CRAQUE_V274_NATIVAS_ESPECIAIS_246_X_5',
 notes:'Nativas especiais são NOME ORIGINAL reconhecido como contexto. Não são habilidades adicionais equipáveis nem equivalência de efeito/overall confirmado.',
 total_cards:246,scenarios,nativeNames:contextual.size,nativeOccurrences:recognized,
 scenariosWithContextualNative:contextScenarios,unrecognizedOccurrences:unmatched,
 contextualGroups:Object.fromEntries([...byGroup].sort((a,b)=>b[1]-a[1])),
 glossary:[...contextual.values()].sort((a,b)=>b.instances-a.instances||a.name.localeCompare(b.name)),
 unknown:[...unresolved.values()],cards:record
};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v274-special-native-evidence-246x5.json'),
 JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v274-native-context'));
assert(read('package.json').includes('test-special-native-v274.cjs'));
console.log('V274 PASS: '+scenarios+' cenários, '+contextual.size+
 ' nomes especiais contextualizados, '+contextScenarios+
 ' avaliações com contexto e '+unmatched+' nativas sem classificação; 246 cartas intactas.');
