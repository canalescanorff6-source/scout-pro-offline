'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'../web/craque-identity-archive-v377.js');
assert(fs.existsSync(file),'O arquivo anterior precisa de um leitor isolado, sem reaplicar identidade corrigida');
const A=require(file);
for(const fixture of [
 {capture:153,file:'fichas/153_Dean_Huijsen.html',beforeCanonical:{id:'106766981558114',versao:'Edição anterior',name:'Dean Huijsen'},sibling:144},
 {capture:196,file:'fichas/196_Savinho.html',beforeCanonical:{id:'105821820296614',versao:'Edição anterior',name:'Savinho'},sibling:61}]){
 const id=fixture.beforeCanonical.id,filename=fixture.file.split('/').pop();
 const history='scoutpro:v67:test:'+id+':'+filename,matches='scoutpro:v80:matches:'+fixture.capture+':'+id;
 const saved=JSON.stringify([{result:'Vitória',note:'Partida da edição anterior'}]);
 const records=new Map([[history,saved],[matches,saved],
  ['scoutpro:v67:test:'+id+':'+filename.replace(String(fixture.capture),String(fixture.sibling)),saved],
  ['scoutpro:v80:matches:'+fixture.sibling+':'+id,saved]]);
 const readonly={get length(){return records.size},key:i=>[...records.keys()][i],getItem:k=>records.get(k)??null};
 const result=A.read(readonly,fixture);
 assert.deepEqual(result.items.map(x=>x.key).sort(),[history,matches].sort(),'Incluir partidas antigas sem importar a CAP irmã');
 assert(result.items.every(x=>x.raw===saved));
}
const correction={capture:153,file:'fichas/153_Dean_Huijsen.html',beforeCanonical:{
 id:'106766981558114',versao:"Show Time — New Year's Gift 2026 — Dean Huijsen",name:'Dean Huijsen'}};
const old=correction.beforeCanonical,other='105780749692770';
const parts=(cap=153,id=old.id,edition=old.versao,owner='principal')=>
 ['minhas-246',owner,cap+'@'+id,id,edition];
const encoded=a=>a.map(x=>encodeURIComponent(x)).join('|');
const managerKey=(cap=153,id=old.id,edition=old.versao,owner='principal')=>
 'scoutpro:v324:manager-profile:'+encoded([...parts(cap,id,edition,owner),'CT-MGR-071','ZG','posse','old-content-signature']);
const scenarioKey=(cap=153,id=old.id,edition=old.versao,owner='principal')=>
 encoded([...parts(cap,id,edition,owner),'ZG','posse','CT-MGR-071']);
const lab='scoutpro:v67:'+old.id+':153_Dean_Huijsen.html';
const current='scoutpro:v376:current-training:cap:153',ovr='scoutpro:v376:ovr:cap:153';
const revisions=[{revision:1,sourceSignature:'immutable-signature',approved:true,train:[0,0,0,0,0,0,10,0,0,0]},
 {revision:2,sourceSignature:'second-signature',skills:['Bloqueador']}];
const memory=new Map(),json=(key,value)=>memory.set(key,JSON.stringify(value));
const store={get length(){return memory.size},key:i=>[...memory.keys()][i]??null,getItem:k=>memory.get(k)??null,
 setItem(){throw Error('Arquivo não pode gravar')},removeItem(){throw Error('Arquivo não pode remover')}};
json(managerKey(),{schema:'CRAQUE_MANAGER_FICHA_V324',revisions});
json(managerKey(144),{secret:'Outra CAP com o mesmo ID antigo'});
json(managerKey(153,old.id,old.versao,'outro-dono'),{secret:'Outro proprietário'});
json(managerKey(153,other),{secret:'Identidade corrigida'});
json(managerKey(153,old.id,'Outra edição'),{secret:'Outra edição'});
const global='scoutpro:v311:position-scenarios';
json(global,{schema:'CRAQUE_POSITION_V311',entries:{
 [scenarioKey()]:revisions,[scenarioKey(144)]:[{secret:'Não exportar144'}],
 [scenarioKey(153,old.id,old.versao,'outro-dono')]:[{secret:'Não exportar outro dono'}],
 [scenarioKey(153,other)]:[{secret:'Não exportar edição nova'}]}});
json(lab,{train:revisions[0].train,source:'Anterior'});
json(lab+':tactic:rapido',{train:revisions[0].train,source:'Anterior rápido'});
json('scoutpro:v67:'+old.id+':144_Dean_Huijsen.html',{secret:'Arquivo144'});
json(current,{cardKey:'cap:153',cardId:old.id,budget:52,levels:revisions[0].train});
json(current+':'+old.id,{cardKey:'cap:153',cardId:old.id,budget:52,levels:revisions[0].train});
json(current+':'+other,{cardId:other,secret:'Treino novo'});
json(ovr,{schema:'CRAQUE_OBSERVED_OVR_V376',context:'opaque-old-context',overall:105});
json(ovr+':'+old.id,{schema:'CRAQUE_OBSERVED_OVR_V376',context:'opaque-old-context',overall:106});
json(ovr+':'+other,{overall:104,secret:'OVR novo'});
const equipped='scoutpro:v162:equipped:153:'+old.id;
memory.set(equipped,'Bloqueador; Interceptação');
json('scoutpro:v254:additional-confirmed:153@'+old.id,
 {capture:153,card_id:old.id,edition:old.versao,confirmed:true,fingerprint:'unchanged'});
json('scoutpro:v103:booster:153',{capture:153,card_id:old.id,edition:old.versao,status:'ocupado',equipped:'Agility'});
json('scoutpro:v248:level-review:153@'+old.id,{numero:153,card_id:old.id,name:old.name,level:27,pp:52});
const before=JSON.stringify([...memory]);
let result=A.read(store,correction);
assert.equal(JSON.stringify([...memory]),before,'Consulta não pode escrever, mover ou remover registros');
assert.equal(result.items.length,12);
assert(!JSON.stringify(result.items).includes('secret'),'IDs compartilhados não permitem exportar outra carta/proprietário');
const profile=result.items.find(x=>x.key===managerKey());
assert.equal(profile.raw,memory.get(managerKey()));assert.deepEqual(profile.value.revisions,revisions);
const positional=result.items.find(x=>x.kind==='positional');
assert.deepEqual(positional.value,revisions);assert.deepEqual(JSON.parse(positional.raw),revisions);
assert(!positional.raw.includes('Não exportar'));
assert.equal(result.items.find(x=>x.key===equipped).value,'Bloqueador; Interceptação');
assert(result.warnings.some(x=>/V248.*sem edição|nível.*sem edição/i.test(x)),'V248 sem edição só pode aparecer como arquivo sem prova');
assert(result.warnings.some(x=>/OVR.*arquivo|arquivo.*OVR/i.test(x)),'OVR antigo não comprova o contexto corrigido');

// ROOT escreve o treino da identidade nova em outra chave: os bytes antigos continuam acessíveis.
json(current+':'+other,{cardKey:'cap:153',cardId:other,budget:48,levels:Array(10).fill(0)});
result=A.read(store,correction);
assert.equal(result.items.find(x=>x.key===current).raw,JSON.parse(before).find(([k])=>k===current)[1]);
assert(!result.items.some(x=>x.key===current+':'+other));

memory.set(managerKey(),'{corrompido');memory.set(lab,'{ilegível');
result=A.read(store,correction);
for(const key of [managerKey(),lab]){
 const item=result.items.find(x=>x.key===key);assert(item);assert.equal(item.raw,memory.get(key));assert.equal(item.value,null);
 assert(result.warnings.some(x=>x.includes(key)));
}
memory.set(global,'{contêiner global ilegível');result=A.read(store,correction);
assert(!result.items.some(x=>x.kind==='positional'));
assert(result.warnings.some(x=>x.includes(global)));
assert(!JSON.stringify(result.items).includes('contêiner global'),'Não exportar raw global impossível de isolar');
json('scoutpro:v103:booster:153',{capture:153,card_id:old.id,edition:'Outra edição',status:'ocupado'});
json('scoutpro:v254:additional-confirmed:153@'+old.id,{capture:144,card_id:old.id,edition:old.versao});
json('scoutpro:v248:level-review:153@'+old.id,{numero:153,card_id:old.id,name:'Outro jogador',level:27});
json(current,{cardKey:'cap:153',cardId:other,budget:48,levels:Array(10).fill(0)});
result=A.read(store,correction);
assert(!result.items.some(x=>['booster','additional-proof','level-review','current-training'].includes(x.kind)&&
 !x.key.endsWith(':'+old.id)),'Provas contraditórias não pertencem ao arquivo');
assert(!result.items.some(x=>x.kind==='booster'||x.kind==='additional-proof'||x.kind==='level-review'));
memory.set('scoutpro:v103:booster:153','{sem prova');
result=A.read(store,correction);assert(!result.items.some(x=>x.kind==='booster'));
assert(result.warnings.some(x=>x.includes('scoutpro:v103:booster:153')));
const inaccessible={get length(){throw Error('indisponível')},getItem(){throw Error('bloqueado')}};
assert(A.read(inaccessible,correction).warnings.length>0);
assert.deepEqual(A.read(store,{...correction,file:'fichas/144_Dean_Huijsen.html'}).items,[]);
memory.set(lab,'');result=A.read(store,correction);
assert.equal(result.items.find(x=>x.key===lab)?.raw,'','Registro vazio existente também deve ficar disponível no arquivo');
assert(result.warnings.some(x=>x.includes(lab)));

// Savinho tem o mesmo cuidado: CAP061 nunca entra no arquivo da CAP196.
const sav={capture:196,file:'fichas/196_Savinho.html',beforeCanonical:{id:'105821820296614',versao:'Edição antiga Savinho',name:'Savinho'}};
json('scoutpro:v67:'+sav.beforeCanonical.id+':061_Savinho.html',{secret:'CAP061'});
json('scoutpro:v67:'+sav.beforeCanonical.id+':196_Savinho.html',{train:Array(10).fill(0)});
const savResult=A.read(store,sav);assert.equal(savResult.items.length,1);assert(!JSON.stringify(savResult).includes('CAP061'));
const browser={};vm.runInNewContext(fs.readFileSync(file,'utf8'),{window:browser});
assert.equal(typeof browser.CRAQUE_IDENTITY_ARCHIVE_V377.read,'function');
console.log('V377 arquivo PASS: históricos isolados por CAP/arquivo/edição, bytes e assinaturas preservados, corrupção sem perda e nenhuma gravação.');
