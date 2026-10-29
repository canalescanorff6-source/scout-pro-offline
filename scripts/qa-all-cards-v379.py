"""Abre as 261 fichas em perfis descartáveis e verifica contrato visual comum."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.getenv('SCOUT_VISUAL_BASE','http://127.0.0.1:8765')
OUT=Path('artifacts/visual-qa/v379');OUT.mkdir(parents=True,exist_ok=True)
async def main():
 original=json.loads(Path('web/SCOUT_V69_AUDITORIA.json').read_text(encoding='utf-8'))['cards']
 owned=json.loads(Path('web/ct364-owned-cards.json').read_text(encoding='utf-8'))['cards']
 tasks=[{'key':'cap:'+str(c['numero']),'name':c['name'],'url':c['arquivo']} for c in original]+[{'key':c['key'],'name':c['name'],'url':'index.html?owned='+c['key']} for c in owned]
 queue=asyncio.Queue()
 for task in tasks:await queue.put(task)
 rows=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
  async def worker():
   ctx=await browser.new_context(viewport={'width':1366,'height':900});page=await ctx.new_page()
   while not queue.empty():
    task=await queue.get()
    try:
     await page.goto(BASE+'/'+task['url'],wait_until='domcontentloaded')
     selector='#ct364-panel .ct378-main-sheet' if task['key'].startswith('ct364') else '.ct311-main-slot .ct378-main-sheet'
     sheet=page.locator(selector);await sheet.wait_for(timeout=25000)
     assert await sheet.count()==1
     skills=await sheet.locator('.ct374-skill-reasons > li > strong').all_text_contents()
     assert len(skills)<=5 and len(set(skills))==len(skills)
     assert await sheet.locator('.ct375-booster').count()<=1
     text=await sheet.inner_text();assert text.strip()
     rows.append({**task,'status':'pass','skills':skills,'sheetText':text})
    except Exception as e:rows.append({**task,'status':'fail','error':str(e)})
    queue.task_done()
   await ctx.close()
  await asyncio.gather(*[worker() for _ in range(3)])
  await browser.close()
 failures=[r for r in rows if r['status']!='pass']
 (OUT/'auditoria-261.json').write_text(json.dumps({'opened':len(rows),'failures':len(failures),'cards':rows},ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'opened':len(rows),'failed':len(failures),'failures':failures},ensure_ascii=False))
 assert len(rows)==261 and not failures
asyncio.run(main())
