'use strict';
/* V228: os mesmos motores V220, V162 e V103 utilizados pelo catálogo,
 * aplicados SOMENTE a cartas privadas. Nenhum atributo falso, PP excedido ou skill duplicada.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const model=require('../web/craque-friends-v227.js');
const training=require('../web/craque-friends-training-v228.js');
const engines={tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),
 boosters:require('../web/booster-engine-v103.js')};
const old=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
assert.equal(old.cards.length,246,'O catálogo original com 246 cartas precisa continuar íntegro.');
const namesBefore=old.cards.map(x=>[x.numero,x.id,x.name,x.versao]);
let doc=model.empty();
doc=model.addOwner(doc,'Ana'),doc=model.addOwner(doc,'Bruno');
const [ana,bruno]=doc.owners;
const source=(ownerId,overrides={})=>({
 ownerId,name:'Messi',edition:'Show Time edição confirmada',cardId:'ID-MESSI-CONFIRMADO',
 position:'SA',style:'Armador criativo',pp:62,level:32,
 nativeSkills:'Passe de primeira; Toque duplo',
 skills:'Passe em profundidade',booster:'',fixedBooster:'Technique',
 boosterSlot:'vazio',trainingLevels:'',notes:'Dados inseridos pelo próprio usuário',...overrides
});
const a=source(ana.id);
const plans=training.generate(a,engines);
assert.equal(plans.version,228);assert.equal(Object.keys(plans.profiles).length,5);
assert.equal(plans.source,training.sourceSignature(a));
for(const tactic of training.MODES){
 const result=training.evaluate(a,tactic,engines);
 const p=result.plan;
 assert.equal(p.status,'hipotese',tactic+' precisa distribuir os PP');
 assert.equal(p.levels.length,10);
 assert.equal(engines.tactical.total(p.levels),62,tactic+' PP exatos');
 assert.equal(p.remaining,0);
 assert(p.levels.every((n,i)=>i>=7?n===0:true),'SA não pode receber PP de goleiro');
 assert(p.levels.every(n=>Number.isInteger(n)&&n>=0&&n<=20));
 assert.equal(result.identityConfirmed,true);
 assert.equal(result.nativeDocumented,true);
 assert(result.suggestedSkills.length>0&&result.suggestedSkills.length<=4);
 assert(!result.suggestedSkills.some(x=>['Passe de primeira','Toque duplo','Passe em profundidade'].includes(x.name)),
  'Não sugerir nativas ou extras já equipadas');
 assert(result.booster?.primary?.nome,'Deve apresentar ímpeto por tática');
 assert.equal(result.boosterEligible,true,'Slot vazio conferido permite indicação condicional');
 assert.notEqual(result.booster?.primary?.nome,'Technique','Booster fixo não pode aparecer como novo');
}
assert.notDeepEqual(training.evaluate(a,'posse',engines).plan.levels,
 training.evaluate(a,'rapido',engines).plan.levels,
 'Os treinos devem variar por tática quando os sinais forem diferentes.');
doc=model.saveCard(doc,{...a,analysis:plans});
const ac=doc.cards.find(x=>x.ownerId===ana.id);
assert(training.validateSaved(ac,ac.analysis,engines),'A ficha salva precisa corresponder à edição/PP');
assert.deepEqual(ac.analysis.profiles.posse.levels,plans.profiles.posse.levels);
assert.equal(ac.analysis.source,training.sourceSignature(ac));
doc=model.saveCard(doc,{...source(bruno.id,{cardId:'DIFERENTE',edition:'Epic Bruno',pp:60,
 skills:'',nativeSkills:'',boosterSlot:'pendente'}),analysis:training.generate(source(bruno.id,{cardId:'DIFERENTE',edition:'Epic Bruno',pp:60,
 skills:'',nativeSkills:'',boosterSlot:'pendente'}),engines)});
assert.equal(doc.cards.length,2);
const bc=doc.cards.find(x=>x.ownerId===bruno.id);
assert.notEqual(ac.id,bc.id,'Duas pessoas têm cartas separadas');
assert.equal(training.evaluate(bc,'posse',engines).boosterEligible,false);
assert(training.evaluate(bc,'posse',engines).warnings.some(x=>x.includes('Habilidades nativas')));
assert(training.evaluate(bc,'posse',engines).warnings.some(x=>x.includes('slot')));
const invalid=source(bruno.id,{cardId:'',edition:'',pp:null,position:'',boosterSlot:'ausente'});
const pending=training.evaluate(invalid,'posse',engines);
assert.equal(pending.plan.status,'pendente');
assert.equal(pending.plan.levels,null,'Nunca inventar treino sem orçamento/posição');
assert.equal(pending.boosterEligible,false);
assert.equal(pending.confidence,'pendente');
const noSlot=training.evaluate(source(bruno.id,{boosterSlot:'ausente'}),'posse',engines);
assert.equal(noSlot.boosterEligible,false);
const occupied=training.evaluate(source(bruno.id,{boosterSlot:'ocupado',booster:'Shooting'}),'posse',engines);
assert.equal(occupied.boosterEligible,false);
const goalkeeper=training.evaluate(source(ana.id,{position:'GO',pp:70,style:'Goleiro ofensivo',
 nativeSkills:'Defesa de pênalti',fixedBooster:'Saving'}),'posse',engines);
assert.equal(goalkeeper.plan.status,'hipotese');
assert.equal(engines.tactical.total(goalkeeper.plan.levels),70);
assert(goalkeeper.plan.levels.slice(0,7).every(n=>n===0),'Goleiro só recebe PP nos 3 grupos de GK');
const impossible=training.evaluate(source(ana.id,{position:'GO',pp:250}),'posse',engines);
assert.equal(impossible.plan.status,'pendente','Níveis e custo limitados não devem inventar outros grupos');
const invalidBase=training.evaluate(source(ana.id,{trainingLevels:'8,8,8,8,8,0,0,0,0,0'}),'posse',engines);
assert(invalidBase.warnings.some(x=>x.includes('não fecha os PP')),'Treino manual inválido não pode virar build confirmada');
const changed={...ac,pp:64};
assert.equal(training.validateSaved(changed,ac.analysis,engines),false,'Mudança de PP invalida a ficha anterior');
assert.throws(()=>model.saveCard(doc,{...ac,analysis:{version:228,source:'',profiles:{}}}),/Ficha/,'Importação adulterada deve falhar');
const backupJson=model.exportOwner(doc,ana.id);
const reread=model.importOwner(doc,backupJson);
assert.equal(reread.cards.length,3);
const restored=reread.cards.find(x=>x.ownerId===reread.owners[2].id);
assert(training.validateSaved(restored,restored.analysis,engines),'Exportar/importar precisa guardar fichas completas');
const storage=new Map([['scoutpro:v219:black-caps','[12,14,15]'],['scoutpro:training-original','{"ok":true}']]);
const adapter={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),
 removeItem:key=>storage.delete(key)};
model.write(adapter,doc);
assert.equal(model.read(adapter).cards.length,2);
assert.equal(storage.get('scoutpro:v219:black-caps'),'[12,14,15]');
assert.equal(storage.get('scoutpro:training-original'),'{"ok":true}');
assert.deepEqual(old.cards.map(x=>[x.numero,x.id,x.name,x.versao]),namesBefore);
const page=read('web/outros-elencos-v227.html');
for(const file of ['scout-multitactic-engine-v220.js','skills-booster-v162.js','booster-engine-v103.js','craque-friends-training-v228.js','craque-friends-training-ui-v228.js']){
 assert(page.includes('src="'+file+'"'),'Motor '+file+' deve carregar na biblioteca');
}
assert(page.includes('id="friend-analysis-dialog"'));
assert(read('web/craque-friends-page-v227.js').includes('training.generate(saved)'),'Salvamento de carta deve gerar treino automaticamente');
assert(read('web/sw.js').includes('craque-friends-training-v228.js'),'Pacote offline precisa incluir o motor');
assert(read('scripts/stamp-bundle-v189.cjs').includes('craque-friends-training-ui-v228.js'),'Android e Windows com mesmos arquivos');
console.log('V228 PASS: cinco fichas/PP exatos, 5 habilidades sem duplicatas, ímpeto condicionado a slot, evidência pendente, exportação/restauração, acervos isolados.');
