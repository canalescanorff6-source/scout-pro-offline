'use strict';
/* V191 — testa carregamentos físicos reais em isolamento, inclusive falhas parciais. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'web/scout-ui-v189.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web/scout-polish-v190.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'web/sw.js'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/release.yml'),'utf8');
const DATA={
 'SCOUT_V101_MODELO_CORPORAL.json':{cartas:[{numero:1,card_id:'88040387251729',altura_cm:179,peso_kg:74,pe_dominante:'Direito',modelo_corporal:{}}]},
 'SCOUT_V184_EFHUB_241_COMPLETE.json':{visual_observations:[{candidate_cap:1,filename:'Daniele_Massaro_efhub.jpg',height_cm:179,weight_kg:74,model_measures:{jump_height:265.4}}]},
 'SCOUT_V189_CORPO_EXTRAS.json':{entries:[{cap:1,player:'Daniele Massaro',screenshot:'Daniele_Massaro_efhub.jpg',dimensions:{neck_length:7,shoulder_width:8},derived_measurements:{}}]}
};
function mockElement(tag,text=''){
 return {tag,children:[],id:'',className:'',style:{},textContent:text,
   appendChild(node){this.children.push(node);return node},
   append(...nodes){this.children.push(...nodes)},
   replaceChildren(...nodes){this.children=[...nodes];this.textContent=''},
   setAttribute(){},querySelector(){return null}};
}
function flatten(node){return [node.textContent,...(node.children||[]).map(flatten)].join(' ')}
async function simulate(failing=[],player='Daniele Massaro'){
 const events={},before=mockElement('div'),section=mockElement('section');
 section.querySelector=q=>q==='.scout-v188-body'?before:null;
 const card={capture:1,id:'88040387251729',name:player};
 const doc={
  body:{dataset:{page:'detail'}},
  readyState:'complete',
  createElement:(tag)=>mockElement(tag),
  addEventListener:(type,fn)=>{events[type]=fn},
  getElementById:id=>{
   if(id==='scout-v68-data')return {textContent:JSON.stringify(card)};
   if(id==='scout-v188-principal')return section;
   if(id==='scout-v189-biotype')return before.children.find(x=>x.id===id)||null;
   return null;
  },
  querySelector:()=>null
 };
 const fetch=path=>{
  const filename=path.split('/').pop();
  if(failing.includes(filename))return Promise.reject(new Error('offline: '+filename));
  if(!(filename in DATA))throw new Error('Fonte inesperada '+filename);
  return Promise.resolve({ok:true,json:()=>Promise.resolve(DATA[filename])});
 };
 vm.runInNewContext(ui,{window:{document:doc},fetch},{timeout:2000});
 await new Promise(resolve=>setImmediate(resolve));
 const count=()=>before.children.filter(x=>x.id==='scout-v189-biotype').length;
 assert.equal(count(),1,'Biotipo precisa aparecer uma única vez');
 assert(events['scoutpro:profile-ready'],'Evento idempotente ausente');
 events['scoutpro:profile-ready']();
 assert.equal(count(),1,'Evento repetido duplicou o painel');
 return flatten(before);
}
(async()=>{
 const full=await simulate();
 assert(full.includes('Medidas associadas ao Card ID'),'Fonte verificada deve carregar');
 assert(full.includes('Dados observados no print eFHUB'),'Fonte do print deve carregar');
 assert(full.includes('Anatomia detalhada observada no eFHUB'),'Fonte anatômica deve carregar');
 assert(!full.includes('undefined cm'),'Medida ausente não pode virar string');
 const partial=await simulate(['SCOUT_V101_MODELO_CORPORAL.json']);
 assert(partial.includes('fontes físicas estão indisponíveis'),'Falha parcial deve ser sinalizada');
 assert(partial.includes('Dados observados no print eFHUB'),'Falha externa não pode ocultar print');
 assert(partial.includes('Anatomia detalhada observada no eFHUB'),'Falha externa não pode ocultar anatomia');
 const verified=await simulate(['SCOUT_V184_EFHUB_241_COMPLETE.json','SCOUT_V189_CORPO_EXTRAS.json']);
 assert(verified.includes('Medidas associadas ao Card ID'),'Fonte V101 precisa sobreviver às demais falhas');
 const none=await simulate(Object.keys(DATA));
 assert(none.includes('As três fontes físicas estão indisponíveis'),'Falha total precisa mostrar diagnóstico claro');
 const wrongPlayer=await simulate(['SCOUT_V101_MODELO_CORPORAL.json','SCOUT_V184_EFHUB_241_COMPLETE.json'],'Jogador de outra edição');
 assert(!wrongPlayer.includes('Anatomia detalhada observada no eFHUB'),'Não atribuir anatomia de outro jogador pelo número da captura');
 assert(ui.includes('Promise.allSettled(['),'Carregamento independente obrigatório');
 assert(css.includes('min-height:48px'),'Busca Android com alvo confortável');
 assert(sw.includes('v191-biotype'),'Nova revisão de cache offline obrigatória');
 assert(workflow.includes('pull_request:'),'PR precisa rodar verificação antes de integrar');
 console.log('V191 OK: 3 fontes/3 falhas, procedência da anatomia, nenhuma medida inventada, UI+cache e CI de PR.');
})().catch(err=>{console.error(err);process.exitCode=1});
