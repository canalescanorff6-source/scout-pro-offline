'use strict';
// V374: a comparison score must never become secondary-position proof.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const pristine=JSON.stringify(cards),entries=new Map();
const store={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,String(v)),removeItem:k=>entries.delete(k)};
global.window={localStorage:store};
const positions=require('../web/scout-position-training-v246.js');
const tactics=require('../web/craque-tactics-v230.js');
const rotation=require('../web/scout-rotation-engine-v219.js');
const fullback=cards.find(c=>c.numero===10),neymar=cards.find(c=>c.numero===90);
assert.equal(fullback.posicao,'DD');assert.equal(neymar.posicao,'MLE');
assert.equal(tactics.fit(fullback,'zge').match,false);
assert.equal(tactics.rank([fullback],'zge','posse').length,0,
 'Unproven LD→ZG may be previewed but must not be an automatic recommendation');
positions.confirm(fullback,'ZG',true,store,'familiar');
assert.equal(tactics.rank([fullback],'zge','posse').length,1);
assert.equal(tactics.rank([{...fullback,id:'999991'}],'zge','posse').length,0,
 'Another edition cannot inherit confirmed familiarity');
positions.confirm(fullback,'ZG',false,store,'familiar');
const formations=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
let audited=0,shortages=0;
for(const formation of formations)for(const tactic of ['posse','normal','rapido','fora','longo']){
 const sheet=rotation.build(cards,formation,[],1,tactic);
 for(const team of sheet.teams){
  for(const starter of team.starters){
   const card=cards.find(c=>c.numero===starter.cap);
   assert.equal(positions.status(card,starter.role,store).eligible,true,
    'Auto-selected secondary role needs edition-specific evidence');
  }
  if(!team.ready){shortages++;assert(team.warnings.some(x=>/Sem jogador|incompleta/.test(x)));}
  audited++;
 }
}
assert.equal(audited,100);
assert(shortages>0,'Six SA cannot fill ten independent squads without proof or repetition');
// Execute the actual HTML renderer with a real incomplete generated roster.
const vm=require('node:vm'),ui=read('web/scout-rotation-lab-v219.js');
const incomplete=rotation.build(cards,formations.find(f=>f.id==='4213'),[],1,'posse').teams.find(x=>!x.ready);
const byCap=new Map(cards.map(c=>[c.numero,c]));
const sandbox={esc:v=>String(v??''),opened:null,metrics:()=>'',images:new Map(),
 formats:formations,active:'4213',TACTICS:{posse:'Posse de Bola'},tactic:'posse',
 getCard:n=>byCap.get(Number(n)),byCap,rosterLogs:()=>[],engine:rotation,
 benchAdvisor:require('../web/craque-bench-advisor-v247.js'),
 window:{SCOUT_POSITION_TRAINING_V246:positions,CRAQUE_TACTICS_V230:tactics}};
vm.runInNewContext(ui.slice(ui.indexOf('function cardRow('),ui.indexOf('function metrics('))+
 ui.slice(ui.indexOf('function teamHTML('),ui.indexOf('function render(){'))+';this.renderTeam=teamHTML;',sandbox);
const html=sandbox.renderTeam(incomplete);
assert(html.includes('<h3>10/11 titulares</h3>'),'The player list must not claim a complete XI');
assert(html.includes('data-vacant-slot="sa"'),'The missing SA must remain a visible pitch vacancy');
assert(!html.includes('Lista completa'),'Incomplete roster must not be labelled complete');
assert.equal(JSON.stringify(cards),pristine,'Original data and training must remain unchanged');
console.log('V374 PASS: unproven roles remain previews; automatic ranking/rotation require exact-edition position evidence.');
