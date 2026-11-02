(function(w,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;if(w)w.CT_GUIDE_MODEL=a;})(typeof window!=='undefined'?window:null,function(){'use strict';
const KEY='ct2027:manual:v1',schema='CT_GUIDE_LOCAL_V1',clone=x=>JSON.parse(JSON.stringify(x));
const empty=()=>({schema,read:[],favorites:[],days:[],last:null,entries:[]});
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function validate(x,D){if(!obj(x)||x.schema!==schema)throw Error('Formato de dados incompatível com este manual.');
 const out=empty(),ids=D.chapters.map(c=>c.id);
 for(const key of ['read','favorites','days']){const allowed=key==='days'?D.days.map(d=>d.id):ids,arr=x[key];if(!Array.isArray(arr)||arr.length>allowed.length||new Set(arr).size!==arr.length||arr.some(v=>!allowed.includes(v)))throw Error('Lista de progresso inválida.');out[key]=arr.slice();}
 if(x.last!==null&&!ids.includes(x.last))throw Error('Capítulo anterior inválido.');out.last=x.last;
 if(!Array.isArray(x.entries)||x.entries.length>60)throw Error('Diário inválido; limite de 60 registros.');
 out.entries=x.entries.map(e=>{if(!obj(e)||typeof e.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(e.id)||typeof e.date!=='string'||!Number.isFinite(Date.parse(e.date))||!['online','friends','ai'].includes(e.mode)||
 ['losses','breaches','chances'].some(k=>!Number.isInteger(e[k])||e[k]<0||e[k]>200)||typeof e.note!=='string'||e.note.length>1000)throw Error('Registro de treino inválido.');return Object.fromEntries(['id','date','mode','losses','breaches','chances','note'].map(k=>[k,e[k]]));});
 if(new Set(out.entries.map(e=>e.id)).size!==out.entries.length)throw Error('Registro de treino repetido.');return out;
}
function restore(raw,D){if(typeof raw!=='string'||raw.length>200000)throw Error('Arquivo muito grande; limite de 200 KB de texto.');return validate(JSON.parse(raw),D);}
function read(store,D){try{const raw=store.getItem(KEY);return {state:raw?restore(raw,D):empty(),available:true};}catch(e){return {state:empty(),available:false,message:'Não foi possível ler o progresso salvo. O conteúdo anterior foi preservado. Use a exportação para guardar esta sessão.'};}}
function write(store,state,D){try{const out=validate(state,D);store.setItem(KEY,JSON.stringify(out));return {ok:true};}catch(e){return {ok:false,message:'O navegador não salvou esta sessão. Você pode continuar lendo e exportar seus dados.'};}}
function toggle(state,key,id,D){if(!['read','favorites','days'].includes(key))throw Error('Lista inválida.');const out=clone(state);out[key]=out[key].includes(id)?out[key].filter(x=>x!==id):out[key].concat(id);return validate(out,D);}
function addEntry(state,input,D){if(state.entries.length>=60)throw Error('Seu diário chegou a 60 registros. Exporte antes de iniciar outro histórico.');const out=clone(state);
 out.entries.push({...input,id:'entry-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),date:new Date().toISOString()});return validate(out,D);}
function exportData(state){return JSON.stringify(state,null,2);}
function search(D,query){const q=norm(query).trim();return D.chapters.filter(c=>!q||norm(JSON.stringify(c)).includes(q));}
return Object.freeze({KEY,empty,validate,restore,read,write,toggle,addEntry,exportData,search});
});
