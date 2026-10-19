'use strict';
/* V247: revisão de PP, edição exata, reservas e rodízio, sem criar níveis. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.resolve(root,p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const martinelli=cards.find(x=>x.numero===191);
const original=JSON.stringify(cards);
const points=levels=>levels.reduce((sum,n)=>{
 let total=0;for(let i=0;i<n;i++)total+=1+Math.floor(i/4);
 return sum+total;
},0);
const embed=(html,id)=>{
 const hit=html.match(new RegExp('<script\\s+id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'));
 return hit?JSON.parse(hit[1]):null;
};
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(x=>x.numero)).size,246);
// 22 Card IDs ainda estão pendentes e alguns aparecem compartilhados; nunca inventá-los.
assert(cards.every(c=>typeof String(c.id)==='string'&&String(c.id).length>0));
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
assert.equal(martinelli.id,'105850811319718');
assert.equal(martinelli.posicao,'PTE');
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
assert.equal(martinelli.pp_origem,'informado_pelo_usuario_2026-10-18');
assert.equal(martinelli.treino_proposto_nao_validado,true);
assert.equal(points(martinelli.niveis),50);
const verified=[],pending=[],mismatch=[],warnings=[];
for(const c of cards){
 const p='web/'+c.arquivo;
 if(!fs.existsSync(path.resolve(root,p))){mismatch.push('#'+c.numero+' HTML ausente');continue}
 const html=read(p),raw=embed(html,'scout-v68-data'),lab=embed(html,'lab-data');
 const hasProof=Number.isInteger(c.max_level)&&Boolean(c.pp_origem);
 if(hasProof){
  verified.push(c.numero);
  if(c.pp!==2*(c.max_level-1))mismatch.push('#'+c.numero+' nível '+c.max_level+' PP '+c.pp);
  if(raw?.pp!==c.pp)mismatch.push('#'+c.numero+' ficha PP '+raw?.pp+' catálogo '+c.pp);
  if(lab?.pp!==c.pp)mismatch.push('#'+c.numero+' laboratório PP '+lab?.pp+' catálogo '+c.pp);
  if(!/^PENDENTE\b/i.test(String(c.id))&&
    (String(raw?.id)!==String(c.id)||String(lab?.id)!==String(c.id)))
   mismatch.push('#'+c.numero+' Card ID confirmado divergente');
  // Nível/PP confirmado não comprova que o TREINO esteja distribuído.
  // Cartas sem build não são erro; nunca preenchê-las ficticiamente.
  if(Array.isArray(c.niveis)&&points(c.niveis)!==c.pp)
   mismatch.push('#'+c.numero+' build registrada excede ou não alcança PP');
 }else{
  pending.push(c.numero);
  if(raw?.pp!==undefined&&raw.pp!==c.pp)warnings.push('#'+c.numero+' ficha '+raw.pp+' vs catálogo '+c.pp);
  if(lab?.pp!==undefined&&lab.pp!==c.pp)warnings.push('#'+c.numero+' lab '+lab.pp+' vs catálogo '+c.pp);
 }
}
assert.equal(verified.length,85);
assert.equal(pending.length,161);
if(mismatch.length)assert.fail('Fontes de PP confirmadas incoerentes:\n'+mismatch.join('\n'));
const html191=read('web/fichas/191_Gabriel_Martinelli.html');
const raw=embed(html191,'scout-v68-data'),lab=embed(html191,'lab-data');
assert.equal(raw.max_level,26);
assert.equal(raw.training_provisional,true);
assert.equal(lab.trainingProvisional,true);
assert.equal(lab.role,'PTE');
assert.equal(raw.pp,50);
assert.equal(lab.pp,50);
for(const vec of [raw.recommended_levels,raw.alternate_scenarios.A,raw.alternate_scenarios.B,lab.A,lab.B])
 assert.equal(points(vec),50,'Treino tem que gastar 50 PP, sem exceder');
assert(!/\b66\s*(?:\/\s*66\s*)?PP\b/.test(html191));
const memory=new Map();
const store={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
global.window={localStorage:store};
const P=require('../web/scout-position-training-v246.js');
const T=require('../web/craque-tactics-v230.js');
const R=require('../web/scout-rotation-engine-v219.js');
const A=require('../web/craque-bench-advisor-v247.js');
const byCap=new Map(cards.map(c=>[c.numero,c]));
const v177=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const v176=JSON.parse(read('web/SCOUT_V176_POSSE_4312.json'));
const formations=[...v177,{id:'v176',starters:v176.starter_slots.map(s=>({slot:s.slot,cap:s.cap,role:T.slotRole(s.slot)})),bench:v176.bench}];
const modes=['posse','normal','rapido','fora','longo'];
for(const [file,app] of [
 ['web/meu-time-posse-4312.html','meu-time-posse-4312.js'],
 ['web/meu-time-duas-formacoes-v177.html','meu-time-duas-formacoes-v177.js'],
 ['web/meu-time-testes-v219.html','scout-rotation-lab-v219.js']
]){
 const page=read(file),i=page.indexOf('craque-bench-advisor-v247.js');
 assert(i>page.indexOf('scout-position-training-v246.js')&&i<page.indexOf(app),
  'Motor V247 deve carregar antes do editor: '+file);
}
for(const file of ['web/sw.js','scripts/stamp-bundle-v189.cjs'])
 assert(read(file).includes('craque-bench-advisor-v247.js'));
for(const file of ['web/meu-time-posse-4312.js','web/meu-time-duas-formacoes-v177.js','web/scout-rotation-lab-v219.js'])
 assert(read(file).includes('benchAdvisor.recommend('));
let checks=0;
for(const f of formations){
 const selected=Object.fromEntries(f.starters.map(x=>[x.slot,x.cap]));
 for(const mode of modes){
  const opts={starters:f.starters,selections:selected,byCap,mode};
  const denied=A.recommend({...opts,card:martinelli});
  assert.equal(denied.eligible,false,'Martinelli PTE não é CA antes de confirmar treinamento');
  assert.equal(denied.incumbent,null);
  const keeper=A.recommend({...opts,card:byCap.get(169)});
  assert.equal(keeper.position,'GO');
  assert.equal(keeper.incumbent.numero,11);
  for(const reserve of f.bench){
   const c=byCap.get(reserve.cap);
   const advice=A.recommend({...opts,card:c});
   if(advice.eligible){
    assert(P.status(c,advice.position).eligible,'Não usar posição não confirmada');
    assert(Object.values(selected).includes(advice.incumbent.numero));
    assert(advice.text.includes('Substituir #'));
    if(advice.position==='GO')assert(['GO','GR'].includes(c.posicao));
    else assert(!['GO','GR'].includes(c.posicao));
   }else{assert.equal(advice.incumbent,null);assert(!advice.text)}
   checks++;
  }
  P.confirm(martinelli,'CA',true,store);
  const approved=A.recommend({...opts,card:martinelli});
  assert.equal(approved.eligible,true);
  assert.equal(approved.position,'CA');
  assert([39,25].includes(approved.incumbent.numero));
  P.confirm(martinelli,'CA',false,store);
 }
}
for(const f of v177)for(const mode of modes){
 const groups=R.build(cards,f,[],1,mode);
 for(const team of groups.teams){
  const selected=Object.fromEntries(team.starters.map(s=>[s.slot,s.cap]));
  for(const reserve of team.bench){
   const c=byCap.get(reserve.cap);
   const advice=A.recommend({card:c,starters:team.starters,selections:selected,byCap,mode});
   if(advice.eligible)assert(P.status(c,advice.position).eligible);
   checks++;
  }
 }
}
assert.equal(JSON.stringify(cards),original);
console.log('V247 OK: 85 níveis confirmados, Martinelli 26/50 PP e 2 builds matematicamente válidas.');
console.log('V247 RESERVAS OK: '+checks+' análises V176/V177/rodízio/5 táticas sem indicar posição não confirmada.');
console.log('V247 PP PENDENTES: '+pending.length+' níveis não documentados; diferenças sem prova: '+warnings.length);
if(warnings.length)console.log('Exemplos de pendências: '+warnings.slice(0,20).join('; '));
