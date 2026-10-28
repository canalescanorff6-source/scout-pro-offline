'use strict';
// V348: ranking da função/estilo em foco, sem reapresentar fixo/adicional
// como novo; preservar rascunhos e não fingir validação no jogo.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../web/craque-manager-fichas-v324.js');
const guide=require('../web/craque-ficha-decision-v327.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(catalog).cards.length,246);
const ranked=[
 {name:'Regista',reason:'Registrado como adicional'},
 {name:'Controle de bola',reason:'Controle no pivô'},
 {name:'CONTROLE DE BOLA',reason:'Duplicado no ranking'},
 {nome:'Força',motivo:'Outra opção específica'}];
const original=JSON.stringify(ranked);
const screened=api.reviewBoosterRanking(
 {name:'Técnica',reason:'Principal bruto'},ranked,
 '  técnica  ','REGISTA','ocupado');
assert.equal(screened.primary,'Controle de bola');
assert.equal(screened.primaryInfo.reason,'Controle no pivô',
 'Ao promover alternativa, sua justificativa contextual acompanha o nome');
assert.deepEqual(screened.alternatives.map(x=>x.name),['Força']);
assert.deepEqual(screened.excluded.map(x=>x.reason),
 ['mesmo_nome_do_fixo','ja_informado_como_adicional','repetido_no_ranking']);
assert.equal(screened.slot.status,'slot_ocupado');
assert.equal(screened.slot.mayEquip,false);
assert(Object.isFrozen(screened)&&Object.isFrozen(screened.alternatives));
assert.equal(JSON.stringify(ranked),original,'Ranking original não pode ser modificado');
const withoutSlot=api.reviewBoosterRanking(
 'Técnica',['Regista','Força'],'','', 'ausente');
assert.equal(withoutSlot.primary,null);
assert.equal(withoutSlot.alternatives.length,0);
assert.deepEqual(withoutSlot.theoretical.map(x=>x.name),
 ['Técnica','Regista','Força']);
assert.equal(withoutSlot.slot.slot,'ausente');
assert.equal(guide.equipmentSummary(null,[],withoutSlot.primary).booster,null);
const missing=api.reviewBoosterRanking(
 'Técnica',[{name:'Força',reason:'Hipótese para defesa'}],
 'Técnica','Força','pendente');
assert.equal(missing.primary,null,'Sem nova opção após excluir sobreposições');
assert.equal(missing.excluded.length,2);
const roleMAT=api.reviewBoosterRanking(
 'Regista',['Força'],'Técnica','','pendente');
const roleSA=api.reviewBoosterRanking(
 'Força',['Regista'],'Técnica','','pendente');
assert.equal(roleMAT.primary,'Regista');
assert.equal(roleSA.primary,'Força',
 'Mudança de posição precisa consumir o ranking daquele contexto');
const data=new Map(),writes=[];
const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{writes.push(k);data.set(k,v)}};
const base={owner:'teste',cardKey:'v348',cardId:'105297',edition:'exata',
 position:'MAT',style:'posse',manager:'CT-MGR-071',
 budget:62,sourceSignature:'assinatura-dados'};
const ctx={...base,collection:'outros-elencos'};
const my={...base,collection:'minhas-246'};
const train=[10,5,5,8,8,6,0,0,0,0];
api.save(storage,ctx,{train,booster:'Técnica',skills:[],
 source:'Rascunho legado com ímpeto equivalente ao fixo'});
const old=data.get(api.key(ctx)),count=writes.length;
assert.equal(api.read(storage,ctx).booster,'Técnica');
const preserved=guide.equipmentSummary(api.read(storage,ctx),[],screened.primary);
assert.equal(preserved.booster,'Técnica','Rascunho antigo não sofre substituição');
assert.equal(api.read(storage,my),null,'Não atravessar acervos');
api.reviewBoosterRanking('Técnica',ranked,'Técnica','Regista','pendente');
assert.equal(writes.length,count,'Ranking consultivo não escreve histórico');
assert.equal(data.get(api.key(ctx)),old);
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('reviewBoosterRanking?.(candidate,'));
assert(ui.includes('const usableCandidate=boosterReview?boosterReview.primary:'));
assert(ui.includes('boosterReview.excluded.length'));
assert(ui.includes('boosterReview.alternatives.map(x=>x.name)'));
assert(ui.includes('savedProfile?.booster||\'\''));
assert(ui.includes('const equipment=guide?.equipmentSummary?.(savedProfile,recommendations,usableCandidate);'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V348 PASS: ímpeto fixo/adicional/duplicado, promoção com motivo da função, slot ausente, legado, acervos e 246 cartas intactos.');
