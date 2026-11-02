'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } = require('electron');
const path = require('path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const {pathToFileURL} = require('url');
const { autoUpdater } = require('electron-updater');
// Preserve Windows localStorage when the displayed product name changes.
const appDataBase=app.getPath('appData');
const previousDataPaths=['Scout PRO','scout-pro-elite-offline'];
const foundPrevious=previousDataPaths.map(name=>path.join(appDataBase,name)).find(p=>fsSync.existsSync(p));
if(foundPrevious)app.setPath('userData',foundPrevious);
protocol.registerSchemesAsPrivileged([{scheme:'scout',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let win;
const allowedSite = path.resolve(__dirname, '../web');
const isInSite = (p) => p === allowedSite || p.startsWith(allowedSite + path.sep);
function send(type, message) { if (win && !win.isDestroyed()) win.webContents.send('scout:update', {type, message}); }
function openTrustedExternal(raw) {
  try {
    const u = new URL(raw);
    if(u.protocol!=='https:'||u.username||u.password||u.port)return Promise.resolve();
    const formacoes = u.origin === 'https://craque-tatico-formacoes-premium.vocalclock33.chatgpt.site' &&
      u.pathname === '/' && !u.search && !u.username && !u.password;
    // Exact hosts already used by the catalogue's documentary references.
    const sources=['github.com','api.github.com','pesdb.net','www.pesdb.net','efhub.com','www.efootball.com',
      'www.konami.com','www.pesmaster.com','efootbase.com','ef-labo.com','efootball-world.com','efootballmeta.com'];
    const guideSources=new Set([
      'https://game8.jp/efootball/576587',
      'https://pbs.twimg.com/media/HFcHqM7WEAA6fXz.jpg',
      'https://boooost.jp/wp-content/uploads/2026/07/efootball-control-trap-2.jpg',
      'https://www.reddit.com/r/pesmobile/comments/1vampqm/new_tap_trick_skill/'
    ]);
    if (formacoes || guideSources.has(u.href) || sources.includes(u.hostname)) return shell.openExternal(raw);
  }
  catch (_e) {} return Promise.resolve();
}
function makeWindow(){
  win = new BrowserWindow({width:1300,height:850,minWidth:370,minHeight:620,backgroundColor:'#071d24',
    autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  win.webContents.setWindowOpenHandler(({url}) => {openTrustedExternal(url);return {action:'deny'};});
  win.webContents.on('will-navigate',(event,url) => {
    try { const u=new URL(url); if(u.protocol==='scout:' && u.hostname==='app') return; }catch(_e){}
    event.preventDefault(); openTrustedExternal(url);
  });
  win.loadURL('scout://app/index.html');
}
let updaterConfigured=false;
// V333: atualização baixada só é instalada após consentimento explícito.
let downloadedUpdateVersion=null;
// Uma única verificação por vez evita buscas concorrentes no electron-updater.
let updateCheckInFlight=null;
function updateStatus(){
  return downloadedUpdateVersion
    ? {ok:true,ready:true,version:downloadedUpdateVersion,message:'Versão '+downloadedUpdateVersion+' baixada e pronta para instalar.'}
    : {ok:true,ready:false,version:null};
}
function checkUpdatesSafely({periodic=false}={}){
  if(downloadedUpdateVersion && !periodic)return Promise.resolve(updateStatus());
  if(updateCheckInFlight)return updateCheckInFlight;
  const pending=Promise.resolve().then(()=>autoUpdater.checkForUpdates())
    .then(()=>({ok:true})).catch(e=>({ok:false,message:e?.message||'Falha ao consultar atualizações.'}));
  updateCheckInFlight=pending;
  pending.finally(()=>{if(updateCheckInFlight===pending)updateCheckInFlight=null;});
  return pending;
}
function configureUpdater(){
  if(updaterConfigured || !app.isPackaged || process.platform!=='win32')return;
  updaterConfigured=true;autoUpdater.autoDownload=true;autoUpdater.autoInstallOnAppQuit=false;
  autoUpdater.on('checking-for-update',()=>send('checking','Buscando atualização no GitHub…'));
  autoUpdater.on('update-not-available',()=>send(downloadedUpdateVersion?'ready':'current',
    downloadedUpdateVersion?'Versão '+downloadedUpdateVersion+' baixada. Você pode instalar quando desejar.':'Você já tem a versão mais recente.'));
  autoUpdater.on('update-available',info=>{
    if(downloadedUpdateVersion===info.version){
      send('ready','Versão '+info.version+' já baixada. Você pode instalar quando desejar.');
      return;
    }
    downloadedUpdateVersion=null;
    send('available','Baixando versão '+info.version+'…');
  });
  autoUpdater.on('download-progress',p=>send('progress','Download '+Math.round(p.percent)+'%'));
  autoUpdater.on('error',err=>send('error','Atualização indisponível: '+err.message));
  autoUpdater.on('update-downloaded',async info=>{
    const repeated=downloadedUpdateVersion===info.version;
    downloadedUpdateVersion=info.version;
    send('ready','Versão '+info.version+' pronta para instalar.');
    // Um download reutilizado pelo verificador periódico não abre um segundo diálogo.
    if(repeated)return;
    try{
      if(!win || win.isDestroyed())return;
      const res=await dialog.showMessageBox(win,{type:'question',buttons:['Instalar agora','Depois'],defaultId:0,cancelId:1,title:'Nova versão do Craque Tático',message:'A versão '+info.version+' foi baixada.',detail:'Instalar agora reinicia o programa. Escolher Depois NÃO instalará automaticamente ao sair.'});
      if(res.response===0)autoUpdater.quitAndInstall(false,true);
      else send('deferred','Versão '+info.version+' aguardando: use Instalar atualização quando desejar.');
    }catch(e){send('error','Não foi possível abrir a confirmação: '+e.message);}
  });
  const periodicCheck=async()=>{const result=await checkUpdatesSafely({periodic:true});if(!result.ok)send('error',result.message);};
  setTimeout(periodicCheck,5000);
  setInterval(periodicCheck,4*60*60*1000);
}
app.whenReady().then(()=>{
  protocol.handle('scout',(request)=>{
    try {
      const u=new URL(request.url);
      if(u.hostname!=='app')return new Response('Domínio inválido',{status:403});
      const wanted=decodeURIComponent(u.pathname).replace(/^\/+/, '')||'index.html';
      const file=path.resolve(allowedSite,wanted);
      if(!isInSite(file))return new Response('Caminho bloqueado',{status:403});
      return net.fetch(pathToFileURL(file).toString());
    }catch(_e){return new Response('Arquivo inválido',{status:400})}
  });
  makeWindow();configureUpdater();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)makeWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('scout:version',()=>app.getVersion());
ipcMain.handle('scout:update-status',event=>{
  if(!win || win.isDestroyed() || event.sender!==win.webContents)throw Error('Origem de consulta não autorizada');
  if(!app.isPackaged || process.platform!=='win32')return {ok:false,ready:false};
  return updateStatus();
});
ipcMain.handle('scout:check-updates',async()=>{
  if(!app.isPackaged)return {ok:false,message:'No modo de desenvolvimento, o atualizador só funciona no instalador publicado.'};
  if(process.platform!=='win32')return {ok:false,message:'Atualização pelo GitHub disponível no instalador Windows.'};
  return checkUpdatesSafely();
});
ipcMain.handle('scout:install-downloaded',async event=>{
  if(!win || win.isDestroyed() || event.sender!==win.webContents)throw Error('Origem de atualização não autorizada');
  if(!app.isPackaged || process.platform!=='win32')return {ok:false,message:'Instalação disponível apenas no Windows publicado.'};
  if(!downloadedUpdateVersion)return {ok:false,message:'Nenhuma atualização concluída para instalar. Use Atualizar Windows.'};
  const res=await dialog.showMessageBox(win,{type:'question',buttons:['Instalar e reiniciar','Cancelar'],defaultId:0,cancelId:1,title:'Instalar atualização',message:'Instalar a versão '+downloadedUpdateVersion+' agora?',detail:'Salve suas alterações e faça backup em Meus Dados antes de reiniciar.'});
  if(res.response!==0)return {ok:false,message:'Instalação adiada. O aplicativo não será atualizado automaticamente ao sair.'};
  autoUpdater.quitAndInstall(false,true);
  return {ok:true};
});

// V225: exportação pelo diálogo nativo; apenas usuário escolhe o destino.
ipcMain.handle('scout:save-json',async (event,payload)=>{
  if(!event.sender || event.sender!==win?.webContents)throw Error('Origem de exportação não permitida');
  const content=payload?.content,name=payload?.fileName;
  if(typeof content!=='string'||typeof name!=='string'||Buffer.byteLength(content,'utf8')>8*1024*1024)
    throw Error('Arquivo de exportação inválido ou acima de 8 MB');
  try{JSON.parse(content);}catch(_e){throw Error('Dados JSON inválidos');}
  const fileName=name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,110);
  if(!fileName.endsWith('.json')||fileName==='.json')throw Error('Nome de arquivo inválido');
  const selection=await dialog.showSaveDialog(win,{
    title:'Salvar arquivo do Craque Tático',defaultPath:fileName,
    buttonLabel:'Salvar JSON',filters:[{name:'Arquivo JSON',extensions:['json']}]
  });
  if(selection.canceled||!selection.filePath)return {status:'cancelled'};
  await fs.writeFile(selection.filePath,content,{encoding:'utf8'});
  return {status:'saved',bytes:Buffer.byteLength(content,'utf8')};
});

// V384: exporta apenas o PDF embarcado; nenhum caminho é fornecido pelo renderer.
ipcMain.handle('scout:save-guide-pdf',async event=>{
  if(!event.sender||event.sender!==win?.webContents)throw Error('Origem de exportação não permitida');
  const source=path.join(allowedSite,'manual-2027','manual-2027.pdf');
  const info=await fs.stat(source);
  if(!info.isFile()||info.size<=0||info.size>8*1024*1024)throw Error('E-book indisponível ou acima de 8 MB');
  const selection=await dialog.showSaveDialog(win,{title:'Salvar e-book do Craque Tático',defaultPath:'Craque-Tatico-Manual-2027.pdf',buttonLabel:'Salvar PDF',filters:[{name:'E-book PDF',extensions:['pdf']}]});
  if(selection.canceled||!selection.filePath)return {status:'cancelled'};
  await fs.copyFile(source,selection.filePath);
  return {status:'saved',bytes:info.size};
});

// V226: backups automáticos privados e importação com diálogo nativo.
const CRAQUE_MAX_BYTES=8*1024*1024;
const CRAQUE_BACKUP_NAME='craque-tatico-backup-';
const craqueBackupPath=n=>path.join(app.getPath('userData'),CRAQUE_BACKUP_NAME+n+'.json');
const craqueIsSource=e=>Boolean(win&&!win.isDestroyed()&&e.sender===win.webContents);
ipcMain.handle('craque:store-backup',async(e,payload)=>{
 if(!craqueIsSource(e))throw Error('Origem não autorizada');
 const content=payload?.content;
 if(typeof content!=='string'||Buffer.byteLength(content,'utf8')>CRAQUE_MAX_BYTES)throw Error('Backup fora do limite de 8 MB');
 const doc=JSON.parse(content);
 if(!doc||!doc.items||!doc.format)throw Error('Backup inválido');
 const dir=app.getPath('userData'),staged=path.join(dir,'craque-backup-pendente.tmp');
 await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(staged,content,'utf8');
 // Reter até 3 versões; somente girar depois de gravar a cópia temporária.
 for(let n=2;n>0;n--){
  try{await fs.rename(craqueBackupPath(n-1),craqueBackupPath(n));}
  catch(err){if(err.code!=='ENOENT')throw err;}
 }
 await fs.rename(staged,craqueBackupPath(0));
 return {status:'saved',bytes:Buffer.byteLength(content,'utf8')};
});
ipcMain.handle('craque:backup-info',async e=>{
 if(!craqueIsSource(e))throw Error('Origem não autorizada');
 try{const info=await fs.stat(craqueBackupPath(0));return {status:'available',lastModified:info.mtimeMs,bytes:info.size};}
 catch(err){if(err.code==='ENOENT')return {status:'empty',bytes:0};throw err;}
});
ipcMain.handle('craque:open-json',async e=>{
 if(!craqueIsSource(e))throw Error('Origem não autorizada');
 const choice=await dialog.showOpenDialog(win,{
  title:'Escolher backup do Craque Tático',properties:['openFile'],
  filters:[{name:'Backup JSON',extensions:['json']}]
 });
 if(choice.canceled||!choice.filePaths?.length)return {status:'cancelled'};
 const file=choice.filePaths[0],info=await fs.stat(file);
 if(info.size>CRAQUE_MAX_BYTES)throw Error('Arquivo de backup maior que 8 MB');
 const content=await fs.readFile(file,'utf8');JSON.parse(content);
 return {status:'loaded',content};
});
