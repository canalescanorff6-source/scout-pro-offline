'use strict';
/* V194: prova de reaproveitamento, sem texto inventado/duplicação e sem mutar os dados das 246 cartas. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {moveGuideContent}=require('../web/scout-profile-v188.js');
assert.equal(typeof moveGuideContent,'function');
function element(tag,id=''){
 return {tag,id,textContent:'',children:[],parent:null,attributes:{},
  appendChild(ch){if(ch.parent)ch.parent.children=ch.parent.children.filter(n=>n!==ch);this.children.push(ch);ch.parent=this;return ch},
  insertAdjacentElement(where,ch){
   assert.equal(where,'beforebegin');assert(this.parent);
   if(ch.parent)ch.parent.children=ch.parent.children.filter(n=>n!==ch);
   const i=this.parent.children.indexOf(this);this.parent.children.splice(i,0,ch);ch.parent=this.parent;return ch
  },setAttribute(k,v){this.attributes[k]=v}
 };
}
const holder=element('main'),panel=element('section','scout-v188-principal');
const foco=element('section','foco'),jogar=element('section','jogar');
const txtFocus=element('div'),txtGame=element('div');txtFocus.textContent='Texto original do foco';txtGame.textContent='Orientação original de gameplay';
foco.appendChild(txtFocus);jogar.appendChild(txtGame);
const progress=element('div'),more=element('button');panel.appendChild(progress);panel.appendChild(more);
const linkFocus=element('a'),linkGame=element('a');
const originals={'#foco .focus-banner':txtFocus,'#jogar .gameplay-tip':txtGame};
const parents={'#foco .focus-banner':foco,'#jogar .gameplay-tip':jogar};
holder.querySelector=q=>{
 if(q==='.side-nav a[href="#foco"]')return linkFocus;
 if(q==='.side-nav a[href="#jogar"]')return linkGame;
 return originals[q]&&originals[q].parent===parents[q]?originals[q]:null
};
panel.querySelector=q=>{
 if(q==='.scout-v188-progress')return progress;
 if(q==='.scout-v188-more')return more;
 if(q.startsWith('#'))return panel.children.find(n=>n.id===q.slice(1))||null;
 return null
};
const document={createElement:tag=>element(tag)};
assert.deepEqual(moveGuideContent(document,panel,holder),{focus:true,gameplay:true});
assert.equal(txtFocus.textContent,'Texto original do foco');
assert.equal(txtGame.textContent,'Orientação original de gameplay');
assert.equal(foco.children.length,0,'Texto original do foco deve ser movido, nunca duplicado');
assert.equal(jogar.children.length,0,'Orientação antiga deve ser movida, nunca duplicada');
assert.equal(linkFocus.attributes.href,'#scout-v194-focus','Navegação deve apontar ao resumo visível');
assert.equal(linkGame.attributes.href,'#scout-v194-gameplay','Navegação deve apontar à dica visível');
assert.equal(panel.children.filter(n=>n.id==='scout-v194-focus').length,1);
assert.equal(panel.children.filter(n=>n.id==='scout-v194-gameplay').length,1);
assert.deepEqual(moveGuideContent(document,panel,holder),{focus:false,gameplay:false},'Não criar duplicatas na segunda execução');
const empty=element('section');empty.querySelector=()=>null;
assert.deepEqual(moveGuideContent(document,empty,empty),{focus:false,gameplay:false},'Fallback para fichas sem documentação');
const css=read('web/scout-visual-v192.css'),sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
assert(css.includes('#scout-v188-principal>.scout-v194-guide')&&css.includes('@media(max-width:720px)'));
assert(sw.includes('v194-card-guide'),'Cache precisa atualizar');
assert(stamp.includes("'scout-profile-v188.js'")&&stamp.includes("'scout-visual-v192.css'"),'Android e Windows compartilham as alterações');
const index=read('web/index.html');
assert.equal((index.match(/class="player-card"/g)||[]).length,246);
const names=fs.readdirSync(path.join(root,'web/fichas')).filter(n=>n.endsWith('.html'));
assert.equal(names.length,246);
let guides=0,focuses=0;const missing=[];
for(const name of names){
 const html=read('web/fichas/'+name);
 assert(html.includes('app-bridge.js')&&html.includes('id="scout-v68-data"'),'Ficha base preservada: '+name);
 if(/<section class="topic" id="foco">[\s\S]*?<div class="focus-banner">\S[\s\S]*?<\/div>/.test(html))focuses++;
 if(/<section class="topic" id="jogar">[\s\S]*?<div class="gameplay-tip">\S[\s\S]*?<\/div>/.test(html))guides++;
 else missing.push(name);
}
assert.equal(focuses,246,'Foco registrado deve existir em todas as cartas');
assert.equal(guides,246,'Dica de gameplay registrada deve existir em todas as cartas. Ausentes: '+missing.join(', '));
console.log('V194 OK: 246 focos e dicas reutilizados; zero textos inventados ou duplicados; links e viewport preservados.');
