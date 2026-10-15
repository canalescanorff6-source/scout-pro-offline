/* Scout PRO V162 — sugestões competitivas por edição/função, não confirmação de equipamento. */
(function(host){
'use strict';
const ENTRIES=[
 ['onepass','Passe de primeira',['One-touch Pass','One Touch Pass','Passe de primeira'],'Acelera tabelas e devoluções curtas.'],
 ['through','Passe em profundidade',['Through Passing','Passe em profundidade','Passe a rasgar'],'Melhora a opção de passe para a infiltração pelo centro.'],
 ['double','Toque duplo',['Double Touch','Toque duplo'],'Amplia as saídas curtas do marcador com a bola dominada.'],
 ['sole','Controle com a sola',['Sole Control','Controle com a sola'],'Facilita recepção e giro sob pressão.'],
 ['heel','Passe de calcanhar',['Heel Trick','Toque de calcanhar','Passe de calcanhar'],'Oferece devoluções rápidas quando o corpo não está de frente.'],
 ['weighted','Passe ponderado',['Weighted Pass','Passe ponderado'],'Dá opção de passe com peso controlado em transições e apoio.'],
 ['fighting','Espírito guerreiro',['Fighting Spirit','Espírito guerreiro'],'Ajuda a manter ações competitivas sob pressão e cansaço.'],
 ['intercept','Interceptação',['Interception','Interceptação'],'Fortalece a leitura e o corte de linhas de passe.'],
 ['blocker','Bloqueador',['Blocker','Bloqueador'],'Apoia bloqueios de passes e finalizações em cobertura.'],
 ['mark','Marcação individual',['Man Marking','Marcação individual'],'Apoia acompanhamento defensivo quando a função exigir.'],
 ['aerial','Superioridade aérea',['Aerial Superiority','Superioridade aérea'],'Aumenta recursos nos duelos aéreos.'],
 ['heading','Cabeceio',['Heading','Cabeceio'],'Melhora o recurso de cabeceio para atacantes que recebem bola alta.'],
 ['firstshot','Finalização de primeira',['First-time Shot','First Time Shot','Finalização de primeira'],'Permite finalizar mais rapidamente após a tabela.'],
 ['acrobatic','Finalização acrobática',['Acrobatic Finishing','Finalização acrobática'],'Oferece finalizações em posições difíceis dentro da área.'],
 ['longshot','Chute de longa distância',['Long-range Shooting','Long Range Shooting','Long-Range Shooting','Finalização de longa distância','Chute de longa distância'],'Cria alternativa quando a defesa fecha a área.'],
 ['curler','Chute colocado de longa distância',['Long-range Curler','Long-Range Curler','Chute colocado de longa distância'],'Oferece curva em finalizações de média e longa distância.'],
 ['trackback','Recuar para marcar',['Track Back','Track-back','Recuar para marcar'],'Ajuda o jogador ofensivo a recompor quando perde a bola.'],
 ['sliding','Carrinho',['Sliding Tackle','Carrinho'],'Amplia alternativa de desarme com cuidado para não cometer faltas.'],
 ['clear','Corte acrobático',['Acrobatic Clearance','Corte acrobático'],'Ajuda a afastar bolas difíceis em situações defensivas.'],
 ['lowloft','Passe aéreo baixo',['Low Lofted Pass','Passe meio levantado','Passe aéreo baixo'],'Oferece uma saída aérea mais rápida quando o passe curto é bloqueado.'],
 ['cutturn','Corte para trás e giro',['Cut Behind & Turn','Cut Behind Turn','Cut Behind And Turn','Puxada de letra'],'Recurso de giro curto para escapar da marcação.'],
 ['gklow','Lançamento rasteiro de goleiro',['GK Low Punt','Lançamento rasteiro de goleiro'],'Ajuda a repor a bola rapidamente em zonas mais baixas.'],
 ['gkhigh','Lançamento alto de goleiro',['GK High Punt','Lançamento alto de goleiro'],'Amplia a reposição com os pés quando o passe curto não é seguro.'],
 ['gklong','Lançamento longo de goleiro',['GK Long Throw','Lançamento longo de goleiro'],'Permite iniciar jogadas com lançamentos manuais longos.'],
 ['gkpenalty','Defesa de pênalti',['GK Penalty Saver','Defesa de pênalti'],'Adiciona recurso nas cobranças de pênalti.'],
 ['captain','Capitão',['Captaincy','Liderança','Capitão'],'Contribui com o papel de liderança da equipe.'],
 ['supersub','Super reserva',['Super Sub','Super-sub','Super reserva'],'Alternativa para quem normalmente entra na segunda etapa.']
];
const SKILLS=Object.fromEntries(ENTRIES.map(x=>[x[0],Object.freeze({key:x[0],name:x[1],aliases:x[2],why:x[3]})]));
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliasMap=new Map;
for(const e of ENTRIES)for(const alias of [e[1],...e[2]])aliasMap.set(normal(alias),e[0]);
// Alias adicionais derivados das grafias portuguesas encontradas nos prints eFHUB.
for(const [raw,key] of Object.entries({
 'chute de primeira':'firstshot','chute de longe':'longshot','precisao a distancia':'longshot',
 'efeito de longe':'curler','cabeçada':'heading','cabecada':'heading',
 'afastamento acrobatico':'clear','reposicao alta do go':'gkhigh',
 'arremesso longo do go':'gklong','pegador de penaltis':'gkpenalty',
 'comandante da defesa go':'captain','controle com a sola':'sole',
 'passe de primeira':'onepass','passe em profundidade':'through',
 'passe a rasgar':'through','bloqueador':'blocker',
 'superioridade aerea':'aerial','interceptacao':'intercept'

}))if(!aliasMap.has(normal(raw)))aliasMap.set(normal(raw),key);
const keyFor=s=>aliasMap.get(normal(s))||'';
const splitSkills=s=>Array.isArray(s)?s:String(s||'').split(/[;\n,]+/).map(x=>x.trim()).filter(Boolean);
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
function evaluate(d,tactic,manualEquipped){
 if(!['posse','normal','rapido'].includes(tactic))throw Error('Tática inválida');
 const role=roleOf(d);if(!role)return {role:null,recommendations:[],nativeKnown:false,missing:['Posição da carta não cadastrada']};
 const native=splitSkills(d.native_skills||d.habilidades_nativas);
 const nativeKnown=Boolean(native.length);
 const equipped=splitSkills(manualEquipped);
 const used=new Set([...native,...equipped].map(keyFor).filter(Boolean));
 const previous=splitSkills(d.additional_candidates||d.adicionais_candidatas);
 const prevSet=new Set(previous.map(keyFor).filter(Boolean));
 const style=normal([d.playing_style,d.attack_style,d.defence_style,d.estilo_ataque,d.estilo_defesa].filter(Boolean).join(' '));
 const pool=POOLS[role];const scorer=new Map;
 pool.forEach((key,i)=>scorer.set(key,200-i*10));
 const bump=(names,amount)=>names.forEach(k=>{if(scorer.has(k))scorer.set(k,scorer.get(k)+amount)});
 if(tactic==='posse')bump(['onepass','through','sole','double','heel','intercept','blocker'],22);
 if(tactic==='normal')bump(['intercept','fighting','weighted','blocker','through'],16);
 if(tactic==='rapido')bump(['through','firstshot','double','longshot','fighting','intercept'],18);
 if(/pivo|homem de area|target/.test(style))bump(['heading','aerial','onepass','heel'],34);
 if(/infiltr|puxa marcacao|arrastar defesa|matador|artilheiro|oportunista/.test(style))bump(['firstshot','through','onepass','acrobatic'],18);
 if(/armador|orquestrador|classico|criativo/.test(style))bump(['onepass','through','weighted','sole','heel'],23);
 if(/destruidor|primeiro volante|lateral defensivo|defensor criativo/.test(style))bump(['intercept','blocker','mark','onepass'],22);
 if(/versatil|todo o terreno/.test(style))bump(['fighting','onepass','intercept'],18);
 if(/goleiro ofensivo/.test(style))bump(['gklow','gklong'],25);
 // O histórico de sugestões genéricas não aumenta a nota da carta.
 // Prioridade depende apenas da função, da tática e do estilo, não do OVR.
 const ranked=[...scorer.entries()].filter(([key])=>!used.has(key)).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([key,score])=>({...SKILLS[key],score}));
 return {role,nativeKnown,knownNative:native.length,alreadyEquippedProvided:equipped.length,recommendations:ranked.slice(0,5),alternatives:ranked.slice(5,8),missing:nativeKnown?[]:['Habilidades nativas da edição não documentadas: confirme antes de gastar tokens.']};
}
function booster(d,tactic,engine,verifiedSlot){
 const value=String(d.boost2||d.impeto_extra||'');
 const status=engine?.slotStatus?engine.slotStatus(value):(/^SLOT SELECION[AÁ]VEL/i.test(value)?'selecionavel':'indefinido');
 const position=POSITION[d.role_used]?d.role_used:d.shown_position||d.role_used||d.posicao;
 const natural=String(d.boost1||d.impeto_fixo||'').replace(/\s*\+\d+.*/,'').trim();
 const extra=String(value).replace(/\s*\+\d+.*/,'').trim();
 const validBooster=s=>engine&&Object.keys(engine.BOOSTERS||{}).find(x=>normal(x)===normal(s));
 const knownExtra=validBooster(extra);
 const manual=verifiedSlot==='vazio'||verifiedSlot==='ocupado';
 const able=status!=='nome_registrado'&&verifiedSlot!=='ausente'&&(status==='selecionavel'||status==='possivel'||manual);
 const existing=knownExtra||'';
 let ranked=[];
 if(engine&&typeof engine.rank==='function'){
  try{ranked=engine.rank({posicao:position,estilo_ataque:d.attack_style||d.estilo_ataque,estilo_defesa:d.defence_style||d.estilo_defesa,impeto_fixo:d.boost1||d.impeto_fixo},tactic).filter(x=>normal(x.nome)!==normal(natural)&&normal(x.nome)!==normal(existing));}catch(e){ranked=[]}
 }
 const note=verifiedSlot==='ausente'?'Você marcou esta carta como sem slot selecionável neste dispositivo. Nenhum ímpeto novo será recomendado.':
 status==='nome_registrado'?'Segundo ímpeto já nomeado no cadastro; não tratar como slot livre ou substituível.':
 verifiedSlot==='ocupado'?'Você confirmou slot ocupado. A opção abaixo é apenas comparação, nunca substituição automática.':
 verifiedSlot==='vazio'?'Você confirmou slot vazio neste dispositivo; confira o bônus final antes de gastar tokens.':
 able?'Slot selecionável indicado no catálogo; confirmação no Plano de Jogo ainda necessária.':
 'Não existe prova documental suficiente de um slot selecionável. Confira no jogo antes de aplicar tokens.';
 // O ranking da carta deve existir independentemente da disponibilidade do slot.
 // "primary" é uma prioridade competitiva, NÃO algo equipado ou autorizado.
 return {status,verifiedSlot,able,knownExtra:existing,natural,primary:ranked[0]||null,alternatives:ranked.slice(1,3),note,
  confidence:engine&&ranked.length?'heuristica_funcao_estilo_posse_sem_testes_de_partida':'sem_base_para_ranquear',
  equipStatus:verifiedSlot==='ausente'?'impossivel_na_conta':status==='nome_registrado'?'comparacao_segundo_fixo':able?'condicionado_a_slot':'slot_nao_verificado'};
}
const USER_SLOT_NOTES=Object.freeze({
 24:'Cristiano Ronaldo Big Time #024: o usuário relata dois ímpetos embutidos, sem edição; preservar ambos.',
 81:'Rivaldo Big Time #081: o usuário relata um único ímpeto fixo; o nome ainda precisa de validação na carta.',
 172:'Courtois #172: o usuário relata um espaço selecionável; o banco não confirma o slot. Conferir no jogo.',
 236:"Eto'o #236: o usuário relata ímpeto fixo e outro selecionável; nome e edição seguem pendentes."
});
const api={SKILLS,ENTRIES,POSITION,POOLS,keyFor,roleOf,evaluate,booster,USER_SLOT_NOTES};
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
document.head.appendChild(css);
const section=document.createElement('section');section.id='scout-v162';section.setAttribute('aria-label','Recomendações de habilidades e ímpetos por carta');
section.innerHTML='<div class="v162-meta">SCOUT PRO · OTIMIZAÇÃO COMPETITIVA V162</div><h2>Habilidades adicionais e melhor ímpeto</h2><p>Recomendações por edição, função, estilo e tática. A prioridade é o desempenho em campo, não o Overall.</p>'+
'<div class="v162-modes" role="group" aria-label="Estilo tático"><button type="button" data-tactic="posse" aria-pressed="true">Posse de Bola</button><button type="button" data-tactic="normal" aria-pressed="false">Contra-Ataque Normal</button><button type="button" data-tactic="rapido" aria-pressed="false">Contra-Ataque Rápido</button></div>'+
'<div class="v162-panels"><article class="v162-panel"><h3>5 habilidades adicionais · prioridade na Posse</h3><p id="v162-skills-status"></p><ol class="v162-list" id="v162-skills"></ol><p id="v162-alts"></p></article><article class="v162-panel"><h3>Ímpetos fixos / adicionais</h3><div id="v162-source"></div><div id="v162-booster"></div></article></div>'+
'<details><summary>Opcional: informar habilidades já equipadas para refinar a lista</summary><p>Opcional. Separe os nomes por ponto e vírgula. Este registro fica apenas neste dispositivo; não modifica a carta do jogo.</p><textarea id="v162-equipped" aria-label="Habilidades adicionais já equipadas" placeholder="Ex.: Passe de primeira; Toque duplo"></textarea><button id="v162-save" type="button">Salvar e recalcular</button><p id="v162-feedback" aria-live="polite"></p></details>'+
'<p class="v162-foot">Recomendações teóricas baseadas nas habilidades registradas, no estilo e na função da carta. Não são testes comprovados em partidas; verifique habilidades nativas, compatibilidade e slot antes de usar tokens. Nenhuma escolha é aplicada automaticamente.</p>';
// V192: as cinco habilidades passam a integrar a ficha principal, sem duplicar a lista.
const unified=container.querySelector('#scout-v188-principal');
const skillsAnchor=unified?.querySelector('.scout-v188-body');
if(unified&&skillsAnchor){
 skillsAnchor.insertAdjacentElement('beforebegin',section);
 unified.classList.add('scout-v192-unified-skills');
}else{
 const after=container.querySelector('#scout-card-navigator')||container.querySelector('.detail-header')||container.querySelector('.mobile-profile');
 if(after)after.insertAdjacentElement('afterend',section);else container.prepend(section);
}
const side=document.querySelector('.side-nav');if(side){const link=document.createElement('a');link.href='#scout-v162';link.textContent='★ Habilidades e ímpetos PRO';side.prepend(link)}
const storage='scoutpro:v162:equipped:'+String(d.capture)+':'+String(d.id||'unknown');
let extra='';try{extra=localStorage.getItem(storage)||''}catch(e){}
const ta=section.querySelector('#v162-equipped');ta.value=extra;
let tactic='posse';
function draw(){
 let manuallyVerified={};
 try{const val=JSON.parse(localStorage.getItem('scoutpro:v103:booster:'+Number(d.capture))||'null');if(val&&String(val.card_id)===String(d.id))manuallyVerified=val}catch(e){}
 const result=evaluate(d,tactic,extra);
 const boost=booster(d,tactic,host.SCOUT_BOOSTERS_V103,manuallyVerified.status);
 const remaining=Math.max(0,5-result.alreadyEquippedProvided);
 const proposed=result.recommendations.slice(0,remaining);
 section.querySelectorAll('[data-tactic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tactic===tactic)));
 section.querySelector('#v162-skills-status').textContent='Nativas catalogadas: '+result.knownNative+' · Adicionais informadas: '+result.alreadyEquippedProvided+'/5 · Vagas a planejar: '+remaining+'. '+(result.nativeKnown?'Ordem calculada para função e tática, excluindo nativas e adicionais informadas.':'EDIÇÃO SEM NATIVAS AUTENTICADAS: sugestões provisórias; não gaste tokens sem conferir.');
 const ul=section.querySelector('#v162-skills');ul.replaceChildren();
 for(const s of proposed){const li=document.createElement('li'),b=document.createElement('strong'),p=document.createElement('p');b.textContent=s.name;p.textContent=s.why;li.append(b,p);ul.appendChild(li)}
 for(let i=proposed.length;i<remaining;i++){
  const li=document.createElement('li');li.textContent='Vaga '+(result.alreadyEquippedProvided+i+1)+'/5 · Sem habilidade adicional segura nesta base; confirmar compatibilidade e skills atuais antes de preencher.';ul.appendChild(li);
 }
 if(!remaining){const li=document.createElement('li');li.textContent='Os cinco espaços adicionais já foram informados por você; confira no jogo.';ul.appendChild(li)}
 section.querySelector('#v162-alts').textContent='Prioridades por função, não instalação automática. '+(result.alternatives.length?'Alternativas: '+result.alternatives.map(x=>x.name).join(' · ')+'.':'Confira disponibilidade e compatibilidade no jogo.');
 const source=section.querySelector('#v162-source');source.replaceChildren();
 const line=(value)=>{const p=document.createElement('p');p.textContent=value;source.appendChild(p)};
 line('Ímpeto de fábrica: '+String(d.boost1||'não documentado'));
 line('Segundo ímpeto no acervo: '+String(d.boost2||'não documentado'));
 const named=boost.status==='nome_registrado';
 const verifiedLabel=({vazio:'Slot vazio confirmado por você',ocupado:'Slot ocupado confirmado por você',ausente:'Sem slot, conforme sua conferência',pendente:'Verificação pendente'})[manuallyVerified.status]||'Ainda não conferido neste dispositivo';
 line('Estado de sua conta: '+verifiedLabel+(manuallyVerified.equipped?' · '+manuallyVerified.equipped:''));
 if(USER_SLOT_NOTES[Number(d.capture)])line('Relato seu (a confirmar na tela do jogo): '+USER_SLOT_NOTES[Number(d.capture)]);
 const panel=section.querySelector('#v162-booster');panel.replaceChildren();
 const title=document.createElement('p');title.style.fontWeight='800';title.textContent=boost.primary?'Melhor ímpeto sugerido para '+(tactic==='posse'?'Posse de Bola':tactic==='normal'?'Contra-Ataque Normal':'Contra-Ataque Rápido')+': '+boost.primary.nome+' +1':'Sem ímpeto calculável para esta função';panel.appendChild(title);
 const applicability=document.createElement('p');applicability.style.fontWeight='700';
 applicability.textContent=boost.equipStatus==='impossivel_na_conta'?'Sua conferência indica que esta carta não possui slot: a escolha é somente comparativa.':
 boost.equipStatus==='comparacao_segundo_fixo'?'Há segundo ímpeto fixo registrado: esta é apenas a melhor alternativa teórica, não uma opção para substituir.':
 boost.equipStatus==='condicionado_a_slot'?'Indicação para o segundo slot, somente se estiver realmente disponível e não comprometido.':
 'Recomendação pronta; falta confirmar se esta edição possui segundo slot selecionável. Não exige que você insira um ímpeto para descobrir qual seria o melhor.';
 panel.appendChild(applicability);
 if(boost.primary){const why=document.createElement('p');why.textContent='Por quê nesta função: '+boost.primary.motivo+' (priorização heurística, não resultado medido em partidas).';panel.appendChild(why);const atr=document.createElement('p');atr.textContent='Atributos associados: '+boost.primary.atributos.join(', ')+'.';panel.appendChild(atr);if(boost.alternatives.length){const alt=document.createElement('p');alt.textContent='Alternativas: '+boost.alternatives.map(x=>x.nome).join(' / ')+'.';panel.appendChild(alt)}}
 const note=document.createElement('p');note.className='v162-note';note.textContent=boost.note;panel.appendChild(note);
 const jump=document.createElement('a');jump.href='../revisao-impetos-v103.html?c='+Number(d.capture);jump.textContent='Confirmar o slot, o ímpeto equipado e as opções desta carta ↗';jump.style.color='#8dd8f7';jump.style.fontWeight='700';panel.appendChild(jump);
}
section.querySelectorAll('[data-tactic]').forEach(b=>b.addEventListener('click',()=>{tactic=b.dataset.tactic;draw()}));
section.querySelector('#v162-save').addEventListener('click',()=>{extra=ta.value.trim().slice(0,700);try{localStorage.setItem(storage,extra);section.querySelector('#v162-feedback').textContent='Registro salvo neste dispositivo; recomendações recalculadas.'}catch(e){section.querySelector('#v162-feedback').textContent='Sem permissão para salvar neste dispositivo.'}draw()});
draw();
})(typeof window!=='undefined'?window:null);
