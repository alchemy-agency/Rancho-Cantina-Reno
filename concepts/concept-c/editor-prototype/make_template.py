# Builds index.template.html (with marker comments) and content.default.json from the built dist/index.html.
import re, json, html, sys
root = sys.argv[1]
src = open(f'{root}/index.html', encoding='utf-8').read()
def unesc(s): return html.unescape(s)

# --- hours
m = re.search(r'<dl class="hours">(.*?)</dl>', src, re.S)
hours = []
for row in re.finditer(r'<div( class="hours__extra")?><dt>(.*?)</dt><dd>(.*?)</dd></div>', m.group(1), re.S):
    hours.append({'label': unesc(row.group(2)), 'time': unesc(row.group(3)), 'extra': bool(row.group(1))})
src = src.replace(m.group(0), '<!--rc:hours--><!--/rc:hours-->')

# --- menu
m = re.search(r'<div class="menu__cols">(.*?)\n        </div>\n      </div>\n    </section>\n\n    <!-- CANTINA', src, re.S)
groups = []
for g in re.finditer(r'<section class="mgroup( mgroup--tall)?">\s*<h3><span[^>]*></span>(.*?)</h3>\s*<dl>(.*?)</dl>\s*</section>', m.group(1), re.S):
    items = [{'name': unesc(i.group(1)), 'desc': unesc(i.group(2))} for i in re.finditer(r'<div><dt>(.*?)</dt><dd>(.*?)</dd></div>', g.group(3), re.S)]
    groups.append({'name': unesc(g.group(2)), 'tall': bool(g.group(1)), 'items': items})
whole = m.group(0)
src = src.replace(whole, '<!--rc:menu--><!--/rc:menu-->\n        </div>\n      </div>\n    </section>\n\n    <!-- CANTINA')
# the region sits inside <div class="menu__cols"> ... so re-open the wrapper
src = src.replace('<!--rc:menu--><!--/rc:menu-->\n        </div>', '<div class="menu__cols">\n<!--rc:menu--><!--/rc:menu-->\n        </div>', 1)

# --- giveaway modal
m = re.search(r'  <!-- GIVEAWAY.*?(?=\n</body>)', src, re.S)
giveaway_block = m.group(0)
src = src.replace(giveaway_block, '<!--rc:giveaway-->\n' + giveaway_block + '\n<!--/rc:giveaway-->')

# --- announcement slot (inside hero, after the sub line)
src = src.replace('<div class="hero__actions">', '<!--rc:announce--><!--/rc:announce-->\n        <div class="hero__actions">', 1)

# --- a few lines of CSS for the new announcement pill
css = '<style>.hero__announce{margin:0 auto 18px;max-width:34rem;padding:.55rem 1rem;border:1px solid rgba(255,255,255,.55);color:#fff;font-size:.95rem;letter-spacing:.02em;text-align:center;background:rgba(0,0,0,.28)}</style>\n</head>'
src = src.replace('</head>', css, 1)

open(f'{root}/index.template.html', 'w', encoding='utf-8').write(src)
content = {'announcement': {'on': False, 'text': ''}, 'giveaway': True, 'hours': hours, 'menu': groups}
json.dump(content, open(f'{root}/content.default.json', 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
print(len(hours), 'hours rows;', [(g['name'], len(g['items'])) for g in groups])
