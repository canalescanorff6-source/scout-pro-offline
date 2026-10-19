'use strict';
/* V233 — auditoria da interpretação por 246 cartas × 5 táticas:
 * sem mudança de treino, PP ou dados locais.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const T=require('../web/scout-multitactic-engine-v220.js');
const E=require('../web/craque-role-intelligence-v233.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const review=JSON.parse(read('web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json')).cards;
const snapshot=JSON.stringify(cards);
const modes=['posse','normal','rapido','fora','longo'];
assert.equal(cards.length,246);
assert.equal(review.length,246);
assert.deepEqual(Object.keys(E.MODES),modes);
assert.deepEqual(Object.keys(E.ROLES).sort(),['ALA','CA','GO','LD','LE','MAT','MLG','SA','VOL','ZG'].sort());
assert.equal(E.CATEGORY.length,10);
assert.match(E.CATEGORY[7].stats,/Consciência de goleiro/);
assert.match(E.CATEGORY[8].stats,/alcance/);
assert.match(E.CATEGORY[9].stats,/reflexos/);
const roles=new Set(),changed=new Set(),identity=new Set(),variants=new Set();
let inspected=0,proposals=0,missing=0,documented=0,blockedUnverified=0;
const counted={posse:0,normal:0,rapido:0,fora:0,longo:0};
for(const c of cards){
 const cap=c.numero,card={...c,capture:cap,edition:c.versao,shown_position:c.posicao,
  attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,
  boost1:c.impeto_fixo,recommended_levels:c.niveis,pp_estimated:c.pp_estimado};
 const match=review.find(x=>x.numero===cap);
 assert(match,'V213 has 246');
 assert.equal(match.card_id,c.id,'Audit matches exact Card ID');
 const freeze=JSON.stringify(card),fingerprint=cap+':'+c.id;
 assert(!identity.has(fingerprint));identity.add(fingerprint);
 const r=T.roleOf(card);assert(r,'Known role '+cap);roles.add(r);
 for(const mode of modes){
  const analysis=E.interpret(card,mode,{});
  assert(analysis,'One interpretation for every exact card '+fingerprint+' '+mode);
  assert.equal(analysis.capture,cap);
  assert.equal(analysis.id,c.id);
  assert.equal(analysis.budget,c.pp);
  assert.equal(analysis.position,E.ROLES[r].name);
  assert.equal(analysis.tactic,mode);
  assert.equal(analysis.role,r);
  assert(analysis.priorities.length>=3);
  assert(analysis.priorities.every(p=>p.weight>=0 && p.index>=0 && p.index<10));
  assert(analysis.evidence.includes('Edição: '+c.versao));
  assert.match(analysis.warning,/NÃO comprova/);
  assert.equal(analysis.knownBase.length,0,'Do not invent base stats');
  assert(['parcial_com_atributos_base','documental','pendente'].includes(analysis.uncertainty));
  if(r==='GO')assert(analysis.priorities.every(p=>p.index>=7&&p.index<=9));
  else assert(analysis.priorities.every(p=>p.index<=6));
  const result=E.compare(card,mode,{});
  const validSource=E.levelDocumented(card);
  assert.equal(analysis.levelDocumented,validSource);
  if(validSource)documented++;
  else{
   blockedUnverified++;
   assert.equal(result.proposal,null,
    'Sem nível e origem PP por edição, V233 não pode gerar hipótese para '+fingerprint+' em '+mode);
   assert.equal(analysis.uncertainty,'pendente');
  }
  assert(result&&result.analysis?.capture===cap);
  if(!analysis.confirmed||!validSource){
   missing++;
   assert.equal(result.proposal,null,'Sem nível/PP e build conferidos não há redistribuição');
  }
  if(result.proposal){
   const p=result.proposal;
   proposals++;counted[mode]++;
   assert.equal(p.source,'hipotese_v233');
   assert(T.valid(p.levels));
   assert.equal(T.total(p.levels),c.pp,'Exact PP '+fingerprint+' '+mode);
   assert.notDeepEqual(p.levels,c.niveis,'A proposed comparison must differ');
   const allowed=r==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
   const locked=r==='GO'?[0,1,2,3,4,5,6]:[7,8,9];
   assert(locked.every(i=>p.levels[i]===c.niveis[i]),'Respect locked training groups');
   assert(p.changes.every(v=>v.delta!==0));
   assert(p.changes.every(v=>E.CATEGORY.find(x=>x.name===v.name)));
   assert.equal(p.spent,c.pp);
   changed.add(fingerprint);
   variants.add(fingerprint+':'+mode+':'+p.levels.join(','));
  }
  inspected++;
 }
 assert.equal(JSON.stringify(card),freeze,'Engine must not mutate card '+fingerprint);
}
assert.equal(inspected,1230);
assert.equal(identity.size,246);
assert.equal(JSON.stringify(cards),snapshot);
assert(roles.size>=8,'Different job families actually covered');
assert.equal(documented,85*5,'85 cartas com níveis documentados x cinco táticas');
assert.equal(blockedUnverified,161*5,'161 cartas sem nível/PP documental bloqueadas nas cinco táticas');
// Das 85 edições com nível documentado, apenas 1 tem simultaneamente
// distribuição válida do acervo. As outras 84 não podem originar propostas.
assert(proposals<=5,'Só a edição com nível E build documental completos pode propor até 5 táticas');
assert(changed.size<=1,'Nenhuma outra carta sem base plenamente documentada recebe revisão');
const official=cards.find(x=>x.numero===40);
const yorke={...official,capture:40,edition:official.versao,shown_position:official.posicao,recommended_levels:official.niveis};
assert(E.compare(yorke,'posse').analysis,'Yorke receives a reasoned review without overwriting his approved training');
const goalkeeper=cards.find(c=>T.roleOf(c)==='GO');
assert(goalkeeper,'At least one original goalkeeper');
const baseGK={...goalkeeper,capture:goalkeeper.numero,edition:goalkeeper.versao,
 shown_position:goalkeeper.posicao,native_skills:goalkeeper.habilidades_nativas,recommended_levels:goalkeeper.niveis};
const under=E.interpret(baseGK,'posse',{stats:{"Reflexos do GO":{base:82,boost:12,mgr:5}}});
assert.equal(under.knownBase.length,goalkeeper.base_stats_known===true?1:0,'Only confirmed card sources can expose raw base stats');
if(goalkeeper.base_stats_known===true){
 assert.equal(under.knownBase[0].base,82);
 assert(!JSON.stringify(under.knownBase).includes('99'),'Never calculate bogus boosted final attributes');
}
const forbidden={...yorke,pp:9999};
assert.equal(E.compare(forbidden,'posse').proposal,null,'Do not produce build under incompatible PP');
const missingEdition={...yorke,edition:'',versao:''};
assert.equal(E.compare(missingEdition,'posse').proposal,null);
const unknown={capture:999,id:'x',edition:'unconfirmed',posicao:'X',pp:50,niveis:Array(10).fill(0)};
assert.equal(E.interpret(unknown,'posse'),null,'Unmapped role is never guessed as CA');
const signalCard={...yorke,shown_position:'ZG',posicao:'ZG',attack_style:'',defence_style:'Defensor criativo',
 native_skills:'Interception; Blocker',boost1:'Physicality +3'};
const bareCard={...signalCard,attack_style:'',estilo_ataque:'',defence_style:'',estilo_defesa:'',native_skills:'',habilidades_nativas:'',boost1:'',impeto_fixo:''};
const a=E.interpret(signalCard,'posse'),b=E.interpret(bareCard,'posse');
assert(a.weights[6]>b.weights[6]);
assert(a.weights[1]>b.weights[1]);
assert(a.signals.some(s=>s.includes('Defensor criativo')));
assert(a.signals.some(s=>s.includes('Recurso defensivo nativo')));
assert(!b.signals.some(s=>s.includes('Defensor criativo')));
assert.notDeepEqual(a.weights,b.weights,'Exact skills/style must individualize position weighting');
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs'),visual=read('web/craque-role-panel-v233.css');
const panel=read('web/craque-role-panel-v233.js'),main=read('web/scout-card-unified-v220.js');
for(const file of ['craque-role-intelligence-v233.js','craque-role-panel-v233.css','craque-role-panel-v233.js']){
 assert(bridge.includes(file),'Shared Android + Windows loader: '+file);
 assert(sw.includes("'./"+file+"'"),'Offline cache: '+file);
 assert(stamp.includes("'"+file+"'"),'Parity fingerprint: '+file);
}
assert(bridge.indexOf('intelligent233.onload=loadCardUI')>-1,'V233 engine loads before V220 UI');
assert(main.includes('CRAQUE_INTERPRETATION_V233?.interpret'),'V220 principal shows role intelligence');
assert(panel.includes("scoutpro:tactic-selected-v220"),'Changing tactical style updates report');
assert(panel.includes("anchor.insertAdjacentElement('afterend',panel)"),'Panel AFTER training, not above first viewport');
assert(panel.includes("doc.createElement('details')")===false || panel.includes("make('details'"),'Native accessible disclosure');
assert(!/localStorage|indexedDB|\.setItem\(|localSet\(/.test(panel),'Interpretation UI remains read-only');
assert(!/localStorage|indexedDB|\.setItem\(|localSet\(/.test(read('web/craque-role-intelligence-v233.js')),'Heuristic may not save data');
assert(visual.includes('#ct-v233-interpret-panel')&&visual.includes('@media(max-width:520px)'));
console.log('V233/V256 PASS: '+inspected+' interpretações; '+blockedUnverified+' redistribuições sem nível bloqueadas; '+proposals+' hipóteses documentais; '+roles.size+
 ' role families; all source PP/builds/skills/boosters intact.');
