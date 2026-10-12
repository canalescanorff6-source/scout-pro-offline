'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const web=path.resolve(__dirname,'../web'),audit=JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8'));
const expected=new Map([[7,[35,68]],[12,[31,60]],[16,[27,52]],[18,[32,62]],[26,[31,60]],[50,[29,56]],[64,[19,36]],[65,[29,56]],[67,[31,60]],[71,[35,68]]]);
const index=fs.readFileSync(path.join(web,'index.html'),'utf8'),folder=path.join(web,'fichas');
const filenames=fs.readdirSync(folder).filter(x=>/^\d{3}_.*\.html$/.test(x));
let count=0;
for(const c of audit.cards){
 if(!expected.has(c.numero))continue;count++;
 const [level,pp]=expected.get(c.numero);
 assert.equal(c.max_level,level);assert.equal(c.pp,pp);assert.match(c.pp_origem,/usuario/);
 const m=index.match(new RegExp('<a class="player-card"[^>]*data-cap="'+c.numero+'"[^>]*>[\\s\\S]*?<\\/a>','i'));
 assert(m,c.name+' ausente no índice');
 assert(m[0].includes('<span class="pp">'+pp+' PP</span>'),'PP antigo: '+c.name);
 assert(!m[0].includes('Aguardando PP'));
 const filename=filenames.find(x=>x.startsWith(String(c.numero).padStart(3,'0')+'_'));
 assert(filename,'Ficha faltando: '+c.name);
 const html=fs.readFileSync(path.join(folder,filename),'utf8');
 const data=JSON.parse(html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i)[1]);
 const lab=JSON.parse(html.match(/<script[^>]*id="lab-data"[^>]*>([\s\S]*?)<\/script>/i)[1]);
 assert.equal(data.name,c.name);assert.equal(data.max_level,level);assert.equal(data.pp,pp);
 assert.equal(data.recommended_levels,null,'Build não informada não pode ser inventada');
 assert.equal(lab.pp,pp);assert.equal(lab.maxLevel,level);assert.equal(pp,2*(level-1));
}
assert.equal(count,10);assert.equal(audit.summary.with_pp,232);assert.equal(audit.summary.no_pp,14);
const core=require('../web/performance-core-v80.js');
assert.equal(core.review({pp:60,pp_estimated:false,recommended_levels:null,has_native_skills:false,boost2:'PENDENTE'}, {A:null,B:null,C:null,stats:{}},[],null).status,'PP confirmados · treino pendente');
console.log('V82 OK: 10 cartas com níveis máximos e PP persistentes; 246 preservadas; sem builds inventadas.');
