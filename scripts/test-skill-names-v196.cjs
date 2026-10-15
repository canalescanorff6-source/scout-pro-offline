'use strict';
/* V196: fidelidade dos nomes PT-BR sem alterar Card IDs nem a identidade das skills. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const names=require(path.join(web,'skill-names-v196.js'));
const engine=require(path.join(web,'skills-booster-v162.js'));
const source=JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
const expected=[
 ['Weighted Pass','Passe na medida'],['Passe ponderado','Passe na medida'],
 ['First-time Shot','Chute de primeira'],['Finalização de primeira','Chute de primeira'],
 ['Long-range Shooting','Precisão à distância'],['Chute de longa distância','Precisão à distância'],
 ['Long-range Curler','Efeito de longe'],['Chute colocado de longa distância','Efeito de longe'],
 ['Heading','Cabeçada'],['Cabeceio','Cabeçada'],['Track Back','Volta para marcar'],
 ['Acrobatic Clearance','Afastamento acrobático'],['Captaincy','Liderança'],
 ['Super-sub','Super substituto'],['Cut Behind & Turn','Puxada de letra'],
 ['Chop Turn','Corte com virada'],['Marseille Turn','Giro 360°'],
 ['Scissors Feint','Pedalada simples'],['Flip Flap','Elástico'],
 ['Scotch Move','Finta de letra'],['Sole Control','Controle com a sola'],
 ['Knuckle Shot','Chute com o peito do pé'],['Dipping Shot','Folha seca'],
 ['Rising Shot','Chute ascendente'],['Through Passing','Passe em profundidade'],
 ['One-touch Pass','Passe de primeira'],['Outside Curler','Curva para fora'],
 ['No Look Pass','Passe sem olhar'],['Pinpoint Crossing','Cruzamento preciso'],
 ['Gamesmanship','Malícia'],['Blocker','Bloqueador'],['Interception','Interceptação'],
 ['Man Marking','Marcação individual'],['Sliding Tackle','Carrinho'],
 ['Aerial Superiority','Superioridade aérea'],['Fighting Spirit','Espírito guerreiro'],
 ['GK Low Punt','Reposição baixa do GO'],['GK Long Throw','Arremesso longo do GO'],
 ['GK Penalty Saver','Pegador de pênaltis']
];
for(const [original,label] of expected){
 assert.equal(names.display(original),label,'Tela oficial: '+original);
 assert.equal(names.display(label),label,'Exibição idempotente: '+label);
 assert.equal(names.supported(original),true);
}
assert.equal(names.display('Phenomenal Finishing'),'Phenomenal Finishing',
 'Não traduzir habilidade especial sem prova, para evitar confusão com Finalização acrobática');
assert.equal(names.display('GK High Punt'),'GK High Punt',
 'Não adivinhar nome do GO ausente no conjunto de evidências');
assert.equal(names.display('Chute de longe'),'Efeito de longe');
assert.notEqual(names.display('Long-range Shooting'),names.display('Long-range Curler'),
 'Duas habilidades de chute diferentes não podem ser fundidas');
assert.equal(names.display('Cabeceio: 95'),'Cabeceio: 95','Não alterar atributos do jogador');
assert.equal(names.display('Card ID: 123456'),'Card ID: 123456');
// DOM: trocar apenas texto visível em seletores de habilidades, sem reescrever script JSON ou salvar na conta.
const makeNode=(text)=>({textContent:text,title:'',attrs:{},
 hasAttribute(k){return Object.hasOwn(this.attrs,k)},setAttribute(k,v){this.attrs[k]=v}});
const a=makeNode('Heading'),b=makeNode('First-time Shot'),c=makeNode('Heading, Long-range Shooting, Phenomenal Finishing');
const d=makeNode('Passe ponderado, Finalização de primeira');
const legacy=makeNode('Habilidades adicionais candidatas');
const box={querySelector:s=>s==='b'?legacy:null};
legacy.nextElementSibling=d;
const selections={'.skill-cloud .skill, #scout-v184-evidence ul li':[a,b],
 '.v68-skill p':[c],'.soft-panel':[box]};
const doc={querySelectorAll:s=>selections[s]||[]};
assert.equal(names.apply(doc),4);
assert.equal(a.textContent,'Cabeçada');
assert.equal(b.textContent,'Chute de primeira');
assert.equal(c.textContent,'Cabeçada, Precisão à distância, Phenomenal Finishing');
assert.equal(d.textContent,'Passe na medida, Chute de primeira');
assert.equal(a.attrs['data-scout-original-skill'],'Heading');
assert.equal(names.apply(doc),0,'Não mutar o DOM continuamente');
const keys={weighted:'Passe na medida',firstshot:'Chute de primeira',
 longshot:'Precisão à distância',curler:'Efeito de longe',heading:'Cabeçada',
 trackback:'Volta para marcar',clear:'Afastamento acrobático',
 cutturn:'Puxada de letra',captain:'Liderança',supersub:'Super substituto'};
for(const [key,label] of Object.entries(keys)){
 assert.equal(engine.SKILLS[key].name,label,'Motor com nome oficial: '+key);
 assert.equal(engine.keyFor(label),key,'Nome oficial precisa identificar a habilidade: '+label);
}
for(const [raw,key] of Object.entries({
 'Passe ponderado':'weighted','Finalização de primeira':'firstshot',
 'Chute de longa distância':'longshot','Chute colocado de longa distância':'curler',
 'Cabeceio':'heading','Recuar para marcar':'trackback','Corte acrobático':'clear',
 'Corte para trás e giro':'cutturn','Capitão':'captain','Super reserva':'supersub'
}))assert.equal(engine.keyFor(raw),key,'Alias antigo para não duplicar: '+raw);
assert.equal(source.length,246);
let total=0,covered=0,other=new Set();
for(const card of source){
 for(const native of String(card.habilidades_nativas||'').split(';').map(x=>x.trim()).filter(Boolean)){
  total++;
  if(names.supported(native))covered++;
  else other.add(native);
 }
 for(const tactic of ['posse','normal','rapido']){
  const data={shown_position:card.posicao,attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,native_skills:card.habilidades_nativas};
  const result=engine.evaluate(data,tactic);
  assert(result.recommendations.every(s=>s.name===names.display(s.name)),'Nome divergente #'+card.numero+' '+tactic);
  const nativeKeys=new Set(String(card.habilidades_nativas||'').split(';').map(engine.keyFor).filter(Boolean));
  for(const s of result.recommendations)assert(!nativeKeys.has(s.key),'Nativa recomendada novamente #'+card.numero+': '+s.name);
 }
}
assert(covered/total>.78,'Padronizar maioria dos itens com nomes validados; cobertura='+covered+'/'+total);
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
const sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
const stamp=fs.readFileSync(path.join(root,'scripts/stamp-bundle-v189.cjs'),'utf8');
assert(bridge.includes("v189Root+'skill-names-v196.js'"));
assert(sw.includes("'./skill-names-v196.js'")&&sw.includes('v196-skill-names'));
assert(stamp.includes("'skill-names-v196.js'"),'Revisão precisa usar fingerprint igual Android/Windows');
console.log('V196 OK: '+source.length+' cartas, '+total+' skills registradas, '+covered+' com exibição PT-BR verificada ('+(100*covered/total).toFixed(1)+'%). '+other.size+' grafias sem correspondente permanecem intactas.');
