/* Ficha comum de cartas privadas, com revisões isoladas por conta e edição. */
(async()=>{'use strict';const A=window.CRAQUE_ACCOUNTS_V382,L=window.CRAQUE_ACCOUNT_LIBRARY_V385,C=window.CRAQUE_TEAM_CONTEXT_V382,M=window.CRAQUE_FUNCTION_METHOD_V383,$=id=>document.getElementById(id),mk=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
const query=new URLSearchParams(location.search),account=query.get('account')==='secondary'?'secondary':'primary',id=query.get('id'),label=L.label(account),deps={tactical:window.SCOUT_TACTICS_V220,training:window.CRAQUE_FRIEND_TRAINING_V228,individual:window.CRAQUE_FICHA_INDIVIDUAL_V251,interpretation:window.CRAQUE_INTERPRETATION_V233,skills:window.SCOUT_RECOMMENDATIONS_V162,boosters:window.SCOUT_BOOSTERS_V103,rating:window.CRAQUE_RATING_V376};
let card=null,managers=[],references=[],context=null,review=null,historical=false;
const say=text=>{$('sheet-status').textContent=text;},options=(el,items,value)=>{el.replaceChildren();for(const [id,text]of items){const o=mk('option',text);o.value=id;el.append(o);}if(items.some(([id])=>id===value))el.value=value;},readCard=()=>{const c=A.read(localStorage)[account].cards.find(c=>c.id===id);if(!c)throw Error('Carta não encontrada nesta conta. Volte ao Meu elenco e confira o destino da importação.');return {...c,instanceId:c.id,accountId:account,source:'private',reference:A.referenceFor(c,references)};};
$('sheet-back').href='index.html?account='+account;$('sheet-team').href='plano-do-time-v382.html?account='+account;$('sheet-account').textContent='MEU ELENCO · Conta '+label;
function functions(){const items=M.choices($('sheet-position').value).map(f=>[f.key,f.label]),old=$('sheet-function').value,auto=L.individualContext(card,{position:$('sheet-position').value,style:$('sheet-style').value||'posse'}).members[0].functionPlan.key;options($('sheet-function'),items,items.some(([id])=>id===old)?old:auto);}
function invalidated(){review=null;context=null;historical=false;$('sheet-save').disabled=true;$('sheet-export').disabled=true;
 for(const id of ['sheet-result','sheet-skills','sheet-boosters'])$(id).replaceChildren(mk('p','Gere a ficha para ver a proposta deste contexto.'));
 say('Contexto alterado. Gere a ficha para comparar esta escolha.');}
function base(){document.title=card.name+' · '+label+' | CRAQUE TÁTICO';$('sheet-name').textContent=card.name;$('sheet-edition').textContent=card.edition||'Edição a conferir';$('sheet-meta').replaceChildren(...[card.position,card.maxLevel===null?'Nível a conferir':'Nível máximo '+card.maxLevel,card.pp===null?'PP a conferir':card.pp+' PP',...(Number.isInteger(card.maxOverall)?['Overall máximo: '+card.maxOverall+' · informado']:[])].map(s=>mk('span',s)));
 if(card.image){$('sheet-art').src=card.image;$('sheet-art').alt='Carta cadastrada de '+card.name;$('sheet-art').hidden=false;}
 $('sheet-native').textContent='Nativas cadastradas: '+(card.nativeSkills.join(', ')||'a conferir')+(card.nativeVerified?'':' · confirmação pendente');$('sheet-equipped').textContent='Adicionais equipadas nesta conta: '+(card.skills.join(', ')||'não informadas');
 $('sheet-fixed').textContent='Fixo: '+(card.fixedBoosters.map(b=>b.name+(b.value===null?'':' +'+b.value)+(b.verified?'':' · a conferir')).join(', ')||'a conferir');$('sheet-extra').textContent='Adicional: '+(card.extraBooster?card.extraBooster.name+(card.extraBooster.value===null?'':' +'+card.extraBooster.value):'não informado')+' · slot '+card.boosterSlot;
 $('sheet-data-note').textContent='Conta '+label+' · Card ID '+(card.cardId||'a identificar')+'. '+(card.notes||'Os dados cadastrados são a base desta proposta.');}
function paint(r,isHistory=false){const root=$('sheet-result');root.replaceChildren();if(isHistory){
 root.append(mk('p','REVISÃO SALVA · consulte o treino e as escolhas registradas nesta revisão.'),
  mk('p','Equipamento registrado na revisão · '+(r.equippedSkillLabels?.join(', ')||'adicionais a conferir')+
   ' · '+(r.fixedBoosters?.map(b=>b.name).join(', ')||'ímpeto fixo a conferir')+
   ' · '+(r.extraBooster?.name||'ímpeto adicional a conferir')));}
 root.append(mk('h3',r.functionPlan?.label||r.contextRole?.attack||'Treino por função'));
 root.append(mk('p',[r.tacticLabel,r.position,r.managerLabel||'Técnico a conferir'].filter(Boolean).join(' · ')));
 if(r.stylePair?.activationPair)for(const [phase,text]of [['attack','Com a bola'],['defence','Sem a bola']]){const a=r.stylePair.activationPair[phase],line=mk('p',text+' · '+a.position+' · '+a.style+': '+a.label);line.className='activation-status';line.dataset.activation=a.status;root.append(line);}
 if(r.proposed){const training=mk('div');training.className='training';for(const g of r.trainingGroups){const cell=mk('div',g.category);cell.append(mk('strong',String(g.proposed)),mk('small',g.cost+' PP · cadastrado '+(g.current??'pendente')));training.append(cell);}root.append(training,mk('strong',r.spent+' / '+r.pp+' PP · níveis de categoria'));}
 else root.append(mk('p','Treino pendente: confira nível máximo e PP da edição.'));
 root.append(mk('p','Prioridades: '+(r.contextReasons?.join(' ')||r.searchMethod||'proposta por função')),mk('p','Conferir antes de investir: '+(r.pending?.join(', ')||'nenhuma pendência identificada no cadastro')+'.'));
 if(r.individualAnalysis&&r.proposed){
  const {status,reason,factors}=r.individualAnalysis,labels={documentada:'Dados da edição consultados',calculada:'Análise calculada',
   dados_insuficientes:'Dados individuais insuficientes',preservada:'Prioridades de Posse preservadas'};
  const details=mk('details');details.append(mk('summary','Por que esta ficha foi escolhida para esta carta?'),mk('p',reason));
  if(Array.isArray(factors)&&factors.length){const list=mk('ul');for(const factor of factors)list.append(mk('li',factor.category+' · '+factor.reason));details.append(list);}
  root.append(mk('p','Evidência · '+(labels[status]||'A conferir')),details);
 }
 for(const text of [...(r.contextWarnings||[]),...(r.functionPlan?.constraints||[])])root.append(mk('p',text));
 if(r.functionPlan?.test)root.append(mk('p','Observar na partida: '+r.functionPlan.test+'.'));
 for(const [key,values]of [['sheet-skills',r.skills],['sheet-boosters',r.boosters]]){const host=$(key);host.replaceChildren();if(!values?.length)host.append(mk('p','Sem indicação disponível nesta proposta.'));else{const list=mk('ul');for(const v of values)list.append(mk('li',v.name+' — '+v.reason));host.append(list);}if(key==='sheet-skills')host.append(mk('p','Vagas livres: '+(r.freeSkillSlots??'a conferir')+'. As candidatas não estão equipadas automaticamente.'));}
 $('sheet-save').disabled=isHistory||!r.canSave||!context?.members[0].eligible;$('sheet-export').disabled=false;
}
function history(){const host=$('sheet-history');host.replaceChildren();const list=L.sheets(localStorage,account,card);if(!list.length)host.append(mk('p','Nenhuma revisão salva para esta carta nesta conta.'));
 for(const row of list){const button=mk('button',new Date(row.savedAt).toLocaleString('pt-BR')+' · '+C.MODES[row.options.style]+' · '+(row.review.functionPlan?.label||row.options.functionKey)+(row.stale?' · dados anteriores':''));button.type='button';button.onclick=()=>{review=row.review;context=null;historical=true;paint(review,true);say(row.stale?'Revisão de dados anteriores. O cadastro atual permanece preservado.':'Revisão salva aberta para consulta.');$('sheet-result').scrollIntoView({block:'start'});};host.append(button);}}
try{card=readCard();base();const managerApi=window.CRAQUE_MANAGERS_V302;
 const [catalog,source]=await Promise.all([managerApi.load(),fetch('ct376-card-references.json').then(r=>r.ok?r.json():null).catch(()=>null)]);
 references=Array.isArray(source?.cards)?source.cards:[];card=readCard();
 managers=account==='secondary'?A.read(localStorage).secondary.managers:[...catalog.tecnicos.map(m=>A.normalManager({id:m.catalog_id,name:m.nome,edition:m.versao_lancamento,proficiency:Object.fromEntries(Object.keys(C.MODES).map(s=>[s,managerApi.proficiency(m,s)])),bonuses:m.boosters_EN,bonusesVerified:false})),...A.read(localStorage).primary.managers];
 options($('sheet-manager'),[['','Escolha técnico e edição'],...managers.map(m=>[m.id,m.name+' · '+(m.edition||'edição a conferir')])]);options($('sheet-style'),Object.entries(C.MODES));options($('sheet-position'),A.POS.filter(p=>(p==='GO')===(card.position==='GO')).map(p=>[p,p+(card.positions.includes(p)?'':' · familiaridade a conferir')]),card.position);functions();
 $('sheet-position').onchange=()=>{functions();invalidated();};for(const key of ['sheet-style','sheet-manager','sheet-function','sheet-instruction','sheet-defence-instruction'])$(key).onchange=invalidated;
 $('sheet-generate').onclick=()=>{try{card=readCard();base();const opts={style:$('sheet-style').value,manager:managers.find(m=>m.id===$('sheet-manager').value)||null,position:$('sheet-position').value,functionKey:$('sheet-function').value,instructions:[$('sheet-instruction').value,$('sheet-defence-instruction').value].filter(Boolean)};context=L.individualContext(card,opts);review=C.recommend(context,deps).cards[0].review;historical=false;paint(review);say('Proposta individual da '+label+'. Para avaliar apoios e cobertura, monte também o plano do time.');}catch(e){say(e.message);}};
 $('sheet-save').onclick=()=>{try{if(!review||!context||historical)return;L.saveSheet(localStorage,account,card,context,review);history();window.dispatchEvent(new Event('craque:data-changed'));say('Nova revisão salva na '+label+'. Nenhum treino ou item foi aplicado no jogo.');}catch(e){say(e.message);}};
 $('sheet-export').onclick=async()=>{try{if(!review)return;await window.SCOUT_FILE_EXPORT.saveJson({schema:L.SHEET_SCHEMA,accountId:account,cardId:card.id,contextSignature:context?.signature||review.contextSignature||null,historical,review},'craque-ficha-'+account+'-'+card.id+'.json');say('Exportação solicitada. Confira o arquivo salvo.');}catch(e){say(e.message);}};
 $('sheet-edit').disabled=false;$('sheet-edit').onclick=()=>window.CRAQUE_ACCOUNT_EDITOR_V385.open({accountId:account,card,onSaved:()=>location.reload()});
 window.addEventListener('storage',e=>{if(e.key===A.KEY){invalidated();say('Dados atualizados em outra janela. Reabra a carta para conferir a edição atual.');}});
 history();document.body.dataset.ct385Sheet='ready';say('Carta da conta '+label+'. Escolha o contexto e gere a ficha.');
}catch(e){say(e.message);document.body.dataset.ct385Sheet='error';$('sheet-name').textContent='Confira a conta da carta';$('sheet-generate').disabled=true;}
})();
