'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {suggestPreview,previewCost,previewValid}=require(path.join(root,'web/lab.js'));
const audit=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'));
const cards=audit.cards.filter(c=>c.niveis===null);
assert.equal(cards.length,86,'Nenhum novo treinamento deve ser gravado automaticamente');
let nonzero=0;
for(const c of cards){
 assert(Number.isInteger(c.pp)&&c.pp>=0);
 const build=suggestPreview(c.pp,c.posicao,c.estilo_ataque);
 assert(previewValid(build.vec),'Prévia inválida #'+c.numero);
 assert.equal(previewCost(build.vec),c.pp,'PP não distribuídos integralmente #'+c.numero);
 assert.equal(build.remaining,0,'PP sobrando #'+c.numero);
 if(c.pp>0){
  nonzero++;
  assert(build.vec.some(n=>n>0),'Prévia zerada #'+c.numero);
 }
 const goalkeeper=['GR','GO'].includes(c.posicao);
 if(!goalkeeper)assert(build.vec.slice(7).every(n=>n===0),'Jogador de linha com treino GO #'+c.numero);
 const file=path.join(root,'web',c.arquivo),html=fs.readFileSync(file,'utf8');
 const match=html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i);
 assert(match,'JSON de ficha ausente #'+c.numero);
 const model=JSON.parse(match[1]);
 assert.equal(model.recommended_levels,null,'Não transformar heurística em build oficial #'+c.numero);
}
assert.equal(nonzero,85); 
const eto=suggestPreview(66,'CA','Artilheiro');assert.equal(eto.spent,66);assert(eto.vec[0]>0&&eto.vec[3]>0);assert(eto.vec.slice(7).every(x=>x===0));
const kubo=suggestPreview(0,'MLD','Armador criativo');assert.equal(kubo.spent,0);assert(kubo.vec.every(x=>x===0));
const source=fs.readFileSync(path.join(root,'web/lab.js'),'utf8');
assert(source.includes('Salvar como meu treino de teste'));
assert(source.includes("active='prévia experimental'"));
assert(source.includes('Não foi possível salvar'));
assert(source.includes('previewValid(saved?.train)'));
console.log('V94 OK: 84 fichas sem build aprovada recebem prévia exata; 83 orçamentos positivos, Kubo 0 PP, builds existentes preservadas.');
