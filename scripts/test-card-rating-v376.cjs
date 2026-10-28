'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../web'),file=path.join(root,'craque-rating-v376.js');
assert(fs.existsSync(file),'O app precisa de cálculo contextual de OVR, sem usar o número impresso no arquivo da imagem');
const R=require(file),data=JSON.parse(fs.readFileSync(path.join(root,'ct376-card-references.json'),'utf8'));
const model=JSON.parse(fs.readFileSync(path.join(root,'ct376-rating-model.json'),'utf8'));
assert.equal(data.cards.length,261);assert.equal(new Set(data.cards.map(x=>x.key)).size,261);
let baseCases=0;
for(const card of data.cards){
 const s=card.reference;if(!s)continue;
 assert.equal(R.baseOverall(s.baseStats,s.position,s.height,s.weakFootAccuracy,model),s.baseOverall,
  'Reproduzir o OVR base publicado, sem confundir com o máximo do banco: '+card.key);
 if(!s.levelValid)assert.equal(s.maxPP,null,'Nível1 ausente/inconsistente não autoriza PP0');
 baseCases++;
}
assert.equal(baseCases,239);
for(const key of ['ct364-11','ct364-12','ct364-13','ct364-14']){
 const card=data.cards.find(c=>c.key===key);
 assert.equal(card.identityStatus,'declared_edition_match','Respeitar a confirmação específica das quatro versões externas');
 assert.equal(card.identityUsable,true);
}
assert.equal(data.cards.find(c=>c.key==='ct364-12').reference.maxLevel,null,'Confirmação da edição não inventa o nível ausente do Provedel');
const ney=data.cards.find(x=>x.key==='cap:90'),maldini=data.cards.find(x=>x.key==='cap:10');
const current={cardKey:ney.key,cardId:ney.cardId,edition:ney.edition,position:'MLE',
 training:[4,8,8,8,8,2,6,0,0,0],budget:62,manager:null,extraBooster:null};
const before=JSON.stringify({ney,current});
const a=R.evaluate(ney,current,model);assert.equal(a.status,'estimated');assert.equal(a.spent,62);assert(Number.isInteger(a.overall));
const kovac={id:'CT-MGR-071',name:'Niko Kovač',proficiency:90,boosters:['Ball Control +1','Defensive Engagement +1']};
const b=R.evaluate(ney,{...current,manager:kovac},model);
assert.equal(b.status,'estimated');assert(b.overall>a.overall,'Técnico precisa afetar o OVR do mesmo treino');
assert.equal(b.stats.ball_control,Math.min(99,ney.reference.baseStats.ball_control+8+3)+1);
assert.equal(b.stats.speed,Math.min(99,ney.reference.baseStats.speed+8+3)+3);
assert.notEqual(R.contextKey(ney,current,model),R.contextKey(ney,{...current,manager:kovac},model));
const changed={...current,training:[8,8,8,8,7,4,0,0,0,0],position:'SA'};
assert.notEqual(R.contextKey(ney,current,model),R.contextKey(ney,changed,model));
assert.equal(R.evaluate(ney,{...current,training:null},model).status,'pending','Não tratar proposta ausente como treino aplicado');
assert.equal(R.evaluate(ney,{...current,position:'GO',training:Array(10).fill(0)},model).status,'pending','Jogador de linha não vira goleiro por trocar o contexto');
assert.equal(R.evaluate(ney,{...current,training:[20,20,20,20,20,20,20,0,0,0]},model).status,'pending');
assert.equal(R.evaluate(ney,{...current,cardId:'999999'},model).status,'pending');
assert.equal(R.evaluate(ney,{...current,manager:{...kovac,proficiency:91}},model).status,'pending');
assert.equal(R.evaluate(ney,{...current,manager:{...kovac,boosters:['bônus desconhecido']}},model).status,'pending');
assert.equal(R.evaluate(ney,{...current,extraBooster:{name:'Technique',confirmed:false}},model).stats.ball_control,a.stats.ball_control);
assert(R.evaluate(ney,{...current,extraBooster:{name:'Technique',confirmed:true}},model).stats.ball_control>a.stats.ball_control);
assert.deepEqual(R.evaluate(ney,{...current,extraBooster:{name:'Técnica',confirmed:true}},model).stats,
 R.evaluate(ney,{...current,extraBooster:{name:'Technique',confirmed:true}},model).stats,'Ímpeto PT-BR documentado deve ter o mesmo efeito');
assert.throws(()=>R.observation(ney,{...current,budget:0},model,103,true),/treino atual/);
const partial=R.evaluate(ney,{...current,training:[0,0,0,0,0,0,0,0,0,0]},model);
assert.equal(partial.remaining,62);assert.equal(partial.status,'estimated');
for(const key of ['cap:50','cap:61','cap:196']){
 const c=data.cards.find(x=>x.key===key);
 assert.equal(R.evaluate(c,{...current,cardKey:c.key,cardId:c.cardId,edition:c.edition},model).status,'pending');
}
assert.equal(R.evaluate(maldini,{...current,cardKey:maldini.key,cardId:maldini.cardId,edition:maldini.edition,position:'ZG',training:[0,0,0,0,0,0,0,4,4,4],budget:64},model).status,'pending','Treino de goleiro não vira treino de linha');
const proof=R.observation(ney,current,model,105,true);
assert.equal(R.readObservation(proof,ney,current,model).overall,105);
assert.equal(R.readObservation(proof,ney,{...current,manager:kovac},model),null);
assert.equal(R.readObservation({...proof,userConfirmed:false},ney,current,model),null);
const owned=JSON.parse(fs.readFileSync(path.join(root,'ct364-owned-cards.json'),'utf8')).cards[0];
const ownedRef=data.cards.find(c=>c.key===owned.key);
const meta=R.ownedMetadata(owned,{},ownedRef);
assert.equal(meta.level,31);assert.equal(meta.cardId,ownedRef.candidateId);
assert.equal(meta.source,'public_reference');assert.equal(meta.confirmedInGame,false);
const provedel=require('../web/ct364-owned-cards.json').cards.find(c=>c.key==='ct364-12');
const provedelRef=data.cards.find(c=>c.key===provedel.key);
assert.equal(R.ownedMetadata(provedel,{},provedelRef).cardId,provedelRef.reference.cardId);
assert.equal(R.ownedMetadata(provedel,{},provedelRef).level,null);
const manual=R.ownedMetadata(owned,{maxLevel:29,cardId:'999991111'},ownedRef);
assert.equal(manual.level,29);assert.equal(manual.cardId,'999991111');assert.equal(manual.engineEdition,'');
assert.equal(R.ownedMetadata(owned,{},data.cards.find(c=>c.key==='ct364-13')).level,null);
assert.equal(JSON.stringify({ney,current}),before,'Consulta não modifica carta, treino ou equipamentos');
console.log('V376 PASS: 261 referências, 239 bases, OVR contextual, técnico, PP, lacunas e observação isolada sem mutação.');
