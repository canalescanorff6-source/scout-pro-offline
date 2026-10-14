/* Scout PRO V160 — validated PP costs, candidate functional training, no fake match evidence. */
(function(host){
'use strict';
const names=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
const one=n=>{let sum=0;for(let j=0;j<n;j++)sum+=1+Math.floor(j/4);return sum};
const valid=v=>Array.isArray(v)&&v.length===10&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
const cost=v=>valid(v)?v.reduce((sum,n)=>sum+one(n),0):null;
const same=(a,b)=>valid(a)&&valid(b)&&a.every((x,i)=>x===b[i]);
const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const posmap={AC:'CA',ZC:'ZG',DC:'ZG',MC:'MLG',MDF:'VOL',DE:'LE',DD:'LD',GR:'GO',MO:'MAT'};
const roles={
CA:'Finalizar após tabelas e atacar os intervalos centrais, conforme o desmarque real.',
SA:'Conectar CA/MAT com devoluções curtas, movimento entrelinhas e infiltrações.',
MAT:'Criar chances com passes entrelinhas, tabelas e domínio sob pressão.',
MLG:'Distribuir passe curto com proteção do centro e aproximação constante.',
VOL:'Proteger a defesa, recuperar bolas e iniciar passes seguros pelo centro.',
ZG:'Vencer duelos e proteger profundidade sem renunciar à saída curta.',
LD:'Cobrir a profundidade, apoiar por baixo e escolher subidas sem expor a defesa.',
LE:'Cobrir a profundidade, apoiar por baixo e escolher subidas sem expor a defesa.',
GO:'Priorizar posicionamento, reflexos e reposições seguras conforme o time.',
PTD:'Buscar associação por dentro, sem depender de cruzamentos.',
PTE:'Buscar associação por dentro, sem depender de cruzamentos.',
MLD:'Apoiar o corredor interno com triangulações e recomposição.',
MLE:'Apoiar o corredor interno com triangulações e recomposição.'
};
function evaluate(d,l,engine){
 if(!d||!l||!Number.isInteger(d.pp)||d.pp<0||valid(d.recommended_levels))return null;
 if(!valid(l.draftA)||cost(l.draftA)!==d.pp)return {ok:false,reason:'A distribuição não corresponde aos PP cadastrados'};
 const pos=posmap[d.shown_position]||d.role_used||d.shown_position;
 const a={name:'A · Posse central',levels:l.draftA.slice(),tactic:'posse',origin:'Treino funcional cadastrado na ficha (V95)'};
 let b=null;
 if(d.pp>0&&engine&&typeof engine.proposal==='function'){
  for(const t of ['posse','normal']){
   const suggestion=engine.proposal({pp:d.pp,posicao:d.shown_position,estilo_ataque:d.attack_style},t);
   if(suggestion.ok&&valid(suggestion.levels)&&cost(suggestion.levels)===d.pp&&!same(a.levels,suggestion.levels)){
    b={name:t==='posse'?'B · Variação para Posse':'B · Contra-Ataque Normal',levels:suggestion.levels.slice(),tactic:t,origin:'Cenário alternativo por função (V98)'};break;
   }
  }
 }
 const native=String(d.native_skills||'').split(';').map(x=>x.trim()).filter(Boolean);
 const skillConfirmed=Boolean(d.has_native_skills&&native.length);
 const unresolved=[];
 if(!d.base_stats_known)unresolved.push('Atributos-base pendentes: não estimar status finais da carta.');
 if(!skillConfirmed)unresolved.push('Habilidades nativas incompletas: conferir no jogo.');
 if(!/^\d{8,16}$/.test(String(d.id||'')))unresolved.push('Card ID exato da edição pendente.');
 if(/pendente|n[aã]o confirmad|slot selecion[aá]vel/i.test(String(d.boost2||'')))unresolved.push('Segundo ímpeto não confirmado: bônus não contabilizado.');
 if(d.style_conflict)unresolved.push('Estilo conflitante: verificar ativação correta na posição.');
 return {ok:true,cap:d.capture,name:d.name,pp:d.pp,role:pos,
   style:d.dual_playing_style?d.attack_style+' (ataque) / '+d.defence_style+' (defesa)':d.playing_style||d.attack_style||'A confirmar',
   boost:d.boost1||'não confirmado',native,skillConfirmed,unresolved,a,b,
   purpose:roles[pos]||'Avaliar passes curtos, triangulações, cobertura e desempenho na função.',
   status:d.pp===0?'0 PP confirmados — sem distribuição':'Treino funcional calculado — PP conferidos',
   performanceValidated:false,overallTarget:false};
}
const API={names,one,cost,valid,same,evaluate};
if(typeof module==='object'&&module.exports)module.exports=API;
if(!host||typeof document==='undefined')return;
const ds=document.getElementById('scout-v68-data'),ls=document.getElementById('lab-data'),target=document.querySelector('.profile-content');
if(!ds||!ls||!target||document.getElementById('scout-training-v160'))return;
let d,l;try{d=JSON.parse(ds.textContent);l=JSON.parse(ls.textContent)}catch(e){return}
const r=evaluate(d,l,host.SCOUT_TACTICS_V98);if(!r||!r.ok)return;
const table=plan=>{
 if(!plan)return '<p>Sem segunda distribuição distinta com PP corretos.</p>';
 return '<div class="v160-overflow"><table><thead><tr><th>Categoria</th><th>Nível</th><th>PP</th></tr></thead><tbody>'+
   plan.levels.map((x,i)=>'<tr><td>'+safe(names[i])+'</td><td>'+x+'</td><td>'+one(x)+'</td></tr>').join('')+
   '</tbody><tfoot><tr><th>Total</th><th>—</th><th>'+cost(plan.levels)+' / '+r.pp+'</th></tr></tfoot></table></div>'+
   '<p class="v160-note">'+safe(plan.origin)+' · custo conferido, rendimento ainda não comprovado.</p>';
};
const section=document.createElement('section');section.id='scout-training-v160';section.className='v160-sheet';
section.innerHTML='<header><small>SCOUT PRO · FICHA FUNCIONAL V160</small><h2>Treino por função · '+safe(r.name)+'</h2>'+
 '<b class="v160-badge">'+safe(r.status)+'</b><p>Orçamento matematicamente correto não equivale à melhor build em partidas. Nenhum atributo final foi calculado a partir do Overall.</p></header>'+
 '<div class="v160-metrics"><div><small>PP disponíveis</small><strong>'+r.pp+'</strong></div><div><small>Função</small><strong>'+safe(r.role)+'</strong></div><div><small>Distribuições</small><strong>'+(r.b?2:1)+'</strong></div></div>'+
 '<article><h3>Como jogar em Posse de Bola</h3><p>'+safe(r.purpose)+'</p><p><b>Estilo:</b> '+safe(r.style)+'. <b>Ímpeto documentado:</b> '+safe(r.boost)+'.</p><p><b>Habilidades nativas:</b> '+safe(r.skillConfirmed?r.native.join(' · '):'pendentes, não inferidas')+'.</p></article>'+
 '<div class="v160-columns"><article><h3>'+safe(r.a.name)+'</h3>'+table(r.a)+(r.pp?'<button type="button" data-v160-plan="A">Carregar A no Laboratório</button>':'<p>Esta edição não possui PP para distribuir.</p>')+'</article>'+
 '<article><h3>'+(r.b?safe(r.b.name):'Cenário B')+'</h3>'+table(r.b)+(r.b?'<button type="button" data-v160-plan="B">Carregar B no Laboratório</button>':'')+'</article></div>'+
 '<article class="v160-proof"><h3>Validação competitiva ainda necessária</h3><p>Confira atributos-base, habilidades/ímpetos equipados, posição ativa do estilo e comportamento em campo. Compare no mínimo cinco partidas por treino com técnico, formação e adversários equivalentes.</p>'+
 (r.unresolved.length?'<ul>'+r.unresolved.map(s=>'<li>'+safe(s)+'</li>').join('')+'</ul>':'<p>O cadastro dispõe dos dados principais, mas não comprova rendimento sem testes.</p>')+
 '<a href="#performance">Acessar o Laboratório PRO ↓</a></article>';
const head=target.querySelector('.detail-header');
if(head)head.insertAdjacentElement('afterend',section);else target.prepend(section);
for(const b of section.querySelectorAll('[data-v160-plan]'))b.addEventListener('click',()=>{
 const plan=b.dataset.v160Plan==='A'?r.a:r.b;
 if(!plan||cost(plan.levels)!==r.pp)return;
 host.dispatchEvent(new CustomEvent('scoutpro:training-load-v160',{detail:{cap:r.cap,levels:plan.levels.slice(),scenario:plan.name}}));
 document.getElementById('performance')?.scrollIntoView({behavior:'smooth',block:'start'});
});
for(const slot of ['A','B']){
 const el=document.querySelector('.build-plan[data-plan="'+slot+'"]');
 if(el){const p=slot==='A'?r.a:r.b;el.innerHTML='<div class="v160-inline"><b>'+safe(p?p.name:'Alternativa indisponível')+'</b><p>PP conferidos; teste o rendimento na função, não pelo Overall.</p>'+table(p)+'</div>';}
}
})(typeof window!=='undefined'?window:null);
