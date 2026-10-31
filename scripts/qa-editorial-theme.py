"""Tema aprovado: paridade das rotas reais, contraste e controles preservados."""
import json, os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.getenv('SCOUT_VISUAL_BASE', 'http://127.0.0.1:8765').rstrip('/')
ART = Path(os.getenv('SCOUT_EDITORIAL_ART', 'artifacts/visual-qa/editorial'))
ART.mkdir(parents=True, exist_ok=True)
ROUTES = [
    ('catalog', 'index.html', '.hero'),
    ('detail', 'fichas/001_Daniele_Massaro.html', '.ct378-main-sheet'),
    ('detail-last', 'fichas/246_Eric_Cantona.html', '.ct378-main-sheet'),
    ('friends', 'outros-elencos-v227.html', '.friends-panel'),
    ('team', 'meu-time-duas-formacoes-v177.html', '.panel'),
    ('posse', 'meu-time-posse-4312.html', '.panel'),
    ('rotation', 'meu-time-testes-v219.html', '.scout-rotation-panel'),
    ('managers', 'tecnicos-v307.html', '.hub-card'),
    ('progress', 'conferir-progresso-v248.html', '.ct248-checker'),
    ('videos', 'pesquisa-videos-v106.html', '.card'),
    ('body', 'player-model-v101.html', '.panel'),
    ('boosters', 'revisao-impetos-v103.html', '.panel'),
    ('tactical', 'revisao-tatica-v98.html', '.panel'),
    ('batch8', 'lote-8-conferencia.html', '.card'),
    ('batch9', 'lote-9-cadastro.html', 'main'),
    ('rarity', 'raridade-cadastro-v91.html', '.block'),
    ('review', 'conferir-cartas.html', 'main'),
]

def luminance(rgb):
    values = [int(x)/255 for x in rgb.removeprefix('rgb(').removesuffix(')').split(',')]
    return sum(w*(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4) for w,v in zip([.2126,.7152,.0722],values))

def contrast(a,b):
    low,high=sorted([luminance(a),luminance(b)])
    return (high+.05)/(low+.05)

with sync_playwright() as pw:
    exe = shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('google-chrome-stable')
    browser = pw.chromium.launch(headless=True, executable_path=exe)
    results=[]
    try:
        for width,height,mobile in [(320,740,True),(390,844,True),(1366,900,False)]:
            ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
            page=ctx.new_page()
            for name,route,surface in ROUTES:
                errors=[]
                handler=lambda e:errors.append(str(e))
                page.on('pageerror',handler)
                page.goto(BASE+'/'+route,wait_until='networkidle',timeout=45000)
                page.locator('body.ct362-design').wait_for(state='attached')
                assert page.locator(surface).count()>0,(name,route,'seletor de superfície ausente',surface)
                data=page.evaluate('''selector => {
                    const panel=document.querySelector(selector),style=getComputedStyle(panel),body=getComputedStyle(document.body);
                    return {bg:body.backgroundColor,bodyImage:body.backgroundImage,panel:style.backgroundColor,
                        panelImage:style.backgroundImage,ink:style.color,font:body.fontFamily,
                        overflow:document.documentElement.scrollWidth-innerWidth,
                        cards:document.querySelectorAll('#cards .player-card').length,
                        artwork:[...document.querySelectorAll('.card-art img,.ct361-glance-art img,.side-art img')].filter(i=>i.getClientRects().length&&i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0).every(i=>i.complete&&i.naturalWidth>0),
                        filtered:[...document.querySelectorAll('.card-art img,.ct361-glance-art img,.side-art img')].filter(i=>i.getClientRects().length).some(i=>/grayscale|sepia|hue-rotate/.test(getComputedStyle(i).filter))};
                }''',surface)
                assert data['bg']=='rgb(40, 40, 44)',(width,name,'grafite aprovado ausente',data)
                assert data['bodyImage']=='none',(width,name,'gradiente de fundo antigo',data)
                assert data['panel'] in ['rgb(40, 40, 44)','rgb(51, 50, 54)','rgb(34, 34, 37)'],(width,name,'superfície antiga',data)
                assert data['panelImage']=='none',(width,name,'gradiente antigo no painel',data)
                assert contrast(data['ink'],data['panel'])>=4.5,(width,name,'texto sem contraste',data)
                assert data['overflow']<=3,(width,name,'rolagem horizontal',data)
                assert data['artwork'] and not data['filtered'],(width,name,'arte alterada ou indisponível',data)
                assert not errors,(width,name,errors)
                if name=='catalog':
                    assert data['cards']==246
                    assert page.locator('.scout-v189-dock-more>summary').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(120, 57, 75)', 'A ação principal precisa se distinguir em vinho'
                    search=page.locator('#search')
                    visible_before=page.locator('#cards .player-card:visible').count()
                    search.fill('Massaro')
                    expect(page.locator('#cards .player-card:visible')).to_have_count(1)
                    search.fill('')
                    expect(page.locator('#cards .player-card:visible')).to_have_count(visible_before)
                    search.fill('Karetsas')
                    page.locator('#cards .ct364-player-card').first.click()
                    owned=page.locator('dialog.ct364-dialog')
                    expect(owned).to_be_visible()
                    expect(owned.locator('.ct364-area').first).to_be_visible()
                    assert owned.locator('.ct364-area').first.evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(51, 50, 54)', 'A ficha dinâmica precisa usar o mesmo grafite'
                    owned.locator('.ct364-close').click()
                    search.fill('')
                    expect(page.locator('#cards .player-card:visible')).to_have_count(visible_before)
                if name in ['catalog','detail','team','friends','review']:
                    page.screenshot(path=str(ART/f'{width}-{name}.png'),full_page=False)
                results.append({'width':width,'route':name,**data})
                page.remove_listener('pageerror',handler)
            ctx.close()
        (ART/'report.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
        print(f'EDITORIAL PASS: {len(results)} aberturas, paleta/contraste/overflow, artes e busca reais preservados.')
    finally:
        browser.close()
