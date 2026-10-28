'use strict';
const fs=require('node:fs'),path=require('node:path');
function review(card,raw,entry){
 if(Number(raw.capture)!==Number(card.numero)||String(raw.id)!==String(card.id)||raw.name!==card.name)
  throw Error('Identidade da ficha diverge do catálogo: '+card.numero);
 const next={...card},data={...raw},changes=[],pending=[];const ref=entry?.reference;
 if(!String(raw.native_skills||'').trim()&&String(card.habilidades_nativas||'').trim()){
  data.native_skills=card.habilidades_nativas;changes.push('native_skills');
 }
 if(entry?.identityUsable&&ref?.cardId===String(card.id)&&ref.levelValid){
  if(ref.maxPP!==card.pp)pending.push('pp_divergente');
  else if(!Number.isInteger(card.max_level)){
   next.max_level=ref.maxLevel;next.pp_origem='catalogo_publico_pesdb_2026-10-27';
   next.nivel_referencia={kind:'catalogo_publico',url:ref.url,card_id:ref.cardId,confirmed_in_game:false};
   changes.push('nivel_maximo_publico');
  }
 }
 if(Number.isInteger(next.max_level)&&!Number.isInteger(data.max_level)){
  data.max_level=next.max_level;data.pp_origem=next.pp_origem||'origem_a_conferir';
  if(next.nivel_referencia)data.nivel_referencia={...next.nivel_referencia};changes.push('nivel_maximo_na_ficha');
 }
 return {card:next,raw:data,changes,pending};
}
if(require.main===module){
 const root=path.resolve(__dirname,'../web'),output=process.argv[2]&&path.resolve(process.argv[2]);
 if(!output)throw Error('Informe uma pasta de backup/relatório.');
 const apply=process.argv.includes('--apply');fs.mkdirSync(output,{recursive:true});
 const catalogFile=path.join(root,'SCOUT_V69_AUDITORIA.json'),original=fs.readFileSync(catalogFile,'utf8'),catalog=JSON.parse(original);
 const references=JSON.parse(fs.readFileSync(path.join(root,'ct376-card-references.json'),'utf8')).cards;
 const patches=[],report=[];
 for(const c of catalog.cards){
  if(!/^fichas\/\d{3}_[^/]+\.html$/.test(c.arquivo))throw Error('Caminho inesperado: '+c.arquivo);
  const file=path.join(root,c.arquivo),html=fs.readFileSync(file,'utf8');
  const pattern=/(<script\b(?=[^>]*\bid=["']scout-v68-data["'])[^>]*>)([\s\S]*?)(<\/script>)/i,m=html.match(pattern);
  if(!m)throw Error('Metadados ausentes: '+c.arquivo);
  const raw=JSON.parse(m[2]),result=review(c,raw,references.find(r=>r.capture===c.numero));
  report.push({cap:c.numero,changes:result.changes,pending:result.pending});
  if(result.changes.length){
   const encoded=JSON.stringify(result.raw).replace(/</g,'\\u003c');
   patches.push({file,relative:c.arquivo,before:html,after:html.replace(pattern,()=>m[1]+encoded+m[3])});
   catalog.cards[catalog.cards.indexOf(c)]=result.card;
  }
 }
 if(apply){
  const backup=path.join(output,'antes-v376');fs.mkdirSync(backup,{recursive:true});
  if(!fs.existsSync(path.join(backup,'SCOUT_V69_AUDITORIA.json')))fs.writeFileSync(path.join(backup,'SCOUT_V69_AUDITORIA.json'),original);
  for(const p of patches){const b=path.join(backup,path.basename(p.file));if(!fs.existsSync(b))fs.writeFileSync(b,p.before);fs.writeFileSync(p.file,p.after);}
  catalog.summary.level_public_reference=catalog.cards.filter(c=>/^catalogo_publico_/.test(String(c.pp_origem||''))).length;
  catalog.summary.level_total=catalog.cards.filter(c=>Number.isInteger(c.max_level)).length;
  fs.writeFileSync(catalogFile,JSON.stringify(catalog,null,2)+'\n');
 }
 fs.writeFileSync(path.join(output,'correcoes-metadados.json'),JSON.stringify({applied:apply,cards:report},null,2)+'\n');
 console.log(JSON.stringify({applied:apply,files:patches.length,nativeFields:report.filter(x=>x.changes.includes('native_skills')).length,
  publicLevels:report.filter(x=>x.changes.includes('nivel_maximo_publico')).length,ppConflicts:report.filter(x=>x.pending.length).length}));
}
module.exports={review};
