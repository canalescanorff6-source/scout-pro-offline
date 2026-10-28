"""Percurso real de abertura das ferramentas que passaram a ser recolhidas."""
def reveal(target):
    if '/fichas/' in target.page.url:
        target.page.wait_for_function('()=>document.body.dataset.ct378Stage==="ready"',timeout=25000)
    target.wait_for(state='attached',timeout=25000)
    ancestors=target.locator('xpath=ancestor::details').element_handles()
    ordered=sorted(ancestors,key=lambda e:e.evaluate('(e)=>{let depth=0;while(e=e.parentElement)depth++;return depth}'))
    current=target.element_handle()
    for detail in ordered:
        if detail.evaluate('(e,target)=>target.tagName==="SUMMARY" && target.parentElement===e',current):
            continue
        if not detail.evaluate('(e)=>e.open'):
            detail.query_selector(':scope > summary').click()
