'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),files=fs.readdirSync(path.join(root,'web/fichas')).filter(n=>/^\d{3}_.+\.html$/.test(n));
assert.equal(files.length,246);
let budgets=0,missing=0,base=0,native=0,budgetNoBuild=0;
const manual=new Map([[7,[35,68]],[12,[31,60]],[16,[27,52]],[18,[32,62]],[26,[31,60]],[50,[29,56]],[64,[19,36]],[65,[29,56]],[67,[31,60]],[71,[35,68]],[73,[29,56]],[86,[33,64]],[87,[32,62]],[101,[34,66]],[103,[31,60]],[107,[33,64]],[109,[31,60]],[112,[29,56]],[115,[28,54]],[116,[35,68]],[117,[33,64]],[118,[35,68]],[119,[35,68]],[120,[35,68]],[126,[35,68]],[139,[35,68]],[140,[33,64]],[141,[39,76]],[142,[33,64]],[151,[27,52]],[152,[27,52]],[155,[25,48]],[161,[27,52]],[162,[27,52]],[164,[29,56]],[167,[27,52]],[168,[29,56]],[170,[26,50]],[172,[24,46]],[177,[29,56]],[179,[29,56]],[181,[31,60]],[183,[32,62]],[186,[30,58]],[189,[31,60]],[192,[31,60]],[193,[31,60]],[194,[29,56]],[195,[28,54]],[199,[32,62]],[201,[32,62]],[202,[32,62]],[204,[23,44]],[210,[32,62]],[211,[1,0]],[212,[30,58]],[214,[32,62]],[218,[32,62]],[220,[32,62]],[221,[35,68]],[222,[32,62]],[223,[28,54]],[224,[33,64]],[226,[27,52]],[227,[31,60]],[228,[29,56]],[229,[31,60]],[230,[32,62]],[231,[30,58]],[232,[31,60]],[233,[36,70]],[234,[32,62]],[235,[33,64]],[236,[34,66]],[237,[33,64]],[238,[35,68]],[239,[31,60]],[240,[32,62]],[241,[31,60]],[242,[32,62]],[243,[31,60]],[244,[27,52]],[245,[33,64]],[246,[31,60]]]);
for(const file of files){
 const html=fs.readFileSync(path.join(root,'web/fichas',file),'utf8');
 const get=id=>{const m=html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)</script>'));assert(m,file+' '+id);return JSON.parse(m[1])};
 const d=get('scout-v68-data'),l=get('lab-data');assert(d.name&&l.name&&d.capture===Number(file.slice(0,3)));
 if(d.pp===null){missing++;assert(d.recommended_levels===null||d.recommended_levels===undefined)}
 else{
  budgets++;assert(Number.isInteger(d.pp)&&d.pp>=0);assert.strictEqual(l.pp,d.pp);
  if(d.recommended_levels===null&&[153,196].includes(d.capture)){budgetNoBuild++;assert.equal(d.pp_estimated,true);assert.match(d.pp_origem,/catalogo_publico_correcao_edicao/);assert.equal(d.pp,2*(d.max_level-1));assert(Array.isArray(l.draftA));}else if(d.recommended_levels===null){budgetNoBuild++;assert(manual.has(d.capture),'PP sem build não revisado: '+file);assert(d.recommended_scenario===null);assert.equal(d.max_level,manual.get(d.capture)[0]);assert.equal(d.pp,manual.get(d.capture)[1]);assert.equal(d.pp,2*(d.max_level-1));assert.match(d.pp_source,/usuario/)}
  else{const p=d.recommended_levels;assert(Array.isArray(p)&&p.length===10,p);const cost=p.reduce((sum,n)=>{for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);return sum},0);assert.strictEqual(cost,d.pp,'PP divergente '+file)}
 }
 if(d.base_stats_known)base++;if(d.has_native_skills)native++;
}
assert.equal(budgets,246);assert.equal(missing,0);assert.equal(budgetNoBuild,86);
assert(fs.readFileSync(path.join(root,'web/app-bridge.js'),'utf8').includes('scout-engine-v74.js'));
new (require('vm').Script)(fs.readFileSync(path.join(root,'web/scout-engine-v74.js'),'utf8'));
console.log('V90 OK: '+files.length+' fichas, '+budgets+' PP, '+missing+' pendentes, '+budgetNoBuild+' treinamentos não distribuídos, '+base+' bases, '+native+' skills.');
