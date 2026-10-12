'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('scoutDesktop',Object.freeze({
  version:()=>ipcRenderer.invoke('scout:version'),
  checkUpdates:()=>ipcRenderer.invoke('scout:check-updates'),
  onUpdate:(callback)=>{const fn=(_e,data)=>callback({type:data.type,message:data.message});ipcRenderer.on('scout:update',fn);return ()=>ipcRenderer.removeListener('scout:update',fn)}
}));
