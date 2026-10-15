'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const web=path.resolve(__dirname,'../web');
const lib=require('../web/card-motion-v186.js');
assert.equal(lib.classifyRarity('SHOW TIME'),'show');
assert.equal(lib.classifyRarity('ÉPICA'),'epic');
assert.equal(lib.classifyRarity('Epic — AC Milan'),'epic');
assert.equal(lib.classifyRarity('BIG TIME'),'big');
assert.equal(lib.classifyRarity('DISTINGUIDO'),'highlight');
assert.equal(lib.classifyRarity('Highlight'),'highlight');
assert.equal(lib.SETTINGS_KEY,'scoutpro:v186:card-motion');
const index=fs.readFileSync(path.join(web,'index.html'),'utf8');
const cards=[...index.matchAll(/<a class="player-card"[^>]*data-cap="(\d+)"[^>]*data-rarity="([^"]+)"/g)];
assert.equal(cards.length,246);
const tally=cards.reduce((o,x)=>(o[lib.classifyRarity(x[2])]=(o[lib.classifyRarity(x[2])]||0)+1,o),{});
assert.deepEqual(tally,{epic:63,show:36,big:3,highlight:144});
const files=fs.readdirSync(path.join(web,'fichas')).filter(p=>/\.html$/.test(p));
assert.equal(files.length,246);
for(const f of files)assert(fs.readFileSync(path.join(web,'fichas',f),'utf8').includes('app-bridge.js'),'Ficha sem integração: '+f);
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
const sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
const css=fs.readFileSync(path.join(web,'card-motion-v186.css'),'utf8');
const js=fs.readFileSync(path.join(web,'card-motion-v186.js'),'utf8');
assert(bridge.includes("card-motion-v186.js")&&bridge.includes("card-motion-v186.css"),'Assets não conectados a todas as páginas');
assert(sw.includes("./card-motion-v186.js")&&sw.includes("./card-motion-v186.css")&&sw.includes("v186-motion"),'PWA deve atualizar cache offline');
for(const s of ['show','epic','big','highlight'])assert(css.includes('data-scout-motion-rarity="'+s+'"'),'Efeito não existe: '+s);
assert(css.includes('prefers-reduced-motion:reduce'),'Respeitar preferência de acessibilidade');
assert(css.includes('animation-play-state:paused'),'Não deixar GPU rodando fora de tela');
assert(js.includes('IntersectionObserver')&&js.includes('visibilitychange')&&js.includes('saveData'),'Otimizacao de recursos');
assert(!/https?:\/\//.test(js+css),'Efeitos devem ser totalmente offline');
class El{
 constructor(name='div'){this.name=name;this.dataset={};this.children=[];this.events={};this.parentNode=null;this.attributes={};this.style={};this.className='';this.disabled=false;this.title='';this.textContent='';this.flag={};
  this.classList={add:(v)=>{this.flag[v]=true},toggle:(v,on)=>{this.flag[v]=!!on}};
 }
 appendChild(x){if(x.parentNode)x.parentNode.children=x.parentNode.children.filter(c=>c!==x);this.children.push(x);x.parentNode=this;return x}
 append(...xs){xs.forEach(x=>this.appendChild(x))}
 insertBefore(x,before){if(x.parentNode)x.parentNode.children=x.parentNode.children.filter(c=>c!==x);const i=this.children.indexOf(before);this.children.splice(i<0?0:i,0,x);x.parentNode=this}
 insertAdjacentElement(where,x){if(where==='afterend'&&this.parentNode){const i=this.parentNode.children.indexOf(this);this.parentNode.children.splice(i+1,0,x);x.parentNode=this}}
 querySelector(s){if(s==='.scout-motion-layer')return this.children.find(x=>x.className==='scout-motion-layer')||null;if(s==='img')return this.children.find(x=>x.name==='img')||null;return null}
 setAttribute(k,v){this.attributes[k]=String(v)}
 addEventListener(type,cb){this.events[type]=cb}
}
const script=fs.readFileSync(path.join(web,'card-motion-v186.js'),'utf8');
function browserTest(page,reduced=false,storagePref=null){
 const local={};if(storagePref)local[lib.SETTINGS_KEY]=storagePref;
 const body=new El('body');body.dataset.page=page;
 const tools=new El();const toolbar=new El();toolbar.appendChild(tools);
 const profile=new El(),side=new El(),mobile=new El();
 const img=new El('img');mobile.appendChild(img);
 const cards=Array.from({length:4},(_,i)=>{let card=new El('a');card.dataset.rarity=['SHOW TIME','ÉPICA','BIG TIME','DISTINGUIDO'][i];let art=new El();card.art=art;card.appendChild(art);card.querySelector=(s)=>s==='.card-art'?art:null;return card});
 const buttons=[];
 const doc={body,hidden:false,readyState:'complete',title:'Luis Díaz — SHOW TIME | SCOUT PRO',
  createElement:tag=>{let el=new El(tag);if(tag==='button')buttons.push(el);return el},
  querySelector:s=>s==='.toolbar .tools'?tools:s==='.profile-content'?profile:s==='.side-art'?side:s==='.mobile-profile'?mobile:null,
  querySelectorAll:s=>s==='.player-card[data-rarity]'?cards:s==='.scout-motion-toggle'?buttons.filter(x=>x.className==='scout-motion-toggle'):[],
  addEventListener:(name,fn)=>{doc['on_'+name]=fn}
 };
 const win={document:doc,matchMedia:()=>({matches:reduced,addEventListener(){}}),navigator:{connection:{saveData:false}},
  localStorage:{getItem:k=>local[k]||null,setItem:(k,v)=>{local[k]=v}},
  IntersectionObserver:class {constructor(fn){this.fn=fn}observe(target){this.fn([{target,isIntersecting:true}])}}
 };
 vm.runInNewContext(script,{window:win,module:{exports:{}},console},{timeout:3000});
 assert.equal(body.dataset.scoutMotionInit,'1');
 const btn=buttons.find(x=>x.className==='scout-motion-toggle');
 assert(btn,'Botão de animação ausente em '+page);
 if(page==='catalog'){
  assert.deepEqual(cards.map(c=>c.art.dataset.scoutMotionRarity),['show','epic','big','highlight']);
  assert(cards.every(c=>c.art.children.some(e=>e.className==='scout-motion-layer')),'Todas as quatro artes recebem sobreposição');
  assert.equal(cards[0].art.dataset.scoutMotionActive,String(!reduced&&storagePref!=='off'));
 }else{
  assert.equal(side.dataset.scoutMotionRarity,'show');
  assert.equal(mobile.children[0].className,'scout-mobile-art');
  assert.equal(mobile.children[0].children[0],img);
  assert(mobile.children[0].querySelector('.scout-motion-layer'));
 }
 assert.equal(btn.disabled,reduced);
 if(!reduced){
  const before=btn.attributes['aria-pressed'];
  btn.events.click();
  assert.notEqual(btn.attributes['aria-pressed'],before,'Botao realmente alterna movimento');
  assert.equal(local[lib.SETTINGS_KEY],before==='true'?'off':'on','Preferencia persistida');
  doc.hidden=true;doc.on_visibilitychange();
  assert.equal(body.flag['scout-motion-on'],false,'Animação deve pausar em segundo plano');
 }else assert.equal(body.flag['scout-motion-on'],false,'Respeitar reduzido pelo sistema');
}
browserTest('catalog');browserTest('detail');browserTest('catalog',true);browserTest('catalog',false,'off');
console.log('V186 OK: 246 artes, 4 efeitos únicos, catálogo+fichas, alternância persistente, redução de movimento e pausar fora da tela.');
