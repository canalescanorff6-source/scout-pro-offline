/* Workspace offline. Nenhuma proposta altera o equipamento do jogo ou a Principal. */
(async()=>{'use strict';
const A=window.CRAQUE_ACCOUNTS_V382,C=window.CRAQUE_TEAM_CONTEXT_V382,P=window.CRAQUE_POSITIONAL_V311||window.CRAQUE_POSITION_V311,
 $=id=>document.getElementById(id),mk=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;},
 say=(message,error=false)=>{$('feedback').textContent=message;$('feedback').dataset.error=String(error);},
 deps={tactical:window.SCOUT_TACTICS_V220,training:window.CRAQUE_FRIEND_TRAINING_V228,individual:window.CRAQUE_FICHA_INDIVIDUAL_V251,
 interpretation:window.CRAQUE_INTERPRETATION_V233,skills:window.SCOUT_RECOMMENDATIONS_V162,boosters:window.SCOUT_BOOSTERS_V103,rating:window.CRAQUE_RATING_V376};
const load=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Arquivo indisponível: '+path);return r.json();};
const Method=window.CRAQUE_FUNCTION_METHOD_V383;
let account='primary',cards=[],managers=[],formation=null,lineup={},instructions=[],functions={},locks={},plan=null,sources=null,forms=[],editing=null,editingManager=null,observationRevision=null;
const split=s=>String(s||'').split(/[;\n]+/).map(x=>x.trim()).filter(Boolean),num=s=>s===''?null:Number(s),clone=x=>JSON.parse(JSON.stringify(x));
function options(select,items,value){select.replaceChildren();for(const [v,label]of items){const o=mk('option',label);o.value=v;select.append(o);}if(items.some(x=>x[0]===value))select.value=value;}
function clearPlan(){plan=null;$('plan-section').hidden=true;}
function formationNow(){return forms.find(f=>f.id===$('formation').value);}
function managerNow(){return managers.find(m=>m.id===$('manager').value)||null;}
function context(){return C.compile({accountId:account,manager:managerNow(),style:$('style').value,formation,lineup,instructions,functions},roster());}
function roster(){
 const result=A.roster(account,sources,localStorage);
 if(account==='primary')for(const c of result){
  const ref=sources.references.find(r=>r.key===c.id);c.reference=ref||null;c.image=ref?.image||c.image;
  if(c.source==='original'&&sources.positional){const m=sources.positional.fromPersonal(c.legacy,null,localStorage);c.positions=sources.positional.positionMap(m).filter(x=>x.eligible).map(x=>x.position);c.skillCapacity=c.skillsVerified?5:null;}
  if(c.source==='owned'){
   const manual=JSON.parse(localStorage.getItem('scoutpro:v364:owned-confirmed')||'{}')[c.id];
   const meta=deps.rating.ownedMetadata(c.legacy,manual,ref),r=window.CRAQUE_CARD_REVIEW_V379.owned(c.legacy,localStorage);
   c.maxLevel=meta.level;c.pp=meta.level===null?null:2*(meta.level-1);c.cardId=meta.cardId;c.edition=meta.engineEdition||c.edition;
   if(r){if(r.cardId)c.cardId=r.cardId;if(r.edition)c.edition=r.edition;if(r.maxLevel!==null)c.maxLevel=r.maxLevel;if(r.pp!==null)c.pp=r.pp;
    c.offenseStyle=r.attackStyle||c.offenseStyle;c.defenceStyle=r.defenceStyle||c.defenceStyle;
    if(r.nativeSkills)c.nativeSkills=split(r.nativeSkills);if(r.training)c.trainingLevels=r.training;
    if(r.equipmentReviewed){c.skills=r.skills.filter(Boolean);c.skillsVerified=true;c.skillCapacity=5;c.boosterSlot=r.extraSlot;c.extraBooster=r.extraBooster?{name:r.extraBooster,value:1,verified:false}:null;}
    if(r.cardInfo&&!r.cardInfo.mathOk){c.pp=null;c.maxLevel=null;}}
   c.nativeVerified=c.nativeSkills.length>0;
  }
 }
 return result;
}
function changed(){clearPlan();paintPitch();}
function setAccount(id,persist=true){
 if(persist){A.select(localStorage,id);const url=new URL(location.href);url.searchParams.set('account',id);history.replaceState(null,'',url);}account=id;cards=roster();lineup={};locks={};instructions=[];functions={};clearPlan();
 $('account').value=id;for(const k of ['primary','secondary'])$(k).setAttribute('aria-pressed',String(k===id));
 managers=id==='secondary'?A.read(localStorage).secondary.managers:sources.managers;
 options($('manager'),[['','Escolha o técnico e a edição'],...managers.map(m=>[m.id,m.name+' · '+(m.edition||'edição a conferir')])]);
 $('new-card').disabled=id!=='secondary';$('new-manager').disabled=id!=='secondary';$('editor-section').hidden=true;$('manager-section').hidden=true;
 $('roster-count').textContent=cards.length+' cartas · '+(id==='primary'?'Principal':'Secundária');
 const evidence=A.read(localStorage).secondary.evidence;
 $('inventory-note').textContent=id==='primary'?'Biblioteca principal preservada. Para corrigir cartas, use a conferência da carta original.':
  cards.length+' cartas cadastradas.'+(evidence?.inventoryTotal?' O vídeo mostra '+evidence.inventoryTotal+' na conta; apenas '+cards.length+' foram cadastradas.':' Importe o arquivo privado ou cadastre suas cartas.');
 paintForms();paintRoster();paintHistory();managerNote();say(id==='primary'?'Principal selecionada.':'Secundária selecionada. Dados independentes da Principal.');
}
function paintForms(){const family=$('family').value,old=$('formation').value;
 const visible=forms.filter(f=>(!family||f.family===family)&&window.CRAQUE_FORMATIONS_V382.eligible(f,$('style').value));
 options($('formation'),visible.map(f=>[f.id,f.label]),old);applyFormation(formationNow());
 $('formation-note').textContent=formation?formation.rationale+' '+formation.risks.join(' '):'Sem desenho compatível.';
}
function applyFormation(next){const out=C.transitionFormation({lineup,locks,instructions,functions},next,cards);formation=next;lineup=out.lineup;locks=out.locks;instructions=out.instructions;functions=out.functions;paintLineup();changed();if(out.warnings.length)say(out.warnings.join(' '));}
function managerNote(){$('edit-manager').hidden=account!=='secondary'||!managerNow();const m=managerNow(),p=m?.proficiency[$('style').value];$('manager-note').textContent=m?
 'Proficiência: '+(p??'a conferir')+' · '+(m.bonusesVerified?'Bônus numéricos documentados.':'Bônus e combinações ainda precisam de conferência nesta conta.'):'Selecione o técnico. Nenhum bônus é presumido.';}
function paintPitch(){const e=$('pitch');e.replaceChildren();if(!formation)return;
 for(const s of ($('phase').value==='defence'?formation.offBallSlots:formation.slots)){
  const c=cards.find(c=>c.id===lineup[s.id]),p=mk('div');p.className='pitch-player';p.style.left=s.x+'%';p.style.top=s.y+'%';p.append(mk('b',s.position),mk('span',c?.name||'Escolher'));e.append(p);
 }}
function paintLineup(){const e=$('lineup');e.replaceChildren();if(!formation)return;
 for(const s of formation.slots){const row=mk('div');row.className='slot-row';const head=mk('div');head.className='slot-head';head.append(mk('b',s.position));
  const select=mk('select');select.setAttribute('aria-label','Jogador '+s.id);
  const eligible=cards.filter(c=>(c.position==='GO')===(s.position==='GO'));
  options(select,[['','Escolha o jogador'],...eligible.map(c=>[c.id,c.name+' · '+c.edition+((c.positions||[c.position]).includes(s.position)?'':' · posição a conferir')])],lineup[s.id]);
  select.onchange=()=>{const previous=lineup[s.id];if(select.value)lineup[s.id]=select.value;else delete lineup[s.id];delete locks[s.id];delete functions[previous];instructions=instructions.filter(i=>i.instanceId!==previous);paintLineup();changed();};head.append(select);
  const label=mk('label','Fixar');label.className='lock';const check=mk('input');check.type='checkbox';check.checked=!!locks[s.id];check.disabled=!lineup[s.id];check.onchange=()=>{if(check.checked)locks[s.id]=lineup[s.id];else delete locks[s.id];};label.prepend(check);head.append(label);row.append(head);
  const task=mk('label','Função desejada'),choice=mk('select');choice.setAttribute('aria-label','Função '+s.id);
  options(choice,[['','Sugerir pela posição e estilo ativo'],...Method.choices(s.position).map(f=>[f.key,f.label])],functions[lineup[s.id]]);choice.disabled=!lineup[s.id];
  choice.onchange=()=>{if(choice.value)functions[lineup[s.id]]=choice.value;else delete functions[lineup[s.id]];changed();};task.append(choice);row.append(task);
  const controls=mk('div');controls.className='slot-instructions';
  for(const phase of ['attack','defence']){const l=mk('label',phase==='attack'?'Com a bola':'Sem a bola'),ins=mk('select');ins.setAttribute('aria-label',(phase==='attack'?'Ataque ':'Defesa ')+s.id);
   const current=instructions.find(i=>i.instanceId===lineup[s.id]&&i.phase===phase);
   options(ins,[['','Sem instrução'],...Object.entries(C.INSTRUCTIONS).filter(([,v])=>v.phase===phase).map(([k,v])=>[k,v.label])],current?.type);ins.disabled=!lineup[s.id];
   ins.onchange=()=>{instructions=instructions.filter(i=>!(i.instanceId===lineup[s.id]&&i.phase===phase));if(ins.value)instructions.push({type:ins.value,phase,instanceId:lineup[s.id],...(C.INSTRUCTIONS[ins.value].target?{target:''}:{})});paintLineup();changed();};l.append(ins);
   if(current&&C.INSTRUCTIONS[current.type].target){const target=mk('input');target.placeholder='Adversário a marcar';target.setAttribute('aria-label','Alvo '+s.id);target.value=current.target||'';target.oninput=()=>{current.target=target.value;changed();};l.append(target);}controls.append(l);
  }row.append(controls);e.append(row);
 }paintPitch();}
function paintResults(){const root=$('results');root.replaceChildren();$('plan-section').hidden=false;
 $('save-plan').disabled=plan.historicalReadOnly===true; $('plan-state').textContent=(plan.historicalReadOnly?'Histórico · somente consulta e exportação. Recalcule para uma revisão atual. ':'')+(account==='primary'?'Principal':'Secundária')+' · '+C.MODES[plan.style]+' · '+(plan.context.manager?.name||'Técnico pendente')+' · revisão para testar online; não aplicada no jogo.';
 const balance=$('balance');balance.replaceChildren();for(const [k,label]of [['coverage','Proteção'],['support','Apoio'],['depth','Profundidade']])balance.append(mk('p',label+': '+(plan.balance[k].join(', ')||'rever no conjunto')));
 for(const warning of plan.balance.warnings)balance.append(mk('p',warning));
 for(const row of plan.cards){const r=row.review,c=cards.find(c=>c.id===row.memberId),box=mk('article');box.className='result-card';box.dataset.memberId=row.memberId;
  const top=mk('div');top.className='result-top';if(c?.image&&(!plan.historicalReadOnly||(c.edition===r.identity.edition&&String(c.cardId||'')===r.identity.cardId))){const img=mk('img');img.className='card-art';img.src=c.image;img.alt='Carta de '+r.identity.name;img.loading='lazy';top.append(img);}const title=mk('div');title.append(mk('span',r.position+' · '+r.tacticLabel),mk('h3',r.identity.name),mk('span',r.identity.edition||'Edição a conferir'));top.append(title);box.append(top);
  box.append(mk('p',r.contextRole.attack+'. '+r.contextRole.defence+'.'),mk('p','Estilos cadastrados: '+r.stylePair.offense+' / '+r.stylePair.defence));
  if(r.functionPlan){box.append(mk('h4',r.functionPlan.label),mk('p','Prioridades do treino: '+r.functionPlan.priorities.map(p=>p.category).join(' · ')),mk('p','Observar na partida: '+r.functionPlan.test+'.'));
   const pair=r.stylePair.activationPair,phaseNames={attack:'Com a bola',defence:'Sem a bola'};
   for(const phase of ['attack','defence']){const a=pair[phase],line=mk('p',phaseNames[phase]+' · '+a.position+' · '+a.style+': '+a.label);line.className='activation-status';line.dataset.activation=a.status;box.append(line);}
   box.append(mk('p','Familiaridade nas duas fases: '+(pair.familiarity?'cadastrada nesta conta':'a conferir; simulação')),
    mk('p','Apoios próximos no desenho: '+(r.functionPlan.partners.map(p=>p.name+' ('+p.position+')').join(', ')||'a conferir')),
    mk('p','Referências de proteção: '+(r.functionPlan.coverage.join(', ')||'sem referência definida; rever o conjunto')));
   for(const constraint of r.functionPlan.constraints)box.append(mk('p',constraint));}
  if(r.proposed){const grid=mk('div');grid.className='training';for(const g of r.trainingGroups){const cell=mk('div',g.category);cell.append(mk('strong',String(g.proposed)),mk('small','Cadastrado: '+(g.current??'pendente')+' · '+g.cost+' PP'));grid.append(cell);}box.append(grid,mk('b',r.spent+' / '+r.pp+' PP · níveis de categoria'));}
  else box.append(mk('p','Treino pendente: confira nível máximo e PP desta edição.'));
  const compare=mk('div');compare.className='comparison';const current=mk('div'),proposed=mk('div');
  current.append(mk('h4',plan.historicalReadOnly?'CADASTRADO NA REVISÃO':'CADASTRADO NESTA CONTA'),mk('p','Adicionais: '+(r.equippedSkillLabels.join(', ')||'não informadas')),
   mk('p','Ímpeto fixo: '+(r.fixedBoosters.map(b=>b.name+(b.verified?' +'+b.value:' (valor a conferir)')).join(', ')||'pendente')),
   mk('p','Ímpeto adicional: '+(r.extraBooster?r.extraBooster.name+(r.extraBooster.verified?' +'+r.extraBooster.value:' (valor a conferir)'):'não informado')));
  proposed.append(mk('h4','CANDIDATAS PARA ESTA FUNÇÃO'));const list=mk('ul');for(const skill of r.skills)list.append(mk('li',skill.name+' — '+skill.reason));proposed.append(list,
   mk('p','Vagas livres: '+(r.freeSkillSlots??'a conferir')+'.'),mk('p','Ímpetos a comparar: '+(r.boosters.map(b=>b.name).join(' / ')||'a conferir')+'.'));
  for(const b of r.boosters)proposed.append(mk('small',b.name+' — '+b.reason));
  compare.append(current,proposed);box.append(compare);const pending=mk('p','Conferir antes de investir: '+(r.pending.join(', ')||'nenhuma pendência de cadastro identificada')+'.');pending.className='pending';box.append(pending);
  const details=mk('details');details.append(mk('summary','Por que esta ficha?'),mk('p',r.searchMethod),mk('p',r.contextReasons.join(' ')||r.job),mk('p',r.stylePair.activation));
  if(r.stylePair.activationPair)for(const [phase,label]of [['attack','Ataque'],['defence','Defesa']]){const a=r.stylePair.activationPair[phase];details.append(mk('p',label+': '+a.explanation));if(a.source){const link=mk('a','Referência de '+label.toLowerCase()+' ↗');link.href=a.source.url;link.target='_blank';link.rel='noopener noreferrer';details.append(link,mk('p',a.source.kind+' · consultado em '+a.source.checked));}}
  if(r.attributeEstimate?.status==='estimated')details.append(mk('p','OVR estimado desta proposta: '+r.attributeEstimate.overall+'; fórmula independente, sem confirmação no jogo.'),mk('pre',JSON.stringify(r.attributeEstimate.stats,null,2)));
  else details.append(mk('p','Atributos finais dependem da base exata da edição e dos bônus documentados. Nenhum número final foi inventado.'));box.append(details);root.append(box);
 }paintObservations();}
function paintObservations(){const ready=!!plan?.id&&!plan.historicalReadOnly&&plan.cards.every(c=>c.review.functionPlan?.version===Method.VERSION);
 const revisionKey=plan.accountId+'|'+(plan.id||''),same=!!plan.id&&observationRevision===revisionKey,member=same?$('match-member').value:'';
 if(!same){$('match-form').reset();for(const select of document.querySelectorAll('#match-form [data-match-signal]'))select.value='unobserved';}observationRevision=revisionKey;
 $('match-section').hidden=false;$('match-form').hidden=!ready;$('match-note').textContent=ready?'Registre o que você percebeu usando esta revisão. Compare adversários e condições semelhantes.':'Salve uma revisão atual para registrar observações. O histórico mantém os relatos da revisão original.';
 options($('match-member'),[['','Time completo'],...plan.cards.map(c=>[c.memberId,c.review.identity.name])],member);const list=$('match-list');list.replaceChildren();
 for(const o of plan.observations||[]){const box=mk('article');box.className='match-observation';box.append(mk('b',(o.memberId?plan.cards.find(c=>c.memberId===o.memberId)?.review.identity.name:'Time completo')+' · '+A.MATCH_MODES[o.mode]+' · '+o.games+' partida(s)'),mk('p',new Date(o.recordedAt).toLocaleString('pt-BR')),
  mk('p',[['support','Apoio'],['runs','Infiltração'],['recovery','Recomposição'],['coverage','Cobertura']].map(([k,l])=>l+': '+A.MATCH_SIGNALS[o[k]]).join(' · ')),mk('p',o.note));list.append(box);}
 if(!plan.observations?.length)list.append(mk('p','Ainda sem observações de partida nesta revisão.'));
}
function paintRoster(){const e=$('roster'),q=$('search').value.toLocaleLowerCase();e.replaceChildren();for(const c of cards.filter(c=>(c.name+' '+c.edition).toLocaleLowerCase().includes(q))){
 const row=mk('article');row.className='library-card';if(c.image){const img=mk('img');img.src=c.image;img.alt='';img.className='card-art';img.loading='lazy';row.append(img);}const d=mk('div');d.append(mk('b',c.name),mk('p',c.edition||'Edição a conferir'),mk('p',c.position+' · Nível '+(c.maxLevel??'pendente')+' · '+(c.pp??'?')+' PP'));
 if(account==='secondary'){const edit=mk('button','Conferir dados');edit.onclick=()=>editCard(c);d.append(edit);}else{const a=mk('a','Conferir carta ↗');a.href='conferir-cartas.html#'+encodeURIComponent(c.id);d.append(a);}row.append(d);e.append(row);
 }}
function field(container,name,label,value='',{type='text',choices=null}={}){const l=mk('label',label),e=mk(choices?'select':type==='textarea'?'textarea':'input');e.name=name;
 if(choices)options(e,choices,value);else{if(type!=='textarea')e.type=type;if(type==='checkbox'){e.checked=!!value;l.className='check';}else e.value=value??'';}l.append(e);container.append(l);return e;}
function editCard(card=null){editing=card?.id||'sec-'+Date.now().toString(36);const c=card||{},e=$('editor-fields');e.replaceChildren();
 for(const [k,label] of [['name','Nome'],['edition','Edição / pacote'],['cardId','Card ID (deixe vazio se desconhecido)'],['offenseStyle','Estilo ofensivo'],['defenceStyle','Estilo defensivo']])field(e,k,label,c[k]);
 field(e,'position','Posição de referência cadastrada',c.position||'CA',{choices:A.POS.map(p=>[p,p])});field(e,'positions','Outras posições comprovadas (separadas por ;)',(c.positions||[]).join('; '));
 for(const [k,l]of [['maxLevel','Nível máximo'],['pp','PP disponíveis'],['skillCapacity','Capacidade de adicionais (0 a 5, se conferida)']])field(e,k,l,c[k],{type:'number'});
 field(e,'training','Treino cadastrado: dez categorias separadas por ;',(c.trainingLevels||[]).join('; '));
 for(const [k,l] of [['nativeSkills','Habilidades nativas (separadas por ;)'],['skills','Adicionais já equipadas (separadas por ;)']])field(e,k,l,(c[k]||[]).join('; '),{type:'textarea'});
 for(const [k,l]of [['nativeVerified','Conferi as habilidades nativas desta edição'],['skillsVerified','Conferi as adicionais e a capacidade'],['identityVerified','Conferi a identidade exata desta edição']])field(e,k,l,c[k],{type:'checkbox'});
 field(e,'boosterSlot','Slot adicional',c.boosterSlot||'pendente',{choices:[['pendente','A conferir'],['ausente','Não existe'],['vazio','Existe e está vazio'],['ocupado','Existe e está ocupado']]});
 for(const [prefix,b,label]of [['fixed',c.fixedBoosters?.[0],'Ímpeto fixo'],['extra',c.extraBooster,'Ímpeto adicional']]){
  field(e,prefix+'Name',label+' · nome',b?.name);field(e,prefix+'Value',label+' · valor (se conhecido)',b?.value,{type:'number'});field(e,prefix+'Verified',label+' · conferi nome e valor',b?.verified,{type:'checkbox'});}
 field(e,'notes','Observações',c.notes,{type:'textarea'});for(const key of ['edition','cardId'])$('card-editor').elements[key].addEventListener('input',()=>{for(const k of ['fixedVerified','extraVerified','nativeVerified','skillsVerified','identityVerified'])$('card-editor').elements[k].checked=false;});$('editor-section').hidden=false;$('editor-section').scrollIntoView({behavior:'smooth'});
}
function paintHistory(){const e=$('history');e.replaceChildren();const saved=Object.values(A.read(localStorage).plans[account]).reverse();if(!saved.length)e.append(mk('p','Nenhuma revisão salva nesta conta.'));
 for(const p of saved){const b=mk('button',new Date(p.savedAt).toLocaleString('pt-BR')+' · '+C.MODES[p.style]+(p.stale?' · recalcular':''));b.onclick=()=>{try{
  $('style').value=p.style;$('family').value=p.context.formation.family;paintForms();$('formation').value=p.context.formation.id;formation=formationNow();
  $('manager').value=p.context.manager?.id||'';lineup={...p.context.lineup};instructions=clone(p.context.instructions);functions=clone(p.context.functions||{});cards=roster();paintLineup();managerNote();
  let current=null;try{current=context();}catch(_){}const state=C.historyState(p,current);
  plan={...clone(p),historicalReadOnly:state.readOnly};paintResults();say(state.readOnly?'Histórico aberto com os dados originais. Você pode exportá-lo; recalcule antes de salvar uma revisão atual.':'Revisão reaberta; equipamento preservado.');
 }catch(err){say(err.message,true);}};e.append(b);}}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type})),a=mk('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
try{
 const [data,own,refs,formations,ratingModel,catalog]=await Promise.all([load('SCOUT_V69_AUDITORIA.json'),load('ct364-owned-cards.json'),load('ct376-card-references.json'),load('ct382-formations.json'),load('ct376-rating-model.json'),window.CRAQUE_MANAGERS_V302.load()]);
 deps.ratingModel=ratingModel;forms=formations.formations;
 const managerSource=window.CRAQUE_MANAGERS_V302;
 sources={originals:data.cards,owned:own.cards,references:refs.cards,positional:P,managers:catalog.tecnicos.map(m=>A.normalManager({id:m.catalog_id,name:m.nome,edition:m.versao_lancamento,
  proficiency:Object.fromEntries(Object.keys(C.MODES).map(s=>[s,managerSource.proficiency(m,s)])),bonuses:m.boosters_EN,bonusesVerified:false,source:'Catálogo público; aquisição e bônus na conta a conferir'}))};
 options($('style'),Object.entries(C.MODES));options($('family'),[['','Todas as famílias'],...[...new Set(forms.map(f=>f.family))].map(f=>[f,f])]);
 const requested=new URLSearchParams(location.search).get('account');setAccount(['primary','secondary'].includes(requested)?requested:A.read(localStorage).active,false);
 for(const k of ['primary','secondary'])$(k).onclick=()=>{try{setAccount(k);}catch(e){say(e.message,true);}};
 $('account').onchange=()=>setAccount($('account').value);$('family').onchange=paintForms;$('style').onchange=()=>{paintForms();managerNote();};
 $('formation').onchange=()=>{applyFormation(formationNow());$('formation-note').textContent=formation.rationale+' '+formation.risks.join(' ');};
 $('manager').onchange=()=>{managerNote();changed();};$('phase').onchange=paintPitch;$('search').oninput=paintRoster;
 $('auto').onclick=()=>{try{const out=C.suggestLineup(formation,cards,{locks});const retained=C.transitionFormation({lineup:out.lineup,functions,instructions},formation,cards);lineup=retained.lineup;functions=retained.functions;instructions=retained.instructions;paintLineup();changed();say(out.warnings.join(' ')||'Onze sugerido. Revise os nomes e as instruções antes de montar o plano.');}catch(e){say(e.message,true);}};
 $('calculate').onclick=()=>{try{const ctx=context();if(!ctx.ready)throw Error('Escolha os onze jogadores antes de montar o plano.');plan=C.recommend(ctx,deps);paintResults();say('Plano montado para os onze. Confira as pendências de cada carta antes de investir.');$('plan-section').scrollIntoView({behavior:'smooth'});}catch(e){say(e.message,true);}};
 $('save-plan').onclick=()=>{try{if(!plan)throw Error('Monte o plano primeiro.');const revision=C.adopt(localStorage,plan,context().signature);plan=revision;paintObservations();paintHistory();window.dispatchEvent(new Event('craque:data-changed'));say('Nova revisão salva nesta conta: '+new Date(revision.savedAt).toLocaleTimeString('pt-BR'));}catch(e){say(e.message,true);}};
 for(const select of document.querySelectorAll('#match-form [data-match-signal]'))options(select,Object.entries(A.MATCH_SIGNALS),'unobserved');
 $('match-form').onsubmit=e=>{e.preventDefault();try{if(!plan?.id||plan.historicalReadOnly)throw Error('Salve uma revisão atual primeiro.');const input=Object.fromEntries(new FormData(e.target));input.games=Number(input.games);plan=C.observe(localStorage,account,plan.id,input,context().signature);paintObservations();paintHistory();window.dispatchEvent(new Event('craque:data-changed'));say('Observação salva nesta revisão. Ela não valida rendimento nem altera a ficha automaticamente.');}catch(err){say(err.message,true);}};
 $('export-text').onclick=async()=>{try{if(!plan)throw Error('Monte o plano primeiro.');const native=window.scoutDesktop||window.Capacitor?.isNativePlatform?.(); if(native)await window.SCOUT_FILE_EXPORT.saveJson({format:'craque-fichas-v382',text:C.exportText(plan)},'craque-fichas-'+account+'.json');else download(C.exportText(plan),'craque-fichas-'+account+'.txt','text/plain;charset=utf-8');say('Exportação solicitada com o mesmo treino e escolhas exibidos. Confira o arquivo salvo.');}catch(e){say(e.message,true);}};
 $('export-json').onclick=async()=>{try{await window.SCOUT_FILE_EXPORT.saveJson(JSON.parse(C.exportJSON(plan)),'craque-plano-'+account+'.json');}catch(e){say(e.message,true);}};
 $('import-account').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>A.MAX_BYTES)throw Error('Arquivo excede3MB.');const imported=A.importDraft(localStorage,JSON.parse(await f.text()));setAccount('secondary');window.dispatchEvent(new Event('craque:data-changed'));say(imported.added+' cartas importadas; '+imported.total+' na Secundária.');}catch(err){say(err.message,true);}finally{e.target.value='';}};
 $('new-card').onclick=()=>editCard();$('close-editor').onclick=()=>{$('editor-section').hidden=true;};
 $('card-editor').onsubmit=e=>{e.preventDefault();try{
  if(account!=='secondary')throw Error('Este editor pertence à Secundária.');const form=e.target,v=Object.fromEntries(new FormData(form)),doc=A.read(localStorage),old=doc.secondary.cards.find(c=>c.id===editing)||{};
  const boost=p=>v[p+'Name']?{name:v[p+'Name'],value:num(v[p+'Value']),verified:form.elements[p+'Verified'].checked,source:'Cadastro do proprietário'}:null;
  const fixed=boost('fixed'),extra=boost('extra'),slot=v.boosterSlot;
  if(slot==='ocupado'&&!extra)throw Error('Informe o ímpeto adicional ocupado.');if(slot!=='ocupado'&&extra)throw Error('Ímpeto cadastrado exige slot ocupado.');
  const c=A.normalCard({...old,...v,id:editing,positions:split(v.positions),maxLevel:num(v.maxLevel),pp:num(v.pp),skillCapacity:num(v.skillCapacity),
   nativeSkills:split(v.nativeSkills),skills:split(v.skills),trainingLevels:v.training.trim()?split(v.training).map(Number):null,
   nativeVerified:form.elements.nativeVerified.checked,skillsVerified:form.elements.skillsVerified.checked,identityVerified:form.elements.identityVerified.checked,
   fixedBoosters:fixed?[fixed]:[],extraBooster:extra,boosterSlotSupported:['vazio','ocupado'].includes(slot)});
  if(c.skills.length>(c.skillCapacity??5))throw Error('Adicionais acima da capacidade informada.');
  const at=doc.secondary.cards.findIndex(x=>x.id===editing);if(at<0)doc.secondary.cards.push(c);else doc.secondary.cards[at]=c;A.save(localStorage,doc);cards=roster();clearPlan();paintRoster();paintLineup();$('roster-count').textContent=cards.length+' cartas · Secundária';$('editor-section').hidden=true;window.dispatchEvent(new Event('craque:data-changed'));say('Dados salvos na Secundária. Se mudou a identidade, confira novamente as habilidades e os ímpetos. Revisões anteriores preservadas; recalcule o plano.');
 }catch(err){say(err.message,true);}};
 function editManager(m=null){editingManager=m?.id||'mgr-'+Date.now().toString(36);const e=$('manager-fields');e.replaceChildren();field(e,'name','Nome',m?.name);field(e,'edition','Edição',m?.edition);for(const [k,l]of Object.entries(C.MODES))field(e,k,'Proficiência · '+l,m?.proficiency[k],{type:'number'});field(e,'bonuses','Bônus numéricos documentados (nome original +valor; separados por ;)',(m?.bonuses||[]).join('; '));field(e,'bonusesVerified','Conferi todos os bônus ativos desta edição',m?.bonusesVerified,{type:'checkbox'});$('manager-section').hidden=false;$('manager-section').scrollIntoView({behavior:'smooth'});} $('new-manager').onclick=()=>editManager();$('edit-manager').onclick=()=>editManager(managerNow());
 $('close-manager').onclick=()=>{$('manager-section').hidden=true;};$('manager-editor').onsubmit=e=>{e.preventDefault();try{if(account!=='secondary')throw Error('Técnico pertence à Secundária.');const v=Object.fromEntries(new FormData(e.target)),doc=A.read(localStorage);const value=A.normalManager({id:editingManager,name:v.name,edition:v.edition,proficiency:Object.fromEntries(Object.keys(C.MODES).map(k=>[k,num(v[k])])),bonuses:split(v.bonuses),bonusesVerified:e.target.elements.bonusesVerified.checked,confirmedOwned:true,source:'Cadastro do proprietário'});const at=doc.secondary.managers.findIndex(m=>m.id===editingManager);if(at<0)doc.secondary.managers.push(value);else doc.secondary.managers[at]=value;A.save(localStorage,doc);setAccount('secondary');window.dispatchEvent(new Event('craque:data-changed'));say('Técnico cadastrado na Secundária.');}catch(err){say(err.message,true);}};
 $('backup-export').onclick=async()=>{try{const backup=await window.CRAQUE_BACKUP_V226.create();await window.SCOUT_FILE_EXPORT.saveJson(backup,'craque-backup-duas-contas.json');say('Exportação do backup solicitada. Confira o arquivo salvo.');}catch(e){say(e.message,true);}};
 let checkedBackup=null; $('backup-confirm').onclick=async()=>{try{if(!checkedBackup)return;await window.CRAQUE_BACKUP_V226.restore(checkedBackup);checkedBackup=null;$('backup-confirm').hidden=true;$('backup-preview').hidden=true;setAccount(A.read(localStorage).active,false);say('Backup restaurado. Recalcule os planos quando indicado.');}catch(err){say(err.message,true);}};
 $('backup-import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>9*1024*1024)throw Error('Backup excede o limite.');checkedBackup=await window.CRAQUE_BACKUP_V226.inspect(JSON.parse(await file.text()));$('backup-preview').textContent=window.CRAQUE_BACKUP_V226.describe(checkedBackup);$('backup-preview').hidden=false;$('backup-confirm').hidden=false;say('Confira a prévia e confirme a restauração. Uma cópia dos dados atuais será protegida antes de substituir os registros.');}catch(err){say(err.message,true);}finally{e.target.value='';}};
 window.addEventListener('storage',e=>{if(e.key===A.KEY){clearPlan();setAccount(A.read(localStorage).active,false);say('Dados alterados em outra janela. Recalcule o plano.');}});
 document.body.dataset.team382='ready';
}catch(e){say('Não foi possível abrir o plano: '+e.message,true);}
})();
