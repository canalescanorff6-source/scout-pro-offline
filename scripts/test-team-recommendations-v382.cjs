'use strict';
const a=require('node:assert/strict'),C=require('../web/craque-team-context-v382.js'),A=require('../web/craque-accounts-v382.js');
const T=require('../web/scout-multitactic-engine-v220.js'),F=require('../web/craque-friends-training-v228.js');
const deps={tactical:T,training:F,individual:require('../web/craque-ficha-individual-v251.js'),interpretation:require('../web/craque-role-intelligence-v233.js'),skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js'),rating:require('../web/craque-rating-v376.js'),ratingModel:require('../web/ct376-rating-model.json')};
const form=require('../web/ct382-formations.json').formations[0],map=new Map([['scoutpro:private','keep']]);
const store={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
const raw=form.slots.map((s,i)=>({id:'p'+i,name:'Player '+i,position:s.position,maxLevel:31,pp:60,nativeSkills:['Passe de primeira'],nativeVerified:true,skills:[],skillsVerified:true,skillCapacity:5}));
A.importDraft(store,{schema:A.DRAFT,cards:raw,managers:[{id:'m',name:'Técnico',proficiency:{posse:90,rapido:88,normal:88,fora:90,longo:87,overload:80}}]});
const cards=A.roster('secondary',{},store),manager=A.read(store).secondary.managers[0];
const lineup=C.suggestLineup(form,cards);a.equal(Object.keys(lineup.lineup).length,11);a.equal(new Set(Object.values(lineup.lineup)).size,11);
const opts={accountId:'secondary',style:'posse',manager,formation:form,lineup:lineup.lineup,instructions:[]},ctx=C.compile(opts,cards),before=JSON.stringify(cards);
const plan=C.recommend(ctx,deps);a.equal(plan.cards.length,11);a.equal(plan.accountId,'secondary');a.equal(plan.appliedInGame,false);a.equal(plan.gameplayValidated,false);
for(const row of plan.cards){a.equal(T.total(row.review.proposed),row.review.pp);a(row.review.skills.every(s=>s.name!=='Passe de primeira'));a(row.review.skills.length<=5);}
a.equal(JSON.stringify(cards),before);a(C.exportText(plan).includes('Secundária'));a(C.exportText(plan).includes('Instruções'));
const exported=JSON.parse(C.exportJSON(plan));a.equal(exported.contextSignature,plan.contextSignature);a.equal(exported.cards.length,11);
const first=C.adopt(store,plan,ctx.signature);a.equal(first.accountId,'secondary');a.equal(Object.keys(A.read(store).plans.secondary).length,1);a.equal(store.getItem('scoutpro:private'),'keep');
a.throws(()=>C.adopt(store,plan,'stale'),/recalcul|mud|contexto/i);
let doc=A.read(store);doc.secondary.cards[0].offenseStyle='outra leitura';A.save(store,doc);
a.throws(()=>C.adopt(store,plan,ctx.signature),/recalcul|mud|contexto/i);
for(const style of Object.keys(C.MODES)){const current=C.compile({...opts,style},cards),p=C.recommend(current,deps);a.equal(p.style,style);a.equal(p.cards.length,11);}
const duplicate=[...cards,{...cards[0],id:'other-edition',instanceId:'other-edition'}];
const auto=C.suggestLineup(form,duplicate);a.equal(new Set(Object.values(auto.lineup).map(id=>duplicate.find(c=>c.id===id).name)).size,11);
const locked=C.suggestLineup(form,cards,{locks:{[form.slots[0].id]:cards[0].id}});a.equal(locked.lineup[form.slots[0].id],cards[0].id);
console.log('V382 TEAM PLAN PASS: onze funções, seis estilos, PP/skills/exportação coerentes, isolamento e revisão obsoleta bloqueada.');
