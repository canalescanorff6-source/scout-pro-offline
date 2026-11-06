'use strict';
const assert=require('node:assert/strict');
const T=require('../web/scout-multitactic-engine-v220.js');
const F=require('../web/craque-friends-training-v228.js');
const G=require('../web/craque-global-v394.js');
const P=require('../web/craque-physical-v395.js');
const cards=require('../web/ct376-card-references.json').cards;
const byCap=n=>cards.find(x=>x.capture===n);
const make=(r,style='Artilheiro')=>({
 capture:r.capture,localKey:r.cardKey,name:r.name,cardId:String(r.reference.cardId),
 edition:r.reference.edition,position:r.position,originalPosition:r.position,
 style,pp:r.cataloguePP,level:r.registeredMaxLevel,
 trainingLevels:r.registeredLevels||null,
 nativeSkills:(r.reference.nativeSkills||[]).join('; '),
 fixedBooster:(r.reference.fixedBoosters||[]).map(x=>x.name).join('; '),
 boosterSlot:'pendente',skills:'',reference:r
});
const deps={tactical:T,universal:G,physical:P};
const modes=G.MODES;
const cristianoBT=make(byCap(24)),cristianoEpic=make(byCap(27));
const drogba=make(byCap(45)),suarez=make(byCap(26));
assert.equal(cristianoBT.pp,drogba.pp,'Duelo de mesma função e PP para teste controlado');
assert.equal(cristianoBT.style,drogba.style,'Duelo de mesmo estilo individual para teste controlado');
assert.equal(cristianoBT.position,drogba.position);
function verify(card){
 const plans=modes.map(mode=>F.allocate(card,mode,deps));
 assert(plans.every(p=>p.status==='hipotese'&&p.global?.kind==='hipotese_por_edicao'));
 const signatures=new Set(plans.map(p=>JSON.stringify(p.levels)));
 assert.equal(signatures.size,1,'Mudar o técnico não pode alterar os níveis globais');
 assert.equal(T.total(plans[0].levels),card.pp,'A ficha deve gastar PP exatamente');
 assert(plans[0].global.evidence.baseStatsCount>=17);
 return plans[0].levels;
}
const bt=verify(cristianoBT),epic=verify(cristianoEpic),dg=verify(drogba),su=verify(suarez);
assert.notDeepEqual(bt,dg,'Mesmos PP/estilo/posição, mas atributos e identidade distintos');
assert.notDeepEqual(bt,epic,'Cristiano Big Time e Epic são analisados por suas edições distintas');
assert.notDeepEqual(dg,su,'Drogba e Suárez não usam um template de CA');
const nihat=verify(make(byCap(37),'Artilheiro'));
assert.notDeepEqual(bt,nihat,'Cristiano e Nihat têm mesmo estilo/CA/62 PP e bases diferentes');
const vanBasten=verify(make(byCap(25),'Homem de área'));
const drogbaReal=verify(make(byCap(45),'Homem de área'));
assert.notDeepEqual(vanBasten,drogbaReal,
 'Van Basten e Drogba têm mesmo estilo/CA/62 PP e bases diferentes');
const renamed=verify({...cristianoBT,name:'Apelido de exibição'});
assert.deepEqual(bt,renamed,'Alterar nome NÃO pode fabricar distribuição diferente');
const withoutEvidence=F.allocate({...cristianoBT,reference:null},'posse',deps);
assert.equal(withoutEvidence.status,'pendente','Dados não comprovados não viram ficha genérica');
assert.equal(withoutEvidence.levels,null);
const fake=F.allocate({...cristianoBT,reference:byCap(27)},'rapido',deps);
assert.equal(fake.status,'pendente','Card ID/edição divergentes precisam ser bloqueados');
assert.equal(P.lookup(cristianoBT),null,'Não inventar pernas diferentes para o Cristiano');
assert.equal(P.lookup(cristianoEpic),null,'Não inferir biotipo por raridade');
const maldini=make(byCap(10));
assert(P.lookup(maldini)?.legLength>=1,'Corpo vinculado por identidade quando documentado');
assert.equal(P.lookup({...maldini,cardId:'999999999999'}),null,'Corpo de outra edição não deve ser usado');
console.log('V395 PASS: 6 estilos, PP exatos, Cristiano BT/Epic, Drogba/Suárez, evidência corporal e antitemplate.');
