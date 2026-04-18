import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('server/services-content.ts', encoding='utf-8') as f:
    src = f.read()

entries = re.split(r'\{\s*\n\s*slug:', src)
entries = entries[1:]

thin = []
for entry in entries:
    slug_m = re.match(r'\s*"([^"]+)"', entry)
    if not slug_m:
        continue
    s = slug_m.group(1)
    has_research = bool(re.search(r'\bresearch:', entry))
    has_comparison = bool(re.search(r'\bcomparison:', entry))
    has_timeline = bool(re.search(r'\btimeline:', entry))
    has_cost = bool(re.search(r'\bcostInfo:', entry))
    has_related = bool(re.search(r'\brelatedServiceSlugs:', entry))
    opening_m = re.search(r'opening:\s*`(.*?)`', entry, re.DOTALL)
    opening_len = len(opening_m.group(1).strip()) if opening_m else 0
    thin.append((s, has_research, has_comparison, has_timeline, has_cost, has_related, opening_len))

print(f'Total entries: {len(thin)}')
print(f'Has research:    {sum(1 for x in thin if x[1])}')
print(f'Has comparison:  {sum(1 for x in thin if x[2])}')
print(f'Has both:        {sum(1 for x in thin if x[1] and x[2])}')
print(f'Has timeline:    {sum(1 for x in thin if x[3])}')
print(f'Has relatedSlugs:{sum(1 for x in thin if x[5])}')
print()
print('THIN PAGES (missing both research + comparison):')
for s, r, c, t, cost, rel, olen in thin:
    if not r and not c:
        print(f'  {s}')
print()
print(f'COUNT: {sum(1 for x in thin if not x[1] and not x[2])}')
