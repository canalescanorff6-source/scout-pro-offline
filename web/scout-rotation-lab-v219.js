/* Scout PRO V219 — UI do rodízio e registro de partidas.
 * Exclui apenas IDs informados/confirmados; NÃO deduz os 22 jogadores do Black.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[x]));
const engine=window.SCOUT_ROTATION_V219;
const KEY_BLACK='scoutpro:v219:black-caps',KEY_MATCHES='scoutpro:v219:match-logs';
let cards=[],byCap=new Map(),images=new Map(),formats=[],active='4312',sheets={},excluded=[],gameLogs={},opened=null;
const status=(id,v)=>{const e=$(id);if(e)e.textContent=v};
const len=x=>Array.isArray(x)?x.length:0;
const getCard=cap=>byCap.get(Number(cap));
function stored(key,fallback){
 try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(_e){return fallback}
}
function persist(key,value){
 try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_e){return false}
}
function parseIds(raw){
 const values=String(raw||'').match(/\d+/g)||[],ids=values.map(Number);
 const invalid=ids.filter(n=>!byCap.has(n)),unique=[...new Set(ids)];
 return {ids:unique.filter(n=>byCap.has(n)).sort((a,b)=>a-b),invalid,duplicates:ids.length-unique.length};
}
function selected(){
 return sheets[active];
}
function inventory(){
 const a=engine.analyze(cards,excluded);
 status('black-count',a.excluded+' / 22');
 status('rotation-inventory',a.cards+' cartas reais · '+a.excluded+' reservadas · '+a.available+' disponíveis · '+a.maxTeams+' equipes completas possíveis por série · '+a.remaining+' cartas fora de equipes completas.');
 status('black-feedback',!a.listComplete?
  'Prévia: a lista contém '+a.excluded+' cartas. Para tratar como mapeamento completo, confirme as 22 cartas pelas fotos do Black.':
  '22 IDs catalogados na lista de exclusão. Confira os jogadores nas fotos: ainda não foi realizada validação visual externa.');
}
function formatNumbers(arr){return arr.map(n=>'#'+String(n).padStart(3,'0')).join(', ')}
function diagnostics(){
 const sheet=selected(),a=sheet.counts,links=sheet.teams.filter(t=>t.linkup.documentaryMatch).length;
 const caveats=sheet.teams.filter(t=>t.warnings.some(w=>w.includes('adaptação')||w.includes('fora da posição'))).length;
 const nativeSA=sheet.teams.filter(t=>t.starters.some(s=>s.slot==='sa'&&s.fit==='posição original')).length;
 $('series-diagnostics').innerHTML=
  '<strong>'+sheet.teams.length+' equipes · 11 titulares + 11 reservas</strong> · '+esc(formatNumbers(sheet.leftovers))+' fora do ciclo completo'+
  '<p>'+a.keepers+' goleiros elegíveis · '+(a.goalkeeperLimited?'NÚMERO LIMITADO PELOS GOLEIROS: não repetir goleiro entre equipes. ':'')+
  'Série '+esc(active)+': '+links+' equipes com requisitos documentais simultâneos de Link-Up (não confirma ativação no jogo) · '+caveats+' equipes com possíveis adaptações.'+
  (active==='4213'?' SA na posição original: '+nativeSA+' equipe(s).':'')+'</p>'+
  (a.requiresBlackPhoto?'<p class="scout-rotation-caution">Os 22 jogadores do Black ainda não foram conferidos: lista provisória. Não use estes elencos como exclusão definitiva.</p>':'');
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
 const list=gameLogs[team.id]||[],win=list.filter(x=>x.result==='V').length,draw=list.filter(x=>x.result==='E').length,loss=list.filter(x=>x.result==='D').length;
 const gf=list.reduce((s,x)=>s+Number(x.goals||0),0),ga=list.reduce((s,x)=>s+Number(x.conceded||0),0);
 return list.length+' partidas · '+win+'V '+draw+'E '+loss+'D · '+gf+' gols pró / '+ga+' contra';
}
function teamHTML(team){
 return '<details class="scout-rotation-team" data-team="'+esc(team.id)+'"'+(opened===team.id?' open':'')+'>'+
 '<summary><span class="scout-rotation-team-num">'+String(team.index).padStart(2,'0')+'</span><span><strong>'+esc(team.name)+'</strong><small>'+metrics(team)+' · '+team.starters.length+'/11 titulares · '+team.bench.length+'/11 reservas</small></span><span class="scout-rotation-readiness">'+(team.ready?'Lista completa':'Revisar')+'</span></summary>'+
 '<div class="scout-rotation-team-inside"><div class="scout-rotation-tactical">'+
  '<div><b>POSSE 4-'+(active==='4312'?'3-1-2':'2-1-3')+'</b><span>'+team.starters.length+' titulares · '+team.bench.length+' reservas sem duplicação</span></div>'+
  '<div class="scout-rotation-field">'+formats.find(f=>f.id===active).rows.map(row=>
   '<div class="scout-rotation-field-row">'+row.map(slot=>{
    const s=team.starters.find(x=>x.slot===slot),c=getCard(s?.cap);
    return c?'<div class="scout-rotation-field-spot">'+
      (images.get(s.cap)?'<img loading="lazy" src="'+esc(images.get(s.cap))+'" alt="">':'')+
      '<strong>'+esc(c.name)+'</strong><small>'+esc(slot.toUpperCase())+'</small></div>':
      '<div class="scout-rotation-field-spot missing">'+esc(slot.toUpperCase())+'<small>Pendente</small></div>';
   }).join('')+'</div>').join('')+'</div></div>'+
 '<div class="scout-rotation-players"><section><h3>11 titulares</h3>'+team.starters.map(s=>cardRow(s.cap,s.role,s.fit,s.slot)).join('')+
 '</section><section><h3>11 reservas</h3>'+team.bench.map(b=>cardRow(b.cap,b.role)).join('')+'</section></div>'+
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
 '<p class="scout-rotation-subtext">'+(gameLogs[team.id]||[]).slice(-4).reverse().map(x=>esc(x.when+' · '+x.result+' '+x.goals+'–'+x.conceded+(x.video?' · '+x.video:''))).join('<br>')+'</p></section></div></details>';
}
function render(){
 diagnostics();
 $('squads').innerHTML=selected().teams.map(teamHTML).join('');
 $('squads').querySelectorAll('details[data-team]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)opened=d.dataset.team}));
 $('squads').querySelectorAll('form[data-match]').forEach(f=>f.addEventListener('submit',ev=>{
  ev.preventDefault();const id=f.dataset.match,values=new FormData(f);
  const goals=Number(values.get('goals')),conceded=Number(values.get('conceded'));
  if(![goals,conceded].every(n=>Number.isInteger(n)&&n>=0&&n<=30))return;
  const list=gameLogs[id]||[];
  list.push({when:new Date().toISOString(),result:String(values.get('result')),
   goals,conceded,video:String(values.get('video')||'').trim().slice(0,120),
   notes:String(values.get('notes')||'').trim().slice(0,1200)});
  gameLogs[id]=list.slice(-100);
  persist(KEY_MATCHES,gameLogs);opened=id;render();
 }));
}
function recompute(){
 sheets={};
 for(const f of formats)sheets[f.id]=engine.build(cards,f,excluded);
 inventory();render();
}
function promptForTeam(team){
 const rows=team.starters.map(s=>{const c=getCard(s.cap);return s.role+': #'+s.cap+' '+c.name+' ('+c.estilo_ataque+'), '+s.fit});
 const bench=team.bench.map(b=>{const c=getCard(b.cap);return '#'+b.cap+' '+c.name});
 const desc='Analise o vídeo da partida do eFootball 2027 junto com esta escalação real do meu Scout PRO. '+
 'Identifique decisões, tabelas, passe curto, posicionamento, perdas de posse e erros táticos com minuto/segundo quando visíveis. '+
 'Avalie os jogadores individualmente somente quando eles aparecerem no vídeo; marque evidência incerta como não observada. '+
 'Não invente movimentos, estatísticas, IDs corporais ou jogadas. Sugira mudanças para Posse de Bola e compare com a 4-3-1-2 ou 4-2-1-3.\n'+
 'Equipe: '+team.name+'\nTitulares:\n'+rows.join('\n')+'\nReservas:\n'+bench.join('\n')+
 '\nObservações registradas:\n'+(gameLogs[team.id]||[]).map(x=>x.when+' '+x.result+' '+x.goals+'-'+x.conceded+' '+x.notes).join('\n');
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
 if(!engine)throw Error('Motor de formações ausente no pacote offline');
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
 excluded=stored(KEY_BLACK,[]);
 excluded=engine.analyze(cards,excluded).blocked;
 $('black-input').value=excluded.join(', ');
 $('black-save').addEventListener('click',()=>{
  const input=parseIds($('black-input').value);
  if(input.invalid.length){status('black-feedback','Números não encontrados no catálogo: '+input.invalid.join(', '));return}
  if(input.ids.length>22){status('black-feedback','Limite: a formação enviada pelo Black contém 22 cartas. Confira os números e tente novamente.');return}
  excluded=input.ids;persist(KEY_BLACK,excluded);
  status('black-feedback','Excluídos '+excluded.length+' jogadores sem remover cartas originais.'+(input.duplicates?' Entradas repetidas ignoradas: '+input.duplicates+'.':''));
  opened=null;recompute();
 });
 $('black-clear').addEventListener('click',()=>{
  if(!confirm('Limpar apenas a lista local de exclusões? Isso não altera o catálogo original.'))return;
  excluded=[];$('black-input').value='';persist(KEY_BLACK,excluded);opened=null;recompute();
 });
 document.querySelectorAll('button[data-series]').forEach(button=>button.addEventListener('click',()=>{
  active=button.dataset.series;opened=null;
  document.querySelectorAll('button[data-series]').forEach(b=>{
   const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));
  });render();
 }));
 $('rotation-export').addEventListener('click',()=>{
  const d={schema:'SCOUT_MATCH_ANALYSIS_V219',updated:new Date().toISOString(),
   excludedBlackCaps:excluded.slice(),blackVisualVerified:false,
   originalRosterCards:cards.length,series:{'4312':sheets['4312'],'4213':sheets['4213']},
   matches:gameLogs,note:'Análise e escalações exploratórias. Nenhum dado original alterado.'};
  const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ScoutPRO-Elencos-e-Partidas-V219.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 });
 $('rotation-prompt').addEventListener('click',async()=>{
  const sheet=selected(),team=sheet.teams.find(t=>t.id===opened)||sheet.teams[0];
  if(!team){status('black-feedback','Nenhuma equipe completa disponível nesta seleção.');return}
  const result=await copyText(promptForTeam(team));
  status('black-feedback',result?'Escalação copiada. Anexe o vídeo e cole o texto na conversa do ChatGPT.':'Texto disponível para cópia.');
 });
 recompute();await initRecorder();
}
init().catch(e=>{status('rotation-inventory','Não foi possível iniciar: '+(e.message||e));console.error(e)});
})();
