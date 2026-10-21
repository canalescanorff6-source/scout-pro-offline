'use strict';
/* V249: conferência local precisa aparecer SEM transformar build em aprovada
 * e SEM alterar as 246 cartas, imagens, Card IDs ou PP definitivos. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalogBefore=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(catalogBefore).cards;
const P=require('../web/craque-progresso-v248.js');
const V=require('../web/craque-progress-consistency-v249.js');
const memory=new Map();
const store={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const confirmed=(card,level)=>({
 schema:P.SCHEMA,numero:card.numero,card_id:card.id,name:card.name,edition:card.versao,level,
 pp:P.budget(level),confirmed_in_game:true,
 confirmed_at:'2026-10-19T02:20:00.000Z',source:'conferência manual no eFootball'
});
assert.equal(cards.length,246);
assert.equal(P.PREFIX,V.PREFIX);
assert.equal(P.SCHEMA,V.SCHEMA);
assert.equal(V.ppForLevel(26),50);
assert.equal(V.ppForLevel(33),64);
for(const value of [0,-1,121,null,'26',NaN,4.25])assert.equal(V.ppForLevel(value),null);
assert.equal(V.points([4,4,8,10,8,0,0,0,0,0]),50);
assert.equal(V.points([4,4,8,8,10,0,0,0,0,0]),50);
for(const invalid of [null,[],[1,2,3],Array(10).fill(-1),Array(10).fill(2.5)])
 assert.equal(V.points(invalid),null);
const martinelli=cards.find(c=>c.numero===191);
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
assert.equal(martinelli.id,'105850811319718');
let view=V.reconcile(martinelli,store,[{label:'Principal',levels:martinelli.niveis}]);
assert.equal(view.status,'registrado');
assert.equal(view.mismatch,false);
assert.equal(view.exceeds_budget,false);
store.setItem(V.key(martinelli),JSON.stringify(confirmed(martinelli,26)));
view=V.reconcile(martinelli,store,[{label:'Principal',levels:martinelli.niveis}]);
assert.equal(view.status,'confirmado_localmente');
assert.equal(view.local_level,26);
assert.equal(view.local_pp,50);
assert.equal(view.mismatch,false);
assert.equal(view.exceeds_budget,false);
store.removeItem(V.key(martinelli));
const unknown=cards.find(c=>!Number.isInteger(c.max_level));
assert(unknown&&unknown.id);
view=V.reconcile(unknown,store,[{label:'Registrada',levels:unknown.niveis}]);
assert.equal(view.status,'pendente');
assert.equal(view.saved,null);
const level=Math.min(120,Math.max(1,unknown.pp/2));
assert(Number.isInteger(level));
const disagreeing=confirmed(unknown,level);
assert.notEqual(disagreeing.pp,unknown.pp);
const proofKey=V.key(unknown);
store.setItem(proofKey,JSON.stringify(disagreeing));
const originalSnapshot=JSON.stringify(unknown);
const preExisting=[{label:'Principal',levels:unknown.niveis}];
view=V.reconcile(unknown,store,preExisting);
assert.equal(view.status,'divergente');
assert.equal(view.mismatch,true);
assert.equal(view.local_pp,disagreeing.pp);
assert.equal(view.original_pp,unknown.pp);
if(V.points(unknown.niveis)>disagreeing.pp){
 assert.equal(view.exceeds_budget,true);
 assert(view.exceeded.some(x=>x.label==='Principal'));
}
assert.equal(JSON.stringify(unknown),originalSnapshot,'Não alterar build original');
assert.equal(P.state(unknown,P.readSaved(unknown,store)),'divergente');
for(const bad of [
 {...disagreeing,card_id:'outra-edicao'},
 {...disagreeing,edition:'outro pacote, mesmo Card ID'},
 {...disagreeing,edition:undefined},
 {...disagreeing,confirmed_in_game:false},
 {...disagreeing,level:121},
 {...disagreeing,name:'homônimo'},
 {...disagreeing,numero:unknown.numero+1},
]){
 assert.equal(V.validated(unknown,bad),null,'Recusar falso comprovante de outra edição ou nível inválido');
}
const samePersonOtherCard=cards.find(c=>c.numero!==unknown.numero&&c.name===unknown.name);
if(samePersonOtherCard)assert.equal(V.localReview(samePersonOtherCard,store),null);
store.removeItem(proofKey);
assert.equal(V.reconcile(unknown,store).status,'pendente');
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalogBefore);
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const name of ['craque-progress-consistency-v249.js','craque-progress-consistency-v249.css']){
 assert(bridge.includes("v189Root+'"+name+"'"));
 assert(sw.includes("'./"+name+"'"));
 assert(stamp.includes("'"+name+"'"));
}
assert(bridge.includes("document.body.dataset.page==='catalog'||document.body.dataset.page==='detail'"));
assert(sw.includes('v249-consistency'));
const source=read('web/craque-progress-consistency-v249.js');
assert(!/\.setItem\(|\.removeItem\(/.test(source),'Avisos nunca devem modificar dados locais');
assert(source.includes("getElementById('ct249-progress-alert')"),'Aviso de ficha deve evitar duplicatas');
assert(source.includes("if(!view.saved)continue"),'Não criar 246 chips e degradar catálogo');
assert(source.includes('Não aplique a distribuição antes de recalculá-la'),
 'Alertar quando build excede PP real');
const review=read('web/craque-progresso-v248.js');
assert(review.includes('data-undo')&&review.includes('focusCap'),'Usuário precisa desfazer e localizar a carta');
assert(review.includes("storage().removeItem(key(card))"),'Desfazer remove só a conferência exata');
const css=read('web/craque-progress-consistency-v249.css');
assert(css.includes('.ct249-undo')||css.includes('.ct248-undo'));
assert(css.includes('@media (max-width:680px)'));
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
console.log('V249 OK: confirmação local em ficha/catálogo, build acima dos PP marcada, edição exata isolada e desfazer revisão.');
console.log('V249 OK: 246 cartas, imagens e builds originais preservados; paridade Windows/Android offline.');
