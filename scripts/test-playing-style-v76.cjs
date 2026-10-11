'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const web=path.resolve(__dirname,'../web'),dir=path.join(web,'fichas');
const files=fs.readdirSync(dir).filter(n=>/^\d{3}_.*\.html$/.test(n));
assert.equal(files.length,246);
const catalog=fs.readFileSync(path.join(web,'index.html'),'utf8');
let recovered=0,goalkeepers=0,conflicts=0,dual=0;
for(const file of files){
 const source=fs.readFileSync(path.join(dir,file),'utf8');
 const data=JSON.parse(source.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i)?.[1]||'null');
 const lab=JSON.parse(source.match(/<script[^>]*id="lab-data"[^>]*>([\s\S]*?)<\/script>/i)?.[1]||'null');
 assert(data&&lab,'Dados ausentes: '+file);
 assert.equal(data.playing_style,lab.style,'Laboratório diverge: '+file);
 const a=data.attack_style,d=data.defence_style;
 const card=new RegExp('<a\\b[^>]*\\bclass="player-card"[^>]*\\bdata-cap="'+data.capture+'"[^>]*>[\\s\\S]*?<\\/a>','i').exec(catalog)?.[0];
 assert(card,'Não há cartão '+data.capture);
 if(a==='Básico'&&d==='Destruidor'){
  recovered++;
  assert.equal(data.playing_style,'Destruidor','Estilo omitido: '+file);
  assert.match(card,/<span class="player-role">[^<]*Destruidor<\/span>/,'Catálogo mostra Básico: '+file);
  assert.match(source,/<label>Estilo de jogo<\/label><b>Destruidor<\/b>/,'Ficha sem estilo: '+file);
 }
 if(a==='Básico'&&/^Goleiro (?:ofensivo|defensivo)$/.test(d)){
  goalkeepers++;
  assert.equal(data.playing_style,d,'Estilo do goleiro omitido: '+file);
  assert.match(card,/<span class="player-role">[^<]*Goleiro (?:ofensivo|defensivo)<\/span>/);
 }
 if(d==='Destruidor'&&a!=='Básico'&&a!=='Destruidor'){
  dual++;
  assert.equal(data.dual_playing_style,true,'Estilo duplo não registrado: '+file);
  assert.equal(data.style_conflict,false,'Duplo estilo não é conflito: '+file);
  assert.deepEqual(data.playing_styles,[a,d],'Os dois estilos devem permanecer: '+file);
  assert.equal(data.playing_style,a,'Estilo ofensivo deve ser o principal: '+file);
  assert.match(card,/\(ataque\) \/ Destruidor \(defesa\)/,'Fases não exibidas: '+file);
 }
 if(data.style_conflict)conflicts++;
}
assert.equal(recovered,12,'Número de registros Destruidor/Básico mudou; auditar os dados.');
assert.equal(goalkeepers,11,'Número de goleiros com Básico mudou; auditar os dados.');
assert.equal(dual,3,'Devem existir três estilos duplos confirmados.');
assert.equal(conflicts,0,'Não há conflitos entre as três cartas confirmadas.');
console.log('V79 OK: 12 Destruidores simples, 3 cartas de estilos duplos, 11 goleiros; 246 cartas preservadas.');
