'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),files=fs.readdirSync(path.join(root,'web/fichas')).filter(n=>/^\d{3}_.+\.html$/.test(n));
assert.equal(files.length,246);
let budgets=0,missing=0,base=0,native=0,budgetNoBuild=0;
const manual=new Map([[7,[35,68]],[12,[31,60]],[16,[27,52]],[18,[32,62]],[26,[31,60]],[50,[29,56]],[64,[19,36]],[65,[29,56]],[67,[31,60]],[71,[35,68]],[73,[29,56]],[86,[33,64]],[87,[32,62]],[101,[34,66]],[103,[31,60]],[107,[33,64]],[109,[31,60]],[112,[29,56]],[115,[28,54]],[116,[35,68]],[117,[33,64]],[118,[35,68]],[119,[35,68]],[120,[35,68]],[126,[35,68]],[139,[35,68]],[140,[33,64]],[141,[39,76]],[142,[33,64]],[151,[27,52]]]);
for(const file of files){
 const html=fs.readFileSync(path.join(root,'web/fichas',file),'utf8');
 const get=id=>{const m=html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)</script>'));assert(m,file+' '+id);return JSON.parse(m[1])};
 const d=get('scout-v68-data'),l=get('lab-data');assert(d.name&&l.name&&d.capture===Number(file.slice(0,3)));
 if(d.pp===null){missing++;assert(d.recommended_levels===null||d.recommended_levels===undefined)}
 else{
  budgets++;assert(Number.isInteger(d.pp)&&d.pp>=0);assert.strictEqual(l.pp,d.pp);
  if(d.recommended_levels===null){budgetNoBuild++;assert(manual.has(d.capture),'PP sem build não revisado: '+file);assert(d.recommended_scenario===null);assert.equal(d.max_level,manual.get(d.capture)[0]);assert.equal(d.pp,manual.get(d.capture)[1]);assert.equal(d.pp,2*(d.max_level-1));assert.match(d.pp_source,/usuario/)}
  else{const p=d.recommended_levels;assert(Array.isArray(p)&&p.length===10,p);const cost=p.reduce((sum,n)=>{for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);return sum},0);assert.strictEqual(cost,d.pp,'PP divergente '+file)}
 }
 if(d.base_stats_known)base++;if(d.has_native_skills)native++;
}
assert.equal(budgets,192);assert.equal(missing,54);assert.equal(budgetNoBuild,30);
assert(fs.readFileSync(path.join(root,'web/app-bridge.js'),'utf8').includes('scout-engine-v74.js'));
new (require('vm').Script)(fs.readFileSync(path.join(root,'web/scout-engine-v74.js'),'utf8'));
console.log('V84 OK: '+files.length+' fichas, '+budgets+' PP, '+missing+' pendentes, '+budgetNoBuild+' treinamentos não distribuídos, '+base+' bases, '+native+' skills.');
