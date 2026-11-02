'use strict';
const assert=require('node:assert/strict'),V=require('../web/craque-level-review-v381.js');
const card={numero:16,id:'105802492921775',name:'Dayot Upamecano',versao:'Highlight',pp:52,max_level:27};
const source={id:card.id,url:'https://efhub.com/players/'+card.id,sha256:'a'.repeat(64),
 data:{cardId:card.id,name:card.name,levelCap:29,playerType:6}};
const before=JSON.stringify({card,source});
let out=V.decide(card,source);assert.equal(out.maxLevel,29);assert.equal(out.pp,56);assert.equal(out.confirmedInGame,false);
assert.equal(out.sourceKind,'efhub_public');assert.equal(out.status,'reviewed');
assert.equal(V.decide(card,{...source,data:{...source.data,cardId:'999999999'}}).status,'pending');
assert.equal(V.decide(card,{...source,data:{...source.data,levelCap:1}}).pp,null,'Nível 1 treinável não comprova 0 PP');
assert.equal(V.decide(card,{...source,data:{...source.data,levelCap:0}}).pp,null);
const fixed=V.decide(card,{...source,data:{...source.data,levelCap:1,playerType:3}});
assert.equal(fixed.maxLevel,1);assert.equal(fixed.pp,0);assert.equal(fixed.fixed,true);
const supplement={id:card.id,maxLevel:33,url:'https://pesdb.net/efootball/players/'+card.id,sha256:'b'.repeat(64)};
assert.equal(V.decide(card,{...source,data:{...source.data,levelCap:0}},{supplement}).pp,64);
assert.equal(V.decide(card,{...source,data:{...source.data,levelCap:0}},{supplement:{...supplement,id:'111111111'}}).pp,null);
const havertz={...card,numero:41,id:'105837389528906',name:'Kai Havertz',pp:50,max_level:26};
const hs={...source,id:havertz.id,data:{...source.data,cardId:havertz.id,levelCap:26}};
const capture={capture:41,cardId:havertz.id,level:32,automaticallyDisplayed:true,source:'captura fornecida pelo proprietário em 31/10/2026'};
const h=V.decide(havertz,hs,{capture});assert.equal(h.maxLevel,32);assert.equal(h.pp,62);
assert.equal(h.sourceKind,'owner_efhub_capture');assert.equal(h.publicLevel,26);assert.equal(h.conflict,true);assert.equal(h.confirmedInGame,false);
assert.equal(V.decide(card,source,{capture}).maxLevel,29,'Captura de outra carta nunca se aplica');
assert.equal(JSON.stringify({card,source}),before);
assert.doesNotThrow(()=>V.decide({id:card.id,name:card.name},source,{capture:null}));
const unresolved={numero:50,id:'PENDENTE',name:'Lionel Messi',versao:'arte ainda não vinculada',max_level:29,pp:56};
const ownerReport={capture:50,catalogueId:unresolved.id,name:unresolved.name,edition:unresolved.versao,
 level:29,pp:56,reportedByOwner:true,source:'Resposta do proprietário em 01/11/2026: eFHUB 29/56'};
const reported=V.decide(unresolved,null,{ownerReport});
assert.equal(reported.status,'reviewed');assert.equal(reported.sourceKind,'owner_efhub_report');
assert.equal(reported.pp,56);assert.equal(reported.identityPending,true);assert.equal(reported.cardId,null);
assert.equal(reported.url,null);assert.equal(reported.confirmedInGame,false);
for(const change of [{capture:183},{catalogueId:'outra'},{name:'Outro Messi'},{edition:'outra edição'},{pp:54}])
 assert.equal(V.decide(unresolved,null,{ownerReport:{...ownerReport,...change}}).status,'pending','Relato limitado à carta e orçamento informados');
console.log('V381 policy PASS: edição exata, PP, nível ausente/fixo, fonte complementar e captura explícita sem inventar confirmação no jogo.');
