'use strict';
const fs=require('node:fs'),path=require('node:path');
const web=path.resolve(__dirname,'../web');
const alias={'Matador':'Homem de área','Oportunista':'Artilheiro','Arrastar Defesa':'Puxa marcação','Criador de Espaços':'Infiltração','Construção de Jogo':'Defensor criativo','Jogador de infiltração':'Infiltração','Clássico nº 10':'Clássico 10','Lateral Defensivo':'Lateral defensivo','Atacante pivô':'Pivô','Avançado Pivô':'Pivô','Goleiro adiantado':'Goleiro ofensivo','GR Ofensivo':'Goleiro ofensivo','Saída ofensiva':'Goleiro ofensivo','O destruidor':'Destruidor','O Destruidor':'Destruidor','Todo o Terreno':'Meia versátil','Trinco':'Primeiro volante','Pressão Elevada':'Pressão no ataque','Cobertura':'Função de cobertura'};
const confirmed={'89138556572074':['Artilheiro',null],'88044950524330':['Artilheiro',null],'88039581945284':['Artilheiro',null],'88029649701165':['Artilheiro',null],'106777450514613':['Artilheiro',null],'88045755866499':['Artilheiro','Pressão no ataque'],'106758391503938':['Artilheiro',null],'88039045074390':['Homem de área',null],'88036360719839':['Homem de área',null],'88033139494377':['Homem de área',null],'88040387251729':['Homem de área',null],'88040655732170':['Homem de área',null],'88030455171360':['Homem de área',null],'88045755861057':['Homem de área','Atacante surpresa'],'88036360649078':['Puxa marcação',null],'88044145220884':['Puxa marcação',null],'106787651039542':['Infiltração',null],'106785503548605':['Infiltração',null]};
const doubtful=new Set(['Defensor participativo','Mestre da linha alta','Foco no Ataque','Ladrão no ataque']);
const translate=(v,id,i)=>confirmed[String(id)]?.[i]||((doubtful.has(v))?'A confirmar no jogo':alias[v]||v);
const replace=(s,a,b)=>(a&&a!==b)?s.split(a).join(b):s;
const ordered=Object.entries(alias).sort((a,b)=>b[0].length-a[0].length);
const dir=path.join(web,'fichas'),files=fs.readdirSync(dir).filter(s=>/^\d{3}_.*\.html$/.test(s));
if(files.length!==246)throw Error('Esperadas 246 cartas; recebidas '+files.length);
const records=[];
for(const name of files){
 const file=path.join(dir,name);let html=fs.readFileSync(file,'utf8');
 const match=html.match(/<script[^>]*id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/i);
 if(!match)throw Error('Sem dados: '+name);
 const obj=JSON.parse(match[1]),oldA=obj.attack_style,oldD=obj.defence_style;
 const a=translate(oldA,obj.id,0),d=translate(oldD,obj.id,1);
 if(!obj.legacy_attack_style)obj.legacy_attack_style=oldA;
 if(!obj.legacy_defence_style)obj.legacy_defence_style=oldD;
 obj.attack_style=a;obj.defence_style=d;
 html=html.replace(match[1],JSON.stringify(obj));
 const lab=html.match(/<script[^>]*id="lab-data"[^>]*>([\s\S]*?)<\/script>/i);
 if(lab){const l=JSON.parse(lab[1]);if(typeof l.style==='string')l.style=a;html=html.replace(lab[1],JSON.stringify(l))}
 html=replace(replace(html,oldA,a),oldD,d);
 for(const [from,to] of ordered)html=replace(html,from,to);
 fs.writeFileSync(file,html);
 records.push({cap:obj.capture,id:obj.id,oldAttack:oldA,attack:a,oldDefense:oldD,defense:d,needsCheck:a==='A confirmar no jogo'||d==='A confirmar no jogo'});
}
let index=fs.readFileSync(path.join(web,'index.html'),'utf8');
for(const [from,to] of ordered)index=replace(index,from,to);
fs.writeFileSync(path.join(web,'index.html'),index);
fs.writeFileSync(path.join(web,'AUDITORIA_ESTILOS_PTBR_V75.json'),JSON.stringify({version:'V75',language:'pt-BR',records},null,2));
console.log('V75 nomes BR:',records.length,'cartas;',records.filter(x=>x.oldAttack!==x.attack).length,'ofensivos corrigidos;',records.filter(x=>x.oldDefense!==x.defense).length,'defensivos corrigidos;',records.filter(x=>x.needsCheck).length,'pendentes.');
