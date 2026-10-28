'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('scoutDesktop',Object.freeze({
  version:()=>ipcRenderer.invoke('scout:version'),
  checkUpdates:()=>ipcRenderer.invoke('scout:check-updates'),
  updateStatus:()=>ipcRenderer.invoke('scout:update-status'),
  installDownloadedUpdate:()=>ipcRenderer.invoke('scout:install-downloaded'),
  saveJson:(fileName,content)=>ipcRenderer.invoke('scout:save-json',{fileName,content}),
  openJson:()=>ipcRenderer.invoke('craque:open-json'),
  storeBackup:(content,reason)=>ipcRenderer.invoke('craque:store-backup',{content,reason}),
  backupInfo:()=>ipcRenderer.invoke('craque:backup-info'),
  onUpdate:(callback)=>{const fn=(_e,data)=>callback({type:data.type,message:data.message});ipcRenderer.on('scout:update',fn);return ()=>ipcRenderer.removeListener('scout:update',fn)}
}));
