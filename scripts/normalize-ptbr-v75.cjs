'use strict';
const fs=require('node:fs'),path=require('node:path');
const web=path.resolve(__dirname,'../web');
const alias={'Matador':'Homem de área','Oportunista':'Artilheiro','Arrastar Defesa':'Puxa marcação','Criador de Espaços':'Infiltração','Construção de Jogo':'Defensor criativo','Jogador de infiltração':'Infiltração','Clássico nº 10':'Clássico 10','Lateral Defensivo':'Lateral defensivo','Atacante pivô':'Pivô','Avançado Pivô':'Pivô','Goleiro adiantado':'Goleiro ofensivo','GR Ofensivo':'Goleiro ofensivo','Saída ofensiva':'Goleiro ofensivo','O destruidor':'Destruidor','O Destruidor':'Destruidor','Todo o Terreno':'Meia versátil','Trinco':'Primeiro volante','Pressão Elevada':'Pressão no ataque','Cobertura':'Função de cobertura'};
const confirmed={'89138556572074':['Artilheiro',null],'88044950524330':['Artilheiro',null],'88039581945284':['Artilheiro',null],'88029649701165':['Artilheiro',null],'106777450514613':['Artilheiro',null],'88045755866499':['Artilheiro','Pressão no ataque'],'106758391503938':['Artilheiro',null],'88039045074390':['Homem de área',null],'88036360719839':['Homem de área',null],'88033139494377':['Homem de área',null],'88040387251729':['Homem de área',null],'88040655732170':['Homem de área',null],'88030455171360':['Homem de área',null],'88045755861057':['Homem de área','Atacante surpresa'],'88036360649078':['Puxa marcação',null],'88044145220884':['Puxa marcação',null],'106787651039542':['Infiltração',null],'106785503548605':['Infiltração',null]};
const doubtful=new Set(['Defensor participativo','Mestre da linha alta','Foco no Ataque','Ladrão no ataque']);
const translate=(v,id,i)=>confirmed[String(id)]?.[i]||((doubtful.has(v))?'A confirmar no jogo':alias[v]||v);
const replace=(s,a,b)=>(a&&a!==b)?s.split(a).join(b):s;
const ordered=Object.entries(alias).sort((a,b)=>b[0].length-a[0].length);
// Um único estilo de jogo na Konami: "Básico" na coluna ofensiva é apenas
// um marcador do catálogo quando o estilo real consta na coluna defensiva.
const isBasic=v=>!v||v==='Básico';
const styleOf=(a,d)=>{
 const conflict=d==='Destruidor'&&!isBasic(a)&&a!==d;
 return {
  style:conflict?'A confirmar no jogo':isBasic(a)&&!isBasic(d)?d:a,
  conflict
 };
};
const dir=path.join(web,'fichas'),files=fs.readdirSync(dir).filter(s=>/^\d{3}_.*\.html$/.test(s));
if(files.length!==246)throw Error('Esperadas 246 cartas; recebidas '+files.length);
const records=[];
// Preserva JSON de origem e scripts externos; ajustes de etiquetas só no HTML visível.
function updateCard(html,obj){
 const scripts=[];
 const masked=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,tag=>{
  const i=scripts.length;scripts.push(tag);return 'SCOUT_SCRIPT_PLACEHOLDER_'+i+'_END';
 });
 const findJSON=(id)=>{
  const i=scripts.findIndex(tag=>new RegExp('id=["\\x27]'+id+'["\\x27]','i').test(tag));
  if(i<0)throw Error('Script ausente: '+id+' - '+obj.name);
  const tag=scripts[i],start=tag.indexOf('>')+1,end=tag.search(/<\/script>$/i);
  return {i,value:JSON.parse(tag.slice(start,end)),start,end};
 };
 const data=findJSON('scout-v68-data'),lab=findJSON('lab-data');
 const oldA=data.value.attack_style,oldD=data.value.defence_style;
 const a=translate(oldA,obj.id,0),d=translate(oldD,obj.id,1);
 const choice=styleOf(a,d);
 if(!data.value.legacy_attack_style)data.value.legacy_attack_style=oldA;
 if(!data.value.legacy_defence_style)data.value.legacy_defence_style=oldD;
 data.value.attack_style=a;data.value.defence_style=d;
 data.value.playing_style=choice.style;
 data.value.style_conflict=choice.conflict;
 if(choice.conflict)data.value.style_candidates=[a,d];
 else delete data.value.style_candidates;
 lab.value.style=choice.style;
 const replaceJSON=(which,content)=>{
  const tag=scripts[which.i];scripts[which.i]=tag.slice(0,which.start)+JSON.stringify(content)+tag.slice(which.end);
 };
 replaceJSON(data,data.value);replaceJSON(lab,lab.value);
 let visible=replace(replace(masked,oldA,a),oldD,d);
 for(const [from,to] of ordered)visible=replace(visible,from,to);
 if(isBasic(a)&&!isBasic(d)){
  visible=replace(visible,'Básico',d);
  visible=replace(visible,'Estilo ofensivo','Estilo de jogo');
  visible=replace(visible,'ESTILO OFENSIVO / DEFENSIVO','ESTILO DE JOGO');
  visible=replace(visible,d+' / '+d,d);
 }
 // Registros com dois estilos incompatíveis não são convertidos arbitrariamente.
 // Ambas as opções ficam documentadas até conferência da carta original.
 return {html:visible.replace(/SCOUT_SCRIPT_PLACEHOLDER_(\d+)_END/g,(_,n)=>scripts[Number(n)]),
  record:{cap:obj.capture,id:obj.id,oldAttack:oldA,attack:a,oldDefense:oldD,defense:d,
   playingStyle:choice.style,conflict:choice.conflict,
   needsCheck:choice.conflict||a==='A confirmar no jogo'||d==='A confirmar no jogo'}};
}
for(const name of files){
 const file=path.join(dir,name),html=fs.readFileSync(file,'utf8');
 const m=html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i);
 if(!m)throw Error('Sem dados: '+name);
 const obj=JSON.parse(m[1]);
 const updated=updateCard(html,obj);
 fs.writeFileSync(file,updated.html);
 records.push(updated.record);
}
let index=fs.readFileSync(path.join(web,'index.html'),'utf8');
for(const [from,to] of ordered)index=replace(index,from,to);
// O índice é a fonte do filtro: derive o estilo exclusivamente da ficha normalizada.
for(const item of records){
 const displayed=isBasic(item.attack)&&!isBasic(item.defense)?item.defense:null;
 const re=new RegExp('(<a\\b[^>]*\\bclass="player-card"[^>]*\\bdata-cap="'+item.cap+'"[^>]*>)([\\s\\S]*?)(<\\/a>)','i');
 if(!re.test(index))throw Error('Carta ausente no catálogo: '+item.cap);
 index=index.replace(re,(_,tag,content,end)=>{
  // Mesmo em recompilações repetidas, cada card tem apenas um data-style.
  tag=tag.replace(/ data-style="[^"]*"/g,'');
  const safe=item.playingStyle.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  tag=tag.replace(' data-cap=',' data-style="'+safe+'" data-cap=');
  if(displayed)content=replace(content,'Básico',displayed);
  if(item.conflict){
   const warning='Estilos conflitantes: '+item.attack+' / '+item.defense+' (conferir)';
   tag=tag.replace('data-search="','data-search="'+warning+' ');
   content=content.replace(/(<span class="player-role">)([^<]*)(<\/span>)/,(_,a,b,c)=>a+b+' / '+item.defense+' (conferir)'+c);
  }
  return tag+content+end;
 });
}
fs.writeFileSync(path.join(web,'index.html'),index);
fs.writeFileSync(path.join(web,'AUDITORIA_ESTILOS_PTBR_V75.json'),
 JSON.stringify({version:'V76',language:'pt-BR',records},null,2));
console.log('V76:',records.length,'cartas;',records.filter(x=>x.playingStyle==='Destruidor'&&isBasic(x.attack)).length,
 'Destruidor recuperados do campo defensivo;',records.filter(x=>x.conflict).length,
 'conflitos sinalizados;',records.filter(x=>x.playingStyle.startsWith('Goleiro ')&&isBasic(x.attack)).length,
 'goleiros corrigidos.');
