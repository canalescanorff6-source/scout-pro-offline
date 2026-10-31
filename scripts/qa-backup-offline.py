"""Backup e cache reais, somente em contextos descartáveis do navegador."""
import json,os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765').rstrip('/')
OUT=Path(os.getenv('SCOUT_QA_OUT','artifacts/visual-qa/backup-offline'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
 try:
  ctx=browser.new_context(service_workers='block');page=ctx.new_page()
  page.goto(BASE+'/index.html',wait_until='domcontentloaded')
  page.wait_for_function('()=>window.CRAQUE_BACKUP_V226 && window.CRAQUE_CARD_REVIEW_V379')
  result=page.evaluate('''async()=>{
   const B=window.CRAQUE_BACKUP_V226,R=window.CRAQUE_CARD_REVIEW_V379;
   const raw=(await(await fetch('SCOUT_V69_AUDITORIA.json')).json()).cards[0];
   const card=R.catalog([raw],[])[0];
   R.saveInfo(localStorage,card,{maxLevel:34,pp:66,rarity:'BIG TIME',maxOverall:108},{maxLevel:32,pp:62,rarity:'ÉPICA',maxOverall:null});
   const key=R.INFO_PREFIX+card.key,before=localStorage.getItem(key),backup=await B.create();
   if(!backup.items[key])throw Error('Editor ausente no backup');
   const checked=await B.inspect(backup);
   localStorage.setItem(key,'{"broken":true}');
   await B.restore(checked);
   if(localStorage.getItem(key)!==before)throw Error('Restauração alterou os registros');
   const corrupt=structuredClone(backup);corrupt.items[key]='{}';
   let rejected=false;try{await B.inspect(corrupt)}catch(e){rejected=/SHA-256/.test(e.message)}
   if(!rejected)throw Error('Backup adulterado foi aceito');
   return {backupRecords:checked.count,editorRestored:R.infoRead(localStorage,card).pp===66,corruptRejected:rejected,version:backup.format};
  }''')
  ctx.close()
  # Exercise a real offline page reload after the service worker has cached the catalogue.
  offline=browser.new_context();page=offline.new_page()
  page.goto(BASE+'/index.html',wait_until='domcontentloaded')
  # Product PWA registers only on HTTPS; localhost is a secure test origin.
  page.evaluate('()=>navigator.serviceWorker.register("/sw.js")')
  page.wait_for_function('()=>navigator.serviceWorker.controller',timeout=30000)
  counts=page.evaluate('''async()=>({original:(await(await fetch('SCOUT_V69_AUDITORIA.json')).json()).cards.length,owned:(await(await fetch('ct364-owned-cards.json')).json()).cards.length})''')
  ready='({original,owned})=>document.querySelectorAll("#cards .player-card").length===original && document.querySelectorAll("#cards .ct364-player-card").length===owned'
  page.wait_for_function(ready,arg=counts,timeout=30000)
  offline.set_offline(True);page.reload(wait_until='domcontentloaded')
  page.wait_for_function(ready,arg=counts,timeout=30000)
  result['offlineCatalogue']=counts['original']+counts['owned']
  (OUT/'backup-offline.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
  print(json.dumps(result,ensure_ascii=True));offline.close()
 finally:browser.close()
