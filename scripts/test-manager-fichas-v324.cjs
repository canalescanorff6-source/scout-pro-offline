'use strict';
/* V324 — isolamento por técnico, edição, posição e estilo, nos dois acervos. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),text=x=>fs.readFileSync(path.join(root,x),'utf8');
const core=require('../web/craque-manager-fichas-v324.js');
const tactical=require('../web/craque-positional-v311.js');
const cards=JSON.parse(text('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246);
const original=JSON.stringify(cards),storeDb=new Map();
const store={
 getItem:k=>storeDb.get(k)??null,
 setItem:(k,v)=>{storeDb.set(k,String(v))},
 removeItem:k=>storeDb.delete(k)
};
const card=cards.find(x=>x.numero===40);
assert(card&&card.name==='Dwight Yorke');
const model=tactical.fromPersonal(card);
const raw={collection:model.collection,owner:model.owner,cardKey:model.cardKey,
 cardId:model.cardId,edition:model.edition,position:'CA',style:'posse',
 manager:'CT-MGR-071',budget:model.pp,sourceSignature:'abc123'};
const ctx=core.validateContext(raw);
const otherManager=core.withManager(ctx,'CT-MGR-004'),sa=core.withPosition(ctx,'SA'),
 quick=core.withStyle(ctx,'rapido'),differentProof={...ctx,sourceSignature:'different'},
 separateEdition={...ctx,edition:'Outra edição'},diffCard={...ctx,cardId:'9876',cardKey:'99@9876'},
 external={...ctx,collection:'outros-elencos',owner:'bruno-cd',cardKey:'ext-1'};
const variants=[ctx,otherManager,sa,quick,differentProof,separateEdition,diffCard,external];
assert.equal(new Set(variants.map(core.key)).size,variants.length,
 'Mesma carta em outro técnico, posição, estilo, edição ou acervo não pode cruzar histórico');
assert(!core.read(store,ctx));
const pp=Array.isArray(card.niveis)&&core.validTraining(card.niveis,card.pp)?
 card.niveis:Array(10).fill(0);
assert(core.validTraining(pp,card.pp));
const sourceCopy=JSON.stringify(card);
const record=core.save(store,ctx,{train:pp,skills:['Passe em profundidade'],
 booster:'Recomendação pessoal',source:'V324 · candidato, não equipado'});
assert.equal(record.revision,1);
assert.equal(record.status,'proposta_consultiva');
assert.equal(core.read(store,ctx).skills[0],'Passe em profundidade');
assert.equal(core.read(store,otherManager),null);
assert.equal(core.read(store,sa),null);
assert.equal(core.read(store,quick),null);
assert.equal(core.read(store,external),null);
assert.equal(core.read(store,differentProof),null);
assert.deepEqual(JSON.parse(sourceCopy),card,'Ninguém altera a carta do catálogo');
const profile2=core.save(store,otherManager,{train:pp,skills:[],booster:''});
assert.equal(profile2.revision,1);
const profile3=core.save(store,sa,{train:pp,skills:[],booster:''});
assert.equal(profile3.revision,1);
const profile4=core.save(store,quick,{train:pp,skills:[],booster:''});
assert.equal(profile4.revision,1);
const externalResult=core.save(store,external,{train:pp,skills:[],booster:''});
assert.equal(externalResult.revision,1);
const ownSecond=core.save(store,ctx,{train:pp,skills:['Passe de primeira','Passe em profundidade'],booster:''});
assert.equal(ownSecond.revision,2);
assert.equal(core.readAll(store,ctx).length,2,'Manter histórico de revisões por técnico');
assert.equal(core.read(store,otherManager).revision,1,'R. Rodríguez não pode herdar revisão Kovač');
// Autoedição por +/- não deve preencher 50 revisões e travar a ficha.
const auto=core.withManager(ctx,'CT-MGR-025');
for(let i=0;i<60;i++)core.save(store,auto,{
 train:pp,skills:[],booster:'',source:'V324 · Rascunho PP de posse'});
assert.equal(core.readAll(store,auto).length,1,
 'Cliques de PP consolidam a revisão automática atual');
core.save(store,auto,{train:pp,skills:['Passe na medida'],source:'Revisão manual'});
assert.equal(core.readAll(store,auto).length,2,'Salvar manualmente cria nova revisão');
core.save(store,auto,{train:pp,skills:['Passe na medida'],
 source:'V324 · Rascunho PP de posse'});
assert.equal(core.readAll(store,auto).length,3,'Autoedição após salvamento manual não o sobrescreve');
assert.equal(core.readAll(store,auto)[1].skills[0],'Passe na medida',
 'Snapshot manual imutável após edição automática');
const mutable=core.read(store,ctx);mutable.train[0]=999;mutable.skills.push('Invasão');
assert.notDeepEqual(mutable.train,core.read(store,ctx).train,'A consulta deve ser cópia profunda');
assert.throws(()=>core.save(store,ctx,{train:Array(10).fill(20)}),/PP|inválid/i);
assert.throws(()=>core.save(store,ctx,{train:pp,skills:Array(6).fill('Candidata')}),/cinco/i);
assert.throws(()=>core.save(store,ctx,{train:pp,skills:['Passe de primeira','Passe de primeira']}),/duplicada/i);
assert.throws(()=>core.validateContext({...ctx,manager:'CT-MGR-INVALIDO'}),/técnico/);
assert.throws(()=>core.validateContext({...ctx,style:'overload'}),/estilo/);
const previous=store.getItem(core.key(ctx));
store.setItem(core.key(ctx),'{NÃO É JSON');
assert.throws(()=>core.read(store,ctx),/ilegível/);
assert.throws(()=>core.save(store,ctx,{train:pp}),/ilegível/);
assert.equal(store.getItem(core.key(ctx)),'{NÃO É JSON','Nunca sobrescrever histórico corrompido');
store.setItem(core.key(ctx),previous);
assert.equal(core.read(store,ctx).revision,2);
const noDeletion=core.deleteDraft(store,ctx);
assert.equal(noDeletion,false);
assert.equal(core.read(store,ctx).revision,2);
const sc={position:'CA',style:'posse',manager:'CT-MGR-071',
 contentSignature:'signature',outcome:{plan:{pp:card.pp}}};
const from=core.fromScenario(sc,model);
assert.equal(from.collection,'minhas-246');
assert.equal(from.cardId,String(card.id));
assert.equal(from.budget,card.pp);
assert.equal(from.position,'CA');
assert.equal(from.manager,'CT-MGR-071');
const extModel={...model,collection:'outros-elencos',owner:'terceiro',
 cardKey:'externa-42',cardId:'ID EXTERNO',edition:'Edição autorizada'};
const extFrom=core.fromScenario(sc,extModel);
assert.notEqual(core.key(from),core.key(extFrom));
for(const style of core.STYLES){assert(core.key(core.withStyle(ctx,style)).includes(style))}
const ui=text('web/craque-positional-ui-v311.js');
const editor=text('web/scout-training-unified-v218.js');
const others=text('web/outros-elencos-v227.html');
const bridge=text('web/app-bridge.js'),sw=text('web/sw.js'),stamp=text('scripts/stamp-bundle-v189.cjs');
assert(ui.includes('profiles.fromScenario(scenario,model)'));
assert(ui.includes('Até 5 habilidades adicionais'));
assert(ui.includes('Salvar ficha independente deste técnico'));
assert(ui.includes('scoutpro:v324:context-selected'));
assert(editor.includes('const context=contextForTactic()'));
assert(editor.includes('scoutpro:training-preview-v324'));
assert(editor.includes('card.role_used||card.shown_position'),
 'As fichas reais usam role_used/shown_position; não confundir treino cadastrado com referência pendente');
const html=text('web/fichas/001_Daniele_Massaro.html');
const marker='<script id="scout-v68-data" type="application/json">';
const at=html.indexOf(marker),end=html.indexOf('</script>',at);
assert(at>=0&&end>at,'Ficha original HTML sem estrutura prevista');
const htmlRaw=JSON.parse(html.slice(at+marker.length,end));
assert.equal(htmlRaw.role_used,'CA');
assert.equal(htmlRaw.shown_position,'AC');
assert.equal(htmlRaw.recommended_levels.length,10);

assert(text('web/lab.js').includes('scoutpro:training-preview-v324'));
assert(editor.includes('profiles.save(host.localStorage,context'));
assert(editor.includes('if(!contextForTactic())try{host.localStorage.removeItem(keyForTactic())}'));
assert(editor.includes('if(contextForTactic())return; // laboratórios antigos não atravessam técnico'));
assert(others.includes('src="craque-manager-fichas-v324.js"'));
assert(bridge.includes("v189Root+'craque-manager-fichas-v324.js'"));
assert(sw.includes("'./craque-manager-fichas-v324.js'"));
assert(stamp.includes("'craque-manager-fichas-v324.js'"));
assert(sw.includes('v324-fichas-per-manager'));
assert.equal(JSON.stringify(cards),original,'246 cartas originais inalteradas');
console.log('V324 PASS: fichas independentes por técnico, posição, estilo, edição, PP, acervo; revisões, corrupção, offline e 246 cartas intactas.');
