/* Scout PRO V162 — sugestões competitivas por edição/função, não confirmação de equipamento. */
(function(host){
'use strict';
const ENTRIES=[
 ['onepass','Passe de primeira',['One-touch Pass','One Touch Pass','Passe de primeira'],'Acelera tabelas e devoluções curtas.'],
 ['through','Passe em profundidade',['Through Passing','Passe em profundidade','Passe a rasgar'],'Melhora a opção de passe para a infiltração pelo centro.'],
 ['double','Toque duplo',['Double Touch','Toque duplo'],'Amplia as saídas curtas do marcador com a bola dominada.'],
 ['sole','Controle com a sola',['Sole Control','Controle com a sola'],'Facilita recepção e giro sob pressão.'],
 ['heel','Toque de calcanhar',['Heel Trick','Passe de calcanhar','Toque de calcanhar'],'Oferece devoluções rápidas quando o corpo não está de frente.'],
 ['weighted','Passe na medida',['Weighted Pass','Passe ponderado','Passe na medida'],'Dá opção de passe com peso controlado em transições e apoio.'],
 ['fighting','Espírito guerreiro',['Fighting Spirit','Espírito guerreiro'],'Ajuda a manter ações competitivas sob pressão e cansaço.'],
 ['intercept','Interceptação',['Interception','Interceptação'],'Fortalece a leitura e o corte de linhas de passe.'],
 ['blocker','Bloqueador',['Blocker','Bloqueador'],'Apoia bloqueios de passes e finalizações em cobertura.'],
 ['mark','Marcação individual',['Man Marking','Marcação individual'],'Apoia acompanhamento defensivo quando a função exigir.'],
 ['aerial','Superioridade aérea',['Aerial Superiority','Superioridade aérea'],'Aumenta recursos nos duelos aéreos.'],
 ['heading','Cabeçada',['Heading','Cabeceio','Cabeçada'],'Melhora o recurso de cabeceio para atacantes que recebem bola alta.'],
 ['firstshot','Chute de primeira',['First-time Shot','First Time Shot','Finalização de primeira','Chute de primeira'],'Permite finalizar mais rapidamente após a tabela.'],
 ['acrobatic','Finalização acrobática',['Acrobatic Finishing','Finalização acrobática'],'Oferece finalizações em posições difíceis dentro da área.'],
 ['longshot','Precisão à distância',['Long-range Shooting','Long Range Shooting','Long-Range Shooting','Finalização de longa distância','Chute de longa distância','Precisão à distância'],'Cria alternativa quando a defesa fecha a área.'],
 ['curler','Efeito de longe',['Long-range Curler','Long-Range Curler','Chute colocado de longa distância','Efeito de longe'],'Oferece curva em finalizações de média e longa distância.'],
 ['trackback','Volta para marcar',['Track Back','Track-back','Recuar para marcar','Volta para marcar'],'Ajuda o jogador ofensivo a recompor quando perde a bola.'],
 ['sliding','Carrinho',['Sliding Tackle','Carrinho'],'Amplia alternativa de desarme com cuidado para não cometer faltas.'],
 ['clear','Afastamento acrobático',['Acrobatic Clearance','Corte acrobático','Afastamento acrobático'],'Ajuda a afastar bolas difíceis em situações defensivas.'],
 ['lowloft','Passe aéreo baixo',['Low Lofted Pass','Passe meio levantado','Passe aéreo baixo'],'Oferece uma saída aérea mais rápida quando o passe curto é bloqueado.'],
 ['cutturn','Puxada de letra',['Cut Behind & Turn','Cut Behind Turn','Cut Behind And Turn','Corte para trás e giro','Puxada de letra'],'Recurso de giro curto para escapar da marcação.'],
 ['gklow','Reposição baixa do GO',['GK Low Punt','Lançamento rasteiro de goleiro','Repos. baixa do GO'],'Ajuda a repor a bola rapidamente em zonas mais baixas.'],
 ['gkhigh','Lançamento alto de goleiro',['GK High Punt','Lançamento alto de goleiro'],'Amplia a reposição com os pés quando o passe curto não é seguro.'],
 ['gklong','Arremesso longo do GO',['GK Long Throw','Lançamento longo de goleiro','Arrem. longo do GO'],'Permite iniciar jogadas com lançamentos manuais longos.'],
 ['gkpenalty','Pegador de pênaltis',['GK Penalty Saver','Defesa de pênalti','Pegador de pênaltis'],'Adiciona recurso nas cobranças de pênalti.'],
 ['captain','Liderança',['Captaincy','Liderança','Capitão'],'Contribui com o papel de liderança da equipe.'],
 ['supersub','Super substituto',['Super Sub','Super-sub','Super reserva','Super substituto'],'Alternativa para quem normalmente entra na segunda etapa.']
];
const SKILLS=Object.fromEntries(ENTRIES.map(x=>[x[0],Object.freeze({key:x[0],name:x[1],aliases:x[2],why:x[3]})]));
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliasMap=new Map;
for(const e of ENTRIES)for(const alias of [e[1],...e[2]])aliasMap.set(normal(alias),e[0]);
// Alias adicionais derivados das grafias portuguesas encontradas nos prints eFHUB.
for(const [raw,key] of Object.entries({
 'chute de primeira':'firstshot','finalizacao de primeira':'firstshot',
 'chute de longa distancia':'longshot','finalizacao de longa distancia':'longshot','precisao a distancia':'longshot',
 'efeito de longe':'curler','chute colocado de longa distancia':'curler','chute de longe':'curler',
 'cabeçada':'heading','cabecada':'heading',
 'afastamento acrobatico':'clear','corte acrobatico':'clear','reposicao alta do go':'gkhigh',
 'arremesso longo do go':'gklong','pegador de penaltis':'gkpenalty',
 'comandante da defesa go':'captain','controle com a sola':'sole',
 'passe de primeira':'onepass','passe em profundidade':'through',
 'passe a rasgar':'through','passe ponderado':'weighted','recuar para marcar':'trackback',
 'corte para tras e giro':'cutturn','super reserva':'supersub','capitao':'captain','bloqueador':'blocker',
 'superioridade aerea':'aerial','interceptacao':'intercept'

}))if(!aliasMap.has(normal(raw)))aliasMap.set(normal(raw),key);
const keyFor=s=>aliasMap.get(normal(s))||'';
const splitSkills=s=>Array.isArray(s)?s:String(s||'').split(/[;\n,]+/).map(x=>x.trim()).filter(Boolean);
// A confirmação só vale para a edição exata e para ESTA lista de habilidades.
// Editar o texto invalida automaticamente a confirmação antiga.
const confirmationKey=(cap,id)=>'scoutpro:v254:additional-confirmed:'+Number(cap)+'@'+String(id);
const fingerprint=s=>[...new Set(splitSkills(s).map(x=>keyFor(x)||'unmapped:'+normal(x)))].sort().join('|');
function checkedEquipment(card,manual,record){
 return Boolean(record&&record.schema==='CRAQUE_ADDITIONAL_V254'&&record.confirmed===true&&
  Number(record.capture)===Number(card.capture)&&String(record.card_id)===String(card.id)&&
  record.fingerprint===fingerprint(manual));
}
const POSITION={AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DD:'LD',LD:'LD',DE:'LE',LE:'LE',DC:'ZG',ZC:'ZG',ZG:'ZG',GR:'GO',GO:'GO',PTD:'ALA',PTE:'ALA',MLD:'ALA',MLE:'ALA'};
const POOLS={
 CA:['firstshot','onepass','through','sole','heel','acrobatic','longshot','fighting','heading','aerial','double','curler','supersub','weighted'],
 SA:['onepass','through','double','sole','firstshot','heel','longshot','fighting','curler','weighted','cutturn','acrobatic','trackback','supersub'],
 MAT:['onepass','through','sole','double','heel','weighted','fighting','longshot','curler','cutturn','firstshot','intercept','trackback'],
 MLG:['onepass','through','weighted','sole','intercept','fighting','double','heel','blocker','mark','lowloft','cutturn','longshot','trackback'],
 VOL:['intercept','blocker','onepass','through','fighting','mark','aerial','weighted','sliding','clear','sole','lowloft','heading'],
 ZG:['blocker','intercept','mark','aerial','fighting','onepass','clear','heading','sliding','weighted','through','sole','lowloft'],
 LD:['intercept','blocker','onepass','fighting','mark','aerial','through','sliding','weighted','sole','clear','trackback','lowloft'],
 LE:['intercept','blocker','onepass','fighting','mark','aerial','through','sliding','weighted','sole','clear','trackback','lowloft'],
 ALA:['double','sole','onepass','through','fighting','heel','firstshot','cutturn','longshot','trackback','weighted','curler','supersub'],
 GO:['gklow','gklong','gkhigh','gkpenalty','fighting','captain','weighted','lowloft','onepass']
};
function roleOf(d){return POSITION[d.role_used]||POSITION[d.shown_position]||POSITION[d.posicao]||null}
function evaluate(d,tactic,manualEquipped,options={}){
 if(!['posse','normal','rapido','fora','longo'].includes(tactic))throw Error('Tática inválida');
 const role=roleOf(d);if(!role)return {role:null,recommendations:[],nativeKnown:false,missing:['Posição da carta não cadastrada']};
 const native=splitSkills(d.native_skills||d.habilidades_nativas);
 const nativeKnown=Boolean(native.length);
 const equipped=splitSkills(manualEquipped);
 const nativeKeys=new Set(native.map(keyFor).filter(Boolean));
 // Cinco slots são físicos. Grafias PT-BR/EN da mesma habilidade contam uma vez;
 // nenhuma habilidade nativa registrada conta como adicional equipado.
 const userMap=new Map();
 for(const name of equipped){
  const identity=keyFor(name)||'unmapped:'+normal(name);
  if(identity&&!userMap.has(identity))userMap.set(identity,name);
 }
 const nativeManualConflicts=[...userMap].filter(([id])=>nativeKeys.has(id)).map(([,name])=>name);
 const distinctExtras=[...userMap].filter(([id])=>!nativeKeys.has(id));
 const used=new Set([...nativeKeys,...userMap.keys()].filter(id=>!id.startsWith('unmapped:')));
 const style=normal([d.playing_style,d.attack_style,d.defence_style,d.estilo_ataque,d.estilo_defesa].filter(Boolean).join(' '));
 const pool=POOLS[role];const scorer=new Map;
 pool.forEach((key,i)=>scorer.set(key,200-i*10));
 const bump=(names,amount)=>names.forEach(k=>{if(scorer.has(k))scorer.set(k,scorer.get(k)+amount)});
 if(tactic==='posse')bump(['onepass','through','sole','double','heel','intercept','blocker'],22);
 if(tactic==='normal')bump(['intercept','fighting','weighted','blocker','through'],16);
 if(tactic==='rapido')bump(['through','firstshot','double','longshot','fighting','intercept'],18);
 if(tactic==='fora')bump(['weighted','lowloft','onepass','sole','double','through','aerial','gklong'],23);
 if(tactic==='longo')bump(['weighted','lowloft','aerial','heading','firstshot','fighting','intercept','gklong'],24);
 if(/pivo|homem de area|target/.test(style))bump(['heading','aerial','onepass','heel'],34);
 if(/infiltr|puxa marcacao|arrastar defesa|matador|artilheiro|oportunista/.test(style))bump(['firstshot','through','onepass','acrobatic'],18);
 if(/armador|orquestrador|classico|criativo/.test(style))bump(['onepass','through','weighted','sole','heel'],23);
 if(/destruidor|primeiro volante|lateral defensivo|defensor criativo/.test(style))bump(['intercept','blocker','mark','onepass'],22);
 if(/versatil|todo o terreno/.test(style))bump(['fighting','onepass','intercept'],18);
 if(/goleiro ofensivo/.test(style))bump(['gklow','gklong'],25);
 // V217: heurísticas transparentes de complementaridade das habilidades NATIVAS
 // cadastradas na própria carta. Não representam bônus medidos ou gameplay validado.
 const synergy=new Map();
 const support=(condition,targets,amount,explanation)=>{
  if(!condition)return;
  const modifier=tactic==='posse'?amount:(tactic==='fora'?Math.round(amount*.65):tactic==='longo'?Math.round(amount*.55):Math.round(amount*.75));
  for(const id of targets){
   if(!scorer.has(id)||used.has(id))continue;
   scorer.set(id,scorer.get(id)+modifier);
   const notes=synergy.get(id)||[];
   notes.push(explanation);
   synergy.set(id,notes);
  }
 };
 support(nativeKeys.has('firstshot'),['onepass','through','sole'],11,
  'Complementar opção de finalização de primeira com apoios curtos');
 support(nativeKeys.has('double')||nativeKeys.has('sole'),['onepass','through','weighted'],9,
  'Complementar condução/recepção nativa com distribuição de bola');
 support(nativeKeys.has('onepass')&&nativeKeys.has('through'),['sole','double','weighted'],15,
  'Complementar tabela e passe em profundidade já registrados');
 support(nativeKeys.has('heading')&&nativeKeys.has('aerial'),['onepass','sole','heel'],8,
  'Diversificar apoios de carta com recursos aéreos registrados');
 support(nativeKeys.has('intercept')&&nativeKeys.has('blocker'),['onepass','weighted','sole'],12,
  'Apoiar saída curta após ações defensivas cadastradas');
 support(nativeKeys.has('longshot')&&nativeKeys.has('curler'),['onepass','double'],7,
  'Diversificar criação de jogadas de carta com finalizações longas');
 // O histórico de sugestões genéricas não aumenta a nota da carta.
 // Prioridade depende apenas da função, da tática e do estilo, não do OVR.
 const ranked=[...scorer.entries()].filter(([key])=>!used.has(key))
  .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
  .map(([key,score])=>({...SKILLS[key],score,synergies:synergy.get(key)||[]}));
 const overLimit=distinctExtras.length>5;
 // A lista manual pode estar INCOMPLETA. Não declarar espaços livres
 // ou cinco skills aplicáveis até o usuário conferir no Plano de Jogo.
 const equippedConfirmed=options.equippedConfirmed===true;
 const slotsRemaining=equippedConfirmed&&!overLimit?Math.max(0,5-distinctExtras.length):null;
 const limit=overLimit?0:equippedConfirmed?slotsRemaining:5;
 const warnings=[
  ...(overLimit?['Foram informadas mais de cinco habilidades adicionais distintas: revisar no jogo.']:[]),
  ...(nativeManualConflicts.length?['Informadas também como adicionais, mas já aparecem nas nativas cadastradas: '+nativeManualConflicts.join(', ')]:[])
 ];
 return {role,nativeKnown,knownNative:native.length,
  alreadyEquippedProvided:Math.min(5,distinctExtras.length),
  manualReportedCount:distinctExtras.length,nativeManualConflicts,manualOverLimit:overLimit,
  equippedConfirmed,slotsRemaining,
  recommendations:ranked.slice(0,limit),alternatives:ranked.slice(limit,limit+3),
  synergyDetected:synergy.size>0,
  missing:[...(nativeKnown?[]:['Habilidades nativas da edição não documentadas: confirme antes de gastar tokens.']),...warnings]};
}
function booster(d,tactic,engine,verifiedSlot,verifiedEquipped){
 const value=String(d.boost2||d.impeto_extra||'');
 const status=engine?.slotStatus?engine.slotStatus(value):(/^SLOT SELECION[AÁ]VEL/i.test(value)?'selecionavel':'indefinido');
 const position=POSITION[d.role_used]?d.role_used:d.shown_position||d.role_used||d.posicao;
 const natural=String(d.boost1||d.impeto_fixo||'').replace(/\s*\+\d+.*/,'').trim();
 const extra=String(value).replace(/\s*\+\d+.*/,'').trim();
 const validBooster=s=>engine&&Object.keys(engine.BOOSTERS||{}).find(x=>normal(x)===normal(s));
 const knownExtra=validBooster(extra);
 // Apenas um slot confirmado VAZIO pode receber um novo ímpeto.
 // 'ocupado' autoriza comparação, nunca marca a carta como equipável.
 // V262: "PENDENTE / selecionável" classifica-se como POSSÍVEL no motor
 // legado, não como slot documentalmente existente. A conta marcar "vazio"
 // não autoriza gastar token se o catálogo permanece ambíguo.
 const slotSupported=status==='selecionavel';
 const slotEvidence=status==='selecionavel'?'slot_documentado':
  status==='possivel'?'slot_pendente':'sem_slot_documentado';
 const able=slotSupported&&verifiedSlot==='vazio';
 const existing=knownExtra||'';
 const equippedName=validBooster(verifiedEquipped)||'';
 let ranked=[];
 if(engine&&typeof engine.rank==='function'){
  try{ranked=engine.rank({posicao:position,estilo_ataque:d.attack_style||d.estilo_ataque,estilo_defesa:d.defence_style||d.estilo_defesa,impeto_fixo:d.boost1||d.impeto_fixo,impeto_extra:value,niveis:d.recommended_levels||d.niveis,habilidades_nativas:d.native_skills||d.habilidades_nativas},tactic).filter(x=>normal(x.nome)!==normal(natural)&&normal(x.nome)!==normal(existing)&&normal(x.nome)!==normal(equippedName));}catch(e){ranked=[]}
 }
 const note=verifiedSlot==='ausente'?'Você marcou esta carta como sem slot selecionável neste dispositivo. Nenhum ímpeto novo será recomendado.':
 status==='nome_registrado'?'Segundo ímpeto já nomeado no cadastro; não tratar como slot livre ou substituível.':
 status==='possivel'?'SLOT PENDENTE: o acervo diz apenas "PENDENTE / selecionável", não é prova do slot nesta edição. Conferir a carta e conciliar o registro antes de gastar tokens.':
 !slotSupported?'O catálogo não comprova um segundo slot selecionável nesta edição; mesmo que a conta tenha registro de slot vazio, não autorizar gastos sem reconciliar as evidências.':
 verifiedSlot==='ocupado'?'Você confirmou slot ocupado. A opção abaixo é apenas comparação, nunca substituição automática.':
 verifiedSlot==='vazio'?'Slot selecionável no catálogo e vazio confirmado nesta edição; confira os quatro atributos afetados antes de gastar tokens.':
 able?'Slot selecionável indicado no catálogo; confirmação no Plano de Jogo ainda necessária.':
 'Não existe prova documental suficiente de um slot selecionável. Confira no jogo antes de aplicar tokens.';
 // O ranking da carta deve existir independentemente da disponibilidade do slot.
 // "primary" é uma prioridade competitiva, NÃO algo equipado ou autorizado.
 return {status,verifiedSlot,slotSupported,slotEvidence,able,knownExtra:existing,confirmedEquipped:equippedName||null,natural,primary:ranked[0]||null,alternatives:ranked.slice(1,3),note,
  confidence:ranked[0]?.confianca||'sem_base_para_ranquear',
  spread:ranked.length>1?Number((ranked[0].score-ranked[1].score).toFixed(2)):null,
  equipStatus:verifiedSlot==='ausente'?'impossivel_na_conta':status==='nome_registrado'?'comparacao_segundo_fixo':status==='possivel'?'slot_pendente_no_catalogo':!slotSupported?'slot_nao_documentado':verifiedSlot==='ocupado'?'ocupado_na_conta':able?'condicionado_a_slot':'slot_nao_verificado'};
}
const USER_SLOT_NOTES=Object.freeze({
 24:'Cristiano Ronaldo Big Time #024: o usuário relata dois ímpetos embutidos, sem edição; preservar ambos.',
 81:'Rivaldo Big Time #081: o usuário relata um único ímpeto fixo; o nome ainda precisa de validação na carta.',
 172:'Courtois #172: o usuário relata um espaço selecionável; o banco não confirma o slot. Conferir no jogo.',
 236:"Eto'o #236: o usuário relata ímpeto fixo e outro selecionável; nome e edição seguem pendentes."
});
const api={SKILLS,ENTRIES,POSITION,POOLS,keyFor,roleOf,evaluate,booster,USER_SLOT_NOTES,
 confirmationKey,fingerprint,checkedEquipment};
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_RECOMMENDATIONS_V162=api;
if(typeof document==='undefined'||document.body?.dataset.page!=='detail')return;
const ds=document.getElementById('scout-v68-data');if(!ds)return;
let d;try{d=JSON.parse(ds.textContent)}catch(e){return}
const container=document.querySelector('.profile-content');if(!container)return;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('style');css.textContent=
'#scout-v162{border:1px solid #326a85;background:linear-gradient(150deg,#102b40,#0e2132);border-radius:18px;padding:18px;margin:16px 0 20px;color:#e9f5ff;scroll-margin-top:15px}'+
'#scout-v162 h2{margin:4px 0 8px;font-size:clamp(18px,3vw,24px)}#scout-v162 p{font-size:13px;line-height:1.55;margin:7px 0}'+
'#scout-v162 .v162-meta{font-size:11px;letter-spacing:.08em;color:#a6d9e8;font-weight:800}'+
'#scout-v162 .v162-modes{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}'+
'#scout-v162 button{background:#1a475f;border:1px solid #4c819a;border-radius:9px;color:white;cursor:pointer;min-height:42px;padding:8px 12px;font-size:13px;font-weight:700}'+
'#scout-v162 button[aria-pressed=true]{background:#0b8b84;border-color:#81e2d4;color:#fff}'+
'#scout-v162 .v162-list{display:grid;gap:8px;padding:0;list-style:none;margin:12px 0}'+
'#scout-v162 .v162-list li{border:1px solid #31536b;background:#11293c;border-radius:10px;padding:10px 12px}'+
'#scout-v162 .v162-list li p{margin:3px 0 0;color:#b7d6e5}'+
'#scout-v162 .v162-panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
'#scout-v162 .v162-panel{border:1px solid #33556b;border-radius:12px;padding:12px;background:#0b1e2d;min-width:0}'+
'#scout-v162 .v162-note{color:#d3caa5}#scout-v162 textarea{box-sizing:border-box;width:100%;min-height:62px;background:#081e2d;border:1px solid #5b829a;border-radius:8px;color:white;font-size:14px;padding:10px}'+
'#scout-v162 .v162-foot{font-size:12px;color:#b9d3dc;border-top:1px solid #35566a;padding-top:10px;margin-top:12px}'+
'@media(max-width:750px){#scout-v162 .v162-panels{grid-template-columns:1fr}#scout-v162{padding:12px}}';
css.textContent+=
 '#scout-v162 .v254-confirm-line{display:flex;gap:10px;align-items:flex-start;padding:11px;margin:12px 0;border:1px solid #82745d;border-radius:10px;background:#152c42;color:#f1deb4;line-height:1.45;font-size:12px;font-weight:700}'+
 '#scout-v162 .v254-confirm-line input{flex:0 0 20px;width:20px;height:20px;margin:1px 0 0;accent-color:#e3bb75}'+
 '#scout-v162 .v254-confirm-line input:focus-visible{outline:3px solid #f0cc82;outline-offset:3px}';
document.head.appendChild(css);
const section=document.createElement('section');section.id='scout-v162';section.setAttribute('aria-label','Recomendações de habilidades e ímpetos por carta');
section.innerHTML='<div class="v162-meta">SCOUT PRO · OTIMIZAÇÃO COMPETITIVA V162</div><h2>Habilidades adicionais e melhor ímpeto</h2><p>Recomendações por edição, função, estilo e tática. A prioridade é o desempenho em campo, não o Overall.</p>'+
'<div class="v162-modes" role="group" aria-label="Estilo tático"><button type="button" data-tactic="posse" aria-pressed="true">Posse de Bola</button><button type="button" data-tactic="normal" aria-pressed="false">Contra-Ataque Normal</button><button type="button" data-tactic="rapido" aria-pressed="false">Contra-Ataque Rápido</button><button type="button" data-tactic="fora" aria-pressed="false">Por Fora</button><button type="button" data-tactic="longo" aria-pressed="false">Passe Longo</button></div>'+
'<div class="v162-panels"><article class="v162-panel"><h3>5 habilidades adicionais · prioridade na Posse</h3><p id="v162-skills-status"></p><ol class="v162-list" id="v162-skills"></ol><p id="v162-alts"></p></article><article class="v162-panel"><h3>Ímpetos fixos / adicionais</h3><div id="v162-source"></div><div id="v162-booster"></div></article></div>'+
'<details><summary>Informar habilidades adicionais desta edição</summary><p>Separe os nomes por ponto e vírgula. Sem conferência, esta é apenas uma lista parcial: não presumimos que os outros slots estejam vazios.</p><textarea id="v162-equipped" aria-label="Habilidades adicionais já equipadas" placeholder="Ex.: Passe de primeira; Toque duplo"></textarea><label class="v254-confirm-line"><input type="checkbox" id="v254-confirm-equipped"><span>Conferi no Plano de Jogo: esta lista contém TODAS as habilidades adicionais equipadas nesta edição exata, inclusive se estiver vazia.</span></label><button id="v162-save" type="button">Salvar conferência e recalcular</button><p id="v162-feedback" aria-live="polite"></p></details>'+
'<p class="v162-foot">Recomendações teóricas baseadas nas habilidades registradas, no estilo e na função da carta. Não são testes comprovados em partidas; verifique habilidades nativas, compatibilidade e slot antes de usar tokens. Nenhuma escolha é aplicada automaticamente.</p>';
// V192: mostrar as cinco habilidades dentro da ficha PRINCIPAL, sem cópia do painel.
const principal=container.querySelector('#scout-v188-principal');
const anatomical=principal?.querySelector('.scout-v188-body');
if(anatomical){
 anatomical.insertAdjacentElement('beforebegin',section);
 // V193: esconder o atalho redundante apenas quando o painel de habilidades já está visível.
 principal.classList?.add('scout-v193-skills-integrated');
}
else {
 const after=principal||container.querySelector('#scout-card-navigator')||container.querySelector('.detail-header')||container.querySelector('.mobile-profile');
 if(after)after.insertAdjacentElement('afterend',section);else container.prepend(section);
}
const side=document.querySelector('.side-nav');if(side){const link=document.createElement('a');link.href='#scout-v162';link.textContent='★ Habilidades e ímpetos PRO';side.prepend(link)}
const storage='scoutpro:v162:equipped:'+String(d.capture)+':'+String(d.id||'unknown');
let extra='';try{extra=localStorage.getItem(storage)||''}catch(e){}
const ta=section.querySelector('#v162-equipped');ta.value=extra;
const verifiedCheck=section.querySelector('#v254-confirm-equipped');
const verifyKey=confirmationKey(d.capture,d.id);
const readProof=()=>{try{return JSON.parse(localStorage.getItem(verifyKey)||'null')}catch(_){return null}};
const equipmentConfirmed=()=>checkedEquipment(d,extra,readProof());
verifiedCheck.checked=equipmentConfirmed();
ta.addEventListener('input',()=>{if(fingerprint(ta.value)!==fingerprint(extra))verifiedCheck.checked=false});
let tactic='posse';
const originalPosition=String(d.shown_position||d.role_used||d.posicao||'');
let actualPosition=originalPosition,roleEvidence='original';
function setConfirmedRole(event){
 const detail=event||{};
 if(Number(detail.capture)!==Number(d.capture)||
    String(detail.card_id)!==String(d.id))return false;
 const API=host.SCOUT_POSITION_TRAINING_V246;
 const native=API?.pos?.(originalPosition)||originalPosition;
 const requested=API?.pos?.(detail.position)||'';
 if(!requested)return false;
 const sourceCard={numero:Number(d.capture),id:String(d.id),posicao:originalPosition};
 const proof=API?.status?.(sourceCard,requested,host.localStorage);
 const valid=requested===native||proof?.eligible===true&&
  ['treinada','familiar'].includes(proof.status);
 if(!valid)return false;
 actualPosition=requested;
 roleEvidence=requested===native?'original':proof.status;
 d.shown_position=requested;d.role_used=requested;
 draw();return true;
}
function draw(){
 let manuallyVerified={};
 try{const val=JSON.parse(localStorage.getItem('scoutpro:v103:booster:'+Number(d.capture))||'null');if(val&&String(val.card_id)===String(d.id))manuallyVerified=val}catch(e){}
 const confirmed=equipmentConfirmed();
 const result=evaluate(d,tactic,extra,{equippedConfirmed:confirmed});
 const boost=booster(d,tactic,host.SCOUT_BOOSTERS_V103,manuallyVerified.status,manuallyVerified.equipped);
 const remaining=result.slotsRemaining;
 const proposed=result.recommendations;
 verifiedCheck.checked=confirmed;
 section.querySelectorAll('[data-tactic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tactic===tactic)));
 section.querySelector('#v162-skills-status').textContent='Função analisada: '+actualPosition+
  ' ('+(roleEvidence==='original'?'posição original':roleEvidence==='treinada'?
  'treino confirmado':'familiaridade confirmada')+'). '+
  'Nativas catalogadas: '+result.knownNative+
  ' · Adicionais informadas (distintas): '+result.manualReportedCount+'/5 · '+
  (confirmed?'Lista completa conferida · vagas restantes: '+remaining+'. ':
   'LISTA NÃO CONFERIDA: vagas disponíveis desconhecidas. Até cinco candidatos teóricos, não cinco slots livres. ')+
  (result.nativeKnown?'Ordem consultiva por função, tática e habilidades nativas cadastradas; não é homologação de gameplay.':
   'EDIÇÃO SEM NATIVAS DOCUMENTADAS: sugestões provisórias; não gaste tokens sem conferir.')+
  (result.missing.length?' Atenção: '+result.missing.join(' '):'');
 const ul=section.querySelector('#v162-skills');ul.replaceChildren();
 for(const s of proposed){const li=document.createElement('li'),b=document.createElement('strong'),p=document.createElement('p');b.textContent=s.name;p.textContent=s.why+(s.synergies?.length?' Critério de complementaridade (hipótese): '+s.synergies.join('; ')+'.':'');li.append(b,p);ul.appendChild(li)}
 for(let i=proposed.length;i<(remaining??0);i++){
  const li=document.createElement('li');li.textContent='Vaga '+(result.alreadyEquippedProvided+i+1)+'/5 · Sem habilidade adicional segura nesta base; confirmar compatibilidade e skills atuais antes de preencher.';ul.appendChild(li);
 }
 if(confirmed&&remaining===0){const li=document.createElement('li');li.textContent='Nenhum slot adicional restante: as cinco habilidades equipadas foram conferidas nesta edição. Alternativas são apenas para comparação.';ul.appendChild(li)}
 if(result.manualOverLimit){const li=document.createElement('li');li.textContent='LISTA INVÁLIDA: mais de cinco habilidades diferentes informadas. Corrija o cadastro antes de usar novas sugestões.';ul.appendChild(li)}
 section.querySelector('#v162-alts').textContent=
  (confirmed&&remaining===0?'Slots completos: nenhuma sugestão adicional pode ser equipada. ':'Prioridades por função, não instalação automática. ')+
  (result.alternatives.length?'Opções comparativas: '+result.alternatives.map(x=>x.name).join(' · ')+'.':
   'Confira disponibilidade e compatibilidade no jogo.');
 const source=section.querySelector('#v162-source');source.replaceChildren();
 const line=(value)=>{const p=document.createElement('p');p.textContent=value;source.appendChild(p)};
 line('Ímpeto de fábrica: '+String(d.boost1||'não documentado'));
 line('Segundo ímpeto no acervo: '+String(d.boost2||'não documentado'));
 const named=boost.status==='nome_registrado';
 const verifiedLabel=({vazio:'Slot vazio confirmado por você',ocupado:'Slot ocupado confirmado por você',ausente:'Sem slot, conforme sua conferência',pendente:'Verificação pendente'})[manuallyVerified.status]||'Ainda não conferido neste dispositivo';
 line('Estado de sua conta: '+verifiedLabel+(manuallyVerified.equipped?' · '+manuallyVerified.equipped:''));
 if(USER_SLOT_NOTES[Number(d.capture)])line('Relato seu (a confirmar na tela do jogo): '+USER_SLOT_NOTES[Number(d.capture)]);
 const panel=section.querySelector('#v162-booster');panel.replaceChildren();
 const title=document.createElement('p');title.style.fontWeight='800';
 const tacticLabel=host.SCOUT_BOOSTERS_V103?.TACTIC_LABEL?.[tactic]||tactic;
 const boosterLabel=boost.primary?.nome_pt||boost.primary?.nome;
 title.textContent=boost.primary?
  'Ímpeto para comparar em '+tacticLabel+': '+boosterLabel+' +1':
  'Sem ímpeto calculável para esta função';
 panel.appendChild(title);
 const applicability=document.createElement('p');applicability.style.fontWeight='700';
 applicability.textContent=boost.equipStatus==='impossivel_na_conta'?'Sua conferência indica que esta carta não possui slot: a escolha é somente comparativa.':
 boost.equipStatus==='comparacao_segundo_fixo'?'Há segundo ímpeto fixo registrado: esta é apenas a melhor alternativa teórica, não uma opção para substituir.':
 boost.equipStatus==='ocupado_na_conta'?'Você confirmou que o segundo slot está ocupado: comparação informativa, sem possibilidade de equipar outro ímpeto.':
 boost.equipStatus==='slot_pendente_no_catalogo'?'Slot selecionável PENDENTE na edição: prioridade apenas teórica, mesmo que você tenha marcado vazio. Conferir no jogo antes de gastar tokens.':
 boost.equipStatus==='slot_nao_documentado'?'Sem segundo slot comprovado no catálogo: comparação teórica, não gastar tokens nem considerar slot livre.':
 boost.equipStatus==='condicionado_a_slot'?'Indicação para o segundo slot, confirmada localmente como vaga mas ainda não homologada em gameplay.':
 'Recomendação pronta; falta confirmar se esta edição possui segundo slot selecionável. Não exige que você insira um ímpeto para descobrir qual seria o melhor.';
 panel.appendChild(applicability);
 if(boost.primary){
 if(!boost.primary.traducao_documentada){
  const translation=document.createElement('p');
  translation.textContent='Nome técnico do ímpeto ('+boost.primary.nome+
   '): tradução PT-BR ainda sem comprovação documental. Confira no jogo.';
  panel.appendChild(translation);
 }
 const why=document.createElement('p');why.textContent='Por que esta carta: '+boost.primary.motivo;panel.appendChild(why);
 const atr=document.createElement('p');atr.textContent='Atributos afetados pelo ímpeto: '+boost.primary.atributos.join(', ')+'. Não são valores finais calculados.';panel.appendChild(atr);
 if(boost.alternatives.length){
  const alt=document.createElement('p');alt.textContent='Alternativas a comparar: '+
   boost.alternatives.map(x=>x.nome_pt||x.nome).join(' / ')+'.';panel.appendChild(alt);
 }
 const uncertainty=document.createElement('p');uncertainty.className='v200-booster-caution';
 uncertainty.textContent=boost.spread!==null&&boost.spread<2?
  'ESCOLHA MUITO PRÓXIMA DAS ALTERNATIVAS. Não vale gastar pedras sem conferir a build final e o slot no eFootball.':
  boost.confidence==='baixa'?'DADOS INDIVIDUAIS INCOMPLETOS. Esta escolha é provisória; não gastar pedras com base só nela.':
  'Escolha consultiva para a build registrada. Os níveis não comprovam quanto falta de velocidade, passe ou finalização. Compare no jogo antes de gastar pedras.';
 panel.appendChild(uncertainty);
 const details=document.createElement('details');details.className='v200-evidence';
 const summary=document.createElement('summary');summary.textContent='Como esta recomendação foi calculada';details.appendChild(summary);
 const e=boost.primary.evidencias||{};
 const explain=document.createElement('p');
 explain.textContent='Pontuação relativa (não Overall): função '+(e.score_funcao??'—')+' · complementaridade do investimento '+(e.score_complemento??'—')+' · estilo e habilidades '+(e.score_contexto??'—')+'. '+(e.treino==='investimento_da_build_sem_atributos_finais'?'Treino registrado, porém sem atributos finais certificados.':'Treino individual sem documentação suficiente.')+' Ímpeto fixo informado: '+(e.impeto_fixo||'não comprovado')+'.';
 details.appendChild(explain);panel.appendChild(details);
}
 const note=document.createElement('p');note.className='v162-note';note.textContent=boost.note;panel.appendChild(note);
 const jump=document.createElement('a');jump.href='../revisao-impetos-v103.html?c='+Number(d.capture);jump.textContent='Confirmar o slot, o ímpeto equipado e as opções desta carta ↗';jump.style.color='#8dd8f7';jump.style.fontWeight='700';panel.appendChild(jump);
}
section.querySelectorAll('[data-tactic]').forEach(b=>b.addEventListener('click',()=>{tactic=b.dataset.tactic;draw();document.dispatchEvent(new CustomEvent('scoutpro:tactic-ui-selected-v220',{detail:{tactic}}))}));
 document.addEventListener('scoutpro:tactic-selected-v220',e=>{if(['posse','normal','rapido','fora','longo'].includes(e.detail?.tactic)){tactic=e.detail.tactic;draw()}});
 // V251: harmonizar também o painel legado de habilidades/ímpetos, não apenas
 // a ficha principal, desde que a versão EXATA da carta seja identificada.
 host.addEventListener('scoutpro:role-selected-v263',event=>setConfirmedRole(event.detail));
 // Revalidar também a última seleção caso o V251 inicialize primeiro.
 if(host.SCOUT_ROLE_SELECTION_V263)setConfirmedRole(host.SCOUT_ROLE_SELECTION_V263);
 host.addEventListener('scoutpro:v251:canonical-data',event=>{
  const row=event.detail||{};
  if(Number(row.capture)!==Number(d.capture)||String(row.id)!==String(d.id)||
   String(row.name)!==String(d.name)||String(row.edition)!==String(d.edition))return;
  for(const field of ['native_skills','attack_style','defence_style','boost1','boost2',
   'recommended_levels','base_stats_known']){
   if(Object.hasOwn(row,field))d[field]=row[field];
  }
  draw();
  document.dispatchEvent(new CustomEvent('scoutpro:skills-updated',{
   detail:{capture:Number(d.capture),card_id:String(d.id),source:'catalogo_v251'}
  }));
 });

section.querySelector('#v162-save').addEventListener('click',()=>{
 const proposedText=ta.value.trim().slice(0,700);
 const requested=verifiedCheck.checked;
 let saved=false;
 try{
  // A impressão digital vincula a confirmação à lista e à edição.
  // Falha entre os writes invalida a marca antiga pelo fingerprint.
  localStorage.setItem(storage,proposedText);
  if(requested){
   localStorage.setItem(verifyKey,JSON.stringify({
    schema:'CRAQUE_ADDITIONAL_V254',capture:Number(d.capture),
    card_id:String(d.id),confirmed:true,fingerprint:fingerprint(proposedText),
    confirmed_at:new Date().toISOString()
   }));
  }else localStorage.removeItem(verifyKey);
  extra=proposedText;saved=true;
  section.querySelector('#v162-feedback').textContent=requested?
   'Lista completa confirmada nesta edição. Vagas disponíveis recalculadas.':
   'Lista parcial salva: não assumiremos que há slots livres.';
 }catch(_e){
  section.querySelector('#v162-feedback').textContent=
   'Não foi possível salvar a conferência. Confira o armazenamento deste dispositivo.';
  extra=localStorage.getItem(storage)||'';
 }
 draw();
 if(saved){
  document.dispatchEvent(new CustomEvent('scoutpro:skills-updated',{
   detail:{capture:Number(d.capture),card_id:String(d.id)}
  }));
  host.dispatchEvent(new CustomEvent('craque:data-changed',{
   detail:{key:storage,edition:String(d.id)}
  }));
 }
});
draw();
})(typeof window!=='undefined'?window:null);
