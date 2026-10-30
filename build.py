"""Build index.html (GitHub Pages) from src/page.html.
Usage: python build.py
Embeds the cube and the catalog of older cards (with Scryfall image URLs) and wraps the page in a document.
"""
import json, re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(HERE, *a)
src = open(P('src', 'page.html')).read()
hob = {c['num']: c for c in json.load(open(P('data', 'hob-set.json')))}
cube = json.load(open(P('data', 'cube-current.json')))
catalog = json.load(open(P('data', 'catalog.json')))
for c in cube + catalog:
    if not c.get('img'): c['img'] = hob[c['id'][4:]]['normal'].split('?')[0]
cube_ids = {c['id'] for c in cube}
extra = [c for c in catalog if c['id'] not in cube_ids]
t = re.sub(r'(<script id="cube" type="application/json">).*?(</script>)',
           lambda m: m.group(1) + json.dumps(cube, ensure_ascii=False).replace('</', '<\\/') + m.group(2), src, flags=re.S)
t = re.sub(r'(<script id="catalog" type="application/json">).*?(</script>)',
           lambda m: m.group(1) + json.dumps(extra, ensure_ascii=False).replace('</', '<\\/') + m.group(2), t, flags=re.S)
reset = 'html,body{margin:0}body{font-family:system-ui,sans-serif;font-size:14px}img{max-width:100%}[hidden]{display:none!important}'
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<style>' + reset + '</style>\n</head>\n<body>\n' + t + '\n</body>\n</html>\n')
open(P('index.html'), 'w').write(doc)
print('built', len(doc) // 1024, 'KB')
