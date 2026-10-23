'use strict';
/* V328: UX do técnico preserva dados/IDs, exportação e seis proficiências. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const A=require('../web/craque-managers-v302.js'),hub=require('../web/craque-manager-hub-v307.js');
const source=JSON.parse(zlib.gunzipSync(Buffer.from(read('web/craque-manager-catalog-v302.gz.b64').trim(),'base64')).toString('utf8'));
const original=JSON.stringify(source);
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards,cardBytes=JSON.stringify(cards);
assert.equal(cards.length,246);
const items=A.withKovacEdition(source).tecnicos;
assert.equal(items.length,71);
assert.equal(hub.pick(items,{scope:'featured'}).length,23);
assert.equal(hub.pick(items,{scope:'all'}).length,71);
const groups=hub.managerGroups(items);
const klopps=hub.pick(items,{scope:'all',query:'klopp'});
const key=klopps[0].nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
assert.equal(groups.get(key),2,'Duas versões reais do mesmo nome de Klopp não devem colapsar');
assert.equal(hub.managerGroups([{nome:'Niko Kovač'},{nome:'Niko Kovac'}]).get('niko kovac'),2,
 'Busca e agrupamento devem ignorar acentos reais');
const kovac=items.find(c=>c.catalog_id==='CT-MGR-071');
const kovacName=kovac.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
assert.equal(groups.get(kovacName),1,'Edição principal Kovač não pode duplicar');
assert.equal(klopps.length,2);
assert.notEqual(klopps[0].catalog_id,klopps[1].catalog_id);
assert.equal(A.STYLES.length,6);
assert.equal(A.proficiency(items.find(c=>c.catalog_id==='CT-MGR-071'),'posse'),90);
const fake={map:new Map(),getItem(k){return this.map.get(k)||null},setItem(k,v){this.map.set(k,String(v))},removeItem(k){this.map.delete(k)}};
hub.toggleStored(hub.FAVORITES,'CT-MGR-071',fake);
let fav=hub.fromStore(hub.FAVORITES,fake);
assert.equal(hub.pick(items,{scope:'favorites',favorites:fav}).length,1);
hub.toggleStored(hub.FAVORITES,'CT-MGR-071',fake);
assert.equal(hub.fromStore(hub.FAVORITES,fake).size,0);
assert.equal(JSON.stringify(source),original);
const hubJs=read('web/craque-manager-hub-v307.js'),
main=read('web/craque-managers-v302.js'),
external=read('web/craque-friends-training-ui-v228.js'),
html=read('web/tecnicos-v307.html'),
styles=read('web/craque-managers-v307.css'),
styleMain=read('web/craque-design-v230.css'),
styleFriends=read('web/craque-managers-v306.css'),
sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const value of ['Destaques','Meus técnicos','Favoritos','Todas as versões']){
 assert(html.includes('>'+value+'</button>'),'Atalho do catálogo indisponível: '+value);
}
assert(html.includes('hub-v328-presets'));
assert(hubJs.includes("const focusStyle=A.STYLES.find"),'Uma proficiência principal por estilo');
assert(hubJs.includes("const scoreDetails=el('details','hub-v328-scores')"),
 'Seis proficiências não devem preencher a primeira visão');
assert(hubJs.includes("scoreDetails.append(el('summary','','Ver as 6 proficiências'),scores)"));
assert(hubJs.includes("versionsByName.get(normalized(c.nome))"));
assert(hubJs.includes("scope.value='all'"));
assert(hubJs.includes("actions.append(own,fav,compare,button('Usar como padrão'"),
 'Botões existentes de posse, favorito, comparação e padrão devem permanecer');
assert(hubJs.includes('hub-v328-portrait-tools'),'Fotos locais devem continuar acessíveis');
assert(main.includes('ct-v328-manager-search')&&main.includes('search.addEventListener(\'input\',populate)'));
assert(main.includes("const active=selected?.catalog_id||select.value||''"),
 'Pesquisa não pode substituir escolha de técnico');
assert(main.includes('EDIÇÃO ATUAL · PRESERVADA'));
assert(main.includes("const scoreSummary=make(doc,'details',undefined,'ct-v328-manager-scores')"));
assert(main.includes('ct-v328-manager-primary'));
assert(external.includes('friend-v328-manager-search'));
assert(external.includes("managerSearch.addEventListener('input',renderManager)"));
assert(external.includes('matches(c)||c.catalog_id===managerSelectedId'),
 'Pesquisa externa deve preservar a edição já selecionada');
assert(external.includes("const scoreDetails=mk('details','friend-v328-manager-scores')"));
assert(external.includes('friend-v328-manager-primary'));
assert(external.includes('friend-v328-manager-more'));
assert(styles.includes('.hub-v328-scores')&&styles.includes('.hub-v328-presets'));
assert(styleMain.includes('#ct-v328-manager-search'));
assert(styleFriends.includes('#friend-v328-manager-search'));
assert(sw.includes('v328-premium-manager-selection'),'Cache offline precisa invalidar HTML/CSS/JS');
for(const file of ['tecnicos-v307.html','craque-manager-hub-v307.js',
 'craque-managers-v307.css','craque-managers-v302.js','craque-managers-v306.css',
 'craque-friends-training-ui-v228.js','craque-design-v230.css']){
 assert(stamp.includes("'"+file+"'"),'Fingerprint Android/Windows incompleto: '+file);
}
assert.equal(JSON.stringify(cards),cardBytes,'Todas as 246 cartas devem permanecer intactas');
console.log('V328 PASS: 71 edições intactas, Kovač 90 Posse, 2 Klopp, filtros/favoritos, ambos acervos, CSS/cache/paridade e 246 cartas.');
