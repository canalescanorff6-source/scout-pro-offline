'use strict';
// V349: campo livre de ímpetos em Outros Elencos pode conter vários nomes.
// Triagem, auditoria e salvamento devem ler o MESMO inventário, sem
// confundir nomes informados com equipamento confirmado no jogo.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../web/craque-manager-fichas-v324.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(catalog).cards.length,246);
const list='Regista; Técnica\nForça, Agilidade';
const ranked=api.reviewBoosterRanking(
 {name:'TÉCNICA',reason:'Principal bruto'},
 [{name:'Força',reason:'Equilíbrio'},
  {name:'Agilidade',reason:'Agilidade'},
  {nome:'Chute',motivo:'Alternativa deste contexto'},
  {name:'chute',reason:'Repetido na lista'}],
 'Defesa','Regista; Técnica\nForça, Agilidade','ocupado');
assert.equal(ranked.primary,'Chute','Não apresentar os quatro já cadastrados');
assert.equal(ranked.primaryInfo.reason,'Alternativa deste contexto');
assert.deepEqual(ranked.excluded.map(x=>x.reason),
 ['ja_informado_como_adicional','ja_informado_como_adicional',
  'ja_informado_como_adicional','repetido_no_ranking']);
assert.equal(ranked.slot.mayEquip,false);
const fixedMulti=api.reviewBoosterRanking(
 'técnica',['DEFESA','Chute'],'Técnica; Defesa','', 'pendente');
assert.equal(fixedMulti.primary,'Chute');
assert.deepEqual(fixedMulti.excluded.map(x=>x.reason),
 ['mesmo_nome_do_fixo','mesmo_nome_do_fixo']);
const one=api.auditEquipmentSelection([], 'Técnica', '', '', 'Defesa',
 'ocupado',null,list);
assert.equal(one.fixedBoosterSame,false);
assert.equal(one.informedBoosterSame,true);
assert.equal(one.status,'revisar_impeto_informado');
const two=api.auditEquipmentSelection([], 'Técnica', '', '', 'Técnica; Defesa',
 'ocupado',null,list);
assert.equal(two.fixedBoosterSame,true);
assert.equal(two.informedBoosterSame,true);
assert.equal(two.status,'revisar_impeto_fixo',
 'Priorizar o ímpeto fixo se ambas as listas contêm o mesmo nome');
const p=[10,5,5,8,8,6,0,0,0,0];
const ready=api.reviewDraftReadiness({
 train:p,budget:62,skills:[],booster:'Técnica',native:'',equipped:'',
 fixedBooster:'Defesa',informedBooster:list,boosterSlot:'ocupado'
});
assert.equal(ready.canSave,true,
 'Sem fonte de proibição, permitir proposta consultiva legada em revisão');
assert.equal(ready.audit.informedBoosterSame,true);
assert(ready.advisories.some(x=>x.includes('já consta como adicional informado')));
const unique=api.reviewDraftReadiness({...{
 train:p,budget:62,skills:[],booster:'Chute',fixedBooster:'Defesa',
 informedBooster:list,boosterSlot:'ocupado'}});
assert.equal(unique.audit.informedBoosterSame,false);
assert(!unique.advisories.some(x=>x.includes('já consta como adicional informado')));
const data=new Map(),writes=[];
const storage={getItem:k=>data.get(k)??null,
 setItem:(k,v)=>{writes.push(k);data.set(k,v)}};
const ctx={collection:'outros-elencos',owner:'teste',cardKey:'local-v349',
 cardId:'105297',edition:'Edição V349',position:'MAT',style:'posse',
 manager:'CT-MGR-071',budget:62,sourceSignature:'v349'};
const other={...ctx,collection:'minhas-246',owner:'principal'};
api.save(storage,ctx,{train:p,skills:[],booster:'Técnica',
 source:'Ficha antiga da mesma carta'});
const prev=storage.getItem(api.key(ctx)),count=writes.length;
assert.equal(api.read(storage,ctx).booster,'Técnica');
const next=api.save(storage,ctx,{train:p,skills:[],booster:'Técnica',
 source:'Nova revisão consultiva V349',fixedBooster:'Defesa',
 informedBooster:list,boosterSlot:'ocupado'});
assert.equal(next.revision,2);
assert.equal(api.readAll(storage,ctx)[0].booster,'Técnica');
assert.equal(api.read(storage,other),null);
const last=storage.getItem(api.key(ctx)),at=writes.length;
api.reviewBoosterRanking('Técnica',['Chute'],'Defesa',list,'ocupado');
api.auditEquipmentSelection([], 'Técnica', '', '', 'Defesa','ocupado',null,list);
assert.equal(storage.getItem(api.key(ctx)),last);
assert.equal(writes.length,at,'Auditorias são somente leitura');
assert.equal(JSON.parse(prev).revisions.length,1);
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes("skillKeyFor,model.booster||''"));
assert(ui.includes("informedBooster:model.booster||''"));
assert(ui.includes('equipmentAudit?.informedBoosterSame'));
assert(ui.includes('ct349-booster-inventory'));
assert(read('web/craque-positional-v311.css').includes('.ct349-booster-inventory'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V349 PASS: ímpetos em múltiplas linhas, fixo/adicional, aviso no editor, legado, coleções independentes e 246 cartas preservadas.');
