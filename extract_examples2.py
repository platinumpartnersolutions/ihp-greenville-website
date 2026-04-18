import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
with open('server/services-content.ts', encoding='utf-8') as f:
    src = f.read()

target_slugs = ['neuropathy', 'adrenal-fatigue', 'leaky-gut', 'fertility', 'weight-issues']
entries = src.split('slug:')

for entry in entries[1:]:
    sl = re.match(r'\s*"([^"]+)"', entry)
    if not sl:
        continue
    slug = sl.group(1)
    if slug not in target_slugs:
        continue
    res_m = re.search(r'research:\s*`(.*?)`', entry, re.DOTALL)
    comp_m = re.search(r'comparison:\s*\{[^{]*title:\s*"([^"]+)"[^{]*text:\s*`(.*?)`', entry, re.DOTALL)
    if res_m:
        print(f'=== RESEARCH: {slug} ===')
        print(res_m.group(1).strip())
        print()
    if comp_m:
        print(f'=== COMPARISON: {slug} (title: {comp_m.group(1)}) ===')
        print(comp_m.group(2).strip())
        print()
