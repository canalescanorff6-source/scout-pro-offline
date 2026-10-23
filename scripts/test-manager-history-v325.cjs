'use strict';
/* V325: proteção das 50 revisões + preservação de skills históricas.
 * Não altera builds/equipamentos e vale para os dois acervos.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const profiles=require('../web/craque-manager-fichas-v324.js');
const allCards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const original=JSON.stringify(allCards);
assert.equal(allCards.length,246);
const context={
 collection:'minhas-246',owner:'principal',cardKey:'40@8804',cardId:'8804',
 edition:'Epic documentada',manager:'CT-MGR-071',position:'CA',
 style:'posse',budget:62,sourceSignature:'evidencia-assinada'
};
const external={...context,collection:'outros-elencos',owner:'bruno-cd',cardKey:'ficha-4'};
const newCoach=profiles.withManager(context,'CT-MGR-004');
const inSA=profiles.withPosition(context,'SA');
const map=new Map();const store={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))};
const plan=[10,5,5,8,8,6,0,0,0,0];assert(profiles.validTraining(plan,62));
const saved=['Passe de primeira','Passe em profundidade'];
const options=profiles.reviewSkillCandidates(saved,[
 {name:'Passe em profundidade'},{nome:'Controle com a sola'},'Chute de primeira',
 'CHUTE DE PRIMEIRA','Passe de primeira',{name:'Pressão'},
 ],'Cabeceio; Chute de primeira','Pressão');
assert.deepEqual(options.map(x=>x.name),[
 'Passe de primeira','Passe em profundidade','Controle com a sola']);
assert.deepEqual(options.filter(x=>x.saved).map(x=>x.name),saved,
 'Skills salvas vêm antes das novas recomendações');
const afterAlgorithmChange=profiles.reviewSkillCandidates(saved,[{name:'Toque duplo'}],'','');
assert.deepEqual(afterAlgorithmChange.map(x=>x.name),
 ['Passe de primeira','Passe em profundidade','Toque duplo'],
 'Atualização do motor não pode esconder skill salva e eliminá-la na próxima revisão');
const conflict=profiles.reviewSkillCandidates(['Passe de primeira','Toque duplo'],
 ['Passe em profundidade'],'Passe de primeira, Cabeceio','Toque duplo');
assert.deepEqual(conflict.filter(x=>x.conflict).map(x=>x.conflict),['nativa','já equipada']);
assert(conflict.every(x=>x.saved||x.conflict===null));
assert.equal(profiles.skillToken('  FÍSICO  '),profiles.skillToken('fisico'));
assert.equal(profiles.skillToken({nome:'Passe de PRIMEIRA'}),profiles.skillToken('passe de primeira'));
assert.throws(()=>profiles.reviewSkillCandidates(Array(6).fill('Passe'),[]),/cinco/i);
const first=profiles.save(store,context,{train:plan,skills:saved,source:'Validação de teste'});
assert.equal(first.revision,1);
assert.deepEqual(profiles.read(store,context).skills,saved);
assert.equal(profiles.read(store,newCoach),null);
assert.equal(profiles.read(store,inSA),null);
assert.equal(profiles.read(store,external),null);
const different=profiles.save(store,external,{train:plan,skills:['Toque duplo'],source:'Teste Outro Acervo'});
assert.equal(different.revision,1);
assert.equal(profiles.read(store,context).skills.length,2);
const capCtx={...context,cardKey:'outro@id'};
for(let i=0;i<50;i++){
 const x=profiles.save(store,capCtx,{train:plan,skills:['Passe de primeira'],source:'Revisão manual '+i});
 assert.equal(x.revision,i+1);
}
const exact=store.getItem(profiles.key(capCtx));
assert.equal(profiles.readAll(store,capCtx).length,50);
assert.throws(()=>profiles.save(store,capCtx,{train:plan,skills:[],source:'51 inválida'}),/50 revisões/);
assert.equal(store.getItem(profiles.key(capCtx)),exact,'Histórico de 50 revisões intacto após rejeição');
assert.equal(profiles.read(store,capCtx).revision,50);
const autoCtx={...context,cardKey:'auto@id'};
for(let i=0;i<49;i++)profiles.save(store,autoCtx,{train:plan,source:'Revisão manual '+i});
profiles.save(store,autoCtx,{train:plan,source:'V324 · Rascunho PP de posse'});
for(let i=0;i<60;i++)profiles.save(store,autoCtx,{train:plan,source:'V324 · Rascunho PP de posse'});
assert.equal(profiles.readAll(store,autoCtx).length,50,'Rascunho automático 50 pode consolidar sem perder manual');
assert.throws(()=>profiles.save(store,autoCtx,{train:plan,source:'Revisão manual adicional'}),/50 revisões/);
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('profiles.reviewSkillCandidates(savedProfile?.skills||[],proposed'));
assert(ui.includes('input.checked=entry.saved'));
assert(ui.includes('Preservada do histórico'));
assert(ui.includes('desmarque para excluir'));
assert(ui.includes('enforceFive'));
const css=read('web/craque-positional-v311.css');
assert(css.includes('.ct325-skill-warning'));
const bridge=read('web/app-bridge.js'),other=read('web/outros-elencos-v227.html');
assert(bridge.includes("v189Root+'craque-manager-fichas-v324.js'"));
assert(other.includes('src="craque-manager-fichas-v324.js"'));
assert.equal(JSON.stringify(allCards),original);
console.log('V325 PASS: 246 originais intactas, duas coleções e técnicos isolados, 50 revisões protegidas, skills salvas preservadas e candidatas não redundantes.');
