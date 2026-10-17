/* Scout PRO V219 — UI do rodízio e registro de partidas.
 * Exclui apenas IDs informados/confirmados; NÃO deduz os 23 jogadores do Black.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[x]));
const engine=window.SCOUT_ROTATION_V219, restrictions=window.SCOUT_RESTRICT_V222;
const KEY_BLACK='scoutpro:v219:black-caps',KEY_BLACK_REVIEW='scoutpro:v222:black-reviewed',KEY_MATCHES='scoutpro:v219:match-logs';
let cards=[],byCap=new Map(),images=new Map(),formats=[],active='4312',cycle=1,sheets={},excluded=[],userReviewed=false,gameLogs={},opened=null;
const status=(id,v)=>{const e=$(id);if(e)e.textContent=v};
const len=x=>Array.isArray(x)?x.length:0;
const getCard=cap=>byCap.get(Number(cap));
function stored(key,fallback){
 try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(_e){return fallback}
}
function persist(key,value){
 try{localStorage.setItem(key,JSON.stringify(value));document.dispatchEvent(new CustomEvent('craque:data-changed'));return true}catch(_e){return false}
}
// V225: cópia Android em SharedPreferences para recuperação sem nova seleção.
function nativeRosterStore(){
 const cap=window.Capacitor;
 if(!cap?.isNativePlatform?.()||cap?.getPlatform?.()!=='android')return null;
 return cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport')||null;
}
let mirrorQueue=Promise.resolve();
function backupRosterNative(){
 const plugin=nativeRosterStore();
 if(!plugin?.storeRoster)return Promise.resolve();
 const record=JSON.stringify(restrictions.makeRecord(excluded,cards,userReviewed));
 mirrorQueue=mirrorQueue.catch(()=>{}).then(()=>plugin.storeRoster({record}));
 return mirrorQueue;
}
async function restoreRosterNativeWhenNeeded(){
 const plugin=nativeRosterStore();
 if(!plugin?.loadRoster)return;
 try{
  const previous=await plugin.loadRoster();
  if(localStorage.getItem(KEY_BLACK)===null&&previous?.record){
   const checked=restrictions.readRecord(JSON.parse(previous.record),cards);
   const numbers=checked.excluded.map(x=>x.numero);
   if(!persist(KEY_BLACK,numbers)||!persist(KEY_BLACK_REVIEW,{caps:numbers,userReviewed:checked.userReviewed}))
    throw Error('Não foi possível restaurar o armazenamento do aplicativo');
  }
 }catch(e){status('black-feedback','Aviso de recuperação: '+String(e.message||e))}
}
function parseIds(raw){
 const values=String(raw||'').match(/\d+/g)||[],ids=values.map(Number);
 const invalid=ids.filter(n=>!byCap.has(n)),unique=[...new Set(ids)];
 return {ids:unique.filter(n=>byCap.has(n)).sort((a,b)=>a-b),invalid,duplicates:ids.length-unique.length};
}
function selected(){
 return sheets[active+'-'+cycle];
}
const rosterSignature=team=>engine.rosterFingerprint(team,excluded,cards);
function rosterLogs(team){
 return (gameLogs[team.id]||[]).filter(x=>x.rosterSignature===rosterSignature(team));
}
function lineupSnapshot(team){
 const identity=cap=>{const c=getCard(cap);return {numero:Number(cap),card_id:String(c?.id??''),edicao:String(c?.versao??'')};};
 return {formation:team.formation,cycle,teamId:team.id,
  starters:team.starters.map(s=>({slot:s.slot,...identity(s.cap)})),
  bench:team.bench.map(b=>identity(b.cap))};
}
function photoStatus(){
 return excluded.length===23?(userReviewed?
 '23 cartas bloqueadas nas duas formações. Conferência pessoal declarada; imagens não foram verificadas externamente.':
 '23 cartas selecionadas. Confira cada edição nas fotos do Black antes de considerar o bloqueio definitivo.') :
 'PRÉVIA INCOMPLETA: '+excluded.length+' de 23 jogadores restritos. As equipes ainda podem incluir jogadores do mapeamento que não foram selecionados.';
}
function blackButtons() {
 const state=excluded.length;
 $('black-count').textContent=state+' / 23';
 $('black-selected-count').textContent=state+' protegidas';
 $('black-protected-label').textContent=state+' de 23';
 const checkbox=$('black-reviewed');checkbox.disabled=state!==23;checkbox.checked=state===23&&userReviewed;
}
function imageFor(cap){
 const src=String(images.get(cap)||'');
 return src.startsWith('cartas/')&&!src.includes('..')?src:'';
}
function playerChoice(c,reserved){
 const cap=Number(c.numero),src=imageFor(cap),id='#'+String(cap).padStart(3,'0');
 return '<article class="scout-rotation-picker-card" data-pick-id="'+cap+'">'+
 (src?'<img loading="lazy" src="'+esc(src)+'" alt="">':'<span class="scout-rotation-noart">'+id+'</span>')+
 '<div class="scout-rotation-picker-meta"><strong>'+esc(c.name)+'</strong>'+
 '<small>'+id+' · '+esc(c.posicao)+' · '+esc(c.estilo_ataque)+'</small>'+
 '<small class="scout-rotation-edition">'+esc(c.versao||'Edição pendente')+'</small>'+
 '<small class="scout-rotation-edition">Card ID: '+esc(c.id||'não cadastrado')+'</small></div>'+
 '<button type="button" class="scout-rotation-btn '+(reserved?'unpick':'pick')+'" data-black-cap="'+cap+'" data-action="'+(reserved?'remove':'add')+'"'+(!reserved&&excluded.length>=23?' disabled':'')+
 ' aria-label="'+(reserved?'Remover restrição':'Restringir carta')+' '+esc(c.name)+'">'+
 (reserved?'Liberar':'Restringir')+'</button></article>';
}
function renderPicker(){
 blackButtons();
 const current=new Set(excluded),reserved=excluded.map(n=>getCard(n)).filter(Boolean);
 $('black-reserved').innerHTML=reserved.length?
 reserved.map(c=>playerChoice(c,true)).join(''):'<p class="scout-rotation-subtext">Nenhuma carta protegida. Busque as cartas da foto para excluí-las das duas formações.</p>';
 const filterValue=$('black-position').value;
 const query=$('black-search').value;
 const matches=restrictions.filter(cards,query,filterValue,48);
 $('black-candidate-count').textContent=matches.total+' cartas encontradas · mostrando '+matches.visible+' · selecione até 23.';
 $('black-candidates').innerHTML=matches.items.map(c=>current.has(Number(c.numero))?
 '<article class="scout-rotation-picker-card selected"><strong>'+esc(c.name)+'</strong><span class="scout-rotation-subtext">#'+String(c.numero).padStart(3,'0')+' protegida na lista acima</span></article>':
 playerChoice(c,false)).join('')||'<p class="scout-rotation-subtext">Nenhuma carta encontrada. Remova os filtros para voltar ao catálogo.</p>';
}
function updateBlack(ids,{reviewed=false,message='Lista atualizada nas duas formações.'}={}){
 const valid=restrictions.validateCaps(ids,cards);
 const newReviewed=valid.length===23&&reviewed===true;
 if(!persist(KEY_BLACK,valid)||!persist(KEY_BLACK_REVIEW,{caps:valid,userReviewed:newReviewed}))
  throw Error('O dispositivo não permitiu salvar as 23 restrições. Libere espaço e tente novamente; nenhuma carta foi alterada.');
 excluded=valid;
 userReviewed=newReviewed;
 backupRosterNative().catch(e=>status('black-feedback','Restrições salvas no app; cópia nativa indisponível: '+String(e.message||e)));
 $('black-input').value=valid.join(', ');
 opened=null;
 recompute();
 renderPicker();
 status('black-feedback',message+' '+photoStatus());
}
function inventory(){
 const a=engine.analyze(cards,excluded);
 status('black-count',a.excluded+' / 23');
 const board=$('craque-lab-snapshot');
 if(board)board.innerHTML='<span>246 cartas originais</span><span>'+a.excluded+' protegidas</span><span>'+a.available+' livres</span><span>'+a.maxTeams+' equipes por formação</span>';
 status('rotation-inventory',a.cards+' cartas reais · '+a.excluded+' reservadas · '+a.available+' disponíveis · '+a.maxTeams+' equipes completas possíveis por série · '+a.remaining+' cartas fora de equipes completas.');
 status('black-feedback',photoStatus());
}
function formatNumbers(arr){return arr.map(n=>'#'+String(n).padStart(3,'0')).join(', ')}
function diagnostics(){
 const sheet=selected(),a=sheet.counts,links=sheet.teams.filter(t=>t.linkup.documentaryMatch).length;
 const caveats=sheet.teams.filter(t=>t.warnings.some(w=>w.includes('adaptação')||w.includes('fora da posição'))).length;
 const nativeSA=sheet.teams.filter(t=>t.starters.some(s=>s.slot==='sa'&&s.fit==='posição original')).length;
 $('series-diagnostics').innerHTML=
  '<strong>'+sheet.teams.length+' equipes · 11 titulares + 12 reservas</strong> · '+(excluded.length===23?'23 restrições selecionadas. ':'PRÉVIA: confirme as 23 cartas proibidas. ')+esc(formatNumbers(sheet.leftovers))+' fora desta rodada (entram na rodada '+(cycle===1?'2':'1')+')'+ 
  '<p>'+a.keepers+' goleiros elegíveis · '+(sheet.teams.some(t=>!t.ready)?'Elencos incompletos exigem conferência; não repetir cartas. ':'')+(a.goalkeeperLimited?'NÚMERO LIMITADO PELOS GOLEIROS: não repetir goleiro entre equipes. ':'')+
  'Série '+esc(active)+' · Rodada '+cycle+': '+links+' equipes com requisitos documentais simultâneos de Link-Up (não confirma ativação no jogo) · '+caveats+' equipes com possíveis adaptações.'+
  (active==='4213'?' SA na posição original: '+nativeSA+' equipe(s).':'')+'</p>'+
  '<p class="scout-rotation-caution">'+esc(photoStatus())+'</p>';
}
function cardRow(cap,role,fit,slot){
 const c=getCard(cap);if(!c)return '';
 const image=images.get(cap),file=String(c.arquivo||'');
 const anchor=file.startsWith('fichas/')&&file.endsWith('.html')?file:'#';
 return '<article class="scout-rotation-player">'+
  (image?'<img loading="lazy" src="'+esc(image)+'" alt="">':'<span class="scout-rotation-noart">#'+esc(cap)+'</span>')+
  '<div><strong>'+esc(c.name)+'</strong><small>#'+String(cap).padStart(3,'0')+' · '+esc(role)+' · '+esc(c.estilo_ataque)+'</small>'+
  (fit&&fit!=='posição original'?'<small class="scout-rotation-caution">Adaptação a confirmar no jogo</small>':'')+
  '</div><a href="'+esc(anchor)+'" aria-label="Abrir ficha de '+esc(c.name)+'">Ficha ↗</a></article>';
}
function metrics(team){
 const list=rosterLogs(team),win=list.filter(x=>x.result==='V').length,draw=list.filter(x=>x.result==='E').length,loss=list.filter(x=>x.result==='D').length;
 const gf=list.reduce((s,x)=>s+Number(x.goals||0),0),ga=list.reduce((s,x)=>s+Number(x.conceded||0),0);
 const history=(gameLogs[team.id]||[]).length-list.length;
  return list.length+' partidas · '+win+'V '+draw+'E '+loss+'D · '+gf+' gols pró / '+ga+' contra'+
   (history?' · '+history+' registro(s) de outro elenco preservados no JSON':'');
}
function teamHTML(team){
 return '<details class="scout-rotation-team" data-team="'+esc(team.id)+'"'+(opened===team.id?' open':'')+'>'+
 '<summary><span class="scout-rotation-team-num">'+String(team.index).padStart(2,'0')+'</span><span><strong>'+esc(team.name)+'</strong><small>'+metrics(team)+' · '+team.starters.length+'/11 titulares · '+team.bench.length+'/12 reservas</small></span><span class="scout-rotation-readiness">'+(team.ready?(team.requiresPositionReview?'Lista completa · rever posição':'Lista completa · posições originais'):'Revisar')+'</span></summary>'+
 '<div class="scout-rotation-team-inside"><div class="scout-rotation-tactical">'+
  '<div><b>POSSE 4-'+(active==='4312'?'3-1-2':'2-1-3')+'</b><span>'+team.starters.length+' titulares · '+team.bench.length+' reservas sem duplicação</span></div>'+
  '<div class="scout-rotation-field">'+formats.find(f=>f.id===active).rows.map(row=>
   '<div class="scout-rotation-field-row">'+row.map(slot=>{
    const s=team.starters.find(x=>x.slot===slot),c=getCard(s?.cap);
    return c?'<div class="scout-rotation-field-spot'+(s.fit!=='posição original'?' provisional':'')+'" title="'+esc(s.fit)+'">'+
      (images.get(s.cap)?'<img loading="lazy" src="'+esc(images.get(s.cap))+'" alt="">':'')+
      '<strong>'+esc(c.name)+'</strong><small>'+esc(slot.toUpperCase())+(s.fit!=='posição original'?' · A conferir':'')+'</small></div>':
      '<div class="scout-rotation-field-spot missing">'+esc(slot.toUpperCase())+'<small>Pendente</small></div>';
   }).join('')+'</div>').join('')+'</div></div>'+
 '<div class="scout-rotation-players"><section><h3>11 titulares</h3>'+team.starters.map(s=>cardRow(s.cap,s.role,s.fit,s.slot)).join('')+
 '</section><section><h3>12 reservas</h3>'+team.bench.map(b=>cardRow(b.cap,b.role)).join('')+'</section></div>'+
 '<section class="scout-rotation-audit"><h3>Revisão tática e documental</h3>'+
 '<p>VOL Orquestrador: '+(team.linkup.volOrchestrator?'identificado':'não identificado')+' · CA Artilheiro: '+(team.linkup.caArtilheiro?'identificado':'não identificado')+
 ' · MAT Armador criativo: '+(team.linkup.matCreative?'identificado':'não identificado')+'. Link-Up ativo no jogo: NÃO CONFIRMADO.</p>'+
 (team.warnings.length?'<ul>'+team.warnings.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':
 '<p>Todos os 11 titulares usam sua posição principal cadastrada. Estilos e movimentação ainda precisam ser testados.</p>')+
 '</section><section class="scout-rotation-match"><h3>Registrar partida de teste</h3>'+
 '<form data-match="'+esc(team.id)+'"><label>Resultado<select name="result"><option value="V">Vitória</option><option value="E">Empate</option><option value="D">Derrota</option></select></label>'+
 '<label>Gols marcados<input name="goals" type="number" min="0" max="30" value="0" required></label>'+
 '<label>Gols sofridos<input name="conceded" type="number" min="0" max="30" value="0" required></label>'+
 '<label class="wide">Nome do vídeo MP4 (opcional)<input name="video" type="text" maxlength="120" placeholder="Ex.: Partida_4312_01.mp4"></label>'+
 '<label class="wide">O que aconteceu em campo?<textarea name="notes" maxlength="1200" rows="3" placeholder="Ex.: SA recuou, gol após tabela, VOL perdeu a marcação…"></textarea></label>'+
 '<button class="scout-rotation-btn main" type="submit">Salvar partida neste dispositivo</button></form>'+
 '<p class="scout-rotation-subtext">'+rosterLogs(team).slice(-4).reverse().map(x=>esc(x.when+' · '+x.result+' '+x.goals+'–'+x.conceded+(x.video?' · '+x.video:''))).join('<br>')+'</p></section></div></details>';
}
function render(){
 diagnostics();
 $('squads').innerHTML=selected().teams.map(teamHTML).join('');
 $('squads').querySelectorAll('details[data-team]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)opened=d.dataset.team}));
 $('squads').querySelectorAll('form[data-match]').forEach(f=>f.addEventListener('submit',ev=>{
  ev.preventDefault();const id=f.dataset.match,values=new FormData(f);
  const goals=Number(values.get('goals')),conceded=Number(values.get('conceded'));
  if(![goals,conceded].every(n=>Number.isInteger(n)&&n>=0&&n<=30))return;
  const team=selected().teams.find(t=>t.id===id);if(!team)return;
  const list=gameLogs[id]||[];
  list.push({when:new Date().toISOString(),rosterSignature:rosterSignature(team),
   lineupSnapshot:lineupSnapshot(team),result:String(values.get('result')),
   goals,conceded,video:String(values.get('video')||'').trim().slice(0,120),
   notes:String(values.get('notes')||'').trim().slice(0,1200)});
  gameLogs[id]=list.slice(-100);
  if(!persist(KEY_MATCHES,gameLogs)){list.pop();gameLogs[id]=list;status('black-feedback','Não foi possível salvar esta partida no dispositivo. Confira o armazenamento.');return}
   opened=id;render();
 }));
}
function recompute(){
 sheets={};
 for(const f of formats)for(const n of [1,2])sheets[f.id+'-'+n]=engine.build(cards,f,excluded,n);
 inventory();render();
}
function promptForTeam(team){
 const rows=team.starters.map(s=>{const c=getCard(s.cap);return s.role+': #'+s.cap+' '+c.name+' ('+c.estilo_ataque+'), '+s.fit});
 const bench=team.bench.map(b=>{const c=getCard(b.cap);return '#'+b.cap+' '+c.name});
 const desc='Analise o vídeo da partida do eFootball 2027 junto com esta escalação real do meu Craque Tático. '+
 'Identifique decisões, tabelas, passe curto, posicionamento, perdas de posse e erros táticos com minuto/segundo quando visíveis. '+
 'Avalie os jogadores individualmente somente quando eles aparecerem no vídeo; marque evidência incerta como não observada. '+
 'Não invente movimentos, estatísticas, IDs corporais ou jogadas. Sugira mudanças para Posse de Bola e compare com a 4-3-1-2 ou 4-2-1-3.\n'+
 'Equipe: '+team.name+'\nTitulares:\n'+rows.join('\n')+'\nReservas:\n'+bench.join('\n')+
 '\nObservações registradas:\n'+rosterLogs(team).map(x=>x.when+' '+x.result+' '+x.goals+'-'+x.conceded+' '+x.notes).join('\n');
 return desc;
}
async function copyText(s){
 try{await navigator.clipboard.writeText(s);return true}catch(_e){}
 try{window.prompt('Copie este texto para o ChatGPT:',s)}catch(_e){}
 return false;
}
function nativeRecorder(){
 const cap=window.Capacitor;
 if(!cap?.isNativePlatform?.()||cap.getPlatform?.()!=='android')return null;
 try{return cap.Plugins?.ScoutRecorder||cap.registerPlugin?.('ScoutRecorder')||null}catch(_e){return null}
}
let rec=null;
async function initRecorder(){
 rec=nativeRecorder();
 if(!rec){
  status('rec-feedback','Gravador interno disponível somente no APK Android com o módulo nativo V219. Em versões anteriores, use o gravador de tela do Android e compartilhe o vídeo pelo app Arquivos.');
  $('rec-start').disabled=$('rec-stop').disabled=$('rec-share').disabled=true;return;
 }
 try{
  const s=await rec.getStatus();$('rec-stop').disabled=!s.recording;$('rec-share').disabled=!s.hasVideo;
  status('rec-feedback',s.recording?'Gravação em andamento. Abra o eFootball; para encerrar, use a notificação do sistema.':
   (s.hasVideo?'Existe uma gravação anterior pronta para compartilhar.':'Gravador nativo disponível. É necessário autorizar cada captura.'));
 }catch(e){status('rec-feedback','Gravador não respondeu: '+(e.message||e))}
 $('rec-start').addEventListener('click',async()=>{
  try{status('rec-feedback','Solicitando autorização Android…');const s=await rec.startRecording();
   status('rec-feedback',s.status==='started'?'Gravando! Abra o eFootball. A notificação permite parar a captura.':
    String(s.message||'Solicitação enviada.'));
   $('rec-stop').disabled=false;
  }catch(e){status('rec-feedback','Gravação não iniciada: '+(e.message||e))}
 });
 $('rec-stop').addEventListener('click',async()=>{
  try{const s=await rec.stopRecording();status('rec-feedback',s.message||'Gravação encerrada. O arquivo MP4 foi salvo em Filmes/ScoutPRO.');
   $('rec-stop').disabled=true;$('rec-share').disabled=false;
  }catch(e){status('rec-feedback','Erro ao parar gravação: '+(e.message||e))}
 });
 $('rec-share').addEventListener('click',async()=>{
  try{await rec.shareRecording();status('rec-feedback','Compartilhamento aberto. Selecione o ChatGPT ou salve o MP4 para anexar manualmente; confirme o envio.')}
  catch(e){status('rec-feedback','Não foi possível compartilhar: '+(e.message||e))}
 });
}
async function init(){
 if(!engine||!restrictions)throw Error('Motor de formações e restrições indisponível no pacote offline');
 const files=await Promise.all([
  fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('Elenco offline ausente');return r.json()}),
  fetch('SCOUT_V177_DUAS_FORMACOES.json').then(r=>{if(!r.ok)throw Error('Tática não encontrada');return r.json()}),
  fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>{if(!r.ok)throw Error('Imagens ausentes');return r.json()})
 ]);
 cards=files[0].cards;formats=files[1].formations;
 if(cards.length!==246||formats.length!==2||files[2].cartas.length!==246)throw Error('O projeto precisa conter as 246 cartas originais e as duas formações.');
 byCap=new Map(cards.map(c=>[Number(c.numero),c]));
 images=new Map(files[2].cartas.map(c=>[Number(c.numero),String(c.imagem||'')]));
 gameLogs=stored(KEY_MATCHES,{});
 await restoreRosterNativeWhenNeeded();
 const storedBlack=stored(KEY_BLACK,[]);
 excluded=restrictions.validateCaps(Array.isArray(storedBlack)?storedBlack:[],cards);
 const savedReview=stored(KEY_BLACK_REVIEW,{});
 userReviewed=Boolean(savedReview?.userReviewed&&excluded.length===23&&
  JSON.stringify(savedReview.caps)===JSON.stringify(excluded));
 backupRosterNative().catch(e=>status('black-feedback','Cópia nativa não disponível: '+String(e.message||e)));
 const positions=[...new Set(cards.map(c=>String(c.posicao||'')).filter(Boolean))].sort();
 for(const position of positions){
  const item=document.createElement('option');item.value=position;item.textContent=position;
  $('black-position').append(item);
 }
 $('black-search').addEventListener('input',renderPicker);
 $('black-position').addEventListener('change',renderPicker);
 function pick(event){
  const btn=event.target.closest('button[data-black-cap]');if(!btn)return;
  const cap=Number(btn.dataset.blackCap),change=btn.dataset.action;
  if(!byCap.has(cap))return;
  const next=change==='remove'?excluded.filter(n=>n!==cap):[...excluded,cap];
  try{updateBlack(next,{message:(change==='remove'?'Carta liberada: ':'Carta protegida: ')+
   '#'+String(cap).padStart(3,'0')+'.'})}catch(e){status('black-feedback',String(e.message||e))}
 }
 $('black-candidates').addEventListener('click',pick);
 $('black-reserved').addEventListener('click',pick);
 $('black-reviewed').addEventListener('change',()=>{
  if(excluded.length!==23){$('black-reviewed').checked=false;return}
  userReviewed=$('black-reviewed').checked;
  if(!persist(KEY_BLACK_REVIEW,{caps:excluded.slice(),userReviewed})){
   status('black-feedback','Não foi possível salvar a conferência no dispositivo.');return;
  }
  backupRosterNative().catch(e=>status('black-feedback','Cópia nativa não disponível: '+String(e.message||e)));
  inventory();diagnostics();
 });
 $('black-input').value=excluded.join(', ');
 $('black-save').addEventListener('click',()=>{
  const input=parseIds($('black-input').value);
  if(input.invalid.length){status('black-feedback','Números não encontrados no catálogo: '+input.invalid.join(', '));return}
  if(input.ids.length>23){status('black-feedback','Limite: a formação enviada pelo Black contém 23 cartas. Confira os números e tente novamente.');return}
  updateBlack(input.ids,{message:'Exclusões aplicadas sem apagar cartas.'+(input.duplicates?' Entradas repetidas ignoradas: '+input.duplicates+'.':'')});
 });
 $('black-clear').addEventListener('click',()=>{
  if(!confirm('Limpar apenas a lista local de exclusões? Isso não altera o catálogo original.'))return;
  updateBlack([],{message:'Lista de restrições limpa neste dispositivo.'});
 });
 document.querySelectorAll('button[data-series]').forEach(button=>button.addEventListener('click',()=>{
  active=button.dataset.series;opened=null;
  document.querySelectorAll('button[data-series]').forEach(b=>{
   const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));
  });render();
 }));
 document.querySelectorAll('button[data-cycle]').forEach(button=>button.addEventListener('click',()=>{
  cycle=Number(button.dataset.cycle);opened=null;
  document.querySelectorAll('button[data-cycle]').forEach(b=>{const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
  render();
 }));
 $('black-export').addEventListener('click',async()=>{
  const btn=$('black-export');btn.disabled=true;
  try{
   const file=restrictions.makeRecord(excluded,cards,userReviewed);
   const result=await window.SCOUT_FILE_EXPORT.saveJson(file,'ScoutPRO-23-Jogadores-Black-V225.json');
   status('black-feedback',result.status==='saved'
    ?'Lista de '+excluded.length+' restrições salva no local escolhido, com Card IDs e edições.'
    :result.status==='cancelled'?'Exportação cancelada; bloqueios mantidos neste dispositivo.'
    :'Download solicitado no navegador. Confira o arquivo na pasta Downloads.');
  }catch(e){status('black-feedback','Falha na exportação: '+String(e.message||e))}
  finally{btn.disabled=false}
 });
 $('black-import').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
   if(file.size>150000)throw Error('Arquivo muito grande para uma lista de 23 cartas');
   const imported=restrictions.readRecord(JSON.parse(await file.text()),cards);
   updateBlack(imported.excluded.map(x=>x.numero),{
    reviewed:imported.userReviewed,
    message:'Lista importada e conferida por número, nome e Card ID. Nenhuma carta original foi alterada.'
   });
  }catch(e){status('black-feedback','Importação recusada: '+String(e.message||e))}
  finally{event.target.value=''}
 });
 $('rotation-export').addEventListener('click',async()=>{
  const btn=$('rotation-export');btn.disabled=true;
  try{
   const data={schema:'SCOUT_MATCH_ANALYSIS_V225',updated:new Date().toISOString(),
    excludedBlackCaps:excluded.slice(),blackUserReviewed:userReviewed,blackVisualVerified:false,
    originalRosterCards:cards.length,series:sheets,
    matches:gameLogs,note:'Elencos e partidas reais cadastradas; fotos do Black ainda exigem confirmação de edição e Card ID.'};
   const result=await window.SCOUT_FILE_EXPORT.saveJson(data,'ScoutPRO-Elencos-e-Partidas-V225.json');
   status('black-feedback',result.status==='saved'?'Elencos e registros exportados com sucesso.'
    :result.status==='cancelled'?'Exportação cancelada; seus resultados permanecem no dispositivo.'
    :'Download solicitado; confira o arquivo na pasta Downloads.');
  }catch(e){status('black-feedback','Falha ao exportar elencos: '+String(e.message||e))}
  finally{btn.disabled=false}
 });
 $('rotation-backup').addEventListener('click',async()=>{
  const button=$('rotation-backup');button.disabled=true;
  try{
   const keys=Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:'));
   const items=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
   const data={format:'scoutpro-userdata-v1',exported_at:new Date().toISOString(),items};
   const outcome=await window.SCOUT_FILE_EXPORT.saveJson(data,'ScoutPRO-Backup-Completo-V225.json');
   status('black-feedback',outcome.status==='saved'?'Backup completo salvo ('+keys.length+' registros).'
     :outcome.status==='cancelled'?'Backup cancelado. Seus dados continuam no dispositivo.'
     :'Download de backup solicitado; confira o arquivo no navegador.');
  }catch(e){status('black-feedback','Falha ao salvar backup completo: '+String(e.message||e))}
  finally{button.disabled=false}
 });
 $('rotation-prompt').addEventListener('click',async()=>{
  const sheet=selected(),team=sheet.teams.find(t=>t.id===opened)||sheet.teams[0];
  if(!team){status('black-feedback','Nenhuma equipe completa disponível nesta seleção.');return}
  const result=await copyText(promptForTeam(team));
  status('black-feedback',result?'Escalação copiada. Anexe o vídeo e cole o texto na conversa do ChatGPT.':'Texto disponível para cópia.');
 });
 recompute();renderPicker();await initRecorder();
}
init().catch(e=>{status('rotation-inventory','Não foi possível iniciar: '+(e.message||e));console.error(e)});
})();
