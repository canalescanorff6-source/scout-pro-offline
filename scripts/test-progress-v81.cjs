'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const engine=require('../web/progress-v81.js');
assert.equal(engine.budget(33),64);
assert.equal(engine.budget(1),0);
assert.equal(engine.budget(0),null);
assert.equal(engine.budget(120),238);
assert.equal(engine.budget(121),null);
assert.equal(engine.budget(85.5),null);
const f=path.resolve(__dirname,'../web/fichas');
const files=fs.readdirSync(f).filter(n=>/^\d{3}_.+\.html$/.test(n));
let waiting=0,complete=0;
for(const name of files){
 const html=fs.readFileSync(path.join(f,name),'utf8');
 const d=JSON.parse(html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i)[1]);
 if(d.pp===null)waiting++;else complete++;
 const fake={cap:d.capture,name:d.name,level:33,pp:64};
 assert(engine.record(fake,d));
 assert(!engine.record({...fake,name:'Outra edição'},d));
 assert(!engine.record({...fake,pp:65},d));
}
assert.equal(files.length,246);assert.equal(waiting,54);assert.equal(complete,192);
for(const position of ['CA','SA','MAT','MLG','VOL','ZG','LD','LE','GO','PTE','PTD']){
 for(const pp of [0,2,24,52,62,64,86,120,180,238]){
 const out=engine.suggest(pp,position,'Destruidor');
 assert(engine.valid(out.vec));
 assert.equal(engine.cost(out.vec),out.spent);
 assert.equal(out.spent+out.remaining,pp);
 assert(out.spent<=pp);
 }
}
const js=fs.readFileSync(path.resolve(__dirname,'../web/app-bridge.js'),'utf8');
assert(js.includes('progress-v81.js')&&js.includes('progress-v81.css'));
const lab=fs.readFileSync(path.resolve(__dirname,'../web/lab.js'),'utf8');
assert(lab.includes("scoutpro:v81:pp:")&&lab.includes("scoutpro:pp-updated"));
const review=fs.readFileSync(path.resolve(__dirname,'../web/performance-review-v80.js'),'utf8');
assert(review.includes("scoutpro:v81:pp:")&&review.includes("scoutpro:pp-updated"));
console.log('V84 OK: 246 fichas; 54 sem PP; 192 com PP no catálogo; 30 níveis informados sem builds inventadas.');
