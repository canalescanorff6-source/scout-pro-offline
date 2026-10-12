'use strict';
const fs=require('fs'),path=require('path');
const web=path.resolve(__dirname,'../web'),idx=fs.readFileSync(path.join(web,'index.html'),'utf8');
const items=fs.readdirSync(path.join(web,'fichas')).filter(x=>x.endsWith('.html'));
const cards=fs.readdirSync(path.join(web,'cartas')).filter(x=>/\.(png|jpg|webp)$/i.test(x));
if(items.length!==246)throw Error('Esperadas 246 fichas: '+items.length);
if(cards.length!==246)throw Error('Esperadas 246 artes: '+cards.length);
// Impede o retorno do banner de marca recusado na interface Windows/Android.
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
if(bridge.includes('scout-pro-wordmark-v75.svg')||bridge.includes('scout-brand-v75'))
  throw Error('Banner Scout PRO Performance Lab não deve ser inserido no aplicativo.');
const missing=[];let references=0;
for(const name of ['index.html',...items.map(x=>'fichas/'+x)]){
 const txt=fs.readFileSync(path.join(web,name),'utf8');
 for(const [,asset] of txt.matchAll(/(?:src|href)=["'](\.\.?\/[^"'#?]+|cartas\/[^"'#?]+|fichas\/[^"'#?]+)["']/g)){
   if(asset.startsWith('https:')||asset.startsWith('#'))continue;
   const dest=path.resolve(path.dirname(path.join(web,name)),asset);
   if(!fs.existsSync(dest))missing.push(name+' -> '+asset);references++;
 }
 if(!txt.includes('app-bridge.js'))missing.push(name+' sem barra do aplicativo');
}
if(missing.length){console.error(missing.slice(0,50).join('\n'));throw Error(missing.length+' arquivos/referências incorretos')}
console.log('PASSOU: '+items.length+' fichas; '+cards.length+' artes; '+references+' links locais presentes.');
