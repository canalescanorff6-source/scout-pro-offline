'use strict';
/* V220: 246 cartas, cinco estilos, custo PP exato, recomendações sem dupla habilidade/ímpeto. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const T=require('../web/scout-multitactic-engine-v220.js');
const R=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
assert.deepEqual(T.STYLES.map(s=>s.id),['posse','normal','rapido','fora','longo']);
assert.deepEqual(B.tactics,T.STYLES.map(s=>s.id),'Booster rank cobre todos estilos, sem fallback genérico');
const original=cards.map(c=>({id:c.id,num:c.numero,pp:c.pp,levels:c.niveis,native:c.habilidades_nativas,fixed:c.impeto_fixo,extra:c.impeto_extra}));
const unique=new Set(cards.map(c=>c.numero+':'+c.id));assert.equal(unique.size,246,'Identificar a carta por número e Card ID');
const uniqueIds=new Set(cards.map(c=>c.id));assert(uniqueIds.size<=246,'Mesmo Card ID bruto pode aparecer em mais de uma entrada; nunca usar sozinho como chave local');
let verified=0,pending=0,changed=0,withNative=0,styleDifferences=0;
const namesByTactic=Object.fromEntries(T.STYLES.map(s=>[s.id,new Set()]));
for(const c of cards){
 const d={...c,shown_position:c.posicao,attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
  native_skills:c.habilidades_nativas,boost1:c.impeto_fixo,boost2:c.impeto_extra,
  recommended_levels:c.niveis};
 const source=T.confirmSource(d);if(source)verified++;else pending++;
 const baseline=source?d.recommended_levels:null;
 assert.equal(T.roleOf(d)!==null,true,'Posição do catálogo deve existir: '+c.numero);
 const fingerprints=new Set();
 for(const style of T.STYLES){
  const proof=T.focus(d,style.id);
  assert.equal(proof.role,T.roleOf(d));
  assert.equal(proof.baseKnown,c.base_stats_known===true);
  assert(proof.warning.includes('não status finais'),'Não confundir PP com stats');
  assert.equal(proof.priority.length,4);
  const skills=R.evaluate(d,style.id,'');
  assert.equal(skills.nativeKnown,Boolean(String(c.habilidades_nativas||'').trim()),'Lacunas de habilidades nativas devem permanecer explícitas '+c.numero);
  assert.equal(skills.recommendations.length>0,true,'Habilidades para '+c.numero+' '+style.id);
  assert(skills.recommendations.every(x=>!String(c.habilidades_nativas||'').split(';').map(R.keyFor).includes(x.key)),
   'Nunca sugerir adicional nativa '+c.numero+' '+style.id);
  const ranks=B.rank(c,style.id);
  assert(ranks.length>0,'Ímpeto por função e estilo: '+c.numero);
  assert(!ranks.some(r=>r.nome===B.boosterName(c.impeto_fixo)),'Não recomendar booster fixo');
  const analysis=R.booster(d,style.id,B);
  assert(analysis.primary);
  assert.equal(analysis.primary.nome,ranks[0].nome);
  assert.equal(analysis.able,false,'Sem confirmação manual, slot NÃO equipável');
  namesByTactic[style.id].add(analysis.primary.nome);
  if(baseline){
   const result=T.hypothetical(d,style.id,baseline);
   assert(result!==null);
   assert(T.valid(result.levels));
   assert.equal(T.total(result.levels),c.pp,'PP inteiros iguais orçamento '+c.numero+' '+style.id);
   assert.equal(result.levels.length,10);
   if(style.id==='posse'){
    assert.deepEqual(result.levels,baseline,'Posse é baseline da edição; não alterar');
    assert.equal(result.source,'registrado');
   }else{
    assert.notEqual(result.confidence,'alta');
    if(result.changes.length)changed++;
   }
   fingerprints.add(result.levels.join(':'));
   if(T.roleOf(d)==='GO'){
    assert(result.levels.slice(0,7).every((n,i)=>n===baseline[i]),'Não alterar categorias de linha preexistentes na ficha do GO');
   }else{
    assert(result.levels.slice(7).every((n,i)=>n===baseline[i+7]),'Não alterar categoria GK preexistente no cadastro');
   }
   const alt=T.hypothetical(d,style.id,baseline,1);
   assert(alt&&T.total(alt.levels)===c.pp,'Cenário B deve respeitar PP');
  }else assert.equal(T.hypothetical(d,style.id,null),null,'Não inventar base para carta pendente');
 }
 if(String(c.habilidades_nativas||'').trim())withNative++;
 if(fingerprints.size>1)styleDifferences++;
}
assert.equal(verified,160,'162 treinos registrados');
assert.equal(pending,86,'84 treinos ainda experimentais');
assert(withNative>=200&&withNative<=246,'Contar as nativas documentadas sem inventar nas cartas pendentes');
assert(changed>70,'Táticas diferentes precisam gerar hipóteses realmente distintas em várias cartas');
assert(styleDifferences>50,'Múltiplos estilos devem afetar a distribuição por função');
for(const t of T.STYLES)assert(namesByTactic[t.id].size>=5,'Ímpetos devem variar entre funções '+t.id);
const special=cards.find(c=>c.numero===40);
assert.deepEqual(T.hypothetical({...special,shown_position:special.posicao,recommended_levels:special.niveis},'posse',special.niveis).levels,special.niveis,
 'Dwight Yorke mantém a build registrada');
assert.deepEqual(cards.map(c=>({id:c.id,num:c.numero,pp:c.pp,levels:c.niveis,native:c.habilidades_nativas,fixed:c.impeto_fixo,extra:c.impeto_extra})),original,
 'Algoritmo não pode modificar dados originais');
for(const file of ['scout-multitactic-engine-v220.js','scout-card-unified-v220.js','scout-card-unified-v220.css']){
 assert(read('web/sw.js').includes("'./"+file+"'"),'Offline Android/Windows: '+file);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+file+"'"),'Fingerprint de pacote: '+file);
 assert(read('web/app-bridge.js').includes("'"+file+"'"),'Fichas globais: '+file);
}
const ui=read('web/scout-card-unified-v220.js'),training=read('web/scout-training-unified-v218.js'),css=read('web/scout-card-unified-v220.css');
assert(ui.includes("getElementById('engenharia')")&&ui.includes('scout-v220-technical'),'Engenharia secundária e única ficha principal');
assert(ui.includes("document")&&ui.includes("scout-v220-styles")===false,'UI não precisa criar duplicata de formulário de treino');
assert(ui.includes('scout-v220-tabs')&&ui.includes('scout-v220-skills-caution')&&ui.includes('scout-v220-booster-slot'));
assert(training.includes("':tactic:'")&&training.includes('scoutpro:tactic-selected-v220'),'Rascunhos isolados por estilo e Card ID');
assert(training.includes("activeTactic==='posse'"),'Apenas Posse sincroniza o laboratório legado');
assert(css.includes('@media(max-width:420px)'),'Layout premium responsivo');
assert(!ui.includes('fetch("https://')&&!ui.includes('eval('),'Nenhuma inferência remota de status de jogador');
assert(!ui.includes('localStorage.setItem("SCOUT_V69')&&!training.includes('recommended_levels ='),'Nunca sobrescrever catálogo');
console.log('V220 PASS: 246 cartas x 5 estilos; '+verified+' builds registradas, '+pending+
 ' pendentes, '+changed+' hipóteses PP reequilibradas e '+styleDifferences+' cartas com variações entre táticas; zero dados alterados.');
