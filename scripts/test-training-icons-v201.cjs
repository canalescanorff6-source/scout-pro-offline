'use strict';
/* V201: testes sem navegador da iconografia das 10 categorias do eFootball.
 * Os SVGs são originais e puramente decorativos; builds PP permanecem intactas. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const source=require('../web/scout-training-icons-v201.js');
const expected=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
assert.equal(source.CATEGORIES.length,10,'Todas as categorias precisam de ícone');
assert.deepEqual(source.CATEGORIES.map(x=>x[1]),expected,'Rótulos idênticos às fichas, sem mudar nomenclatura');
assert.equal(new Set(source.CATEGORIES.map(x=>x[0])).size,10,'Ícones distintos');
const allShapes=new Set(Object.values(source.ICON_SHAPES));
assert.equal(allShapes.size,10,'Cada grupo precisa da sua própria figura');
for(const [key,label] of source.CATEGORIES){
 assert.equal(source.keyFor(label),key,'Correspondência precisa '+label);
 assert.equal(source.keyFor(label+' 12'),key,'Chip com nível mantém o ícone '+label);
 assert.equal(source.keyFor(label+' · A'),key,'Marcador opcional '+label);
 const svg=source.pictogram(key);
 assert(svg.includes('<svg')&&svg.includes('viewBox="0 0 64 64"'));
 assert(svg.includes('aria-hidden="true"')&&svg.includes('<path'),'Ilustração acessível '+label);
 assert(!svg.includes('<image')&&!svg.includes('href="http')&&!svg.includes('src="http'),'Não vincular imagens protegidas externas');
}
assert.equal(source.keyFor('Finalização de primeira'),null,'Ícone de treino não deve modificar habilidade específica');
assert.equal(source.keyFor('Passes na medida'),null,'Apenas grupos, não habilidades de jogadores');
assert.equal(source.keyFor('Goleiro 9'),null,'Não inventar categoria');
assert.equal(source.pictogram('inexistente'),'');
function fake(label){
 const attrs=new Map(),css=new Set();
 const doc={createElement:()=>{
  const child={nodeType:1,className:'',innerHTML:'',attrs:new Map(),setAttribute(k,v){this.attrs.set(k,v)}};
  return child;
 }};
 return {nodeType:1,ownerDocument:doc,firstChild:{type:'original-text',value:label},
 textContent:label,children:[],hasAttribute:k=>attrs.has(k),setAttribute:(k,v)=>attrs.set(k,v),
 classList:{add:v=>css.add(v)},insertBefore(child,ref){assert.equal(ref,this.firstChild);this.children.unshift(child)},
 getAttribute:k=>attrs.get(k),css};
}
for(const label of expected){
 const el=fake(label+' 9'),original=el.textContent;
 assert(source.decorateElement(el),'Inserir figura em '+label);
 assert.equal(el.textContent,original,'Não apagar níveis ou nomes '+label);
 assert.equal(el.children.length,1);
 assert(el.children[0].innerHTML.includes('<svg'),'Ícone vetorial presente');
 assert.equal(source.decorateElement(el),false,'Idempotência sem ícones duplicados');
 assert.equal(el.children.length,1);
}
assert.equal(source.decorateElement(fake('Habilidades adicionais')),false,'Outros blocos intocados');
const js=fs.readFileSync(path.join(web,'scout-training-icons-v201.js'),'utf8');
const css=fs.readFileSync(path.join(web,'scout-training-icons-v201.css'),'utf8');
assert(js.includes('MutationObserver')&&js.includes('addedNodes'),'Treino interativo precisa recuperar ícones após rerender');
for(const selector of ['#v188-train .scout-v188-train-chip','#lab-controls .lab-group > label','.v68-progress-row > span:first-child','#scout-training-v160 .v160-overflow tbody td:first-child'])
 assert(js.includes(selector),'Faltou uma área real de treino '+selector);
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'Cards de treino proporcionais');
assert(css.includes('@media(max-width:720px)')&&css.includes('@media(max-width:355px)'),'Android pequeno');
assert(css.includes('#lab-controls .lab-adjust')&&css.includes('min-height:40px'),'Ajuste de nível acessível');
for(const file of ['web/app-bridge.js','web/sw.js','scripts/stamp-bundle-v189.cjs']){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 assert(s.includes('scout-training-icons-v201.js')&&s.includes('scout-training-icons-v201.css'),'Paridade e offline: '+file);
}
const names=fs.readdirSync(path.join(web,'fichas')).filter(x=>x.endsWith('.html'));
assert.equal(names.length,246,'Todas as fichas intactas');
const roster=JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
assert.equal(roster.length,246);
let withLevels=0;
for(const card of roster){
 if(Array.isArray(card.niveis)&&card.niveis.length===10)withLevels++;
 assert(card.id&&card.numero>=1&&card.numero<=246,'Card IDs e cap existentes');
}
assert(withLevels>100,'Treinos cadastrados não alterados');
console.log('V201 OK: 10 pictogramas SVG originais, 4 componentes, rerender seguro, 246 cartas, PP preservados e paridade offline.');
