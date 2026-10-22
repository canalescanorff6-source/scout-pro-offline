'use strict';
/* V311: regressão posicional REAL por motor compartilhado, 5 táticas, 2 acervos e backups. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=require('../web/craque-positional-v311.js');
const t=require('../web/scout-multitactic-engine-v220.js');
const training=require('../web/craque-friends-training-v228.js');
const s=require('../web/skills-booster-v162.js'),b=require('../web/booster-engine-v103.js');
const deps={training,tactical:t,skills:s,boosters:b};
const store=()=>{
 const map=new Map();
 return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
};
const mat={numero:201,id:'EID-MAT-TESTE',name:'Jogador MAT',versao:'Versão controlada',
 posicao:'MAT',max_level:35,pp:68,estilo_ataque:'Armador criativo',
 habilidades_nativas:'Passe de primeira; Passe em profundidade',niveis:[8,10,8,8,6,0,0,0,0,0]};
const official=core.fromPersonal(mat,{});
const before=JSON.stringify(mat);
assert.equal(official.position,'MAT');
assert.equal(official.pp,68);
const collection={id:'outros-1',name:'Bruno Santos CD'};
const external=core.fromExternal({id:'1',ownerId:collection.id,name:mat.name,position:'MAT',
 edition:mat.versao,cardId:mat.id,level:35,pp:68,style:mat.estilo_ataque,
 nativeSkills:mat.habilidades_nativas,skills:'',fixedBooster:'',
 booster:'',boosterSlot:'pendente',trainingLevels:mat.niveis.join(',')},collection);
for(const style of ['posse','rapido','normal','fora','longo']){
 const own=core.compute(official,'SA',style,'CT-MGR-013',deps);
 const other=core.compute(external,'SA',style,'CT-MGR-013',deps);
 assert.equal(own.position,'SA');
 assert.equal(own.originalPosition,'MAT');
 assert.equal(own.outcome.plan.pp,68);
 assert.equal(own.outcome.plan.remaining,0);
 assert.equal(own.outcome.plan.status,'hipotese');
 assert.equal(t.total(own.outcome.plan.levels),68);
 assert.deepEqual(own.outcome.plan.levels,other.outcome.plan.levels,'Paridade na distribuição dos dois acervos');
 assert.deepEqual(own.outcome.suggestedSkills.map(x=>x.name),other.outcome.suggestedSkills.map(x=>x.name));
 assert.equal(own.outcome.booster?.primary?.nome,other.outcome.booster?.primary?.nome);
 assert.equal(own.compatibility.eligible,false,'Familiaridade sem prova não se inventa');
 assert.match(own.warnings.join(' '),/não confirmada|confirmada|documentad/i);
}
const matPosse=core.compute(official,'MAT','posse','CT-MGR-013',deps);
const saPosse=core.compute(official,'SA','posse','CT-MGR-013',deps);
assert.notEqual(matPosse.id,saPosse.id);
assert.notDeepEqual(matPosse.outcome.plan.levels,saPosse.outcome.plan.levels,
 'MAT e SA precisam de cálculo de prioridades posicional, não só novo rótulo');
assert.notEqual(matPosse.focus.role,saPosse.focus.role);
assert.equal(matPosse.compatibility.status,'original');
assert.equal(saPosse.styleActivation,'não comprovada para esta edição/posição');
// V312: a edição real do técnico informa proficiência sem inventar bônus de PP.
const managerMock={...deps,managers:{
 find:id=>id==='CT-MGR-013'?{nome:'Teste A',versao_lancamento:'2026',
  boosters_EN:['Passe rasteiro +1'],link_ups_EN:['Combinação contextual']}:null,
 proficiency:()=>90
}};
const withCoach=core.compute(official,'SA','posse','CT-MGR-013',managerMock);
assert.equal(withCoach.managerProfile.name,'Teste A');
assert.equal(withCoach.managerProfile.proficiency,90);
assert.equal(withCoach.managerProfile.bonuses[0],'Passe rasteiro +1');
assert.equal(withCoach.outcome.plan.pp,68,'Bônus do técnico não criam PP');
assert.equal(core.compute(official,'SA','posse','CT-MGR-404',managerMock).managerProfile.proficiency,null);
const sourceCopy=core.snapshot(withCoach);
assert.deepEqual(sourceCopy.recommendations.map(x=>x.name),
 withCoach.outcome.suggestedSkills.slice(0,5).map(x=>x.name));
assert.deepEqual(sourceCopy.boosterRanking.alternatives.map(x=>x.name),
 (withCoach.outcome.booster?.alternatives||[]).slice(0,5).map(x=>x.nome));
assert.deepEqual(sourceCopy.focus.priority,(withCoach.focus?.priority||[]).slice(0,4).map(x=>x.name));
assert.equal(sourceCopy.managerProfile.proficiency,90);
const profile=store();
let a=core.save(profile,matPosse);
assert.equal(a.revision,1);
const snap=JSON.stringify(core.saved(profile,matPosse).revision);
core.choose(profile,official,'SA');
assert.equal(core.preferred(profile,official),'SA');
assert.equal(core.save(profile,saPosse).revision,1,'SA não sobrescreve MAT');
core.choose(profile,official,'MAT');
assert.equal(core.preferred(profile,official),'MAT');
assert.equal(JSON.stringify(core.saved(profile,matPosse).revision),snap,'Restauração MAT exata');
assert.deepEqual(core.saved(profile,matPosse).revision.recommendations,
 core.snapshot(matPosse).recommendations,'Restaurar habilidades da revisão MAT, não recálculo da SA');
assert.deepEqual(core.saved(profile,saPosse).revision.boosterRanking,
 core.snapshot(saPosse).boosterRanking,'Ímpetos SA não devem substituir o ranking MAT');
assert.deepEqual(core.saved(profile,matPosse).revision.focus,
 core.snapshot(matPosse).focus,'Prioridades de atributos MAT preservadas');
assert.equal(core.saved(profile,saPosse).revision.selectedPosition,'SA');
const originalManager=core.compute(official,'MAT','posse','CT-MGR-014',deps);
assert.notEqual(originalManager.id,matPosse.id,'Edições diferentes de técnico não misturam fichas');
assert.equal(core.saved(profile,originalManager),null,'Não usar build de outro técnico');
const saRapido=core.compute(official,'SA','rapido','CT-MGR-013',deps);
assert.notEqual(saRapido.id,saPosse.id);
core.save(profile,saRapido);
assert.deepEqual(core.saved(profile,matPosse).revision.levels,matPosse.outcome.plan.levels);
const changed=core.compute({...official,pp:70},'MAT','posse','CT-MGR-013',deps);
assert.equal(changed.id,matPosse.id);
assert.equal(core.saved(profile,changed).stale,true,'Troca no orçamento não apaga revisão anterior');
assert.equal(core.saved(profile,matPosse).stale,false);
// Exportar/importar a coleção deve preservar os cenários da carta sem misturar proprietários.
const local=store();
const originalExternal=core.compute(external,'MAT','posse','CT-MGR-013',deps);
const alternativeExternal=core.compute(external,'SA','posse','CT-MGR-013',deps);
core.save(local,originalExternal);core.save(local,alternativeExternal);
// Simular uma revisão anteriormente aprovada: backup deve PRESERVAR, mas não emitir novo aval.
let previouslyApproved=JSON.parse(local.getItem(core.KEY));
const originalKey=originalExternal.id;
previouslyApproved.entries[originalKey][0].approved=true;
local.setItem(core.KEY,JSON.stringify(previouslyApproved));
const backup=core.exportOwnerScenarios(local,'outros-1',[{id:'1'}]);
assert.equal(backup.entries.length,2);
const importedStore=store();
const importedCard={id:'nova-carta',ownerId:'novo-dono',name:mat.name,
 position:'MAT',edition:mat.versao,cardId:mat.id,level:35,pp:68,style:mat.estilo_ataque,
 nativeSkills:mat.habilidades_nativas,skills:'',fixedBooster:'',
 booster:'',boosterSlot:'pendente',trainingLevels:mat.niveis.join(',')};
assert.equal(core.importOwnerScenarios(importedStore,backup,{id:'novo-dono'},[importedCard]),2);
const importedModel=core.fromExternal(importedCard,{id:'novo-dono'});
assert(core.saved(importedStore,core.compute(importedModel,'MAT','posse','CT-MGR-013',deps)));
assert.equal(core.saved(importedStore,
 core.compute(importedModel,'MAT','posse','CT-MGR-013',deps)).revision.approved,true,
 'Aprovação registrada deve sobreviver à exportação/importação sem ser criada pelo motor');
assert.equal(core.saved(importedStore,
 core.compute(importedModel,'MAT','posse','CT-MGR-013',deps)).revision.evidenceImported,true);
assert(core.saved(importedStore,core.compute(importedModel,'SA','posse','CT-MGR-013',deps)));
assert.equal(core.exportOwnerScenarios(importedStore,'outros-1',[]).entries.length,0);
assert.equal(core.importOwnerScenarios(importedStore,null,{id:'outros-1'},[]),0);
const otherOwner=core.fromExternal({...external,id:'other-card',ownerId:'outra-pessoa',name:'Outro',position:'MAT'}, {id:'outra-pessoa'});
assert.equal(core.saved(profile,core.compute(otherOwner,'MAT','posse','CT-MGR-013',deps)),null);
const pending=core.compute({...official,level:null,pp:null},'SA','posse','',deps);
assert.equal(pending.outcome.plan.status,'pendente');
assert.equal(pending.outcome.plan.levels,null,'Não inventar níveis nem orçamento sem PP');
assert.equal(pending.outcome.progress.pp,null);
const wing=core.fromExternal({id:'pt-01',ownerId:'owner-1',name:'Ponta',position:'PTE',edition:'Exemplo',
 pp:50,level:26,nativeSkills:'',skills:'',style:'Ala produtivo'}, {id:'owner-1'});
const ca=core.compute(wing,'CA','posse','CT-MGR-003',deps);
const pte=core.compute(wing,'PTE','posse','CT-MGR-003',deps);
assert.equal(ca.outcome.plan.pp,50);
assert.equal(t.total(ca.outcome.plan.levels),50);
assert.notEqual(ca.outcome.plan.role,pte.outcome.plan.role);
assert.equal(ca.compatibility.eligible,false);
assert.equal(ca.compatibility.status,'não confirmada');
assert.equal(JSON.stringify(mat),before,'A carta original nunca é mutada');
assert.equal(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards.length,246);
const bundle=read('scripts/stamp-bundle-v189.cjs'),sw=read('web/sw.js');
for(const file of ['craque-positional-v311.js','craque-positional-ui-v311.js','craque-positional-v311.css']){
 assert(bundle.includes("'"+file+"'"),'Fingerprint ausente '+file);
 assert(sw.includes("'./"+file+"'"),'Cache offline ausente '+file);
}
assert(read('web/outros-elencos-v227.html').includes('craque-positional-ui-v311.js'));
assert(read('web/app-bridge.js').includes("load('craque-positional-v311.js'"));
assert(read('web/craque-friends-training-ui-v228.js').includes('usedPosition'));
console.log('V312 PASS: MAT→SA→MAT/restauração exata, PP, cinco estilos, técnicas isoladas, habilidades/ímpetos reavaliados, PTE→CA, 2 acervos, 246 cartas preservadas.');
