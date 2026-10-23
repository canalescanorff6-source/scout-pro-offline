'use strict';
// V340: colisões documentais NUNCA alteram cartão ou histórico anterior.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(original).cards;
assert.equal(cards.length,246);
const profile=require('../web/craque-manager-fichas-v324.js');
const audit=profile.auditEquipmentSelection;
assert.equal(typeof audit,'function');
const result=audit(['Passe de primeira','Toque Duplo','Chute de primeira'],'Técnica',
 'passe de PRIMEIRA; Outras habilidades','TOQUE DUPLO, Passe em profundidade',
 'TÉCNICA','pendente');
assert.equal(result.status,'revisar_habilidades');
assert.deepEqual(result.conflicts.map(x=>x.name),['Passe de primeira','Toque Duplo']);
assert.deepEqual([...result.conflicts[0].sources],['nativa_cadastrada']);
assert.deepEqual([...result.conflicts[1].sources],['adicional_informada']);
assert.equal(result.fixedBoosterSame,true,'Duplicação do nome do ímpeto fixo exige aviso, não remoção');
assert.equal(result.fixedBoosterDeclared,'TÉCNICA');
assert.equal(result.slotEvidence,'pendente');
assert(result.warning.includes('não comprova')===false||result.warning.includes('Não comprova'));
assert(Object.isFrozen(result));
assert(Object.isFrozen(result.conflicts));
assert(Object.isFrozen(result.conflicts[0].sources));
assert.equal(audit(['Passe de primeira'],'',
 'Outra skill','','','').hasSkillConflict,false);
const fixedOnly=audit([],'Regista','','','Regista','2 vagas informadas');
assert.equal(fixedOnly.status,'revisar_impeto_fixo');
assert.equal(fixedOnly.hasSkillConflict,false);
assert.equal(fixedOnly.fixedBoosterSame,true);
const empty=audit([],'','','','','');
assert.equal(empty.status,'sem_colisao_documental');
assert.equal(empty.slotEvidence,'pendente');
assert.deepEqual([...empty.conflicts],[]);
assert.throws(()=>audit(['Toque duplo','toque DUPLO']),'Duplicatas já selecionadas são inválidas');
assert.throws(()=>audit([''],''),'Skill vazia deve ser rejeitada');
const ui=read('web/craque-positional-ui-v311.js');
const css=read('web/craque-positional-v311.css');
assert(ui.includes('profiles.auditEquipmentSelection(skills,selectBooster.value,'),
 'Auditar seleção efetiva ao salvar, não uma lista antiga');
assert(ui.includes("if(audit.hasSkillConflict)throw Error("),
 'Bloquear NOVA gravação inválida mantendo histórico anterior');
assert(ui.indexOf('if(audit.hasSkillConflict)throw Error(')<
 ui.indexOf("profiles.save(storage(),profileContext,{train:currentPlan,skills,"),
 'Verificação deve ocorrer antes de qualquer escrita');
assert(ui.includes("const equipmentAudit=profiles?.auditEquipmentSelection?.("),
 'Auditar habilidades e ímpeto exibidos na ficha em foco');
assert(ui.includes("if(equipmentAudit?.hasSkillConflict)hero.append("));
assert(ui.includes("if(equipmentAudit?.fixedBoosterSame)hero.append("));
assert(ui.includes('A seleção anterior continua preservada.'));
assert(css.includes('.ct340-evidence-conflict'));
const storeData=new Map(),writes=[];
const store={getItem:k=>storeData.get(k)??null,
 setItem:(k,v)=>{writes.push(k);storeData.set(k,v)}};
const ctx={collection:'minhas-246',owner:'principal',cardKey:'001@123',
 cardId:'123',edition:'Épica-testada',position:'CA',style:'posse',
 manager:'CT-MGR-001',budget:62,sourceSignature:'V340-SAME-CARD'};
const train=[10,5,5,8,8,6,0,0,0,0];
profile.save(store,ctx,{train,skills:['Passe de primeira'],booster:'Técnica',
 source:'Histórico prévio preservado'});
const history=store.getItem(profile.key(ctx));
assert.equal(writes.length,1);
const saved=profile.read(store,ctx);
const conflict=audit(saved.skills,saved.booster,'Passe de primeira','','Técnica','pendente');
assert.equal(conflict.hasSkillConflict,true,'A revisão existente deve ser auditada sem ser apagada');
assert.equal(writes.length,1,'Auditoria não pode gravar');
assert.equal(store.getItem(profile.key(ctx)),history,'Histórico original intacto');
const other={...ctx,collection:'outros-elencos',owner:'bruno-santos',cardKey:'external-001'};
assert.equal(profile.read(store,other),null,'Acervos permanecem independentes');
const cleanOther=audit(['Passe em profundidade'],'Técnica','Passe de primeira','','Força','pendente');
assert.equal(cleanOther.hasSkillConflict,false);
assert.equal(cleanOther.fixedBoosterSame,false);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
console.log('V340 PASS: conflitos com nativas/adicionais e ímpeto fixo; bloqueio de nova revisão; histórico, 2 acervos e 246 cartas intactos.');
