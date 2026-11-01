/* Geometrias do time; identidade do desenho independe do nome e dos jogadores. */
(function(w,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;if(w)w.CRAQUE_FORMATIONS_V382=a;})(typeof window!=='undefined'?window:null,function(){'use strict';
const POS=['GO','ZG','LE','LD','VOL','MLG','MLE','MLD','MAT','PTE','PTD','SA','CA'];
const points=(slots,mirror=false)=>(slots||[]).map(s=>[Math.round((mirror?100-s.x:s.x)*100)/100,Math.round(s.y*100)/100]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
function signature(p){const pair=mirror=>JSON.stringify([points(p.slots,mirror),points(p.offBallSlots||p.slots,mirror)]);return [pair(false),pair(true)].sort()[0];}
function match(left,right,mirror,tolerance){
 if(!Array.isArray(left)||!Array.isArray(right)||left.length!==right.length)return false;
 const candidates=left.map(s=>right.flatMap((r,j)=>Math.abs(s.x-(mirror?100-r.x:r.x))<=tolerance&&Math.abs(s.y-r.y)<=tolerance?[j]:[]));
 if(candidates.some(c=>!c.length))return false;const order=candidates.map((_,i)=>i).sort((a,b)=>candidates[a].length-candidates[b].length);
 const visit=(depth,used)=>depth===order.length||candidates[order[depth]].some(i=>!used.has(i)&&visit(depth+1,new Set([...used,i])));
 return visit(0,new Set());
}
function equivalent(a,b,tolerance=5){return [false,true].some(m=>match(a.slots,b.slots,m,tolerance)&&match(a.offBallSlots||a.slots,b.offBallSlots||b.slots,m,tolerance));}
function validate(p){const errors=[];
 if(!p?.id||!Array.isArray(p.slots)||p.slots.length!==11)return ['Desenho precisa de11vagas.'];
 for(const [phase,slots] of [['Com bola',p.slots],['Sem bola',p.offBallSlots||p.slots]]){
  if(slots.length!==11||new Set(slots.map(s=>s.id)).size!==11||slots.filter(s=>s.position==='GO').length!==1){errors.push(phase+': vagas/GO inválidos');continue;}
  for(const s of slots){
   if(!POS.includes(s.position)||![s.x,s.y].every(n=>Number.isFinite(n)&&n>=10&&n<=90&&n%10===0))errors.push(phase+': posição fora da grade');
   if(s.position==='GO'&&(s.x!==50||s.y!==90))errors.push(phase+': GO fora da zona');
   if(s.position!=='GO'&&s.y>80)errors.push(phase+': jogador na zona do goleiro');
   const zones={ZG:[50,80],LD:[40,80],LE:[40,80],VOL:[40,70],MLG:[30,70],MLE:[30,70],MLD:[30,70],MAT:[20,50],SA:[10,40],CA:[10,40],PTE:[10,40],PTD:[10,40]};
   if(zones[s.position]&&(s.y<zones[s.position][0]||s.y>zones[s.position][1]))errors.push(phase+': função fora da zona');
  }
  for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++)if(Math.hypot(slots[i].x-slots[j].x,slots[i].y-slots[j].y)<10)errors.push(phase+': vagas sobrepostas');
 }
 if(p.offBallSlots&&p.slots.some(s=>!p.offBallSlots.some(o=>o.id===s.id)))errors.push('As fases precisam das mesmas vagas.');
 return [...new Set(errors)];
}
function eligible(p,style){return style!=='posse'||[...p.slots,...(p.offBallSlots||[])].every(s=>!['PTE','PTD','MLE','MLD'].includes(s.position));}
return Object.freeze({POS,signature,equivalent,validate,eligible});
});
