'use strict';
/* V256 — reportes de jogo só valem na MESMA edição, posição, tática
 * e vetor exato, sem transformar nota/vídeo citado em prova competitiva.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-match-evidence-v256.js');
const P=require('../web/scout-position-training-v246.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const baseline=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(baseline).cards;
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>Number(c.numero)+'@'+String(c.id))).size,246);
const m=cards.find(x=>x.numero===191),messi=cards.find(x=>x.numero===50);
assert(m&&messi);assert.equal(m.pp,50);assert.equal(m.max_level,26);
assert(T.valid(m.niveis));assert.equal(T.total(m.niveis),50);
const entries=new Map();
const store={
 getItem:k=>entries.has(k)?entries.get(k):null,
 setItem:(k,v)=>entries.set(k,String(v)),
 removeItem:k=>entries.delete(k)
};
const one=V.build(m,'posse','ALA',m.niveis,'catalogo');
assert.equal(one.pp,50);
assert.equal(one.mode,'posse');
assert.equal(V.eligibleRole(m,'ALA',store),true);
assert.equal(V.eligibleRole(m,'CA',store),false);
assert.throws(()=>V.build(m,'posse','ALA',m.niveis.map((n,i)=>i===0?n+1:n),'catalogo'));
assert.throws(()=>V.build(m,'posse','CA',m.niveis,'indisponivel'));
assert.throws(()=>V.build(m,'unknown','ALA',m.niveis,'catalogo'));
assert.throws(()=>V.build(m,'posse','GO',m.niveis,'catalogo'));
assert.notEqual(V.build(m,'normal','ALA',m.niveis,'catalogo').fingerprint,one.fingerprint);
assert.notEqual(V.build(m,'posse','CA',m.niveis,'catalogo').fingerprint,one.fingerprint);
const report={
 id:'teste_001',mode:'posse',role:'ALA',
 source:'catalogo',levels:m.niveis,date:'2026-10-19',result:'V',
 in_game_confirmed:true,
 observations:[
  {prompt:'Passe de retorno para o centro',grade:'bom'},
  {prompt:'Condução acelerada',grade:'regular'},
  {prompt:'Recuperação sem bola',grade:'nao_avaliado'}
 ],
 notes:'Controle sob marcação e triangulação curta.',video_filename:'partida_001.mp4'
};
assert.throws(()=>V.save(m,store,{...report,in_game_confirmed:false}),/Confirme/i);
assert.equal(entries.size,0);
assert.throws(()=>V.save(m,store,{...report,role:'CA'}),/não tem treino/i);
assert.equal(entries.size,0,'Não gravar partida para CA sem treinamento confirmado');
const saved=V.save(m,store,report);
assert.equal(saved.count,1);
assert.equal(saved.record.build.fingerprint,one.fingerprint);
assert.equal(V.parse(m,store).length,1);
assert.equal(V.summary(m,store,one).total,1);
assert.equal(V.summary(m,store,one).wins,1);
assert.equal(V.summary(m,store,one).validatedByGame,false);
const anotherStyle=V.build(m,'rapido','ALA',m.niveis,'catalogo');
const anotherRole=V.build(m,'posse','CA',m.niveis,'catalogo');
assert.equal(V.list(m,store,anotherStyle).length,0);
assert.equal(V.list(m,store,anotherRole).length,0);
assert.equal(V.list(messi,store).length,0,'Outra edição não recebe o relato de Martinelli');
assert.throws(()=>V.save(m,store,report),/duplicado/i);
const original=store.getItem(V.key(m));
for(const bad of [
 {...report,id:'teste_002',date:'2026-02-30'},
 {...report,id:'teste_002',result:'?',date:'2026-10-19'},
 {...report,id:'teste_002',notes:'X'.repeat(801)},
 {...report,id:'teste_002',video_filename:'V'.repeat(121)},
 {...report,id:'teste_002',observations:[...report.observations.slice(0,2),
  {prompt:'Passe sob pressão',grade:'meta_confirmado'}]}
]){
 assert.throws(()=>V.save(m,store,bad));
 assert.equal(store.getItem(V.key(m)),original,
  'Arquivo inválido nunca pode sobrescrever histórico bom');
}
// Após confirmação EXATA, a posição alternativa passa a aceitar relato.
P.confirm(m,'CA',true,store);
const alt={...report,id:'teste_002',role:'CA',result:'D'};
const revised=V.save(m,store,alt);
assert.equal(revised.count,2);
assert.equal(V.list(m,store,anotherRole).length,1);
assert.equal(V.list(m,store,one).length,1);
P.confirm(m,'CA',false,store);
// Histórico passado fica guardado, mas novas partidas em CA bloqueadas.
assert.equal(V.list(m,store,anotherRole).length,1);
assert.throws(()=>V.save(m,store,{...alt,id:'teste_003'}),/não tem treino/i);
assert.equal(V.summary(m,store).total,2);
// Corrupção de esquema ou Card ID bloqueia a gravação sem apagar evidências.
const full=store.getItem(V.key(m));
const poisoned=JSON.parse(full);poisoned.card_id='OUTRA_EDICAO';
store.setItem(V.key(m),JSON.stringify(poisoned));
assert.throws(()=>V.parse(m,store),/incompatível/i);
assert.throws(()=>V.save(m,store,{...report,id:'teste_003'}),/incompatível/i);
assert.notEqual(store.getItem(V.key(m)),full,'Dados suspeitos preservados intactos');
store.setItem(V.key(m),full);
assert.equal(V.remove(m,store,'teste_002'),1);
assert.equal(V.list(m,store,one).length,1);
assert.equal(V.remove(m,store,'teste_001'),0);
assert.equal(entries.has(V.key(m)),false,'Excluir última partida apaga só o histórico da edição');
// Falha física durante escrita: o registro anterior permanece.
V.save(m,store,report);
const failingStore={
 ...store,
 setItem:()=>{throw Error('disco cheio')}
};
assert.throws(()=>V.save(m,failingStore,{...report,id:'teste_004'}),/disco cheio/);
assert.equal(V.parse(m,store).length,1);
let built=0;
for(const card of cards){
 if(!T.valid(card.niveis)||T.total(card.niveis)!==Number(card.pp))continue;
 for(const mode of V.MODES){
  const role=T.roleOf({shown_position:card.posicao});
  if(!role||!V.ROLES.includes(role))continue;
  const b=V.build(card,mode,role,card.niveis,'catalogo');
  assert(b.fingerprint.includes(mode+':'+role+':'+card.pp+':'));
  built++;
 }
}
assert(built>=300,'Auditar centenas de combinações sem inventar vetores');
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),baseline,'Nunca editar acervo');
const bundle=read('web/app-bridge.js'),audit=read('web/craque-ficha-individual-v251.js');
const css=read('web/craque-ficha-individual-v251.css'),sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs'),pkg=JSON.parse(read('package.json'));
assert(bundle.includes("evidence.src=v189Root+'craque-match-evidence-v256.js'"));
assert(bundle.includes('evidence.onload=()=>document.head.appendChild(v251)'));
assert(audit.includes('const trialsApi=host.CRAQUE_MATCH_EVIDENCE_V256'));
assert(audit.includes('block.append(trialsApi.render(doc,'));
assert(css.includes('ct256-trials>summary'));
assert(sw.includes("'./craque-match-evidence-v256.js'"));
assert(sw.includes('v256-build-match-trials'));
assert(stamp.includes("'craque-match-evidence-v256.js'"));
assert(pkg.scripts.check.includes('test-match-evidence-v256.cjs'));
console.log('V256 OK: '+built+' combinações de build documentada/5 estilos sem alterar 246 cartas.');
console.log('V256 OK: jogo relatado exige edição, função treinada, tática, PP exatos e confirmação em campo.');
console.log('V256 OK: histórico sem falsa homologação, edição isolada, exclusão consciente, backup V226.');
