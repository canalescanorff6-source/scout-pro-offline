/* Contexto conjunto: conta, técnico, onze jogadores, fases e instruções. Consulta pura. */
(function(w,f){const a=f(w);if(typeof module==='object'&&module.exports)module.exports=a;if(w)w.CRAQUE_TEAM_CONTEXT_V382=a;})(typeof window!=='undefined'?window:null,function(host){'use strict';
const get=(name,file)=>host?.[name]||(typeof module==='object'?require(file):null);
const A=()=>get('CRAQUE_ACCOUNTS_V382','./craque-accounts-v382.js'),Rules=()=>get('CRAQUE_FUNCTIONAL_RULES_V382','./craque-functional-rules-v382.js');
const MODES=Object.freeze({posse:'Posse de Bola',normal:'Contra-Ataque',rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Bola Longa',overload:'Sobreposição'});
const INSTRUCTIONS=Object.freeze({defensive:{label:'Defensivo',phase:'attack'},anchoring:{label:'Ancoragem',phase:'attack'},
 counter_target:{label:'Alvo de contra-ataque',phase:'defence'},man_marking:{label:'Marcação individual',phase:'defence',target:true},tight_marking:{label:'Marcação apertada',phase:'defence',target:true}});
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
function signature(x){const s=JSON.stringify(stable(x));let a=2166136261,b=5381;for(const c of s){a=Math.imul(a^c.charCodeAt(0),16777619);b=Math.imul(b,33)^c.charCodeAt(0);}return 'ctx382:'+s.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);}
const localKey=c=>c.accountId+'::'+(c.instanceId||c.id);
function physicalProof(card){return {schema:'CRAQUE_FUNCTIONAL_GROUPS_V382',accountId:card.accountId,localKey:localKey(card),cardId:String(card.cardId||''),edition:String(card.edition||''),mapping:'V376.GROUPS; GO1 inclui Salto'};}
function boosterProof(card){return {schema:'CRAQUE_DISTINCT_BOOSTER_SLOTS_V382',accountId:card.accountId,localKey:localKey(card),cardId:String(card.cardId||''),edition:String(card.edition||''),
 confirmedDistinctSlots:card.boosterSlotSupported===true&&card.fixedBoosters?.[0]?.verified===true&&card.extraBooster?.verified===true,
 slots:[{...card.fixedBoosters?.[0],slot:'fixed'},{...card.extraBooster,slot:'selectable'}]};}
function compile(options,cards){
 const {accountId,style,formation}=options||{};
 if(!['primary','secondary'].includes(accountId)||!Object.hasOwn(MODES,style))throw Error('Conta ou estilo inválido.');
 if(!formation?.id||!Array.isArray(formation.slots)||formation.slots.length!==11||new Set(formation.slots.map(s=>s.id)).size!==11)throw Error('Formação precisa de11vagas distintas.');
 if(formation.slots.filter(s=>s.position==='GO').length!==1)throw Error('Formação precisa de um goleiro.');
 if(style==='posse'&&formation.slots.some(s=>['PTE','PTD','MLE','MLD'].includes(s.position)))throw Error('Sua Posse utiliza desenho central, sem pontas.');
 const source=new Map(cards.map(c=>[c.instanceId||c.id,c]));if(cards.some(c=>c.accountId!==accountId))throw Error('Carta de outra conta não pode entrar neste plano.');
 const lineup=options.lineup||{},instructions=options.instructions||[],warnings=[],members=[],picked=new Set(),people=new Set();
 if(Object.keys(lineup).some(key=>!formation.slots.some(s=>s.id===key)))throw Error('Vaga não pertence à formação.');
 for(const ins of instructions){const rule=INSTRUCTIONS[ins.type];if(!rule||rule.phase!==ins.phase)throw Error('Instrução indisponível nesta fase/versão.');
  if(!Object.values(lineup).includes(ins.instanceId))throw Error('Instrução pertence a jogador fora deste time.');
  if(rule.target&&!String(ins.target||'').trim())throw Error('Instrução de marcação exige adversário alvo.');}
 for(const phase of ['attack','defence'])if(instructions.filter(i=>i.phase===phase).length>2)throw Error('Limite de duas instruções por fase.');
 if(new Set(instructions.map(i=>i.phase+'|'+i.instanceId+'|'+i.type)).size!==instructions.length)throw Error('Instrução repetida.');
 for(const slot of formation.slots){
  if(!A().POS.includes(slot.position))throw Error('Posição não reconhecida.');
  const card=source.get(lineup[slot.id]);if(!card){warnings.push('Escolha um jogador para '+slot.id);continue;}
  const person=card.personKey||norm(card.name);if(picked.has(card.id)||people.has(person))throw Error('O mesmo jogador não pode ocupar duas vagas.');picked.add(card.id);people.add(person);
  if((slot.position==='GO')!==(card.position==='GO'))throw Error('Goleiro e jogador de linha não podem trocar de função.');
  const offBall=formation.offBallSlots?.find(s=>s.id===slot.id)||slot;
  const eligible=(card.positions||[card.position]).includes(slot.position)&&(card.positions||[card.position]).includes(offBall.position);
  const individual=instructions.filter(i=>i.instanceId===card.id);
  const attack=individual.some(i=>i.type==='defensive')?'Manter apoio de segurança e limitar avanço':individual.some(i=>i.type==='anchoring')?'Manter referência central sem abrir em excesso':'Apoiar a construção e oferecer opção de passe conforme a função';
  const defence=norm(card.defenceStyle).includes('destruidor')?'Confrontar o portador com cobertura próxima; observar o espaço abandonado':'Recompor e proteger a zona da função';
  members.push({slot:{...slot},offBall:{...offBall},card,eligible,offenseStyle:card.offenseStyle||'Não informado',defenceStyle:card.defenceStyle||'Não informado',instructions:individual,
   role:{attack,defence},styleActivation:'Estilo registrado; ativação nesta posição depende da regra documentada da edição'});
  if(!eligible)warnings.push(card.name+': familiaridade ainda não comprovada nas duas fases; simulação.');
 }
 const manager=options.manager||null,proficiency=manager?.proficiency?.[style]??null;
 if(!manager)warnings.push('Escolha a edição do técnico para avaliar os bônus.');
 else if(proficiency===null)warnings.push('Proficiência desta edição/estilo pendente.');
 else if(proficiency<85)warnings.push(manager.name+': proficiência '+proficiency+' neste estilo; comparar outra edição/tática.');
 const ids=formation.slots.map(s=>({id:s.id,position:s.position,x:s.x,y:s.y}));
 const snapshot=members.map(m=>({slot:m.slot.id,card:Object.fromEntries(['id','name','personKey','cardId','edition','position','maxLevel','pp','positions','offenseStyle','defenceStyle','trainingLevels','nativeSkills','nativeVerified','skills','skillsVerified','fixedBoosters','extraBooster','boosterSlot','boosterSlotSupported'].map(k=>[k,m.card[k]??null]))}));
 const key=signature({accountId,style,formation:{id:formation.id,slots:ids,offBall:formation.offBallSlots||ids},manager,lineup,instructions,snapshot,rules:382});
 return {schema:'CRAQUE_TEAM_CONTEXT_V382',accountId,style,formation,manager,proficiency,lineup:{...lineup},instructions:instructions.map(x=>({...x})),members,warnings,signature:key,ready:members.length===11};
}
function engineCard(member,context){const c=member.card;return {accountId:context.accountId,localKey:localKey(c),cardId:String(c.cardId||''),edition:c.edition||'',name:c.name,
 position:member.slot.position,originalPosition:c.position,positionEvidence:{eligible:member.eligible,text:member.eligible?'Posições cadastradas nesta conta':'Familiaridade a conferir; simulação'},
 style:c.offenseStyle||'',defenceStyle:c.defenceStyle||'',level:c.maxLevel,pp:c.pp,nativeSkills:(c.nativeSkills||[]).join('; '),skills:(c.skills||[]).join('; '),
 fixedBooster:c.fixedBoosters?.[0]?.name||'',booster:c.extraBooster?.name||'',boosterSlot:c.boosterSlot||'pendente',
 trainingLevels:Array.isArray(c.trainingLevels)?c.trainingLevels.join(' '):'',functionalTrainingProof:physicalProof(c),boosterSlotsProof:boosterProof(c)};}
function weightsFor(member,context,deps){
 const card=engineCard(member,context),role=deps.tactical.roleOf({shown_position:card.position}),overload=context.style==='overload';
 let weights;if(!overload){const analysis=deps.interpretation.interpret(deps.training.profileOf(card),context.style,null);weights=analysis?.weights?.slice();}
 if(!weights)weights=(deps.tactical.BASE[role]||deps.tactical.BASE.ALA).map((n,i)=>n+(overload&&[1,2,4,6].includes(i)?6:0));
 const reasons=[];
 if(member.instructions.some(i=>i.type==='defensive')){weights[6]+=10;weights[4]+=4;weights[0]=Math.max(0,weights[0]-4);reasons.push('Defensivo: prioridade de cobertura e recuperação, preservando saída.');}
 if(member.instructions.some(i=>i.type==='anchoring')){weights[1]+=4;weights[2]+=3;reasons.push('Ancoragem: referência de passe e domínio pelo centro.');}
 const aggressive=context.members.filter(m=>norm(m.defenceStyle).includes('destruidor'));
 if(['LD','LE','ZG','VOL'].includes(role)&&aggressive.length>=2){weights[6]+=3;weights[4]+=2;reasons.push('Mais de um Destruidor: observar cobertura e recuperação no conjunto.');}
 if(role==='GO'){weights[1]=Math.max(weights[1],3);weights[4]=Math.max(weights[4],3);weights[5]=Math.max(weights[5],3);}
 else weights[7]=Math.max(0,weights[5]*0.35);
 return {weights,role,reasons,method:overload?'Sobreposição: proposta editorial de compactação e apoio; sem fórmula de rendimento':'V233 com prioridades explícitas do contexto do time'};
}
function evaluateCard(context,slotId,deps){
 const member=context.members.find(m=>m.slot.id===slotId);if(!member)throw Error('Escolha a carta desta vaga.');
 const card=engineCard(member,context),axes=weightsFor(member,context,deps),pp=card.pp??(Number.isInteger(card.level)?2*(card.level-1):null);
 const baseline=deps.training.parseBaseline(card,deps.tactical).levels;
 const levels=deps.individual.allocate(axes.weights,axes.role,pp,baseline,{physicalGroups:true});
 const progress=deps.training.resolveBudget(card);let result,review;
 if(context.style!=='overload'){
  result=deps.training.evaluate(card,context.style,deps);result={...result,plan:{...result.plan,levels,pp,remaining:levels?0:null}};
  const main=get('CRAQUE_MAIN_SHEET_V378','./craque-main-sheet-v378.js');
  const resolved=main.resolve(card,result,{...(levels?{levels}:{}),reference:member.card.reference,managerLabel:context.manager?.name||''},deps);review=resolved.review;result=resolved.result;
 }else{
  result={tactic:'overload',progress,plan:{status:levels?'hipotese':'pendente',role:axes.role,levels,pp,remaining:levels?0:null},suggestedSkills:[],freeSkillSlots:null,
   booster:{primary:null,alternatives:[]},skills:{nativeKnown:member.card.nativeVerified===true},warnings:[],nativeDocumented:member.card.nativeVerified===true};
  review=deps.training.functionReview(card,result,baseline,deps);review.sourceKind='proposal';review.sourceLabel='Proposta para Sobreposição';review.tacticLabel=MODES.overload;
 }
 review.accountId=context.accountId;review.contextSignature=context.signature;review.memberId=member.card.id;review.slotId=slotId;
 review.contextRole=member.role;review.contextInstructions=member.instructions;review.contextReasons=axes.reasons;review.searchMethod=axes.method;
 review.contextWarnings=context.warnings;review.stylePair={offense:member.offenseStyle,defence:member.defenceStyle,activation:member.styleActivation};
 review.tacticLabel=MODES[context.style];review.canSave=Boolean(levels&&member.eligible&&!review.fixedProgression&&!(review.issues?.length));review.finalAttributesVerified=false;
 if(card.functionalTrainingProof&&levels){const allowed=Rules().allowed(axes.role,card);review.trainingGroups=allowed.map(i=>({index:i,category:deps.tactical.CATEGORIES[i],proposed:levels[i],cost:deps.tactical.ppCost(levels[i]),current:baseline?.[i]??null}));}
 return {review,result,engineCard:card,weights:axes.weights,contextSignature:context.signature};
}
function trainingAllowed(position,index,proof){return Rules().allowed(position,{...proof?.card,functionalTrainingProof:proof}).includes(index);}
function boosterCompatible(card,name){return Rules().stackingAllowed(card,name);}
return Object.freeze({MODES,INSTRUCTIONS,signature,compile,evaluateCard,physicalProof,boosterProof,engineCard,weightsFor,trainingAllowed,boosterCompatible});
});
