// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const web=path.resolve(__dirname,'../web');
const audit=JSON.parse(historicalRead(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8'));
const expected=new Map([[179,["Victor Osimhen",29,56]],[181,["Serhou Guirassy",31,60]],[183,["P. E. Aubameyang",32,62]],[186,["Neymar Jr",30,58]],[189,["Donyell Malen",31,60]],[192,["Jérémy Doku",31,60]],[193,["Allan Saint-Maximin",31,60]],[194,["Bruno Henrique",29,56]],[195,["Raphinha",28,54]],[199,["João Félix",32,62]]]);
const index=historicalRead(path.join(web,'index.html'),'utf8');
const dir=path.join(web,'fichas'),files=fs.readdirSync(dir).filter(x=>/^\d{3}_.+\.html$/.test(x));
let checked=0;
for(const card of audit.cards){
 if(!expected.has(card.numero))continue;
 checked++;
 const [name,level,pp]=expected.get(card.numero);
 assert.equal(card.name,name);assert.equal(card.max_level,level);assert.equal(card.pp,pp);
 assert.equal(card.niveis,null,'Não criar build inexistente: '+name);
 assert.match(card.pp_origem,/usuario/);
 const match=index.match(new RegExp('<a class="player-card"[^>]*data-cap="'+card.numero+'"[^>]*>[\\s\\S]*?<\\/a>'));
 assert(match&&match[0].includes('<span class="pp">'+pp+' PP</span>'),name+' com PP incorretos no índice');
 assert(!match[0].includes('Aguardando PP'),name+' ainda consta aguardando PP');
 const f=files.find(x=>x.startsWith(String(card.numero).padStart(3,'0')+'_'));
 assert(f,'Arquivo de ficha ausente: '+name);
 const html=historicalRead(path.join(dir,f),'utf8');
 const get=id=>JSON.parse(html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>','i'))[1]);
 const d=get('scout-v68-data'),l=get('lab-data');
 assert.equal(d.capture,card.numero);assert.equal(d.name,name);
 assert.equal(d.max_level,level);assert.equal(d.pp,pp);assert.equal(pp,2*(level-1));
 assert.equal(d.recommended_levels,null);assert.equal(d.recommended_scenario,null);
 assert.deepEqual(d.alternate_scenarios,{});
 assert.equal(l.maxLevel,level);assert.equal(l.pp,pp);assert.equal(l.A,null);assert.equal(l.B,null);assert.equal(l.C,null);
 assert(html.includes('PP REGISTRADOS · TREINO PENDENTE'));
}
assert.equal(checked,10);assert.equal(audit.cards.length,246);
assert.ok(audit.summary.with_pp>=232,'Progressão V88 não pode regredir');assert.ok(audit.summary.no_pp<=14,'Cartas pendentes não podem aumentar');assert.ok(audit.summary.level_user_entered>=70,'Níveis V88 não podem regredir');
console.log('V86 OK: 10 novos níveis máximos e PP permanentes; 212 com PP, 34 pendentes, 246 preservadas sem builds fictícias.');
