'use strict';
/* V364: 246 originais imutáveis; 15 novas, orçamento PP e artes corretas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const audit=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
const next=JSON.parse(read('web/craque-minhas-cartas-v364.json'));
const pp=require('../web/craque-pp-universal-v309.js');
assert.equal(audit.cards.length,246,'o catálogo original deve permanecer com 246');
assert.equal(next.schema,'CRAQUE_MINHAS_CARTAS_ADICIONAIS_V364');
assert.equal(next.baseOriginalCount,246);
assert.equal(next.totalAfterExtension,261);
assert.equal(next.cards.length,15);
assert.deepEqual(next.cards.map(c=>c.numero),Array.from({length:15},(_,i)=>247+i));
const originalIds=new Set(audit.cards.map(c=>c.id)),ids=new Set();
for(const c of next.cards){
 assert.equal(c.owner,'minhas-cartas');
 assert.equal(c.cardId,null,'não inventar Card ID');
 assert(!ids.has(c.internalId),'sem duplicatas');ids.add(c.internalId);
 assert.equal(c.levelConfirmedMaximum,false,'print eFHub não é prova de máximo');
 assert.equal(c.ppIfLevelIsMaximum,pp.budget(c.levelShownEFHub),'PP condicionado calculado pelo motor');
 assert(c.levelShownEFHub>0&&c.levelShownEFHub<=120);
 assert(c.status.includes('PENDENTE'));
 assert(!originalIds.has(c.internalId),'não reutilizar ID original');
 assert(c.shownSkills.length>=5,'print de habilidades deve estar cadastrado: '+c.name);
 const art=path.join(web,c.image);
 assert(fs.existsSync(art),'arte original ausente: '+art);
 const b=fs.readFileSync(art);
 assert.equal(b.subarray(0,4).toString(),'RIFF','imagem não é WebP: '+c.name);
 assert.equal(b.subarray(8,12).toString(),'WEBP','WebP inválida: '+c.name);
 const fileSize=b.readUInt32LE(4);
 assert.equal(fileSize,b.length-8,'tamanho do container WebP inválido: '+c.name);
}
const guirassy=audit.cards.find(c=>c.numero===181);
assert(guirassy&&next.cards.some(c=>c.numero===255&&c.name==='Serhou Guirassy'),'duplicidade de edição sem substituir #181');
assert.equal(audit.cards.filter(c=>Number.isInteger(c.max_level)).length,85);
const missing=audit.cards.filter(c=>!Number.isInteger(c.max_level));
assert.equal(missing.length,161,'listagem de níveis ainda pendentes');
for(const c of audit.cards){
 if(Number.isInteger(c.max_level))assert.equal(c.pp,pp.budget(c.max_level),'divergência no original #'+c.numero);
}
const idx=read('web/index.html'),script=read('web/craque-minhas-cartas-v364.js');
assert.equal((idx.match(/class="player-card"/g)||[]).length,246,'HTML original não deve ser regravado com novos cards');
assert(idx.includes('craque-minhas-cartas-v364.js'));
assert(idx.indexOf('craque-minhas-cartas-v364.js')<idx.indexOf('src="premium.js"'),'carregar novas cartas antes do filtro principal');
assert(script.includes("host.append(card)")||script.includes('host.append(card);'));
assert(script.includes("dataset.ct364MainCards='15'"));
for(const file of ['web/minhas-cartas-v364.html','web/craque-minhas-cartas-v364.css','web/craque-minhas-cartas-v364-detail.js']){
 assert(fs.existsSync(path.join(root,file)),file+' ausente');
}
assert(read('web/sw.js').includes('-v364-main-plus15'));
assert(read('scripts/stamp-bundle-v189.cjs').includes('ct364_Svensson.webp'));
assert(read('web/craque-minhas-cartas-v364-detail.js').includes('CRAQUE_FRIEND_TRAINING_V228'));
assert(read('web/craque-minhas-cartas-v364-detail.js').includes("nativeSkills:''"),'não fingir habilidade nativa');
assert(read('web/minhas-cartas-v364.html').includes('craque-ficha-individual-v251.js'));
assert(read('web/minhas-cartas-v364.html').includes('craque-role-intelligence-v233.js'));
console.log('V364 PASS: +15 na principal (261 visíveis), WebP 15/15, PP condicionais corretos, 246 imutáveis, 161 níveis pendentes, V251/V233 carregados.');
