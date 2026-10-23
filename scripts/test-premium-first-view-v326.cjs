'use strict';
/* V326 — segurança visual: navegação simples, uma decisão em foco,
 * alternativas disponíveis por demanda, nenhum dado de carta editado.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const original=JSON.stringify(cards);assert.equal(cards.length,246);
const homepage=read('web/scout-ui-v189.js');
const positional=read('web/craque-positional-ui-v311.js');
const css=read('web/craque-positional-v311.css');
const homeCss=read('web/craque-design-v230.css');
const sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs');
const items=[
 ['#catalogo','Minhas Cartas'],
 ['outros-elencos-v227.html','Outros Elencos'],
 ['meu-time-duas-formacoes-v177.html','Escalação'],
 ['meu-time-testes-v219.html','Laboratório']
];
for(const [href,name] of items){
 assert(homepage.includes("createLink('"+href+"','"+name+"'"),
  'Atalho de entrada não existe: '+name);
 assert(read('web/index.html').includes('class="topbar"'));
 if(href!=='#catalogo')assert(fs.existsSync(path.join(root,'web',href)),name+' não tem destino');
}
assert(homepage.includes('scout-v189-extra'), 'Ferramentas antigas continuam disponíveis');
assert(homepage.includes('scout-v326-managers-entry'));
assert(homepage.includes("const skip=new Set(['#catalogo','outros-elencos-v227.html'"),
 'Não duplicar ações essenciais em atalhos antigos');
assert(positional.includes("el('section','ct326-focus')"));
assert(positional.includes("el('details','ct326-deep-dive')"));
assert(positional.includes("deep.open=advancedOpen"));
assert(positional.includes('details.append(hero,deep)'));
assert(positional.includes('node.classList.toggle(\'ct326-expanded\',advancedOpen)'));
assert(positional.includes("ppReady?'Proposta para avaliar':'Dados insuficientes para recomendar'"));
assert(positional.includes("outcome.plan.status==='hipotese'"));
// V335: a aprovação depende do vetor de PP efetivamente exibido na ficha.
assert(positional.includes("const verified=decision?.approved===true"),
 'Só usar decisão contextual V327 para a aprovação exibida');
assert(!positional.includes("const verified=Boolean(saved?.revision?.approved"),
 'A revisão anterior isolada não comprova aprovação do treino atual');
assert(positional.includes('familiaridade da posição pendente'));
assert(positional.includes('não equipado automaticamente'));
assert(positional.includes("const alternative=el('button','ct326-secondary-action'"));
assert(positional.includes("const comparison=el('details','ct311-compare')")&&
 positional.includes("guide.compare(decision||modes.find"),
 'V327 deve manter comparação MAT-SA na área técnica e mostrar as cinco táticas no resumo');
assert(positional.includes('save.disabled=false'));
assert(positional.includes('selectedEntry(scenario)') && positional.includes('profiles.save(storage(),profileContext'),
 'Não remover revisões e botão de salvar da interface anterior');
for(const fragment of ['.ct326-metrics','.ct326-primary-action','.ct326-deep-dive',
 '.ct311-positional:not(.ct326-expanded)>.ct311-actions']){
 assert(css.includes(fragment), 'Layout de ficha incompleto '+fragment);
}
assert(homeCss.includes('.scout-v189-quick .scout-v189-tile'));
assert(sw.includes('-v326-premium-first-view'),'Atualização PWA deve invalidar cache');
assert(stamp.includes("'craque-design-v230.css'")&&stamp.includes("'craque-positional-v311.css'"),
 'Android/Windows devem receber os mesmos componentes');
for(const filename of ['scripts/qa-position-v311.py','scripts/qa-formation-v314.py',
 'scripts/qa-manager-history-v325.py']){
 assert(read(filename).includes('.ct326-deep-dive > summary'),filename+' exige acesso ao detalhamento');
}
const model=require('../web/craque-positional-v311.js');
const sample=model.fromPersonal(cards[0]);assert.equal(sample.collection,'minhas-246');
assert.equal(JSON.stringify(cards),original,'As 246 cartas não podem ser modificadas');
console.log('V326 PASS: início com quatro escolhas, ficha em foco segura, alternativa recuperável e paridade das 246 cartas.');
