(()=>{'use strict';
const target=document.querySelector('.profile-content'),s=document.getElementById('scout-v68-data'),ls=document.getElementById('lab-data');
if(!target||!s||!ls||document.getElementById('scout-v74'))return;
let d,l;try{d=JSON.parse(s.textContent);l=JSON.parse(ls.textContent)}catch(e){console.warn('Scout V74: dados inválidos');return}
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const pmap={AC:'CA',CA:'CA',SA:'SA',PTD:'PTD',PTE:'PTE',MO:'MAT',MAT:'MAT',MLD:'MLD',MLE:'MLE',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DD:'LD',LD:'LD',DE:'LE',LE:'LE',ZC:'ZG',DC:'ZG',ZG:'ZG',GR:'GO',GO:'GO'};
const position=pmap[d.shown_position]||pmap[d.role_used]||'MLG', style=String(d.playing_style||(d.attack_style==='Básico'?d.defence_style:d.attack_style)||'Não confirmado');
const styleDisplay=d.dual_playing_style?d.attack_style+' (ataque) / '+d.defence_style+' (defesa)':d.style_conflict?'Conflito de cadastro: '+[d.attack_style,d.defence_style].join(' / ')+' — conferir no jogo':style;
const roles={
CA:['Tabelar no corredor central e atacar o espaço entre zagueiros.','Ruptura por dentro após recuperação, procurando passe curto ou finalização.','Finalização, Destreza, Força das pernas','CA + SA/MAT com apoio próximo','finalizações no alvo, tabelas completadas, perdas sob pressão'],
SA:['Apoiar o CA entre as linhas; fazer a parede, triangular e infiltrar.','Dar sequência ao segundo passe e atacar a área após a devolução.','Passe, Drible, Destreza','CA de perfil complementar','passes que rompem linhas, infiltrações e criação de chances'],
PTD:['Oferecer largura direita quando necessário e buscar passes por dentro, sem depender de cruzamentos.','Acelerar no espaço pela direita e servir um passe rasteiro ao centro.','Drible, Destreza, Força das pernas','LD de cobertura e MAT próximo','passes progressivos, perdas e apoios úteis'],
PTE:['Oferecer largura esquerda e conexão interna, evitando cruzamentos forçados.','Acelerar no espaço pela esquerda e encontrar o CA com passe rasteiro.','Drible, Destreza, Força das pernas','LE de cobertura e MAT próximo','passes progressivos, perdas e apoios úteis'],
MAT:['Receber entre linhas, acelerar tabelas e criar superioridade central.','Receber o primeiro passe vertical e apoiar a infiltração seguinte.','Passe, Drible, Destreza','VOL de segurança e CA/SA à frente','passes entrelinhas, chances criadas e perdas no meio'],
MLD:['Aproximar-se de MLG e MAT pelo lado direito; manter triangulação.','Apoiar transição direita sem abandonar recomposição.','Passe, Drible, Força das pernas','LD com compensação e MLG interno','apoios, passes e recuperações'],
MLE:['Aproximar-se de MLG e MAT pelo lado esquerdo; priorizar conexão curta.','Apoiar transição esquerda sem perder cobertura.','Passe, Drible, Força das pernas','LE com compensação e MLG interno','apoios, passes e recuperações'],
MLG:['Ser opção constante para passes curtos, girar a posse e conectar MAT e VOL.','Oferecer segundo passe após a recuperação, protegendo o centro.','Passe, Drible, Destreza','VOL protetor e MAT entrelinhas','passes certos sob pressão, recuperações e saídas limpas'],
VOL:['Proteger a frente dos zagueiros, apoiar saída de bola e evitar perdas no centro.','Neutralizar contra-ataque e iniciar transição com passe simples.','Defesa, Passe, Jogo aéreo','MLG de apoio e ZG de saída','interceptações, coberturas e passes seguros'],
LD:['Dar saída curta pela direita; medir a subida e a proteção às costas.','Contenção no corredor direito e apoio no momento oportuno.','Defesa, Força das pernas, Passe','ZG direito e meio-campista de compensação','duelos, bolas nas costas e passe curto'],
LE:['Dar saída curta pela esquerda; medir a subida e a proteção às costas.','Contenção no corredor esquerdo e apoio no momento oportuno.','Defesa, Força das pernas, Passe','ZG esquerdo e meio-campista de compensação','duelos, bolas nas costas e passe curto'],
ZG:['Sair jogando pelo chão sem expor a profundidade; dividir cobertura com o parceiro.','Proteger espaço nas costas e recomeçar com passe seguro.','Defesa, Jogo aéreo, Força das pernas','outro ZG de função complementar e VOL','duelos, profundidade protegida e saídas limpas'],
GO:['Construir saída curta de forma segura, conforme sua linha defensiva.','Decidir quando sair e repor rápido sem oferecer posse ao rival.','Goleiro 1, Goleiro 2, Goleiro 3','ZG e VOL como primeira linha de passe','defesas difíceis, posicionamento e reposições certas']};
const r=roles[position];const st=norm(style);
let styleAdvice=d.style_conflict?'Esta ficha contém estilos incompatíveis. Confira a carta no jogo antes de definir a função ou o treino.':'Confirme em qual posição este estilo realmente ativa no Plano de Jogo; não presuma ativação fora da posição compatível.';
if(d.dual_playing_style)styleAdvice='Ao atacar, avalie a saída de bola e o apoio por baixo. Ao defender, avalie os duelos e as antecipações do Destruidor, sempre com cobertura. Confirme a ativação em cada fase no Plano de Jogo.';
else if(!d.style_conflict&&/orquestrador/.test(st))styleAdvice='Observe a circulação e a disponibilidade para passe, não apenas infiltrações.';
else if(!d.style_conflict&&/infiltr|surpresa/.test(st))styleAdvice='Meça as infiltrações e a qualidade do apoio para devolver passes curtos.';
else if(!d.style_conflict&&/destruidor/.test(st))styleAdvice='Antecipar só com cobertura: compare duelos ganhos e bolas nas costas.';
else if(!d.style_conflict&&/defensor criativo|construcao/.test(st))styleAdvice='Priorize passes na saída sem perder proteção de profundidade.';
else if(!d.style_conflict&&/primeiro volante|trinco/.test(st))styleAdvice='Proteja o centro e simplifique o primeiro passe.';
else if(!d.style_conflict&&/artilheiro|oportunista|matador|homem de area/.test(st))styleAdvice='Avalie oportunidades criadas para finalizar e qualidade dos desmarques.';
else if(!d.style_conflict&&/armador|classico/.test(st))styleAdvice='Avalie participação entrelinhas e geração de passes claros.';
else if(!d.style_conflict&&/lateral ofensivo|lateral atacante|ala produtivo/.test(st))styleAdvice='Apoie o ataque sem perder cobertura do seu corredor.';
const native=d.has_native_skills?String(d.native_skills||'').split(';').map(x=>x.trim()).filter(Boolean):[];
const candidates=(Array.isArray(d.additional_candidates)?d.additional_candidates:[]).filter(x=>!native.some(y=>norm(x)===norm(y))).slice(0,5);
const verifiedID=/^\d{8,}$/.test(String(d.id||'')),pp=Number.isInteger(d.pp)&&d.pp>=0?d.pp:null;
const cost=v=>v.reduce((sum,n)=>{for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);return sum},0);
const valid=v=>Array.isArray(v)&&v.length===10&&v.every(x=>Number.isInteger(x)&&x>=0&&x<=20);
const plans=Object.fromEntries(['A','B','C','P'].filter(k=>valid(l[k])).map(k=>[k,l[k]]));
if(Object.keys(plans).length===0&&pp!==null&&valid(l.draftA)&&cost(l.draftA)===pp)plans.P=l.draftA;
const preferred=plans[d.recommended_scenario]?d.recommended_scenario:Object.keys(plans)[0];
const allValid=pp!==null&&preferred&&cost(plans[preferred])===pp&&!d.pp_estimated;
const missing=[];
if(!verifiedID)missing.push('Card ID da edição');
if(pp===null)missing.push('PP e nível máximo');
if(!native.length)missing.push('habilidades nativas e adicionais');
if(!d.base_stats_known)missing.push('atributos-base');
const hasBoost=x=>typeof x==='string'&&!/pendente|n[aã]o confirmad|n[aã]o exibido|n[aã]o inferido/i.test(x)&&x.trim();
if(!hasBoost(d.boost1))missing.push('primeiro ímpeto');
if(!hasBoost(d.boost2))missing.push('segundo ímpeto ou existência do slot');
const rows=Object.entries(plans).map(([k,v])=>'<tr><th>'+escape(k+(k===preferred?' ★':''))+'</th><td>'+cost(v)+' / '+(pp===null?'?':pp)+'</td><td>'+(pp===null?'PP pendente':cost(v)===pp?'Custo conferido':'Conferir orçamento')+'</td></tr>').join('');
let comparison='Sem dois cenários para comparar.';
if(preferred&&Object.keys(plans).length>1&&pp!==null){
 const other=Object.keys(plans).find(k=>k!==preferred&&cost(plans[k])<=pp);
 if(other){const delta=plans[preferred].map((n,i)=>({category:l.categories?.[i]||String(i),difference:n-plans[other][i]})).filter(x=>x.difference);
 comparison='Cenário '+preferred+' versus '+other+': '+delta.map(x=>x.category+' '+(x.difference>0?'+':'')+x.difference).join(' · ')+'. São diferenças de níveis, não resultado em campo.';}
}
const mark=(text,okay)=>'<span class="v74-chip '+(okay?'ok':'wait')+'">'+escape(text)+'</span>';
const out=document.createElement('section');out.className='v74-engine';out.id='scout-v74';
out.innerHTML='<header><small>PERFORMANCE ENGINE V74 · POR EDIÇÃO E FUNÇÃO</small><h2>'+escape(d.name||l.name)+' · '+escape(position)+'</h2><p>'+escape(styleDisplay)+' · '+escape(d.edition||'Edição a confirmar')+'</p>'+mark(allValid?'PP conferidos':'Evidência parcial',allValid)+mark(d.base_stats_known?'Base disponível':'Base não documentada',d.base_stats_known)+'</header>'+
 '<div class="v74-controls"><button type="button" data-mode="posse">Posse de Bola</button><button type="button" data-mode="contra">Contra-ataque</button></div>'+
 '<article class="v74-highlight"><h3>Função em campo</h3><p id="v74-mode-text"></p><p><b>Estilo registrado:</b> '+escape(styleAdvice)+'</p><p><b>Parceiros por função:</b> '+escape(r[3])+'.</p><p><b>Indicadores de teste:</b> '+escape(r[4])+'.</p></article>'+
 '<div class="v74-grid"><article><h3>01 · PP e treinamento</h3><p>'+(pp===null?'Sem orçamento confirmado: não aplicar distribuição numérica.':'Orçamento registrado: '+pp+' PP.')+'</p>'+
 (rows?'<table><thead><tr><th>Build</th><th>PP</th><th>Auditoria</th></tr></thead><tbody>'+rows+'</tbody></table>':'<p>Nenhum plano numérico verificável cadastrado.</p>')+
 '<p>'+escape(comparison)+'</p><p><b>Atributos prioritários para verificar:</b> '+escape(r[2])+'. Não são níveis obrigatórios.</p>'+
 (d.base_stats_known?'<p>Use o <a href="#performance">Laboratório PRO</a> para comparar os subtotais condicionais de atributos desta edição.</p>':'<p>Sem base numérica confiável, não atribuir valores finais aos atributos.</p>')+'</article>'+
 '<article><h3>02 · Habilidades e ímpetos</h3><p><b>Habilidades nativas registradas:</b> '+escape(native.length?native.join(' · '):'pendentes')+'.</p>'+
 '<p><b>Candidatas para avaliar, não equipadas:</b> '+escape(candidates.length?candidates.join(' · '):'sem sugestão verificável')+'. Conferir as 5 habilidades adicionais antes de aplicar.</p>'+
 '<p><b>Ímpeto 1:</b> '+escape(hasBoost(d.boost1)?d.boost1:'não confirmado')+'.</p>'+
 '<p><b>Ímpeto 2:</b> '+escape(hasBoost(d.boost2)?d.boost2:'não confirmado')+'.</p><p>Não somar ímpetos ou habilidades ausentes; OVR mais alto não garante mais rendimento.</p></article>'+
 '<article><h3>03 · Teste competitivo</h3><ol><li>Mantenha técnico, parceiros e formação iguais entre cenários.</li><li>Compare ao menos 5 partidas por build.</li><li>Registre '+escape(r[4])+'.</li><li>Escolha por rendimento real, não por Overall.</li></ol><p>Registre resultados no <a href="#performance">Laboratório PRO</a>.</p></article>'+
 '<article><h3>04 · O que falta confirmar</h3><p>'+mark(verifiedID?'Card ID documentado':'Card ID pendente',verifiedID)+mark(native.length?'Skills registradas':'Skills pendentes',native.length>0)+'</p>'+
 (missing.length?'<ul>'+missing.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul>':'<p>Dados de ficha cadastrados; conferir condição, técnico e atributos no Plano de Jogo.</p>')+
 '<p>Subtotais não equivalem a status completos em campo.</p></article></div>'+
 '<footer>Metodologia visual baseada nos dois vídeos fornecidos, não em transcrição completa de áudio nem em testes físicos atribuídos aos autores. Dados faltantes ficam pendentes.</footer>';
const head=target.querySelector('.detail-header');if(head)head.insertAdjacentElement('afterend',out);else target.prepend(out);
const sidebar=document.querySelector('.side-nav');if(sidebar){const a=document.createElement('a');a.href='#scout-v74';a.textContent='V74 · Análise competitiva';sidebar.prepend(a)}
const key='scoutpro:v74:modo:'+String(d.id)+':'+String(d.capture);
let mode='posse';try{if(localStorage.getItem(key)==='contra')mode='contra'}catch(e){}
const render=()=>{out.querySelector('#v74-mode-text').textContent=mode==='posse'?r[0]:r[1];out.querySelectorAll('[data-mode]').forEach(b=>{const selected=b.dataset.mode===mode;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected?'true':'false')})};
out.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;try{localStorage.setItem(key,mode)}catch(e){}render()}));render();
})();