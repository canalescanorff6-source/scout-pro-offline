'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const web=path.resolve(__dirname,'../web'),dir=path.join(web,'fichas');
const files=fs.readdirSync(dir).filter(n=>/^\d{3}_.*\.html$/.test(n));
assert.equal(files.length,246);
const catalog=fs.readFileSync(path.join(web,'index.html'),'utf8');
let recovered=0,goalkeepers=0,conflicts=0;
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
  conflicts++;
  assert.equal(data.style_conflict,true,'Conflito não sinalizado: '+file);
  assert.equal(data.playing_style,'A confirmar no jogo','Conflito ignorado: '+file);
  assert.match(card,/Destruidor \(conferir\)/,'Conflito oculto: '+file);
 }
}
assert.equal(recovered,12,'Número de registros Destruidor/Básico mudou; auditar os dados.');
assert.equal(goalkeepers,11,'Número de goleiros com Básico mudou; auditar os dados.');
assert.equal(conflicts,3,'Número de conflitos de Destruidor mudou; auditar os dados.');
console.log('V76 OK: 12 Destruidores, 11 goleiros recuperados; 3 conflitos sinalizados; 246 cartas preservadas.');
