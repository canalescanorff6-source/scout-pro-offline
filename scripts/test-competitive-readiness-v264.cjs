'use strict';
/* V264: auditoria de 246 edições × cinco estilos com rastreabilidade.
 * Não modifica build, não homologa jogador por Overall nem usa IA para
 * completar habilidades, Card IDs, atributos-base, vídeos ou boosters.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const C=require('../web/craque-competitive-readiness-v264.js');
const snapshot=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(snapshot).cards;
const rows=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
assert.equal(cards.length,246);assert.equal(rows.length,246);
const index=new Map(rows.map(r=>[r.numero,r]));
assert.equal(index.size,246);
const original=JSON.stringify(cards);
let count=0,invalid=0,noTraining=0,noNative=0,ready=0;
const classes={};
function labOf(card){
 const html=read('web/'+card.arquivo);
 const found=html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(found,'Laboratório ausente para #'+card.numero);
 return JSON.parse(found[1]);
}
for(const card of cards){
 const lab=labOf(card),proof=V.proofChecklist(card,index.get(card.numero),lab,null);
 const same=JSON.stringify(card);
 for(const style of C.styles){
  const decision=V.methodologyGate(card,proof,style,null);
  const status=C.assess(card,proof,style,decision);
  assert.equal(status.capture,card.numero);
  assert.equal(status.card_id,String(card.id));
  assert.equal(status.style,style);
  assert.equal(status.competitivelyHomologated,false);
  assert.equal(status.allowedToReplaceApprovedBuild,false);
  assert.equal(status.canSpendTokensAutomatically,false);
  assert.equal(status.selectedSkillTokenCost,100);
  assert.equal(status.missing.length+status.documentationCount,9);
  assert(Object.hasOwn(C.STATUS,status.classification));
  assert.equal(status.allowedToPresentCandidates,status.sources.identity);
  if(!status.sources.identity){
   assert.equal(status.classification,'blocked');
   assert.equal(status.additional,'sem_indicacao_confiavel');
   assert.equal(status.booster,'identidade_pendente');
  }
  if(status.training==='ausente_ou_pendente')
   assert(status.missing.includes('Vetor de treino original registrado'));
  if(!status.sources.natives)
   assert(status.additional==='nativas_pendentes'||status.additional==='sem_indicacao_confiavel');
  if(status.booster==='elegivel_apos_provas_de_slot')
   assert(status.sources.identity&&status.sources.slot);
  classes[status.classification]=(classes[status.classification]||0)+1;
  count++;
 }
 if(!proof.checks.find(x=>x.id==='edition').documented)invalid++;
 if(!Array.isArray(card.niveis))noTraining++;
 if(!card.habilidades_nativas)noNative++;
 if(proof.competitivelyVerified)ready++;
 assert.equal(JSON.stringify(card),same,'Não modificar #'+card.numero);
}
assert.equal(count,1230);
assert(invalid>0&&noTraining>0&&noNative>0);
const messi=cards.find(c=>c.numero===50),martinelli=cards.find(c=>c.numero===191);
assert(messi&&martinelli);
const invalidProof=V.proofChecklist(messi,index.get(50),labOf(messi),null);
assert.equal(C.assess(messi,invalidProof,'posse').classification,'blocked');
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
const validProof=V.proofChecklist(martinelli,index.get(191),labOf(martinelli),null);
const entry=C.assess(martinelli,validProof,'posse',V.methodologyGate(martinelli,validProof,'posse',null));
assert.equal(entry.sources.identity,true);
assert.equal(entry.training,'registrada_sem_homologacao');
assert.equal(entry.competitivelyHomologated,false);
const fabricated={...martinelli,id:'PENDENTE - confirmar'};
const fabricatedProof={...validProof,matched:true,
 checks:validProof.checks.map(c=>c.id==='edition'?{...c,documented:true}:c)};
assert.equal(C.assess(fabricated,fabricatedProof,'posse').classification,'blocked');
const shortPlayerId={...martinelli,id:'105297',versao:'Edição cadastrada'};
assert.equal(C.assess(shortPlayerId,fabricatedProof,'posse').sources.identity,true,
 'Player ID numérico curto por si só não é inválido');
const v251=read('web/craque-ficha-individual-v251.js');
assert(v251.includes("const C=host?.CRAQUE_COMPETITIVE_READINESS_V264"));
assert(v251.includes("const readiness=C?.assess?.(card,proof,active,method)"));
assert(v251.includes('ct264-status'));
assert(v251.includes('const safeEdition=has('));
const bridge=read('web/app-bridge.js');
assert(bridge.includes('craque-competitive-readiness-v264.js'));
assert(bridge.includes('position251.onload=loadReadiness;'));
assert(read('web/sw.js').includes('v264-competitive-readiness'));
assert(read('web/sw.js').includes('./craque-competitive-readiness-v264.js'));
assert(read('package.json').includes('test-competitive-readiness-v264.cjs'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),snapshot);
assert.equal(JSON.stringify(cards),original);
console.log('V264 PASS: '+count+' avaliações, 246 edições intactas.');
console.log('PENDÊNCIAS DO CATÁLOGO: sem identidade documental='+invalid+
 ', sem vetor registrado='+noTraining+', sem nativas='+noNative+
 ', com gameplay/documento mínimo (não homologadas automaticamente)='+ready);
console.log('CLASSIFICAÇÃO DOS CENÁRIOS: '+JSON.stringify(classes));
