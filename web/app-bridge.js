(()=>{'use strict';

// V225 — salvar JSON com confirmação real via SAF Android / diálogo nativo Windows.
async function scoutSaveJson(data,fileName){
 const clean=String(fileName||'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,110);
 if(!clean.endsWith('.json')||clean==='.json')throw Error('Nome de exportação inválido');
 const content=JSON.stringify(data,null,2);
 if(!content)throw Error('Não há dados para exportar');
 const size=new Blob([content]).size;
 if(size>8*1024*1024)throw Error('Exportação ultrapassou 8 MB');
 const cap=window.Capacitor;
 const onAndroid=Boolean(cap?.isNativePlatform?.()&&cap?.getPlatform?.()==='android');
 if(onAndroid){
  const plugin=cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport');
  if(typeof plugin?.saveJson!=='function')
   throw Error('O salvamento de JSON exige a versão V225 ou posterior do APK Android.');
  const result=await plugin.saveJson({fileName:clean,content});
  if(!['saved','cancelled'].includes(result?.status))throw Error('O Android não confirmou o salvamento');
  return result;
 }
 if(typeof window.scoutDesktop?.saveJson==='function'){
  const result=await window.scoutDesktop.saveJson(clean,content);
  if(!['saved','cancelled'].includes(result?.status))throw Error('O Windows não confirmou o arquivo');
  return result;
 }
 const blob=new Blob([content],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 try{
  const anchor=document.createElement('a');anchor.href=url;anchor.download=clean;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
 }finally{setTimeout(()=>URL.revokeObjectURL(url),10000)}
 return {status:'requested'}; // Navegador: o usuário deve conferir o download.
}
window.SCOUT_FILE_EXPORT=Object.freeze({saveJson:scoutSaveJson});
// V360: visual estático por padrão; não ativar observadores nem shaders de cartas.
window.CRAQUE_MOTION_PAUSED_V360=true;
if(document.getElementById('scout-app-bar'))return;
const repo=String(window.SCOUT_GITHUB_REPO||'').trim();
const scoutNativeAndroid=Boolean(window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.()==='android');
if(scoutNativeAndroid)document.body.classList.add('scout-native-android');
const bar=document.createElement('aside');bar.id='scout-app-bar';bar.setAttribute('aria-label','Gerenciamento do Craque Tático');
bar.innerHTML='<div><strong>CRAQUE TÁTICO · OFFLINE</strong><span class="app-small" id="scout-update-label">246 fichas no dispositivo · atualização quando houver conexão</span></div><nav class="scout-page-actions" aria-label="Navegação Craque Tático"><button id="scout-back" type="button">← Voltar</button><a id="scout-home" href="#">⌂ Elenco</a><button id="scout-top" type="button">↑ Topo</button></nav><div class="app-actions"><button id="scout-backup" type="button">Meus dados</button><button id="scout-update" type="button">Atualizar</button></div>';
document.body.appendChild(bar);
const inCard=location.pathname.includes('/fichas/');
// V354: um único ponto de atualização da marca para as 246 fichas.
 // Executa no script defer ANTES do DOMContentLoaded, sem alterar
 // conteúdo documental, arte das cartas, Card IDs ou builds.
if(inCard&&document.body.dataset.page==='detail'&&
   typeof document.querySelector==='function'){
 const brand=document.querySelector('.topbar .brand');
 if(brand){
  const oldLogo=brand.querySelector('.brand-logo');
  if(oldLogo&&typeof oldLogo.replaceWith==='function'){
   const logo=document.createElement('img');
   logo.className='brand-logo-img';
   logo.src='../assets/craque-tatico-icon.svg';
   logo.alt='Craque Tático';
   logo.width=42;logo.height=42;
   oldLogo.replaceWith(logo);
  }
  const name=brand.querySelector('.brand-copy b');
  if(name&&/^scout pro$/i.test(String(name.textContent||'').trim()))
   name.textContent='CRAQUE TÁTICO';
  const subtitle=brand.querySelector('.brand-copy small');
  if(subtitle&&/build engine/i.test(String(subtitle.textContent||'')))
   subtitle.textContent='LABORATÓRIO DE FUTEBOL';
 }
}
// V189: mesmo design e bundle responsivo em Android, Windows e navegador.
const v189Root=inCard?'../':'';
const craqueBackupScript=document.createElement('script');
craqueBackupScript.src=v189Root+'craque-backup-v226.js';
craqueBackupScript.onload=()=>{
 const ui=document.createElement('script');ui.src=v189Root+'craque-backup-ui-v226.js';document.head.appendChild(ui);
};
document.head.appendChild(craqueBackupScript);

// V356: a home tem CSS/JS Premium declarativos no HTML (APK incluso).
// Nenhuma segunda cópia assíncrona pode competir com esse script de entrada.
const v189Css=document.querySelector('link[data-ct356-core="v189"]')||document.createElement('link');
v189Css.rel='stylesheet';v189Css.href=v189Root+'scout-ui-v189.css';
if(!v189Css.parentNode)document.head.appendChild(v189Css);
if(!document.querySelector('script[data-ct356-entry="premium-home"]')){
 const v189Js=document.createElement('script');
 v189Js.src=v189Root+'scout-ui-v189.js';v189Js.defer=true;document.head.appendChild(v189Js);
}
// V190: uma única folha de acabamento responsivo é empacotada pelos dois instaladores.
const v190Css=document.createElement('link');v190Css.rel='stylesheet';v190Css.href=v189Root+'scout-polish-v190.css';document.head.appendChild(v190Css);
// V192: acabamento aprovado sobre a base V189/V190, na mesma web/ das duas plataformas.
const v192Css=document.createElement('link');v192Css.rel='stylesheet';v192Css.href=v189Root+'scout-visual-v192.css';document.head.appendChild(v192Css);
// V197: mesma primeira tela premium em Android e Windows, preservando dados originais.
const v197Css=document.createElement('link');v197Css.rel='stylesheet';v197Css.href=v189Root+'scout-finish-v197.css';document.head.appendChild(v197Css);
const v197Js=document.createElement('script');v197Js.src=v189Root+'scout-finish-v197.js';document.head.appendChild(v197Js);
// V198: metodologias sob demanda no PC e ações completas sem dock sobreposto.
const v198Css=document.createElement('link');v198Css.rel='stylesheet';v198Css.href=v189Root+'scout-finish-v198.css';document.head.appendChild(v198Css);
const v198Js=document.createElement('script');v198Js.src=v189Root+'scout-finish-v198.js';document.head.appendChild(v198Js);
// V200: conclusão de ímpetos com transparência de investimento e incerteza.
const v200Css=document.createElement('link');v200Css.rel='stylesheet';v200Css.href=v189Root+'scout-finish-v200.css';document.head.appendChild(v200Css);
// V202: hierarquia visual da primeira tela Android e Windows, sem alterar treinos.
const v202Css=document.createElement('link');v202Css.rel='stylesheet';v202Css.href=v189Root+'scout-finish-v202.css';document.head.appendChild(v202Css);
// V203: filtros originais recolhíveis; biblioteca já na primeira tela.
if(!inCard){
 const v203Css=document.createElement('link');v203Css.rel='stylesheet';v203Css.href=v189Root+'scout-finish-v203.css';document.head.appendChild(v203Css);
 const v203Js=document.createElement('script');v203Js.src=v189Root+'scout-finish-v203.js';v203Js.defer=true;document.head.appendChild(v203Js);
}
// V204: cartões legíveis na biblioteca, apenas no catálogo e no bundle comum.
if(!inCard){
 const v204Css=document.createElement('link');v204Css.rel='stylesheet';v204Css.href=v189Root+'scout-finish-v204.css';document.head.appendChild(v204Css);
}
// V205: resultados reais da busca e botão de recuperação, apenas no catálogo.
if(!inCard){
 const v205Css=document.createElement('link');v205Css.rel='stylesheet';v205Css.href=v189Root+'scout-finish-v205.css';document.head.appendChild(v205Css);
 const v205Js=document.createElement('script');v205Js.src=v189Root+'scout-finish-v205.js';v205Js.defer=true;document.head.appendChild(v205Js);
}
// V201: pictogramas originais inspirados no visual de futebol, em ficha e laboratório.
if(inCard){
 const iconCss=document.createElement('link');iconCss.rel='stylesheet';iconCss.href=v189Root+'scout-training-icons-v201.css';document.head.appendChild(iconCss);
 const iconJs=document.createElement('script');iconJs.src=v189Root+'scout-training-icons-v201.js';iconJs.defer=true;document.head.appendChild(iconJs);
}
// V207: auditoria individual e comparador premium (somente interface de ficha).
if(inCard){
 const css=document.createElement('link');css.rel='stylesheet';css.href=v189Root+'scout-individual-v207.css';document.head.appendChild(css);
 const js=document.createElement('script');js.src=v189Root+'scout-individual-v207.js';js.defer=true;document.head.appendChild(js);
}
// V206: a mesma iconografia premium nas fichas Android e Windows.
if(inCard){
 const v206Css=document.createElement('link');v206Css.rel='stylesheet';v206Css.href=v189Root+'scout-training-icons-v206.css';document.head.appendChild(v206Css);
 const v206Js=document.createElement('script');v206Js.src=v189Root+'scout-training-icons-v206.js';v206Js.defer=true;document.head.appendChild(v206Js);
}
// V208: categoria, nível e PP segundo a referência visual aprovada.
if(inCard){
 const refCss=document.createElement('link');refCss.rel='stylesheet';refCss.href=v189Root+'scout-training-reference-v208.css';document.head.appendChild(refCss);
 const refJs=document.createElement('script');refJs.src=v189Root+'scout-training-reference-v208.js';refJs.defer=true;document.head.appendChild(refJs);
}
// V218: a referência de treino no topo deixa de ser uma tabela somente de leitura.
if(inCard){
 const css218=document.createElement('link');css218.rel='stylesheet';css218.href=v189Root+'scout-training-unified-v218.css';document.head.appendChild(css218);
 const js324=document.createElement('script');js324.src=v189Root+'craque-manager-fichas-v324.js';
 const loadEditor=()=>{
  const js218=document.createElement('script');js218.src=v189Root+'scout-training-unified-v218.js';js218.defer=true;document.head.appendChild(js218);
 };
 js324.onload=loadEditor;js324.onerror=loadEditor;
 document.head.appendChild(js324);
}
// V220: uma ficha principal, cinco estilos, com o motor antes da interface.
if(inCard){
 const css220=document.createElement('link');css220.rel='stylesheet';css220.href=v189Root+'scout-card-unified-v220.css';document.head.appendChild(css220);
 const engine220=document.createElement('script');engine220.src=v189Root+'scout-multitactic-engine-v220.js';
 engine220.onload=()=>{
  const loadCardUI=()=>{
   const startUI=()=>{
    const ui220=document.createElement('script');ui220.src=v189Root+'scout-card-unified-v220.js';
    document.head.appendChild(ui220);
   };
   // V303: antes da ficha, motor calculado para cada estilo; não usar o vetor
   // original de Posse como se fosse recomendação para CA Rápido/Normal/Por Fora.
   const prepareStylePlanner=()=>{
    const planner=document.createElement('script');
    planner.src=v189Root+'craque-style-planner-v303.js';
    planner.onload=startUI;planner.onerror=startUI;document.head.appendChild(planner);
   };
   const managerCss=document.createElement('link');managerCss.rel='stylesheet';
   managerCss.href=v189Root+'craque-managers-v302.css';document.head.appendChild(managerCss);
   const managers=document.createElement('script');
   managers.src=v189Root+'craque-managers-v302.js';
   managers.onload=prepareStylePlanner;managers.onerror=prepareStylePlanner;
   // V329: reutilizar o seletor V328 nas cartas pessoais. Mesmo com cache
   // antigo, o fallback V302 continua disponível e a ficha não é alterada.
   const selector329=document.createElement('script');
   selector329.src=v189Root+'craque-manager-selector-v328.js';
   selector329.onload=()=>document.head.appendChild(managers);
   selector329.onerror=()=>document.head.appendChild(managers);
   document.head.appendChild(selector329);
   // V251 precisa da interpretação V233 e da familiaridade EXATA V246.
   // Jamais deduzir posição treinada de Overall calculado.
   const hasCompetitiveScript=(file)=>[...document.querySelectorAll('script[src]')].some(s=>
    s.src.split('?')[0].endsWith('/'+file));
   const loadV251=()=>{
    // V359: só uma instância da engenharia individual em cada página.
    if(window.CRAQUE_FICHA_INDIVIDUAL_V251||
       hasCompetitiveScript('craque-ficha-individual-v251.js'))return;
    const v251=document.createElement('script');v251.src=v189Root+'craque-ficha-individual-v251.js';
    document.head.appendChild(v251);
   };
   // V264: primeiro carregar auditoria pura; V251 continua funcional
   // quando o browser estiver offline com cache legado e este JS faltar.
   const loadReadiness=()=>{
    const v264=document.createElement('script');
    v264.src=v189Root+'craque-competitive-readiness-v264.js';
    v264.onload=loadV251;v264.onerror=loadV251;
    document.head.appendChild(v264);
   };
   const position251=document.createElement('script');
   position251.src=v189Root+'scout-position-training-v246.js';
   position251.onload=loadReadiness;position251.onerror=loadReadiness;
   document.head.appendChild(position251);
  };
  // V233 precisa da API de PP V220; carrega ANTES da ficha, sem tocar no registro.
  const intelligent233=document.createElement('script');intelligent233.src=v189Root+'craque-role-intelligence-v233.js';
  intelligent233.onload=loadCardUI;intelligent233.onerror=loadCardUI;
  document.head.appendChild(intelligent233);
 };
 document.head.appendChild(engine220);
}
// V229: consolidar seis painéis legados em arquivo recolhido, sem mudar nenhuma carta.
if(inCard){
 const curatedCss=document.createElement('link');curatedCss.rel='stylesheet';
 curatedCss.href=v189Root+'scout-card-curation-v229.css';document.head.appendChild(curatedCss);
 const curatedJs=document.createElement('script');curatedJs.src=v189Root+'scout-card-curation-v229.js';
 document.head.appendChild(curatedJs);
}
// V221: análise de evidências por número + Card ID + PP, sem aprovar builds automaticamente.
if(inCard){
 const css221=document.createElement('link');css221.rel='stylesheet';css221.href=v189Root+'scout-evidence-review-v221.css';document.head.appendChild(css221);
 const js221=document.createElement('script');js221.src=v189Root+'scout-evidence-review-v221.js';js221.defer=true;document.head.appendChild(js221);
}
// V210/V211 — paleta da marca e revisão individual baseada em evidências.
if(inCard){
 const color=document.createElement('link');color.rel='stylesheet';color.href=v189Root+'scout-theme-v210.css';document.head.appendChild(color);
 const audit=document.createElement('script');audit.src=v189Root+'scout-build-audit-v211.js';audit.defer=true;document.head.appendChild(audit);
}
// V212: dossiês de posse individuais para cartas repetidas, somente leitura.
if(inCard){
 const css212=document.createElement('link');css212.rel='stylesheet';css212.href=v189Root+'scout-dossier-v212.css';document.head.appendChild(css212);
 const js212=document.createElement('script');js212.src=v189Root+'scout-dossier-v212.js';js212.defer=true;document.head.appendChild(js212);
}
// V215: mostrar a auditoria V213 dentro de cada ficha e alertar sugestões de skills repetidas EN/PT-BR.
if(inCard){
 const css215=document.createElement('link');css215.rel='stylesheet';css215.href=v189Root+'scout-evidence-v215.css';document.head.appendChild(css215);
 const js215=document.createElement('script');js215.src=v189Root+'scout-evidence-v215.js';js215.defer=true;document.head.appendChild(js215);
}
// V196: renderizar nomes oficiais PT-BR sem modificar dados das cartas nem o motor.
const v196Skills=document.createElement('script');v196Skills.src=v189Root+'skill-names-v196.js';document.head.appendChild(v196Skills);
if(inCard){
 const posseSheet=document.createElement('script');
 posseSheet.src='../scout-profile-v188.js';posseSheet.defer=true;document.head.appendChild(posseSheet);
 const posseStyle=document.createElement('link');
 posseStyle.rel='stylesheet';posseStyle.href='../scout-profile-v188.css';document.head.appendChild(posseStyle);
}

// V186: os templates animados estão disponíveis nas 246 cartas em Windows e Android.
// CSS/JS externos mantêm o app original e permitem respeitar acessibilidade e bateria.
const scoutMotionRoot=inCard?'../':'';
const scoutMotionCss=document.createElement('link');
scoutMotionCss.rel='stylesheet';scoutMotionCss.href=scoutMotionRoot+'card-motion-v186.css';
document.head.appendChild(scoutMotionCss);
const scoutMotionJs=document.createElement('script');
scoutMotionJs.src=scoutMotionRoot+'card-motion-v186.js';scoutMotionJs.defer=true;
document.head.appendChild(scoutMotionJs);

/* V184 — 241 prints eFHUB: somente consulta, sem sobreposição de IDs/PP/skills autenticadas. */
if(inCard){
 const showScreenshotEvidence=async()=>{
  const node=document.getElementById('scout-v68-data');
  const host=document.querySelector('.profile-content');
  if(!node||!host)return;
  let current;try{current=JSON.parse(node.textContent)}catch(e){return}
  const response=await Promise.all([
   fetch('../SCOUT_V184_EFHUB_SCREENSHOT_EVIDENCE.json'),
   fetch('../SCOUT_V184_EFHUB_241_COMPLETE.json')
  ]);
  if(!response.every(r=>r.ok))return;
  const [details,archive]=await Promise.all(response.map(r=>r.json()));
  const cap=Number(current.capture);
  const matches=(archive.image_manifest||[]).filter(m=>(m.scout_roster_matching?.candidate_caps||[]).includes(cap));
  if(!matches.length||document.getElementById('scout-v184-evidence'))return;
  const extras=new Map((details.observations||[]).map(x=>[x.file,x]));
  const secureSingle=matches.length===1&&['unambiguous_name_only_no_id','external_edition_multifactor_no_in_game_id'].includes(matches[0].scout_roster_matching?.status);
  const section=document.createElement('details');
  section.id='scout-v184-evidence';
  const summary=document.createElement('summary');summary.textContent='Consultar informações complementares dos prints eFHUB (opcional)';summary.style.cssText='cursor:pointer;color:#9fe9e4;font-weight:800;margin:0 0 8px';section.appendChild(summary);
  section.style.cssText='padding:16px;margin:14px 0;border:1px solid #527b9b;background:#0d2130;border-radius:14px;color:#f1f5fb';
  const h=document.createElement('h3');h.textContent='V184 · Evidências dos seus prints eFHUB';h.style.cssText='margin:0 0 9px;color:#9fe9e4;font-size:16px';section.appendChild(h);
  const intro=document.createElement('p');intro.style.cssText='font-size:12px;line-height:1.5;margin:0 0 12px';
  intro.textContent=matches.length+' print(s) candidato(s) deste jogador. Níveis, PP, Card ID e ímpetos equipados continuam vindo da ficha oficial; os prints não exibem ID numérico.';
  section.appendChild(intro);
  const content=document.createElement('div');section.appendChild(content);
  const render=(image)=>{
   content.replaceChildren();
   const extra=extras.get(image.filename);
   const p=document.createElement('p');p.textContent='Fonte: '+image.filename+' · '+(image.scout_roster_matching?.status==='unambiguous_name_only_no_id'?'nome único, edição ainda não homologada':'cotejo externo de edição; número não lido no jogo');p.style.fontSize='12px';content.appendChild(p);
   if(extra?.rarity_user){const label=document.createElement('p');label.textContent='Raridade informada por você: '+extra.rarity_user;label.style.fontWeight='700';content.appendChild(label)}
   const skills=image.skills_ptbr_transcribed||[];
   const title=document.createElement('p');title.textContent='Habilidades transcritas no eFHUB ('+skills.length+') — NÃO confirmadas por Card ID desta conta';title.style.fontWeight='700';content.appendChild(title);
   const ul=document.createElement('ul');ul.style.cssText='display:flex;flex-wrap:wrap;gap:7px;list-style:none;padding:0;margin:10px 0';
   for(const v of skills){const li=document.createElement('li');li.textContent=v;li.style.cssText='padding:5px 9px;background:#173b4e;border:1px solid #2a6579;border-radius:9px;font-size:12px';ul.appendChild(li)}
   content.appendChild(ul);
   if(extra?.model){const model=document.createElement('p');model.textContent='Modelo físico eFHUB — raio pernas '+extra.model.leg+' · braços '+extra.model.arm+' · salto '+extra.model.jump+' · colisão '+extra.model.collision;model.style.fontSize='12px';content.appendChild(model)}
   if(extra?.boosters_eFHUB){const boosts=document.createElement('p');boosts.textContent='Ímpetos exibidos APENAS no simulador: '+extra.boosters_eFHUB.join(' / ')+'. Não são prova de slot ou equipamento da sua conta.';boosts.style.fontSize='12px';content.appendChild(boosts)}
   if(extra?.level_in_eFHUB!==undefined){const level=document.createElement('p');level.textContent='Nível exibido no print: '+extra.level_in_eFHUB+'. Não substitui o nível nem os PP já cadastrados no Scout PRO.';level.style.fontSize='12px';content.appendChild(level)}
   if(extra?.identity_note){const note=document.createElement('p');note.textContent='ATENÇÃO: '+extra.identity_note;note.style.cssText='font-size:12px;font-weight:bold;color:#ffd391';content.appendChild(note)}
  };
  if(secureSingle)render(matches[0]);
  else {
   const caution=document.createElement('p');caution.textContent='Há versões não distinguidas pelo Card ID. Escolha um print apenas para comparar; a escolha NÃO registra esta edição como sua carta.';caution.style.cssText='color:#ffd391;font-size:12px';section.insertBefore(caution,content);
   const select=document.createElement('select');select.setAttribute('aria-label','Escolher print eFHUB para comparação');
   select.style.cssText='background:#153345;color:#fff;max-width:100%;min-height:40px;padding:8px;border:1px solid #4e7b9c;border-radius:9px;margin:8px 0 12px';
   const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Selecione uma versão para consultar';select.appendChild(placeholder);
   matches.forEach((m,i)=>{const op=document.createElement('option');op.value=String(i);op.textContent=m.filename;select.appendChild(op)});
   select.addEventListener('change',()=>{if(select.value!=='')render(matches[Number(select.value)])});
   section.insertBefore(select,content);
  }
  const here=host.querySelector('.detail-header');if(here)here.insertAdjacentElement('afterend',section);else host.prepend(section);
 };
 showScreenshotEvidence().catch(()=>{});
}

if(inCard){
 // V162: carregar o catálogo de ímpetos antes das recomendações dentro de cada ficha.
 const showSkillsUnavailable=()=>{
  if(document.getElementById('scout-v162')||document.getElementById('scout-v178-load-warning'))return;
  const target=document.querySelector('.profile-content');if(!target)return;
  const note=document.createElement('aside');note.id='scout-v178-load-warning';note.setAttribute('role','alert');
  note.style.cssText='padding:14px;margin:12px 0;border:1px solid #cf9d55;border-radius:12px;background:#39271b;color:#ffebca';
  note.textContent='As recomendações de habilidades/ímpetos não carregaram nesta instalação. Confira a atualização do aplicativo; seus dados das cartas permanecem intactos.';
  target.prepend(note);
 };
 // V179: completar a ficha visual pelo Card ID exato antes de iniciar o motor V162.
 const loadNativeEvidence=async()=>{
  const element=document.getElementById('scout-v68-data');if(!element)return;
  let current;try{current=JSON.parse(element.textContent)}catch(e){return}
  if(current.has_native_skills&&current.native_skills)return;
  try{
   const response=await fetch('../SCOUT_V179_NATIVE_SKILLS_RESEARCH.json');
   if(!response.ok)return;
   const data=await response.json();
   const cap=Number(current.capture);
   const item=Array.isArray(data.records)?data.records.find(c=>c.cap===cap):null;
   if(!item||item.status!=='card_id_nome_edicao'||String(item.card_id)!==String(current.id)||!Array.isArray(item.skills)||!item.skills.length)return;
   current.has_native_skills=true;current.native_skills=item.skills.join('; ');
   current.native_skills_source={status:'external_card_id_matched',url:item.source_url,in_game_verified:false};
   current.verify=(current.verify||[]).map(v=>v==='Lista de habilidades nativas e 5 adicionais equipadas'?'Cinco habilidades adicionais equipadas na conta (a confirmar)':v);
   element.textContent=JSON.stringify(current);
   const label=[...document.querySelectorAll('.fieldlabel')].find(n=>n.textContent.trim()==='Habilidades nativas');
   const cloud=label?.nextElementSibling;
   if(cloud?.classList.contains('skill-cloud')){
    cloud.replaceChildren();
    for(const skill of item.skills){const span=document.createElement('span');span.className='skill';span.textContent=skill;cloud.appendChild(span)}
    label.textContent='Habilidades nativas · pesquisadas por Card ID';
    const source=document.createElement('a');
    source.href=item.source_url;source.target='_blank';source.rel='noopener noreferrer';
    source.textContent='Ver fonte externa da edição ↗';
    source.style.cssText='display:block;color:#8dd8f7;font-size:12px;margin-top:8px';
    cloud.insertAdjacentElement('afterend',source);
   }
   for(const li of document.querySelectorAll('details li')){
    if(li.textContent.trim()==='Lista de habilidades nativas e 5 adicionais equipadas')li.textContent='Cinco habilidades adicionais efetivamente equipadas na conta (a confirmar)';
   }
  }catch(e){console.warn('Scout V179: acervo de habilidades indisponível, sem alteração dos dados originais')}
 };
 // V180: duas cartas do pacote R. Rodríguez identificadas por correspondência de
 // arte original, jogador, posição, OVR-base, PP, equipe e edição.
 const loadV180Evidence=async()=>{
  const node=document.getElementById('scout-v68-data');if(!node)return;
  let card;try{card=JSON.parse(node.textContent)}catch(e){return}
  if(card.has_native_skills&&card.native_skills)return;
  try{
   const response=await fetch('../SCOUT_V180_NATIVE_SKILLS_EVIDENCE.json');
   if(!response.ok)return;
   const evidence=await response.json();
   const item=Array.isArray(evidence.matched_entries)?evidence.matched_entries.find(x=>x.cap===Number(card.capture)):null;
   if(!item||item.status!=='coincidencia_externa_multifatorial'||item.card_id_confirmado_na_conta!==false)return;
   if(String(card.name)!==String(item.name)||String(card.shown_position)!==String(item.pos)||Number(card.pp)!==Number(item.pp))return;
   if(!String(card.id||'').startsWith('PENDENTE')||!Array.isArray(item.skills)||item.skills.length<1||item.skills.length>10)return;
   card.has_native_skills=true;card.native_skills=item.skills.join('; ');
   card.native_skills_source={status:'coincidencia_externa_sem_id_na_conta',url:item.source_url,in_game_verified:false,external_card_id:item.source_id};
   node.textContent=JSON.stringify(card);
   const label=[...document.querySelectorAll('.fieldlabel')].find(n=>n.textContent.trim()==='Habilidades nativas');
   const cloud=label?.nextElementSibling;
   if(cloud?.classList.contains('skill-cloud')){
    cloud.replaceChildren();
    for(const skill of item.skills){const span=document.createElement('span');span.className='skill';span.textContent=skill;cloud.appendChild(span)}
    label.textContent='Habilidades nativas · edição identificada externamente';
    const a=document.createElement('a');a.href=item.source_url;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent='Fonte externa · confirmar Card ID no jogo ↗';a.style.cssText='display:block;color:#8dd8f7;font-size:12px;margin-top:8px';
    cloud.insertAdjacentElement('afterend',a);
   }
   for(const li of document.querySelectorAll('details li'))if(li.textContent.trim()==='Lista de habilidades nativas e 5 adicionais equipadas')li.textContent='Confirmar Card ID da conta e habilidades adicionais equipadas';
  }catch(e){console.warn('Scout V180: evidências não carregaram, ficha original preservada')}
 };
 const startRecommendations=()=>{
 const v162Boost=document.createElement('script');
 v162Boost.src='../booster-engine-v103.js';
 v162Boost.onload=()=>{
  const v162=document.createElement('script');v162.src='../skills-booster-v162.js';
  v162.onload=()=>{
   // V311: mesma família de motores do acervo externo nas 246 fichas originais.
   const load=(name,next)=>{
    const js=document.createElement('script');js.src='../'+name;
    js.onload=()=>next?.();js.onerror=()=>console.warn('V311: falha ao carregar '+name);
    document.body.appendChild(js);
   };
   // V359: antes de criar qualquer cenário das 246 cartas, garantir a
   // mesma interpretação e o mesmo distribuidor de PP dos Outros Elencos.
   // Se faltar algum arquivo offline, a ficha informa PENDENTE em vez de
   // usar outro motor silenciosamente.
   const ensure=(file,globalName,next)=>{
    if(window[globalName])return next();
    // Cadeia V251 antiga pode estar carregando: aguardar sem duplicar scripts.
    const pending=[...document.querySelectorAll('script[src]')].find(s=>
     s.src.split('?')[0].endsWith('/'+file));
    if(pending){
     pending.addEventListener('load',()=>{if(window[globalName])next();},{once:true});
     return;
    }
    load(file,next);
   };
   ensure('scout-multitactic-engine-v220.js','SCOUT_TACTICS_V220',()=>
    ensure('craque-role-intelligence-v233.js','CRAQUE_INTERPRETATION_V233',()=>
     ensure('craque-ficha-individual-v251.js','CRAQUE_FICHA_INDIVIDUAL_V251',()=>
      load('craque-pp-universal-v309.js',()=>
       load('craque-friends-training-v228.js',()=>
        load('craque-positional-v311.js',()=>load('craque-formation-context-v314.js',()=>
         load('craque-ficha-decision-v327.js',()=>load('craque-frontier-context-v339.js',()=>
          load('craque-positional-ui-v311.js'))))))))));
   const css=document.createElement('link');css.rel='stylesheet';css.href='../craque-positional-v311.css';document.head.appendChild(css);
   const formationCss=document.createElement('link');formationCss.rel='stylesheet';
   formationCss.href='../craque-formation-context-v314.css';document.head.appendChild(formationCss);
   document.dispatchEvent(new CustomEvent('scoutpro:recommendations-ready'));
   setTimeout(()=>{if(!document.getElementById('scout-v162'))showSkillsUnavailable()},0)
  };
  v162.onerror=showSkillsUnavailable;
  document.body.appendChild(v162);
 };
 v162Boost.onerror=showSkillsUnavailable;
 document.body.appendChild(v162Boost);
 };
 loadNativeEvidence().finally(()=>loadV180Evidence().finally(startRecommendations));
 const navScript=document.createElement('script');navScript.defer=true;navScript.src='../card-navigator-v161.js';document.body.appendChild(navScript);
 const match=location.pathname.match(/\/fichas\/(\d{3})_/);
 const cardView=document.querySelector('.profile-content');
 if(match&&cardView&&!document.getElementById('scout-card-booster-shortcut')){
  const shortcut=document.createElement('a');
  shortcut.id='scout-card-booster-shortcut';
  shortcut.href='../revisao-impetos-v103.html?c='+Number(match[1]);
  shortcut.textContent='Consultar ímpeto selecionável desta carta ↗';
  shortcut.style.cssText='display:inline-flex;align-items:center;min-height:40px;margin:0 0 12px;padding:9px 12px;border:1px solid #3d837a;border-radius:10px;background:#123846;color:#a4f4d3;font-weight:650;text-decoration:none;font-size:13px';
  cardView.insertBefore(shortcut,cardView.firstChild);
 }
}
if(!document.querySelector('link[href$="scout-premium-v73.css"]')){
 const premiumLink=document.createElement('link');premiumLink.rel='stylesheet';premiumLink.href=(inCard?'../':'')+'scout-premium-v73.css';document.head.appendChild(premiumLink);
}
const originalBrand=document.querySelector('.brand .brand-logo');
if(originalBrand){const logo=document.createElement('img');logo.className='brand-logo-img';logo.alt='Logotipo Scout PRO';logo.src=(inCard?'../':'')+'assets/scout-pro-icon-premium-original.png';originalBrand.replaceWith(logo)}
const home=(inCard?'../index.html':'index.html');
const homeBtn=bar.querySelector('#scout-home'),backBtn=bar.querySelector('#scout-back');
homeBtn.href=home+'#catalogo';
const oldOrigin=()=>{try{return new URL(document.referrer).origin===location.origin}catch{return false}};
backBtn.hidden=!inCard&&!oldOrigin();
backBtn.onclick=()=>{if(history.length>1&&oldOrigin())history.back();else location.href=home+'#catalogo'};
bar.querySelector('#scout-top').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
if(!inCard&&document.body.dataset.page==='catalog')homeBtn.href='#catalogo';

const label=document.getElementById('scout-update-label'),btn=document.getElementById('scout-update');
let scoutToastTimer;
const scoutToast=scoutNativeAndroid?document.createElement('output'):null;
if(scoutToast){
 scoutToast.id='scout-android-toast';
 scoutToast.setAttribute('role','status');
 scoutToast.setAttribute('aria-live','polite');
 scoutToast.hidden=true;
 document.body.appendChild(scoutToast);
 scoutToast.addEventListener('click',()=>{
  clearTimeout(scoutToastTimer);
  scoutToast.hidden=true;
 });
}
const notify=s=>{
 label.textContent=s;label.title=s;
 if(!scoutToast)return;
 scoutToast.textContent=s;
 scoutToast.hidden=false;
 clearTimeout(scoutToastTimer);
 scoutToastTimer=setTimeout(()=>{scoutToast.hidden=true},5200);
};
const getKeys=()=>Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:'));
const dl=(data,name)=>scoutSaveJson(data,name);
const modal=document.createElement('dialog');modal.id='scout-backup-modal';modal.innerHTML='<h3>Backup das suas builds</h3><p>Exporta somente treinos personalizados e registros salvos neste dispositivo. Antes de trocar de celular, reinstalar ou limpar dados, faça backup.</p><button id="scout-export">Exportar meus dados</button><button id="scout-import">Importar backup</button><button id="scout-close">Fechar</button><input id="scout-pick" type="file" accept=".json,application/json" hidden><p id="scout-backup-status" role="status"></p>';document.body.appendChild(modal);
const feedback=modal.querySelector('#scout-backup-status');
bar.querySelector('#scout-backup').onclick=()=>modal.showModal();modal.querySelector('#scout-close').onclick=()=>modal.close();
modal.querySelector('#scout-export').onclick=async()=>{
 const button=modal.querySelector('#scout-export');button.disabled=true;
 try{
  const out={format:'scoutpro-userdata-v1',exported_at:new Date().toISOString(),items:Object.fromEntries(getKeys().map(k=>[k,localStorage.getItem(k)]))};
  const result=await dl(out,'scout-pro-meus-dados.json');
  feedback.textContent=result.status==='saved'
   ?'Backup salvo com sucesso ('+Object.keys(out.items).length+' registros).'
   :result.status==='cancelled'?'Salvamento cancelado; dados preservados.'
   :'Download solicitado; confira a pasta Downloads do navegador.';
 }catch(e){feedback.textContent='Falha no backup: '+(e.message||e)}
 finally{button.disabled=false}
};
const pick=modal.querySelector('#scout-pick');modal.querySelector('#scout-import').onclick=()=>pick.click();
pick.onchange=async()=>{try{if(!pick.files?.[0])return;if(pick.files[0].size>4e6)throw Error('Arquivo grande demais.');const val=JSON.parse(await pick.files[0].text());if(val.format!=='scoutpro-userdata-v1'||!val.items||typeof val.items!=='object'||Array.isArray(val.items))throw Error('Formato não reconhecido.');const entries=Object.entries(val.items);if(entries.length>4000||entries.some(([k,v])=>!k.startsWith('scoutpro:')||typeof v!=='string'))throw Error('Backup inválido.');if(!confirm('Importar '+entries.length+' registros? Dados existentes das mesmas cartas serão substituídos.'))return;entries.forEach(([k,v])=>localStorage.setItem(k,v));feedback.textContent='Importação concluída. Reabra a ficha para ver seus treinos.';}catch(e){feedback.textContent=e.message}finally{pick.value=''}};
async function openReleaseLink(raw){
 const url=new URL(raw);
 if(url.protocol!=='https:'||url.hostname!=='github.com')throw Error('Link de atualização não autorizado');
 const native=window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform();
 const browser=window.Capacitor?.Plugins?.Browser;
 if(native && browser && typeof browser.open==='function'){
   await browser.open({url:url.href}); // navegador de sistema; instalação autorizada pelo usuário
 } else window.open(url.href,'_blank','noopener,noreferrer');
}
const cmpVersion=(a,b)=>{
 const A=String(a||'0.0.0').split('.').map(Number),B=String(b||'0.0.0').split('.').map(Number);
 for(let i=0;i<3;i++){const x=Number.isFinite(A[i])?A[i]:0,y=Number.isFinite(B[i])?B[i]:0;if(x!==y)return x>y?1:-1;}
 return 0;
};
const chooseAndroidRelease=(releases)=>{
 if(!Array.isArray(releases))return null;
 return releases.filter(r=>r&&!r.draft&&!r.prerelease)
 .map(r=>({release:r,asset:(r.assets||[]).find(a=>a?.name==='ScoutPRO-Android.apk'&&/^https:\/\/github\.com\//.test(a.browser_download_url||''))}))
 .filter(x=>x.asset&&/^v?\d+\.\d+\.\d+$/.test(x.release.tag_name||''))
 .sort((a,b)=>cmpVersion(b.release.tag_name.replace(/^v/,''),a.release.tag_name.replace(/^v/,'')))[0]||null;
};
const nativeAndroid=()=>Boolean(window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.getPlatform?.()==='android');
let scoutNativeUpdaterBridge=null;
const nativeUpdater=()=>{
 if(!nativeAndroid())return null;
 if(scoutNativeUpdaterBridge)return scoutNativeUpdaterBridge;
 const capacitor=window.Capacitor;
 scoutNativeUpdaterBridge=typeof capacitor?.registerPlugin==='function'
   ?capacitor.registerPlugin('ScoutUpdater')
   :capacitor?.Plugins?.ScoutUpdater;
 return scoutNativeUpdaterBridge;
};
let lastAutomaticCheck=0;
async function onlineUpdate(auto=false){
 if(!repo||!/^[-\w.]+\/[-\w.]+$/.test(repo)){notify('Configure SCOUT_GITHUB_REPO no projeto.');if(nativeAndroid())showAndroidStatus('Repositório de atualizações não configurado.');return;}
 if(!navigator.onLine){notify('Sem internet: o Scout PRO continua funcionando offline.');if(nativeAndroid())showAndroidStatus('Sem internet. Conecte-se e toque em Verificar novamente.');return;}
 notify('Verificando versão do Scout PRO para este dispositivo…');
 let installed=String(window.SCOUT_VERSION||'1.0.0');
 // Plugin failures must not prevent the user from checking GitHub releases.
 if(nativeAndroid()){
  try{
   const plugin=nativeUpdater();
   if(plugin && typeof plugin.getInstalledInfo==='function'){
    const current=await plugin.getInstalledInfo();
    installed=String(current.versionName||installed);
    const display=document.getElementById('scout-android-installed');
    if(display)display.textContent=installed;
   }
  }catch(e){
   showAndroidStatus('Versão nativa indisponível; consultando o GitHub mesmo assim.');
  }
 }
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  if(nativeAndroid()){
   const resp=await fetch('https://api.github.com/repos/'+repo+'/releases?per_page=100',{
    signal:controller.signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
   if(!resp.ok)throw Error('GitHub HTTP '+resp.status);
   const releases=await resp.json();
   const selected=chooseAndroidRelease(releases);
   if(!selected){
    const msg='Ainda não há APK oficial Android publicado. Ative o segredo ANDROID_RELEASE_SECRET no GitHub e execute a CI para disponibilizar a primeira versão assinada. Faça backup antes da migração do APK de teste.';
    notify(msg);showAndroidStatus(msg);setAndroidDownload(null);
    return;
   }
   const newest=String(selected.release.tag_name).replace(/^v/,'');
   setAndroidLatest(newest);
   if(cmpVersion(newest,installed)<=0){
    const msg='Android oficial: versão '+installed+' atualizada. Os dados continuam disponíveis offline.';
    notify(msg);showAndroidStatus(msg);setAndroidDownload(null);
    return;
   }
   const url=selected.asset.browser_download_url;
   notify('APK Android oficial '+newest+' disponível. Faça backup em Meus dados antes de instalar.');
   showAndroidStatus('Nova versão '+newest+' disponível. Salve um backup em Meus dados antes de baixar. A instalação requer assinatura compatível e sua confirmação.');
   setAndroidDownload(url);
   return;
  }
  const resp=await fetch('https://api.github.com/repos/'+repo+'/releases/latest',{
   signal:controller.signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
  if(!resp.ok)throw Error('GitHub HTTP '+resp.status);
  const data=await resp.json();
  const newest=String(data.tag_name||'').replace(/^v/,'');
  if(cmpVersion(newest,installed)<=0){notify('Versão '+installed+' atualizada.');return;}
  const url=data.html_url;
  notify('Versão '+newest+' disponível no GitHub.');
  if(url){
   btn.textContent='Baixar versão';
   btn.onclick=()=>openReleaseLink(url).catch(e=>notify(e.message));
   if(!auto&&confirm('Scout PRO '+newest+' disponível. Abrir a página de atualização?'))
    openReleaseLink(url).catch(e=>notify(e.message));
  }
 }catch(e){
  notify('Não foi possível consultar atualizações. O conteúdo offline permanece disponível.');
  if(nativeAndroid()){showAndroidStatus('Não foi possível consultar o GitHub agora. Tente novamente com internet.');setAndroidDownload(null);}
 }finally{clearTimeout(timer);}
}
const androidPanel=nativeAndroid()?document.createElement('dialog'):null;
let androidDownload=null,androidVerified=false,androidProgressListener=null;
const showAndroidStatus=message=>{
 if(!androidPanel)return;
 const node=androidPanel.querySelector('#scout-android-status');
 if(node)node.textContent=message;
};
const setAndroidLatest=version=>{
 if(androidPanel)androidPanel.querySelector('#scout-android-newest').textContent=version;
};
const setAndroidDownload=url=>{
 androidDownload=url||null;
 androidVerified=false;
 if(!androidPanel)return;
 const link=androidPanel.querySelector('#scout-android-download');
 const install=androidPanel.querySelector('#scout-android-install');
 const external=androidPanel.querySelector('#scout-android-external');
 link.hidden=!androidDownload;link.disabled=!androidDownload;
 external.hidden=!androidDownload;external.disabled=!androidDownload;
 install.hidden=true;install.disabled=true;
 const progress=androidPanel.querySelector('#scout-android-progress');
 if(progress){progress.hidden=true;progress.value=0}
 const percentage=androidPanel.querySelector('#scout-android-percent');
 if(percentage)percentage.textContent='';

};
if(androidPanel){
 androidPanel.id='scout-android-update-modal';
 androidPanel.setAttribute('aria-label','Atualizar APK Android do Scout PRO');
 androidPanel.innerHTML='<h3>Atualizar Scout PRO Android</h3>'
  +'<p>Versão instalada: <strong id="scout-android-installed"></strong></p>'
  +'<p>Última versão oficial assinada: <strong id="scout-android-newest">Não disponível</strong></p>'
  +'<p id="scout-android-status" role="status">Toque em Verificar atualização para consultar o GitHub.</p>'
  +'<p class="scout-update-help">O arquivo oficial é baixado e conferido dentro do app (SHA256), sem Chrome. O Android solicitará confirmação da instalação. Se o APK anterior tiver assinatura diferente, não será possível instalar por cima: salve um backup antes de qualquer migração. Se aparecer “Problema ao analisar o pacote”, use a alternativa de baixar a mesma versão pelo navegador — nunca desinstale sem backup.</p>'
  +'<progress id="scout-android-progress" max="100" value="0" hidden aria-label="Progresso do download do APK"></progress>'
  +'<p id="scout-android-percent" aria-live="polite"></p>'
  +'<div class="scout-update-actions"><button id="scout-android-check" type="button">Verificar atualização</button>'
  +'<button id="scout-android-download" type="button" hidden disabled>Baixar APK oficial no app</button>'
  +'<button id="scout-android-install" type="button" hidden disabled>Instalar APK baixado</button>'
  +'<button id="scout-android-external" type="button" hidden disabled>Alternativa: baixar no navegador</button>'
  +'<button id="scout-android-backup" type="button">Fazer backup</button>'
  +'<button id="scout-android-close" type="button">Fechar</button></div>';
 document.body.appendChild(androidPanel);
 // Register this handler before touching the native bridge.
 btn.textContent='Atualizar APK';
 btn.setAttribute('aria-label','Verificar e baixar atualização APK Android');
 btn.onclick=()=>{try{openAndroidUpdater()}catch(e){notify('Não foi possível abrir o atualizador. Use Meus dados para backup e consulte a Release oficial no GitHub.')}};
 androidPanel.querySelector('#scout-android-installed').textContent=String(window.SCOUT_VERSION||'1.0.0');
 androidPanel.querySelector('#scout-android-close').onclick=()=>{
  try{androidPanel.close()}catch(e){}
  androidPanel.removeAttribute('open');
  androidPanel.classList.remove('scout-dialog-fallback');
 };
 androidPanel.querySelector('#scout-android-backup').onclick=()=>{androidPanel.close();modal.showModal()};
 androidPanel.querySelector('#scout-android-check').onclick=()=>onlineUpdate(false);
 const installBtn=androidPanel.querySelector('#scout-android-install');
 const downloadBtn=androidPanel.querySelector('#scout-android-download');
 const externalBtn=androidPanel.querySelector('#scout-android-external');
 externalBtn.onclick=()=>{
  if(!androidDownload)return;
  showAndroidStatus('Abrindo o APK oficial no navegador para instalação manual. Não desinstale o Scout PRO; faça backup antes de qualquer migração.');
  openReleaseLink(androidDownload).catch(e=>showAndroidStatus('Não foi possível abrir o APK oficial: '+(e.message||String(e))));
 };
 const progress=androidPanel.querySelector('#scout-android-progress');
 const percentage=androidPanel.querySelector('#scout-android-percent');
 try{
  const updater=nativeUpdater();
  if(updater && typeof updater.addListener==='function'){
   const result=updater.addListener('downloadProgress',p=>{
    if(!p)return;
    progress.hidden=false;
    if(Number.isFinite(p.percent)&&p.percent>=0){progress.value=p.percent;percentage.textContent='Download no app: '+p.percent+'%'}
    else{progress.removeAttribute('value');percentage.textContent='Baixando dentro do app…'}
   });
   if(result && typeof result.then==='function')result.then(h=>{androidProgressListener=h}).catch(()=>{});
  }
 }catch(e){
  androidPanel.dataset.nativeBridgeError='true';
 }
 async function installReadyAPK(){
  if(!androidVerified)return;
  let native=null;
  try{native=nativeUpdater()}catch(e){}
  if(!native || typeof native.installDownloaded!=='function'){showAndroidStatus('Instalador interno indisponível. Faça backup e instale a versão oficial diretamente do GitHub.');return;}
  try{
   const result=await native.installDownloaded();
   if(result.status==='signature_mismatch'){
    showAndroidStatus('IMPOSSÍVEL ATUALIZAR POR CIMA: a assinatura do APK instalado é diferente da assinatura oficial. Não desinstale antes de exportar e conferir o backup em Meus dados. Este problema não pode ser corrigido baixando o APK em outro lugar.');
    percentage.textContent='Certificado instalado: '+result.installedFingerprint+' · certificado do APK: '+result.newFingerprint;
    installBtn.disabled=true;return;
   }
   if(result.status==='version_not_newer'){showAndroidStatus('O APK baixado não é superior à versão já instalada. Nenhuma alteração foi feita.');return;}
   if(result.status==='permission_required'){showAndroidStatus('O Android abriu a permissão “Instalar apps desconhecidos”. Autorize apenas o Scout PRO, volte ao app e toque Instalar APK baixado.');return;}
   if(result.status==='installer_opened'){showAndroidStatus('Instalador do Android aberto com o APK verificado. Se aparecer erro de análise do pacote, volte e use “Alternativa: baixar no navegador”. Nenhuma instalação foi confirmada pelo aplicativo.');return;}
   showAndroidStatus('Estado de instalação: '+String(result.status||'indisponível'));
  }catch(e){showAndroidStatus('Instalação não iniciada: '+(e.message||String(e)));}
 }
 installBtn.onclick=installReadyAPK;
 downloadBtn.onclick=async()=>{
  if(!androidDownload)return;
  if(!confirm('Antes de instalar, faça backup em Meus dados. O download será feito dentro do Scout PRO; o Android confirmará a instalação. Continuar?'))return;
  let native=null;
  try{native=nativeUpdater()}catch(e){}
  if(!native || typeof native.download!=='function'){showAndroidStatus('Atualizador interno indisponível nesta instalação. Faça backup; tente instalar o APK oficial diretamente do GitHub, sem desinstalar.');return;}
  downloadBtn.disabled=true;progress.hidden=false;progress.value=0;percentage.textContent='Preparando download seguro…';
  try{
   const downloaded=await native.download({url:androidDownload});
   if(downloaded.status!=='verified')throw Error('APK não verificado');
   androidVerified=true;percentage.textContent='APK conferido por SHA256. Pronto para instalar.';
   installBtn.hidden=false;installBtn.disabled=false;
   showAndroidStatus('Arquivo baixado dentro do Scout PRO e checksum conferido. Abrindo instalador oficial do Android…');
   await installReadyAPK();
  }catch(e){androidVerified=false;showAndroidStatus('Não foi possível baixar dentro do app: '+(e.message||String(e)));percentage.textContent='';progress.hidden=true}
  finally{downloadBtn.disabled=false;}
 };
}
function openAndroidUpdater(){
 if(!androidPanel){notify('Atualização Android não disponível nesta instalação.');return;}
 if(!androidPanel.open){
  try{androidPanel.showModal()}
  catch(e){androidPanel.setAttribute('open','');androidPanel.classList.add('scout-dialog-fallback')}
 }
 setAndroidDownload(null);
 showAndroidStatus('Verificando atualizações oficiais para Android…');
 Promise.resolve().then(()=>onlineUpdate(false)).catch(()=>{
  showAndroidStatus('Falha ao consultar versões. Confira sua conexão ou baixe o APK oficial no GitHub.');
 });
}
if(window.scoutDesktop){
 let windowsUpdateReady=false,windowsActionPending=false;
 const windowsButtonReady=ready=>{
  windowsUpdateReady=ready;
  btn.textContent=ready?'Instalar atualização':'Atualizar Windows';
  btn.setAttribute('aria-label',ready?'Instalar atualização Windows já baixada':'Verificar atualização Windows');
 };
 windowsButtonReady(false);
 // Restaurar estado ao navegar/recarregar a tela sem iniciar outro download.
 Promise.resolve().then(()=>window.scoutDesktop.updateStatus()).then(status=>{
  if(status?.ready){windowsButtonReady(true);notify(status.message);}
 }).catch(()=>{/* Uma falha de consulta não bloqueia a atualização manual. */});
 window.scoutDesktop.onUpdate(e=>{
  notify(e.message);
  if(e.type==='ready'||e.type==='deferred')windowsButtonReady(true);
  if(e.type==='available')windowsButtonReady(false);
 });
 btn.onclick=async()=>{
  if(windowsActionPending)return;
  windowsActionPending=true;btn.disabled=true;
  try{
   if(windowsUpdateReady){
    const result=await window.scoutDesktop.installDownloadedUpdate();
    if(!result?.ok)notify(result?.message||'Instalação adiada.');
   }else{
    notify('Buscando atualizações…');
    const result=await window.scoutDesktop.checkUpdates();
    if(result?.ready){windowsButtonReady(true);notify(result.message);}
    else if(!result?.ok)notify(result?.message||'Verificação indisponível.');
   }
  }catch(e){notify('Atualização Windows indisponível: '+(e.message||String(e)));}
  finally{windowsActionPending=false;btn.disabled=false;}
 };
}else if(nativeAndroid()){
 btn.textContent='Atualizar APK';
 btn.setAttribute('aria-label','Verificar e baixar atualização APK Android');
 // Primary Android click handler is attached before native bridge setup.
 const checkWhenForeground=()=>{
  if(!navigator.onLine||document.hidden)return;
  const now=Date.now();if(now-lastAutomaticCheck<4*60*60*1000)return;
  lastAutomaticCheck=now;onlineUpdate(true);
 };
 setTimeout(()=>{if(navigator.onLine){lastAutomaticCheck=Date.now();onlineUpdate(true)}},16000);
 document.addEventListener('visibilitychange',checkWhenForeground);
 window.addEventListener('online',checkWhenForeground);
}else{
 btn.onclick=()=>onlineUpdate(false);
}
const ppCss=document.createElement('link');ppCss.rel='stylesheet';ppCss.href=(inCard?'../':'')+'progress-v81.css';document.head.appendChild(ppCss);
const ppCore=document.createElement('script');ppCore.src=(inCard?'../':'')+'craque-pp-universal-v309.js';
const ppScript=document.createElement('script');ppScript.src=(inCard?'../':'')+'progress-v81.js';
ppCore.onload=()=>document.body.appendChild(ppScript);
ppCore.onerror=()=>document.body.appendChild(ppScript); // V81 continua funcional no modo legado.
document.body.appendChild(ppCore);
if(document.body?.dataset.page==='detail'){
 const css=document.createElement('link');css.rel='stylesheet';css.href='../scout-engine-v74.css';document.head.appendChild(css);
 const script=document.createElement('script');script.src='../scout-engine-v74.js';document.body.appendChild(script);
 const css160=document.createElement('link');css160.rel='stylesheet';css160.href='../training-review-v160.css';document.head.appendChild(css160);
 const tac160=document.createElement('script');tac160.src='../tactical-engine-v98.js';
 tac160.onload=()=>{const review160=document.createElement('script');review160.src='../training-review-v160.js';document.body.appendChild(review160)};
 tac160.onerror=()=>console.warn('Scout V160: motor tático não carregado');
 document.body.appendChild(tac160);
 // V80: auditoria por carta + experimento offline; não substitui as builds existentes.
 const reviewCss=document.createElement('link');reviewCss.rel='stylesheet';reviewCss.href='../performance-review-v80.css';document.head.appendChild(reviewCss);
 const core=document.createElement('script');core.src='../performance-core-v80.js';
 core.onload=()=>{const review=document.createElement('script');review.src='../performance-review-v80.js';document.body.appendChild(review)};
 core.onerror=()=>console.warn('Scout V80: motor de avaliação não carregado');
 document.body.appendChild(core);
}
(()=>{
if(!document.querySelector('link[data-scout-favicon]')){
 const link=document.createElement('link');link.setAttribute('data-scout-favicon','true');link.rel='icon';link.type='image/png';
 link.href=(location.pathname.includes('/fichas/')?'../':'')+'assets/icon-192.png';document.head.appendChild(link);
}
})();

const craqueTheme=document.createElement('link');
craqueTheme.rel='stylesheet';craqueTheme.href=v189Root+'craque-theme-v226.css';document.head.appendChild(craqueTheme);

// V230: CSS único ouro + azul do escudo; pictogramas e idiomas, somente UI.
const design230=document.querySelector('link[data-ct356-core="v230"]')||document.createElement('link');
design230.rel='stylesheet';design230.href=v189Root+'craque-design-v230.css';
if(!design230.parentNode)document.head.appendChild(design230);
if(inCard){
 const train230=document.createElement('script');train230.src=v189Root+'craque-training-icons-v230.js';
 train230.defer=true;document.head.appendChild(train230);
}
const labels230=document.createElement('script');labels230.src=v189Root+'craque-impetos-ptbr-v230.js';
labels230.defer=true;document.head.appendChild(labels230);

// V232: experiência mobile: navegação rápida, tipografia e barra inferior contida.
// Um único bundle web atende APK Android, Electron/Windows e PWA; sem alterar dados.
const experience232Css=document.querySelector('link[data-ct356-core="v232"]')||document.createElement('link');
experience232Css.rel='stylesheet';
experience232Css.href=v189Root+'craque-experience-v232.css';
if(!experience232Css.parentNode)document.head.appendChild(experience232Css);
const experience232Js=document.createElement('script');
experience232Js.src=v189Root+'craque-experience-v232.js';
document.head.appendChild(experience232Js);

// V233: análise funcional específica por posição/estilo/carta, consultiva.
// Mantém intactos os níveis, habilidades, ímpetos, Card IDs e backups existentes.
if(inCard){
 const role233Css=document.createElement('link');role233Css.rel='stylesheet';
 role233Css.href=v189Root+'craque-role-panel-v233.css';document.head.appendChild(role233Css);
 const role233Ui=document.createElement('script');role233Ui.src=v189Root+'craque-role-panel-v233.js';
 document.head.appendChild(role233Ui);
}

// V234: revisão global de cores + acabamentos por raridade, sem substituição
// das 246 artes. CSS FINAL após V226/V230/V232/V233 para eliminar heranças verdes.
// Ambos instaladores (Capacitor/Electron) e PWA recebem o mesmo conjunto offline.
const ct234Theme=document.querySelector('link[data-ct356-core="v234"]')||document.createElement('link');
ct234Theme.rel='stylesheet';
ct234Theme.href=v189Root+'craque-visual-system-v234.css';
// A mesma folha declarativa vai ao fim depois do legado; sem segundo download.
document.head.appendChild(ct234Theme);
 // V352: tema já disponível no HTML sem piscada na tela interna.
 // Reposicionar a MESMA folha depois da V234 garante que os estilos
 // internos prevaleçam sem duplicar downloads nem ocultar ferramentas.
 const ct352Final=document.querySelector('link[data-ct352-final="true"]');
 if(ct352Final&&['friends','team'].includes(document.body.dataset.page))
  document.head.appendChild(ct352Final);
 // V353: os laboratórios recebem a folha Premium desde o HTML.
 // Mantê-la por último após os temas dinâmicos impede o legado de
 // reassumir a cascata quando a página termina de carregar.
 const ct353Final=document.querySelector('link[data-ct353-final="true"]');
 if(ct353Final)document.head.appendChild(ct353Final);
const ct234MotionCss=document.createElement('link');ct234MotionCss.rel='stylesheet';
ct234MotionCss.href=v189Root+'craque-card-effects-v234.css';
document.head.appendChild(ct234MotionCss);
const ct234MotionJs=document.createElement('script');
ct234MotionJs.src=v189Root+'craque-card-effects-v234.js';
ct234MotionJs.defer=true;
document.head.appendChild(ct234MotionJs);

// V251: proposta documental ao lado da ficha ÚNICA, com tema do projeto.
if(inCard){
 const v251Styles=document.createElement('link');v251Styles.rel='stylesheet';
 v251Styles.href=v189Root+'craque-ficha-individual-v251.css';
 document.head.appendChild(v251Styles);
}

// V249: conferir níveis e PP por edição em TODAS as fichas e no catálogo.
// Não altera Card IDs, builds ou valores originais; também estiliza a opção
// de desfazer do painel V248. O bundle é o mesmo no Android e Windows.
const ct249Css=document.createElement('link');ct249Css.rel='stylesheet';
ct249Css.href=v189Root+'craque-progress-consistency-v249.css';
document.head.appendChild(ct249Css);
if(document.body.dataset.page==='catalog'||document.body.dataset.page==='detail'){
 const ct249Script=document.createElement('script');
 ct249Script.src=v189Root+'craque-progress-consistency-v249.js';
 ct249Script.defer=true;document.head.appendChild(ct249Script);
}

// V360: folha final única para evitar a cascata antiga sobre a interface.
const ct360Final=document.querySelector('link[data-ct360-final="true"]')||document.createElement('link');
ct360Final.rel='stylesheet';ct360Final.href=v189Root+'craque-ux-lite-v360.css';
document.head.appendChild(ct360Final);
// V360: navegação compacta de ficha; não modifica os motores documentais.
if(inCard){const focus360=document.createElement('script');
 focus360.src=v189Root+'craque-detail-focus-v360.js';focus360.defer=true;
 document.head.appendChild(focus360);}
window.addEventListener('craque:backup-error',event=>{
 const e=document.getElementById('craque-backup-last');
 if(e)e.textContent='Cópia automática indisponível: '+event.detail.message;
});
const brand=document.querySelector('.brand-copy b');if(brand)brand.textContent='CRAQUE TÁTICO';
document.title=document.title.replace(/SCOUT PRO|Scout PRO/g,'Craque Tático');
document.querySelectorAll('.scout-rotation-footer,.footer').forEach(node=>{
 for(const child of node.childNodes){
  if(child.nodeType===3)child.textContent=child.textContent.replace(/SCOUT PRO|Scout PRO/g,'CRAQUE TÁTICO');
 }
});

document.querySelectorAll('.brand-logo-img').forEach(img=>{img.src=v189Root+'assets/craque-tatico-icon.svg';img.alt='Craque Tático';});
})();