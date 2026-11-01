'use strict';
/* V382: segunda conta própria nunca altera principal, Bruno ou 7$. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const src=p=>fs.readFileSync(path.resolve(__dirname,'../',p),'utf8');
const F=require('../web/craque-friends-v227.js');
const T=require('../web/craque-friends-training-v228.js');
assert.equal(F.MARQUES_OWNER_NAME,'Cartas do Marques Tiago');
assert.equal(F.MARQUES_OWNER_ID,'craque:marques-tiago:conta-propria:v382');
const first=F.addOwner(F.addOwner(F.empty(),'Bruno Santos CD'),'7$');
const bruno=first.owners[0],sete=first.owners[1];
const baseline=F.saveCard(F.saveCard(first,{ownerId:bruno.id,name:'Zico',position:'SA',level:35,pp:null}),
 {ownerId:sete.id,name:'Eden Hazard',position:'PTE',level:31,pp:null});
const before=JSON.stringify(baseline);
let result=F.ensureMarquesCollection(baseline);
assert.equal(result.changed,true);
assert.equal(result.data.owners.length,3);
const owner=result.data.owners.find(o=>o.id===F.MARQUES_OWNER_ID);
assert(owner&&owner.name===F.MARQUES_OWNER_NAME);
assert.equal(result.data.cards.length,2,'A criação da coleção não duplica cartas');
assert.equal(JSON.stringify(baseline),before,'Acervos antigos não podem ser alterados');
const twice=F.ensureMarquesCollection(result.data);
assert.equal(twice.changed,false,'Criação idempotente');
assert.equal(JSON.stringify(twice.data),JSON.stringify(result.data));
const newCard={
 ownerId:F.MARQUES_OWNER_ID,name:'Jogador para diagnóstico',edition:'Edição pendente',
 position:'CA',level:32,pp:null,cardId:'',skills:'',nativeSkills:'',
 boosterSlot:'pendente',trainingLevels:'',notes:'Movimento sem bola a comparar'
};
let doc=F.saveCard(result.data,newCard);
const own=doc.cards.find(c=>c.ownerId===F.MARQUES_OWNER_ID);
assert(own);
assert.equal(doc.cards.length,3);
assert.equal(doc.cards.filter(c=>c.ownerId===bruno.id).length,1);
assert.equal(doc.cards.filter(c=>c.ownerId===sete.id).length,1);
assert.equal(T.resolveBudget(own).pp,62,'Nível 32 deve gerar 62 PP');
const deps={tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
const analysis=T.generate(own,deps);
assert(analysis&&typeof analysis==='object','Mesmo motor de cinco fichas deve ser usado');
const exported=F.exportOwner(doc,F.MARQUES_OWNER_ID);
assert.equal(exported.cards.length,1);
assert.equal(exported.cards[0].name,own.name);
assert.equal(F.exportOwner(doc,bruno.id).cards.length,1);
assert.equal(F.exportOwner(doc,sete.id).cards.length,1);
const html=src('web/index.html'),page=src('web/craque-friends-page-v227.js'),
 landing=src('web/outros-elencos-v227.html'),styles=src('web/craque-app-shell-v362.css');
assert(html.includes('outros-elencos-v227.html?colecao=marques-tiago'));
assert(landing.includes('id="marques-featured"')&&landing.includes('MINHA CONTA'));
assert(page.includes("get('colecao')==='marques-tiago'"));
assert(page.includes('ensureMarquesCollection(data)'));
assert(page.includes("selected=api.MARQUES_OWNER_ID"));
assert(page.includes('renderMarques();renderBruno();renderPeople();renderCards();'));
assert(styles.includes('.ct382-owned-featured')&&styles.includes('.ct382-owned-entry'));
assert(!src('web/craque-friends-v227.js').includes('SCOUT_V69_AUDITORIA.json","'), 'Sem acesso para modificar as 246');
const sw=src('web/sw.js'),stamp=src('scripts/stamp-bundle-v189.cjs');
for(const file of ['craque-friends-v227.js','craque-friends-page-v227.js','outros-elencos-v227.html','craque-app-shell-v362.css']){
 assert(sw.includes(file),'Cache offline não acompanha '+file);
 assert(stamp.includes(file),'Bundle Android/Windows não acompanha '+file);
}
console.log('V382 PASS: Cartas do Marques Tiago é coleção própria, idempotente, PP 62, fichas compartilhadas, outras contas preservadas, rota e backup isolados.');
