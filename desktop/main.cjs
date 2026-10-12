'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } = require('electron');
const path = require('path');
const {pathToFileURL} = require('url');
const { autoUpdater } = require('electron-updater');
protocol.registerSchemesAsPrivileged([{scheme:'scout',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let win;
const allowedSite = path.resolve(__dirname, '../web');
const isInSite = (p) => p === allowedSite || p.startsWith(allowedSite + path.sep);
function send(type, message) { if (win && !win.isDestroyed()) win.webContents.send('scout:update', {type, message}); }
function openTrustedExternal(raw) {
  try { const u = new URL(raw); if (u.protocol === 'https:' && ['github.com','api.github.com','pesdb.net','efhub.com','www.efootball.com'].includes(u.hostname)) return shell.openExternal(raw); }
  catch (_e) {} return Promise.resolve();
}
function makeWindow(){
  win = new BrowserWindow({width:1300,height:850,minWidth:370,minHeight:620,backgroundColor:'#07101d',
    autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  win.webContents.setWindowOpenHandler(({url}) => {openTrustedExternal(url);return {action:'deny'};});
  win.webContents.on('will-navigate',(event,url) => {
    try { const u=new URL(url); if(u.protocol==='scout:' && u.hostname==='app') return; }catch(_e){}
    event.preventDefault(); openTrustedExternal(url);
  });
  win.loadURL('scout://app/index.html');
}
let updaterConfigured=false;
function configureUpdater(){
  if(updaterConfigured || !app.isPackaged || process.platform!=='win32')return;
  updaterConfigured=true;autoUpdater.autoDownload=true;autoUpdater.autoInstallOnAppQuit=true;
  autoUpdater.on('checking-for-update',()=>send('checking','Buscando atualização no GitHub…'));
  autoUpdater.on('update-not-available',()=>send('current','Você já tem a versão mais recente.'));
  autoUpdater.on('update-available',info=>send('available','Baixando versão '+info.version+'…'));
  autoUpdater.on('download-progress',p=>send('progress','Download '+Math.round(p.percent)+'%'));
  autoUpdater.on('error',err=>send('error','Atualização indisponível: '+err.message));
  autoUpdater.on('update-downloaded',async info=>{
    send('ready','Versão '+info.version+' pronta para instalar.');
    const res=await dialog.showMessageBox(win,{type:'question',buttons:['Instalar agora','Depois'],defaultId:0,cancelId:1,title:'Nova versão do Scout PRO',message:'A versão '+info.version+' foi baixada.',detail:'O aplicativo será reiniciado para concluir a atualização.'});
    if(res.response===0)autoUpdater.quitAndInstall(false,true);
  });
  setTimeout(()=>autoUpdater.checkForUpdates().catch(e=>send('error',e.message)),5000);
  setInterval(()=>autoUpdater.checkForUpdates().catch(e=>send('error',e.message)),4*60*60*1000);
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
ipcMain.handle('scout:check-updates',async()=>{
  if(!app.isPackaged)return {ok:false,message:'No modo de desenvolvimento, o atualizador só funciona no instalador publicado.'};
  if(process.platform!=='win32')return {ok:false,message:'Atualização pelo GitHub disponível no instalador Windows.'};
  try{await autoUpdater.checkForUpdates();return {ok:true}}catch(e){return {ok:false,message:e.message}}
});
