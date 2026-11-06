'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../web'),read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const refs=read('ct376-card-references.json'),roster=read('SCOUT_V69_AUDITORIA.json'),audit=read('ct381-level-audit.json');
const rating=require('../web/craque-rating-v376.js'),skills=require('../web/skills-booster-v162.js'),model=read('ct376-rating-model.json');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
assert.equal(refs.cards.length,261);
assert.equal(refs.cards.filter(c=>c.identityUsable&&c.reference?.baseStats).length,260);
for(let capture=226;capture<=246;capture++){
 const entry=refs.cards.find(c=>c.capture===capture),card=roster.cards.find(c=>c.numero===capture),proof=audit.cards.find(c=>c.capture===capture);
 const binding=entry.publicIdentityV393,ref=entry.reference;
 assert.equal(entry.cardId,String(card.id),'Preservar identificador cadastrado: '+capture);
 assert.equal(entry.cardKey,capture+'@'+card.id,'Preservar chave dos registros salvos: '+capture);
 assert.equal(entry.edition,card.versao,'Preservar edição cadastrada: '+capture);
 assert.equal(entry.cataloguePP,card.pp);assert.equal(entry.registeredMaxLevel,card.max_level);
 assert.equal(entry.identityStatus,'exact_artwork_match');assert.equal(entry.identityUsable,true);
 assert.equal(entry.candidateId,proof.sourceCardId);assert.equal(ref.cardId,entry.candidateId);
 assert.equal(binding.source,'ct381-level-audit.json');assert.equal(binding.matchStatus,'exact_artwork_match');
 assert.equal(binding.capture,capture);assert.equal(binding.catalogueId,String(card.id));assert.equal(binding.catalogueEdition,card.versao);
 assert.equal(binding.image,entry.image);assert.equal(binding.image,proof.artwork.image);
 assert.equal(binding.localImageSha256,proof.artwork.sha256);
 assert.equal(sha(fs.readFileSync(path.join(root,binding.image))),binding.localImageSha256,'Arte original mudou: '+capture);
 assert.equal(binding.publicImageUrl,proof.artwork.publicImage);assert.equal(binding.publicImageSha256,proof.artwork.publicImageSha256);
 assert.equal(binding.accountConfirmed,false);assert.equal(ref.accountConfirmed,false);
 assert.match(ref.url,new RegExp('^https://pesdb\\.net/efootball/players/[^/]+-'+entry.candidateId+'$'));
 assert.match(ref.htmlSha256,/^[a-f0-9]{64}$/);assert(Number.isFinite(Date.parse(ref.fetchedUtc)));
 assert.equal(Object.keys(ref.baseStats).length,26);assert(Object.values(ref.baseStats).every(v=>Number.isInteger(v)&&v>=0&&v<=120));
 assert(ref.edition&&!/PENDENTE/i.test(ref.edition));assert(ref.nativeSkills.length>0);
 assert.equal(rating.baseOverall(ref.baseStats,ref.position,ref.height,ref.weakFootAccuracy,model),ref.baseOverall,'Base pública coerente com OVR publicado: '+capture);
 const nativeKeys=list=>list.map(name=>skills.keyFor(name)||name.trim()).sort();
 assert.deepEqual(nativeKeys(ref.nativeSkills),nativeKeys(card.habilidades_nativas.split(/[;,]/)),'Nativas públicas compatíveis com as registradas: '+capture);
 assert.equal(ref.maxLevel,proof.decision.maxLevel);assert.equal(ref.maxPP,proof.decision.pp);
 assert.equal(ref.levelSourceUrl,proof.decision.url);assert.equal(ref.levelReviewV381.sha256,proof.decision.sha256);
 assert.equal(ref.levelReviewV381.confirmedInGame,false);
 assert.equal(typeof ref.extraSlotInPublicEdition,'boolean');assert(Array.isArray(ref.fixedBoosters));
 if([228,233,236].includes(capture)){
  assert.equal(ref.publicLevelDifferenceV393.adoptedMaxLevel,ref.maxLevel);
  assert.equal(ref.publicLevelDifferenceV393.reportedMaxLevel,ref.reportedMaxLevel);
  assert.equal(ref.publicLevelDifferenceV393.catalogueUnchanged,true);
 }
}
const messi=refs.cards.find(c=>c.capture===50),registered=roster.cards.find(c=>c.numero===50);
assert.equal(messi.identityUsable,false);assert.equal(messi.reference,null);assert.equal(messi.candidateId,undefined);
assert.equal(messi.publicIdentityV393,undefined);assert.equal(messi.cardId,String(registered.id));
assert.equal(messi.cataloguePP,56);assert.equal(messi.registeredMaxLevel,29);
assert.equal(refs.externalCards.length,3);
for(const entry of refs.externalCards){
 const ref=entry.reference;
 assert.equal(entry.identityUsable,true);assert.equal(entry.cardId,ref.cardId);
 assert.equal(ref.accountConfirmed,false);
 assert.equal(Object.keys(ref.baseStats).length,26);
 assert.match(ref.htmlSha256,/^[a-f0-9]{64}$/);
 assert.equal(ref.maxPP,entry.cataloguePP);
 assert.equal(ref.maxLevel,entry.registeredMaxLevel);
}
const bellingham=refs.externalCards.find(c=>c.cardId==='89138556700485');
assert.equal(bellingham.reference.extraSlotInPublicEdition,false);
assert.equal(bellingham.reference.publicBoosters.length,2);
console.log('V393 referências: 260 bases públicas; 21 vínculos exatos por arte; Messi pendente; identidades cadastradas preservadas PASS');
