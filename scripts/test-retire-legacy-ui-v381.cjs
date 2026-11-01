'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {rewrite}=require('./retire-legacy-ui-v381.cjs');
const root=path.resolve(__dirname,'../web'),dir=path.join(root,'fichas');
const pages=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
const cards=fs.readdirSync(dir).filter(x=>/^\d{3}_.*\.html$/.test(x));
assert.equal(cards.length,246,'Acervo original deve conservar as 246 cartas');
assert.ok(pages.length>=15,'Todas as páginas de trabalho devem permanecer');
let total=0,changed=0;
for(const [folder,items,isCard] of [[root,pages,false],[dir,cards,true]]){
 for(const name of items){
  const before=fs.readFileSync(path.join(folder,name),'utf8');
  const after=rewrite(before,isCard);
  assert.equal(rewrite(after,isCard),after,'Transformação não idempotente: '+name);
  const preserve=html=>[...html.matchAll(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi)].map(x=>x[0]);
  assert.deepEqual(preserve(after),preserve(before),'Código ou dados foram modificados: '+name);
  assert.equal((after.match(/<a\b/gi)||[]).length,(before.match(/<a\b/gi)||[]).length,
   'Links não podem ser removidos: '+name);
  const t=after.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'';
  const h=after.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)?.[0]||'';
  const stripTags=html=>html.replace(/<[^>]*>/g,' ');
  assert.doesNotMatch(stripTags(t+' '+h),/\bSCOUT\s+PRO\b|\bBUILD ENGINE\b|\bV\d+\b/i,
   'Interface original ainda no título/cabeçalho: '+name);
  if(isCard){
   assert.ok(after.includes('id="scout-v68-data"'),'Dados originais sumiram: '+name);
   assert.ok(after.includes('craque-tatico-icon.svg'),'Logo atual não está na ficha: '+name);
  }
  total++;if(before!==after)changed++;
 }
}
console.log('UI V381 PASS:',total,'arquivos (246 cartas +',pages.length,'telas);',
 'identidade atual, idempotência, 100% dos scripts/dados e links preservados; arquivos alteráveis:',changed);
