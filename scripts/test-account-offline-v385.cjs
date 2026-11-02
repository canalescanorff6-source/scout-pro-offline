'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const handlers={},base='https://offline.test/';
const html=new Map([['/index.html','<title>Meu elenco</title>'],['/ficha-da-conta-v385.html','<title>Ficha da conta</title>']]);
vm.runInNewContext(fs.readFileSync('web/sw.js','utf8'),{URL,Response,self:{location:{origin:new URL(base).origin},addEventListener:(type,fn)=>handlers[type]=fn},caches:{match:async(input,options={})=>{const u=new URL(typeof input==='string'?input:input.url,base),key=u.pathname+(options.ignoreSearch?'':u.search);return html.has(key)?new Response(html.get(key)):undefined;}},fetch:async()=>{throw Error('Sem rede');}});
async function navigate(path){let response;handlers.fetch({request:{url:new URL(path,base).href,method:'GET',mode:'navigate'},respondWith:p=>response=p});return (await response).text();}
(async()=>{assert.match(await navigate('ficha-da-conta-v385.html?account=secondary&id=nunca-aberta'),/Ficha da conta/,'A primeira abertura offline deve carregar a ficha, sem cair no catálogo');assert.match(await navigate('index.html?account=secondary'),/Meu elenco/);console.log('V385 OFFLINE PASS: primeira abertura da ficha por conta/ID sem rede preserva a página correta.');})();
