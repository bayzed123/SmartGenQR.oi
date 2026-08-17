import re, glob, html, collections, json
def txt(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',s))).strip()
def strip_chrome(c):
    c=re.sub(r'<!--[\s\S]*?-->','',c)
    c=re.sub(r'<script[\s\S]*?</script>','',c,flags=re.I)
    c=re.sub(r'<style[\s\S]*?</style>','',c,flags=re.I)
    c=re.sub(r'<header[^>]*id="main-header"[\s\S]*?</header>','',c,flags=re.I)
    c=re.sub(r'<footer[\s\S]*?</footer>','',c,flags=re.I)
    c=re.sub(r'<nav[\s\S]*?</nav>','',c,flags=re.I)
    c=re.sub(r'<aside[^>]*(sidebar|toc)[\s\S]*?</aside>','',c,flags=re.I)
    return c
rows=[]
for p in sorted(glob.glob('**/*.html', recursive=True)):
    if 'node_modules' in p or '_includes/' in p: continue
    c=open(p,encoding='utf-8').read()
    if 'http-equiv="refresh"' in c[:2500]: continue
    rob=re.search(r'name="robots"[^>]*content="([^"]*)"',c)
    if rob and 'noindex' in rob.group(1): continue
    url='/'+p.replace('index.html','')
    m=re.search(r'<link[^>]*rel="canonical"[^>]*>',c)
    canon=re.search(r'href="([^"]+)"',m.group(0)).group(1).replace('https://smartgentools.com','') if m else ''
    if canon and canon.rstrip('/') not in (url.rstrip('/'), '/'+p): continue
    nav=strip_chrome(c)
    t=re.search(r'<title>(.*?)</title>',c,re.S)
    d=re.search(r'<meta\s+name="description"\s+content="([^"]*)"',c)
    h1=re.findall(r'<h1[^>]*>(.*?)</h1>',nav,re.S); h2=re.findall(r'<h2[^>]*>',nav)
    prev=0;skips=0
    for mm in re.finditer(r'<h([1-6])',nav,re.I):
        lv=int(mm.group(1))
        if prev and lv>prev+1: skips+=1
        prev=lv
    rows.append(dict(page=url,file=p,title=txt(t.group(1)) if t else '',desc=(d.group(1).strip() if d else ''),
                     h1n=len(h1),h2n=len(h2),skips=skips))
def grp(p):
    p=p.strip('/')
    if not p: return '(homepage)'
    top=p.split('/')[0]
    return top if top in ('blog','docs','html-code-library','tools','paid-tools') else '(root)'
print(f'ranking targets: {len(rows)}\n')
for label, sel in [('no h1',lambda r:r['h1n']==0),('multiple h1',lambda r:r['h1n']>1),
                   ('no h2',lambda r:r['h2n']==0),('heading skips',lambda r:r['skips']>0),
                   ('title >60',lambda r:len(r['title'])>60),('desc >160',lambda r:len(r['desc'])>160),
                   ('desc <70',lambda r:0<len(r['desc'])<70)]:
    h=[r for r in rows if sel(r)]
    c=collections.Counter(grp(r['page']) for r in h)
    print(f'  {label:<15} {len(h):>4}   ' + '  '.join(f'{k}:{v}' for k,v in c.most_common()))
json.dump({'rows':rows}, open('/tmp/audit4.json','w'))
